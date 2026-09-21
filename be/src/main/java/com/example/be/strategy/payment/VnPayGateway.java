package com.example.be.strategy.payment;


import com.example.be.entity.Order;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Component
public class VnPayGateway implements PaymentGatewayStrategy {

    private final String tmnCode;
    private final String hashSecret;
    private final String vnpUrl;
    private final String returnUrl;
    private final ObjectMapper objectMapper;

    public VnPayGateway(
            @Value("${vnpay.tmn-code}") String tmnCode,
            @Value("${vnpay.hash-secret}") String hashSecret,
            @Value("${vnpay.url}") String vnpUrl,
            @Value("${vnpay.return-url}") String returnUrl,
            ObjectMapper objectMapper) {
        this.tmnCode = tmnCode;
        this.hashSecret = hashSecret;
        this.vnpUrl = vnpUrl;
        this.returnUrl = returnUrl;
        this.objectMapper = objectMapper;
    }

    @Override
    public String createPaymentUrl(Order order) {
        try {
            // QUY TẮC VNPAY: Số tiền nhân 100
            long amount = order.getAmount().longValue() * 100;

            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", tmnCode);
            vnpParams.put("vnp_Amount", String.valueOf(amount));
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", String.valueOf(order.getOrderCode()));
            vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderCode());
            vnpParams.put("vnp_OrderType", "other");
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", returnUrl + "?orderCode=" + order.getOrderCode());
            vnpParams.put("vnp_IpAddr", "127.0.0.1");

            // Format ngày giờ: yyyyMMddHHmmss
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnpCreateDate = formatter.format(cld.getTime());
            vnpParams.put("vnp_CreateDate", vnpCreateDate);

            // Thời hạn thanh toán: 15 phút
            cld.add(Calendar.MINUTE, 15);
            String vnpExpireDate = formatter.format(cld.getTime());
            vnpParams.put("vnp_ExpireDate", vnpExpireDate);

            // 1. Sắp xếp các tham số theo bảng chữ cái A-Z
            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext(); ) {
                String fieldName = itr.next();
                String fieldValue = vnpParams.get(fieldName);
                if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                    // Build Hash Data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    // Build Query URL
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }

            // 2. Ký HMAC-SHA512
            String queryUrl = query.toString();
            String vnpSecureHash = hmacSHA512(hashSecret, hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnpSecureHash;

            return vnpUrl + "?" + queryUrl;
        } catch (Exception e) {
            log.error("VNPay createPaymentUrl error: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create VNPay payment URL: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyWebhookSignature(String rawBody, Map<String, String> headers) {
        try {
            Map<String, String> fields = parsePayloadToMap(rawBody);

            String vnpSecureHash = fields.get("vnp_SecureHash");
            fields.remove("vnp_SecureHash");
            fields.remove("vnp_SecureHashType");

            // Sắp xếp các trường nhận được theo A-Z
            List<String> fieldNames = new ArrayList<>(fields.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext(); ) {
                String fieldName = itr.next();
                String fieldValue = fields.get(fieldName);
                if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                    hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }

            String signValue = hmacSHA512(hashSecret, hashData.toString());

            // So sánh hash và kiểm tra mã phản hồi vnp_ResponseCode = "00" (thành công)
            boolean isValidSignature = MessageDigest.isEqual(
                    signValue.getBytes(StandardCharsets.UTF_8),
                    vnpSecureHash.getBytes(StandardCharsets.UTF_8)
            );

            String responseCode = fields.get("vnp_ResponseCode");
            return isValidSignature && "00".equals(responseCode);
        } catch (Exception e) {
            log.error("VNPay signature verification error: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public Long extractOrderCode(String rawBody) {
        try {
            Map<String, String> fields = parsePayloadToMap(rawBody);
            return Long.parseLong(fields.get("vnp_TxnRef"));
        } catch (Exception e) {
            throw new RuntimeException("Cannot extract orderCode from VNPay IPN: " + e.getMessage());
        }
    }

    @Override
    public String extractTransactionRef(String rawBody) {
        try {
            Map<String, String> fields = parsePayloadToMap(rawBody);
            return fields.getOrDefault("vnp_TransactionNo", "UNKNOWN");
        } catch (Exception e) {
            return "UNKNOWN";
        }
    }

    private Map<String, String> parsePayloadToMap(String rawBody) throws Exception {
        if (rawBody.trim().startsWith("{")) {
            return objectMapper.readValue(rawBody, Map.class);
        }
        // Nếu là dạng query params: vnp_Amount=...&vnp_TxnRef=...
        Map<String, String> map = new HashMap<>();
        String[] pairs = rawBody.split("&");
        for (String pair : pairs) {
            String[] keyValue = pair.split("=", 2);
            if (keyValue.length == 2) {
                map.put(keyValue[0], java.net.URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8));
            }
        }
        return map;
    }

    private String hmacSHA512(String key, String data) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmac.init(secretKey);
        byte[] hash = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
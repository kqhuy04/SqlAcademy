package com.example.be.service;

import com.example.be.dto.CustomUserDetail;
import com.example.be.entity.Order;
import com.example.be.entity.PaymentTransaction;
import com.example.be.entity.User;
import com.example.be.enums.OrderStatus;
import com.example.be.enums.PaymentGateway;
import com.example.be.enums.UserEventType;
import com.example.be.exception.BadRequestException;
import com.example.be.exception.UserNotFoundException;
import com.example.be.repository.OrderRepository;
import com.example.be.repository.PaymentTransactionRepository;
import com.example.be.repository.UserRepository;
import com.example.be.strategy.payment.PaymentGatewayStrategy;
import com.example.be.strategy.payment.PaymentStrategyFactory;
import com.example.be.util.SecurityUtil;
import com.example.be.util.TokenUtil;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class PaymentService {
    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final PaymentStrategyFactory strategyFactory;
    private final UserEventService userEventService;
    private final TokenUtil tokenUtil;
    private final RedisTemplate redisTemplate;
    public PaymentService(OrderRepository orderRepository,
                          PaymentTransactionRepository transactionRepository,
                          UserRepository userRepository,
                          PaymentStrategyFactory strategyFactory,
                          UserEventService userEventService,
                          TokenUtil tokenUtil,
                          RedisTemplate redisTemplate) {
        this.orderRepository = orderRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.strategyFactory = strategyFactory;
        this.userEventService = userEventService;
        this.tokenUtil = tokenUtil;
        this.redisTemplate = redisTemplate;
    }

    @Transactional
    public String createOrder(PaymentGateway gateway) {
        CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();
        User user = userRepository.findById(customUserDetail.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        long orderCode = System.currentTimeMillis() % 10000000000L + ThreadLocalRandom.current().nextInt(1000, 9999);
        BigDecimal amount = (gateway == PaymentGateway.VNPAY) ? new BigDecimal("99000") : new BigDecimal("4.99");
        String currency = (gateway == PaymentGateway.VNPAY) ? "VND" : "USD";
        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .amount(amount)
                .currency(currency)
                .status(OrderStatus.PENDING)
                .paymentGateway(gateway)
                .itemType("PREMIUM_LIFETIME")
                .expiredAt(LocalDateTime.now().plusMinutes(15)) // Đơn hết hạn sau 15 phút
                .build();
        orderRepository.save(order);

        PaymentGatewayStrategy strategy = strategyFactory.getStrategy(gateway);
        return strategy.createPaymentUrl(order);
    }

    @Transactional
    public void processWebhook(PaymentGateway gateway, String rawBody, Map<String, String> headers) {
        PaymentGatewayStrategy strategy = strategyFactory.getStrategy(gateway);
        if (!strategy.verifyWebhookSignature(rawBody, headers)) {
            throw new BadRequestException("Invalid webhook signature!");
        }

        Long orderCode = strategy.extractOrderCode(rawBody);
        String txRef = strategy.extractTransactionRef(rawBody);

        Order order = orderRepository.findByOrderCodeWithLock(orderCode).orElseThrow(() -> new BadRequestException("Order not found: " + orderCode));
        if (order.getStatus() == OrderStatus.PAID) {
            return;
        }

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        User user = order.getUser();
        user.setPremiumPurchasedAt(LocalDateTime.now());
        userRepository.save(user);

        PaymentTransaction tx = PaymentTransaction.builder()
                .order(order)
                .gateway(gateway.name())
                .transactionRef(txRef)
                .amount(order.getAmount())
                .status("SUCCESS")
                .rawPayload(rawBody)
                .build();

        transactionRepository.save(tx);
        redisTemplate.opsForValue().set("isPurchased:" + user.getId(), Boolean.TRUE, Duration.ofMinutes(10));
        userEventService.logEvent(user, UserEventType.SUBSCRIPTIONS, "Purchased via " + gateway);
    }

    public Map<String, Object> getOrderStatus(Long orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode).orElseThrow(() -> new BadRequestException("Order not found"));
        CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();
        if (!customUserDetail.getUserId().equals(order.getUser().getId())) {
            throw new BadRequestException("Access denied to this order");
        }

        if (order.getStatus() == OrderStatus.PAID) {
            customUserDetail.setIsPurchased(Boolean.TRUE);
            redisTemplate.opsForValue().set("isPurchased:" + customUserDetail.getUserId(), Boolean.TRUE, Duration.ofMinutes(10));
            String accessToken = tokenUtil.generateAccessToken(customUserDetail);
            return Map.of("Order code", orderCode, "Status", order.getStatus(), "Access token", accessToken);
        }
        return Map.of("Order code", orderCode, "Status", order.getStatus());
    }

    @Scheduled(fixedRate = 300000)
    @Transactional
    public void expiredOrder() {
        List<Order> expiredOrders = orderRepository.findByStatusAndExpiredAtBefore(OrderStatus.PENDING, LocalDateTime.now());
        for (Order order : expiredOrders) {
            order.setStatus(OrderStatus.EXPIRED);
        }
        orderRepository.saveAll(expiredOrders);
    }
}

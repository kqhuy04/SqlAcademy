package com.example.be.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

public final class GzipUtil {

    // Magic number nhận diện chuẩn Gzip: 0x1f8b (byte 1 = 0x1f, byte 2 = 0x8b)
    private static final byte GZIP_MAGIC_1 = (byte) 0x1f;
    private static final byte GZIP_MAGIC_2 = (byte) 0x8b;

    // Giới hạn an toàn chống Zip Bomb (Tối đa 10MB sau khi giải nén)
    private static final int MAX_UNCOMPRESSED_SIZE = 10 * 1024 * 1024; // 10 MB

    // Ngưỡng tối thiểu để nén (dưới 256 bytes thì nén không có lợi)
    private static final int MIN_COMPRESS_SIZE = 256;

    private GzipUtil() {}

    /**
     * Nén chuỗi UTF-8 sang byte[] Gzip.
     * Tự động bỏ qua nếu chuỗi quá ngắn để tránh làm phình dung lượng.
     */
    public static byte[] compress(String str) {
        if (str == null || str.isEmpty()) {
            return new byte[0];
        }

        byte[] rawBytes = str.getBytes(StandardCharsets.UTF_8);

        // Nếu chuỗi ngắn hơn ngưỡng, giữ nguyên byte thô
        if (rawBytes.length < MIN_COMPRESS_SIZE) {
            return rawBytes;
        }

        ByteArrayOutputStream obj = new ByteArrayOutputStream();
        try (GZIPOutputStream gzip = new GZIPOutputStream(obj)) {
            gzip.write(rawBytes);
        } catch (IOException e) {
            throw new RuntimeException("Gzip compression failed", e);
        }
        // Gọi toByteArray() SAU KHI gzip.close() đã đóng hoàn tất để bảo đảm có đủ CRC-32 Trailer
        return obj.toByteArray();
    }

    /**
     * Giải nén byte[] sang String.
     * Tự động nhận diện: Nếu dữ liệu là plaintext chưa nén thì trả về String luôn,
     * nếu là Gzip thì giải nén an toàn có chống Zip Bomb.
     */
    public static String decompress(byte[] data) {
        if (data == null || data.length == 0) {
            return "";
        }

        // Tự kiểm tra xem có đúng là định dạng Gzip hay không
        if (!isCompressed(data)) {
            return new String(data, StandardCharsets.UTF_8);
        }

        try (GZIPInputStream gis = new GZIPInputStream(new ByteArrayInputStream(data));
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            byte[] buffer = new byte[8192]; // Dùng buffer 8KB (thay vì 1KB) để tối ưu I/O phần cứng
            int len;
            int totalBytesRead = 0;

            while ((len = gis.read(buffer)) > 0) {
                totalBytesRead += len;
                // Chống tấn công Zip Bomb (tràn RAM)
                if (totalBytesRead > MAX_UNCOMPRESSED_SIZE) {
                    throw new SecurityException("Decompressed data exceeds security threshold (" + MAX_UNCOMPRESSED_SIZE + " bytes)!");
                }
                out.write(buffer, 0, len);
            }
            return out.toString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Gzip decompression failed", e);
        }
    }

    /**
     * Kiểm tra xem mảng byte có phải là dữ liệu Gzip hợp lệ không qua Magic Number.
     */
    public static boolean isCompressed(byte[] data) {
        return data != null && data.length >= 2
                && data[0] == GZIP_MAGIC_1
                && data[1] == GZIP_MAGIC_2;
    }
}
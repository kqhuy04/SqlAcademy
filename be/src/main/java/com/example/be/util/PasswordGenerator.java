package com.example.be.util;

import java.security.SecureRandom;

public class PasswordGenerator {
    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SPECIAL = "!@#$%^&*()_+-=[]{}";
    private static final String ALL = UPPER + LOWER + DIGITS + SPECIAL;
    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateRandomPassword(int length) {
        StringBuilder sb = new StringBuilder();
        // Đảm bảo có ít nhất 1 chữ hoa, 1 số, 1 ký tự đặc biệt, 1 chữ thường
        sb.append(UPPER.charAt(RANDOM.nextInt(UPPER.length())));
        sb.append(DIGITS.charAt(RANDOM.nextInt(DIGITS.length())));
        sb.append(SPECIAL.charAt(RANDOM.nextInt(SPECIAL.length())));
        sb.append(LOWER.charAt(RANDOM.nextInt(LOWER.length())));

        for (int i = 4; i < length; i++) {
            sb.append(ALL.charAt(RANDOM.nextInt(ALL.length())));
        }
        return sb.toString();
    }
}
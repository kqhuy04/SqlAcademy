package com.example.be.enums;

public enum OrderStatus {
    PENDING,    // Đang chờ thanh toán
    PAID,       // Đã thanh toán thành công
    CANCELLED,  // Người dùng hủy đơn
    EXPIRED     // Hết hạn thanh toán (quá 15 phút chưa trả)
}
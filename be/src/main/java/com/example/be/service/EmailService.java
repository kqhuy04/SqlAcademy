package com.example.be.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendNewPasswordEmail(String toEmail, String newPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("[SQL Detective] Your new password");
        message.setText("Hello,\n\n"
                + "You have just request for your new password.\n"
                + "Your temporary password is: " + newPassword + "\n\n"
                + "Please log in and change password to keep your account safely!");
        mailSender.send(message);
    }
}

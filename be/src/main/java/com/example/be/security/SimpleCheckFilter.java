package com.example.be.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class SimpleCheckFilter extends OncePerRequestFilter{

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("X-App-Token");
        if (header == null || !header.equals("secret123")) {
            response.setStatus(403);
            response.getWriter().write("Access Denied1111");

        } else {
            filterChain.doFilter(request, response);
        }
    }
}

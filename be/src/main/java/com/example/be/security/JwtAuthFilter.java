//package com.example.be.security;
//
//import com.example.be.jwt.JwtUtil;
//import com.example.be.service.UserService;
//import io.jsonwebtoken.Jwt;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//
//@Component
//public class JwtAuthFilter extends OncePerRequestFilter {
//
//    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);
//
//    private final UserService userService;
//    private final JwtUtil jwtUtil;
//
//    public JwtAuthFilter(UserService userService, JwtUtil jwtUtil) {
//        this.userService = userService;
//        this.jwtUtil = jwtUtil;
//    }
////    @Override
////    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
////        String header = request.getHeader("Authorization");
////        if (header != null && header.startsWith("Bearer ")) {
////            String token = header.substring(7);
////            String username = jwtUtil.extractUsername(token);
////            logger.debug("Username: {}", username);
////
////            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
////                UserDetails userDetails = userService.loadUserByUsername(username);
////                if (jwtUtil.isTokenValid(token, userDetails)) {
////                    UsernamePasswordAuthenticationToken authToken =
////                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
////                    SecurityContextHolder.getContext().setAuthentication(authToken);
////                    logger.info("Authenticated: {}", username);
////                } else {
////                    logger.warn("Invalid or expired token for user: {}", username);
////                }
////            } else if (username == null) {
////                logger.warn("Could not extract username from token");
////            }
////        }
////        filterChain.doFilter(request, response);
////    }
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//        String token = request.getHeader("Authorization");
//        if (jwtUtil.isTokenValid(token)) {
//            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken()
//        }
//    }
//}

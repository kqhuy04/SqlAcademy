package com.example.be.annotationImp;

import com.example.be.annotation.Idempotent;
import com.example.be.dto.CustomUserDetail;
import com.example.be.exception.DuplicateRequestException;
import com.example.be.service.IdempotencyService;
import com.example.be.util.SecurityUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;

@Aspect
@Component
public class IdempotentImp {

    private final IdempotencyService idempotencyService;

    IdempotentImp(IdempotencyService idempotencyService) {

        this.idempotencyService = idempotencyService;
    }


    @Around("@annotation(idempotent)")
    public Object handleIdempotent(ProceedingJoinPoint joinPoint, Idempotent idempotent) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String uri = request.getRequestURI();

        String userIdentifier;
        try {
            CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();
            userIdentifier = "User:" + customUserDetail.getUserId();
        } catch (Exception e) {
            userIdentifier = "IP:" + getClientIp(request);
        }

        String key = "Task:" + userIdentifier + ":" + uri + ":" + Arrays.deepHashCode(joinPoint.getArgs());
        boolean lockResult = idempotencyService.checkAndLock(key, idempotent.timeoutProcessing());
        if (lockResult == false) {
            throw new DuplicateRequestException("Request is being processed. Please do not click repeatedly!");

        }

        try {
            return joinPoint.proceed();
        } finally {
            idempotencyService.remove(key);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank() && !"unknown".equalsIgnoreCase(xfHeader)) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

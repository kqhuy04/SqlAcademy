package com.example.be.strategy.payment;

import com.example.be.enums.PaymentGateway;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class PaymentStrategyFactory {
    private final Map<PaymentGateway, PaymentGatewayStrategy> strategies;


    PaymentStrategyFactory(List<PaymentGatewayStrategy> strategyList) {
        this.strategies = strategyList.stream().collect(Collectors.toMap(
                this::getGatewayType, Function.identity()
        ));

    }

    public PaymentGatewayStrategy getStrategy(PaymentGateway gateway) {
        PaymentGatewayStrategy strategy = strategies.get(gateway);
        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported payment gateway: " + gateway);
        }
        return strategy;
    }

    private PaymentGateway getGatewayType(PaymentGatewayStrategy strategy) {
        if (strategy instanceof PayOsGateway) return PaymentGateway.PAYOS;
        if (strategy instanceof LemonSqueezyGateway) return PaymentGateway.LEMON_SQUEEZY;
        throw new IllegalArgumentException("Unknown strategy type: " + strategy.getClass().getName());
    }
}

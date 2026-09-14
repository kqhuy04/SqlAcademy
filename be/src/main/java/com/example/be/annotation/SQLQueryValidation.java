package com.example.be.annotation;

import com.example.be.validator.SQLQueryValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = SQLQueryValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface SQLQueryValidation {
    String message() default "Invalid SQL query";
    Class<?>[] groups() default {};
    Class<? extends Payload> [] payload() default {};

}

package com.example.be.annotation;

import com.example.be.annotationImp.SQLQueryValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = SQLQueryValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface SQLQueryValid {
    String message() default "Invalid SQL query";
    Class<?>[] groups() default {};
    Class<? extends Payload> [] payload() default {};

}

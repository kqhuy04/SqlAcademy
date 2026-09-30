package com.example.be.annotation;

import com.example.be.annotationImp.ImageValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ImageValidator.class)
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface ImageValid {
    String message() default "Invalid image";
    Class<?>[] groups() default {};
    Class<? extends Payload> [] payload() default {};
}

package com.example.be.annotationImp;

import com.example.be.annotation.ImageValid;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class ImageValidator implements ConstraintValidator<ImageValid, MultipartFile> {
    @Override
    public boolean isValid(MultipartFile file, ConstraintValidatorContext constraintValidatorContext) {
        if (file == null || file.isEmpty()) {
            return false;
        }
        if (file.getSize() > 20 * 1024 * 1024) {
            return false;
        }
        return List.of("image/jpeg", "image/png", "image/webp").contains(file.getContentType());

    }

}

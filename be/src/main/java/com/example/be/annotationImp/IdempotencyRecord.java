package com.example.be.annotationImp;

import com.example.be.enums.Status;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IdempotencyRecord

 {
    Status status;

    Object response;

    long expireAt;
}

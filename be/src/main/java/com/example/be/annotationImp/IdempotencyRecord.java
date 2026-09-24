package com.example.be.annotationImp;

import com.example.be.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

package com.example.dentist_app;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class DentistNotFoundAdvice {

    @ExceptionHandler(DentistNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    String DentistNotFoundHandler(DentistNotFoundException ex) {
        return ex.getMessage();
    }
}
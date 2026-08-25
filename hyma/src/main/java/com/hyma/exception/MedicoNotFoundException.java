package com.hyma.exception;


public class MedicoNotFoundException extends RuntimeException {
    public MedicoNotFoundException(String message) {
        super(message);
    }
}
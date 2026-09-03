package com.hyma.farmacia.service;

public class FarmaciaNotFoundException extends RuntimeException {
    public FarmaciaNotFoundException(String message) {
        super(message);
    }
}

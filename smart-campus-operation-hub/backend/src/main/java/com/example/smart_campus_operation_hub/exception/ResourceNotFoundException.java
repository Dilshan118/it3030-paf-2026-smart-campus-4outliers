package com.example.smart_campus_operation_hub.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String entity, Long id) {
        super(entity + " with ID " + id + " not found");
    }
}

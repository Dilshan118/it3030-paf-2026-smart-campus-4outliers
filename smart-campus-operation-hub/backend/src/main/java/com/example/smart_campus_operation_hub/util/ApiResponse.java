package com.example.smart_campus_operation_hub.util;

import java.time.LocalDateTime;

/**
 * Standard API response wrapper.
 * All endpoints should return responses wrapped in this format.
 *
 * Usage:
 *   return ResponseEntity.ok(ApiResponse.success(data, "Resource created"));
 *   return ResponseEntity.status(404).body(ApiResponse.error("Not found"));
 */
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String message;
    private Object error;
    private LocalDateTime timestamp;

    public ApiResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = true;
        response.data = data;
        response.message = message;
        return response;
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Operation successful");
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = false;
        response.message = message;
        return response;
    }

    public static <T> ApiResponse<T> error(String message, Object errorDetails) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = false;
        response.message = message;
        response.error = errorDetails;
        return response;
    }

    // --- Getters ---
    public boolean isSuccess() { return success; }
    public T getData() { return data; }
    public String getMessage() { return message; }
    public Object getError() { return error; }
    public LocalDateTime getTimestamp() { return timestamp; }
}

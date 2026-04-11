package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

/**
 * MEMBER 3: File Storage Service
 * Handles disk operations for attachment uploads (Images only).
 */
@Service
public class FileStorageService {

    @Value("${app.upload.dir:${user.dir}/uploads}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_TYPES = Arrays.asList("image/jpeg", "image/png");

    /**
     * Validate the uploaded file size and extension type.
     */
    public void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 5MB limit");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only JPEG and PNG images are allowed");
        }
    }

    // TODO: storeFile
    // TODO: deleteFile
}

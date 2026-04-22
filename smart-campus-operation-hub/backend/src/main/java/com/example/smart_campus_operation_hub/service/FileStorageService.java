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

    /**
     * Store file on disk. Generates unique filename.
     * @return the generated file URL path (e.g. /uploads/uuid-filename.jpg)
     */
    public String storeFile(MultipartFile file) {
        try {
            String encodedImage = java.util.Base64.getEncoder().encodeToString(file.getBytes());
            return "data:" + file.getContentType() + ";base64," + encodedImage;
        } catch (java.io.IOException ex) {
            throw new RuntimeException("Could not process file " + file.getOriginalFilename() + ". Please try again!", ex);
        }
    }

    /**
     * Delete file from disk.
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
            return;
        }
        
        try {
            String filename = fileUrl.replace("/uploads/", "");
            java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir).resolve(filename).normalize();
            java.nio.file.Files.deleteIfExists(filePath);
        } catch (java.io.IOException ex) {
            throw new RuntimeException("Could not delete file " + fileUrl, ex);
        }
    }
}



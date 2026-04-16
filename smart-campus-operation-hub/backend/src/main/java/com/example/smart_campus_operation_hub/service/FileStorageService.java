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
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            // Generate unique name
            String originalName = org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());
            String uniqueName = java.util.UUID.randomUUID().toString() + "_" + originalName;
            
            java.nio.file.Path filePath = uploadPath.resolve(uniqueName);
            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // In a real app we'd map this to a base URL or CDN. 
            // For now, return a relative path that matches a static resource handler.
            return "/uploads/" + uniqueName;
            
        } catch (java.io.IOException ex) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", ex);
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

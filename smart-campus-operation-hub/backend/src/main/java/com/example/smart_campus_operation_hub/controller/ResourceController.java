package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.dto.request.ResourceRecommendationRequest;
import com.example.smart_campus_operation_hub.dto.request.ResourceRequest;
import com.example.smart_campus_operation_hub.dto.response.ResourceAnalyticsDTO;
import com.example.smart_campus_operation_hub.dto.response.ResourceRecommendationResult;
import com.example.smart_campus_operation_hub.dto.response.ResourceResponse;
import com.example.smart_campus_operation_hub.enums.ResourceStatus;
import com.example.smart_campus_operation_hub.enums.ResourceType;
import com.example.smart_campus_operation_hub.service.ResourceScoringService;
import com.example.smart_campus_operation_hub.service.ResourceService;
import jakarta.validation.Valid;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/resources")
public class ResourceController {

    private final ResourceService resourceService;
    private final ResourceScoringService resourceScoringService;

    public ResourceController(ResourceService resourceService, ResourceScoringService resourceScoringService) {
        this.resourceService = resourceService;
        this.resourceScoringService = resourceScoringService;
    }

    @GetMapping
    public ResponseEntity<Page<ResourceResponse>> getAllResources(Pageable pageable) {
        return ResponseEntity.ok(resourceService.getAllResources(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ResourceResponse>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            Pageable pageable) {
        return ResponseEntity.ok(resourceService.searchResources(type, status, location, minCapacity, pageable));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ResourceAnalyticsDTO> getAnalytics() {
        return ResponseEntity.ok(resourceService.getAnalytics());
    }

    @PostMapping("/recommend")
    public ResponseEntity<List<ResourceRecommendationResult>> recommend(
            @RequestBody ResourceRecommendationRequest request) {
        return ResponseEntity.ok(resourceScoringService.recommend(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ResourceResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.toggleStatus(id));
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ResourceResponse> uploadImages(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile[] files) throws IOException {

        java.util.List<String> uploadedUrls = new java.util.ArrayList<>();

        for (MultipartFile file : files) {
            if (file.getSize() > 5 * 1024 * 1024)
                throw new IllegalArgumentException("File size must not exceed 5MB");

            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/webp")))
                throw new IllegalArgumentException("Only JPG, PNG and WEBP files are allowed");

            String filename = "resource_" + id + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("uploads");
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

            uploadedUrls.add("/uploads/" + filename);
        }

        return ResponseEntity.ok(resourceService.addImageUrls(id, uploadedUrls));
    }
}

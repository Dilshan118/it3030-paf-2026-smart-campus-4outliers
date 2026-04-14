package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.dto.request.ResourceRequest;
import com.example.smart_campus_operation_hub.dto.response.ResourceResponse;
import com.example.smart_campus_operation_hub.enums.ResourceStatus;
import com.example.smart_campus_operation_hub.enums.ResourceType;
import com.example.smart_campus_operation_hub.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // GET /api/v1/resources
    @GetMapping
    public ResponseEntity<Page<ResourceResponse>> getAllResources(Pageable pageable) {
        return ResponseEntity.ok(resourceService.getAllResources(pageable));
    }

    // GET /api/v1/resources/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // POST /api/v1/resources  (Admin only)
    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(request));
    }

    // PUT /api/v1/resources/{id}  (Admin only)
    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    // DELETE /api/v1/resources/{id}  (Admin only — soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/v1/resources/search?type=LAB&location=Block C&minCapacity=30
    @GetMapping("/search")
    public ResponseEntity<Page<ResourceResponse>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            Pageable pageable) {
        return ResponseEntity.ok(resourceService.searchResources(type, status, location, minCapacity, pageable));
    }

    // PATCH /api/v1/resources/{id}/status  (Admin only)
    @PatchMapping("/{id}/status")
    public ResponseEntity<ResourceResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.toggleStatus(id));
    }
}
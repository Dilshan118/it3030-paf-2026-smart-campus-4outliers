package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.service.ResourceService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * MEMBER 1: Resource Controller
 * Base path: /api/v1/resources
 *
 * TODO: Implement all endpoints
 */
@RestController
@RequestMapping("/api/v1/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // TODO: GET    /                 → List all resources (paginated, filtered)
    // TODO: GET    /{id}             → Get resource by ID
    // TODO: POST   /                 → Create resource (Admin)
    // TODO: PUT    /{id}             → Update resource (Admin)
    // TODO: DELETE /{id}             → Soft delete resource (Admin)
    // TODO: GET    /search           → Search with filters
    // TODO: PATCH  /{id}/status      → Toggle ACTIVE/OUT_OF_SERVICE (Admin)
}

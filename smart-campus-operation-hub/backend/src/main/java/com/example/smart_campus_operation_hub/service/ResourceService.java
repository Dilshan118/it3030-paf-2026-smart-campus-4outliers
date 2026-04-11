package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.repository.ResourceRepository;
import org.springframework.stereotype.Service;

/**
 * MEMBER 1: Resource Service
 * TODO: Implement CRUD operations, search/filter, status toggle
 */
@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    // TODO: getAllResources(Pageable pageable)
    // TODO: getResourceById(Long id)
    // TODO: createResource(ResourceRequest request)
    // TODO: updateResource(Long id, ResourceRequest request)
    // TODO: deleteResource(Long id) — soft delete
    // TODO: searchResources(type, status, location, minCapacity, pageable)
    // TODO: toggleStatus(Long id)
}

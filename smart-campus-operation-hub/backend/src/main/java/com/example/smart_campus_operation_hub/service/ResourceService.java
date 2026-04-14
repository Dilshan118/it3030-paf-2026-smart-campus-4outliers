package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.dto.request.ResourceRequest;
import com.example.smart_campus_operation_hub.dto.response.ResourceResponse;
import com.example.smart_campus_operation_hub.enums.ResourceStatus;
import com.example.smart_campus_operation_hub.enums.ResourceType;
import com.example.smart_campus_operation_hub.exception.ResourceNotFoundException;
import com.example.smart_campus_operation_hub.model.Resource;
import com.example.smart_campus_operation_hub.repository.ResourceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public Page<ResourceResponse> getAllResources(Pageable pageable) {
        return resourceRepository.findByIsDeletedFalse(pageable)
                .map(ResourceResponse::from);
    }

    public ResourceResponse getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .filter(r -> !r.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return ResourceResponse.from(resource);
    }

    public ResourceResponse createResource(ResourceRequest request) {
        Resource resource = new Resource();
        mapRequestToEntity(request, resource);
        return ResourceResponse.from(resourceRepository.save(resource));
    }

    public ResourceResponse updateResource(Long id, ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .filter(r -> !r.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        mapRequestToEntity(request, resource);
        return ResourceResponse.from(resourceRepository.save(resource));
    }

    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .filter(r -> !r.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        resource.setIsDeleted(true);
        resourceRepository.save(resource);
    }

    public Page<ResourceResponse> searchResources(
            ResourceType type, ResourceStatus status,
            String location, Integer minCapacity, Pageable pageable) {
        return resourceRepository.searchResources(type, status, location, minCapacity, pageable)
                .map(ResourceResponse::from);
    }

    public ResourceResponse toggleStatus(Long id) {
        Resource resource = resourceRepository.findById(id)
                .filter(r -> !r.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        resource.setStatus(
            resource.getStatus() == ResourceStatus.ACTIVE
                ? ResourceStatus.OUT_OF_SERVICE
                : ResourceStatus.ACTIVE
        );
        return ResourceResponse.from(resourceRepository.save(resource));
    }

    // Helper to map DTO fields → Entity
    private void mapRequestToEntity(ResourceRequest request, Resource resource) {
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setAvailabilityWindows(request.getAvailabilityWindows());
        resource.setImageUrl(request.getImageUrl());
    }

    public ResourceResponse updateImageUrl(Long id, String imageUrl) {
    Resource resource = resourceRepository.findById(id)
            .filter(r -> !r.getIsDeleted())
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    resource.setImageUrl(imageUrl);
    return ResourceResponse.from(resourceRepository.save(resource));
}
}


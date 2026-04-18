package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.dto.request.ResourceRequest;
import com.example.smart_campus_operation_hub.dto.response.ResourceAnalyticsDTO;
import com.example.smart_campus_operation_hub.dto.response.ResourceResponse;
import com.example.smart_campus_operation_hub.enums.ResourceStatus;
import com.example.smart_campus_operation_hub.enums.ResourceType;
import com.example.smart_campus_operation_hub.exception.ResourceNotFoundException;
import com.example.smart_campus_operation_hub.model.Resource;
import com.example.smart_campus_operation_hub.repository.ResourceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        if (request.getImageUrls() != null) {
            resource.setImageUrls(request.getImageUrls());
        }
    }

    public ResourceAnalyticsDTO getAnalytics() {
        List<Resource> all = resourceRepository.findAll()
            .stream()
            .filter(r -> !Boolean.TRUE.equals(r.getIsDeleted()))
            .collect(Collectors.toList());

        long total = all.size();
        long active = all.stream().filter(r -> r.getStatus() == ResourceStatus.ACTIVE).count();
        long outOfService = all.stream().filter(r -> r.getStatus() == ResourceStatus.OUT_OF_SERVICE).count();

        // groupingBy rejects null keys — skip resources with null type or location
        Map<String, Long> byType = all.stream()
            .filter(r -> r.getType() != null)
            .collect(Collectors.groupingBy(r -> r.getType().name(), Collectors.counting()));

        Map<String, Long> byLocation = all.stream()
            .filter(r -> r.getLocation() != null && !r.getLocation().isBlank())
            .collect(Collectors.groupingBy(Resource::getLocation, Collectors.counting()));

        YearMonth currentMonth = YearMonth.now();
        long addedThisMonth = all.stream()
            .filter(r -> {
                if (r.getCreatedAt() == null) {
                // Optionally log a warning here
                return false;
                }
                return YearMonth.from(r.getCreatedAt()).equals(currentMonth);
            })
            .count();

        double activePercentage = total > 0
            ? Math.round((double) active / total * 1000.0) / 10.0
            : 0.0;

        return new ResourceAnalyticsDTO(total, active, outOfService, byType, byLocation, addedThisMonth, activePercentage);
    }

    public ResourceResponse addImageUrls(Long id, java.util.List<String> imageUrls) {
        Resource resource = resourceRepository.findById(id)
                .filter(r -> !r.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        if (resource.getImageUrls() == null) {
            resource.setImageUrls(new java.util.ArrayList<>());
        }
        resource.getImageUrls().addAll(imageUrls);
        return ResourceResponse.from(resourceRepository.save(resource));
    }

}


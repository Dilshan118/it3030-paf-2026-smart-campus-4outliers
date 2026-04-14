package com.example.smart_campus_operation_hub.dto.response;

import com.example.smart_campus_operation_hub.enums.ResourceStatus;
import com.example.smart_campus_operation_hub.enums.ResourceType;
import com.example.smart_campus_operation_hub.model.Resource;
import java.time.LocalDateTime;

public class ResourceResponse {

    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String description;
    private String availabilityWindows;
    private ResourceStatus status;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Static factory method — converts Entity → DTO
    public static ResourceResponse from(Resource r) {
        ResourceResponse dto = new ResourceResponse();
        dto.id = r.getId();
        dto.name = r.getName();
        dto.type = r.getType();
        dto.capacity = r.getCapacity();
        dto.location = r.getLocation();
        dto.description = r.getDescription();
        dto.availabilityWindows = r.getAvailabilityWindows();
        dto.status = r.getStatus();
        dto.imageUrl = r.getImageUrl();
        dto.createdAt = r.getCreatedAt();
        dto.updatedAt = r.getUpdatedAt();
        return dto;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public ResourceType getType() { return type; }
    public Integer getCapacity() { return capacity; }
    public String getLocation() { return location; }
    public String getDescription() { return description; }
    public String getAvailabilityWindows() { return availabilityWindows; }
    public ResourceStatus getStatus() { return status; }
    public String getImageUrl() { return imageUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
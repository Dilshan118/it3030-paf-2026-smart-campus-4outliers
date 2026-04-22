package com.example.smart_campus_operation_hub.dto.response;

import com.example.smart_campus_operation_hub.enums.ResourceStatus;
import com.example.smart_campus_operation_hub.enums.ResourceType;
import com.example.smart_campus_operation_hub.model.Resource;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

public class ResourceResponse {

    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String description;
    private String availabilityWindows;
    private ResourceStatus status;
    private List<String> imageUrls;
    private boolean hasImage;
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

        List<String> urls = new ArrayList<>();
        if (r.getImageUrls() != null && !r.getImageUrls().isEmpty()) {
            for (String url : r.getImageUrls()) {
                if (url != null && !url.trim().isEmpty()) {
                    urls.add(url);
                }
            }
        }
        if (r.getLegacyImageUrl() != null && !r.getLegacyImageUrl().trim().isEmpty() && !urls.contains(r.getLegacyImageUrl())) {
            urls.add(r.getLegacyImageUrl());
        }
        dto.imageUrls = urls;
        dto.hasImage = !urls.isEmpty();

        dto.createdAt = r.getCreatedAt();
        dto.updatedAt = r.getUpdatedAt();
        return dto;
    }

    // List factory — no image data, only a flag; callers lazy-load images individually
    public static ResourceResponse forList(Resource r) {
        ResourceResponse dto = from(r);
        dto.imageUrls = new ArrayList<>();
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
    public List<String> getImageUrls() { return imageUrls; }
    public boolean isHasImage() { return hasImage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
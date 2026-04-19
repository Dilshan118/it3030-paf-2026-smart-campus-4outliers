package com.example.smart_campus_operation_hub.dto.request;

import com.example.smart_campus_operation_hub.enums.ResourceType;
import jakarta.validation.constraints.*;
import java.util.List;

public class ResourceRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @Positive(message = "Capacity must be a positive number")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;
    private String availabilityWindows; // JSON string
    private List<String> imageUrls;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public ResourceType getType() { return type; }
    public void setType(ResourceType type) { this.type = type; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAvailabilityWindows() { return availabilityWindows; }
    public void setAvailabilityWindows(String availabilityWindows) { this.availabilityWindows = availabilityWindows; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}
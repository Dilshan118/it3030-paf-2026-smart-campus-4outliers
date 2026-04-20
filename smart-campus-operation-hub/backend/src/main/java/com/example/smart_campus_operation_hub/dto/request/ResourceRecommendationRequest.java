package com.example.smart_campus_operation_hub.dto.request;

public class ResourceRecommendationRequest {

    private String type;              // optional ResourceType name (LAB, LECTURE_HALL, etc.)
    private Integer requiredCapacity; // optional
    private String preferredLocation; // optional

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getRequiredCapacity() { return requiredCapacity; }
    public void setRequiredCapacity(Integer requiredCapacity) { this.requiredCapacity = requiredCapacity; }

    public String getPreferredLocation() { return preferredLocation; }
    public void setPreferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; }
}

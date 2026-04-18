package com.example.smart_campus_operation_hub.dto.response;

import java.util.Map;

public class ResourceAnalyticsDTO {

    private long totalResources;
    private long activeResources;
    private long outOfServiceResources;
    private Map<String, Long> resourcesByType;
    private Map<String, Long> resourcesByLocation;
    private long addedThisMonth;
    private double activePercentage;

    public ResourceAnalyticsDTO() {}

    public ResourceAnalyticsDTO(
            long totalResources,
            long activeResources,
            long outOfServiceResources,
            Map<String, Long> resourcesByType,
            Map<String, Long> resourcesByLocation,
            long addedThisMonth,
            double activePercentage) {
        this.totalResources = totalResources;
        this.activeResources = activeResources;
        this.outOfServiceResources = outOfServiceResources;
        this.resourcesByType = resourcesByType;
        this.resourcesByLocation = resourcesByLocation;
        this.addedThisMonth = addedThisMonth;
        this.activePercentage = activePercentage;
    }

    public long getTotalResources() { return totalResources; }
    public void setTotalResources(long totalResources) { this.totalResources = totalResources; }

    public long getActiveResources() { return activeResources; }
    public void setActiveResources(long activeResources) { this.activeResources = activeResources; }

    public long getOutOfServiceResources() { return outOfServiceResources; }
    public void setOutOfServiceResources(long outOfServiceResources) { this.outOfServiceResources = outOfServiceResources; }

    public Map<String, Long> getResourcesByType() { return resourcesByType; }
    public void setResourcesByType(Map<String, Long> resourcesByType) { this.resourcesByType = resourcesByType; }

    public Map<String, Long> getResourcesByLocation() { return resourcesByLocation; }
    public void setResourcesByLocation(Map<String, Long> resourcesByLocation) { this.resourcesByLocation = resourcesByLocation; }

    public long getAddedThisMonth() { return addedThisMonth; }
    public void setAddedThisMonth(long addedThisMonth) { this.addedThisMonth = addedThisMonth; }

    public double getActivePercentage() { return activePercentage; }
    public void setActivePercentage(double activePercentage) { this.activePercentage = activePercentage; }
}

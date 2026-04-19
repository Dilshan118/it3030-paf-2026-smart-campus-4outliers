package com.example.smart_campus_operation_hub.dto.response;

import java.util.List;

public class ResourceRecommendationResult {

    private ResourceResponse resource;
    private double score;           // 0–100, one decimal place
    private List<String> reasons;   // plain-English explanations

    public ResourceRecommendationResult() {}

    public ResourceRecommendationResult(ResourceResponse resource, double score, List<String> reasons) {
        this.resource = resource;
        this.score    = score;
        this.reasons  = reasons;
    }

    public ResourceResponse getResource() { return resource; }
    public void setResource(ResourceResponse resource) { this.resource = resource; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }
}

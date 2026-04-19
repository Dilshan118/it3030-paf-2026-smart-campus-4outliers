package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.dto.request.ResourceRecommendationRequest;
import com.example.smart_campus_operation_hub.dto.response.ResourceRecommendationResult;
import com.example.smart_campus_operation_hub.dto.response.ResourceResponse;
import com.example.smart_campus_operation_hub.enums.ResourceStatus;
import com.example.smart_campus_operation_hub.enums.ResourceType;
import com.example.smart_campus_operation_hub.model.Resource;
import com.example.smart_campus_operation_hub.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceScoringService {

    // Scoring weights (must sum to 100)
    private static final int MAX_CAPACITY = 35;
    private static final int MAX_HEALTH   = 25;
    private static final int MAX_AGE      = 25;
    private static final int MAX_LOCATION = 15;

    private static final int TOP_N = 6;

    private final ResourceRepository resourceRepository;

    public ResourceScoringService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    // ── Public entry point ────────────────────────────────────────────────────

    public List<ResourceRecommendationResult> recommend(ResourceRecommendationRequest req) {
        ResourceType targetType = null;
        if (req.getType() != null && !req.getType().isBlank()) {
            try {
                targetType = ResourceType.valueOf(req.getType().trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        List<Resource> eligible = resourceRepository.findActiveResourcesForRecommendation(ResourceStatus.ACTIVE, targetType);

        return eligible.stream()
                .map(r -> computeScore(r, req))
                .sorted(Comparator.comparingDouble(ResourceRecommendationResult::getScore).reversed())
                .limit(TOP_N)
                .collect(Collectors.toList());
    }

    // ── Aggregate scorer ──────────────────────────────────────────────────────

    private ResourceRecommendationResult computeScore(Resource r, ResourceRecommendationRequest req) {
        List<String> reasons = new ArrayList<>();

        double cap      = scoreCapacity(r, req.getRequiredCapacity(), reasons);
        double health   = scoreHealth(r, reasons);
        double age      = scoreAge(r, reasons);
        double location = scoreLocation(r, req.getPreferredLocation(), reasons);

        double total = Math.round(Math.min(100.0, cap + health + age + location) * 10.0) / 10.0;

        return new ResourceRecommendationResult(ResourceResponse.from(r), total, reasons);
    }

    // ── Capacity Fit (35 pts) ─────────────────────────────────────────────────

    private double scoreCapacity(Resource r, Integer required, List<String> reasons) {
        if (required == null) {
            reasons.add("No capacity requirement — suitable for any group size");
            return MAX_CAPACITY;
        }

        Integer cap = r.getCapacity();
        if (cap == null) {
            reasons.add("Capacity data unavailable — manual verification recommended");
            return MAX_CAPACITY * 0.45;
        }

        if (cap < required) {
            double deficit = (double)(required - cap) / required;
            if (deficit <= 0.05) {
                reasons.add("Marginally below requirement (" + cap + " available, " + required + " needed)");
                return MAX_CAPACITY * 0.65;
            } else if (deficit <= 0.15) {
                reasons.add("Somewhat short on capacity (" + cap + " available, " + required + " needed)");
                return MAX_CAPACITY * 0.35;
            } else {
                reasons.add("Insufficient capacity (" + cap + " available, " + required + " needed)");
                return 0;
            }
        }

        double excess = (double)(cap - required) / required;
        if (excess == 0) {
            reasons.add("Exact capacity match (" + cap + " seats)");
            return MAX_CAPACITY;
        } else if (excess <= 0.10) {
            reasons.add("Near-perfect capacity fit (" + cap + " seats, " + required + " needed)");
            return MAX_CAPACITY * 0.94;
        } else if (excess <= 0.25) {
            reasons.add("Comfortable capacity margin (" + cap + " seats available)");
            return MAX_CAPACITY * 0.86;
        } else if (excess <= 0.50) {
            reasons.add("Spacious — larger than required (" + cap + " seats for " + required + " needed)");
            return MAX_CAPACITY * 0.70;
        } else if (excess <= 1.0) {
            reasons.add("Significantly oversized but workable (" + cap + " seats for " + required + " needed)");
            return MAX_CAPACITY * 0.50;
        } else {
            reasons.add("Much larger than needed (" + cap + " seats for " + required + " needed)");
            return MAX_CAPACITY * 0.28;
        }
    }

    // ── Health Status (25 pts) ────────────────────────────────────────────────

    private double scoreHealth(Resource r, List<String> reasons) {
        int base  = 20; // guaranteed by ACTIVE filter
        int bonus = 0;

        if (r.getUpdatedAt() != null) {
            long daysSince = ChronoUnit.DAYS.between(r.getUpdatedAt().toLocalDate(), LocalDate.now());
            if (daysSince <= 7) {
                bonus = 5;
                reasons.add("Recently inspected and updated (within the last 7 days)");
            } else if (daysSince <= 30) {
                bonus = 3;
                reasons.add("Recently maintained (within the last month)");
            } else if (daysSince <= 90) {
                bonus = 2;
                reasons.add("Regularly maintained and in good standing");
            } else {
                reasons.add("Active and operationally stable");
            }
        } else {
            reasons.add("Currently active and available");
        }

        return Math.min(MAX_HEALTH, base + bonus);
    }

    // ── Resource Age (25 pts) ─────────────────────────────────────────────────

    private double scoreAge(Resource r, List<String> reasons) {
        if (r.getCreatedAt() == null) {
            reasons.add("Resource history unavailable");
            return MAX_AGE * 0.50;
        }

        long months = ChronoUnit.MONTHS.between(r.getCreatedAt().toLocalDate(), LocalDate.now());

        if (months >= 24) {
            reasons.add("Well-established resource with a proven operational record");
            return MAX_AGE;
        } else if (months >= 12) {
            reasons.add("Mature resource with over a year of reliable service");
            return MAX_AGE * 0.88;
        } else if (months >= 6) {
            reasons.add("Established resource with a solid track record");
            return MAX_AGE * 0.72;
        } else if (months >= 3) {
            reasons.add("Operational for several months — performance is settling");
            return MAX_AGE * 0.52;
        } else if (months >= 1) {
            reasons.add("Relatively new — limited usage history available");
            return MAX_AGE * 0.32;
        } else {
            reasons.add("Newly provisioned resource — no usage history yet");
            return MAX_AGE * 0.20;
        }
    }

    // ── Location Match (15 pts) ───────────────────────────────────────────────

    private double scoreLocation(Resource r, String preferred, List<String> reasons) {
        if (preferred == null || preferred.isBlank()) {
            reasons.add("No location preference — all areas qualify");
            return MAX_LOCATION;
        }

        String pref = preferred.trim().toLowerCase();
        
        if (r.getLocation() == null || r.getLocation().isBlank()) {
            reasons.add("Location undefined for this resource");
            return MAX_LOCATION * 0.10;
        }
        
        String loc = r.getLocation().toLowerCase();

        if (loc.contains(pref) || pref.contains(loc)) {
            reasons.add("Located in your preferred area (" + r.getLocation() + ")");
            return MAX_LOCATION;
        }

        // Partial word overlap
        String[] prefWords = pref.split("\\s+");
        String[] locWords  = loc.split("\\s+");
        for (String pw : prefWords) {
            if (pw.length() < 3) continue;
            for (String lw : locWords) {
                if (lw.equals(pw)) {
                    reasons.add("Partially matches preferred location (" + r.getLocation() + ")");
                    return MAX_LOCATION * 0.53;
                }
            }
        }

        reasons.add("Located at " + r.getLocation() + " (outside preferred area)");
        return MAX_LOCATION * 0.13;
    }
}

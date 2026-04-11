package com.example.smart_campus_operation_hub.dto.request;

import com.example.smart_campus_operation_hub.enums.TicketCategory;
import com.example.smart_campus_operation_hub.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request body for creating/updating a ticket.
 * Used by: POST /api/v1/tickets, PUT /api/v1/tickets/{id}
 */
public class TicketRequest {

    private Long resourceId;  // optional — which resource has the issue

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    private String contactInfo;  // optional JSON: {"email":"...", "phone":"..."}

    // --- Getters and Setters ---

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }
}

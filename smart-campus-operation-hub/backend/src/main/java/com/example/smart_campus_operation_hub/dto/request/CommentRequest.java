package com.example.smart_campus_operation_hub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for adding/editing a comment on a ticket.
 * Used by: POST /api/v1/tickets/{ticketId}/comments
 */
public class CommentRequest {

    @NotBlank(message = "Comment content is required")
    @Size(max = 2000, message = "Comment must not exceed 2000 characters")
    private String content;

    // --- Getter and Setter ---

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}

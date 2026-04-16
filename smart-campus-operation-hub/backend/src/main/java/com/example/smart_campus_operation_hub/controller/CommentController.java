package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.service.CommentService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * MEMBER 3: Comment Controller
 * Base path: /api/v1/tickets/{ticketId}/comments
 */
@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    /**
     * Get all comments for a ticket.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getComments(@PathVariable Long ticketId) {
        List<com.example.smart_campus_operation_hub.dto.response.CommentResponse> response =
                commentService.getCommentsByTicketId(ticketId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Add a comment to a ticket.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Object>> addComment(
            @PathVariable Long ticketId,
            @jakarta.validation.Valid @RequestBody com.example.smart_campus_operation_hub.dto.request.CommentRequest request) {

        // TODO: Replace with actual logged-in user ID
        Long userId = 1L;

        com.example.smart_campus_operation_hub.dto.response.CommentResponse response =
                commentService.addComment(ticketId, request.getContent(), userId);

        return ResponseEntity.status(201).body(ApiResponse.success(response));
    }

    /**
     * Edit a specific comment.
     */
    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Object>> editComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @jakarta.validation.Valid @RequestBody com.example.smart_campus_operation_hub.dto.request.CommentRequest request) {

        // TODO: Replace with actual logged-in user ID
        Long userId = 1L;

        com.example.smart_campus_operation_hub.dto.response.CommentResponse response =
            commentService.editComment(ticketId, commentId, request.getContent(), userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Delete a comment.
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Object>> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId) {

        // TODO: Replace with actual logged-in user ID and role
        Long userId = 1L;
        String role = "USER";

        commentService.deleteComment(ticketId, commentId, userId, role);

        return ResponseEntity.noContent().build();
    }
}

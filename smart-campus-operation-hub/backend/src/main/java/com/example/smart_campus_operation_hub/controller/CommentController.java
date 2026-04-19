package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.service.CommentService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getComments(@PathVariable Long ticketId) {
        List<com.example.smart_campus_operation_hub.dto.response.CommentResponse> response =
                commentService.getCommentsByTicketId(ticketId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> addComment(
            Authentication authentication,
            @PathVariable Long ticketId,
            @jakarta.validation.Valid @RequestBody com.example.smart_campus_operation_hub.dto.request.CommentRequest request) {

        Long userId = (Long) authentication.getPrincipal();
        com.example.smart_campus_operation_hub.dto.response.CommentResponse response =
                commentService.addComment(ticketId, request.getContent(), userId);

        return ResponseEntity.status(201).body(ApiResponse.success(response));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Object>> editComment(
            Authentication authentication,
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @jakarta.validation.Valid @RequestBody com.example.smart_campus_operation_hub.dto.request.CommentRequest request) {

        Long userId = (Long) authentication.getPrincipal();
        com.example.smart_campus_operation_hub.dto.response.CommentResponse response =
                commentService.editComment(ticketId, commentId, request.getContent(), userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Object>> deleteComment(
            Authentication authentication,
            @PathVariable Long ticketId,
            @PathVariable Long commentId) {

        Long userId = (Long) authentication.getPrincipal();
        String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        commentService.deleteComment(ticketId, commentId, userId, role);

        return ResponseEntity.noContent().build();
    }
}

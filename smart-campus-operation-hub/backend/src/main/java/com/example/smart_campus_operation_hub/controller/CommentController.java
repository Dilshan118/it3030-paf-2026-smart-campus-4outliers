package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.service.CommentService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * MEMBER 3: Comment Controller
 * Base path: /api/v1/tickets/{ticketId}/comments
 *
 * TODO: Implement all endpoints
 */
@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // TODO: POST   /           → Add comment to ticket
    // TODO: PUT    /{cid}      → Edit own comment
    // TODO: DELETE /{cid}      → Delete own comment (or admin)
}

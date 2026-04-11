package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.repository.CommentRepository;
import org.springframework.stereotype.Service;

/**
 * MEMBER 3: Comment Service
 * TODO: Implement add/edit/delete comments with ownership rules
 */
@Service
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    // TODO: getCommentsByTicketId(Long ticketId)
    // TODO: addComment(Long ticketId, String content, Long authorId)
    // TODO: editComment(Long commentId, String content, Long userId) — owner only
    // TODO: deleteComment(Long commentId, Long userId) — owner or admin
}

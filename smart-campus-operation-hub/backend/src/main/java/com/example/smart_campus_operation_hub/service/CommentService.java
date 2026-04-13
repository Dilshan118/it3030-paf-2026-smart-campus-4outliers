package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.dto.response.CommentResponse;
import com.example.smart_campus_operation_hub.exception.BadRequestException;
import com.example.smart_campus_operation_hub.exception.ResourceNotFoundException;
import com.example.smart_campus_operation_hub.exception.UnauthorizedException;
import com.example.smart_campus_operation_hub.model.Comment;
import com.example.smart_campus_operation_hub.model.Ticket;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.repository.CommentRepository;
import com.example.smart_campus_operation_hub.repository.TicketRepository;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * MEMBER 3: Comment Service
 * Handles adding, editing, deleting, and fetching comments for tickets.
 */
@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository,
                          TicketRepository ticketRepository,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    /**
     * Add a comment to a ticket.
     */
    public CommentResponse addComment(Long ticketId, String content, Long authorId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", authorId));

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setAuthor(author);
        comment.setContent(content);

        Comment saved = commentRepository.save(comment);

        // Optional: Update ticket's updatedAt timestamp
        ticketRepository.save(ticket);

        return mapToResponse(saved);
    }

    /**
     * Get all comments for a ticket.
     */
    public List<CommentResponse> getCommentsByTicketId(Long ticketId) {
        // Enforce that the ticket exists first
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket", ticketId);
        }

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    /**
     * Edit a comment. Only the author can edit their comment.
     */
    public CommentResponse editComment(Long ticketId, Long commentId, String content, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new BadRequestException("Comment does not belong to the specified ticket");
        }

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own comments");
        }

        comment.setContent(content);
        Comment saved = commentRepository.save(comment);

        return mapToResponse(saved);
    }
    /**
     * Delete a comment. Author can delete their own; ADMIN can delete any.
     */
    public void deleteComment(Long ticketId, Long commentId, Long userId, String userRole) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new BadRequestException("Comment does not belong to the specified ticket");
        }

        boolean isAuthor = comment.getAuthor().getId().equals(userId);
        boolean isAdmin = "ADMIN".equals(userRole);

        if (!isAuthor && !isAdmin) {
            throw new UnauthorizedException("You do not have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }

    // ─── Private Helpers ──────────────────────────────────────────

    private CommentResponse mapToResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setAuthorId(comment.getAuthor().getId());
        response.setAuthorName(comment.getAuthor().getName());
        response.setAuthorAvatarUrl(comment.getAuthor().getAvatarUrl());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        return response;
    }
}

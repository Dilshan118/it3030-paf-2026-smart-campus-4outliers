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
import com.example.smart_campus_operation_hub.enums.NotificationType;
import com.example.smart_campus_operation_hub.enums.TicketStatus;
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
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository,
                          TicketRepository ticketRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /**
     * Add a comment to a ticket.
     */
    public CommentResponse addComment(Long ticketId, String content, Long authorId, String authorRole) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        enforceTicketAccess(ticket, authorId, authorRole);
        enforceDiscussionAllowed(ticket);

        String normalizedContent = content == null ? "" : content.trim();
        if (normalizedContent.isEmpty()) {
            throw new BadRequestException("Comment content is required");
        }

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", authorId));

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setAuthor(author);
        comment.setContent(normalizedContent);

        Comment saved = commentRepository.save(comment);

        // Optional: Update ticket's updatedAt timestamp
        ticketRepository.save(ticket);
        
        // Notify ticket owner if the commenter is not the owner
        if (!ticket.getUser().getId().equals(authorId)) {
            notificationService.send(ticket.getUser().getId(), NotificationType.COMMENT_ADDED,
                "New Comment on Ticket", author.getName() + " commented on your ticket.", ticket.getId(), "TICKET");
        }
        
        // Notify assigned technician if the commenter is not the technician
        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().getId().equals(authorId)) {
            notificationService.send(ticket.getAssignedTo().getId(), NotificationType.COMMENT_ADDED,
                "New Comment on Assigned Ticket", author.getName() + " commented on Ticket #" + ticket.getId(), ticket.getId(), "TICKET");
        }

        return mapToResponse(saved);
    }

    /**
     * Get all comments for a ticket.
     */
    public List<CommentResponse> getCommentsByTicketId(Long ticketId, Long callerId, String callerRole) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        enforceTicketAccess(ticket, callerId, callerRole);

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    /**
     * Edit a comment. Only the author can edit their comment.
     */
    public CommentResponse editComment(Long ticketId, Long commentId, String content, Long userId, String userRole) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new BadRequestException("Comment does not belong to the specified ticket");
        }

        enforceTicketAccess(comment.getTicket(), userId, userRole);
        enforceDiscussionAllowed(comment.getTicket());

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own comments");
        }

        String normalizedContent = content == null ? "" : content.trim();
        if (normalizedContent.isEmpty()) {
            throw new BadRequestException("Comment content is required");
        }

        comment.setContent(normalizedContent);
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

        enforceTicketAccess(comment.getTicket(), userId, userRole);

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
        response.setAuthorRole(comment.getAuthor().getRole().name());
        response.setAuthorAvatarUrl(comment.getAuthor().getAvatarUrl());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        return response;
    }

    private void enforceTicketAccess(Ticket ticket, Long callerId, String callerRole) {
        boolean isAdminOrManager = "ADMIN".equals(callerRole) || "MANAGER".equals(callerRole);
        boolean isOwner = ticket.getUser().getId().equals(callerId);
        boolean isAssignedTechnician = "TECHNICIAN".equals(callerRole)
                && ticket.getAssignedTo() != null
                && ticket.getAssignedTo().getId().equals(callerId);

        if (!isAdminOrManager && !isOwner && !isAssignedTechnician) {
            throw new UnauthorizedException("You are not allowed to access comments for this ticket");
        }
    }

    private void enforceDiscussionAllowed(Ticket ticket) {
        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new BadRequestException("Comments are locked for tickets in status: " + ticket.getStatus());
        }
    }
}

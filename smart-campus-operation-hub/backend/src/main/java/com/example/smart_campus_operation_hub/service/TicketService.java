package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.dto.request.TicketRequest;
import com.example.smart_campus_operation_hub.dto.response.AttachmentResponse;
import com.example.smart_campus_operation_hub.dto.response.CommentResponse;
import com.example.smart_campus_operation_hub.dto.response.TicketResponse;
import com.example.smart_campus_operation_hub.exception.ResourceNotFoundException;
import com.example.smart_campus_operation_hub.model.Attachment;
import com.example.smart_campus_operation_hub.model.Comment;
import com.example.smart_campus_operation_hub.model.Resource;
import com.example.smart_campus_operation_hub.model.Ticket;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.enums.TicketPriority;
import com.example.smart_campus_operation_hub.enums.TicketStatus;
import com.example.smart_campus_operation_hub.repository.ResourceRepository;
import com.example.smart_campus_operation_hub.repository.TicketRepository;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * MEMBER 3: Ticket Service
 * Handles ticket lifecycle — create, read, update, status transitions, assignment.
 */
@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         ResourceRepository resourceRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
    }

    /**
     * Create a new maintenance/issue ticket.
     *
     * @param request  ticket data from the form
     * @param userId   the logged-in user's ID
     * @return created ticket as response DTO
     */
    public TicketResponse createTicket(TicketRequest request, Long userId) {
        // 1. Find the user who is creating the ticket
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // 2. Find the resource (optional — tickets can exist without a resource)
        Resource resource = null;
        if (request.getResourceId() != null) {
            resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));
        }

        // 3. Build the ticket entity
        Ticket ticket = new Ticket();
        ticket.setUser(user);
        ticket.setResource(resource);
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setContactInfo(request.getContactInfo());
        ticket.setStatus(TicketStatus.OPEN);

        // 4. Calculate SLA deadline based on priority
        ticket.setSlaDeadline(calculateSlaDeadline(request.getPriority()));

        // 5. Save and return
        Ticket saved = ticketRepository.save(ticket);
        return mapToResponse(saved);
    }

    /**
     * Get a single ticket by ID, including its comments and attachments.
     *
     * @param id ticket ID
     * @return ticket details with nested comments and attachments
     * @throws ResourceNotFoundException if ticket does not exist
     */
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        TicketResponse response = mapToResponse(ticket);

        // Map comments list
        response.setComments(
                ticket.getComments().stream()
                        .map(this::mapCommentToResponse)
                        .toList()
        );

        // Map attachments list
        response.setAttachments(
                ticket.getAttachments().stream()
                        .map(this::mapAttachmentToResponse)
                        .toList()
        );

        return response;
    }

    // TODO: getAllTickets(Long userId, String role, Pageable pageable)
    // TODO: updateTicket(Long id, TicketRequest request, Long userId)
    // TODO: updateTicketStatus(Long id, TicketStatus newStatus, String resolutionNotes)
    // TODO: assignTechnician(Long ticketId, Long technicianId)

    // ─── Private Helpers ──────────────────────────────────────────

    /**
     * Calculate SLA deadline based on priority level.
     * CRITICAL = 4 hours, HIGH = 24 hours, MEDIUM = 48 hours, LOW = 72 hours
     */
    private LocalDateTime calculateSlaDeadline(TicketPriority priority) {
        return switch (priority) {
            case CRITICAL -> LocalDateTime.now().plusHours(4);
            case HIGH     -> LocalDateTime.now().plusHours(24);
            case MEDIUM   -> LocalDateTime.now().plusHours(48);
            case LOW      -> LocalDateTime.now().plusHours(72);
        };
    }

    /**
     * Convert Ticket entity to TicketResponse DTO.
     * Flattens related entity names so the frontend gets everything in one call.
     */
    private TicketResponse mapToResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setUserId(ticket.getUser().getId());
        response.setUserName(ticket.getUser().getName());
        response.setCategory(ticket.getCategory().name());
        response.setDescription(ticket.getDescription());
        response.setPriority(ticket.getPriority().name());
        response.setStatus(ticket.getStatus().name());
        response.setContactInfo(ticket.getContactInfo());
        response.setResolutionNotes(ticket.getResolutionNotes());
        response.setRejectionReason(ticket.getRejectionReason());
        response.setSlaDeadline(ticket.getSlaDeadline());
        response.setFirstResponseAt(ticket.getFirstResponseAt());
        response.setResolvedAt(ticket.getResolvedAt());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());

        // Resource is optional
        if (ticket.getResource() != null) {
            response.setResourceId(ticket.getResource().getId());
            response.setResourceName(ticket.getResource().getName());
        }

        // Assigned technician is optional
        if (ticket.getAssignedTo() != null) {
            response.setAssignedToId(ticket.getAssignedTo().getId());
            response.setAssignedToName(ticket.getAssignedTo().getName());
        }

        return response;
    }

    /**
     * Convert Comment entity to CommentResponse DTO.
     */
    private CommentResponse mapCommentToResponse(Comment comment) {
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

    /**
     * Convert Attachment entity to AttachmentResponse DTO.
     */
    private AttachmentResponse mapAttachmentToResponse(Attachment attachment) {
        AttachmentResponse response = new AttachmentResponse();
        response.setId(attachment.getId());
        response.setFileUrl(attachment.getFileUrl());
        response.setFileName(attachment.getFileName());
        response.setFileSize(attachment.getFileSize());
        response.setContentType(attachment.getContentType());
        response.setCreatedAt(attachment.getCreatedAt());
        return response;
    }
}

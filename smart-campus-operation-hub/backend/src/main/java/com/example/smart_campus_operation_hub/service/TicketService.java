package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.dto.request.TicketRequest;
import com.example.smart_campus_operation_hub.dto.response.AttachmentResponse;
import com.example.smart_campus_operation_hub.dto.response.CommentResponse;
import com.example.smart_campus_operation_hub.dto.response.TicketResponse;
import com.example.smart_campus_operation_hub.enums.Role;
import com.example.smart_campus_operation_hub.exception.ResourceNotFoundException;
import com.example.smart_campus_operation_hub.exception.UnauthorizedException;
import com.example.smart_campus_operation_hub.exception.BadRequestException;
import com.example.smart_campus_operation_hub.model.Attachment;
import com.example.smart_campus_operation_hub.model.Comment;
import com.example.smart_campus_operation_hub.model.Resource;
import com.example.smart_campus_operation_hub.model.Ticket;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.enums.NotificationType;
import com.example.smart_campus_operation_hub.enums.TicketCategory;
import com.example.smart_campus_operation_hub.enums.TicketPriority;
import com.example.smart_campus_operation_hub.enums.TicketStatus;
import com.example.smart_campus_operation_hub.repository.CommentRepository;
import com.example.smart_campus_operation_hub.repository.ResourceRepository;
import com.example.smart_campus_operation_hub.repository.TicketRepository;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.JoinType;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

/**
 * MEMBER 3: Ticket Service
 * Handles ticket lifecycle — create, read, update, status transitions, assignment.
 */
@Service
public class TicketService {

    private enum AssigneeFilter {
        ASSIGNED,
        UNASSIGNED,
        MINE
    }

    private enum ReporterFilter {
        MINE
    }

    private enum SlaStateFilter {
        BREACHED,
        DUE_SOON,
        ON_TRACK
    }

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         ResourceRepository resourceRepository,
                         CommentRepository commentRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
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
        ticket.setDescription(normalizeDescription(request.getDescription()));
        ticket.setPriority(request.getPriority());
        ticket.setContactInfo(normalizeContactInfo(request.getContactInfo(), request.getPriority()));
        ticket.setStatus(TicketStatus.OPEN);

        // 4. Calculate SLA deadline based on priority
        ticket.setSlaDeadline(calculateSlaDeadline(request.getPriority()));

        // 5. Save and return
        Ticket saved = ticketRepository.save(ticket);

        // 6. Send Notification
        notificationService.send(
                userId,
                com.example.smart_campus_operation_hub.enums.NotificationType.TICKET_CREATED,
                "Ticket #" + saved.getId() + " Submitted Successfully",
                "Your request regarding '" + saved.getCategory() + "' has been logged and is pending review.",
                saved.getId(),
                "TICKET"
        );

        return mapToResponse(saved);
    }

    /**
     * Get a single ticket by ID, including its comments and attachments.
     *
     * @param id ticket ID
     * @return ticket details with nested comments and attachments
     * @throws ResourceNotFoundException if ticket does not exist
     */
    public TicketResponse getTicketById(Long id, Long callerId, String callerRole) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        enforceTicketAccess(ticket, callerId, callerRole);

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
    /**
     * Get all tickets with role-based filtering.
     * - USER: sees only their own tickets
     * - TECHNICIAN: sees tickets assigned to them
     * - ADMIN/MANAGER: sees all tickets
     *
     * @param userId   current user's ID
     * @param role     current user's role (as string)
     * @param pageable pagination params (page, size, sort)
     * @return paginated list of tickets
     */
    public Page<TicketResponse> getAllTickets(Long userId,
                                              String role,
                                              String status,
                                              String priority,
                                              String category,
                                              String query,
                                              String assignee,
                                              String reporter,
                                              String slaState,
                                              String createdFrom,
                                              String createdTo,
                                              Pageable pageable) {
        TicketStatus statusFilter = parseEnumIgnoreCase(status, TicketStatus.class, "status");
        TicketPriority priorityFilter = parseEnumIgnoreCase(priority, TicketPriority.class, "priority");
        TicketCategory categoryFilter = parseEnumIgnoreCase(category, TicketCategory.class, "category");
        AssigneeFilter assigneeFilter = parseAssigneeFilter(assignee);
        ReporterFilter reporterFilter = parseReporterFilter(reporter);
        SlaStateFilter slaStateFilter = parseSlaStateFilter(slaState);
        LocalDateTime createdFromFilter = parseDateStart(createdFrom, "createdFrom");
        LocalDateTime createdToFilter = parseDateStart(createdTo, "createdTo");
        LocalDateTime createdToFilterExclusive = createdToFilter == null
            ? null
            : createdToFilter.plusDays(1);

        if (createdFromFilter != null
                && createdToFilterExclusive != null
                && !createdFromFilter.isBefore(createdToFilterExclusive)) {
            throw new BadRequestException("createdFrom must be before or equal to createdTo");
        }

        String searchQuery = query == null ? "" : query.trim();

        Specification<Ticket> spec = (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if ("TECHNICIAN".equals(role)) {
                predicates.add(cb.or(
                    cb.equal(root.get("assignedTo").get("id"), userId),
                    cb.equal(root.get("user").get("id"), userId)
                ));
            } else if (!"ADMIN".equals(role) && !"MANAGER".equals(role)) {
                predicates.add(cb.equal(root.get("user").get("id"), userId));
            }

            if (statusFilter != null) {
                predicates.add(cb.equal(root.get("status"), statusFilter));
            }
            if (priorityFilter != null) {
                predicates.add(cb.equal(root.get("priority"), priorityFilter));
            }
            if (categoryFilter != null) {
                predicates.add(cb.equal(root.get("category"), categoryFilter));
            }

                if (!searchQuery.isEmpty()) {
                String pattern = "%" + searchQuery.toLowerCase(Locale.ROOT) + "%";
                Predicate inDescription = cb.like(
                    cb.lower(cb.coalesce(root.get("description"), "")),
                    pattern
                );
                Predicate inContact = cb.like(
                    cb.lower(cb.coalesce(root.get("contactInfo"), "")),
                    pattern
                );
                Predicate inCategory = cb.like(
                    cb.lower(root.get("category").as(String.class)),
                    pattern
                );
                Predicate inReporter = cb.like(
                    cb.lower(cb.coalesce(root.join("user", JoinType.LEFT).get("name"), "")),
                    pattern
                );
                Predicate inAssignee = cb.like(
                    cb.lower(cb.coalesce(root.join("assignedTo", JoinType.LEFT).get("name"), "")),
                    pattern
                );
                Predicate inResource = cb.like(
                    cb.lower(cb.coalesce(root.join("resource", JoinType.LEFT).get("name"), "")),
                    pattern
                );

                predicates.add(cb.or(
                    inDescription,
                    inContact,
                    inCategory,
                    inReporter,
                    inAssignee,
                    inResource
                ));
                }

                if (assigneeFilter != null) {
                switch (assigneeFilter) {
                    case ASSIGNED -> predicates.add(cb.isNotNull(root.get("assignedTo")));
                    case UNASSIGNED -> predicates.add(cb.isNull(root.get("assignedTo")));
                    case MINE -> predicates.add(cb.equal(root.get("assignedTo").get("id"), userId));
                }
                }

                if (reporterFilter != null) {
                switch (reporterFilter) {
                    case MINE -> predicates.add(cb.equal(root.get("user").get("id"), userId));
                }
                }

                if (slaStateFilter != null) {
                LocalDateTime now = LocalDateTime.now();
                Predicate activeStatus = root.get("status").in(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);
                Predicate hasDeadline = cb.isNotNull(root.get("slaDeadline"));

                switch (slaStateFilter) {
                    case BREACHED -> predicates.add(cb.and(
                        activeStatus,
                        hasDeadline,
                        cb.lessThan(root.get("slaDeadline"), now)
                    ));
                    case DUE_SOON -> predicates.add(cb.and(
                        activeStatus,
                        hasDeadline,
                        cb.greaterThanOrEqualTo(root.get("slaDeadline"), now),
                        cb.lessThanOrEqualTo(root.get("slaDeadline"), now.plusHours(4))
                    ));
                    case ON_TRACK -> predicates.add(cb.and(
                        activeStatus,
                        hasDeadline,
                        cb.greaterThan(root.get("slaDeadline"), now.plusHours(4))
                    ));
                }
                }

                if (createdFromFilter != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), createdFromFilter));
                }

                if (createdToFilterExclusive != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), createdToFilterExclusive));
                }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Ticket> tickets = ticketRepository.findAll(spec, pageable);
        return tickets.map(this::mapToResponse);
    }
    /**
     * Update a ticket. Only the ticket owner can update, and only while status is OPEN.
     *
     * @param id      ticket ID
     * @param request updated ticket data
     * @param userId  the user attempting the edit
     * @return updated ticket
     */
    public TicketResponse updateTicket(Long id, TicketRequest request, Long userId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        // Only the owner can edit
        if (!ticket.getUser().getId().equals(userId)) {
            throw new com.example.smart_campus_operation_hub.exception.UnauthorizedException(
                    "You can only edit your own tickets");
        }

        // Can only edit while OPEN
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new com.example.smart_campus_operation_hub.exception.BadRequestException(
                    "Cannot edit ticket with status: " + ticket.getStatus());
        }

        // Update fields
        ticket.setCategory(request.getCategory());
        ticket.setDescription(normalizeDescription(request.getDescription()));
        ticket.setPriority(request.getPriority());
        ticket.setContactInfo(normalizeContactInfo(request.getContactInfo(), request.getPriority()));

        // Recalculate SLA if priority changed
        ticket.setSlaDeadline(calculateSlaDeadline(request.getPriority()));

        // Update resource if changed
        if (request.getResourceId() != null) {
            Resource resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));
            ticket.setResource(resource);
        } else {
            ticket.setResource(null);
        }

        Ticket saved = ticketRepository.save(ticket);
        return mapToResponse(saved);
    }

    /**
     * Delete a ticket. Only the ticket owner can delete, and only while status is OPEN.
     *
     * @param id     ticket ID
     * @param userId the user attempting the delete
     */
    public void deleteTicket(Long id, Long userId, String callerRole) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        boolean isAdmin = "ADMIN".equals(callerRole);
        boolean isOwner = ticket.getUser().getId().equals(userId);

        if (!isOwner && !isAdmin) {
            throw new com.example.smart_campus_operation_hub.exception.UnauthorizedException(
                    "You can only delete your own tickets");
        }

        if (!isAdmin && ticket.getStatus() != TicketStatus.OPEN) {
            throw new com.example.smart_campus_operation_hub.exception.BadRequestException(
                    "Cannot delete ticket with status: " + ticket.getStatus());
        }

        ticketRepository.delete(ticket);
    }

    /**
     * Update ticket status with lifecycle validation.
     * Allowed transitions:
     *   OPEN → IN_PROGRESS, REJECTED
     *   IN_PROGRESS → RESOLVED (requires resolution notes)
     *   RESOLVED → CLOSED
     */
    public TicketResponse updateTicketStatus(Long id, TicketStatus newStatus,
                                              String resolutionNotes, String rejectionReason,
                                              Long callerId, String callerRole) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        boolean isAdminOrManager = "ADMIN".equals(callerRole) || "MANAGER".equals(callerRole);
        boolean isTechnician = "TECHNICIAN".equals(callerRole);

        if (!isAdminOrManager && !isTechnician) {
            throw new UnauthorizedException("You are not allowed to update ticket status");
        }

        if (isTechnician) {
            if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getId().equals(callerId)) {
                throw new UnauthorizedException(
                        "You can only update status for tickets assigned to you");
            }
            if (newStatus != TicketStatus.IN_PROGRESS && newStatus != TicketStatus.RESOLVED) {
                throw new UnauthorizedException(
                        "Technicians can only mark tickets as in progress or resolved");
            }
        }

        if ((newStatus == TicketStatus.IN_PROGRESS || newStatus == TicketStatus.RESOLVED)
            && ticket.getAssignedTo() == null) {
            throw new BadRequestException(
                "Assign a technician before changing status to " + newStatus);
        }

        TicketStatus current = ticket.getStatus();

        // Validate transition
        boolean valid = switch (current) {
            case OPEN -> newStatus == TicketStatus.IN_PROGRESS || newStatus == TicketStatus.REJECTED;
            case IN_PROGRESS -> newStatus == TicketStatus.RESOLVED;
            case RESOLVED -> newStatus == TicketStatus.CLOSED;
            default -> false;
        };

        if (!valid) {
            throw new BadRequestException(
                    "Cannot transition from " + current + " to " + newStatus);
        }

        // Track first response when a technician starts work.
        if (newStatus == TicketStatus.IN_PROGRESS && ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(LocalDateTime.now());
        }

        if (newStatus == TicketStatus.IN_PROGRESS) {
            ticket.setRejectionReason(null);
        }

        // Handle RESOLVED — require resolution notes
        if (newStatus == TicketStatus.RESOLVED) {
            String normalizedNotes = resolutionNotes == null ? "" : resolutionNotes.trim();
            if (normalizedNotes.length() < 10) {
                throw new BadRequestException(
                        "Resolution notes (minimum 10 characters) are required when resolving a ticket");
            }
            ticket.setResolutionNotes(normalizedNotes);
            ticket.setResolvedAt(LocalDateTime.now());
        }

        // Handle REJECTED — require rejection reason
        if (newStatus == TicketStatus.REJECTED) {
            String normalizedReason = rejectionReason == null ? "" : rejectionReason.trim();
            if (normalizedReason.length() < 10) {
                throw new BadRequestException(
                        "Rejection reason is required");
            }
            ticket.setRejectionReason(normalizedReason);
            ticket.setAssignedTo(null);
            ticket.setResolvedAt(null);
            ticket.setResolutionNotes(null);
        }

        if (newStatus == TicketStatus.CLOSED && ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        ticket.setStatus(newStatus);
        Ticket saved = ticketRepository.save(ticket);
        
        // Notifications
        String resourceLabel = saved.getResource() != null ? saved.getResource().getName() : "ticket #" + saved.getId();
        if (newStatus == TicketStatus.RESOLVED) {
            notificationService.send(saved.getUser().getId(), NotificationType.TICKET_RESOLVED,
                "Ticket Resolved", "Your ticket for " + resourceLabel + " has been resolved.", saved.getId(), "TICKET");
        } else if (newStatus == TicketStatus.CLOSED) {
            notificationService.send(saved.getUser().getId(), NotificationType.TICKET_CLOSED,
                "Ticket Closed", "Your ticket for " + resourceLabel + " has been closed.", saved.getId(), "TICKET");
            if (saved.getAssignedTo() != null) {
                notificationService.send(saved.getAssignedTo().getId(), NotificationType.TICKET_CLOSED,
                    "Ticket Closed", "Ticket #" + saved.getId() + " has been closed.", saved.getId(), "TICKET");
            }
        } else {
            notificationService.send(saved.getUser().getId(), NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Status Updated", "Your ticket status changed to " + newStatus, saved.getId(), "TICKET");
        }

        return mapToResponse(saved);
    }

    /**
     * Reopen a resolved/closed ticket when the issue persists.
     * Owner, ADMIN, or MANAGER can reopen with a reason.
     */
    public TicketResponse reopenTicket(Long id, String reason, Long callerId, String callerRole) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        boolean isAdminOrManager = "ADMIN".equals(callerRole) || "MANAGER".equals(callerRole);
        boolean isOwner = ticket.getUser().getId().equals(callerId);

        if (!isAdminOrManager && !isOwner) {
            throw new UnauthorizedException("Only ticket owner or admins can reopen a ticket");
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new BadRequestException("Only RESOLVED or CLOSED tickets can be reopened");
        }

        String normalizedReason = reason == null ? "" : reason.trim();
        if (normalizedReason.length() < 10) {
            throw new BadRequestException("Reopen reason must be at least 10 characters");
        }

        // If a technician is still assigned, reopen directly into active work.
        ticket.setStatus(ticket.getAssignedTo() != null ? TicketStatus.IN_PROGRESS : TicketStatus.OPEN);
        ticket.setResolvedAt(null);

        Ticket saved = ticketRepository.save(ticket);

        User actor = userRepository.findById(callerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", callerId));

        Comment auditComment = new Comment();
        auditComment.setTicket(saved);
        auditComment.setAuthor(actor);
        auditComment.setContent("Ticket reopened: " + normalizedReason);
        commentRepository.save(auditComment);

        if (!saved.getUser().getId().equals(callerId)) {
            notificationService.send(saved.getUser().getId(), NotificationType.TICKET_STATUS_CHANGED,
                    "Ticket Reopened", "Ticket #" + saved.getId() + " has been reopened.", saved.getId(), "TICKET");
        }

        if (saved.getAssignedTo() != null && !saved.getAssignedTo().getId().equals(callerId)) {
            notificationService.send(saved.getAssignedTo().getId(), NotificationType.TICKET_STATUS_CHANGED,
                    "Ticket Reopened", "Ticket #" + saved.getId() + " was reopened and needs attention.", saved.getId(), "TICKET");
        }

        return mapToResponse(saved);
    }

    /**
     * Assign a technician to a ticket. Admin only.
     * Automatically moves status to IN_PROGRESS.
     */
    public TicketResponse assignTechnician(Long ticketId, Long technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        if (ticket.getStatus() == TicketStatus.REJECTED
                || ticket.getStatus() == TicketStatus.CLOSED
                || ticket.getStatus() == TicketStatus.RESOLVED) {
            throw new BadRequestException(
                "Cannot assign technician to ticket with status: " + ticket.getStatus());
        }

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("User", technicianId));

        User previousAssignee = ticket.getAssignedTo();
        if (previousAssignee != null && previousAssignee.getId().equals(technicianId)) {
            return mapToResponse(ticket);
        }

        // Verify the user has TECHNICIAN role
        if (technician.getRole() != Role.TECHNICIAN) {
            throw new BadRequestException(
                    "User " + technician.getName() + " is not a technician");
        }

        if (!Boolean.TRUE.equals(technician.getIsActive())) {
            throw new BadRequestException("Cannot assign inactive technician: " + technician.getName());
        }

        ticket.setAssignedTo(technician);

        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        // Track first response time
        if (ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(LocalDateTime.now());
        }

        Ticket saved = ticketRepository.save(ticket);

        // Notify user and technician
        String assignmentAction = previousAssignee == null ? "assigned" : "reassigned";
        notificationService.send(saved.getUser().getId(), NotificationType.TICKET_ASSIGNED, 
            "Technician Assigned", technician.getName() + " has been " + assignmentAction + " to your ticket.", saved.getId(), "TICKET");
        notificationService.send(technician.getId(), NotificationType.TICKET_ASSIGNED, 
            "New Ticket Assigned", "You have been assigned to Ticket #" + saved.getId(), saved.getId(), "TICKET");

        if (previousAssignee != null && !previousAssignee.getId().equals(technician.getId())) {
            notificationService.send(previousAssignee.getId(), NotificationType.TICKET_ASSIGNED,
                    "Ticket Reassigned", "Ticket #" + saved.getId() + " was reassigned to " + technician.getName() + ".",
                    saved.getId(), "TICKET");
        }

        return mapToResponse(saved);
    }

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
        response.setAuthorRole(comment.getAuthor().getRole().name());
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

    private void enforceTicketAccess(Ticket ticket, Long callerId, String callerRole) {
        boolean isAdminOrManager = "ADMIN".equals(callerRole) || "MANAGER".equals(callerRole);
        boolean isOwner = ticket.getUser().getId().equals(callerId);
        boolean isAssignedTechnician = "TECHNICIAN".equals(callerRole)
                && ticket.getAssignedTo() != null
                && ticket.getAssignedTo().getId().equals(callerId);

        if (!isAdminOrManager && !isOwner && !isAssignedTechnician) {
            throw new UnauthorizedException("You are not allowed to access this ticket");
        }
    }

    private String normalizeDescription(String rawDescription) {
        String description = rawDescription == null ? "" : rawDescription.trim();
        if (description.length() < 10) {
            throw new BadRequestException("Description must be at least 10 characters");
        }
        return description;
    }

    private String normalizeContactInfo(String rawContactInfo, TicketPriority priority) {
        String contactInfo = rawContactInfo == null ? "" : rawContactInfo.trim();

        if (contactInfo.isEmpty()) {
            if (priority == TicketPriority.HIGH || priority == TicketPriority.CRITICAL) {
                throw new BadRequestException("Contact info is required for HIGH or CRITICAL tickets");
            }
            return null;
        }

        if (contactInfo.length() > 255) {
            throw new BadRequestException("Contact info must not exceed 255 characters");
        }

        return contactInfo;
    }

    private AssigneeFilter parseAssigneeFilter(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT)
                .replace('-', '_')
                .replace(' ', '_');

        try {
            return AssigneeFilter.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid assignee value '" + value
                    + "'. Allowed values: ASSIGNED, UNASSIGNED, MINE");
        }
    }

    private ReporterFilter parseReporterFilter(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT)
                .replace('-', '_')
                .replace(' ', '_');

        try {
            return ReporterFilter.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid reporter value '" + value
                    + "'. Allowed values: MINE");
        }
    }

    private SlaStateFilter parseSlaStateFilter(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT)
                .replace('-', '_')
                .replace(' ', '_');

        try {
            return SlaStateFilter.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid slaState value '" + value
                    + "'. Allowed values: BREACHED, DUE_SOON, ON_TRACK");
        }
    }

    private LocalDateTime parseDateStart(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        try {
            return LocalDate.parse(value.trim()).atStartOfDay();
        } catch (DateTimeParseException ex) {
            throw new BadRequestException("Invalid " + fieldName
                    + " value '" + value + "'. Expected format: yyyy-MM-dd");
        }
    }

    private <E extends Enum<E>> E parseEnumIgnoreCase(String value, Class<E> enumClass, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        String normalizedValue = value.trim().toUpperCase(Locale.ROOT);
        try {
            return Enum.valueOf(enumClass, normalizedValue);
        } catch (IllegalArgumentException ex) {
            String allowed = Arrays.stream(enumClass.getEnumConstants())
                    .map(Enum::name)
                    .collect(Collectors.joining(", "));
            throw new BadRequestException("Invalid " + fieldName + " value '" + value + "'. Allowed values: " + allowed);
        }
    }
}

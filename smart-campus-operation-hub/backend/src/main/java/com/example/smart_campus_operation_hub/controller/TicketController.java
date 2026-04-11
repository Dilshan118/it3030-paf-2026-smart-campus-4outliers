package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.service.TicketService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * MEMBER 3: Ticket Controller
 * Base path: /api/v1/tickets
 *
 * TODO: Implement all endpoints
 */
@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final com.example.smart_campus_operation_hub.service.FileStorageService fileStorageService;
    private final com.example.smart_campus_operation_hub.repository.TicketRepository ticketRepository;
    private final com.example.smart_campus_operation_hub.repository.AttachmentRepository attachmentRepository;

    public TicketController(TicketService ticketService,
                            com.example.smart_campus_operation_hub.service.FileStorageService fileStorageService,
                            com.example.smart_campus_operation_hub.repository.TicketRepository ticketRepository,
                            com.example.smart_campus_operation_hub.repository.AttachmentRepository attachmentRepository) {
        this.ticketService = ticketService;
        this.fileStorageService = fileStorageService;
        this.ticketRepository = ticketRepository;
        this.attachmentRepository = attachmentRepository;
    }

    /**
     * Get all tickets. Role-based filtering handled by service.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getAllTickets(org.springframework.data.domain.Pageable pageable) {
        // TODO: Replace with actual logged-in user details
        Long userId = 1L;
        String role = "USER";

        org.springframework.data.domain.Page<com.example.smart_campus_operation_hub.dto.response.TicketResponse> response =
                ticketService.getAllTickets(userId, role, pageable);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get a specific ticket by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getTicketById(@PathVariable Long id) {
        com.example.smart_campus_operation_hub.dto.response.TicketResponse response = ticketService.getTicketById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    /**
     * Create a new ticket.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createTicket(
            @jakarta.validation.Valid @RequestBody com.example.smart_campus_operation_hub.dto.request.TicketRequest request) {

        // TODO: Replace with actual logged-in user ID from SecurityContext
        Long userId = 1L;

        com.example.smart_campus_operation_hub.dto.response.TicketResponse response =
                ticketService.createTicket(request, userId);

        return ResponseEntity.status(201).body(ApiResponse.success(response));
    }

    /**
     * Update an existing ticket.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> updateTicket(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody com.example.smart_campus_operation_hub.dto.request.TicketRequest request) {

        // TODO: Replace with actual logged-in user ID
        Long userId = 1L;

        com.example.smart_campus_operation_hub.dto.response.TicketResponse response =
                ticketService.updateTicket(id, request, userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Update ticket status.
     * Note: Expects resolutionNotes and rejectionReason optionally as request params.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Object>> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam com.example.smart_campus_operation_hub.enums.TicketStatus status,
            @RequestParam(required = false) String resolutionNotes,
            @RequestParam(required = false) String rejectionReason) {

        com.example.smart_campus_operation_hub.dto.response.TicketResponse response =
                ticketService.updateTicketStatus(id, status, resolutionNotes, rejectionReason);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Assign a technician to a ticket. (Admin only)
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<Object>> assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId) {

        // TODO: Enforce ADMIN role check via Security/PreAuthorize annotations
        com.example.smart_campus_operation_hub.dto.response.TicketResponse response =
                ticketService.assignTechnician(id, technicianId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Upload an image attachment. Max 3 per ticket.
     */
    @PostMapping("/{id}/attachments")
    public ResponseEntity<ApiResponse<Object>> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        com.example.smart_campus_operation_hub.model.Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new com.example.smart_campus_operation_hub.exception.ResourceNotFoundException("Ticket", id));

        // Enforce max 3 limit
        if (ticket.getAttachments().size() >= 3) {
            throw new com.example.smart_campus_operation_hub.exception.BadRequestException("Maximum of 3 attachments allowed per ticket");
        }

        fileStorageService.validateFile(file);
        String fileUrl = fileStorageService.storeFile(file);

        com.example.smart_campus_operation_hub.model.Attachment attachment = new com.example.smart_campus_operation_hub.model.Attachment();
        attachment.setTicket(ticket);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileUrl(fileUrl);
        attachment.setFileSize(file.getSize());
        attachment.setContentType(file.getContentType());

        com.example.smart_campus_operation_hub.model.Attachment saved = attachmentRepository.save(attachment);

        com.example.smart_campus_operation_hub.dto.response.AttachmentResponse response = new com.example.smart_campus_operation_hub.dto.response.AttachmentResponse();
        response.setId(saved.getId());
        response.setFileName(saved.getFileName());
        response.setFileUrl(saved.getFileUrl());
        response.setFileSize(saved.getFileSize());
        response.setContentType(saved.getContentType());
        response.setCreatedAt(saved.getCreatedAt());

        return ResponseEntity.status(201).body(ApiResponse.success(response));
    }
    /**
     * Delete an attachment from a ticket.
     */
    @DeleteMapping("/{id}/attachments/{aid}")
    public ResponseEntity<ApiResponse<Object>> deleteAttachment(
            @PathVariable Long id,
            @PathVariable Long aid) {

        com.example.smart_campus_operation_hub.model.Attachment attachment = attachmentRepository.findById(aid)
                .orElseThrow(() -> new com.example.smart_campus_operation_hub.exception.ResourceNotFoundException("Attachment", aid));

        // Ensure attachment belongs to the ticket to prevent cross-ticket deletions
        if (!attachment.getTicket().getId().equals(id)) {
            throw new com.example.smart_campus_operation_hub.exception.BadRequestException("Attachment does not belong to the specified ticket");
        }

        // Delete from disk
        fileStorageService.deleteFile(attachment.getFileUrl());

        // Delete from database
        attachmentRepository.delete(attachment);

        return ResponseEntity.noContent().build();
    }
}

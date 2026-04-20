package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.service.TicketService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getAllTickets(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            org.springframework.data.domain.Pageable pageable) {

        Long userId = (Long) authentication.getPrincipal();
        String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        org.springframework.data.domain.Page<com.example.smart_campus_operation_hub.dto.response.TicketResponse> response =
                ticketService.getAllTickets(userId, role, status, priority, category, pageable);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getTicketById(
            Authentication authentication,
            @PathVariable Long id) {

        Long callerId = (Long) authentication.getPrincipal();
        String callerRole = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        com.example.smart_campus_operation_hub.dto.response.TicketResponse response =
                ticketService.getTicketById(id, callerId, callerRole);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createTicket(
            Authentication authentication,
            @jakarta.validation.Valid @RequestBody com.example.smart_campus_operation_hub.dto.request.TicketRequest request) {

        Long userId = (Long) authentication.getPrincipal();
        com.example.smart_campus_operation_hub.dto.response.TicketResponse response =
                ticketService.createTicket(request, userId);

        return ResponseEntity.status(201).body(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> updateTicket(
            Authentication authentication,
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody com.example.smart_campus_operation_hub.dto.request.TicketRequest request) {

        Long userId = (Long) authentication.getPrincipal();
        com.example.smart_campus_operation_hub.dto.response.TicketResponse response =
                ticketService.updateTicket(id, request, userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteTicket(Authentication authentication,
                                                             @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        String callerRole = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        ticketService.deleteTicket(id, userId, callerRole);
        return ResponseEntity.ok(ApiResponse.success("Ticket deleted successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','TECHNICIAN')")
    public ResponseEntity<ApiResponse<Object>> updateTicketStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam com.example.smart_campus_operation_hub.enums.TicketStatus status,
            @RequestParam(required = false) String resolutionNotes,
            @RequestParam(required = false) String rejectionReason) {

        Long callerId = (Long) authentication.getPrincipal();
        String callerRole = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        com.example.smart_campus_operation_hub.dto.response.TicketResponse response =
                ticketService.updateTicketStatus(id, status, resolutionNotes, rejectionReason, callerId, callerRole);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Object>> assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId) {

        com.example.smart_campus_operation_hub.dto.response.TicketResponse response =
                ticketService.assignTechnician(id, technicianId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<ApiResponse<Object>> uploadAttachment(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Long callerId = (Long) authentication.getPrincipal();
        String callerRole = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        com.example.smart_campus_operation_hub.model.Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new com.example.smart_campus_operation_hub.exception.ResourceNotFoundException("Ticket", id));

        boolean isAdminOrManager = "ADMIN".equals(callerRole) || "MANAGER".equals(callerRole);
        boolean isOwner = ticket.getUser().getId().equals(callerId);
        boolean isAssignedTechnician = "TECHNICIAN".equals(callerRole)
                && ticket.getAssignedTo() != null
                && ticket.getAssignedTo().getId().equals(callerId);

        if (!isAdminOrManager && !isOwner && !isAssignedTechnician) {
            throw new com.example.smart_campus_operation_hub.exception.UnauthorizedException(
                    "You are not allowed to modify attachments for this ticket");
        }

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

    @DeleteMapping("/{id}/attachments/{aid}")
    public ResponseEntity<ApiResponse<Object>> deleteAttachment(
            Authentication authentication,
            @PathVariable Long id,
            @PathVariable Long aid) {

        Long callerId = (Long) authentication.getPrincipal();
        String callerRole = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        com.example.smart_campus_operation_hub.model.Attachment attachment = attachmentRepository.findById(aid)
                .orElseThrow(() -> new com.example.smart_campus_operation_hub.exception.ResourceNotFoundException("Attachment", aid));

        if (!attachment.getTicket().getId().equals(id)) {
            throw new com.example.smart_campus_operation_hub.exception.BadRequestException("Attachment does not belong to the specified ticket");
        }

        com.example.smart_campus_operation_hub.model.Ticket ticket = attachment.getTicket();
        boolean isAdminOrManager = "ADMIN".equals(callerRole) || "MANAGER".equals(callerRole);
        boolean isOwner = ticket.getUser().getId().equals(callerId);
        boolean isAssignedTechnician = "TECHNICIAN".equals(callerRole)
                && ticket.getAssignedTo() != null
                && ticket.getAssignedTo().getId().equals(callerId);

        if (!isAdminOrManager && !isOwner && !isAssignedTechnician) {
            throw new com.example.smart_campus_operation_hub.exception.UnauthorizedException(
                    "You are not allowed to delete attachments for this ticket");
        }

        fileStorageService.deleteFile(attachment.getFileUrl());
        attachmentRepository.delete(attachment);

        return ResponseEntity.noContent().build();
    }
}

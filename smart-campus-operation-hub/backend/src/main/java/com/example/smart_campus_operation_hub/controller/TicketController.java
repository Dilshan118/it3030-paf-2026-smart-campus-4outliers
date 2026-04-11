package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.service.TicketService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
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

    // TODO: POST   /{id}/attachments          → Upload images (max 3)
    // TODO: DELETE /{id}/attachments/{aid}     → Remove attachment
}

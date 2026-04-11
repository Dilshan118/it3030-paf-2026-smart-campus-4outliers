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

    // TODO: GET    /                          → List tickets (own for USER, all for ADMIN)
    // TODO: GET    /{id}                      → Get ticket with comments & attachments
    // TODO: POST   /                          → Create ticket
    // TODO: PUT    /{id}                      → Update ticket (owner only, while OPEN)
    // TODO: PATCH  /{id}/status               → Update ticket status (TECHNICIAN, ADMIN)
    // TODO: PATCH  /{id}/assign               → Assign technician (ADMIN)
    // TODO: POST   /{id}/attachments          → Upload images (max 3)
    // TODO: DELETE /{id}/attachments/{aid}     → Remove attachment
}

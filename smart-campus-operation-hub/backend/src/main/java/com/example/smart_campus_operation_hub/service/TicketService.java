package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.repository.TicketRepository;
import org.springframework.stereotype.Service;

/**
 * MEMBER 3: Ticket Service
 * TODO: Implement ticket CRUD, status transitions, technician assignment
 */
@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    // TODO: getAllTickets(Pageable pageable) — user sees own, admin sees all
    // TODO: getTicketById(Long id) — include comments & attachments
    // TODO: createTicket(TicketRequest request, Long userId)
    // TODO: updateTicket(Long id, TicketRequest request)
    // TODO: updateTicketStatus(Long id, TicketStatus newStatus) — validate transitions
    // TODO: assignTechnician(Long ticketId, Long technicianId)
    // TODO: addResolutionNotes(Long id, String notes)
}

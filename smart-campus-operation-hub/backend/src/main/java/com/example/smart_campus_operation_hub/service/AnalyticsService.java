package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.enums.TicketStatus;
import com.example.smart_campus_operation_hub.repository.ResourceRepository;
import com.example.smart_campus_operation_hub.repository.TicketRepository;
import com.example.smart_campus_operation_hub.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Unassigned: Analytics Service
 */
@Service
public class AnalyticsService {

    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;

    public AnalyticsService(TicketRepository ticketRepository,
                            ResourceRepository resourceRepository,
                            BookingRepository bookingRepository) {
        this.ticketRepository = ticketRepository;
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
    }

    public Map<String, Object> getDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // Ticket Metrics
        long totalTickets = ticketRepository.count();
        long openTickets = ticketRepository.countByStatus(TicketStatus.OPEN);
        long resolvedTickets = ticketRepository.countByStatus(TicketStatus.RESOLVED);

        metrics.put("totalTickets", totalTickets);
        metrics.put("openTickets", openTickets);
        metrics.put("resolvedTickets", resolvedTickets);

        // Resource Metrics
        long totalResources = resourceRepository.count();
        metrics.put("totalResources", totalResources);

        // Booking Metrics
        long totalBookings = bookingRepository.count();
        metrics.put("totalBookings", totalBookings);

        return metrics;
    }
}

package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.service.BookingService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * MEMBER 2: Booking Controller
 * Base path: /api/v1/bookings
 *
 * TODO: Implement all endpoints
 */
@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // TODO: GET    /                 → List bookings (own for USER, all for ADMIN)
    // TODO: GET    /{id}             → Get booking by ID
    // TODO: POST   /                 → Create booking (with conflict check)
    // TODO: PUT    /{id}             → Update booking (only if PENDING)
    // TODO: DELETE /{id}             → Cancel booking
    // TODO: PATCH  /{id}/approve     → Approve booking (Admin)
    // TODO: PATCH  /{id}/reject      → Reject booking with reason (Admin)
    // TODO: GET    /{id}/qr          → Get QR code for approved booking
    // TODO: GET    /conflicts        → Check for conflicts
}

package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.repository.BookingRepository;
import com.example.smart_campus_operation_hub.repository.ResourceRepository;
import org.springframework.stereotype.Service;

/**
 * MEMBER 2: Booking Service
 * TODO: Implement booking CRUD, conflict detection, approval workflow
 */
@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    // TODO: getAllBookings(Pageable pageable) — user sees own, admin sees all
    // TODO: getBookingById(Long id)
    // TODO: createBooking(BookingRequest request, Long userId) — with conflict check
    // TODO: updateBooking(Long id, BookingRequest request)
    // TODO: cancelBooking(Long id)
    // TODO: approveBooking(Long id) — Admin only
    // TODO: rejectBooking(Long id, String reason) — Admin only
    // TODO: checkConflicts(Long resourceId, LocalDate date, LocalTime start, LocalTime end)
    // TODO: generateQrCode(Long id)
}

package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.dto.request.BookingRequest;
import com.example.smart_campus_operation_hub.dto.response.BookingResponse;
import com.example.smart_campus_operation_hub.enums.BookingStatus;
import com.example.smart_campus_operation_hub.enums.ResourceStatus;
import com.example.smart_campus_operation_hub.model.Booking;
import com.example.smart_campus_operation_hub.model.Resource;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.repository.BookingRepository;
import com.example.smart_campus_operation_hub.repository.ResourceRepository;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    // ─── Create Booking ───────────────────────────────────────────────
    public BookingResponse createBooking(BookingRequest request, Long userId) {

        // 1. Validate time range
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        long minutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (minutes < 30) {
            throw new IllegalArgumentException("Minimum booking duration is 30 minutes");
        }
        if (minutes > 480) {
            throw new IllegalArgumentException("Maximum booking duration is 8 hours");
        }

        // 2. Check resource exists and is ACTIVE
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalArgumentException("Resource is not available for booking");
        }

        // 3. Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getResourceId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime()
        );
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Booking conflict: resource is already booked for this time");
        }

        // 4. Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 5. Create and save booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setResource(resource);
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    // ─── Update Booking ───────────────────────────────────────────────
    public BookingResponse updateBooking(Long id, BookingRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Only PENDING bookings can be updated
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING bookings can be updated");
        }

        // Validate time range
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        long minutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (minutes < 30) {
            throw new IllegalArgumentException("Minimum booking duration is 30 minutes");
        }
        if (minutes > 480) {
            throw new IllegalArgumentException("Maximum booking duration is 8 hours");
        }

        // Check for conflicts (exclude current booking from check)
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getResource().getId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime()
        );
        conflicts.removeIf(b -> b.getId().equals(id)); // exclude self
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Booking conflict: resource is already booked for this time");
        }

        // Update fields
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        return toResponse(bookingRepository.save(booking));
    }

    // ─── Get All Bookings ─────────────────────────────────────────────
    public Page<BookingResponse> getAllBookings(Pageable pageable) {
        return bookingRepository.findAll(pageable).map(this::toResponse);
    }

    // ─── Get User's Own Bookings ──────────────────────────────────────
    public Page<BookingResponse> getBookingsByUser(Long userId, Pageable pageable) {
        return bookingRepository.findByUserId(userId, pageable).map(this::toResponse);
    }

    // ─── Get Booking By ID ────────────────────────────────────────────
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return toResponse(booking);
    }

    // ─── Cancel Booking ───────────────────────────────────────────────
    public BookingResponse cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.REJECTED ||
            booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking cannot be cancelled in its current state");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return toResponse(bookingRepository.save(booking));
    }

    // ─── Approve Booking (Admin) ──────────────────────────────────────
    public BookingResponse approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        return toResponse(bookingRepository.save(booking));
    }

    // ─── Reject Booking (Admin) ───────────────────────────────────────
    public BookingResponse rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(reason);
        return toResponse(bookingRepository.save(booking));
    }

    // ─── Check Conflicts ─────────────────────────────────────────────
    public boolean hasConflicts(Long resourceId, LocalDate date,
                                 LocalTime startTime, LocalTime endTime) {
        return !bookingRepository.findConflictingBookings(
                resourceId, date, startTime, endTime).isEmpty();
    }

    // ─── Map Booking to Response ──────────────────────────────────────
    private BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setResourceId(booking.getResource().getId());
        response.setResourceName(booking.getResource().getName());
        response.setResourceLocation(booking.getResource().getLocation());
        response.setUserId(booking.getUser().getId());
        response.setUserName(booking.getUser().getName());
        response.setDate(booking.getDate());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setPurpose(booking.getPurpose());
        response.setExpectedAttendees(booking.getExpectedAttendees());
        response.setStatus(booking.getStatus());
        response.setAdminReason(booking.getAdminReason());
        response.setQrCode(booking.getQrCode());
        response.setCheckedInAt(booking.getCheckedInAt());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}
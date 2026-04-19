package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.dto.request.BookingRequest;
import com.example.smart_campus_operation_hub.dto.response.BookingResponse;
import com.example.smart_campus_operation_hub.service.BookingService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // POST / → Create booking
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request) {

        // TODO: Replace with actual logged-in user ID/role from SecurityContext
        Long userId = 1L;

        BookingResponse response = bookingService.createBooking(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Booking created successfully"));
    }

    // GET / → List bookings (own for USER, all for ADMIN)
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookings(
            Pageable pageable) {

        // TODO: Replace with actual logged-in user details
        Long userId = 1L;
        String role = "USER";

        Page<BookingResponse> bookings;
        switch (role) {
            case "ADMIN", "MANAGER" -> bookings = bookingService.getAllBookings(pageable);
            default -> bookings = bookingService.getBookingsByUser(userId, pageable);
        }

        return ResponseEntity.ok(ApiResponse.success(bookings, "Bookings retrieved successfully"));
    }

    // GET /{id} → Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        BookingResponse response = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking retrieved successfully"));
    }

    // PUT /{id} → Update booking (only if PENDING)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingRequest request) {

        // TODO: Replace with actual logged-in user details
        Long userId = 1L;

        BookingResponse response = bookingService.updateBooking(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking updated successfully"));
    }

    // DELETE /{id} → Cancel booking
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(@PathVariable Long id) {

        // TODO: Replace with actual logged-in user details
        Long userId = 1L;
        String role = "USER";

        BookingResponse response = bookingService.cancelBooking(id, userId, role);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking cancelled successfully"));
    }

    // PATCH /{id}/approve → Approve booking (Admin)
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<BookingResponse>> approveBooking(@PathVariable Long id) {
        BookingResponse response = bookingService.approveBooking(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking approved successfully"));
    }

    // PATCH /{id}/reject → Reject booking with reason (Admin)
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(
            @PathVariable Long id,
            @RequestParam String reason) {
        BookingResponse response = bookingService.rejectBooking(id, reason);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking rejected successfully"));
    }

    // GET /conflicts → Check for conflicts
    @GetMapping("/conflicts")
    public ResponseEntity<ApiResponse<Boolean>> checkConflicts(
            @RequestParam Long resourceId,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        boolean hasConflict = bookingService.hasConflicts(
                resourceId,
                LocalDate.parse(date),
                LocalTime.parse(startTime),
                LocalTime.parse(endTime)
        );
        return ResponseEntity.ok(ApiResponse.success(hasConflict, "Conflict check completed"));
    }
}

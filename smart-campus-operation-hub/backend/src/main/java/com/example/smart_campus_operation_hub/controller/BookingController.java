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
            @Valid @RequestBody BookingRequest request,
            @RequestParam Long userId) {
        BookingResponse response = bookingService.createBooking(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Booking created successfully"));
    }

    // GET / → List bookings (own for USER, all for ADMIN)
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookings(
            @RequestParam(required = false) Long userId,
            Pageable pageable) {
        Page<BookingResponse> bookings;
        if (userId != null) {
            bookings = bookingService.getBookingsByUser(userId, pageable);
        } else {
            bookings = bookingService.getAllBookings(pageable);
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
        BookingResponse response = bookingService.updateBooking(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking updated successfully"));
    }

    // DELETE /{id} → Cancel booking
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(@PathVariable Long id) {
        BookingResponse response = bookingService.cancelBooking(id);
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
                java.time.LocalDate.parse(date),
                java.time.LocalTime.parse(startTime),
                java.time.LocalTime.parse(endTime)
        );
        return ResponseEntity.ok(ApiResponse.success(hasConflict, "Conflict check completed"));
    }
}
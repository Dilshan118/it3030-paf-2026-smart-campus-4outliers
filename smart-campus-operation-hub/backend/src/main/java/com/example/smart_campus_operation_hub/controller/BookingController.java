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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            Authentication authentication,
            @Valid @RequestBody BookingRequest request) {

        Long userId = (Long) authentication.getPrincipal();
        BookingResponse response = bookingService.createBooking(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Booking created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookings(
            Authentication authentication,
            Pageable pageable) {

        Long userId = (Long) authentication.getPrincipal();
        String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        Page<BookingResponse> bookings;
        if (role.equals("ADMIN") || role.equals("MANAGER")) {
            bookings = bookingService.getAllBookings(pageable);
        } else {
            bookings = bookingService.getBookingsByUser(userId, pageable);
        }

        return ResponseEntity.ok(ApiResponse.success(bookings, "Bookings retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            Authentication authentication,
            @PathVariable Long id) {

        Long userId = (Long) authentication.getPrincipal();
        String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        BookingResponse response = bookingService.getBookingById(id, userId, role);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking retrieved successfully"));
    }

    @GetMapping("/{id}/qr")
    public ResponseEntity<ApiResponse<String>> getBookingQr(
            Authentication authentication,
            @PathVariable Long id) {

        Long userId = (Long) authentication.getPrincipal();
        String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        String qrCode = bookingService.getBookingQr(id, userId, role);
        return ResponseEntity.ok(ApiResponse.success(qrCode, "Booking QR retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBooking(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody BookingRequest request) {

        Long userId = (Long) authentication.getPrincipal();
        BookingResponse response = bookingService.updateBooking(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            Authentication authentication,
            @PathVariable Long id) {

        Long userId = (Long) authentication.getPrincipal();
        String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        BookingResponse response = bookingService.cancelBooking(id, userId, role);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking cancelled successfully"));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<BookingResponse>> approveBooking(@PathVariable Long id) {
        BookingResponse response = bookingService.approveBooking(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking approved successfully"));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(
            @PathVariable Long id,
            @RequestParam String reason) {
        BookingResponse response = bookingService.rejectBooking(id, reason);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking rejected successfully"));
    }

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

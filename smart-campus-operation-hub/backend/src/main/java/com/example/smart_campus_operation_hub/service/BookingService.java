package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.dto.request.BookingRequest;
import com.example.smart_campus_operation_hub.dto.response.BookingResponse;
import com.example.smart_campus_operation_hub.enums.BookingStatus;
import com.example.smart_campus_operation_hub.enums.ResourceStatus;
import com.example.smart_campus_operation_hub.exception.BadRequestException;
import com.example.smart_campus_operation_hub.exception.ResourceNotFoundException;
import com.example.smart_campus_operation_hub.exception.UnauthorizedException;
import com.example.smart_campus_operation_hub.model.Booking;
import com.example.smart_campus_operation_hub.model.Resource;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.repository.BookingRepository;
import com.example.smart_campus_operation_hub.repository.ResourceRepository;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.example.smart_campus_operation_hub.enums.NotificationType;
import com.example.smart_campus_operation_hub.enums.Role;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // ─── Create Booking ───────────────────────────────────────────────
    public BookingResponse createBooking(BookingRequest request, Long userId) {

        // 1. Validate time range
        validateTimeRange(request.getStartTime(), request.getEndTime());

        // 2. Check resource exists and is ACTIVE
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new BadRequestException("Resource is not available for booking");
        }

        // 3. Validate attendees based on resource type
        validateAttendees(resource, request.getExpectedAttendees());

        // 4. Check attendees doesn't exceed capacity
        validateCapacity(resource, request.getExpectedAttendees());

        // 5. Check booking time falls within availability windows
        validateAvailability(resource, request.getDate(), request.getStartTime(), request.getEndTime());

        // 6. Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getResourceId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime()
        );
        if (!conflicts.isEmpty()) {
            throw new BadRequestException("Booking conflict: resource is already booked for this time");
        }

        // 7. Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // 8. Create and save booking
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

        // 9. Send Notification to creator
        notificationService.send(
                userId,
                NotificationType.BOOKING_CREATED,
                "Booking Requested: " + resource.getName(),
                "Your booking for " + resource.getName() + " on " + request.getDate() + " is pending approval.",
                saved.getId(),
                "BOOKING"
        );

        // 10. Notify all active admins and managers
        List<User> reviewers = new ArrayList<>();
        reviewers.addAll(userRepository.findByRoleAndIsActiveTrue(Role.ADMIN));
        reviewers.addAll(userRepository.findByRoleAndIsActiveTrue(Role.MANAGER));
        for (User reviewer : reviewers) {
            if (reviewer.getId().equals(userId)) continue;
            try {
                notificationService.send(reviewer.getId(), NotificationType.BOOKING_CREATED,
                        "New Booking Request",
                        user.getName() + " requested \"" + resource.getName() + "\" on " + request.getDate(),
                        saved.getId(), "BOOKING");
            } catch (Exception e) {
                System.err.println("[BookingService] Failed to notify reviewer " + reviewer.getEmail() + ": " + e.getMessage());
            }
        }

        return toResponse(saved);
    }

    // ─── Update Booking ───────────────────────────────────────────────
    public BookingResponse updateBooking(Long id, BookingRequest request, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (!booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own bookings");
        }

        // Only PENDING bookings can be updated
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be updated");
        }

        // 1. Validate time range
        validateTimeRange(request.getStartTime(), request.getEndTime());

        // 2. Get resource for validation
        Resource resource = booking.getResource();

        // 3. Validate attendees based on resource type
        validateAttendees(resource, request.getExpectedAttendees());

        // 4. Check attendees doesn't exceed capacity
        validateCapacity(resource, request.getExpectedAttendees());

        // 5. Check booking time falls within availability windows
        validateAvailability(resource, request.getDate(), request.getStartTime(), request.getEndTime());

        // 6. Check for conflicts (exclude current booking from check)
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resource.getId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime()
        );
        conflicts.removeIf(b -> b.getId().equals(id)); // exclude self
        if (!conflicts.isEmpty()) {
            throw new BadRequestException("Booking conflict: resource is already booked for this time");
        }

        // 7. Update fields
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        return toResponse(bookingRepository.save(booking));
    }

    // ─── Get All Bookings (admin) ─────────────────────────────────────
    public Page<BookingResponse> getAllBookings(BookingStatus status, LocalDate date, Pageable pageable) {
        if (status != null && date != null) {
            return bookingRepository.findByStatusAndDate(status, date, pageable).map(this::toResponse);
        } else if (status != null) {
            return bookingRepository.findByStatus(status, pageable).map(this::toResponse);
        } else if (date != null) {
            return bookingRepository.findByDate(date, pageable).map(this::toResponse);
        }
        return bookingRepository.findAll(pageable).map(this::toResponse);
    }

    // ─── Get User's Own Bookings ──────────────────────────────────────
    public Page<BookingResponse> getBookingsByUser(Long userId, BookingStatus status, LocalDate date, Pageable pageable) {
        if (status != null && date != null) {
            return bookingRepository.findByUserIdAndStatusAndDate(userId, status, date, pageable).map(this::toResponse);
        } else if (status != null) {
            return bookingRepository.findByUserIdAndStatus(userId, status, pageable).map(this::toResponse);
        } else if (date != null) {
            return bookingRepository.findByUserIdAndDate(userId, date, pageable).map(this::toResponse);
        }
        return bookingRepository.findByUserId(userId, pageable).map(this::toResponse);
    }

    // ─── Get Booking By ID ────────────────────────────────────────────
    public BookingResponse getBookingById(Long id, Long callerId, String callerRole) {
        Booking booking = getAccessibleBooking(id, callerId, callerRole);
        return toResponse(booking);
    }

    // ─── Get Booking QR ───────────────────────────────────────────────
    public String getBookingQr(Long id, Long callerId, String callerRole) {
        Booking booking = getAccessibleBooking(id, callerId, callerRole);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("QR code is available only for APPROVED bookings");
        }

        if (booking.getQrCode() == null || booking.getQrCode().isBlank()) {
            booking.setQrCode(generateQrCode(booking));
            booking = bookingRepository.save(booking);
        }

        return booking.getQrCode();
    }

    // ─── Cancel Booking ───────────────────────────────────────────────
    public BookingResponse cancelBooking(Long id, Long userId, String role, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        boolean isAdmin = "ADMIN".equals(role) || "MANAGER".equals(role);
        if (!booking.getUser().getId().equals(userId) && !isAdmin) {
            throw new UnauthorizedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.REJECTED ||
            booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking cannot be cancelled in its current state");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        if (reason != null && !reason.isBlank()) {
            booking.setAdminReason(reason);
        }

        Booking saved = bookingRepository.save(booking);

        notificationService.send(
                saved.getUser().getId(),
                NotificationType.BOOKING_CANCELLED,
                "Booking Cancelled",
                "Your booking for " + saved.getResource().getName() + " on " + saved.getDate() + " was cancelled.",
                saved.getId(),
                "BOOKING"
        );

        return toResponse(saved);
    }

    // ─── Approve Booking (Admin) ──────────────────────────────────────
    public BookingResponse approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);

        // Generate QR code string
        String qrCode = generateQrCode(booking);
        booking.setQrCode(qrCode);

        Booking saved = bookingRepository.save(booking);

        notificationService.send(
                saved.getUser().getId(),
                NotificationType.BOOKING_APPROVED,
                "Booking Approved",
                "Your booking for " + saved.getResource().getName() + " on " + saved.getDate() + " has been approved.",
                saved.getId(),
                "BOOKING"
        );

        return toResponse(saved);
    }

    // ─── Reject Booking (Admin) ───────────────────────────────────────
    public BookingResponse rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(reason);

        Booking saved = bookingRepository.save(booking);

        notificationService.send(
                saved.getUser().getId(),
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                "Your booking for " + saved.getResource().getName() + " on " + saved.getDate() + " was rejected. Reason: " + reason,
                saved.getId(),
                "BOOKING"
        );

        return toResponse(saved);
    }

    private Booking getAccessibleBooking(Long id, Long callerId, String callerRole) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        boolean isAdminOrManager = "ADMIN".equals(callerRole) || "MANAGER".equals(callerRole);
        if (!isAdminOrManager && !booking.getUser().getId().equals(callerId)) {
            throw new UnauthorizedException("You can only view your own bookings");
        }

        return booking;
    }

    // ─── Check Conflicts ─────────────────────────────────────────────
    public boolean hasConflicts(Long resourceId, LocalDate date,
                                 LocalTime startTime, LocalTime endTime) {
        return !bookingRepository.findConflictingBookings(
                resourceId, date, startTime, endTime).isEmpty();
    }

    // ═══════════════════════════════════════════════════════════════════
    // PRIVATE HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════

    // ─── Validate Time Range ──────────────────────────────────────────
    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("End time must be after start time");
        }

        long minutes = Duration.between(startTime, endTime).toMinutes();
        if (minutes < 30) {
            throw new BadRequestException("Minimum booking duration is 30 minutes");
        }
        if (minutes > 480) {
            throw new BadRequestException("Maximum booking duration is 8 hours");
        }
    }

    // ─── Validate Attendees Based on Resource Type ────────────────────
    private void validateAttendees(Resource resource, Integer expectedAttendees) {
        String resourceType = resource.getType().name();

        if (resourceType.equals("EQUIPMENT")) {
            // Equipment doesn't need attendees count
            if (expectedAttendees != null && expectedAttendees > 0) {
                throw new BadRequestException("Equipment bookings don't require attendees count");
            }
        } else {
            // LAB, LECTURE_HALL, MEETING_ROOM require attendees
            if (expectedAttendees == null || expectedAttendees < 1) {
                throw new BadRequestException("Expected attendees is required for " + resourceType);
            }
        }
    }

    // ─── Validate Capacity ────────────────────────────────────────────
    private void validateCapacity(Resource resource, Integer expectedAttendees) {
        if (expectedAttendees != null && resource.getCapacity() != null) {
            if (expectedAttendees > resource.getCapacity()) {
                throw new BadRequestException(
                    "Expected attendees (" + expectedAttendees +
                    ") exceeds resource capacity (" + resource.getCapacity() + ")"
                );
            }
        }
    }

    // ─── Validate Availability Windows ────────────────────────────────
    private void validateAvailability(Resource resource, LocalDate date,
                                       LocalTime startTime, LocalTime endTime) {
        String availabilityWindows = resource.getAvailabilityWindows();
        if (availabilityWindows != null && !availabilityWindows.isEmpty()) {
            if (!isWithinAvailability(date, startTime, endTime, availabilityWindows)) {
                throw new BadRequestException("Booking time is outside resource availability hours");
            }
        }
    }

    // ─── Check Availability Windows ───────────────────────────────────
    private boolean isWithinAvailability(LocalDate date, LocalTime startTime,
                                          LocalTime endTime, String availabilityJson) {
        try {
            // Get day of week (e.g., "mon", "tue", etc.)
            String dayOfWeek = date.getDayOfWeek().name().substring(0, 3).toLowerCase();

            // Parse JSON like {"mon":"09:00-17:00","tue":"09:00-17:00"}
            if (!availabilityJson.contains(dayOfWeek)) {
                return false; // Resource not available on this day
            }

            // Extract time range for this day
            int dayIndex = availabilityJson.indexOf(dayOfWeek);
            int colonIndex = availabilityJson.indexOf(":", dayIndex);
            int startQuote = availabilityJson.indexOf("\"", colonIndex);
            int endQuote = availabilityJson.indexOf("\"", startQuote + 1);

            String timeRange = availabilityJson.substring(startQuote + 1, endQuote);
            String[] times = timeRange.split("-");

            LocalTime availStart = LocalTime.parse(times[0]);
            LocalTime availEnd = LocalTime.parse(times[1]);

            // Check if booking falls within availability
            return !startTime.isBefore(availStart) && !endTime.isAfter(availEnd);

        } catch (Exception e) {
            // If parsing fails, allow the booking (fail open)
            return true;
        }
    }

    // ─── Generate QR Code ─────────────────────────────────────────────
    private String generateQrCode(Booking booking) {
        return String.format("BOOKING-%d-%s-%s-%s-%s",
                booking.getId(),
                booking.getResource().getId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );
    }

    // ─── Map Booking to Response ──────────────────────────────────────
    private BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setResourceId(booking.getResource().getId());
        response.setResourceName(booking.getResource().getName());
        response.setResourceLocation(booking.getResource().getLocation());
        response.setResourceType(booking.getResource().getType().name());
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

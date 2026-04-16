package com.example.smart_campus_operation_hub.service;

<<<<<<< HEAD
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
=======
>>>>>>> parent of 63edba2 (Merge pull request #10 from Dilshan118/feature/module-b-booking-management)
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

<<<<<<< HEAD
    // ─── Create Booking ───────────────────────────────────────────────
    public BookingResponse createBooking(BookingRequest request, Long userId) {

        // 1. Validate time range
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        long minutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (minutes < 30) {
            throw new BadRequestException("Minimum booking duration is 30 minutes");
        }
        if (minutes > 480) {
            throw new BadRequestException("Maximum booking duration is 8 hours");
        }

        // 2. Check resource exists and is ACTIVE
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new BadRequestException("Resource is not available for booking");
        }

        // 3. Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getResourceId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime()
        );
        if (!conflicts.isEmpty()) {
            throw new BadRequestException("Booking conflict: resource is already booked for this time");
        }

        // 4. Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

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

        // Validate time range
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        long minutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (minutes < 30) {
            throw new BadRequestException("Minimum booking duration is 30 minutes");
        }
        if (minutes > 480) {
            throw new BadRequestException("Maximum booking duration is 8 hours");
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
            throw new BadRequestException("Booking conflict: resource is already booked for this time");
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
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
        return toResponse(booking);
    }

    // ─── Cancel Booking ───────────────────────────────────────────────
    public BookingResponse cancelBooking(Long id, Long userId, String role) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        boolean isAdmin = role.equals("ADMIN") || role.equals("MANAGER");
        if (!booking.getUser().getId().equals(userId) && !isAdmin) {
            throw new UnauthorizedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.REJECTED ||
            booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking cannot be cancelled in its current state");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return toResponse(bookingRepository.save(booking));
    }

    // ─── Approve Booking (Admin) ──────────────────────────────────────
    public BookingResponse approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        return toResponse(bookingRepository.save(booking));
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
=======
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
>>>>>>> parent of 63edba2 (Merge pull request #10 from Dilshan118/feature/module-b-booking-management)

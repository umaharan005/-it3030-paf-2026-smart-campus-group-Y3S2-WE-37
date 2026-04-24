package com.smartcampus.hub.service.booking;

import com.smartcampus.hub.entity.booking.Booking;
import com.smartcampus.hub.entity.catalogue.Resource;
import com.smartcampus.hub.entity.notifications.Notification;
import com.smartcampus.hub.enums.Role;
import com.smartcampus.hub.enums.booking.BookingStatus;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.repository.booking.BookingRepository;
import com.smartcampus.hub.repository.catalogue.ResourceRepository;
import com.smartcampus.hub.service.notifications.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class BookingService {
    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public BookingService(UserRepository userRepository,
                          BookingRepository bookingRepository,
                          ResourceRepository resourceRepository,
                          NotificationService notificationService) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
    }

    public Booking createBooking(Booking booking) {
        Resource resource = resourceRepository.findById(booking.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        validateBooking(booking, resource);

        // Set resource details on booking for easier UI display

        // Set resource details on booking for easier UI display
        booking.setResourceName(resource.getName());
        booking.setResourceType(resource.getType() != null ? resource.getType().name() : "RESOURCE");
        booking.setResourceCapacity(resource.getCapacity());
        booking.setMinAttendeesConstraint(resource.getMinAttendees());
        booking.setMaxAttendeesConstraint(resource.getMaxAttendees());
        
        String loc = (resource.getBuilding() != null ? resource.getBuilding() : "") + 
                    (resource.getFloor() != null ? ", " + resource.getFloor() : "") + 
                    (resource.getRoomCode() != null ? " [" + resource.getRoomCode() + "]" : "");
        booking.setResourceLocation(loc.trim().startsWith(",") ? loc.trim().substring(1).trim() : loc.trim());

        booking.setStatus(BookingStatus.PENDING);
        Booking saved = bookingRepository.save(booking);

        // Notify user
        notificationService.sendToUser(saved.getUserEmail(), Notification.builder()
                .title("Booking Submitted")
                .message("Your booking for \"" + resource.getName() + "\" is pending approval.")
                .type(Notification.NotificationType.BOOKING_APPROVED)
                .relatedId(saved.getId())
                .build());

        notifyApprovers(
                findBookingApproverEmails(saved),
                "New Booking Awaiting Approval",
                "A booking for \"" + resource.getName() + "\" was submitted by " + saved.getUserEmail() + ".",
                saved.getId()
        );

        return saved;
    }

    public List<Booking> getMyBookings(String userEmail) {
        return bookingRepository.findByUserEmail(userEmail);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    /** Returns booked slots (APPROVED + PENDING) for a resource on a given date */
    public List<Booking> getBookedSlots(String resourceId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();
        return bookingRepository.findByResourceIdAndTimeRange(resourceId, start, end);
    }

    public Booking updateBookingStatus(String id, BookingStatus status, String rejectionReason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(status);
        if (status == BookingStatus.REJECTED && rejectionReason != null && !rejectionReason.isBlank()) {
            booking.setRejectionReason(rejectionReason);
        }
        Booking updated = bookingRepository.save(booking);

        String message = "Your booking for resource \"" + updated.getResourceId() + "\" has been " + status.name().toLowerCase();
        if (status == BookingStatus.REJECTED && rejectionReason != null && !rejectionReason.isBlank()) {
            message += ". Reason: " + rejectionReason;
        }
        notificationService.sendToUser(updated.getUserEmail(), Notification.builder()
                .title("Booking Status Updated")
                .message(message)
                .type(status == BookingStatus.REJECTED
                        ? Notification.NotificationType.BOOKING_REJECTED
                        : Notification.NotificationType.BOOKING_APPROVED)
                .relatedId(updated.getId())
                .build());

        return updated;
    }

    public void cancelBooking(String id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking cancelled = bookingRepository.save(booking);

        notifyApprovers(
                findBookingApproverEmails(cancelled),
                "Booking Cancelled",
                "The booking for \"" + resolveBookingResourceName(cancelled) + "\" was cancelled by " + cancelled.getUserEmail() + ".",
                cancelled.getId()
        );
    }

    public Booking updateBooking(String id, Booking updated, String userEmail) {
        Booking existing = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!existing.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized to update this booking");
        }

        if (existing.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be updated.");
        }

        Resource resource = resourceRepository.findById(existing.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        // Update fields
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setPurpose(updated.getPurpose());
        existing.setExpectedAttendees(updated.getExpectedAttendees());

        // Re-validate
        validateBooking(existing, resource);

        Booking saved = bookingRepository.save(existing);

        notifyApprovers(
                findBookingApproverEmails(saved),
                "Booking Updated",
                "The booking for \"" + resource.getName() + "\" was updated by " + saved.getUserEmail() + " and may need review.",
                saved.getId()
        );

        return saved;
    }

    private void validateBooking(Booking booking, Resource resource) {
        if (resource.getStatus() != null && !"ACTIVE".equals(resource.getStatus().name())) {
            throw new RuntimeException("Resource is not available for booking.");
        }

        // Validate duration constraint (maxBookingHours)
        if (resource.getMaxBookingHours() > 0 && booking.getStartTime() != null && booking.getEndTime() != null) {
            long hours = Duration.between(booking.getStartTime(), booking.getEndTime()).toHours();
            if (hours > resource.getMaxBookingHours()) {
                throw new RuntimeException(
                        "Maximum booking duration for this resource is " + resource.getMaxBookingHours() + " hour(s).");
            }
        }

        // Validate end time is after start time
        if (!booking.getEndTime().isAfter(booking.getStartTime())) {
            throw new RuntimeException("End time must be after start time.");
        }

        // Validate attendee constraints
        int attendees = booking.getExpectedAttendees();
        if (resource.getMinAttendees() > 0 && attendees < resource.getMinAttendees()) {
            throw new RuntimeException(
                    "This resource requires a minimum of " + resource.getMinAttendees() + " attendees.");
        }
        if (resource.getMaxAttendees() > 0 && attendees > resource.getMaxAttendees()) {
            throw new RuntimeException(
                    "This resource allows a maximum of " + resource.getMaxAttendees() + " attendees.");
        }
        if (resource.getCapacity() > 0 && attendees > resource.getCapacity()) {
            throw new RuntimeException(
                    "Expected attendees exceed resource capacity of " + resource.getCapacity() + ".");
        }

        // Conflict Detection (vs APPROVED bookings, but exclude self!)
        List<Booking> overlaps = bookingRepository.findOverlappingBookings(
                booking.getResourceId(),
                booking.getStartTime(),
                booking.getEndTime()
        );
        
        // If we are updating, ignore overlap with current booking ID
        boolean hasConflict = overlaps.stream().anyMatch(b -> !b.getId().equals(booking.getId()));
        
        if (hasConflict) {
            throw new RuntimeException("Booking conflict! This resource is already booked for the selected time slot.");
        }
    }

    private Set<String> findBookingApproverEmails(Booking booking) {
        return userRepository.findAll().stream()
                .filter(user -> !Boolean.FALSE.equals(user.getActive()))
                .filter(user -> user.getRoles() != null && user.getRoles().stream()
                        .anyMatch(role -> role == Role.ADMIN || role == Role.MANAGER))
                .map(user -> user.getEmail())
                .filter(email -> email != null && !email.isBlank())
                .filter(email -> !email.equalsIgnoreCase(booking.getUserEmail()))
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    }

    private void notifyApprovers(Set<String> recipients, String title, String message, String relatedId) {
        log.info("Booking notification recipients for relatedId={}: {}", relatedId, recipients);
        recipients.forEach(email -> notificationService.sendToUser(email, Notification.builder()
                        .title(title)
                        .message(message)
                        .type(Notification.NotificationType.SYSTEM_ALERT)
                        .relatedId(relatedId)
                        .build()));
    }

    private String resolveBookingResourceName(Booking booking) {
        if (booking.getResourceName() != null && !booking.getResourceName().isBlank()) {
            return booking.getResourceName();
        }
        return booking.getResourceId();
    }
}

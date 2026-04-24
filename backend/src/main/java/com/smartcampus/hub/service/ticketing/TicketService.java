package com.smartcampus.hub.service.ticketing;

import com.smartcampus.hub.entity.notifications.Notification;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.entity.ticketing.Comment;
import com.smartcampus.hub.entity.ticketing.Ticket;
import com.smartcampus.hub.enums.Role;
import com.smartcampus.hub.enums.ticketing.TicketStatus;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.repository.ticketing.TicketRepository;
import com.smartcampus.hub.service.notifications.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class TicketService {
    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository, NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Ticket createTicket(Ticket ticket) {
        if (ticket.getDepartment() == null || ticket.getDepartment().isBlank()) {
            throw new IllegalArgumentException("Department is required when creating a ticket.");
        }
        ticket.setDepartment(ticket.getDepartment().trim().toUpperCase());
        ticket.setStatus(TicketStatus.PENDING);
        Ticket saved = ticketRepository.save(ticket);

        notifyUsers(
                findTicketSupervisors(saved),
                "New Ticket Submitted",
                "Ticket #" + saved.getId() + " was submitted for " + saved.getDepartment() + " and is waiting for review.",
                Notification.NotificationType.SYSTEM_ALERT,
                saved.getId()
        );

        return saved;
    }

    public List<Ticket> getMyTickets(String email) {
        return ticketRepository.findByReporterEmail(email);
    }

    public List<Ticket> getAssignedTickets(String email) {
        User requester = getRequiredUser(email);
        if (hasRole(requester, Role.ADMIN)) {
            return ticketRepository.findAll();
        }
        if (hasRole(requester, Role.MANAGER)) {
            if (requester.getDepartment() == null || requester.getDepartment().isBlank()) {
                return List.of();
            }
            return ticketRepository.findByDepartmentIgnoreCase(requester.getDepartment());
        }
        return ticketRepository.findByAssigneeEmail(email);
    }

    public List<Ticket> getAllTickets(String email) {
        User requester = getRequiredUser(email);
        if (hasRole(requester, Role.ADMIN)) {
            return ticketRepository.findAll();
        }
        if (hasRole(requester, Role.MANAGER)) {
            if (requester.getDepartment() == null || requester.getDepartment().isBlank()) {
                return List.of();
            }
            return ticketRepository.findByDepartmentIgnoreCase(requester.getDepartment());
        }
        throw new AccessDeniedException("Only admins or managers can view all tickets.");
    }

    public Ticket getTicketById(String id, String requesterEmail) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User requester = getRequiredUser(requesterEmail);
        if (hasRole(requester, Role.ADMIN)) {
            return ticket;
        }
        if (requesterEmail.equalsIgnoreCase(ticket.getReporterEmail())) {
            return ticket;
        }
        if (ticket.getAssigneeEmail() != null && requesterEmail.equalsIgnoreCase(ticket.getAssigneeEmail())) {
            return ticket;
        }
        if (hasRole(requester, Role.MANAGER)) {
            String managerDepartment = normalize(requester.getDepartment());
            String ticketDepartment = normalize(ticket.getDepartment());
            if (!managerDepartment.isBlank() && managerDepartment.equals(ticketDepartment)) {
                return ticket;
            }
            throw new AccessDeniedException("Managers can only access tickets in their own department.");
        }

        throw new AccessDeniedException("You are not allowed to view this ticket.");
    }

    public Ticket updateTicketStatus(String id, TicketStatus status, String requesterEmail) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User requester = getRequiredUser(requesterEmail);
        if (hasRole(requester, Role.MANAGER) && !hasRole(requester, Role.ADMIN)) {
            String managerDepartment = normalize(requester.getDepartment());
            String ticketDepartment = normalize(ticket.getDepartment());
            if (managerDepartment.isBlank() || !managerDepartment.equals(ticketDepartment)) {
                throw new AccessDeniedException("Managers can only update status for their own department tickets.");
            }
            if (status != TicketStatus.OPEN && status != TicketStatus.CLOSED) {
                throw new AccessDeniedException("Managers can only set status to OPEN or CLOSED.");
            }
            if (ticket.getStatus() == TicketStatus.CLOSED) {
                throw new IllegalArgumentException("Closed tickets cannot be reopened or modified.");
            }
            if (status == TicketStatus.OPEN && ticket.getStatus() != TicketStatus.PENDING) {
                throw new IllegalArgumentException("Managers can open only pending tickets.");
            }
        }

        ticket.setStatus(status);
        Ticket updated = ticketRepository.save(ticket);
        
        notifyUsers(
                findTicketStakeholders(updated, requesterEmail),
                "Ticket Status Changed",
                "Ticket #" + updated.getId() + " was updated to " + status.name().toLowerCase() + ".",
                Notification.NotificationType.TICKET_UPDATE,
                updated.getId()
        );
                
        return updated;
    }

    public Ticket assignTicket(String id, String technicianEmail, String requesterEmail) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setAssigneeEmail(technicianEmail);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        Ticket updated = ticketRepository.save(ticket);
        
        // Notify technician
        notificationService.sendToUser(technicianEmail, Notification.builder()
                .title("New Ticket Assigned")
                .message("You have been assigned to ticket #" + updated.getId())
                .type(Notification.NotificationType.TICKET_UPDATE)
                .relatedId(updated.getId())
                .build());

        notifyUsers(
                findTicketStakeholders(updated, requesterEmail),
                "Ticket Assignment Updated",
                "Ticket #" + updated.getId() + " has been assigned to " + technicianEmail + ".",
                Notification.NotificationType.TICKET_UPDATE,
                updated.getId()
        );
                
        return updated;
    }

    public Ticket addComment(String id, Comment comment, String commenterEmail) {
        Ticket ticket = getTicketById(id, commenterEmail);
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new IllegalArgumentException("Cannot add messages to a closed ticket.");
        }
        User commenter = getRequiredUser(commenterEmail);

        if (hasRole(commenter, Role.MANAGER)) {
            if (commenterEmail.equalsIgnoreCase(ticket.getReporterEmail())) {
                comment.setCreatedAt(LocalDateTime.now());
                ticket.getComments().add(comment);
                Ticket updated = ticketRepository.save(ticket);

                notifyUsers(
                        findCommentRecipients(updated, comment.getUserEmail()),
                        "New Ticket Comment",
                        "Ticket #" + updated.getId() + " has a new comment.",
                        Notification.NotificationType.COMMENT_ADDED,
                        updated.getId()
                );

                return updated;
            }

            String managerDepartment = normalize(commenter.getDepartment());
            String ticketDepartment = normalize(ticket.getDepartment());
            if (managerDepartment.isBlank() || !managerDepartment.equals(ticketDepartment)) {
                throw new AccessDeniedException("Managers can only reply to tickets in their own department.");
            }
        }

        comment.setCreatedAt(LocalDateTime.now());
        ticket.getComments().add(comment);
        Ticket updated = ticketRepository.save(ticket);
        
        // Notify reporter if comment is from someone else
        notifyUsers(
                findCommentRecipients(updated, comment.getUserEmail()),
                "New Ticket Comment",
                "Ticket #" + updated.getId() + " has a new comment.",
                Notification.NotificationType.COMMENT_ADDED,
                updated.getId()
        );
        
        return updated;
    }

    private User getRequiredUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user was not found."));
    }

    private boolean hasRole(User user, Role role) {
        return user.getRoles() != null && user.getRoles().contains(role);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }

    private Set<String> findTicketSupervisors(Ticket ticket) {
        String ticketDepartment = normalize(ticket.getDepartment());
        return userRepository.findAll().stream()
                .filter(user -> !Boolean.FALSE.equals(user.getActive()))
                .filter(user -> user.getRoles() != null)
                .filter(user -> user.getRoles().stream().anyMatch(role ->
                        role == Role.ADMIN || (role == Role.MANAGER && normalize(user.getDepartment()).equals(ticketDepartment))
                ))
                .map(User::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .filter(email -> !email.equalsIgnoreCase(ticket.getReporterEmail()))
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<String> findTicketStakeholders(Ticket ticket, String actorEmail) {
        Set<String> recipients = new LinkedHashSet<>(findTicketSupervisors(ticket));
        if (ticket.getReporterEmail() != null && !ticket.getReporterEmail().isBlank()) {
            recipients.add(ticket.getReporterEmail());
        }
        if (ticket.getAssigneeEmail() != null && !ticket.getAssigneeEmail().isBlank()) {
            recipients.add(ticket.getAssigneeEmail());
        }
        recipients.removeIf(email -> email.equalsIgnoreCase(actorEmail));
        return recipients;
    }

    private Set<String> findCommentRecipients(Ticket ticket, String actorEmail) {
        return findTicketStakeholders(ticket, actorEmail);
    }

    private void notifyUsers(Set<String> recipients, String title, String message, Notification.NotificationType type, String relatedId) {
        log.info("Ticket notification recipients for relatedId={}: {}", relatedId, recipients);
        recipients.forEach(email -> notificationService.sendToUser(email, Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .relatedId(relatedId)
                .build()));
    }
}

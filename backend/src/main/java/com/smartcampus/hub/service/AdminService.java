package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.AdminOverviewDto;
import com.smartcampus.hub.dto.AdminUserView;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.enums.Role;
import com.smartcampus.hub.enums.ticketing.TicketStatus;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.repository.ticketing.TicketRepository;
import com.smartcampus.hub.security.PrincipalUser;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    public AdminService(UserRepository userRepository, TicketRepository ticketRepository) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
    }

    public List<AdminUserView> getAllUsersForAdmin() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(user -> new AdminUserView(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getDepartment(),
                        user.getActive() == null || user.getActive(),
                        user.getRoles() == null ? List.of() : user.getRoles().stream().map(Enum::name).sorted().collect(Collectors.toList()),
                        user.getCreatedAt(),
                        user.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }

    public AdminUserView updateUserActiveStatus(String userId, boolean active, PrincipalUser principalUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (principalUser != null && user.getEmail() != null && user.getEmail().equalsIgnoreCase(principalUser.getUsername()) && !active) {
            throw new IllegalArgumentException("You cannot deactivate your own account.");
        }

        user.setActive(active);
        User saved = userRepository.save(user);

        return new AdminUserView(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getDepartment(),
                saved.getActive() == null || saved.getActive(),
                saved.getRoles() == null ? List.of() : saved.getRoles().stream().map(Enum::name).sorted().collect(Collectors.toList()),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );
    }

    public AdminOverviewDto getOverview() {
        List<User> users = userRepository.findAll();
        long staffUsers = users.stream()
                .filter(user -> user.getRoles() != null && user.getRoles().stream().anyMatch(role -> role == Role.MANAGER || role == Role.TECHNICIAN || role == Role.ADMIN))
                .count();

        long totalTickets = ticketRepository.count();
        long openTickets = ticketRepository.findByStatus(TicketStatus.OPEN).size();
        long inProgressTickets = ticketRepository.findByStatus(TicketStatus.IN_PROGRESS).size();

        return new AdminOverviewDto(users.size(), staffUsers, totalTickets, openTickets, inProgressTickets);
    }
}

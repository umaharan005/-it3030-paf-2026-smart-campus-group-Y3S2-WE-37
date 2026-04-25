package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.AdminOverviewDto;
import com.smartcampus.hub.dto.AdminUserStatusUpdateRequest;
import com.smartcampus.hub.dto.AdminUserView;
import com.smartcampus.hub.security.PrincipalUser;
import com.smartcampus.hub.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserView>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsersForAdmin());
    }

    @GetMapping("/overview")
    public ResponseEntity<AdminOverviewDto> getOverview() {
        return ResponseEntity.ok(adminService.getOverview());
    }

    @PatchMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable String id,
            @RequestBody AdminUserStatusUpdateRequest request,
            @AuthenticationPrincipal PrincipalUser principalUser
    ) {
        if (request.getActive() == null) {
            return ResponseEntity.badRequest().body("Field 'active' is required.");
        }

        try {
            return ResponseEntity.ok(adminService.updateUserActiveStatus(id, request.getActive(), principalUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

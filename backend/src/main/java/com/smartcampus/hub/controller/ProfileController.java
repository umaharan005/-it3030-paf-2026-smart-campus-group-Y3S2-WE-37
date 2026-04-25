package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.ProfileUpdateRequest;
import com.smartcampus.hub.security.PrincipalUser;
import com.smartcampus.hub.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal PrincipalUser principalUser) {
        if (principalUser == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        return ResponseEntity.ok(principalUser.getUser());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal PrincipalUser principalUser,
            @RequestBody ProfileUpdateRequest request
    ) {
        if (principalUser == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        try {
            return ResponseEntity.ok(profileService.updateProfile(principalUser.getUsername(), request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

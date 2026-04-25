package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.ProfileUpdateRequest;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User updateProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (request.getName() != null) {
            user.setName(request.getName().trim());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }
        if (request.getPicture() != null) {
            user.setPicture(request.getPicture().trim());
        }

        return userRepository.save(user);
    }
}

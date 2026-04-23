package com.smartcampus.hub.controller.notifications;

import com.smartcampus.hub.entity.notifications.Notification;
import com.smartcampus.hub.security.PrincipalUser;
import com.smartcampus.hub.service.notifications.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal PrincipalUser principalUser) {
        return ResponseEntity.ok(notificationService.getForUser(principalUser.getUsername()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }
}

package com.smartcampus.hub.service.notifications;

import com.smartcampus.hub.entity.notifications.Notification;
import com.smartcampus.hub.repository.notifications.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Notification sendToUser(String userId, Notification notification) {
        notification.setUserId(userId);
        notification.setRead(false);
        Notification saved = notificationRepository.save(notification);

        log.info("Notification saved for user={} title={} relatedId={}",
                userId, saved.getTitle(), saved.getRelatedId());

        // Use a per-user topic so live updates work even without an authenticated WebSocket principal.
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + encodeUserDestination(userId),
                saved
        );

        log.info("Notification dispatched to topic=/topic/notifications/{}", encodeUserDestination(userId));

        return saved;
    }

    public List<Notification> getForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    private String encodeUserDestination(String userId) {
        return URLEncoder.encode(userId, StandardCharsets.UTF_8);
    }
}

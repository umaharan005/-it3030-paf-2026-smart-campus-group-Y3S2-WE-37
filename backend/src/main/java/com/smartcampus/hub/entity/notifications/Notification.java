package com.smartcampus.hub.entity.notifications;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    
    private String userId;
    private String title;
    private String message;
    private NotificationType type;
    
    private boolean read;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    private String relatedId; // ID of the booking, ticket, etc.

    public enum NotificationType {
        BOOKING_APPROVED,
        BOOKING_REJECTED,
        TICKET_UPDATE,
        COMMENT_ADDED,
        SYSTEM_ALERT
    }
}

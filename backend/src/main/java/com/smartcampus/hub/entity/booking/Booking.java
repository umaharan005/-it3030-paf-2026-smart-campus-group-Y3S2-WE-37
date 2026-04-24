package com.smartcampus.hub.entity.booking;

import com.smartcampus.hub.enums.booking.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;
    
    private String resourceId;
    private String resourceName;
    private String resourceType;
    private String resourceLocation;
    private int resourceCapacity;
    private int minAttendeesConstraint;
    private int maxAttendeesConstraint;
    private String userEmail;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    private String purpose;
    private int expectedAttendees;
    private BookingStatus status;
    private String rejectionReason;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}

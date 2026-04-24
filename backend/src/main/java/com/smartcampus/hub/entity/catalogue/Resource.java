package com.smartcampus.hub.entity.catalogue;

import com.smartcampus.hub.enums.catalogue.ResourceStatus;
import com.smartcampus.hub.enums.catalogue.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;
    
    private String name;
    private String description;
    
    // Structured location fields
    private String building;      // "Main Building", "New Building/F Block", "Library"
    private String floor;         // "3rd floor", "13th floor", etc.
    private String roomCode;      // New room code e.g. "F1303", "A601"
    private String location;      // Legacy/override free-text location
    
    private int capacity;
    private String availableFrom;
    private String availableTo;
    
    // Booking constraints
    private int maxBookingHours;  // 0 = unlimited, >0 = max hours per booking
    private int minAttendees;     // 0 = no min
    private int maxAttendees;     // 0 = no max (use capacity)
    private List<String> timeSlots; // predefined time slots e.g. ["08:00-10:00", "10:00-12:00"]
    
    private ResourceType type;
    private ResourceStatus status;
    
    private String imageUrl;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}

package com.smartcampus.hub.entity.ticketing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    private String userEmail;
    private String userName;
    private String content;
    private LocalDateTime createdAt;
}

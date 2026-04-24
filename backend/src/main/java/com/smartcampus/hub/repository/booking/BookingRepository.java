package com.smartcampus.hub.repository.booking;

import com.smartcampus.hub.entity.booking.Booking;
import com.smartcampus.hub.enums.booking.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    
    List<Booking> findByUserEmail(String userEmail);
    
    List<Booking> findByResourceIdAndStatusIn(String resourceId, List<BookingStatus> statuses);
    
    @Query("{ 'resourceId': ?0, 'status': 'APPROVED', $or: [ " +
           "{ 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } } ] }")
    List<Booking> findOverlappingBookings(String resourceId, LocalDateTime start, LocalDateTime end);

    /** All APPROVED or PENDING bookings for a resource that overlap the given day window */
    @Query("{ 'resourceId': ?0, 'status': { $in: ['APPROVED','PENDING'] }, " +
           "'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }")
    List<Booking> findByResourceIdAndTimeRange(String resourceId, LocalDateTime start, LocalDateTime end);
}

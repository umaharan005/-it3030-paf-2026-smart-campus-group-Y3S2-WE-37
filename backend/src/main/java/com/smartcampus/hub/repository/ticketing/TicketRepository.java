package com.smartcampus.hub.repository.ticketing;

import com.smartcampus.hub.entity.ticketing.Ticket;
import com.smartcampus.hub.enums.ticketing.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    
    List<Ticket> findByReporterEmail(String email);
    
    List<Ticket> findByAssigneeEmail(String email);

    List<Ticket> findByDepartmentIgnoreCase(String department);
    
    List<Ticket> findByResourceId(String resourceId);
    
    List<Ticket> findByStatus(TicketStatus status);
}

package com.smartcampus.hub.service.catalogue;

import com.smartcampus.hub.entity.catalogue.Resource;
import com.smartcampus.hub.enums.catalogue.ResourceStatus;
import com.smartcampus.hub.enums.catalogue.ResourceType;
import com.smartcampus.hub.repository.catalogue.ResourceRepository;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final MongoTemplate mongoTemplate;

    public ResourceService(ResourceRepository resourceRepository, MongoTemplate mongoTemplate) {
        this.resourceRepository = resourceRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public Page<Resource> getAllResources(
            String search,
            ResourceType type,
            Integer minCapacity,
            String location,
            ResourceStatus status,
            Pageable pageable
    ) {
        Query query = new Query();
        List<Criteria> criteria = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            String escaped = Pattern.quote(search.trim());
            criteria.add(new Criteria().orOperator(
                    Criteria.where("name").regex(escaped, "i"),
                    Criteria.where("description").regex(escaped, "i"),
                    Criteria.where("location").regex(escaped, "i")
            ));
        }

        if (type != null) {
            criteria.add(Criteria.where("type").is(type));
        }

        if (minCapacity != null) {
            criteria.add(Criteria.where("capacity").gte(minCapacity));
        }

        if (location != null && !location.isBlank()) {
            criteria.add(Criteria.where("location").regex(Pattern.quote(location.trim()), "i"));
        }

        if (status != null) {
            criteria.add(Criteria.where("status").is(status));
        }

        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Resource.class);
        query.with(pageable);
        List<Resource> resources = mongoTemplate.find(query, Resource.class);

        return new PageImpl<>(resources, pageable, total);
    }

    public Optional<Resource> getResourceById(String id) {
        return resourceRepository.findById(id);
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource resourceDetails) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        
        resource.setName(resourceDetails.getName());
        resource.setDescription(resourceDetails.getDescription());
        resource.setBuilding(resourceDetails.getBuilding());
        resource.setFloor(resourceDetails.getFloor());
        resource.setRoomCode(resourceDetails.getRoomCode());
        resource.setLocation(resourceDetails.getLocation());
        resource.setCapacity(resourceDetails.getCapacity());
        resource.setAvailableFrom(resourceDetails.getAvailableFrom());
        resource.setAvailableTo(resourceDetails.getAvailableTo());
        resource.setType(resourceDetails.getType());
        resource.setStatus(resourceDetails.getStatus());
        resource.setImageUrl(resourceDetails.getImageUrl());
        resource.setMaxBookingHours(resourceDetails.getMaxBookingHours());
        resource.setMinAttendees(resourceDetails.getMinAttendees());
        resource.setMaxAttendees(resourceDetails.getMaxAttendees());
        resource.setTimeSlots(resourceDetails.getTimeSlots());
        
        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        resourceRepository.deleteById(id);
    }
}

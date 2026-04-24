package com.smartcampus.hub.repository.catalogue;

import com.smartcampus.hub.entity.catalogue.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {
}

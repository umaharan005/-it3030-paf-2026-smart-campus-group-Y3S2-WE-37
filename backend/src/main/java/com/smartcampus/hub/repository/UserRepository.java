package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.enums.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByRolesContainingAndDepartmentIgnoreCase(Role role, String department);
    List<User> findByDepartmentIgnoreCase(String department);
}

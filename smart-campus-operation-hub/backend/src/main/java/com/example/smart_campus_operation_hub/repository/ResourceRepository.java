package com.example.smart_campus_operation_hub.repository;

import com.example.smart_campus_operation_hub.enums.ResourceStatus;
import com.example.smart_campus_operation_hub.enums.ResourceType;
import com.example.smart_campus_operation_hub.model.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    Page<Resource> findByIsDeletedFalse(Pageable pageable);

    Page<Resource> findByTypeAndIsDeletedFalse(ResourceType type, Pageable pageable);

    Page<Resource> findByStatusAndIsDeletedFalse(ResourceStatus status, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE r.isDeleted = false " +
           "AND (:type IS NULL OR r.type = :type) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:location IS NULL OR r.location LIKE %:location%) " +
           "AND (:minCapacity IS NULL OR r.capacity >= :minCapacity)")
    Page<Resource> searchResources(
            @Param("type") ResourceType type,
            @Param("status") ResourceStatus status,
            @Param("location") String location,
            @Param("minCapacity") Integer minCapacity,
            Pageable pageable
    );
}

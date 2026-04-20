package com.example.smart_campus_operation_hub.repository;

import com.example.smart_campus_operation_hub.enums.TicketStatus;
import com.example.smart_campus_operation_hub.model.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    Page<Ticket> findByUserId(Long userId, Pageable pageable);

    Page<Ticket> findByAssignedToId(Long technicianId, Pageable pageable);

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    long countByStatus(TicketStatus status);
}

package com.example.smart_campus_operation_hub.repository;

import com.example.smart_campus_operation_hub.enums.TicketCategory;
import com.example.smart_campus_operation_hub.enums.TicketStatus;
import com.example.smart_campus_operation_hub.model.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    Page<Ticket> findByUserId(Long userId, Pageable pageable);

    Page<Ticket> findByAssignedToId(Long technicianId, Pageable pageable);

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    long countByStatus(TicketStatus status);

    List<Ticket> findTop10ByCategoryAndStatusIn(TicketCategory category, List<TicketStatus> statuses);

    List<Ticket> findByStatusInAndSlaDeadlineBetween(List<TicketStatus> statuses, LocalDateTime from, LocalDateTime to);
}

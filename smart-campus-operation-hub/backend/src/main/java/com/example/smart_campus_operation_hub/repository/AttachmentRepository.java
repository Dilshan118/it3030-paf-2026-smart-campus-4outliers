package com.example.smart_campus_operation_hub.repository;

import com.example.smart_campus_operation_hub.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTicketId(Long ticketId);
    long countByTicketId(Long ticketId);
}

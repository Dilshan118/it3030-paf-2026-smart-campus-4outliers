package com.example.smart_campus_operation_hub.scheduler;

import com.example.smart_campus_operation_hub.enums.NotificationType;
import com.example.smart_campus_operation_hub.enums.Role;
import com.example.smart_campus_operation_hub.enums.TicketStatus;
import com.example.smart_campus_operation_hub.model.Ticket;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.repository.TicketRepository;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import com.example.smart_campus_operation_hub.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class SlaEscalationScheduler {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public SlaEscalationScheduler(TicketRepository ticketRepository,
                                   UserRepository userRepository,
                                   NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // Runs every hour; finds tickets whose SLA deadline falls within the next 2 hours
    @Scheduled(fixedRate = 3_600_000)
    public void escalateBreachingTickets() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime warningWindow = now.plusHours(2);

        List<Ticket> atRisk = ticketRepository.findByStatusInAndSlaDeadlineBetween(
                Arrays.asList(TicketStatus.OPEN, TicketStatus.IN_PROGRESS),
                now,
                warningWindow
        );

        if (atRisk.isEmpty()) return;

        List<User> reviewers = new ArrayList<>();
        reviewers.addAll(userRepository.findByRoleAndIsActiveTrue(Role.ADMIN));
        reviewers.addAll(userRepository.findByRoleAndIsActiveTrue(Role.MANAGER));

        for (Ticket ticket : atRisk) {
            String label = "Ticket #" + ticket.getId()
                    + " [" + ticket.getPriority() + " | " + ticket.getCategory() + "]";

            if (ticket.getAssignedTo() != null) {
                silentSend(ticket.getAssignedTo().getId(),
                        "SLA Breach Warning",
                        label + " is approaching its SLA deadline. Please resolve it urgently.",
                        ticket.getId());
            }

            for (User reviewer : reviewers) {
                silentSend(reviewer.getId(),
                        "SLA Escalation Alert",
                        label + " is about to breach SLA. Immediate action required.",
                        ticket.getId());
            }
        }

        System.out.println("[SlaEscalationScheduler] Escalated " + atRisk.size() + " at-risk ticket(s).");
    }

    private void silentSend(Long userId, String title, String message, Long ticketId) {
        try {
            notificationService.send(userId, NotificationType.TICKET_STATUS_CHANGED,
                    title, message, ticketId, "TICKET");
        } catch (Exception ignored) {
        }
    }
}

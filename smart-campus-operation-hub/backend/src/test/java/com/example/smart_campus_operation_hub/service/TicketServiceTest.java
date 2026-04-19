package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.dto.response.TicketResponse;
import com.example.smart_campus_operation_hub.enums.NotificationType;
import com.example.smart_campus_operation_hub.enums.Role;
import com.example.smart_campus_operation_hub.enums.TicketPriority;
import com.example.smart_campus_operation_hub.enums.TicketStatus;
import com.example.smart_campus_operation_hub.exception.BadRequestException;
import com.example.smart_campus_operation_hub.model.Resource;
import com.example.smart_campus_operation_hub.model.Ticket;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.repository.ResourceRepository;
import com.example.smart_campus_operation_hub.repository.TicketRepository;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TicketService ticketService;

    private User mockUser;
    private User mockTechnician;
    private Resource mockResource;
    private Ticket mockTicket;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setName("Test User");
        mockUser.setRole(Role.USER);

        mockTechnician = new User();
        mockTechnician.setId(2L);
        mockTechnician.setName("Test Tech");
        mockTechnician.setRole(Role.TECHNICIAN);

        mockResource = new Resource();
        mockResource.setId(10L);
        mockResource.setName("Projector A");

        mockTicket = new Ticket();
        mockTicket.setId(100L);
        mockTicket.setUser(mockUser);
        mockTicket.setResource(mockResource);
        mockTicket.setStatus(TicketStatus.OPEN);
        mockTicket.setPriority(TicketPriority.HIGH);
        mockTicket.setCategory(com.example.smart_campus_operation_hub.enums.TicketCategory.EQUIPMENT_MALFUNCTION);
    }

    @Test
    void testUpdateTicketStatus_OpenToInProgress_Success() {
        // Arrange
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(mockTicket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(mockTicket);

        // Act
        TicketResponse response = ticketService.updateTicketStatus(100L, TicketStatus.IN_PROGRESS, null, null);

        // Assert
        assertEquals(TicketStatus.IN_PROGRESS.name(), response.getStatus());
        verify(ticketRepository).save(mockTicket);
        verify(notificationService).send(eq(1L), eq(NotificationType.TICKET_STATUS_CHANGED), anyString(), anyString(), eq(100L), eq("TICKET"));
    }

    @Test
    void testUpdateTicketStatus_InvalidTransition_ThrowsException() {
        // Arrange
        mockTicket.setStatus(TicketStatus.OPEN);
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(mockTicket));

        // Act & Assert
        assertThrows(BadRequestException.class, () -> {
            ticketService.updateTicketStatus(100L, TicketStatus.CLOSED, null, null);
        });
    }

    @Test
    void testUpdateTicketStatus_ResolvedWithoutNotes_ThrowsException() {
        // Arrange
        mockTicket.setStatus(TicketStatus.IN_PROGRESS);
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(mockTicket));

        // Act & Assert
        assertThrows(BadRequestException.class, () -> {
            ticketService.updateTicketStatus(100L, TicketStatus.RESOLVED, "", null);
        });
    }

    @Test
    void testAssignTechnician_ValidTechnician_Success() {
        // Arrange
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(mockTicket));
        when(userRepository.findById(2L)).thenReturn(Optional.of(mockTechnician));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(mockTicket);

        // Act
        TicketResponse response = ticketService.assignTechnician(100L, 2L);

        // Assert
        assertNotNull(mockTicket.getAssignedTo());
        assertEquals(2L, mockTicket.getAssignedTo().getId());
        assertEquals(TicketStatus.IN_PROGRESS, mockTicket.getStatus());
        verify(notificationService, times(2)).send(anyLong(), eq(NotificationType.TICKET_ASSIGNED), anyString(), anyString(), eq(100L), eq("TICKET"));
    }
}

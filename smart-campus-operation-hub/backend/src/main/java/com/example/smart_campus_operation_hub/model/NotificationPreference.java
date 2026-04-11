package com.example.smart_campus_operation_hub.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private Boolean bookingEnabled = true;

    @Column(nullable = false)
    private Boolean ticketEnabled = true;

    @Column(nullable = false)
    private Boolean commentEnabled = true;

    @Column(nullable = false)
    private Boolean emailEnabled = false;

    private LocalTime quietHoursStart;  // e.g., 22:00
    private LocalTime quietHoursEnd;    // e.g., 07:00

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Boolean getBookingEnabled() { return bookingEnabled; }
    public void setBookingEnabled(Boolean bookingEnabled) { this.bookingEnabled = bookingEnabled; }

    public Boolean getTicketEnabled() { return ticketEnabled; }
    public void setTicketEnabled(Boolean ticketEnabled) { this.ticketEnabled = ticketEnabled; }

    public Boolean getCommentEnabled() { return commentEnabled; }
    public void setCommentEnabled(Boolean commentEnabled) { this.commentEnabled = commentEnabled; }

    public Boolean getEmailEnabled() { return emailEnabled; }
    public void setEmailEnabled(Boolean emailEnabled) { this.emailEnabled = emailEnabled; }

    public LocalTime getQuietHoursStart() { return quietHoursStart; }
    public void setQuietHoursStart(LocalTime quietHoursStart) { this.quietHoursStart = quietHoursStart; }

    public LocalTime getQuietHoursEnd() { return quietHoursEnd; }
    public void setQuietHoursEnd(LocalTime quietHoursEnd) { this.quietHoursEnd = quietHoursEnd; }
}

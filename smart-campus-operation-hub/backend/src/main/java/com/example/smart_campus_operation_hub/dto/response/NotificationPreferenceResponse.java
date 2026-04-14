package com.example.smart_campus_operation_hub.dto.response;

import java.time.LocalTime;

public class NotificationPreferenceResponse {

    private Boolean bookingEnabled;
    private Boolean ticketEnabled;
    private Boolean commentEnabled;
    private Boolean emailEnabled;
    private LocalTime quietHoursStart;
    private LocalTime quietHoursEnd;

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

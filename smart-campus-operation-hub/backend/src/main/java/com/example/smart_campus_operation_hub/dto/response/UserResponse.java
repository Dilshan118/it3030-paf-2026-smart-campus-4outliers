package com.example.smart_campus_operation_hub.dto.response;

import com.example.smart_campus_operation_hub.model.User;
import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String email;
    private String name;
    private String avatarUrl;
    private String role;
    private Boolean isActive;
    private Boolean profileCompleted;
    private LocalDateTime createdAt;

    // Profile fields
    private String phone;
    private String address;
    private String studentId;
    private String faculty;
    private String specialization;
    private Integer year;
    private Integer semester;
    private String staffId;
    private String department;

    public static UserResponse from(User u) {
        UserResponse r = new UserResponse();
        r.id              = u.getId();
        r.email           = u.getEmail();
        r.name            = u.getName();
        r.avatarUrl       = u.getAvatarUrl();
        r.role            = u.getRole() != null ? u.getRole().name() : null;
        r.isActive        = u.getIsActive();
        r.profileCompleted = Boolean.TRUE.equals(u.getProfileCompleted());
        r.createdAt       = u.getCreatedAt();
        r.phone           = u.getPhone();
        r.address         = u.getAddress();
        r.studentId       = u.getStudentId();
        r.faculty         = u.getFaculty();
        r.specialization  = u.getSpecialization();
        r.year            = u.getYear();
        r.semester        = u.getSemester();
        r.staffId         = u.getStaffId();
        r.department      = u.getDepartment();
        return r;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getAvatarUrl() { return avatarUrl; }
    public String getRole() { return role; }
    public Boolean getIsActive() { return isActive; }
    public Boolean getProfileCompleted() { return profileCompleted; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getStudentId() { return studentId; }
    public String getFaculty() { return faculty; }
    public String getSpecialization() { return specialization; }
    public Integer getYear() { return year; }
    public Integer getSemester() { return semester; }
    public String getStaffId() { return staffId; }
    public String getDepartment() { return department; }
}

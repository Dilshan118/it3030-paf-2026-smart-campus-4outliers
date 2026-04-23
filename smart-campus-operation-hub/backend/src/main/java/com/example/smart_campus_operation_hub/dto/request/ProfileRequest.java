package com.example.smart_campus_operation_hub.dto.request;

public class ProfileRequest {

    private String name;
    private String phone;
    private String address;

    // Student-specific
    private String studentId;
    private String faculty;
    private String specialization;
    private Integer year;
    private Integer semester;

    // Staff-specific
    private String staffId;
    private String department;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getStaffId() { return staffId; }
    public void setStaffId(String staffId) { this.staffId = staffId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}

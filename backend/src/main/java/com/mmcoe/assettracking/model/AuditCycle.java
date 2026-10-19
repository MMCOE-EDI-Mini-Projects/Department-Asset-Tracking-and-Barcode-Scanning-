package com.mmcoe.assettracking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "audit_cycles")
public class AuditCycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer auditId;

    @Column(nullable = false, length = 160)
    private String auditName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(nullable = false, length = 20)
    private String auditStatus = "open"; // open | completed

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "auditCycle", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<AuditItem> items;

    // Getters & Setters
    public Integer getAuditId() { return auditId; }
    public String getAuditName() { return auditName; }
    public void setAuditName(String auditName) { this.auditName = auditName; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public String getAuditStatus() { return auditStatus; }
    public void setAuditStatus(String auditStatus) { this.auditStatus = auditStatus; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public List<AuditItem> getItems() { return items; }
}

package com.mmcoe.assettracking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_items")
public class AuditItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer auditItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id", nullable = false)
    private AuditCycle auditCycle;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(length = 20)
    private String verificationStatus; // found | missing | misplaced | damaged | not_accessible

    @Column(columnDefinition = "TEXT")
    private String comments;

    private LocalDateTime scannedAt;

    // Getters & Setters
    public Integer getAuditItemId() { return auditItemId; }
    public AuditCycle getAuditCycle() { return auditCycle; }
    public void setAuditCycle(AuditCycle auditCycle) { this.auditCycle = auditCycle; }
    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }
    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public LocalDateTime getScannedAt() { return scannedAt; }
    public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }
}

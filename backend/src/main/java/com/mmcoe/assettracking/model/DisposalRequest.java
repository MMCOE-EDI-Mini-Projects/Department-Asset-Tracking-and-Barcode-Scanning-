package com.mmcoe.assettracking.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "disposal_requests")
public class DisposalRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Integer requestId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(name = "request_type", length = 30)
    private String requestType = "disposal";

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "disposal_method", length = 100)
    private String disposalMethod;

    @Column(name = "book_value", precision = 12, scale = 2)
    private BigDecimal bookValue;

    @Column(name = "requested_by", length = 100)
    private String requestedBy;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "request_date", insertable = false, updatable = false)
    private LocalDateTime requestDate;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @Column(name = "disposal_date")
    private LocalDateTime disposalDate;

    @Column(name = "write_off_date")
    private LocalDateTime writeOffDate;

    @Column(name = "status", length = 30)
    private String status = "pending";

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    public DisposalRequest() {}

    public Integer getRequestId() { return requestId; }
    public void setRequestId(Integer requestId) { this.requestId = requestId; }

    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }

    public String getRequestType() { return requestType; }
    public void setRequestType(String requestType) { this.requestType = requestType; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDisposalMethod() { return disposalMethod; }
    public void setDisposalMethod(String disposalMethod) { this.disposalMethod = disposalMethod; }

    public BigDecimal getBookValue() { return bookValue; }
    public void setBookValue(BigDecimal bookValue) { this.bookValue = bookValue; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }

    public LocalDateTime getApprovalDate() { return approvalDate; }
    public void setApprovalDate(LocalDateTime approvalDate) { this.approvalDate = approvalDate; }

    public LocalDateTime getDisposalDate() { return disposalDate; }
    public void setDisposalDate(LocalDateTime disposalDate) { this.disposalDate = disposalDate; }

    public LocalDateTime getWriteOffDate() { return writeOffDate; }
    public void setWriteOffDate(LocalDateTime writeOffDate) { this.writeOffDate = writeOffDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}

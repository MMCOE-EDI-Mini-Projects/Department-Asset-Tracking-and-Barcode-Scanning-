package com.mmcoe.assettracking.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_transfers")
public class AssetTransfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transfer_id")
    private Integer transferId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "from_department_id")
    private Department fromDepartment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "to_department_id")
    private Department toDepartment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "from_location_id")
    private Location fromLocation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "to_location_id")
    private Location toLocation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "from_custodian_id")
    private User fromCustodian;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "to_custodian_id")
    private User toCustodian;

    @Column(name = "transfer_date", nullable = false)
    private LocalDate transferDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "handover_user_id", nullable = false)
    private User handoverUser;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_user_id", nullable = false)
    private User receiverUser;

    @Column(name = "barcode_value", length = 100)
    private String barcodeValue;

    @Column(name = "barcode_verified")
    private Boolean barcodeVerified = false;

    @Column(name = "approval_status", length = 30)
    private String approvalStatus = "approved";

    @Column(name = "transfer_status", length = 30)
    private String transferStatus = "completed";

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public AssetTransfer() {}

    public Integer getTransferId() { return transferId; }
    public void setTransferId(Integer transferId) { this.transferId = transferId; }

    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }

    public Department getFromDepartment() { return fromDepartment; }
    public void setFromDepartment(Department fromDepartment) { this.fromDepartment = fromDepartment; }

    public Department getToDepartment() { return toDepartment; }
    public void setToDepartment(Department toDepartment) { this.toDepartment = toDepartment; }

    public Location getFromLocation() { return fromLocation; }
    public void setFromLocation(Location fromLocation) { this.fromLocation = fromLocation; }

    public Location getToLocation() { return toLocation; }
    public void setToLocation(Location toLocation) { this.toLocation = toLocation; }

    public User getFromCustodian() { return fromCustodian; }
    public void setFromCustodian(User fromCustodian) { this.fromCustodian = fromCustodian; }

    public User getToCustodian() { return toCustodian; }
    public void setToCustodian(User toCustodian) { this.toCustodian = toCustodian; }

    public LocalDate getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDate transferDate) { this.transferDate = transferDate; }

    public User getHandoverUser() { return handoverUser; }
    public void setHandoverUser(User handoverUser) { this.handoverUser = handoverUser; }

    public User getReceiverUser() { return receiverUser; }
    public void setReceiverUser(User receiverUser) { this.receiverUser = receiverUser; }

    public String getBarcodeValue() { return barcodeValue; }
    public void setBarcodeValue(String barcodeValue) { this.barcodeValue = barcodeValue; }

    public Boolean getBarcodeVerified() { return barcodeVerified; }
    public void setBarcodeVerified(Boolean barcodeVerified) { this.barcodeVerified = barcodeVerified; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public String getTransferStatus() { return transferStatus; }
    public void setTransferStatus(String transferStatus) { this.transferStatus = transferStatus; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

package com.mmcoe.assettracking.model;

import jakarta.persistence.*;

@Entity
@Table(name = "receiving_types")
public class ReceivingType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receiving_type_id")
    private Integer receivingTypeId;

    @Column(name = "type_name", nullable = false, unique = true, length = 50)
    private String typeName;

    @Column(name = "needs_invoice")
    private Boolean needsInvoice = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    public ReceivingType() {}

    public Integer getReceivingTypeId() { return receivingTypeId; }
    public void setReceivingTypeId(Integer receivingTypeId) { this.receivingTypeId = receivingTypeId; }

    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }

    public Boolean getNeedsInvoice() { return needsInvoice; }
    public void setNeedsInvoice(Boolean needsInvoice) { this.needsInvoice = needsInvoice; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}

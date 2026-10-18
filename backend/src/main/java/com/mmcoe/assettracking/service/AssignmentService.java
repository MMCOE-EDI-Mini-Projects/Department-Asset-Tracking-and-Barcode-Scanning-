package com.mmcoe.assettracking.service;

import com.mmcoe.assettracking.model.*;
import com.mmcoe.assettracking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class AssignmentService {
    private final AssetRepository assetRepository;
    private final AssetAssignmentRepository assignmentRepository;
    private final AssetTransferRepository transferRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;
    private final AuditService auditService;

    public AssignmentService(AssetRepository assetRepository,
                             AssetAssignmentRepository assignmentRepository,
                             AssetTransferRepository transferRepository,
                             UserRepository userRepository,
                             DepartmentRepository departmentRepository,
                             LocationRepository locationRepository,
                             AuditService auditService) {
        this.assetRepository = assetRepository;
        this.assignmentRepository = assignmentRepository;
        this.transferRepository = transferRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.locationRepository = locationRepository;
        this.auditService = auditService;
    }

    /** Safely converts Object (may be String or Number from JSON) to Integer. Returns null if blank/null. */
    private Integer toInt(Object val) {
        if (val == null) return null;
        String s = val.toString().trim();
        if (s.isEmpty()) return null;
        try { return (int) Double.parseDouble(s); } catch (NumberFormatException e) { return null; }
    }

    public List<AssetTransfer> getAllTransfers() {
        return transferRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public AssetAssignment assignAsset(Map<String, Object> req, User loggedInUser) {
        Integer assetId = toInt(req.get("assetId"));
        if (assetId == null) throw new IllegalArgumentException("assetId is required.");
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        Integer custodianId = toInt(req.get("custodianId"));
        User custodian = custodianId != null ? userRepository.findById(custodianId).orElse(null) : null;

        Integer departmentId = toInt(req.get("departmentId"));
        Department dept = departmentId != null ? departmentRepository.findById(departmentId).orElse(null) : asset.getDepartment();

        Integer locationId = toInt(req.get("locationId"));
        Location loc = locationId != null ? locationRepository.findById(locationId).orElse(null) : asset.getLocation();

        AssetAssignment assignment = new AssetAssignment();
        assignment.setAsset(asset);
        assignment.setCustodian(custodian);
        assignment.setDepartment(dept);
        assignment.setLocation(loc);
        assignment.setAssignedDate(LocalDate.now());
        assignment.setAssignedBy(loggedInUser != null ? loggedInUser : userRepository.findById(1).orElse(null));
        assignment.setRemarks((String) req.get("remarks"));
        assignment.setAssignmentStatus("active");

        asset.setCustodian(custodian);
        if (dept != null) asset.setDepartment(dept);
        if (loc != null) asset.setLocation(loc);
        asset.setStatus("assigned");
        assetRepository.save(asset);

        AssetAssignment saved = assignmentRepository.save(assignment);
        auditService.log("ASSET", asset.getAssetId(), "ASSIGN", "custodian", null,
                custodian != null ? custodian.getName() : "None",
                loggedInUser != null ? loggedInUser.getUserId() : null);
        return saved;
    }

    @Transactional
    public AssetTransfer transferAsset(Map<String, Object> req, User loggedInUser) {
        Integer assetId = toInt(req.get("assetId"));
        if (assetId == null) throw new IllegalArgumentException("assetId is required.");
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        Integer toDeptId = toInt(req.get("toDepartmentId"));
        if (toDeptId == null) throw new IllegalArgumentException("toDepartmentId is required.");
        Department toDept = departmentRepository.findById(toDeptId)
                .orElseThrow(() -> new RuntimeException("Target department not found"));

        Integer toLocId = toInt(req.get("toLocationId"));
        Location toLoc = toLocId != null ? locationRepository.findById(toLocId).orElse(null) : null;

        Integer toCustId = toInt(req.get("toCustodianId"));
        User toCust = toCustId != null ? userRepository.findById(toCustId).orElse(null) : null;

        Integer receiverId = toInt(req.get("receiverUserId"));
        if (receiverId == null) receiverId = (toCustId != null ? toCustId : 1);
        User receiver = userRepository.findById(receiverId).orElse(loggedInUser);

        AssetTransfer transfer = new AssetTransfer();
        transfer.setAsset(asset);
        transfer.setFromDepartment(asset.getDepartment());
        transfer.setToDepartment(toDept);
        transfer.setFromLocation(asset.getLocation());
        transfer.setToLocation(toLoc);
        transfer.setFromCustodian(asset.getCustodian());
        transfer.setToCustodian(toCust);
        transfer.setTransferDate(LocalDate.now());
        transfer.setHandoverUser(loggedInUser != null ? loggedInUser : userRepository.findById(1).orElse(null));
        transfer.setReceiverUser(receiver);
        transfer.setBarcodeValue(asset.getAssetCode());
        transfer.setBarcodeVerified(Boolean.TRUE.equals(req.get("barcodeVerified")));
        transfer.setApprovalStatus("approved");
        transfer.setTransferStatus("completed");
        transfer.setRemarks((String) req.get("remarks"));

        // update asset
        asset.setDepartment(toDept);
        if (toLoc != null) asset.setLocation(toLoc);
        asset.setCustodian(toCust);
        assetRepository.save(asset);

        AssetTransfer saved = transferRepository.save(transfer);
        auditService.log("ASSET", asset.getAssetId(), "TRANSFER", "department",
                asset.getDepartment() != null ? asset.getDepartment().getName() : null,
                toDept.getName(), loggedInUser != null ? loggedInUser.getUserId() : null);
        return saved;
    }
}

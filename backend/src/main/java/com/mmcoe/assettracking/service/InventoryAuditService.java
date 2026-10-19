package com.mmcoe.assettracking.service;

import com.mmcoe.assettracking.model.*;
import com.mmcoe.assettracking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class InventoryAuditService {

    private final AuditCycleRepository auditCycleRepository;
    private final AuditItemRepository auditItemRepository;
    private final AssetRepository assetRepository;
    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;
    private final AssetConditionRepository conditionRepository;
    private final AuditService auditService;

    public InventoryAuditService(AuditCycleRepository auditCycleRepository,
                                 AuditItemRepository auditItemRepository,
                                 AssetRepository assetRepository,
                                 DepartmentRepository departmentRepository,
                                 LocationRepository locationRepository,
                                 AssetConditionRepository conditionRepository,
                                 AuditService auditService) {
        this.auditCycleRepository = auditCycleRepository;
        this.auditItemRepository = auditItemRepository;
        this.assetRepository = assetRepository;
        this.departmentRepository = departmentRepository;
        this.locationRepository = locationRepository;
        this.conditionRepository = conditionRepository;
        this.auditService = auditService;
    }

    private Integer toInt(Object val) {
        if (val == null) return null;
        String s = val.toString().trim();
        if (s.isEmpty()) return null;
        try { return (int) Double.parseDouble(s); } catch (NumberFormatException e) { return null; }
    }

    public List<AuditCycle> getAllAudits() {
        return auditCycleRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<AuditItem> getAuditItems(Integer auditId) {
        return auditItemRepository.findByAuditCycle_AuditId(auditId);
    }

    @Transactional
    public AuditCycle createAudit(Map<String, Object> req, User loggedInUser) {
        String auditName = req.get("auditName") != null ? req.get("auditName").toString().trim() : null;
        if (auditName == null || auditName.isBlank()) throw new IllegalArgumentException("Audit name is required.");

        Integer deptId = toInt(req.get("departmentId"));
        Integer locId  = toInt(req.get("locationId"));

        AuditCycle cycle = new AuditCycle();
        cycle.setAuditName(auditName);
        cycle.setCreatedBy(loggedInUser);

        if (deptId != null) departmentRepository.findById(deptId).ifPresent(cycle::setDepartment);
        if (locId  != null) locationRepository.findById(locId).ifPresent(cycle::setLocation);

        AuditCycle saved = auditCycleRepository.save(cycle);

        // Auto-create audit items for all matching assets
        List<Asset> assets = assetRepository.searchAssets(deptId, null, null, null);
        if (locId != null) {
            Integer finalLocId = locId;
            assets = assets.stream()
                .filter(a -> a.getLocation() != null && a.getLocation().getLocationId().equals(finalLocId))
                .toList();
        }

        for (Asset a : assets) {
            AuditItem item = new AuditItem();
            item.setAuditCycle(saved);
            item.setAsset(a);
            auditItemRepository.save(item);
        }

        auditService.log("AUDIT", saved.getAuditId(), "CREATE_AUDIT", null, null, auditName,
                loggedInUser != null ? loggedInUser.getUserId() : null);
        return saved;
    }

    @Transactional
    public AuditItem verifyItem(Integer auditItemId, Map<String, Object> req, User loggedInUser) {
        AuditItem item = auditItemRepository.findById(auditItemId)
                .orElseThrow(() -> new RuntimeException("Audit item not found"));

        String status = req.get("verificationStatus") != null ? req.get("verificationStatus").toString() : null;
        item.setVerificationStatus(status);
        item.setComments(req.get("comments") != null ? req.get("comments").toString() : null);
        item.setScannedAt(LocalDateTime.now());

        // Apply asset status mapping per spec
        Asset asset = item.getAsset();
        if ("found".equals(status)) {
            asset.setStatus("available");
            conditionRepository.findByConditionNameIgnoreCase("Good").ifPresent(asset::setCondition);
        } else if ("missing".equals(status)) {
            asset.setStatus("lost");
        } else if ("damaged".equals(status)) {
            asset.setStatus("damaged");
            conditionRepository.findByConditionNameIgnoreCase("Damaged").ifPresent(asset::setCondition);
        }
        // misplaced / not_accessible: record only, no asset status change
        assetRepository.save(asset);

        auditService.log("AUDIT", item.getAuditCycle().getAuditId(), "VERIFY_ITEM",
                "verification_status", null, status,
                loggedInUser != null ? loggedInUser.getUserId() : null);

        return auditItemRepository.save(item);
    }

    @Transactional
    public AuditCycle completeAudit(Integer auditId, User loggedInUser) {
        AuditCycle cycle = auditCycleRepository.findById(auditId)
                .orElseThrow(() -> new RuntimeException("Audit not found"));
        cycle.setAuditStatus("completed");
        cycle.setCompletedAt(LocalDateTime.now());
        AuditCycle saved = auditCycleRepository.save(cycle);
        auditService.log("AUDIT", auditId, "COMPLETE_AUDIT", "audit_status", "open", "completed",
                loggedInUser != null ? loggedInUser.getUserId() : null);
        return saved;
    }
}

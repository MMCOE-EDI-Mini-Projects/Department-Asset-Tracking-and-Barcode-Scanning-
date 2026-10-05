package com.mmcoe.assettracking.service;

import com.mmcoe.assettracking.model.Asset;
import com.mmcoe.assettracking.model.DisposalRequest;
import com.mmcoe.assettracking.model.User;
import com.mmcoe.assettracking.repository.AssetRepository;
import com.mmcoe.assettracking.repository.DisposalRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class DisposalService {
    private final DisposalRequestRepository disposalRequestRepository;
    private final AssetRepository assetRepository;
    private final AuditService auditService;

    public DisposalService(DisposalRequestRepository disposalRequestRepository,
                           AssetRepository assetRepository,
                           AuditService auditService) {
        this.disposalRequestRepository = disposalRequestRepository;
        this.assetRepository = assetRepository;
        this.auditService = auditService;
    }

    public List<DisposalRequest> getAllRequests(String status) {
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("all")) {
            return disposalRequestRepository.findByStatusOrderByRequestDateDesc(status);
        }
        return disposalRequestRepository.findAllByOrderByRequestDateDesc();
    }

    /** Safely converts Object (may be String or Number from JSON) to Integer. Returns null if blank/null. */
    private Integer toInt(Object val) {
        if (val == null) return null;
        String s = val.toString().trim();
        if (s.isEmpty()) return null;
        try { return (int) Double.parseDouble(s); } catch (NumberFormatException e) { return null; }
    }

    @Transactional
    public DisposalRequest createRequest(Map<String, Object> req, User loggedInUser) {
        Integer assetId = toInt(req.get("assetId"));
        if (assetId == null) throw new IllegalArgumentException("assetId is required.");
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        DisposalRequest dr = new DisposalRequest();
        dr.setAsset(asset);
        dr.setRequestType(req.get("requestType") != null ? (String) req.get("requestType") : "disposal");
        dr.setReason((String) req.get("reason"));
        dr.setDisposalMethod((String) req.get("disposalMethod"));
        if (req.get("bookValue") != null) {
            dr.setBookValue(new BigDecimal(req.get("bookValue").toString()));
        }
        dr.setRequestedBy(loggedInUser != null ? loggedInUser.getName() : (String) req.get("requestedBy"));
        dr.setStatus("pending");
        dr.setRemarks((String) req.get("remarks"));

        DisposalRequest saved = disposalRequestRepository.save(dr);
        auditService.log("DISPOSAL", saved.getRequestId(), "CREATE_REQUEST", null, null, asset.getAssetCode(), loggedInUser != null ? loggedInUser.getUserId() : null);
        return saved;
    }

    @Transactional
    public DisposalRequest approveRequest(Integer requestId, User loggedInUser) {
        DisposalRequest dr = disposalRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Disposal request not found"));

        dr.setStatus("approved");
        dr.setApprovedBy(loggedInUser != null ? loggedInUser.getName() : "Department Head");
        dr.setApprovalDate(LocalDateTime.now());

        DisposalRequest saved = disposalRequestRepository.save(dr);
        auditService.log("DISPOSAL", dr.getRequestId(), "APPROVE_REQUEST", "status", "pending", "approved", loggedInUser != null ? loggedInUser.getUserId() : null);
        return saved;
    }

    @Transactional
    public DisposalRequest finalizeDisposal(Integer requestId, Map<String, Object> req, User loggedInUser) {
        DisposalRequest dr = disposalRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Disposal request not found"));

        boolean isWriteOff = "write_off".equalsIgnoreCase(dr.getRequestType());
        dr.setStatus(isWriteOff ? "written_off" : "disposed");
        if (isWriteOff) {
            dr.setWriteOffDate(LocalDateTime.now());
        } else {
            dr.setDisposalDate(LocalDateTime.now());
        }
        if (req.get("remarks") != null) {
            dr.setRemarks((String) req.get("remarks"));
        }

        // update asset status
        Asset asset = dr.getAsset();
        asset.setStatus(isWriteOff ? "written_off" : "disposed");
        assetRepository.save(asset);

        DisposalRequest saved = disposalRequestRepository.save(dr);
        auditService.log("DISPOSAL", dr.getRequestId(), "FINALIZE", "asset_status", "approved", asset.getStatus(), loggedInUser != null ? loggedInUser.getUserId() : null);
        return saved;
    }
}

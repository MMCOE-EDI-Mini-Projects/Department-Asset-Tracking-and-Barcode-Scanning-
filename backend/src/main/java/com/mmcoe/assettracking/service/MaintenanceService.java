package com.mmcoe.assettracking.service;

import com.mmcoe.assettracking.model.*;
import com.mmcoe.assettracking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class MaintenanceService {

    private final MaintenanceTicketRepository ticketRepository;
    private final AssetRepository assetRepository;
    private final AssetConditionRepository conditionRepository;
    private final AuditService auditService;

    public MaintenanceService(MaintenanceTicketRepository ticketRepository,
                              AssetRepository assetRepository,
                              AssetConditionRepository conditionRepository,
                              AuditService auditService) {
        this.ticketRepository = ticketRepository;
        this.assetRepository = assetRepository;
        this.conditionRepository = conditionRepository;
        this.auditService = auditService;
    }

    private Integer toInt(Object val) {
        if (val == null) return null;
        String s = val.toString().trim();
        if (s.isEmpty()) return null;
        try { return (int) Double.parseDouble(s); } catch (NumberFormatException e) { return null; }
    }

    public List<MaintenanceTicket> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<MaintenanceTicket> getTicketsForAsset(Integer assetId) {
        return ticketRepository.findByAsset_AssetIdOrderByCreatedAtDesc(assetId);
    }

    @Transactional
    public MaintenanceTicket createTicket(Map<String, Object> req, User loggedInUser) {
        String assetCode = req.get("assetCode") != null ? req.get("assetCode").toString().trim() : null;
        Integer assetId = toInt(req.get("assetId"));

        Asset asset = null;
        if (assetId != null) {
            asset = assetRepository.findById(assetId).orElse(null);
        }
        if (asset == null && assetCode != null) {
            asset = assetRepository.findByAssetCodeAndIsDeletedFalse(assetCode).orElse(null);
        }
        if (asset == null) throw new IllegalArgumentException("Asset not found.");

        // Generate ticket code: TKT-YYYY-XXXXXX
        long count = ticketRepository.count() + 1;
        String ticketCode = String.format("TKT-%d-%06d", LocalDate.now().getYear(), count);

        MaintenanceTicket ticket = new MaintenanceTicket();
        ticket.setTicketCode(ticketCode);
        ticket.setAsset(asset);
        ticket.setProblemDesc(req.get("problemDesc") != null ? req.get("problemDesc").toString() : "");
        ticket.setTechnician(req.get("technician") != null ? req.get("technician").toString() : null);
        ticket.setTicketStatus("open");
        ticket.setCreatedBy(loggedInUser);

        // Mark asset as under maintenance & condition damaged
        asset.setStatus("maintenance");
        conditionRepository.findByConditionNameIgnoreCase("Damaged").ifPresent(asset::setCondition);
        assetRepository.save(asset);

        MaintenanceTicket saved = ticketRepository.save(ticket);
        auditService.log("MAINTENANCE", saved.getTicketId(), "CREATE_TICKET", "status", asset.getStatus(), "maintenance",
                loggedInUser != null ? loggedInUser.getUserId() : null);
        return saved;
    }

    @Transactional
    public MaintenanceTicket updateTicket(Integer ticketId, Map<String, Object> req, User loggedInUser) {
        MaintenanceTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        String newStatus = req.get("ticketStatus") != null ? req.get("ticketStatus").toString() : null;
        if (newStatus != null) ticket.setTicketStatus(newStatus);

        if (req.get("technician") != null) ticket.setTechnician(req.get("technician").toString());

        if ("closed".equals(newStatus)) {
            // Record completion details
            if (req.get("serviceDate") != null && !req.get("serviceDate").toString().isBlank()) {
                ticket.setServiceDate(LocalDate.parse(req.get("serviceDate").toString()));
            } else {
                ticket.setServiceDate(LocalDate.now());
            }
            if (req.get("serviceCost") != null) {
                ticket.setServiceCost(new BigDecimal(req.get("serviceCost").toString()));
            }
            if (req.get("serviceRemarks") != null) ticket.setServiceRemarks(req.get("serviceRemarks").toString());

            // Restore asset to available + good condition
            Asset asset = ticket.getAsset();
            asset.setStatus("available");
            conditionRepository.findByConditionNameIgnoreCase("Good").ifPresent(asset::setCondition);
            assetRepository.save(asset);
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        MaintenanceTicket saved = ticketRepository.save(ticket);
        auditService.log("MAINTENANCE", ticketId, "UPDATE_TICKET", "ticket_status", null, newStatus,
                loggedInUser != null ? loggedInUser.getUserId() : null);
        return saved;
    }
}

package com.mmcoe.assettracking.controller;

import com.mmcoe.assettracking.model.MaintenanceTicket;
import com.mmcoe.assettracking.model.User;
import com.mmcoe.assettracking.service.AuthService;
import com.mmcoe.assettracking.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    private final AuthService authService;

    public MaintenanceController(MaintenanceService maintenanceService, AuthService authService) {
        this.maintenanceService = maintenanceService;
        this.authService = authService;
    }

    // GET /api/maintenance — list all tickets
    @GetMapping
    public ResponseEntity<?> getAllTickets(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            authService.validateToken(token);
            List<MaintenanceTicket> tickets = maintenanceService.getAllTickets();
            return ResponseEntity.ok(Map.of("ok", true, "tickets", tickets));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    // GET /api/maintenance/asset/{assetId} — tickets for a specific asset
    @GetMapping("/asset/{assetId}")
    public ResponseEntity<?> getTicketsForAsset(
            @PathVariable Integer assetId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            authService.validateToken(token);
            return ResponseEntity.ok(Map.of("ok", true, "tickets",
                    maintenanceService.getTicketsForAsset(assetId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    // POST /api/maintenance — create ticket
    @PostMapping
    public ResponseEntity<?> createTicket(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User user = authService.validateToken(token);
            MaintenanceTicket ticket = maintenanceService.createTicket(body, user);
            return ResponseEntity.ok(Map.of("ok", true, "ticket", ticket));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    // PUT /api/maintenance/{id} — update status / complete ticket
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTicket(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User user = authService.validateToken(token);
            MaintenanceTicket ticket = maintenanceService.updateTicket(id, body, user);
            return ResponseEntity.ok(Map.of("ok", true, "ticket", ticket));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }
}

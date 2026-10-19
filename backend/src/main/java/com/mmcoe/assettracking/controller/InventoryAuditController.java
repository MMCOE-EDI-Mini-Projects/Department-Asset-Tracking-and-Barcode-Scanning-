package com.mmcoe.assettracking.controller;

import com.mmcoe.assettracking.model.AuditCycle;
import com.mmcoe.assettracking.model.AuditItem;
import com.mmcoe.assettracking.model.User;
import com.mmcoe.assettracking.service.AuthService;
import com.mmcoe.assettracking.service.InventoryAuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit-cycles")
public class InventoryAuditController {

    private final InventoryAuditService auditService;
    private final AuthService authService;

    public InventoryAuditController(InventoryAuditService auditService, AuthService authService) {
        this.auditService = auditService;
        this.authService = authService;
    }

    // GET /api/audit-cycles — list all audits
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            authService.validateToken(token);
            List<AuditCycle> audits = auditService.getAllAudits();
            return ResponseEntity.ok(Map.of("ok", true, "audits", audits));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    // POST /api/audit-cycles — create audit
    @PostMapping
    public ResponseEntity<?> createAudit(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User user = authService.validateToken(token);
            AuditCycle cycle = auditService.createAudit(body, user);
            return ResponseEntity.ok(Map.of("ok", true, "audit", cycle));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    // GET /api/audit-cycles/{id}/items — get all items of an audit
    @GetMapping("/{id}/items")
    public ResponseEntity<?> getItems(
            @PathVariable Integer id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            authService.validateToken(token);
            List<AuditItem> items = auditService.getAuditItems(id);
            return ResponseEntity.ok(Map.of("ok", true, "items", items));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    // PUT /api/audit-cycles/items/{itemId}/verify — verify a single asset in audit
    @PutMapping("/items/{itemId}/verify")
    public ResponseEntity<?> verifyItem(
            @PathVariable Integer itemId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User user = authService.validateToken(token);
            AuditItem item = auditService.verifyItem(itemId, body, user);
            return ResponseEntity.ok(Map.of("ok", true, "item", item));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    // POST /api/audit-cycles/{id}/complete — close out audit
    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeAudit(
            @PathVariable Integer id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User user = authService.validateToken(token);
            AuditCycle cycle = auditService.completeAudit(id, user);
            return ResponseEntity.ok(Map.of("ok", true, "audit", cycle));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }
}

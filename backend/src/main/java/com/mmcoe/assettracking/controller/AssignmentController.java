package com.mmcoe.assettracking.controller;

import com.mmcoe.assettracking.model.AssetAssignment;
import com.mmcoe.assettracking.model.AssetTransfer;
import com.mmcoe.assettracking.model.User;
import com.mmcoe.assettracking.service.AssignmentService;
import com.mmcoe.assettracking.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AssignmentController {
    private final AssignmentService assignmentService;
    private final AuthService authService;

    public AssignmentController(AssignmentService assignmentService, AuthService authService) {
        this.assignmentService = assignmentService;
        this.authService = authService;
    }

    @PostMapping("/assignments")
    public ResponseEntity<?> assignAsset(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User user = authService.validateToken(token);
            AssetAssignment assignment = assignmentService.assignAsset(body, user);
            return ResponseEntity.ok(Map.of("ok", true, "assignment", assignment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/transfers")
    public ResponseEntity<?> getTransfers() {
        List<AssetTransfer> transfers = assignmentService.getAllTransfers();
        return ResponseEntity.ok(Map.of("ok", true, "transfers", transfers));
    }

    @PostMapping("/transfers")
    public ResponseEntity<?> transferAsset(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User user = authService.validateToken(token);
            AssetTransfer transfer = assignmentService.transferAsset(body, user);
            return ResponseEntity.ok(Map.of("ok", true, "transfer", transfer));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }
}

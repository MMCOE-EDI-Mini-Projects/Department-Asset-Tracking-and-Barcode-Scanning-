package com.mmcoe.assettracking.controller;

import com.mmcoe.assettracking.model.DisposalRequest;
import com.mmcoe.assettracking.model.User;
import com.mmcoe.assettracking.service.AuthService;
import com.mmcoe.assettracking.service.DisposalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/disposal")
public class DisposalController {
    private final DisposalService disposalService;
    private final AuthService authService;

    public DisposalController(DisposalService disposalService, AuthService authService) {
        this.disposalService = disposalService;
        this.authService = authService;
    }

    @GetMapping("/requests")
    public ResponseEntity<?> getRequests(@RequestParam(required = false) String status) {
        List<DisposalRequest> list = disposalService.getAllRequests(status);
        return ResponseEntity.ok(Map.of("ok", true, "requests", list));
    }

    @PostMapping("/request")
    public ResponseEntity<?> createRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User user = authService.validateToken(token);
            DisposalRequest dr = disposalService.createRequest(body, user);
            return ResponseEntity.ok(Map.of("ok", true, "request", dr));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable Integer id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User user = authService.validateToken(token);
            DisposalRequest dr = disposalService.approveRequest(id, user);
            return ResponseEntity.ok(Map.of("ok", true, "request", dr));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/finalize")
    public ResponseEntity<?> finalizeRequest(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User user = authService.validateToken(token);
            DisposalRequest dr = disposalService.finalizeDisposal(id, body != null ? body : Map.of(), user);
            return ResponseEntity.ok(Map.of("ok", true, "request", dr));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }
}

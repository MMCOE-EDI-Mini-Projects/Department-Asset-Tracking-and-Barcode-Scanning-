package com.mmcoe.assettracking.controller;

import com.mmcoe.assettracking.model.Receipt;
import com.mmcoe.assettracking.model.User;
import com.mmcoe.assettracking.repository.ReceiptRepository;
import com.mmcoe.assettracking.service.AssetService;
import com.mmcoe.assettracking.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {
    private final ReceiptRepository receiptRepository;
    private final AssetService assetService;
    private final AuthService authService;

    public ReceiptController(ReceiptRepository receiptRepository,
                             AssetService assetService,
                             AuthService authService) {
        this.receiptRepository = receiptRepository;
        this.assetService = assetService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<?> getReceipts() {
        List<Receipt> receipts = receiptRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(Map.of("ok", true, "receipts", receipts));
    }

    @PostMapping("/batch-register")
    public ResponseEntity<?> batchRegister(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User user = authService.validateToken(token);
            Map<String, Object> res = assetService.registerBatchReceipt(body, user);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }
}

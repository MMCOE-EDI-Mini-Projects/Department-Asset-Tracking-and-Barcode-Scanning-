package com.mmcoe.assettracking.controller;

import com.mmcoe.assettracking.model.Asset;
import com.mmcoe.assettracking.service.AssetService;
import com.mmcoe.assettracking.service.BarcodeService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/barcode")
public class BarcodeController {
    private final BarcodeService barcodeService;
    private final AssetService assetService;

    public BarcodeController(BarcodeService barcodeService, AssetService assetService) {
        this.barcodeService = barcodeService;
        this.assetService = assetService;
    }

    @GetMapping("/generate")
    public ResponseEntity<byte[]> getBarcode(
            @RequestParam String code,
            @RequestParam(defaultValue = "300") int width,
            @RequestParam(defaultValue = "100") int height) {
        byte[] bytes = barcodeService.generateBarcode(code, width, height);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE)
                .body(bytes);
    }

    @GetMapping("/qr")
    public ResponseEntity<byte[]> getQr(
            @RequestParam String text,
            @RequestParam(defaultValue = "250") int width,
            @RequestParam(defaultValue = "250") int height) {
        byte[] bytes = barcodeService.generateQrCode(text, width, height);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE)
                .body(bytes);
    }

    @PostMapping("/decode")
    public ResponseEntity<?> decodeImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Uploaded file is empty"));
            }
            String decodedText = barcodeService.decodeBarcode(file.getInputStream());
            decodedText = decodedText.trim();

            // Try to find matching asset
            Optional<Asset> assetOpt = assetService.findByCode(decodedText);
            if (assetOpt.isEmpty()) {
                // If QR code contained JSON, parse code field
                if (decodedText.startsWith("{") && decodedText.contains("\"code\":")) {
                    int idx = decodedText.indexOf("\"code\":");
                    int start = decodedText.indexOf("\"", idx + 7);
                    int end = decodedText.indexOf("\"", start + 1);
                    if (start != -1 && end != -1) {
                        String extracted = decodedText.substring(start + 1, end);
                        assetOpt = assetService.findByCode(extracted);
                    }
                }
            }

            return ResponseEntity.ok(Map.of(
                    "ok", true,
                    "code", decodedText,
                    "found", assetOpt.isPresent(),
                    "asset", assetOpt.orElse(null)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }
}

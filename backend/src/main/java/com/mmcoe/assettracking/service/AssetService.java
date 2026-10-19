package com.mmcoe.assettracking.service;

import com.mmcoe.assettracking.model.*;
import com.mmcoe.assettracking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class AssetService {
    private final AssetRepository assetRepository;
    private final AssetTagRepository assetTagRepository;
    private final ReceiptRepository receiptRepository;
    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final AssetConditionRepository conditionRepository;
    private final ReceivingTypeRepository receivingTypeRepository;
    private final UserRepository userRepository;
    private final SequenceService sequenceService;
    private final AuditService auditService;

    public AssetService(AssetRepository assetRepository,
                        AssetTagRepository assetTagRepository,
                        ReceiptRepository receiptRepository,
                        DepartmentRepository departmentRepository,
                        LocationRepository locationRepository,
                        CategoryRepository categoryRepository,
                        SupplierRepository supplierRepository,
                        AssetConditionRepository conditionRepository,
                        ReceivingTypeRepository receivingTypeRepository,
                        UserRepository userRepository,
                        SequenceService sequenceService,
                        AuditService auditService) {
        this.assetRepository = assetRepository;
        this.assetTagRepository = assetTagRepository;
        this.receiptRepository = receiptRepository;
        this.departmentRepository = departmentRepository;
        this.locationRepository = locationRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.conditionRepository = conditionRepository;
        this.receivingTypeRepository = receivingTypeRepository;
        this.userRepository = userRepository;
        this.sequenceService = sequenceService;
        this.auditService = auditService;
    }

    /** Safely converts Object (may be String or Number from JSON) to Integer. Returns null if blank/null. */
    private Integer toInt(Object val) {
        if (val == null) return null;
        String s = val.toString().trim();
        if (s.isEmpty()) return null;
        try { return (int) Double.parseDouble(s); } catch (NumberFormatException e) { return null; }
    }

    public List<Asset> searchAssets(Integer deptId, Integer catId, String status, String search) {
        return assetRepository.searchAssets(deptId, catId, status, search);
    }

    public Optional<Asset> findByCode(String code) {
        return assetRepository.findByAssetCodeAndIsDeletedFalse(code);
    }

    public Optional<Asset> findById(Integer id) {
        return assetRepository.findById(id).filter(a -> !a.getIsDeleted());
    }

    public boolean isSerialTaken(String serial) {
        if (serial == null || serial.isBlank()) return false;
        return assetRepository.findBySerialNumberAndIsDeletedFalse(serial.trim()).isPresent();
    }

    @Transactional
    public Asset registerSingleAsset(Map<String, Object> req, User loggedInUser) {
        String name = (String) req.get("name");
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Asset name is required.");

        String serialNumber = req.get("serialNumber") != null ? ((String) req.get("serialNumber")).trim() : null;
        if (serialNumber != null && !serialNumber.isBlank() && isSerialTaken(serialNumber)) {
            throw new IllegalArgumentException("Serial number '" + serialNumber + "' is already registered.");
        }

        String assetCode = (String) req.get("assetCode");
        if (assetCode == null || assetCode.isBlank()) {
            assetCode = sequenceService.nextCode("ASSET", "AST");
        }

        Asset asset = new Asset();
        asset.setAssetCode(assetCode);
        asset.setName(name.trim());
        asset.setMake((String) req.get("make"));
        asset.setModel((String) req.get("model"));
        asset.setSerialNumber(serialNumber);

        Integer categoryId = toInt(req.get("categoryId"));
        if (categoryId != null) categoryRepository.findById(categoryId).ifPresent(asset::setCategory);

        Integer departmentId = toInt(req.get("departmentId"));
        if (departmentId != null) departmentRepository.findById(departmentId).ifPresent(asset::setDepartment);

        Integer locationId = toInt(req.get("locationId"));
        if (locationId != null) locationRepository.findById(locationId).ifPresent(asset::setLocation);

        Integer custodianId = toInt(req.get("custodianId"));
        if (custodianId != null) userRepository.findById(custodianId).ifPresent(asset::setCustodian);

        Integer conditionId = toInt(req.get("conditionId"));
        if (conditionId != null) conditionRepository.findById(conditionId).ifPresent(asset::setCondition);

        if (req.get("cost") != null) {
            asset.setCost(new BigDecimal(req.get("cost").toString()));
        }
        if (req.get("purchaseDate") != null && !req.get("purchaseDate").toString().isBlank()) {
            asset.setPurchaseDate(LocalDate.parse(req.get("purchaseDate").toString()));
        }
        if (req.get("warrantyExpiry") != null && !req.get("warrantyExpiry").toString().isBlank()) {
            asset.setWarrantyExpiry(LocalDate.parse(req.get("warrantyExpiry").toString()));
        }

        boolean reqApproval = Boolean.TRUE.equals(req.get("requiresApproval"));
        if (asset.getCondition() != null && Boolean.TRUE.equals(asset.getCondition().getBlocksUsage())) {
            reqApproval = true;
        }
        asset.setRequiresApproval(reqApproval);
        asset.setStatus(reqApproval ? "pending_approval" : (req.get("status") != null ? (String) req.get("status") : "available"));
        asset.setRemarks((String) req.get("remarks"));
        asset.setRegisteredBy(loggedInUser);
        asset.setBarcodeValue(assetCode);

        Map<String, Object> qrMap = new HashMap<>();
        qrMap.put("code", assetCode);
        qrMap.put("name", asset.getName());
        qrMap.put("dept", asset.getDepartment() != null ? asset.getDepartment().getName() : "");
        asset.setQrPayload(qrMap.toString());

        Asset saved = assetRepository.save(asset);

        AssetTag tag = new AssetTag(saved, assetCode, "applied");
        assetTagRepository.save(tag);

        auditService.log("ASSET", saved.getAssetId(), "CREATE", null, null, assetCode, loggedInUser != null ? loggedInUser.getUserId() : null);

        return saved;
    }

    @Transactional
    public Map<String, Object> registerBatchReceipt(Map<String, Object> req, User loggedInUser) {
        String assetName = (String) req.get("assetName");
        if (assetName == null || assetName.isBlank()) throw new IllegalArgumentException("Asset name is required.");

        Integer quantityVal = toInt(req.get("quantity"));
        int quantity = (quantityVal != null) ? quantityVal : 1;
        if (quantity < 1 || quantity > 100) throw new IllegalArgumentException("Quantity must be between 1 and 100.");

        @SuppressWarnings("unchecked")
        List<String> serials = req.get("serialNumbers") instanceof List ? (List<String>) req.get("serialNumbers") : Collections.emptyList();

        for (String s : serials) {
            if (s != null && !s.isBlank() && isSerialTaken(s)) {
                throw new IllegalArgumentException("Serial number '" + s + "' is already registered.");
            }
        }

        String receiptCode = sequenceService.nextCode("RECEIPT", "REC");
        Receipt receipt = new Receipt();
        receipt.setReceiptCode(receiptCode);

        Integer receivingTypeId = toInt(req.get("receivingTypeId"));
        if (receivingTypeId != null) receivingTypeRepository.findById(receivingTypeId).ifPresent(receipt::setReceivingType);

        Integer supplierId = toInt(req.get("supplierId"));
        if (supplierId != null) supplierRepository.findById(supplierId).ifPresent(receipt::setSupplier);
        receipt.setSupplierName(req.get("supplierName") != null ? (String) req.get("supplierName") : "Direct Purchase");
        receipt.setInvoiceNumber((String) req.get("invoiceNumber"));
        if (req.get("invoiceDate") != null && !req.get("invoiceDate").toString().isBlank()) {
            receipt.setInvoiceDate(LocalDate.parse(req.get("invoiceDate").toString()));
        }
        receipt.setReceiptDate(req.get("receiptDate") != null && !req.get("receiptDate").toString().isBlank()
                ? LocalDate.parse(req.get("receiptDate").toString()) : LocalDate.now());
        receipt.setQuantity(quantity);

        BigDecimal unitCost = req.get("unitCost") != null ? new BigDecimal(req.get("unitCost").toString()) : BigDecimal.ZERO;
        receipt.setUnitCost(unitCost);
        receipt.setTotalCost(unitCost.multiply(BigDecimal.valueOf(quantity)));
        receipt.setReceivingRemarks((String) req.get("receivingRemarks"));
        receipt.setReceivedBy(loggedInUser != null ? loggedInUser : userRepository.findById(1).orElse(null));
        receipt.setApprovalStatus("approved");

        Receipt savedReceipt = receiptRepository.save(receipt);

        List<Asset> createdAssets = new ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            String assetCode = sequenceService.nextCode("ASSET", "AST");
            Asset a = new Asset();
            a.setAssetCode(assetCode);
            a.setName(assetName);
            a.setMake((String) req.get("make"));
            a.setModel((String) req.get("model"));
            a.setReceipt(savedReceipt);

            if (i < serials.size() && serials.get(i) != null && !serials.get(i).isBlank()) {
                a.setSerialNumber(serials.get(i).trim());
            }

            Integer bCategoryId = toInt(req.get("categoryId"));
            if (bCategoryId != null) categoryRepository.findById(bCategoryId).ifPresent(a::setCategory);

            Integer bDepartmentId = toInt(req.get("departmentId"));
            if (bDepartmentId != null) departmentRepository.findById(bDepartmentId).ifPresent(a::setDepartment);

            Integer bLocationId = toInt(req.get("locationId"));
            if (bLocationId != null) locationRepository.findById(bLocationId).ifPresent(a::setLocation);

            Integer bConditionId = toInt(req.get("conditionId"));
            if (bConditionId != null) conditionRepository.findById(bConditionId).ifPresent(a::setCondition);

            a.setCost(unitCost);
            if (req.get("purchaseDate") != null && !req.get("purchaseDate").toString().isBlank()) {
                a.setPurchaseDate(LocalDate.parse(req.get("purchaseDate").toString()));
            }
            if (req.get("warrantyExpiry") != null && !req.get("warrantyExpiry").toString().isBlank()) {
                a.setWarrantyExpiry(LocalDate.parse(req.get("warrantyExpiry").toString()));
            }

            boolean reqApproval = Boolean.TRUE.equals(req.get("requiresApproval"));
            if (a.getCondition() != null && Boolean.TRUE.equals(a.getCondition().getBlocksUsage())) {
                reqApproval = true;
            }
            a.setRequiresApproval(reqApproval);
            a.setStatus(reqApproval ? "pending_approval" : "available");
            a.setBarcodeValue(assetCode);
            a.setRemarks((String) req.get("remarks"));
            a.setRegisteredBy(loggedInUser);

            Asset savedAsset = assetRepository.save(a);
            assetTagRepository.save(new AssetTag(savedAsset, assetCode, "applied"));
            createdAssets.add(savedAsset);

            auditService.log("ASSET", savedAsset.getAssetId(), "CREATE", null, null, assetCode, loggedInUser != null ? loggedInUser.getUserId() : null);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("ok", true);
        result.put("receiptCode", receiptCode);
        result.put("count", createdAssets.size());
        result.put("assets", createdAssets);
        return result;
    }

    @Transactional
    public Asset approveAsset(Integer assetId, User user) {
        Asset a = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        a.setRequiresApproval(false);
        a.setStatus("available");
        Asset saved = assetRepository.save(a);
        auditService.log("ASSET", a.getAssetId(), "APPROVE", "status", "pending_approval", "available", user != null ? user.getUserId() : null);
        return saved;
    }

    @Transactional
    public Asset rejectAsset(Integer assetId, String reason, User user) {
        Asset a = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        a.setStatus("rejected");
        a.setRemarks((a.getRemarks() != null ? a.getRemarks() + " | " : "") + "Rejected: " + reason);
        Asset saved = assetRepository.save(a);
        auditService.log("ASSET", a.getAssetId(), "REJECT", "status", "pending_approval", "rejected", user != null ? user.getUserId() : null);
        return saved;
    }
}

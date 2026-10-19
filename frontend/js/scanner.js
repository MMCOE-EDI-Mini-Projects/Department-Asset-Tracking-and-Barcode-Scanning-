/**
 * Department Asset Tracking and Barcode Scanning System
 * Barcode Scanner & Asset Verification Engine (Module 3 & 4)
 * Supports: Camera scanning (rear/environment preference, device selection),
 * USB laser barcode scanner (keyboard-wedge rapid keystroke capture),
 * photo decoding via ZXing backend, asset verification modal, and scan history.
 */

(function () {
    "use strict";

    // Application state
    const ScannerState = {
        videoStream: null,
        scanInterval: null,
        isScanning: false,
        isVerifying: false,
        currentAsset: null,
        selectedCameraId: null,
        availableCameras: [],
        lastScannedCode: null,
        lastScanTime: 0,
        suppressCooldownMs: 2500, // Cooldown window to prevent duplicate scan popups
        historyStorageKey: "mmcoe_asset_recent_scans_v1",
        maxHistoryItems: 10
    };

    // USB Laser Scanner (Keyboard Wedge) buffer
    const UsbScanner = {
        buffer: "",
        lastKeyTime: 0,
        KEY_SPEED_THRESHOLD_MS: 50, // Rapid keystroke threshold from hardware wedge
        MIN_BARCODE_LENGTH: 3
    };

    // Initialize on DOM Ready
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof Auth !== "undefined" && Auth.requireAuth) {
            Auth.requireAuth();
        }
        if (typeof renderNavbar === "function") {
            renderNavbar("scanner");
        }

        initEventListeners();
        initCameraDevices();
        renderScanHistory();

        // Check if barcode passed via URL query parameter (e.g. scanner.html?code=AST-2026-001001)
        const params = new URLSearchParams(window.location.search);
        const codeParam = params.get("code");
        if (codeParam) {
            const inputEl = document.getElementById("scanCodeInput");
            if (inputEl) inputEl.value = codeParam;
            handleBarcodeIdentified(codeParam.trim(), "URL Parameter");
        }
    });

    /**
     * Bind UI event listeners
     */
    function initEventListeners() {
        // Manual lookup form submission
        const form = document.getElementById("lookupForm");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const input = document.getElementById("scanCodeInput");
                const code = input ? input.value.trim() : "";
                if (code) {
                    handleBarcodeIdentified(code, "Manual Input");
                }
            });
        }

        // Camera Toggle Button
        const btnToggle = document.getElementById("btnToggleCamera");
        if (btnToggle) {
            btnToggle.addEventListener("click", toggleCamera);
        }

        // Camera Device Selection change
        const cameraSelect = document.getElementById("cameraSelect");
        if (cameraSelect) {
            cameraSelect.addEventListener("change", (e) => {
                ScannerState.selectedCameraId = e.target.value;
                if (ScannerState.isScanning) {
                    // Seamlessly restart with the new camera device
                    stopCamera();
                    startCamera(ScannerState.selectedCameraId);
                }
            });
        }

        // Image file upload
        const fileInput = document.getElementById("fileInput");
        if (fileInput) {
            fileInput.addEventListener("change", handleImageUpload);
        }

        // Verification Modal Close Buttons
        const btnCloseModal = document.getElementById("btnModalClose");
        if (btnCloseModal) {
            btnCloseModal.addEventListener("click", closeVerificationModal);
        }

        const modalOverlay = document.getElementById("verificationModal");
        if (modalOverlay) {
            modalOverlay.addEventListener("click", (e) => {
                if (e.target === modalOverlay) {
                    closeVerificationModal();
                }
            });
        }

        // Retry button inside verification modal
        const btnRetry = document.getElementById("modalRetryBtn");
        if (btnRetry) {
            btnRetry.addEventListener("click", () => {
                if (ScannerState.lastScannedCode) {
                    verifyAssetCode(ScannerState.lastScannedCode, "Retry");
                }
            });
        }

        // Global Keyboard Wedge & Shortcut Listener
        window.addEventListener("keydown", handleGlobalKeyDown);

        // Lifecycle cleanup: ensure camera tracks are released when navigating away
        window.addEventListener("beforeunload", stopCamera);
        window.addEventListener("pagehide", stopCamera);
    }

    /**
     * Global keyboard listener to capture USB Laser Barcode Scanners (Keyboard Wedge)
     * and handle accessibility hotkeys (Escape to close modal).
     */
    function handleGlobalKeyDown(e) {
        // Accessibility: Escape closes modal
        if (e.key === "Escape") {
            const modal = document.getElementById("verificationModal");
            if (modal && modal.classList.contains("active")) {
                closeVerificationModal();
                return;
            }
        }

        // Ignore modifier keys, special navigation keys (except Enter/Tab)
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        if (e.key.length > 1 && e.key !== "Enter" && e.key !== "Tab") return;

        const now = Date.now();
        const activeEl = document.activeElement;
        const scanInput = document.getElementById("scanCodeInput");

        // Check if user is typing in another input / textarea (not scanCodeInput)
        const isOtherInputFocused = activeEl &&
            activeEl !== scanInput &&
            (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable);

        // If another input is focused and the keystroke speed is human-paced (> 50ms), let it type normally
        if (isOtherInputFocused && (now - UsbScanner.lastKeyTime) > UsbScanner.KEY_SPEED_THRESHOLD_MS) {
            UsbScanner.buffer = "";
            UsbScanner.lastKeyTime = now;
            return;
        }

        // Scanners end their payload with Enter or Tab
        if (e.key === "Enter" || e.key === "Tab") {
            if (UsbScanner.buffer.length >= UsbScanner.MIN_BARCODE_LENGTH) {
                e.preventDefault();
                const code = UsbScanner.buffer.trim();
                UsbScanner.buffer = "";

                if (scanInput) {
                    scanInput.value = code;
                }
                handleBarcodeIdentified(code, "USB Laser Scanner");
                return;
            }
            UsbScanner.buffer = "";
            return;
        }

        // Regular character keystroke
        if (e.key.length === 1) {
            const timeSinceLastKey = now - UsbScanner.lastKeyTime;
            if (timeSinceLastKey > UsbScanner.KEY_SPEED_THRESHOLD_MS && UsbScanner.buffer.length > 0) {
                // Interval was too long for continuous hardware scanner burst; reset buffer
                UsbScanner.buffer = e.key;
            } else {
                UsbScanner.buffer += e.key;
            }
            UsbScanner.lastKeyTime = now;
        }
    }

    /**
     * Check for available video cameras and populate camera select dropdown
     */
    async function initCameraDevices() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return;
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === "videoinput");
            ScannerState.availableCameras = videoDevices;

            const selectContainer = document.getElementById("cameraSelectContainer");
            const selectEl = document.getElementById("cameraSelect");

            if (!selectEl) return;
            selectEl.innerHTML = "";

            if (videoDevices.length > 1) {
                if (selectContainer) selectContainer.style.display = "block";

                videoDevices.forEach((dev, idx) => {
                    const opt = document.createElement("option");
                    opt.value = dev.deviceId;
                    opt.textContent = dev.label || `Camera ${idx + 1} (${dev.deviceId.slice(0, 8)}…)`;
                    selectEl.appendChild(opt);
                });
            } else if (selectContainer) {
                selectContainer.style.display = "none";
            }
        } catch (err) {
            console.warn("Could not enumerate video devices:", err);
        }
    }

    /**
     * Start/Stop Camera toggle controller
     */
    async function toggleCamera() {
        if (ScannerState.isScanning) {
            stopCamera();
        } else {
            const selectEl = document.getElementById("cameraSelect");
            const deviceId = (selectEl && selectEl.value) ? selectEl.value : ScannerState.selectedCameraId;
            await startCamera(deviceId);
        }
    }

    /**
     * Start Camera Stream
     */
    async function startCamera(deviceId = null) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showToast("Camera API is not supported in this browser environment.", "error");
            updateScanBadge("Unsupported", "badge-disposed");
            return;
        }

        const video = document.getElementById("cameraVideo");
        const placeholder = document.getElementById("cameraPlaceholder");
        const wrapper = document.getElementById("cameraWrapper");
        const btnToggle = document.getElementById("btnToggleCamera");

        // Constraints: prefer environment-facing (rear camera) on mobile, or chosen deviceId
        const constraints = {
            video: deviceId
                ? { deviceId: { exact: deviceId } }
                : { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
        };

        updateScanBadge("Connecting…", "badge-maintenance");

        try {
            ScannerState.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = ScannerState.videoStream;
            await video.play();

            ScannerState.isScanning = true;
            if (wrapper) wrapper.style.display = "block";
            if (placeholder) placeholder.style.display = "none";

            if (btnToggle) {
                btnToggle.textContent = "Stop Camera";
                btnToggle.className = "btn btn-danger btn-sm";
            }

            updateScanBadge("Scanning…", "badge-maintenance");
            showToast("Camera active. Point viewfinder at barcode.", "info");

            // Re-enumerate to get device labels now that permission was granted
            if (ScannerState.availableCameras.length <= 1) {
                await initCameraDevices();
            }

            startBarcodeDetection(video);
        } catch (err) {
            ScannerState.isScanning = false;
            stopCamera();

            let friendlyMessage = "Could not start camera: " + (err.message || "Unknown error");
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                friendlyMessage = "Camera permission was denied. Please allow camera permissions in your browser or use USB scanner / manual code entry.";
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                friendlyMessage = "No camera found on this device. You can use USB laser barcode scanner or enter the code manually.";
            } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
                friendlyMessage = "Camera is already in use by another application.";
            }

            showToast(friendlyMessage, "error");
            updateScanBadge("Error", "badge-disposed");
        }
    }

    /**
     * Stop Camera Stream and release all hardware tracks
     */
    function stopCamera() {
        if (ScannerState.videoStream) {
            try {
                ScannerState.videoStream.getTracks().forEach(track => {
                    track.stop();
                });
            } catch (e) {
                console.warn("Error stopping media tracks:", e);
            }
            ScannerState.videoStream = null;
        }

        if (ScannerState.scanInterval) {
            clearInterval(ScannerState.scanInterval);
            ScannerState.scanInterval = null;
        }

        ScannerState.isScanning = false;

        const video = document.getElementById("cameraVideo");
        if (video) {
            video.srcObject = null;
        }

        const wrapper = document.getElementById("cameraWrapper");
        if (wrapper) wrapper.style.display = "none";

        const placeholder = document.getElementById("cameraPlaceholder");
        if (placeholder) placeholder.style.display = "block";

        const btnToggle = document.getElementById("btnToggleCamera");
        if (btnToggle) {
            btnToggle.textContent = "Start Camera";
            btnToggle.className = "btn btn-secondary btn-sm";
        }

        if (!ScannerState.isVerifying) {
            updateScanBadge("Ready", "badge-assigned");
        }
    }

    /**
     * Start continuous barcode detection on the video element
     */
    function startBarcodeDetection(video) {
        if (ScannerState.scanInterval) {
            clearInterval(ScannerState.scanInterval);
        }

        // Native BarcodeDetector (Chrome, Edge, Opera, Android Chrome)
        if ("BarcodeDetector" in window) {
            try {
                const formats = ["code_128", "qr_code", "code_39", "ean_13", "ean_8", "upc_a", "upc_e"];
                const detector = new BarcodeDetector({ formats });

                ScannerState.scanInterval = setInterval(async () => {
                    if (!ScannerState.videoStream || video.readyState < 2) return;
                    try {
                        const barcodes = await detector.detect(video);
                        if (barcodes && barcodes.length > 0) {
                            const raw = barcodes[0].rawValue;
                            if (raw) {
                                handleBarcodeIdentified(raw.trim(), "Camera (Native)");
                            }
                        }
                    } catch (e) {
                        // Suppress detector frame errors
                    }
                }, 300);
                return;
            } catch (err) {
                console.warn("BarcodeDetector initialization failed, falling back to backend snapshot decoder:", err);
            }
        }

        // Fallback: periodic snapshot sent to backend ZXing MultiFormatReader
        const canvas = document.getElementById("cameraCanvas") || document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        ScannerState.scanInterval = setInterval(() => {
            if (!ScannerState.videoStream || video.videoWidth === 0 || ScannerState.isVerifying) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (!blob || !ScannerState.isScanning) return;
                decodeBlobWithServer(blob, true);
            }, "image/jpeg", 0.85);
        }, 1100);
    }

    /**
     * Decode an image blob via backend ZXing engine (/api/barcode/decode)
     */
    async function decodeBlobWithServer(blob, silent = false) {
        const formData = new FormData();
        formData.append("file", blob, "scan.jpg");

        try {
            const res = await API.post("/api/barcode/decode", formData);
            if (res && res.ok && res.code) {
                handleBarcodeIdentified(res.code.trim(), "Camera / ZXing Server");
            }
        } catch (e) {
            if (!silent) {
                showToast("Could not detect barcode from image: " + (e.message || "Unrecognized code format"), "error");
            }
        }
    }

    /**
     * Handle Image File Upload (drag & drop or file dialog)
     */
    function handleImageUpload(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        showToast("Decoding uploaded image with ZXing engine…", "info");

        // Try client-side BarcodeDetector first
        if ("BarcodeDetector" in window) {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = async () => {
                try {
                    const detector = new BarcodeDetector({ formats: ["code_128", "qr_code", "code_39", "ean_13", "ean_8", "upc_a", "upc_e"] });
                    const codes = await detector.detect(img);
                    if (codes && codes.length > 0 && codes[0].rawValue) {
                        handleBarcodeIdentified(codes[0].rawValue.trim(), "Uploaded Image (Client)");
                        return;
                    }
                } catch (err) {
                    console.warn("Client image decode fallback to server:", err);
                }
                // Fallback to server decoder
                decodeBlobWithServer(file, false);
            };
            img.onerror = () => decodeBlobWithServer(file, false);
        } else {
            decodeBlobWithServer(file, false);
        }

        // Reset file input so user can re-upload the same file if needed
        e.target.value = "";
    }

    /**
     * Central Dispatcher for any identified barcode:
     * Enforces duplicate-scan suppression, stops camera, updates input, and triggers verification.
     */
    function handleBarcodeIdentified(code, source = "Scanner") {
        if (!code) return;

        const now = Date.now();
        // Prevent duplicate scans within cooldown window
        if (code === ScannerState.lastScannedCode && (now - ScannerState.lastScanTime) < ScannerState.suppressCooldownMs) {
            return;
        }

        ScannerState.lastScannedCode = code;
        ScannerState.lastScanTime = now;

        // Populate manual input box
        const inputEl = document.getElementById("scanCodeInput");
        if (inputEl) {
            inputEl.value = code;
        }

        // If camera is running, pause/stop it so user can focus on verification
        if (ScannerState.isScanning) {
            stopCamera();
        }

        verifyAssetCode(code, source);
    }

    /**
     * Query Institutional Asset Registry and open Verification Modal
     */
    async function verifyAssetCode(code, source = "Scanner") {
        if (!code) return;

        ScannerState.isVerifying = true;
        updateScanBadge("Searching…", "badge-maintenance");

        // Open verification modal in loading state
        openVerificationModal("loading", code);

        try {
            const res = await API.get(`/api/assets/code/${encodeURIComponent(code)}`);

            if (res && res.ok && res.asset) {
                const asset = res.asset;
                ScannerState.currentAsset = asset;

                updateScanBadge("Asset Found", "badge-available");
                showToast(`Verified ${asset.name} (${asset.assetCode})`, "success");

                // Populate modal & in-page card
                populateVerificationSuccess(asset);
                openVerificationModal("success", code, asset);

                // Add to scan history
                addScanHistory({
                    code: asset.assetCode || code,
                    name: asset.name || "Unknown Asset",
                    outcome: "Verified",
                    source: source,
                    timestamp: new Date().toISOString()
                });
            } else {
                throw new Error("Asset record not found");
            }
        } catch (err) {
            ScannerState.currentAsset = null;
            updateScanBadge("Asset Not Found", "badge-disposed");
            showToast(`Asset '${code}' not found in registry`, "error");

            openVerificationModal("error", code, null, err.message || "Asset not found");

            // Add failure to scan history
            addScanHistory({
                code: code,
                name: "Unregistered Tag",
                outcome: "Not Found",
                source: source,
                timestamp: new Date().toISOString()
            });
        } finally {
            ScannerState.isVerifying = false;
        }
    }

    /**
     * Populate successful verification details into the modal and the page
     */
    function populateVerificationSuccess(asset) {
        // Safe Text Rendering Helper
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text !== null && text !== undefined ? String(text) : "—";
        };

        // Modal fields
        setText("modalAssetName", asset.name || "Unnamed Asset");
        setText("modalAssetCode", asset.assetCode || "—");
        setText("modalCategory", asset.category ? (asset.category.categoryName || asset.category.name) : "General Asset");
        setText("modalMakeModel", `${asset.make || "—"} / ${asset.model || "—"}`);
        setText("modalSerial", asset.serialNumber || "—");
        setText("modalCondition", asset.condition ? (asset.condition.conditionName || asset.condition.name) : "Good");
        setText("modalDept", asset.department ? (asset.department.name || asset.department.code) : "Unassigned");
        setText("modalLocation", asset.location ? `${asset.location.name} (${asset.location.locationCode || ""})` : "—");
        setText("modalCustodian", asset.custodian ? (asset.custodian.name || asset.custodian.username) : "None assigned");

        const updateTimeStr = asset.updatedAt
            ? (typeof formatDate === "function" ? formatDate(asset.updatedAt) : asset.updatedAt)
            : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setText("modalUpdatedAt", updateTimeStr);
        setText("modalVerifiedTime", `Verified at ${new Date().toLocaleTimeString()}`);

        // Modal Status Badge
        const statusBadge = document.getElementById("modalStatusBadge");
        if (statusBadge) {
            const rawStatus = (asset.status || "available").toLowerCase();
            statusBadge.className = `badge badge-${rawStatus}`;
            statusBadge.textContent = rawStatus.replace("_", " ").toUpperCase();
        }

        // Modal Barcode Image
        const barcodeImg = document.getElementById("modalBarcodeImg");
        if (barcodeImg) {
            barcodeImg.src = `/api/barcode/generate?code=${encodeURIComponent(asset.assetCode)}&width=220&height=40`;
        }

        // Modal Action Links
        const transferLink = document.getElementById("modalTransferLink");
        if (transferLink) {
            transferLink.href = `transfer.html?assetId=${asset.assetId}`;
        }
        const printBtn = document.getElementById("modalPrintBtn");
        if (printBtn) {
            printBtn.onclick = () => printTag(asset.assetCode);
        }

        // Also update the in-page Result Panel
        setText("resAssetName", asset.name || "—");
        setText("resAssetCode", asset.assetCode || "—");
        setText("resMakeModel", `${asset.make || "—"} / ${asset.model || "—"}`);
        setText("resSerial", asset.serialNumber || "—");
        setText("resDept", asset.department ? (asset.department.name || "Unassigned") : "Unassigned");
        setText("resLocation", asset.location ? `${asset.location.name} (${asset.location.locationCode || ""})` : "—");
        setText("resCustodian", asset.custodian ? (asset.custodian.name || "None") : "None assigned");
        setText("resCondition", asset.condition ? (asset.condition.conditionName || "Good") : "Good");

        const resBadge = document.getElementById("resStatusBadge");
        if (resBadge) {
            const rawStatus = (asset.status || "available").toLowerCase();
            resBadge.className = `badge badge-${rawStatus}`;
            resBadge.textContent = rawStatus.replace("_", " ").toUpperCase();
        }

        const resBarcode = document.getElementById("resBarcodeImg");
        if (resBarcode) {
            resBarcode.src = `/api/barcode/generate?code=${encodeURIComponent(asset.assetCode)}&width=220&height=44`;
        }

        const resTransfer = document.getElementById("btnTransferShortcut");
        if (resTransfer) resTransfer.href = `transfer.html?assetId=${asset.assetId}`;
        const resDisposal = document.getElementById("btnDisposalShortcut");
        if (resDisposal) resDisposal.href = `disposal.html?assetId=${asset.assetId}`;

        const resCard = document.getElementById("resultCard");
        if (resCard) {
            resCard.style.display = "block";
        }
    }

    /**
     * Open Verification Modal in one of three states: "loading", "success", "error"
     */
    function openVerificationModal(state, code, asset = null, errorMsg = "") {
        const modal = document.getElementById("verificationModal");
        if (!modal) return;

        const loadingBox = document.getElementById("modalLoadingState");
        const successBox = document.getElementById("modalSuccessState");
        const errorBox = document.getElementById("modalErrorState");

        if (loadingBox) loadingBox.style.display = state === "loading" ? "block" : "none";
        if (successBox) successBox.style.display = state === "success" ? "block" : "none";
        if (errorBox) errorBox.style.display = state === "error" ? "block" : "none";

        if (state === "loading") {
            const codeEl = document.getElementById("modalLoadingCode");
            if (codeEl) codeEl.textContent = code;
        } else if (state === "error") {
            const errHeading = document.getElementById("modalErrorHeading");
            if (errHeading) errHeading.textContent = "Asset Not Found in Registry";

            const errMsg = document.getElementById("modalErrorMessage");
            if (errMsg) {
                errMsg.textContent = `No institutional record matching code "${code}" exists in the asset database.`;
            }

            const regLink = document.getElementById("modalRegisterLink");
            if (regLink) {
                regLink.href = `register.html?code=${encodeURIComponent(code)}`;
            }
        }

        modal.classList.add("active");
    }

    /**
     * Close the Verification Modal and return keyboard focus to the scan input
     */
    function closeVerificationModal() {
        const modal = document.getElementById("verificationModal");
        if (modal) {
            modal.classList.remove("active");
        }
        const input = document.getElementById("scanCodeInput");
        if (input) {
            input.focus();
            input.select();
        }
    }

    /**
     * Print Barcode Label
     */
    function printTag(code) {
        if (!code) return;
        window.open(`/api/barcode/generate?code=${encodeURIComponent(code)}&width=450&height=120`, "_blank");
    }

    /**
     * Update the status badge in the scanner header
     */
    function updateScanBadge(label, badgeClass) {
        const badge = document.getElementById("scanStatusBadge");
        if (!badge) return;
        badge.textContent = label;
        badge.className = `badge ${badgeClass}`;
    }

    /**
     * Recent Scan History Management (localStorage)
     */
    function getScanHistory() {
        try {
            const raw = localStorage.getItem(ScannerState.historyStorageKey);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function saveScanHistory(list) {
        try {
            localStorage.setItem(ScannerState.historyStorageKey, JSON.stringify(list));
        } catch (e) {
            console.warn("Could not save scan history to storage:", e);
        }
    }

    function addScanHistory(entry) {
        let history = getScanHistory();

        // Prevent duplicate entry if identical to the most recent entry within 3 seconds
        if (history.length > 0) {
            const top = history[0];
            if (top.code === entry.code && top.outcome === entry.outcome) {
                const diff = new Date(entry.timestamp).getTime() - new Date(top.timestamp).getTime();
                if (diff < 3000) return;
            }
        }

        history.unshift(entry);
        if (history.length > ScannerState.maxHistoryItems) {
            history = history.slice(0, ScannerState.maxHistoryItems);
        }

        saveScanHistory(history);
        renderScanHistory();
    }

    function renderScanHistory() {
        const history = getScanHistory();
        const emptyEl = document.getElementById("scanHistoryEmpty");
        const tableContainer = document.getElementById("scanHistoryTableContainer");
        const tbody = document.getElementById("scanHistoryTableBody");
        const countBadge = document.getElementById("scanHistoryCount");

        if (countBadge) {
            countBadge.textContent = history.length;
        }

        if (!history || history.length === 0) {
            if (emptyEl) emptyEl.style.display = "block";
            if (tableContainer) tableContainer.style.display = "none";
            return;
        }

        if (emptyEl) emptyEl.style.display = "none";
        if (tableContainer) tableContainer.style.display = "block";
        if (!tbody) return;

        tbody.innerHTML = "";

        history.forEach((item) => {
            const tr = document.createElement("tr");

            // Format scan time
            let timeStr = "—";
            try {
                const d = new Date(item.timestamp);
                timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            } catch {
                timeStr = item.timestamp || "—";
            }

            // Outcome badge
            let badgeHtml = '<span class="badge badge-assigned">Scanned</span>';
            if (item.outcome === "Verified") {
                badgeHtml = '<span class="badge badge-available">Verified</span>';
            } else if (item.outcome === "Not Found") {
                badgeHtml = '<span class="badge badge-disposed">Not Found</span>';
            } else if (item.outcome === "Error") {
                badgeHtml = '<span class="badge badge-maintenance">Error</span>';
            }

            const tdTime = document.createElement("td");
            tdTime.style.whiteSpace = "nowrap";
            tdTime.style.color = "var(--text-muted)";
            tdTime.textContent = timeStr;

            const tdCode = document.createElement("td");
            const codeSpan = document.createElement("span");
            codeSpan.style.fontFamily = "monospace";
            codeSpan.style.fontWeight = "700";
            codeSpan.style.color = "var(--primary)";
            codeSpan.textContent = item.code;
            tdCode.appendChild(codeSpan);

            const tdName = document.createElement("td");
            tdName.textContent = item.name || "—";
            tdName.style.maxWidth = "160px";
            tdName.style.overflow = "hidden";
            tdName.style.textOverflow = "ellipsis";
            tdName.style.whiteSpace = "nowrap";

            const tdOutcome = document.createElement("td");
            tdOutcome.innerHTML = badgeHtml;

            const tdAction = document.createElement("td");
            tdAction.style.textAlign = "right";

            const btnView = document.createElement("button");
            btnView.type = "button";
            btnView.className = "btn btn-secondary btn-sm";
            btnView.style.padding = "2px 8px";
            btnView.style.fontSize = "11px";
            btnView.textContent = "Verify";
            btnView.onclick = () => {
                const input = document.getElementById("scanCodeInput");
                if (input) input.value = item.code;
                verifyAssetCode(item.code, "History Recall");
            };
            tdAction.appendChild(btnView);

            tr.appendChild(tdTime);
            tr.appendChild(tdCode);
            tr.appendChild(tdName);
            tr.appendChild(tdOutcome);
            tr.appendChild(tdAction);

            tbody.appendChild(tr);
        });
    }

    function clearScanHistory() {
        if (!confirm("Clear recent scan history from this browser?")) return;
        try {
            localStorage.removeItem(ScannerState.historyStorageKey);
            renderScanHistory();
            showToast("Scan history cleared", "info");
        } catch (e) {
            console.warn("Could not clear history:", e);
        }
    }

    // Expose helpers globally if required by inline buttons
    window.quickFill = (code) => {
        const input = document.getElementById("scanCodeInput");
        if (input) input.value = code;
        handleBarcodeIdentified(code, "Quick Fill");
    };
    window.toggleCamera = toggleCamera;
    window.handleImageUpload = handleImageUpload;
    window.closeVerificationModal = closeVerificationModal;
    window.clearScanHistory = clearScanHistory;
    window.printIdentifiedTag = () => {
        if (ScannerState.currentAsset && ScannerState.currentAsset.assetCode) {
            printTag(ScannerState.currentAsset.assetCode);
        }
    };
    window.resetScannerView = () => {
        const resCard = document.getElementById("resultCard");
        if (resCard) resCard.style.display = "none";
        const input = document.getElementById("scanCodeInput");
        if (input) input.value = "";
        updateScanBadge("Ready", "badge-assigned");
        ScannerState.currentAsset = null;
    };
})();

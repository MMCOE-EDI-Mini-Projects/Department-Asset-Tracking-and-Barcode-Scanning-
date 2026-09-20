"use strict";

/* =====================================================================
   Module 4 — Asset Receiving & Registration
   Talks to the Express/MySQL API in ../server. No data is invented on
   the client: codes, statuses and totals all come back from the database.
   ===================================================================== */

const API = "/api";

const state = {
    meta: null,
    user: null,
    documentId: null,
    page: 1,
    pages: 1,
    rows: []
};

const $ = (id) => document.getElementById(id);

/* ------------------------------------------------------------- helpers */

async function api(path, options) {
    const res = await fetch(API + path, options);
    let data;
    try {
        data = await res.json();
    } catch (e) {
        throw new Error("The server did not return valid data. Is it running?");
    }
    if (!res.ok || data.ok === false) {
        const msg = data.errors ? data.errors.join(" ") : (data.error || "Request failed");
        const err = new Error(msg);
        err.list = data.errors || [msg];
        throw err;
    }
    return data;
}

function money(n) {
    return "₹" + Number(n || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function esc(s) {
    return String(s === null || s === undefined ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function dash(v) {
    return v === null || v === undefined || v === "" ? "—" : esc(v);
}

function statusPill(status) {
    const map = {
        "Pending Approval": "pending",
        "Available": "available",
        "Assigned": "assigned",
        "Rejected": "rejected",
        "Under Maintenance": "maintenance",
        "Disposed": "disposed"
    };
    return `<span class="status ${map[status] || "pending"}">${esc(status)}</span>`;
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

function showErrors(list) {
    const box = $("formErrors");
    if (!list || !list.length) {
        box.style.display = "none";
        box.innerHTML = "";
        return;
    }
    box.innerHTML = "<strong>Fix these before saving:</strong><ul style='margin:8px 0 0 18px;'>" +
        list.map((m) => `<li>${esc(m)}</li>`).join("") + "</ul>";
    box.style.display = "block";
    box.scrollIntoView({ behavior: "smooth", block: "center" });
}

function option(value, text, selected) {
    return `<option value="${esc(value)}"${selected ? " selected" : ""}>${esc(text)}</option>`;
}

/* ---------------------------------------------------------------- boot */

document.addEventListener("DOMContentLoaded", init);

async function init() {
    bindTabs();
    bindForm();
    bindRegisterPanel();
    bindAssetsPanel();
    bindModal();

    try {
        state.meta = await api("/meta");
        fillMetaSelects();
        $("dbStatus").textContent = "Database connected";
    } catch (err) {
        $("dbStatus").textContent = "Database unreachable";
        showErrors([
            "Could not reach the API. Start the server with `npm start` in the server folder and confirm the MySQL settings in .env.",
            err.message
        ]);
        return;
    }

    $("receiptDate").value = today();
    $("receiptDate").max = today();
    $("purchaseDate").max = today();
    $("invoiceDate").max = today();

    await Promise.all([loadAssets(), loadApprovals(), loadDashboard()]);
}

function fillMetaSelects() {
    const m = state.meta;

    $("currentUser").innerHTML = m.users
        .map((u) => option(u.user_id, u.full_name, u.role === "Admin")).join("");
    setUserFromSelect();

    $("receivingType").innerHTML = '<option value="">Select receiving type</option>' +
        m.receivingTypes.map((t) => option(t.receiving_type_id, t.type_name)).join("");

    $("supplierSelect").innerHTML = '<option value="">Select a saved supplier</option>' +
        m.suppliers.map((s) => option(s.supplier_id, s.supplier_name)).join("") +
        option("__other__", "Other — type it below");

    $("category").innerHTML = '<option value="">Select category</option>' +
        m.categories.map((c) => option(c.category_id, c.category_name)).join("");

    $("condition").innerHTML = '<option value="">Select condition</option>' +
        m.conditions.map((c) => option(c.condition_id, c.condition_name)).join("");

    $("department").innerHTML = '<option value="">Select department</option>' +
        m.departments.map((d) => option(d.department_id, d.dept_name)).join("");

    renderLocations("");

    $("filterDepartment").innerHTML = '<option value="">All departments</option>' +
        m.departments.map((d) => option(d.department_id, d.dept_name)).join("");
    $("filterCategory").innerHTML = '<option value="">All categories</option>' +
        m.categories.map((c) => option(c.category_id, c.category_name)).join("");
}

function renderLocations(departmentId) {
    const all = state.meta.locations;
    const mine = all.filter((l) => String(l.department_id) === String(departmentId));
    const rest = all.filter((l) => String(l.department_id) !== String(departmentId));
    const list = departmentId ? mine.concat(rest) : all;
    $("initialLocation").innerHTML = '<option value="">Select location</option>' +
        list.map((l) => option(l.location_id, l.location_name + " (" + l.location_code + ")")).join("");
}

function setUserFromSelect() {
    const id = $("currentUser").value;
    state.user = state.meta.users.find((u) => String(u.user_id) === String(id)) || state.meta.users[0];
    $("currentRole").textContent = state.user.role;
    $("registeredBy").textContent = state.user.full_name;
}

/* ---------------------------------------------------------------- tabs */

function bindTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
            document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
            btn.classList.add("active");
            $(btn.dataset.tab).classList.add("active");
            if (btn.dataset.tab === "panelAssets") loadAssets();
            if (btn.dataset.tab === "panelApprovals") loadApprovals();
            if (btn.dataset.tab === "panelDashboard") loadDashboard();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });
}

/* ------------------------------------------------------- register panel */

function bindForm() {
    $("currentUser").addEventListener("change", setUserFromSelect);

    $("supplierSelect").addEventListener("change", (e) => {
        const other = e.target.value === "__other__";
        $("supplier").style.display = other ? "block" : "none";
        if (other) $("supplier").focus();
    });

    $("receivingType").addEventListener("change", () => {
        const t = state.meta.receivingTypes
            .find((x) => String(x.receiving_type_id) === $("receivingType").value);
        $("invoiceHint").textContent = t && t.needs_invoice
            ? "An invoice number is expected for this receiving type."
            : "Invoice number is optional for this receiving type.";
    });

    $("category").addEventListener("change", () => {
        const c = state.meta.categories.find((x) => String(x.category_id) === $("category").value);
        $("categoryHint").textContent = c
            ? `Useful life ${c.useful_life_years} years · depreciation ${c.depreciation_rate}% per year`
            : "";
        $("serialHint").textContent = c && c.requires_serial
            ? "A serial number is strongly recommended for this category."
            : "Checked against the database as you type.";
    });

    $("department").addEventListener("change", () => renderLocations($("department").value));

    $("quantity").addEventListener("input", () => {
        renderSerialInputs();
        updateTotals();
    });
    $("purchaseCost").addEventListener("input", updateTotals);

    $("purchaseDate").addEventListener("change", () => {
        if ($("purchaseDate").value) $("warrantyExpiry").min = $("purchaseDate").value;
        updateWarrantyHint();
    });
    $("warrantyExpiry").addEventListener("change", updateWarrantyHint);

    let serialTimer;
    $("serialNumber").addEventListener("input", () => {
        clearTimeout(serialTimer);
        serialTimer = setTimeout(() => checkSerial($("serialNumber"), $("serialHint")), 400);
    });

    $("invoiceFile").addEventListener("change", uploadInvoice);

    $("assetForm").addEventListener("submit", submitForm);
}

function bindRegisterPanel() {
    $("viewInfoBtn").addEventListener("click", reviewEntry);
    $("resetBtn").addEventListener("click", resetForm);
    $("newEntryBtn").addEventListener("click", resetForm);
    $("printLabelsBtn").addEventListener("click", printLabels);
}

function quantity() {
    return Math.max(1, Math.min(100, parseInt($("quantity").value || "1", 10) || 1));
}

function renderSerialInputs() {
    const qty = quantity();
    const single = qty === 1;
    $("serialWrap").style.display = single ? "flex" : "none";
    $("serialListWrap").style.display = single ? "none" : "block";
    if (single) return;

    const existing = Array.from(document.querySelectorAll(".serial-input")).map((i) => i.value);
    let html = "";
    for (let i = 0; i < qty; i++) {
        html += `<div class="serial-row">
            <span class="serial-index">Unit ${i + 1}</span>
            <input type="text" class="serial-input" data-index="${i}"
                   placeholder="Serial number (optional)" value="${esc(existing[i] || "")}">
        </div>`;
    }
    $("serialList").innerHTML = html;

    document.querySelectorAll(".serial-input").forEach((input) => {
        let t;
        input.addEventListener("input", () => {
            clearTimeout(t);
            t = setTimeout(() => checkSerial(input, null), 400);
        });
    });
}

async function checkSerial(input, hintEl) {
    const value = input.value.trim();
    input.style.borderColor = "";
    if (!value) {
        if (hintEl) hintEl.textContent = "Checked against the database as you type.";
        return;
    }
    try {
        const r = await api("/assets/check-serial?serial=" + encodeURIComponent(value));
        if (r.exists) {
            input.style.borderColor = "var(--color-danger)";
            if (hintEl) hintEl.textContent = `Already registered as ${r.asset_code}.`;
            input.title = `Already registered as ${r.asset_code}`;
        } else {
            input.title = "";
            if (hintEl) hintEl.textContent = "Serial number is free.";
        }
    } catch (e) {
        /* a failed check should never block typing */
    }
}

function collectSerials() {
    if (quantity() === 1) {
        return [$("serialNumber").value.trim()].filter(Boolean);
    }
    return Array.from(document.querySelectorAll(".serial-input")).map((i) => i.value.trim());
}

function updateTotals() {
    const total = (parseFloat($("purchaseCost").value) || 0) * quantity();
    $("totalCostHint").textContent = "Total for this receipt: " + money(total);
    $("unitCount").textContent = String(quantity());
    $("totalValue").textContent = money(total);
}

function updateWarrantyHint() {
    const w = $("warrantyExpiry").value;
    if (!w) { $("warrantyHint").textContent = ""; return; }
    const days = Math.round((new Date(w) - new Date(today())) / 86400000);
    $("warrantyHint").textContent = days < 0
        ? "This warranty has already expired."
        : `Warranty runs for another ${days} day${days === 1 ? "" : "s"}.`;
}

async function uploadInvoice(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        $("fileInfo").textContent = "That file is larger than 5 MB. Choose a smaller one.";
        e.target.value = "";
        return;
    }
    $("fileInfo").textContent = "Uploading…";
    const fd = new FormData();
    fd.append("file", file);
    fd.append("userId", state.user.user_id);
    fd.append("docType", "Invoice");
    try {
        const r = await api("/documents", { method: "POST", body: fd });
        state.documentId = r.document_id;
        $("fileInfo").innerHTML = `Attached: <a href="${esc(r.url)}" target="_blank">${esc(r.file_name)}</a>`;
    } catch (err) {
        state.documentId = null;
        $("fileInfo").textContent = err.message;
        e.target.value = "";
    }
}

/* -------------------------------------------------------- validation */

function supplierName() {
    if ($("supplierSelect").value === "__other__") return $("supplier").value.trim();
    const s = state.meta.suppliers.find((x) => String(x.supplier_id) === $("supplierSelect").value);
    return s ? s.supplier_name : "";
}

function validate() {
    const errors = [];
    const required = [
        ["receivingType", "Receiving type"],
        ["receiptDate", "Receipt date"],
        ["assetName", "Asset name"],
        ["category", "Category"],
        ["condition", "Asset condition"],
        ["department", "Department"],
        ["initialLocation", "Initial location"]
    ];
    required.forEach(([id, label]) => {
        if (!$(id).value.trim()) errors.push(`${label} is required.`);
    });

    if (!supplierName()) errors.push("Supplier or source is required.");

    const qty = parseInt($("quantity").value || "0", 10);
    if (!qty || qty < 1 || qty > 100) errors.push("Quantity must be between 1 and 100.");

    if ($("receiptDate").value > today()) errors.push("Receipt date cannot be in the future.");
    if ($("purchaseDate").value && $("purchaseDate").value > today()) {
        errors.push("Purchase date cannot be in the future.");
    }
    if ($("purchaseDate").value && $("receiptDate").value &&
        $("purchaseDate").value > $("receiptDate").value) {
        errors.push("Purchase date cannot be after the receipt date.");
    }
    if ($("warrantyExpiry").value && $("purchaseDate").value &&
        $("warrantyExpiry").value < $("purchaseDate").value) {
        errors.push("Warranty expiry cannot be before the purchase date.");
    }
    if ($("purchaseCost").value && parseFloat($("purchaseCost").value) < 0) {
        errors.push("Purchase cost cannot be negative.");
    }

    const serials = collectSerials().filter(Boolean);
    const dupes = serials.filter((s, i) => serials.indexOf(s) !== i);
    if (dupes.length) errors.push("The same serial number is entered twice: " + [...new Set(dupes)].join(", "));

    return errors;
}

function reviewEntry() {
    const errors = validate();
    showErrors(errors);
    if (errors.length) return;

    const cond = state.meta.conditions.find((c) => String(c.condition_id) === $("condition").value);
    const forced = cond && cond.blocks_usage === 1;
    if (forced) $("approvalRequired").checked = true;

    $("previewNotice").textContent = forced
        ? `Condition "${cond.condition_name}" sends this asset for approval automatically.`
        : "Codes below are reserved by the database when you save. Nothing is stored yet.";

    updateTotals();
    $("createdAt").textContent = "On save";
    $("updatedAt").textContent = "On save";
    $("registeredBy").textContent = state.user.full_name;
    $("systemInformation").style.display = "block";
    $("systemInformation").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ------------------------------------------------------------- submit */

async function submitForm(event) {
    event.preventDefault();
    const errors = validate();
    showErrors(errors);
    if (errors.length) return;

    const supplierId = ["__other__", ""].includes($("supplierSelect").value)
        ? null : $("supplierSelect").value;

    const payload = {
        receivingTypeId: $("receivingType").value,
        supplierId: supplierId,
        supplierName: supplierName(),
        invoiceNumber: $("invoiceNumber").value.trim(),
        invoiceDate: $("invoiceDate").value,
        receiptDate: $("receiptDate").value,
        quantity: quantity(),
        receivingRemarks: $("receivingRemarks").value.trim(),
        assetName: $("assetName").value.trim(),
        categoryId: $("category").value,
        manufacturer: $("manufacturer").value.trim(),
        model: $("model").value.trim(),
        serialNumbers: collectSerials(),
        conditionId: $("condition").value,
        purchaseDate: $("purchaseDate").value,
        warrantyExpiry: $("warrantyExpiry").value,
        purchaseCost: $("purchaseCost").value,
        departmentId: $("department").value,
        locationId: $("initialLocation").value,
        additionalRemarks: $("additionalRemarks").value.trim(),
        requiresApproval: $("approvalRequired").checked,
        documentId: state.documentId,
        userId: state.user.user_id
    };

    const btn = $("registerBtn");
    btn.disabled = true;
    btn.textContent = "Saving…";

    try {
        const r = await api("/assets/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const codes = r.assets.map((a) => a.asset_code);
        $("assetCode").textContent = codes.join(", ");
        $("receiptId").textContent = r.receipt_code;
        $("barcodeValue").textContent = codes.join(", ");
        $("assetStatus").innerHTML = statusPill(r.status);
        $("createdAt").textContent = new Date().toLocaleString();
        $("updatedAt").textContent = new Date().toLocaleString();
        $("totalValue").textContent = money(r.total_cost);
        $("previewNotice").textContent = "Saved to the database.";

        $("successAssetId").textContent = codes.join(", ");
        $("successReceiptId").textContent = r.receipt_code;
        $("successUnits").textContent = String(codes.length);
        $("successStatus").innerHTML = statusPill(r.status);
        $("successRegisteredBy").textContent = state.user.full_name;

        $("successLabels").innerHTML = codes.slice(0, 4).map((c) => `
            <div style="text-align:center;">
                <img src="/api/labels/${encodeURIComponent(c)}/qr.png" alt="QR code for ${esc(c)}" width="110" height="110">
                <img src="/api/labels/${encodeURIComponent(c)}/barcode.png" alt="Barcode for ${esc(c)}" height="60">
            </div>`).join("") +
            (codes.length > 4 ? `<span class="helper-text">and ${codes.length - 4} more — print to see all.</span>` : "");
        $("successLabels").dataset.codes = codes.join(",");

        $("successMessage").style.display = "block";
        $("successMessage").scrollIntoView({ behavior: "smooth", block: "start" });

        await Promise.all([loadAssets(), loadApprovals(), loadDashboard()]);
    } catch (err) {
        showErrors(err.list || [err.message]);
    } finally {
        btn.disabled = false;
        btn.textContent = "Register asset";
    }
}

function printLabels() {
    const codes = ($("successLabels").dataset.codes || "").split(",").filter(Boolean);
    if (!codes.length) return;
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>Asset labels</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .lbl { display: inline-block; border: 1px solid #cbd5e1; border-radius: 8px;
                   padding: 12px; margin: 8px; text-align: center; width: 200px; }
            .lbl div { font-size: 12px; color: #64748b; margin-top: 6px; }
        </style></head><body>
        ${codes.map((c) => `<div class="lbl">
            <img src="/api/labels/${encodeURIComponent(c)}/qr.png" width="110">
            <img src="/api/labels/${encodeURIComponent(c)}/barcode.png" width="170">
            <div>Department Asset Tracking</div></div>`).join("")}
        </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
}

function resetForm() {
    $("assetForm").reset();
    state.documentId = null;
    $("supplier").style.display = "none";
    $("systemInformation").style.display = "none";
    $("successMessage").style.display = "none";
    $("serialListWrap").style.display = "none";
    $("serialWrap").style.display = "flex";
    $("serialList").innerHTML = "";
    $("assetCode").textContent = "Generated on save";
    $("receiptId").textContent = "Generated on save";
    $("barcodeValue").textContent = "Generated on save";
    $("createdAt").textContent = "Automatic";
    $("updatedAt").textContent = "Automatic";
    $("assetStatus").innerHTML = '<span class="status pending">Pending Registration</span>';
    $("fileInfo").textContent = "PDF, PNG or JPG up to 5 MB.";
    $("categoryHint").textContent = "";
    $("warrantyHint").textContent = "";
    $("receiptDate").value = today();
    $("registeredBy").textContent = state.user.full_name;
    showErrors([]);
    updateTotals();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* --------------------------------------------------------- asset list */

function bindAssetsPanel() {
    let t;
    $("searchBox").addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(() => { state.page = 1; loadAssets(); }, 350);
    });
    ["filterStatus", "filterDepartment", "filterCategory"].forEach((id) => {
        $(id).addEventListener("change", () => { state.page = 1; loadAssets(); });
    });
    $("refreshAssets").addEventListener("click", () => loadAssets());
    $("prevPage").addEventListener("click", () => { state.page--; loadAssets(); });
    $("nextPage").addEventListener("click", () => { state.page++; loadAssets(); });
    $("exportCsv").addEventListener("click", exportCsv);
}

async function loadAssets() {
    const params = new URLSearchParams({
        page: state.page,
        limit: 10,
        q: $("searchBox").value.trim(),
        status: $("filterStatus").value,
        department: $("filterDepartment").value,
        category: $("filterCategory").value
    });
    const body = $("assetRows");
    try {
        const r = await api("/assets?" + params.toString());
        state.rows = r.assets;
        state.pages = r.pages;

        body.innerHTML = r.assets.length ? r.assets.map((a) => `
            <tr>
                <td class="cell-code">${esc(a.asset_code)}</td>
                <td>${esc(a.asset_name)}<div class="cell-muted">${dash(a.serial_number)}</div></td>
                <td>${esc(a.category_name)}</td>
                <td>${esc(a.dept_name)}</td>
                <td>${esc(a.location_name)}</td>
                <td>${esc(a.condition_name)}</td>
                <td>${money(a.purchase_cost)}</td>
                <td class="cell-muted">${esc(a.warranty_status)}</td>
                <td>${statusPill(a.status)}</td>
                <td><div class="inline-actions">
                    <button type="button" class="view-btn" data-code="${esc(a.asset_code)}">View</button>
                </div></td>
            </tr>`).join("")
            : `<tr><td colspan="10" class="empty-state">No assets match these filters. Register one from the first tab.</td></tr>`;

        body.querySelectorAll("button[data-code]").forEach((b) =>
            b.addEventListener("click", () => openAsset(b.dataset.code)));

        const from = r.total ? (r.page - 1) * r.limit + 1 : 0;
        const to = Math.min(r.page * r.limit, r.total);
        $("pagerInfo").textContent = `Showing ${from}–${to} of ${r.total} assets`;
        $("prevPage").disabled = r.page <= 1;
        $("nextPage").disabled = r.page >= r.pages;
    } catch (err) {
        body.innerHTML = `<tr><td colspan="10" class="empty-state">${esc(err.message)}</td></tr>`;
    }
}

function exportCsv() {
    if (!state.rows.length) return;
    const cols = ["asset_code", "asset_name", "serial_number", "category_name", "dept_name",
        "location_name", "condition_name", "purchase_cost", "warranty_expiry", "status",
        "receipt_code", "supplier_name", "receipt_date"];
    const csv = [cols.join(",")].concat(
        state.rows.map((r) => cols.map((c) => `"${String(r[c] === null ? "" : r[c]).replace(/"/g, '""')}"`).join(","))
    ).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "assets-page-" + state.page + ".csv";
    a.click();
    URL.revokeObjectURL(url);
}

/* -------------------------------------------------------------- modal */

function bindModal() {
    $("modalClose").addEventListener("click", closeModal);
    $("detailModal").addEventListener("click", (e) => {
        if (e.target === $("detailModal")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });
}

function closeModal() {
    $("detailModal").classList.remove("open");
}

async function openAsset(code) {
    $("modalTitle").textContent = code;
    $("modalBody").innerHTML = '<div class="empty-state">Loading…</div>';
    $("detailModal").classList.add("open");
    try {
        const r = await api("/assets/" + encodeURIComponent(code));
        const a = r.asset;
        const field = (label, value) => `
            <div class="system-card">
                <span class="system-label">${esc(label)}</span>
                <span class="system-value">${value}</span>
            </div>`;

        $("modalBody").innerHTML = `
            <div class="system-grid">
                ${field("Status", statusPill(a.status))}
                ${field("Asset name", dash(a.asset_name))}
                ${field("Category", dash(a.category_name))}
                ${field("Serial number", dash(a.serial_number))}
                ${field("Make / model", dash([a.manufacturer, a.model].filter(Boolean).join(" ")))}
                ${field("Condition", dash(a.condition_name))}
                ${field("Department", dash(a.dept_name))}
                ${field("Location", dash(a.location_name))}
                ${field("Purchase cost", money(a.purchase_cost))}
                ${field("Purchase date", dash(a.purchase_date))}
                ${field("Warranty", dash(a.warranty_expiry) + " · " + esc(a.warranty_status))}
                ${field("Receipt", dash(a.receipt_code) + " · " + dash(a.receipt_date))}
                ${field("Receiving type", dash(a.receiving_type))}
                ${field("Supplier", dash(a.supplier_name))}
                ${field("Invoice", dash(a.invoice_number))}
                ${field("Registered by", dash(a.registered_by_name) + "<br><span class='cell-muted'>" + esc(a.created_at) + "</span>")}
                ${field("Approved by", dash(a.approved_by_name))}
                ${field("Remarks", dash(a.remarks))}
            </div>

            <div class="label-box">
                <img src="/api/labels/${encodeURIComponent(a.asset_code)}/qr.png" alt="QR code" width="120" height="120">
                <img src="/api/labels/${encodeURIComponent(a.asset_code)}/barcode.png" alt="Barcode" height="70">
                ${r.documents.length
                    ? `<span class="helper-text">Invoice: <a href="/uploads/${esc(r.documents[0].stored_name)}" target="_blank">${esc(r.documents[0].file_name)}</a></span>`
                    : '<span class="helper-text">No invoice copy attached to this receipt.</span>'}
            </div>

            ${a.status === "Pending Approval" ? `
            <div class="section" style="margin-top:25px;">
                <div class="section-title">Approval decision</div>
                <div class="form-group">
                    <label for="decisionRemarks">Remarks</label>
                    <input type="text" id="decisionRemarks" placeholder="Required when rejecting">
                </div>
                <div class="button-area">
                    <button type="button" class="danger-btn" id="rejectBtn">Reject</button>
                    <button type="button" class="register-btn" id="approveBtn">Approve and make available</button>
                </div>
            </div>` : ""}

            <div class="section" style="margin-top:25px;">
                <div class="section-title">History</div>
                ${(r.history.length || r.audit.length) ? `
                <div class="stack-gap">
                    ${r.history.map((h) => `
                        <div class="timeline-item">
                            <strong>${esc(h.action)}</strong> by ${esc(h.full_name)}
                            <div class="cell-muted">${esc(h.action_at)}${h.remarks ? " · " + esc(h.remarks) : ""}</div>
                        </div>`).join("")}
                    ${r.audit.map((h) => `
                        <div class="timeline-item">
                            <strong>${esc(h.action)}</strong>${h.field_changed ? " · " + esc(h.field_changed) : ""}
                            <div class="cell-muted">${esc(h.full_name)} · ${esc(h.performed_at)}
                            ${h.new_value ? " · " + esc(h.old_value || "—") + " → " + esc(h.new_value) : ""}</div>
                        </div>`).join("")}
                </div>` : '<div class="empty-state">No history recorded yet.</div>'}
            </div>`;

        if (a.status === "Pending Approval") {
            $("approveBtn").addEventListener("click", () => decide(a.asset_id, "approve"));
            $("rejectBtn").addEventListener("click", () => decide(a.asset_id, "reject"));
        }
    } catch (err) {
        $("modalBody").innerHTML = `<div class="error-message">${esc(err.message)}</div>`;
    }
}

async function decide(assetId, decision) {
    const remarks = $("decisionRemarks") ? $("decisionRemarks").value.trim() : "";
    if (decision === "reject" && !remarks) {
        $("decisionRemarks").style.borderColor = "var(--color-danger)";
        $("decisionRemarks").focus();
        return;
    }
    try {
        await api("/assets/" + assetId + "/decision", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ decision, remarks, userId: state.user.user_id })
        });
        closeModal();
        await Promise.all([loadAssets(), loadApprovals(), loadDashboard()]);
    } catch (err) {
        $("modalBody").insertAdjacentHTML("afterbegin",
            `<div class="error-message">${esc(err.message)}</div>`);
    }
}

/* ---------------------------------------------------------- approvals */

async function loadApprovals() {
    const body = $("approvalRows");
    try {
        const q = new URLSearchParams({ status: "Pending Approval", limit: 50 });
        const r = await api("/assets?" + q.toString());
        $("approvalCount").textContent = String(r.total);
        body.innerHTML = r.assets.length ? r.assets.map((a) => `
            <tr>
                <td class="cell-code">${esc(a.asset_code)}</td>
                <td>${esc(a.asset_name)}<div class="cell-muted">${dash(a.serial_number)}</div></td>
                <td>${esc(a.dept_name)}</td>
                <td>${esc(a.condition_name)}</td>
                <td>${esc(a.receipt_date)}</td>
                <td>${esc(a.registered_by_name)}</td>
                <td><div class="inline-actions">
                    <button type="button" class="view-btn" data-code="${esc(a.asset_code)}">Review</button>
                </div></td>
            </tr>`).join("")
            : '<tr><td colspan="7" class="empty-state">Nothing is waiting for approval.</td></tr>';

        body.querySelectorAll("button[data-code]").forEach((b) =>
            b.addEventListener("click", () => openAsset(b.dataset.code)));
    } catch (err) {
        body.innerHTML = `<tr><td colspan="7" class="empty-state">${esc(err.message)}</td></tr>`;
    }
}

/* ---------------------------------------------------------- dashboard */

async function loadDashboard() {
    try {
        const r = await api("/dashboard");
        const statusCount = (name) => {
            const row = r.byStatus.find((s) => s.status === name);
            return row ? row.count : 0;
        };
        const warranty = (name) => {
            const row = r.warranty.find((w) => w.warranty_status === name);
            return row ? row.count : 0;
        };

        const cards = [
            ["Total assets", r.totals.total_assets],
            ["Book value", money(r.totals.total_value)],
            ["Available", statusCount("Available")],
            ["Pending approval", statusCount("Pending Approval")],
            ["Rejected", statusCount("Rejected")],
            ["Warranty expiring in 90 days", warranty("Expiring soon")]
        ];
        $("statCards").innerHTML = cards.map(([label, value]) => `
            <div class="system-card">
                <span class="system-label">${esc(label)}</span>
                <span class="system-value">${esc(value)}</span>
            </div>`).join("");

        $("categoryRows").innerHTML = r.byCategory.length ? r.byCategory.map((c) => `
            <tr><td>${esc(c.category_name)}</td><td>${esc(c.count)}</td><td>${money(c.value)}</td></tr>`).join("")
            : '<tr><td colspan="3" class="empty-state">No assets yet.</td></tr>';

        $("recentRows").innerHTML = r.recent.length ? r.recent.map((a) => `
            <tr><td class="cell-code">${esc(a.asset_code)}</td><td>${esc(a.asset_name)}</td>
                <td>${statusPill(a.status)}</td><td class="cell-muted">${esc(a.created_at)}</td></tr>`).join("")
            : '<tr><td colspan="4" class="empty-state">No assets yet.</td></tr>';
    } catch (err) {
        $("statCards").innerHTML = `<div class="error-message">${esc(err.message)}</div>`;
    }
}
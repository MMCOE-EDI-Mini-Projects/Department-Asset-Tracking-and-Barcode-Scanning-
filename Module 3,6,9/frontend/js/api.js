const API_BASE = "";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Login failed.");
  return body;
}

async function apiRegisterAsset(data) {
  const res = await fetch(`${API_BASE}/assets`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Failed to register asset.");
  return body;
}
async function apiSearchAssetByCode(assetCode) {
  const res = await fetch(`${API_BASE}/assets/search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assetCode }) });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Asset not found.");
  return body;
}
async function apiSearchAssetByImage(file) {
  const formData = new FormData(); formData.append("image", file);
  const res = await fetch(`${API_BASE}/assets/ocr`, { method: "POST", body: formData });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Asset not found.");
  return body;
}
async function apiRequestDisposal(data) {
  const res = await fetch(`${API_BASE}/disposal`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Failed to submit disposal request.");
  return body;
}
async function apiGetDepartments() { const res = await fetch(`${API_BASE}/departments`); return res.json(); }
async function apiGetLocations() { const res = await fetch(`${API_BASE}/locations`); return res.json(); }

async function apiListDisposalRequests() {
  const res = await fetch(`${API_BASE}/disposal`, { headers: authHeaders() });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Failed to load disposal requests. Please log in.");
  return body;
}
async function apiApproveDisposal(requestId) {
  const res = await fetch(`${API_BASE}/disposal/${requestId}/approve`, { method: "PATCH", headers: authHeaders() });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Failed to approve request.");
  return body;
}
async function apiDisposeRequest(requestId) {
  const res = await fetch(`${API_BASE}/disposal/${requestId}/dispose`, { method: "PATCH", headers: authHeaders() });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Failed to finalize disposal.");
  return body;
}
async function apiGetReportsSummary() {
  const res = await fetch(`${API_BASE}/reports/summary`, { headers: authHeaders() });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Failed to load reports. Please log in.");
  return body;
}

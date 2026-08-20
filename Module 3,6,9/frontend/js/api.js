// Shared helper functions for calling the backend REST API.
// Since the backend also serves this frontend as static files,
// relative paths work whether you open it via the backend URL.
const API_BASE = "";

async function apiRegisterAsset(data) {
  const res = await fetch(`${API_BASE}/assets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Failed to register asset.");
  return body;
}

async function apiSearchAssetByCode(assetCode) {
  const res = await fetch(`${API_BASE}/assets/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assetCode }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Asset not found.");
  return body;
}

async function apiSearchAssetByImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/assets/ocr`, {
    method: "POST",
    body: formData,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Asset not found.");
  return body;
}

async function apiRequestDisposal(data) {
  const res = await fetch(`${API_BASE}/disposal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Failed to submit disposal request.");
  return body;
}

async function apiGetDepartments() {
  const res = await fetch(`${API_BASE}/departments`);
  return res.json();
}

async function apiGetLocations() {
  const res = await fetch(`${API_BASE}/locations`);
  return res.json();
}

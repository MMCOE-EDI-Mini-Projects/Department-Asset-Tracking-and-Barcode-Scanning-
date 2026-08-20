const searchForm = document.getElementById("searchForm");
const ocrForm = document.getElementById("ocrForm");
const ocrButton = document.getElementById("ocrButton");
const msg = document.getElementById("msg");
const extractedCodeEl = document.getElementById("extractedCode");
const resultCard = document.getElementById("resultCard");
const resultTable = document.getElementById("resultTable");
const showDisposalBtn = document.getElementById("showDisposalBtn");
const disposalForm = document.getElementById("disposalForm");
const disposalMsg = document.getElementById("disposalMsg");

let currentAssetCode = null;

function renderAsset(asset) {
  currentAssetCode = asset.asset_code;

  const rows = [
    ["Asset Code", asset.asset_code],
    ["Name", asset.name],
    ["Category", asset.category],
    ["Make", asset.make],
    ["Model", asset.model],
    ["Serial Number", asset.serial_number],
    ["Condition", asset.asset_condition],
    ["Status", asset.status],
  ];

  resultTable.innerHTML = rows
    .map(([label, value]) => `<tr><td>${label}</td><td>${value || "-"}</td></tr>`)
    .join("");

  resultCard.style.display = "block";
  disposalForm.style.display = "none";
  showDisposalBtn.style.display = "inline-block";
  disposalMsg.textContent = "";
}

function showError(message) {
  msg.className = "msg-error";
  msg.textContent = message;
  resultCard.style.display = "none";
}

function clearMessages() {
  msg.className = "";
  msg.textContent = "";
  extractedCodeEl.textContent = "";
}

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
  const assetCode = document.getElementById("assetCode").value;

  try {
    const asset = await apiSearchAssetByCode(assetCode);
    renderAsset(asset);
  } catch (err) {
    showError(err.message);
  }
});

ocrForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
  const file = document.getElementById("imageInput").files[0];
  if (!file) return;

  ocrButton.disabled = true;
  ocrButton.textContent = "Running OCR...";

  try {
    const result = await apiSearchAssetByImage(file);
    extractedCodeEl.textContent = `OCR extracted asset code: ${result.extractedCode}`;
    renderAsset(result.asset);
  } catch (err) {
    showError(err.message);
  } finally {
    ocrButton.disabled = false;
    ocrButton.textContent = "Upload Asset Code Image";
  }
});

showDisposalBtn.addEventListener("click", () => {
  disposalForm.style.display = "block";
  showDisposalBtn.style.display = "none";
});

disposalForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  disposalMsg.className = "";
  disposalMsg.textContent = "";

  const data = {
    assetCode: currentAssetCode,
    reason: document.getElementById("reason").value,
    disposalMethod: document.getElementById("disposalMethod").value,
    remarks: document.getElementById("remarks").value,
  };

  try {
    const record = await apiRequestDisposal(data);
    disposalMsg.className = "msg-success";
    disposalMsg.textContent = `Disposal request submitted. Status: ${record.status}`;
  } catch (err) {
    disposalMsg.className = "msg-error";
    disposalMsg.textContent = err.message;
  }
});

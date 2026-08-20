const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");
const departmentSelect = document.getElementById("department");
const locationSelect = document.getElementById("location");

async function loadDropdowns() {
  const [departments, locations] = await Promise.all([apiGetDepartments(), apiGetLocations()]);

  departmentSelect.innerHTML = departments
    .map((d) => `<option value="${d.department_id}">${d.name}</option>`)
    .join("");

  locationSelect.innerHTML = locations
    .map((l) => `<option value="${l.location_id}">${l.name}</option>`)
    .join("");
}

loadDropdowns();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.className = "";
  msg.textContent = "";

  const data = {
    assetCode: document.getElementById("assetCode").value,
    name: document.getElementById("name").value,
    category: document.getElementById("category").value,
    departmentId: departmentSelect.value || null,
    locationId: locationSelect.value || null,
    make: document.getElementById("make").value,
    model: document.getElementById("model").value,
    serialNumber: document.getElementById("serialNumber").value,
    condition: document.getElementById("condition").value,
  };

  try {
    const asset = await apiRegisterAsset(data);
    msg.className = "msg-success";
    msg.textContent = `Asset "${asset.asset_code}" registered successfully.`;
    form.reset();
  } catch (err) {
    msg.className = "msg-error";
    msg.textContent = err.message;
  }
});

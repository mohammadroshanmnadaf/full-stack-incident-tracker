const incidentId = new URLSearchParams(location.search).get("id");

async function loadIncident() {
  if (!incidentId) { showErr("No incident ID in URL."); return; }
  try {
    const inc = await IncidentAPI.get(incidentId);
    render(inc);
  } catch(e) { showErr(e.message); }
}

function render(inc) {
  document.title = `#${inc.id} ${inc.title} — Incident Tracker`;
  document.getElementById("incidentTitle").textContent   = inc.title;
  document.getElementById("incidentId").textContent      = `#${inc.id}`;
  document.getElementById("incidentService").textContent = inc.service;
  document.getElementById("incidentOwner").textContent   = inc.owner || "Unassigned";
  document.getElementById("incidentCreated").textContent = fmtDate(inc.created_at);
  document.getElementById("incidentUpdated").textContent = fmtDate(inc.updated_at);
  document.getElementById("incidentSummary").textContent = inc.summary || "No summary provided.";
  document.getElementById("incidentSeverity").innerHTML  = `<span class="badge ${sevClass(inc.severity)} fs-6">${inc.severity}</span>`;
  document.getElementById("incidentStatus").innerHTML    = `<span class="badge ${stClass(inc.status)} fs-6">${inc.status}</span>`;

  document.getElementById("updateStatus").value   = inc.status;
  document.getElementById("updateSeverity").value = inc.severity;
  document.getElementById("updateOwner").value    = inc.owner || "";

  document.getElementById("loadingState").style.display  = "none";
  document.getElementById("incidentContent").style.display = "block";
}

document.getElementById("updateForm").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = document.getElementById("updateBtn");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Saving…`;

  try {
    const updated = await IncidentAPI.update(incidentId, {
      status:   document.getElementById("updateStatus").value,
      severity: document.getElementById("updateSeverity").value,
      owner:    document.getElementById("updateOwner").value.trim() || null,
    });
    render(updated);
    toast("Incident updated successfully!", "success");
  } catch(e) {
    toast(`Update failed: ${e.message}`, "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Save Changes";
  }
});

function toast(msg, type) {
  const tc = document.getElementById("toastContainer");
  const id = `t${Date.now()}`;
  tc.insertAdjacentHTML("beforeend", `
    <div id="${id}" class="toast align-items-center text-white ${type==="success"?"bg-success":"bg-danger"} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`);
  new bootstrap.Toast(document.getElementById(id), {delay:3000}).show();
}

function showErr(msg) {
  document.getElementById("loadingState").style.display = "none";
  document.getElementById("errorState").style.display   = "block";
  document.getElementById("errorMessage").textContent   = msg;
}

const sevClass = s => ({SEV1:"badge-sev1",SEV2:"badge-sev2",SEV3:"badge-sev3",SEV4:"badge-sev4"}[s]||"bg-secondary");
const stClass  = s => ({OPEN:"badge-open",MITIGATED:"badge-mitigated",RESOLVED:"badge-resolved"}[s]||"bg-secondary");
function fmtDate(iso) {
  if (!iso) return "-";

  const utcDate = new Date(iso);

  // convert UTC → IST
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcDate.getTime() + istOffset);

  return istDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

loadIncident();

// State
const state = { page: 1, limit: 20, search: "", severity: "", status: "", sort_by: "created_at", sort_order: "desc" };
let totalPages = 1, isLoading = false;

// DOM
const searchInput    = document.getElementById("searchInput");
const severityFilter = document.getElementById("severityFilter");
const statusFilter   = document.getElementById("statusFilter");
const limitSelect    = document.getElementById("limitSelect");
const tableBody      = document.getElementById("incidentTableBody");
const paginationEl   = document.getElementById("pagination");
const totalCountEl   = document.getElementById("totalCount");
const loadingOverlay = document.getElementById("loadingOverlay");

async function loadIncidents() {
  if (isLoading) return;
  isLoading = true;
  loadingOverlay.style.display = "flex";
  document.getElementById("alertContainer").innerHTML = "";

  try {
    const data = await IncidentAPI.list(state);
    totalPages = data.total_pages;
    renderTable(data.data);
    renderPagination(data.page, data.total_pages, data.total);
    const start = data.total === 0 ? 0 : (data.page - 1) * data.limit + 1;
    const end   = Math.min(data.page * data.limit, data.total);
    totalCountEl.textContent = `Showing ${start}–${end} of ${data.total} incidents`;
    updateSortHeaders();
  } catch (err) {
    document.getElementById("alertContainer").innerHTML =
      `<div class="alert alert-danger">Error: ${esc(err.message)}</div>`;
  } finally {
    isLoading = false;
    loadingOverlay.style.display = "none";
  }
}

function renderTable(incidents) {
  if (!incidents.length) {
    tableBody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><span>📭</span><h5>No incidents found</h5><p>Try adjusting your search or filters.</p></div></td></tr>`;
    return;
  }
  tableBody.innerHTML = incidents.map(inc => `
    <tr onclick="location.href='detail.html?id=${inc.id}'">
      <td class="text-muted small">#${inc.id}</td>
      <td><div class="fw-semibold">${esc(inc.title)}</div><small class="text-muted">${esc(inc.service)}</small></td>
      <td><span class="badge ${sevClass(inc.severity)}">${inc.severity}</span></td>
      <td><span class="badge ${stClass(inc.status)}">${inc.status}</span></td>
      <td class="text-muted small">${inc.owner ? esc(inc.owner) : "—"}</td>
      <td class="text-muted small">${fmtDate(inc.created_at)}</td>
      <td><a href="detail.html?id=${inc.id}" class="btn btn-sm btn-outline-primary">View</a></td>
    </tr>`).join("");
}

function renderPagination(current, total) {
  if (total <= 1) { paginationEl.innerHTML = ""; return; }
  const all = total <= 7 ? [...Array(total)].map((_,i)=>i+1) : buildPages(current, total);
  paginationEl.innerHTML = `
    <li class="page-item ${current===1?"disabled":""}">
      <button class="page-link" onclick="goTo(${current-1})">‹</button></li>
    ${all.map(p => p==="..." ? `<li class="page-item disabled"><span class="page-link">…</span></li>`
      : `<li class="page-item ${p===current?"active":""}"><button class="page-link" onclick="goTo(${p})">${p}</button></li>`).join("")}
    <li class="page-item ${current===total?"disabled":""}">
      <button class="page-link" onclick="goTo(${current+1})">›</button></li>`;
}

function buildPages(cur, total) {
  const s = new Set([1, total, cur, cur-1, cur+1]);
  const sorted = [...s].filter(p=>p>=1&&p<=total).sort((a,b)=>a-b);
  const r = []; let prev = 0;
  for (const p of sorted) { if (p-prev>1) r.push("..."); r.push(p); prev=p; }
  return r;
}

function updateSortHeaders() {
  document.querySelectorAll("th.sortable").forEach(th => {
    const icon = th.querySelector(".sort-icon");
    th.classList.remove("sort-active");
    icon.textContent = "⇅";
    if (th.dataset.col === state.sort_by) {
      th.classList.add("sort-active");
      icon.textContent = state.sort_order === "asc" ? "↑" : "↓";
    }
  });
}

function goTo(p) {
  if (p<1||p>totalPages) return;
  state.page = p;
  loadIncidents();
  window.scrollTo({top:0,behavior:"smooth"});
}

function handleSort(col) {
  if (state.sort_by === col) state.sort_order = state.sort_order==="asc"?"desc":"asc";
  else { state.sort_by = col; state.sort_order = "desc"; }
  state.page = 1;
  loadIncidents();
}

// Expose goTo and handleSort to HTML onclick attributes
window.goTo = goTo;

let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.search = searchInput.value.trim(); state.page=1; loadIncidents(); }, 350);
});
severityFilter.addEventListener("change", () => { state.severity = severityFilter.value; state.page=1; loadIncidents(); });
statusFilter.addEventListener("change",   () => { state.status   = statusFilter.value;   state.page=1; loadIncidents(); });
limitSelect.addEventListener("change",    () => { state.limit    = +limitSelect.value;    state.page=1; loadIncidents(); });
document.querySelectorAll("th.sortable").forEach(th => th.addEventListener("click", () => handleSort(th.dataset.col)));

// Helpers
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
function esc(s) {
  if (!s) return "";
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

loadIncidents();

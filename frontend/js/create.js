const form = document.getElementById("createForm");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async e => {
  e.preventDefault();
  clearErrors();

  const payload = {
    title:    form.title.value.trim(),
    service:  form.service.value.trim(),
    severity: form.severity.value,
    status:   form.status.value || "OPEN",
    owner:    form.owner.value.trim() || null,
    summary:  form.summary.value.trim() || null,
  };

  let err = false;
  if (!payload.title || payload.title.length < 3) { fieldErr("title", "Title must be at least 3 characters."); err=true; }
  if (!payload.service)   { fieldErr("service", "Service name is required."); err=true; }
  if (!payload.severity)  { fieldErr("severity", "Please select a severity level."); err=true; }
  if (err) return;

  setLoading(true);
  try {
    const created = await IncidentAPI.create(payload);
    document.getElementById("alertContainer").innerHTML =
      `<div class="alert alert-success">✅ Incident #${created.id} created! Redirecting…</div>`;
    setTimeout(() => location.href = `detail.html?id=${created.id}`, 1200);
  } catch (e) {
    document.getElementById("alertContainer").innerHTML =
      `<div class="alert alert-danger alert-dismissible fade show">
        Failed: ${esc(e.message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
  } finally { setLoading(false); }
});

function fieldErr(name, msg) {
  const el = form[name];
  el.classList.add("is-invalid");
  const fb = el.parentElement.querySelector(".invalid-feedback");
  if (fb) fb.textContent = msg;
}
function clearErrors() {
  form.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
  document.getElementById("alertContainer").innerHTML = "";
}
function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.innerHTML = on ? `<span class="spinner-border spinner-border-sm me-2"></span>Creating…` : "Create Incident";
}
function esc(s) { return s ? s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;") : ""; }

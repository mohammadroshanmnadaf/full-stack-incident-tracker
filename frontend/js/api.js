// Change this if your backend runs on a different host/port
const API_BASE_URL = "http://127.0.0.1:8000";

async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  let body;
  try { body = await res.json(); } catch { body = null; }

  if (!res.ok) {
    const msg =
      typeof body?.detail === "string" ? body.detail
      : Array.isArray(body?.detail) ? body.detail.map(e => e.msg).join("; ")
      : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

const IncidentAPI = {
  list(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "") qs.set(k, v);
    });
    return apiFetch(`/api/incidents/?${qs}`);
  },
  get(id)         { return apiFetch(`/api/incidents/${id}`); },
  create(data)    { return apiFetch("/api/incidents/", { method: "POST", body: JSON.stringify(data) }); },
  update(id, data){ return apiFetch(`/api/incidents/${id}`, { method: "PATCH", body: JSON.stringify(data) }); },
};

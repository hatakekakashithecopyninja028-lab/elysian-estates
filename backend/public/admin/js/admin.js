const API = window.location.origin;
let token = localStorage.getItem("sm_admin_token") || "";
let currentEnquiryId = null;
let deleteCallback = null;
let propPage = 1, enqPage = 1;
let currentAdminProfile = null;

/* ──── UTILS ──── */
const $ = (id) => document.getElementById(id);
const show = (el) => { if (el) el.style.display = ""; };
const hide = (el) => { if (el) el.style.display = "none"; };
const showId = (id) => show($(id));
const hideId = (id) => hide($(id));

function toast(msg, type = "success") {
  const t = $("toast");
  t.textContent = msg;
  t.className = `toast ${type}`;
  show(t);
  setTimeout(() => hide(t), 3500);
}

function badgeStatus(status) {
  const map = {
    Available: "badge-available", Sold: "badge-sold",
    "Under Offer": "badge-offer", New: "badge-new",
    Contacted: "badge-contacted", Closed: "badge-closed",
  };
  return `<span class="badge ${map[status] || ''}">${status}</span>`;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtPrice(p) {
  return "₹" + Number(p).toLocaleString("en-IN");
}

function imgSrc(src) {
  if (!src) return "";
  return src.startsWith("/uploads") ? `${API}${src}` : src;
}

function initials(name) {
  return (name || "A").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

async function apiReq(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

async function apiForm(path, formData, method = "POST") {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

/* ──── CONFIRM MODAL ──── */
function confirmDelete(cb, msg) {
  deleteCallback = cb;
  if (msg) $("confirm-modal-msg").textContent = msg;
  show($("confirm-modal"));
}
$("close-confirm-modal").onclick = () => hide($("confirm-modal"));
$("cancel-delete-btn").onclick = () => hide($("confirm-modal"));
$("confirm-delete-btn").onclick = async () => {
  hide($("confirm-modal"));
  if (deleteCallback) await deleteCallback();
  deleteCallback = null;
};

/* ──── ROUTING ──── */
function navigate(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

  const pageEl = $(`page-${page}`);
  if (pageEl) pageEl.classList.add("active");

  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add("active");

  const titles = {
    dashboard: "Dashboard", properties: "Properties",
    enquiries: "Enquiries", "add-property": "Add Property", settings: "Settings",
  };
  $("page-title").textContent = titles[page] || page;

  if (page === "dashboard") loadDashboard();
  if (page === "properties") { propPage = 1; loadProperties(); }
  if (page === "enquiries") { enqPage = 1; loadEnquiries(); }
  if (page === "add-property") resetPropertyForm();
  if (page === "settings") loadSettings();

  if (window.innerWidth <= 900) $("sidebar").classList.remove("open");
}

document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", (e) => { e.preventDefault(); navigate(item.dataset.page); });
});

document.querySelectorAll(".card-link").forEach(link => {
  link.addEventListener("click", (e) => { e.preventDefault(); navigate(link.dataset.page); });
});

$("go-add-property").onclick = () => navigate("add-property");
$("sidebar-toggle").onclick = () => $("sidebar").classList.toggle("open");
$("logout-btn").onclick = () => {
  token = ""; localStorage.removeItem("sm_admin_token");
  hide($("app")); show($("login-page"));
};

/* ──── LOGIN ──── */
$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("login-btn");
  btn.disabled = true; btn.innerHTML = "<span>Signing in…</span>";
  hideId("login-error");
  try {
    const data = await apiReq("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: $("login-email").value, password: $("login-password").value }),
    });
    token = data.data.token;
    localStorage.setItem("sm_admin_token", token);
    currentAdminProfile = data.data.admin;
    setAdminUI(data.data.admin);
    hide($("login-page")); show($("app"));
    navigate("dashboard");
  } catch (err) {
    $("login-error").textContent = err.message; show($("login-error"));
  } finally {
    btn.disabled = false; btn.innerHTML = "<span>Sign In</span>";
  }
});

function setAdminUI(admin) {
  const name = admin?.name || "Admin";
  $("admin-name").textContent = name;
  $("sidebar-user-name").textContent = name;
  $("sidebar-avatar").textContent = initials(name);
}

/* ──── DASHBOARD ──── */
async function loadDashboard() {
  try {
    const { data } = await apiReq("/api/dashboard/stats");
    $("stat-total-properties").textContent = data.stats.totalProperties;
    $("stat-total-enquiries").textContent = data.stats.totalEnquiries;
    $("stat-available").textContent = data.stats.availableProperties;
    $("stat-new-enquiries").textContent = data.stats.newEnquiries;

    // Update nav badge for new enquiries
    const badge = $("nav-enquiry-badge");
    if (data.stats.newEnquiries > 0) {
      badge.textContent = data.stats.newEnquiries;
      show(badge);
    } else {
      hide(badge);
    }

    renderRecentEnquiries(data.recentEnquiries);
    renderRecentProperties(data.recentProperties);
  } catch (err) { toast("Failed to load dashboard: " + err.message, "error"); }
}

function renderRecentEnquiries(list) {
  const el = $("recent-enquiries-list");
  if (!list?.length) { el.innerHTML = '<div class="empty-state">No enquiries yet</div>'; return; }
  el.innerHTML = list.map(e => `
    <div class="list-item" onclick="viewEnquiry('${e._id}')" style="cursor:pointer;">
      <div class="list-item-info">
        <div class="list-item-name">${e.name}</div>
        <div class="list-item-sub">${e.email} &middot; ${e.propertyInterested || "General"}</div>
      </div>
      <div class="list-item-meta">
        ${badgeStatus(e.status)}
        <div class="list-item-date">${fmtDate(e.createdAt)}</div>
      </div>
    </div>`).join("");
}

function renderRecentProperties(list) {
  const el = $("recent-properties-list");
  if (!list?.length) { el.innerHTML = '<div class="empty-state">No properties yet</div>'; return; }
  el.innerHTML = list.map(p => `
    <div class="list-item">
      <div class="list-item-img">
        ${p.thumbnail ? `<img src="${imgSrc(p.thumbnail)}" alt="" />` : '<div class="list-item-img-placeholder"></div>'}
      </div>
      <div class="list-item-info">
        <div class="list-item-name">${p.title}</div>
        <div class="list-item-sub">${p.location} &middot; ${fmtPrice(p.price)}</div>
      </div>
      <div class="list-item-badge">${badgeStatus(p.status)}</div>
    </div>`).join("");
}

/* ──── PROPERTIES ──── */
async function loadProperties() {
  const search = $("prop-search").value;
  const status = $("prop-status-filter").value;
  const type = $("prop-type-filter").value;
  try {
    const { data, pagination } = await apiReq(
      `/api/properties?page=${propPage}&limit=10&search=${encodeURIComponent(search)}&status=${status}&type=${type}`
    );
    const tbody = $("properties-tbody");
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state">No properties found</div></td></tr>';
    } else {
      tbody.innerHTML = data.map(p => `
        <tr>
          <td>
            <div class="prop-cell">
              ${p.thumbnail
                ? `<img src="${imgSrc(p.thumbnail)}" class="prop-thumb" alt="" />`
                : '<div class="prop-thumb prop-thumb-empty"></div>'}
              <div>
                <div class="prop-name">${p.title}</div>
                <div class="prop-type-sub">${p.bedrooms} bd · ${p.bathrooms} ba · ${(p.area || 0).toLocaleString()} ft²</div>
              </div>
            </div>
          </td>
          <td><span class="type-pill">${p.type || "—"}</span></td>
          <td style="color:var(--text-muted)">${p.location}</td>
          <td style="font-weight:500">${fmtPrice(p.price)}</td>
          <td>${badgeStatus(p.status)}</td>
          <td>${p.featured ? '<span class="badge badge-featured">★ Featured</span>' : '<span style="color:var(--text-faint)">—</span>'}</td>
          <td>
            <div class="action-btns">
              <button class="action-btn gold" onclick="editProperty('${p._id}')">Edit</button>
              <button class="action-btn" onclick="toggleFeatured('${p._id}', ${p.featured})">${p.featured ? 'Unfeature' : 'Feature'}</button>
              <button class="action-btn danger" onclick="deleteProperty('${p._id}', '${p.title.replace(/'/g,"\\'")}')">Delete</button>
            </div>
          </td>
        </tr>`).join("");
    }
    renderPagination("prop-pagination", pagination, (p) => { propPage = p; loadProperties(); });
  } catch (err) { toast("Failed to load properties: " + err.message, "error"); }
}

$("prop-search").addEventListener("input", debounce(() => { propPage = 1; loadProperties(); }, 400));
$("prop-status-filter").addEventListener("change", () => { propPage = 1; loadProperties(); });
$("prop-type-filter").addEventListener("change", () => { propPage = 1; loadProperties(); });

async function toggleFeatured(id, isFeatured) {
  try {
    await apiReq(`/api/properties/${id}/toggle-featured`, { method: "PATCH" });
    toast(`Property ${isFeatured ? "removed from featured" : "marked as featured"}`);
    loadProperties();
  } catch (err) { toast(err.message, "error"); }
}

async function deleteProperty(id, name) {
  confirmDelete(async () => {
    try {
      await apiReq(`/api/properties/${id}`, { method: "DELETE" });
      toast("Property deleted");
      loadProperties();
    } catch (err) { toast(err.message, "error"); }
  }, `Delete "${name}"? This cannot be undone.`);
}

async function editProperty(id) {
  try {
    const { data } = await apiReq(`/api/properties/${id}`);
    $("property-form-title").textContent = "Edit Property";
    $("edit-property-id").value = id;
    $("prop-title").value = data.title;
    $("prop-type").value = data.type;
    $("prop-description").value = data.description;
    $("prop-price").value = data.price;
    $("prop-location").value = data.location;
    $("prop-status").value = data.status;
    $("prop-beds").value = data.bedrooms;
    $("prop-baths").value = data.bathrooms;
    $("prop-area").value = data.area;
    $("prop-featured").checked = data.featured;

    // Show existing thumbnail
    if (data.thumbnail) {
      $("thumbnail-preview").innerHTML = `
        <div style="position:relative;display:inline-block;">
          <img src="${imgSrc(data.thumbnail)}" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;" />
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Current thumbnail (upload new to replace)</div>
        </div>`;
    } else {
      $("thumbnail-preview").innerHTML = "";
    }

    // Show existing gallery images
    const existingSection = $("existing-images-section");
    const existingGrid = $("existing-images-grid");
    if (data.images?.length) {
      existingGrid.innerHTML = data.images.map((img, i) => `
        <div class="img-preview-item" style="position:relative;">
          <img src="${imgSrc(img)}" alt="" />
          <div style="font-size:9px;color:var(--text-faint);text-align:center;margin-top:2px;">${i + 1}</div>
        </div>`).join("");
      show(existingSection);
    } else {
      hide(existingSection);
    }

    $("images-preview").innerHTML = "";
    navigate("add-property");
  } catch (err) { toast(err.message, "error"); }
}

/* ──── PROPERTY FORM ──── */
function resetPropertyForm() {
  $("property-form-title").textContent = "Add Property";
  $("property-form").reset();
  $("edit-property-id").value = "";
  $("thumbnail-preview").innerHTML = "";
  $("images-preview").innerHTML = "";
  $("existing-images-grid").innerHTML = "";
  hide($("existing-images-section"));
  hideId("prop-form-error");
}

$("cancel-property-form").onclick = () => navigate("properties");
$("cancel-property-form-2").onclick = () => navigate("properties");

// File input previews
$("prop-thumbnail").addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    $("thumbnail-preview").innerHTML = `<img src="${url}" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;" />`;
  }
});

$("prop-images").addEventListener("change", function () {
  const files = Array.from(this.files);
  $("images-preview").innerHTML = files.map(f =>
    `<div class="img-preview-item"><img src="${URL.createObjectURL(f)}" alt="" /></div>`
  ).join("");
});

// Drag & drop for thumbnail
setupDropZone("thumbnail-drop-zone", "prop-thumbnail");
setupDropZone("images-drop-zone", "prop-images");

function setupDropZone(zoneId, inputId) {
  const zone = $(zoneId);
  if (!zone) return;
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag-over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    const input = $(inputId);
    if (input && e.dataTransfer.files.length) {
      input.files = e.dataTransfer.files;
      input.dispatchEvent(new Event("change"));
    }
  });
  zone.addEventListener("click", (e) => {
    if (e.target.tagName !== "LABEL") $(inputId)?.click();
  });
}

$("property-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideId("prop-form-error");
  const btn = $("save-property-btn");
  const label = $("save-property-label");
  btn.disabled = true; label.textContent = "Saving…";

  const id = $("edit-property-id").value;
  const formData = new FormData();
  formData.append("title", $("prop-title").value);
  formData.append("type", $("prop-type").value);
  formData.append("description", $("prop-description").value);
  formData.append("price", $("prop-price").value);
  formData.append("location", $("prop-location").value);
  formData.append("status", $("prop-status").value);
  formData.append("bedrooms", $("prop-beds").value);
  formData.append("bathrooms", $("prop-baths").value);
  formData.append("area", $("prop-area").value);
  formData.append("featured", $("prop-featured").checked);

  const thumb = $("prop-thumbnail").files[0];
  if (thumb) formData.append("thumbnail", thumb);
  Array.from($("prop-images").files).forEach(f => formData.append("images", f));

  try {
    if (id) {
      await apiForm(`/api/properties/${id}`, formData, "PUT");
      toast("Property updated successfully");
    } else {
      await apiForm("/api/properties", formData, "POST");
      toast("Property created successfully");
    }
    resetPropertyForm();
    navigate("properties");
  } catch (err) {
    $("prop-form-error").textContent = err.message;
    show($("prop-form-error"));
  } finally {
    btn.disabled = false;
    label.textContent = "Save Property";
  }
});

/* ──── ENQUIRIES ──── */
async function loadEnquiries() {
  const search = $("enq-search").value;
  const status = $("enq-status-filter").value;
  try {
    const { data, pagination } = await apiReq(
      `/api/enquiries?page=${enqPage}&limit=15&search=${encodeURIComponent(search)}&status=${status}`
    );
    const tbody = $("enquiries-tbody");
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state">No enquiries found</div></td></tr>';
    } else {
      tbody.innerHTML = data.map(e => `
        <tr>
          <td>
            <div style="font-weight:500">${e.name}</div>
          </td>
          <td style="color:var(--text-muted)">${e.email}</td>
          <td style="color:var(--text-muted)">${e.phone || "—"}</td>
          <td style="color:var(--text-muted);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${e.propertyInterested || ''}">${e.propertyInterested || "—"}</td>
          <td>${badgeStatus(e.status)}</td>
          <td style="color:var(--text-muted);white-space:nowrap">${fmtDate(e.createdAt)}</td>
          <td>
            <div class="action-btns">
              <button class="action-btn gold" onclick="viewEnquiry('${e._id}')">View</button>
              <button class="action-btn danger" onclick="deleteEnquiry('${e._id}', '${(e.name || '').replace(/'/g,"\\'")}')">Delete</button>
            </div>
          </td>
        </tr>`).join("");
    }
    renderPagination("enq-pagination", pagination, (p) => { enqPage = p; loadEnquiries(); });
  } catch (err) { toast("Failed to load enquiries: " + err.message, "error"); }
}

$("enq-search").addEventListener("input", debounce(() => { enqPage = 1; loadEnquiries(); }, 400));
$("enq-status-filter").addEventListener("change", () => { enqPage = 1; loadEnquiries(); });

// CSV Export
$("export-enquiries-btn").onclick = async () => {
  try {
    const { data } = await apiReq(`/api/enquiries?limit=1000`);
    const headers = ["Name", "Email", "Phone", "Property Interested", "Status", "Message", "Date"];
    const rows = data.map(e => [
      `"${e.name}"`, `"${e.email}"`, `"${e.phone || ""}"`,
      `"${e.propertyInterested || ""}"`, `"${e.status}"`,
      `"${(e.message || "").replace(/"/g, '""')}"`, `"${fmtDate(e.createdAt)}"`,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `enquiries-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast("Enquiries exported");
  } catch (err) { toast("Export failed: " + err.message, "error"); }
};

async function viewEnquiry(id) {
  try {
    const { data } = await apiReq(`/api/enquiries/${id}`);
    currentEnquiryId = id;
    $("enquiry-modal-body").innerHTML = `
      <div class="enquiry-detail-grid">
        <div class="enquiry-detail-row"><span class="enquiry-detail-label">Name</span><span class="enquiry-detail-value">${data.name}</span></div>
        <div class="enquiry-detail-row"><span class="enquiry-detail-label">Email</span><span class="enquiry-detail-value"><a href="mailto:${data.email}" style="color:var(--gold)">${data.email}</a></span></div>
        <div class="enquiry-detail-row"><span class="enquiry-detail-label">Phone</span><span class="enquiry-detail-value"><a href="tel:${data.phone}" style="color:var(--gold)">${data.phone || "—"}</a></span></div>
        <div class="enquiry-detail-row"><span class="enquiry-detail-label">Property</span><span class="enquiry-detail-value">${data.propertyInterested || "—"}</span></div>
        <div class="enquiry-detail-row"><span class="enquiry-detail-label">Status</span><span class="enquiry-detail-value">${badgeStatus(data.status)}</span></div>
        <div class="enquiry-detail-row"><span class="enquiry-detail-label">Date</span><span class="enquiry-detail-value">${fmtDate(data.createdAt)}</span></div>
      </div>
      <div style="margin-top:16px;">
        <div class="enquiry-detail-label" style="margin-bottom:8px;">Message</div>
        <div class="enquiry-message-box">${data.message || "—"}</div>
      </div>`;
    $("enquiry-status-select").value = data.status;
    show($("enquiry-modal"));
  } catch (err) { toast(err.message, "error"); }
}

$("close-enquiry-modal").onclick = () => hide($("enquiry-modal"));

$("update-enquiry-status-btn").onclick = async () => {
  if (!currentEnquiryId) return;
  try {
    await apiReq(`/api/enquiries/${currentEnquiryId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: $("enquiry-status-select").value }),
    });
    toast("Status updated");
    hide($("enquiry-modal"));
    loadEnquiries();
    loadDashboardBadge();
  } catch (err) { toast(err.message, "error"); }
};

$("delete-enquiry-btn").onclick = () => {
  confirmDelete(async () => {
    try {
      await apiReq(`/api/enquiries/${currentEnquiryId}`, { method: "DELETE" });
      toast("Enquiry deleted");
      hide($("enquiry-modal"));
      loadEnquiries();
    } catch (err) { toast(err.message, "error"); }
  }, "Delete this enquiry? This cannot be undone.");
};

async function deleteEnquiry(id, name) {
  currentEnquiryId = id;
  confirmDelete(async () => {
    try {
      await apiReq(`/api/enquiries/${id}`, { method: "DELETE" });
      toast("Enquiry deleted");
      loadEnquiries();
    } catch (err) { toast(err.message, "error"); }
  }, `Delete enquiry from "${name}"?`);
}

async function loadDashboardBadge() {
  try {
    const { data } = await apiReq("/api/dashboard/stats");
    const badge = $("nav-enquiry-badge");
    if (data.stats.newEnquiries > 0) { badge.textContent = data.stats.newEnquiries; show(badge); }
    else hide(badge);
  } catch {}
}

/* ──── SETTINGS ──── */
async function loadSettings() {
  $("system-api-url").textContent = API;
  try {
    const { data } = await apiReq("/api/auth/me");
    currentAdminProfile = data;
    $("profile-name-display").textContent = data.name || "Admin";
    $("profile-name-val").textContent = data.name || "—";
    $("profile-email-val").textContent = data.email || "—";
    $("profile-avatar-big").textContent = initials(data.name);
  } catch (err) { toast("Failed to load profile: " + err.message, "error"); }
}

$("change-password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideId("pwd-error"); hideId("pwd-success");
  const newPwd = $("new-password").value;
  const confirmPwd = $("confirm-password").value;
  if (newPwd !== confirmPwd) {
    $("pwd-error").textContent = "Passwords do not match"; show($("pwd-error")); return;
  }
  const btn = $("change-pwd-btn");
  btn.disabled = true; btn.textContent = "Updating…";
  try {
    await apiReq("/api/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword: $("current-password").value, newPassword: newPwd }),
    });
    $("pwd-success").textContent = "Password updated successfully"; show($("pwd-success"));
    $("change-password-form").reset();
  } catch (err) {
    $("pwd-error").textContent = err.message; show($("pwd-error"));
  } finally {
    btn.disabled = false; btn.textContent = "Update Password";
  }
});

$("seed-admin-btn").onclick = async () => {
  try {
    await apiReq("/api/auth/seed", { method: "POST" });
    toast("Admin seeded: admin@serenemansion.com / Admin@123");
  } catch (err) { toast(err.message, "error"); }
};

/* ──── PAGINATION ──── */
function renderPagination(containerId, pagination, onPage) {
  if (!pagination) return;
  const { page, totalPages, total } = pagination;
  const el = $(containerId);
  if (!el) return;
  if (totalPages <= 1) { el.innerHTML = `<span class="pagination-info">${total || 0} record${total !== 1 ? "s" : ""}</span>`; return; }
  let html = `<span class="pagination-info">${total} records</span>`;
  if (page > 1) html += `<button class="page-btn" data-p="${page - 1}">← Prev</button>`;
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  if (start > 1) html += `<button class="page-btn" data-p="1">1</button>${start > 2 ? '<span class="page-ellipsis">…</span>' : ''}`;
  for (let i = start; i <= end; i++) {
    html += `<button class="page-btn ${i === page ? 'active' : ''}" data-p="${i}">${i}</button>`;
  }
  if (end < totalPages) html += `${end < totalPages - 1 ? '<span class="page-ellipsis">…</span>' : ''}<button class="page-btn" data-p="${totalPages}">${totalPages}</button>`;
  if (page < totalPages) html += `<button class="page-btn" data-p="${page + 1}">Next →</button>`;
  el.innerHTML = html;
  el.querySelectorAll("[data-p]").forEach(btn => {
    btn.onclick = () => onPage(Number(btn.dataset.p));
  });
}

/* ──── DEBOUNCE ──── */
function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

/* ──── AUTO LOGIN CHECK ──── */
(async function init() {
  if (!token) return;
  try {
    const data = await apiReq("/api/auth/me");
    currentAdminProfile = data.data;
    setAdminUI(data.data);
    hide($("login-page")); show($("app"));
    navigate("dashboard");
  } catch {
    token = ""; localStorage.removeItem("sm_admin_token");
  }
})();

/* ──── GLOBAL EXPORTS ──── */
window.editProperty = editProperty;
window.deleteProperty = deleteProperty;
window.toggleFeatured = toggleFeatured;
window.viewEnquiry = viewEnquiry;
window.deleteEnquiry = deleteEnquiry;

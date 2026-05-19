const API = window.location.origin;
let token = localStorage.getItem("sm_admin_token") || "";
let currentEnquiryId = null;
let deleteCallback = null;
let propPage = 1, enqPage = 1;

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
    "Available": "badge-available", "Sold": "badge-sold",
    "Under Offer": "badge-offer", "New": "badge-new",
    "Contacted": "badge-contacted", "Closed": "badge-closed",
  };
  return `<span class="badge ${map[status] || ''}">${status}</span>`;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtPrice(p) {
  return "₹" + Number(p).toLocaleString("en-IN");
}

async function api(path, options = {}) {
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
function confirmDelete(cb) {
  deleteCallback = cb;
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

  const titles = { dashboard: "Dashboard", properties: "Properties", enquiries: "Enquiries", "add-property": "Add Property" };
  $("page-title").textContent = titles[page] || page;

  if (page === "dashboard") loadDashboard();
  if (page === "properties") { propPage = 1; loadProperties(); }
  if (page === "enquiries") { enqPage = 1; loadEnquiries(); }
  if (page === "add-property") resetPropertyForm();

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
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: $("login-email").value, password: $("login-password").value }),
    });
    token = data.data.token;
    localStorage.setItem("sm_admin_token", token);
    $("admin-name").textContent = data.data.admin?.name || "Admin";
    hide($("login-page")); show($("app"));
    navigate("dashboard");
  } catch (err) {
    $("login-error").textContent = err.message; show($("login-error"));
  } finally {
    btn.disabled = false; btn.innerHTML = "<span>Sign In</span>";
  }
});

/* ──── DASHBOARD ──── */
async function loadDashboard() {
  try {
    const { data } = await api("/api/dashboard/stats");
    $("stat-total-properties").textContent = data.stats.totalProperties;
    $("stat-total-enquiries").textContent = data.stats.totalEnquiries;
    $("stat-available").textContent = data.stats.availableProperties;
    $("stat-new-enquiries").textContent = data.stats.newEnquiries;
    renderRecentEnquiries(data.recentEnquiries);
    renderRecentProperties(data.recentProperties);
  } catch (err) { toast("Failed to load dashboard: " + err.message, "error"); }
}

function renderRecentEnquiries(list) {
  const el = $("recent-enquiries-list");
  if (!list.length) { el.innerHTML = '<div class="empty-state">No enquiries yet</div>'; return; }
  el.innerHTML = list.map(e => `
    <div class="list-item">
      <div class="list-item-info">
        <div class="list-item-name">${e.name}</div>
        <div class="list-item-sub">${e.email} &middot; ${e.propertyInterested}</div>
      </div>
      <div class="list-item-badge">${badgeStatus(e.status)}</div>
    </div>`).join("");
}

function renderRecentProperties(list) {
  const el = $("recent-properties-list");
  if (!list.length) { el.innerHTML = '<div class="empty-state">No properties yet</div>'; return; }
  el.innerHTML = list.map(p => `
    <div class="list-item">
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
  try {
    const { data, pagination } = await api(`/api/properties?page=${propPage}&limit=10&search=${search}&status=${status}`);
    const tbody = $("properties-tbody");
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No properties found</div></td></tr>';
    } else {
      tbody.innerHTML = data.map(p => `
        <tr>
          <td>
            <div class="prop-cell">
              ${p.thumbnail ? `<img src="${p.thumbnail}" class="prop-thumb" alt="" />` : '<div class="prop-thumb"></div>'}
              <div>
                <div class="prop-name">${p.title}</div>
                <div class="prop-type">${p.type}</div>
              </div>
            </div>
          </td>
          <td style="color:var(--text-muted)">${p.location}</td>
          <td>${fmtPrice(p.price)}</td>
          <td>${badgeStatus(p.status)}</td>
          <td>${p.featured ? '<span class="badge badge-featured">Featured</span>' : '—'}</td>
          <td>
            <div class="action-btns">
              <button class="action-btn gold" onclick="editProperty('${p._id}')">Edit</button>
              <button class="action-btn" onclick="toggleFeatured('${p._id}', ${p.featured})">${p.featured ? 'Unfeature' : 'Feature'}</button>
              <button class="action-btn danger" onclick="deleteProperty('${p._id}')">Delete</button>
            </div>
          </td>
        </tr>`).join("");
    }
    renderPagination("prop-pagination", pagination, (p) => { propPage = p; loadProperties(); });
  } catch (err) { toast("Failed to load properties: " + err.message, "error"); }
}

$("prop-search").addEventListener("input", debounce(() => { propPage = 1; loadProperties(); }, 400));
$("prop-status-filter").addEventListener("change", () => { propPage = 1; loadProperties(); });

async function toggleFeatured(id, isFeatured) {
  try {
    await api(`/api/properties/${id}/toggle-featured`, { method: "PATCH" });
    toast(`Property ${isFeatured ? "unfeatured" : "featured"}`);
    loadProperties();
  } catch (err) { toast(err.message, "error"); }
}

async function deleteProperty(id) {
  confirmDelete(async () => {
    try {
      await api(`/api/properties/${id}`, { method: "DELETE" });
      toast("Property deleted");
      loadProperties();
    } catch (err) { toast(err.message, "error"); }
  });
}

async function editProperty(id) {
  try {
    const { data } = await api(`/api/properties/${id}`);
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
    if (data.thumbnail) {
      $("thumbnail-preview").innerHTML = `<img src="${data.thumbnail}" />`;
    }
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
  hideId("prop-form-error");
  hideId("prop-form-success");
}

$("cancel-property-form").onclick = () => navigate("properties");

$("prop-thumbnail").addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    $("thumbnail-preview").innerHTML = `<img src="${url}" />`;
  }
});

$("prop-images").addEventListener("change", function () {
  const files = Array.from(this.files);
  $("images-preview").innerHTML = files.map(f => `<img src="${URL.createObjectURL(f)}" />`).join("");
});

$("property-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideId("prop-form-error"); hideId("prop-form-success");
  const btn = $("save-property-btn");
  btn.disabled = true; btn.textContent = "Saving…";

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
    $("prop-form-error").textContent = err.message; show($("prop-form-error"));
  } finally {
    btn.disabled = false; btn.textContent = "Save Property";
  }
});

/* ──── ENQUIRIES ──── */
async function loadEnquiries() {
  const search = $("enq-search").value;
  const status = $("enq-status-filter").value;
  try {
    const { data, pagination } = await api(`/api/enquiries?page=${enqPage}&limit=15&search=${search}&status=${status}`);
    const tbody = $("enquiries-tbody");
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state">No enquiries found</div></td></tr>';
    } else {
      tbody.innerHTML = data.map(e => `
        <tr>
          <td style="font-weight:500">${e.name}</td>
          <td style="color:var(--text-muted)">${e.email}</td>
          <td style="color:var(--text-muted)">${e.phone}</td>
          <td style="color:var(--text-muted)">${e.propertyInterested}</td>
          <td>${badgeStatus(e.status)}</td>
          <td style="color:var(--text-muted)">${fmtDate(e.createdAt)}</td>
          <td>
            <div class="action-btns">
              <button class="action-btn gold" onclick="viewEnquiry('${e._id}')">View</button>
              <button class="action-btn danger" onclick="deleteEnquiry('${e._id}')">Delete</button>
            </div>
          </td>
        </tr>`).join("");
    }
    renderPagination("enq-pagination", pagination, (p) => { enqPage = p; loadEnquiries(); });
  } catch (err) { toast("Failed to load enquiries: " + err.message, "error"); }
}

$("enq-search").addEventListener("input", debounce(() => { enqPage = 1; loadEnquiries(); }, 400));
$("enq-status-filter").addEventListener("change", () => { enqPage = 1; loadEnquiries(); });

async function viewEnquiry(id) {
  try {
    const { data } = await api(`/api/enquiries/${id}`);
    currentEnquiryId = id;
    $("enquiry-modal-body").innerHTML = `
      <div class="enquiry-detail-row"><span class="enquiry-detail-label">Name</span><span class="enquiry-detail-value">${data.name}</span></div>
      <div class="enquiry-detail-row"><span class="enquiry-detail-label">Email</span><span class="enquiry-detail-value">${data.email}</span></div>
      <div class="enquiry-detail-row"><span class="enquiry-detail-label">Phone</span><span class="enquiry-detail-value">${data.phone}</span></div>
      <div class="enquiry-detail-row"><span class="enquiry-detail-label">Property</span><span class="enquiry-detail-value">${data.propertyInterested}</span></div>
      <div class="enquiry-detail-row"><span class="enquiry-detail-label">Status</span><span class="enquiry-detail-value">${badgeStatus(data.status)}</span></div>
      <div class="enquiry-detail-row"><span class="enquiry-detail-label">Date</span><span class="enquiry-detail-value">${fmtDate(data.createdAt)}</span></div>
      <div style="margin-top:16px;">
        <div class="enquiry-detail-label" style="margin-bottom:8px;">Message</div>
        <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:14px;color:var(--text-muted);line-height:1.7">${data.message}</div>
      </div>`;
    $("enquiry-status-select").value = data.status;
    show($("enquiry-modal"));
  } catch (err) { toast(err.message, "error"); }
}

$("close-enquiry-modal").onclick = () => hide($("enquiry-modal"));

$("update-enquiry-status-btn").onclick = async () => {
  if (!currentEnquiryId) return;
  try {
    await api(`/api/enquiries/${currentEnquiryId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: $("enquiry-status-select").value }),
    });
    toast("Status updated");
    hide($("enquiry-modal"));
    loadEnquiries();
  } catch (err) { toast(err.message, "error"); }
};

$("delete-enquiry-btn").onclick = () => {
  confirmDelete(async () => {
    try {
      await api(`/api/enquiries/${currentEnquiryId}`, { method: "DELETE" });
      toast("Enquiry deleted");
      hide($("enquiry-modal"));
      loadEnquiries();
    } catch (err) { toast(err.message, "error"); }
  });
};

async function deleteEnquiry(id) {
  currentEnquiryId = id;
  confirmDelete(async () => {
    try {
      await api(`/api/enquiries/${id}`, { method: "DELETE" });
      toast("Enquiry deleted");
      loadEnquiries();
    } catch (err) { toast(err.message, "error"); }
  });
}

/* ──── PAGINATION ──── */
function renderPagination(containerId, pagination, onPage) {
  if (!pagination) return;
  const { page, totalPages } = pagination;
  const el = $(containerId);
  if (totalPages <= 1) { el.innerHTML = ""; return; }
  let html = "";
  if (page > 1) html += `<button class="page-btn" onclick="(${onPage.toString()})(${page - 1})">← Prev</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="(${onPage.toString()})(${i})">${i}</button>`;
  }
  if (page < totalPages) html += `<button class="page-btn" onclick="(${onPage.toString()})(${page + 1})">Next →</button>`;
  el.innerHTML = html;
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
    const data = await api("/api/auth/me");
    $("admin-name").textContent = data.data?.name || "Admin";
    hide($("login-page")); show($("app"));
    navigate("dashboard");
  } catch {
    token = ""; localStorage.removeItem("sm_admin_token");
  }
})();

window.editProperty = editProperty;
window.deleteProperty = deleteProperty;
window.toggleFeatured = toggleFeatured;
window.viewEnquiry = viewEnquiry;
window.deleteEnquiry = deleteEnquiry;

/* =====================================================
   ADMIN PANEL — SERVER ONLY
===================================================== */

// Auth guard
let user = null;
try {
  user = JSON.parse(localStorage.getItem("sfo_user") || "null");
} catch {}

async function ensureAdminSession() {
  try {
    const response = await fetch("/auth/me", { credentials: "include" });
    if (!response.ok) {
      localStorage.removeItem("sfo_user");
      location.href = "/";
      return false;
    }

    const sessionUser = await response.json();
    user = sessionUser;
    localStorage.setItem("sfo_user", JSON.stringify(sessionUser));

    if (String(sessionUser.role || "").toLowerCase() !== "admin") {
      location.href = "/home.html";
      return false;
    }

    return true;
  } catch (err) {
    console.error("Admin session check failed:", err);
    location.href = "/";
    return false;
  }
}

let allBookings = [];
let currentFilterStatus = null;
let currentSearchQuery = '';

/* ===============================
   AUTH GUARD
================================ */
// User management functions
async function createUser(event) {
  event.preventDefault();

  const username = document.getElementById("newUsername").value.trim();
  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value.trim();
  const role = document.getElementById("newRole").value;

  if (!username || !email || !password) {
    alert("All fields are required");
    return;
  }

  if (!email.endsWith("@nestgroup.net")) {
    alert("Email must be from @nestgroup.net domain");
    return;
  }

  try {
    const response = await fetch("/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, email, password, role })
    });

    const result = await response.json();

    if (result.success) {
      showToast("✅ User created successfully");
      document.getElementById("createUserForm").reset();
      loadUsers(); // Refresh list
    } else {
      alert("Error creating user: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error creating user");
  }
}

document.addEventListener("DOMContentLoaded", async function() {
  const allowed = await ensureAdminSession();
  if (!allowed) return;

  loadAdminBookings();
  loadUsers();
  const form = document.getElementById("createUserForm");
  if (form) {
    form.addEventListener("submit", createUser);
  }
});

/* ===============================
   LOAD BOOKINGS
================================ */
async function loadAdminBookings() {
  const container = document.getElementById("adminList");
  if (!container) return;

  container.innerHTML = `<div class="slot loading">Loading bookings…</div>`;

  try {
    const res = await fetch("/api/bookings", { credentials: "include" });
    if (res.status === 401) {
      alert("Session expired. Please login again.");
      location.href = "/";
      return;
    }
    if (!res.ok) throw new Error("Failed to fetch");

    allBookings = await res.json();

    // Sort: Latest first (by createdAt or date)
    allBookings.sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    });

    // Apply initial filters (show all by default)
    currentFilterStatus = null;
    applyFilters();

    // Update Stats
    updateAdminStats();
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="slot rejected">Error loading bookings</div>`;
  }
}

async function updateAdminStats() {
  const statPending = document.getElementById("statPending");
  const statApproved = document.getElementById("statApproved");
  const statRejected = document.getElementById("statRejected");

  if (!statPending && !statApproved && !statRejected) return;

  const pendingCount = allBookings.filter(b => (b.status || "PENDING").toUpperCase() === "PENDING").length;
  const approvedCount = allBookings.filter(b => (b.status || "PENDING").toUpperCase() === "APPROVED").length;
  const rejectedCount = allBookings.filter(b => (b.status || "PENDING").toUpperCase() === "REJECTED").length;

  if (statPending) statPending.innerText = pendingCount;
  if (statApproved) statApproved.innerText = approvedCount;
  if (statRejected) statRejected.innerText = rejectedCount;
}

/* ===============================
   FILTER FUNCTIONS
================================ */
function filterByStatus(status) {
  currentFilterStatus = status;
  applyFilters();
}

function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  currentSearchQuery = searchInput ? searchInput.value.toLowerCase() : '';

  let filteredBookings = allBookings;

  // Filter by status if set
  if (currentFilterStatus) {
    filteredBookings = filteredBookings.filter(b => (b.status || "PENDING").toUpperCase() === currentFilterStatus);
  }

  // Filter by search query
  if (currentSearchQuery) {
    filteredBookings = filteredBookings.filter(b =>
      (b.room || '').toLowerCase().includes(currentSearchQuery) ||
      (b.team || b.division || '').toLowerCase().includes(currentSearchQuery) ||
      (b.user || '').toLowerCase().includes(currentSearchQuery) ||
      (b.email || '').toLowerCase().includes(currentSearchQuery) ||
      (b.meetingType || '').toLowerCase().includes(currentSearchQuery)
    );
  }

  renderFilteredBookings(filteredBookings);
}

function renderFilteredBookings(bookings) {
  const container = document.getElementById("adminList");
  if (!container) return;

  if (!bookings.length) {
    container.innerHTML = `<div class="slot rejected">No bookings found matching the criteria</div>`;
  } else {
    container.innerHTML = bookings.map(renderBookingCard).join("");
  }
}

/* ===============================
   RENDER CARD
================================ */
function renderBookingCard(b) {
  const id = b._id || b.id;
  const status = (b.status || "PENDING").toUpperCase();
  const safeBooking = encodeURIComponent(JSON.stringify(b));

  return `
    <div class="slot">
      <div class="slot-header">
        <span><b>${b.room}</b> — ${b.team || b.division || "-"}</span>
        <span class="status ${status.toLowerCase()}">${status}</span>
      </div>

      <div class="slot-meta">
        📅 ${b.date} &nbsp; ⏰ ${b.start} – ${b.end}
      </div>

      <div class="slot-meta">
        👤 ${b.user || "Admin"} (${b.email || "—"})
      </div>

      <div class="slot-meta">
        📝 ${b.meetingType || "N/A"} &nbsp; 👥 ${b.attendees || 0} Attendees
      </div>

      <div class="slot-actions">
        ${status === "PENDING" ? `
          <button class="approve" onclick="changeStatus('${id}', 'APPROVED')">
            ✅ Approve
          </button>
          <button class="reject" onclick="changeStatus('${id}', 'REJECTED')">
            ❌ Reject
          </button>
        ` : `
          <button class="secondary" disabled>
            ${status === "APPROVED" ? "✅ Approved" : "❌ Rejected"}
          </button>
        `}

        <button onclick="generatePDF(JSON.parse(decodeURIComponent('${safeBooking}')))">
          📄 PDF
        </button>

        <button onclick="emailPdf(JSON.parse(decodeURIComponent('${safeBooking}')))">
          📧 Email
        </button>

        <button class="danger" onclick="deleteBooking('${id}')">
          🗑 Delete
        </button>
      </div>
    </div>
  `;
}

/* ===============================
   UPDATE STATUS
================================ */
async function changeStatus(id, status) {
  if (!confirm(`Mark booking as ${status}?\n\nAn email notification will be sent to the user.`)) return;

  const payload = { status: String(status || "").toUpperCase() };

  try {
    let res = await fetch(`/api/bookings/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    if (!res.ok && res.status === 404) {
      res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
    }

    let result = {};
    try {
      result = await res.json();
    } catch {
      result = {};
    }

    if (res.status === 401) {
      alert("Session expired. Please login again.");
      location.href = "/";
      return;
    }

    if (res.status === 403) {
      showToast("Admin permission required for approval actions", "error");
      return;
    }

    if (!res.ok) {
      showToast(result.error || "Status update failed", "error");
      return;
    }

    showToast(`Booking ${payload.status.toLowerCase()} successfully`, "success");
    loadAdminBookings();
  } catch (err) {
    console.error("Status update error:", err);
    showToast("Network error while updating status", "error");
  }
}

/* ===============================
   DELETE BOOKING
================================ */
async function deleteBooking(id) {
  if (!confirm("⚠️ Permanently delete this booking?\n\nThis action cannot be undone.")) return;

  try {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (res.status === 401) {
      alert("Session expired. Please login again.");
      location.href = "/";
      return;
    }

    if (res.ok) {
      showToast("🗑️ Booking deleted successfully", "success");
      loadAdminBookings();
    } else {
      showToast("❌ Delete failed", "error");
    }
  } catch (err) {
    showToast("❌ Network error", "error");
  }
}

/* ===============================
   IMAGE HELPERS
================================ */
function getBase64Image(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

/* ===============================
   EMAIL PDF
================================ */
async function emailPdf(booking) {
  if (!booking.email) {
    alert("No email address found for this booking");
    return;
  }

  if (!confirm(`Send booking confirmation email to ${booking.email}?`)) {
    return;
  }

  showToast("Preparing email...", "info");

  try {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      alert("PDF library not loaded");
      return;
    }

    const doc = new jsPDF();
    
    // Add Logo
    try {
      const logoData = await getBase64Image("assets/logo.png");
      doc.addImage(logoData, "PNG", 15, 10, 30, 15);
    } catch (e) {
      console.warn("Logo failed to load");
    }

    doc.setFontSize(22);
    doc.setTextColor(40, 44, 52);
    doc.text("SFO Meeting Suite", 105, 25, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text("OFFICIAL BOOKING CONFIRMATION", 105, 35, { align: "center" });

    doc.setDrawColor(200);
    doc.line(15, 45, 195, 45);

    doc.setFontSize(12);
    doc.setTextColor(0);

    let y = 60;
    const row = (k, v) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${k}:`, 30, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(v || "-"), 90, y);
      y += 12;
    };

    row("Tracking ID", booking.trackId);
    row("Status", (booking.status || "PENDING").toUpperCase());
    row("Room", booking.room);
    row("Division", booking.division);
    row("Date", booking.date);
    row("Time", `${booking.start} – ${booking.end}`);
    row("Team", booking.team || "-");
    row("Attendees", booking.attendees);
    row("Meeting Type", booking.meetingType);
    row("Booked By", booking.user || booking.email);

    // Add Status Text (Large)
    y += 10;
    doc.setFontSize(24);
    const status = (booking.status || "PENDING").toUpperCase();
    if (status === "APPROVED") {
      doc.setTextColor(34, 197, 94); // Green
      doc.text("APPROVED", 105, y, { align: "center" });
    } else if (status === "REJECTED") {
      doc.setTextColor(239, 68, 68); // Red
      doc.text("REJECTED", 105, y, { align: "center" });
    } else {
      doc.setTextColor(234, 179, 8); // Yellow
      doc.text("PENDING APPROVAL", 105, y, { align: "center" });
    }

    // Add Seal at bottom right
    try {
      const sealData = await getBase64Image("assets/seal.png");
      doc.addImage(sealData, "PNG", 150, 230, 40, 40);
    } catch (e) {
      console.warn("Seal failed to load");
    }

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Generated by SFO Meeting Suite Enterprise Portal", 105, 285, { align: "center" });
    doc.text(new Date().toLocaleString(), 105, 290, { align: "center" });
    
    // Convert PDF to base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    
    // Send email via API
    const response = await fetch(`/api/email/send/${booking._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ pdfBuffer: pdfBase64 })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(`✅ Email sent successfully to ${booking.email}`, "success");
    } else {
      showToast(`❌ Failed to send email: ${result.error || 'Unknown error'}`, "error");
    }
  } catch (error) {
    console.error("Email error:", error);
    showToast(`❌ Error sending email: ${error.message}`, "error");
  }
}

function logout() {
  if (confirm("Logout?")) {
    fetch("/auth/logout", {
      method: "POST",
      credentials: "include"
    }).catch(() => {});
    localStorage.removeItem("sfo_user");
    location.href = "/";
  }
}

/* ===============================
   USER LIST MANAGEMENT
================================ */
async function loadUsers() {
  const container = document.getElementById("userList");
  if (!container) return;

  container.innerHTML = `<div class="slot loading">Loading users…</div>`;

  try {
    const res = await fetch("/admin/users", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch users");
    
    const users = await res.json();

    if (!users.length) {
      container.innerHTML = `<div class="slot rejected">No users found</div>`;
      return;
    }

    container.innerHTML = users.map(renderUserCard).join("");
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="slot rejected">Error loading users</div>`;
  }
}

function renderUserCard(u) {
  const isCurrentUser = user && user.id === u._id;
  
  return `
    <div class="slot">
      <div class="slot-header">
        <span><b>${u.username}</b> ${isCurrentUser ? "(You)" : ""}</span>
        <span class="status ${u.role === 'admin' ? 'approved' : 'pending'}">${u.role.toUpperCase()}</span>
      </div>

      <div class="slot-meta">
        📧 ${u.email}
      </div>

      <div class="slot-actions">
        ${!isCurrentUser ? `
          <button class="danger" onclick="deleteUser('${u._id}')">
            🗑 Delete User
          </button>
        ` : `
          <button class="secondary" disabled>Current Session</button>
        `}
      </div>
    </div>
  `;
}

async function deleteUser(id) {
  if (!confirm("⚠️ Permanently delete this user account?\n\nThis action cannot be undone.")) return;

  try {
    const res = await fetch(`/admin/users/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (res.ok) {
      showToast("🗑️ User deleted successfully", "success");
      loadUsers();
    } else {
      showToast("❌ Delete failed", "error");
    }
  } catch (err) {
    showToast("❌ Network error", "error");
  }
}

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

// Global variables
let allComplaints = [];
let filteredComplaints = [];
let currentFilterStatus = null;

// Load complaints from API
async function loadComplaints() {
  try {
    const response = await fetch('/api/complaints', { credentials: 'include' });
    if (response.status === 401) {
      alert("Session expired. Please login again.");
      location.href = "/";
      return;
    }
    if (!response.ok) throw new Error('Failed to load complaints');
    allComplaints = await response.json();
    filteredComplaints = [...allComplaints];
    updateStats();
    renderComplaints();
  } catch (error) {
    console.error('Error loading complaints:', error);
    showToast('Failed to load complaints', 'error');
  }
}

// Update stats cards
function updateStats() {
  const pending = allComplaints.filter(c => c.status === 'PENDING').length;
  const approved = allComplaints.filter(c => c.status === 'APPROVED').length;
  const rejected = allComplaints.filter(c => c.status === 'REJECTED').length;

  document.getElementById('statPending').textContent = pending;
  document.getElementById('statApproved').textContent = approved;
  document.getElementById('statRejected').textContent = rejected;
}

// Filter by status
function filterByStatus(status) {
  if (currentFilterStatus === status) {
    currentFilterStatus = null;
  } else {
    currentFilterStatus = status;
  }
  applyFilters();
}

// Apply search and filters
function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  let filtered = allComplaints;

  // Filter by status if set
  if (currentFilterStatus) {
    filtered = filtered.filter(c => c.status === currentFilterStatus);
  }

  // Filter by search query
  if (searchTerm) {
    filtered = filtered.filter(complaint =>
      complaint.subject.toLowerCase().includes(searchTerm) ||
      complaint.description.toLowerCase().includes(searchTerm) ||
      complaint.user.toLowerCase().includes(searchTerm) ||
      complaint.email.toLowerCase().includes(searchTerm)
    );
  }

  filteredComplaints = filtered;
  renderComplaints();
}

// Render complaints list
function renderComplaints() {
  const container = document.getElementById('complaintsList');
  if (filteredComplaints.length === 0) {
    container.innerHTML = '<div class="no-data">No complaints found</div>';
    return;
  }

  container.innerHTML = filteredComplaints.map(complaint => `
    <div class="admin-item" data-id="${complaint._id}">
      <div class="admin-item-header">
        <div class="admin-item-title">
          <strong>${complaint.subject}</strong>
          <span class="status-badge status-${complaint.status.toLowerCase()}">${complaint.status}</span>
        </div>
        <div class="admin-item-meta">
          <span><i class="fa-solid fa-user"></i> ${complaint.user}</span>
          <span><i class="fa-solid fa-envelope"></i> ${complaint.email}</span>
          <span><i class="fa-solid fa-calendar"></i> ${new Date(complaint.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="admin-item-body">
        <p>${complaint.description}</p>
      </div>
      <div class="admin-item-actions">
        ${complaint.status === 'PENDING' ? `
          <button class="approve" onclick="updateComplaintStatus('${complaint._id}', 'APPROVED')">
            ✅ Approve
          </button>
          <button class="reject" onclick="updateComplaintStatus('${complaint._id}', 'REJECTED')">
            ❌ Reject
          </button>
        ` : `
          <button class="secondary" disabled>
            ${complaint.status === "APPROVED" ? "✅ Approved" : "❌ Rejected"}
          </button>
        `}
        <button onclick="generateComplaintPDF(JSON.parse(decodeURIComponent('${encodeURIComponent(JSON.stringify(complaint))}')))">
          📄 PDF
        </button>
        <button onclick="emailComplaintPdf('${complaint._id}')">
          📧 Email
        </button>
        <button class="danger" onclick="deleteComplaint('${complaint._id}')">
          🗑 Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Update complaint status
async function updateComplaintStatus(id, status) {
  try {
    const response = await fetch(`/api/complaints/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    if (response.status === 401) {
      alert("Session expired. Please login again.");
      location.href = "/";
      return;
    }
    if (!response.ok) throw new Error('Failed to update status');
    await loadComplaints();
    showToast(`Complaint ${status.toLowerCase()} successfully`, 'success');
  } catch (error) {
    console.error('Error updating status:', error);
    showToast('Failed to update complaint status', 'error');
  }
}

// Delete complaint
async function deleteComplaint(id) {
  if (!confirm('⚠️ Permanently delete this complaint?\n\nThis action cannot be undone.')) return;
  try {
    const response = await fetch(`/api/complaints/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (response.status === 401) {
      alert("Session expired. Please login again.");
      location.href = "/";
      return;
    }
    if (!response.ok) throw new Error('Failed to delete complaint');
    await loadComplaints();
    showToast('🗑️ Complaint deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting complaint:', error);
    showToast('❌ Failed to delete complaint', 'error');
  }
}

// Generate PDF for complaint
async function generateComplaintPDF(complaint) {
  if (!complaint) return;

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
    doc.text("COMPLAINT CONFIRMATION", 105, 35, { align: "center" });

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

    row("Complaint ID", complaint._id);
    row("Status", (complaint.status || "PENDING").toUpperCase());
    row("Subject", complaint.subject);
    row("Description", complaint.description);
    row("Submitted By", complaint.user || complaint.email);
    row("Email", complaint.email);
    row("Submitted Date", new Date(complaint.createdAt).toLocaleDateString());

    // Add Status Text (Large)
    y += 10;
    doc.setFontSize(24);
    const status = (complaint.status || "PENDING").toUpperCase();
    if (status === "APPROVED") {
      doc.setTextColor(34, 197, 94); // Green
      doc.text("RESOLVED", 105, y, { align: "center" });
    } else if (status === "REJECTED") {
      doc.setTextColor(239, 68, 68); // Red
      doc.text("REJECTED", 105, y, { align: "center" });
    } else {
      doc.setTextColor(234, 179, 8); // Yellow
      doc.text("PENDING REVIEW", 105, y, { align: "center" });
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

    // Download PDF
    doc.save(`SFO_Complaint_${complaint._id}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    showToast("❌ Error generating PDF", "error");
  }
}

// Email PDF for complaint
async function emailComplaintPdf(id) {
  const complaint = allComplaints.find(c => c._id === id);
  if (!complaint) {
    showToast("❌ Complaint not found", "error");
    return;
  }

  if (!complaint.email) {
    alert("No email address found for this complaint");
    return;
  }

  if (!confirm(`Send complaint confirmation email to ${complaint.email}?`)) {
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
    doc.text("COMPLAINT CONFIRMATION", 105, 35, { align: "center" });

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

    row("Complaint ID", complaint._id);
    row("Status", (complaint.status || "PENDING").toUpperCase());
    row("Subject", complaint.subject);
    row("Description", complaint.description);
    row("Submitted By", complaint.user || complaint.email);
    row("Email", complaint.email);
    row("Submitted Date", new Date(complaint.createdAt).toLocaleDateString());

    // Add Status Text (Large)
    y += 10;
    doc.setFontSize(24);
    const status = (complaint.status || "PENDING").toUpperCase();
    if (status === "APPROVED") {
      doc.setTextColor(34, 197, 94); // Green
      doc.text("RESOLVED", 105, y, { align: "center" });
    } else if (status === "REJECTED") {
      doc.setTextColor(239, 68, 68); // Red
      doc.text("REJECTED", 105, y, { align: "center" });
    } else {
      doc.setTextColor(234, 179, 8); // Yellow
      doc.text("PENDING REVIEW", 105, y, { align: "center" });
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
    const response = await fetch(`/api/email/send-complaint/${complaint._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ pdfBuffer: pdfBase64 })
    });

    const result = await response.json();

    if (result.success) {
      showToast(`✅ Email sent successfully to ${complaint.email}`, "success");
    } else {
      showToast(`❌ Failed to send email: ${result.error || 'Unknown error'}`, "error");
    }
  } catch (error) {
    console.error("Email error:", error);
    showToast(`❌ Error sending email: ${error.message}`, "error");
  }
}

// Helper function to get base64 image
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  const allowed = await ensureAdminSession();
  if (!allowed) return;
  loadComplaints();
});

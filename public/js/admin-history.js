/* =====================================================
   ADMIN HISTORY — COMPLETED & REJECTED
===================================================== */

document.addEventListener("DOMContentLoaded", function() {
  loadHistory();
});

async function loadHistory() {
  const container = document.getElementById("historyList");
  if (!container) return;

  container.innerHTML = `<div class="slot loading">Loading history…</div>`;

  try {
    const res = await fetch("/api/bookings/archived", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch history");
    
    let bookings = await res.json();

    if (!bookings.length) {
      container.innerHTML = `<div class="slot rejected">No historical records found</div>`;
      return;
    }

    container.innerHTML = bookings.map(renderHistoryCard).join("");
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="slot rejected">Error loading history</div>`;
  }
}

function renderHistoryCard(b) {
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
        <button onclick="generatePDF(JSON.parse(decodeURIComponent('${safeBooking}')))">
          📄 View PDF
        </button>
        <button class="danger" onclick="deleteBooking('${b._id}')">
          🗑 Delete Record
        </button>
      </div>
    </div>
  `;
}

async function deleteBooking(id) {
  if (!confirm("⚠️ Permanently delete this history record?")) return;

  try {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (res.ok) {
      showToast("🗑️ Record deleted successfully", "success");
      loadHistory();
    } else {
      showToast("❌ Delete failed", "error");
    }
  } catch (err) {
    showToast("❌ Network error", "error");
  }
}

// Re-implementing generatePDF and showToast locally or ensuring they are available
// Since js/pdf.js is loaded in the HTML, we might just need to ensure showToast is available from app.js

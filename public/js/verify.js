const params = new URLSearchParams(location.search);
const trackId = params.get("track");

const box = document.getElementById("verifyResult");

if (!trackId) {
  box.innerHTML = "<p class='error'>Invalid QR Code</p>";
  throw new Error("No Track ID");
}

/* 1️⃣ TRY SERVER FIRST */
fetch(`/api/bookings/verify/${trackId}`)
  .then(r => r.ok ? r.json() : null)
  .then(data => {
    if (data) return render(data);

    /* 2️⃣ FALLBACK TO LOCAL STORAGE */
    const local = JSON.parse(localStorage.getItem("bookings") || "[]");
    const b = local.find(x => x.trackId === trackId);
    if (!b) {
      box.innerHTML = "<p class='error'>Booking not found</p>";
      return;
    }
    render(b);
  });

function render(b) {
  box.innerHTML = `
    <div class="confirm-row"><b>Track ID:</b> ${b.trackId}</div>
    <div class="confirm-row"><b>Room:</b> ${b.room}</div>
    <div class="confirm-row"><b>Date:</b> ${b.date}</div>
    <div class="confirm-row"><b>Time:</b> ${b.start} - ${b.end}</div>
    <div class="confirm-row"><b>Status:</b>
      <span class="status ${b.status.toLowerCase()}">${b.status}</span>
    </div>
    <div class="confirm-row"><b>Approved By:</b> ${b.approvedBy || "—"}</div>
    <div class="confirm-row"><b>Timestamp:</b> ${b.approvedAt || "—"}</div>
  `;
}

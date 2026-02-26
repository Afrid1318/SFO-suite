/* ===============================
   SAFE DOM HELPER
================================ */
const $ = id => document.getElementById(id);

/* ===============================
   AUTH & GLOBAL STATE
================================ */
let user = null;
try {
  user = JSON.parse(localStorage.getItem("sfo_user") || "null");
} catch {}

const publicPages = ["/index.html", "/"];
const isPublic = publicPages.some(p => location.pathname.endsWith(p));

const adminPages = [
  "/admin.html",
  "/admin-users.html",
  "/admin-history.html",
  "/admin-analytics.html",
  "/admin-complaints.html"
];

async function syncSessionUser() {
  try {
    const res = await fetch("/auth/me", { credentials: "include" });
    if (!res.ok) {
      user = null;
      localStorage.removeItem("sfo_user");
      return null;
    }

    const sessionUser = await res.json();
    user = sessionUser;
    localStorage.setItem("sfo_user", JSON.stringify(sessionUser));
    return sessionUser;
  } catch (err) {
    console.error("Session check failed:", err);
    return user;
  }
}

async function enforcePageAccess() {
  const sessionUser = await syncSessionUser();

  if (!sessionUser && !isPublic) {
    location.href = "/";
    return false;
  }

  if (sessionUser && String(sessionUser.role || "").toLowerCase() !== "admin") {
    document.querySelectorAll(".admin-only").forEach(el => {
      el.style.display = "none";
    });

    const isAdminPage = adminPages.some(p => location.pathname.endsWith(p));
    if (isAdminPage) {
      location.href = "/home.html";
      return false;
    }
  }

  return true;
}

let selectedRoom = null;
let selectedCapacity = 0;

/* ===============================
   STORAGE
================================ */
function getBookings() {
  try {
    return JSON.parse(localStorage.getItem("bookings") || "[]");
  } catch {
    return [];
  }
}

function saveBookings(list) {
  localStorage.setItem("bookings", JSON.stringify(list));
}

/* ===============================
   TIME HELPERS
================================ */
function to24(hr, min, ap) {
  if (!hr || !min || !ap) return "";
  hr = parseInt(hr, 10);
  if (ap === "PM" && hr !== 12) hr += 12;
  if (ap === "AM" && hr === 12) hr = 0;
  return `${String(hr).padStart(2, "0")}:${min}`;
}

function syncTimeFields() {
  const sH = $("startHour"), sM = $("startMin"), sA = $("startAMPM");
  const eH = $("endHour"), eM = $("endMin"), eA = $("endAMPM");
  
  if (sH && sM && sA && $("start")) {
    $("start").value = to24(sH.value, sM.value, sA.value);
  }
  if (eH && eM && eA && $("end")) {
    $("end").value = to24(eH.value, eM.value, eA.value);
  }
}

/* ===============================
   ROOMS
================================ */
async function loadRooms() {
  const divSelect = $("divisionSelect");
  const dateInput = $("date");
  const grid = $("roomGrid");

  if (!divSelect || !dateInput || !grid) return;

  const division = divSelect.value;
  const date = dateInput.value;

  if (!division) {
    grid.innerHTML = '<div class="sub-text">Select a division to view available rooms</div>';
    return;
  }

  if (!date) {
    grid.innerHTML = '<div class="sub-text">Select a date to check availability</div>';
    return;
  }

  if (typeof ROOMS === 'undefined') {
    grid.innerHTML = '<div class="error">Data not loaded. Please refresh the page.</div>';
    return;
  }

  const rooms = ROOMS[division] || [];

  grid.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i> Checking availability...</div>';

  try {
    const res = await fetch("/api/bookings", { credentials: "include" });
    if (res.status === 401) {
      showToast("Session expired. Please login again.", "error");
      setTimeout(() => location.href = "/", 2000);
      return;
    }
    const allBookings = res.ok ? await res.json() : [];

    if (rooms.length === 0) {
      grid.innerHTML = '<div class="sub-text">No rooms available for this division.</div>';
      return;
    }

    grid.innerHTML = rooms.map(r => {
      const isBooked = allBookings.some(b =>
        b.room === r.name &&
        b.date === date &&
        ["PENDING", "APPROVED"].includes(b.status)
      );

      return `
        <div class="room-seat ${isBooked ? "disabled" : ""}"
             onclick="${isBooked ? "" : `selectRoom('${r.name}', ${r.cap}, this)`}"
             title="${isBooked ? 'Room is booked' : `Capacity: ${r.cap}`}">
          <b>${r.name}</b><br>
          Cap: ${r.cap}
          <span class="room-badge ${isBooked ? "badge-booked" : "badge-free"}">
            ${isBooked ? "Booked" : "Available"}
          </span>
        </div>`;
    }).join("");
  } catch (err) {
    console.error("Failed to load rooms:", err);
    grid.innerHTML = '<div class="error">Failed to load room availability. Please try again.</div>';
  }
}

function selectRoom(name, cap, el) {
  selectedRoom = name;
  selectedCapacity = cap;
  
  const attendeesInput = $("attendees");
  if (attendeesInput) {
    attendeesInput.max = cap;
    attendeesInput.placeholder = `Max ${cap}`;
  }

  document.querySelectorAll(".room-seat").forEach(r => r.classList.remove("active"));
  el.classList.add("active");
}

/* ===============================
   BOOKING LOGIC
================================ */
async function bookSlot(e) {
  if (e) e.preventDefault();
  console.log("bookSlot triggered");
  
  if (!selectedRoom) {
    console.log("No room selected");
    showToast("Please select a room", "error");
    return;
  }

  syncTimeFields();

  const date = $("date").value;
  const startTime = $("start").value;
  const endTime = $("end").value;
  console.log("Booking details:", { date, startTime, endTime, selectedRoom });

  if (!date || !startTime || !endTime) {
    showToast("Please fill all time fields", "error");
    return;
  }

  if (startTime >= endTime) {
    showToast("End time must be after start time", "error");
    return;
  }

  const booking = {
    trackId: "SFO" + Date.now(),
    user: user ? user.username : "Guest",
    email: user ? user.email : "",
    division: $("divisionSelect").value,
    meetingType: $("meetingType").value,
    room: selectedRoom,
    team: $("teamName").value || "-",
    date: date,
    start: startTime,
    end: endTime,
    attendees: parseInt($("attendees")?.value) || 0,
    visitors: parseInt($("visitors")?.value) || 0,
    status: "PENDING"
  };

  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(booking)
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("latest_booking", JSON.stringify(data));
      showToast("Booking submitted successfully!");
      setTimeout(() => location.href = "confirmation.html", 1000);
    } else {
      showToast(data.error || "Booking failed", "error");
    }
  } catch (err) {
    console.error("Booking error:", err);
    showToast("Network error. Please try again.", "error");
  }
}

/* ===============================
   UI HELPERS
=============================== */
function showToast(msg, type = "success") {
  const container = $("toastContainer") || document.body;
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  
  const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
  t.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
  
  container.appendChild(t);
  
  // Trigger entry animation
  setTimeout(() => t.style.transform = "translateX(0)", 100);
  
  setTimeout(() => {
    t.style.transform = "translateX(120%)";
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 500);
  }, 4000);
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

function toggleSidebar() {
  document.querySelector(".sidebar")?.classList.toggle("sidebar-open");
}

function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

/* ===============================
   DASHBOARD / TRACKING (STUBS)
================================ */
async function refreshDashboard() {
  const dashboardList = $("dashboardList");
  const statRooms = $("statRooms");
  const statBooked = $("statBooked");
  const statFree = $("statFree");

  if (!dashboardList) return;

  try {
    const res = await fetch("/api/bookings", { credentials: "include" });
    if (res.status === 401) {
      alert("Session expired. Please login again.");
      location.href = "/";
      return;
    }
    const bookings = res.ok ? await res.json() : [];
    
    // Calculate Stats
    if (statRooms || statBooked || statFree) {
      let totalRooms = 0;
      if (typeof ROOMS !== 'undefined') {
        Object.values(ROOMS).forEach(list => totalRooms += list.length);
      }
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

      const activeNow = bookings.filter(b => 
        b.date === today && 
        b.status === "APPROVED" && 
        b.start <= currentTime && 
        b.end >= currentTime
      ).length;

      if (statRooms) statRooms.innerText = totalRooms;
      if (statBooked) statBooked.innerText = activeNow;
      if (statFree) statFree.innerText = Math.max(0, totalRooms - activeNow);
    }

    if (!bookings.length) {
      dashboardList.innerHTML = '<div class="slot rejected">No bookings found</div>';
      return;
    }

    const filter = $("dashFilter")?.value || "ALL";
    const filtered = filter === "ALL" ? bookings : bookings.filter(b => b.division === filter);

    if (!filtered.length) {
      dashboardList.innerHTML = '<div class="slot rejected">No bookings for this division</div>';
      return;
    }

    dashboardList.innerHTML = filtered.map(b => {
      const status = (b.status || "PENDING").toLowerCase();
      return `
        <div class="slot">
          <div class="slot-header">
            <b>${b.room}</b>
            <span class="status ${status}">${status.toUpperCase()}</span>
          </div>
          <div class="slot-meta">
            📅 ${b.date} &nbsp; ⏰ ${b.start} – ${b.end}<br>
            👥 ${b.division} &nbsp; 🏢 ${b.team || "-"}
          </div>
        </div>`;
    }).join("");
  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

async function trackBooking() {
  const trackId = $("trackId")?.value.trim();
  const resultDiv = $("trackResult");
  if (!trackId) return alert("Enter Tracking ID");

  resultDiv.innerHTML = "Searching...";

  try {
    const res = await fetch(`/api/bookings/track/${trackId}`, { credentials: "include" });
    const b = await res.json();

    if (!res.ok) {
      resultDiv.innerHTML = `<div class="slot rejected">❌ No booking found</div>`;
      return;
    }

    const status = (b.status || "PENDING").toLowerCase();
    resultDiv.innerHTML = `
      <div class="slot">
        <div class="slot-header">
          <b>${b.room}</b>
          <span class="status ${status}">${status.toUpperCase()}</span>
        </div>
        <div class="slot-meta">
          📅 ${b.date} &nbsp; ⏰ ${b.start} – ${b.end}<br>
          👥 ${b.division} &nbsp; 🏢 ${b.team || "-"}
        </div>
      </div>`;
  } catch (err) {
    resultDiv.innerHTML = "Error searching booking";
  }
}

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", async () => {
  // Theme
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
  }

  const allowed = await enforcePageAccess();
  if (!allowed) {
    return;
  }

  // Populate Dropdowns
  const divSelect = $("divisionSelect");
  const dashFilter = $("dashFilter");

  if (typeof DIVISIONS !== 'undefined') {
    if (divSelect) {
      divSelect.innerHTML = '<option value="">Select Division</option>' +
        DIVISIONS.map(d => `<option value="${d}">${d}</option>`).join("");
      divSelect.onchange = loadRooms;
    }
    if (dashFilter) {
      dashFilter.innerHTML = '<option value="ALL">All Divisions</option>' +
        DIVISIONS.map(d => `<option value="${d}">${d}</option>`).join("");
    }
  }

  const meetType = $("meetingType");
  if (meetType && typeof MEETING_TYPES !== 'undefined') {
    meetType.innerHTML = '<option value="">Select Meeting Type</option>' +
      MEETING_TYPES.map(t => `<option value="${t}">${t}</option>`).join("");
  }

  // Set minimum date to today
  const dateInput = $("date");
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today; // Set default to today
    dateInput.onchange = loadRooms;
  }

  // Event Listeners
  $("bookBtn")?.addEventListener("click", bookSlot);
  
  if ($("dashboardList")) {
    refreshDashboard();
    $("dashFilter")?.addEventListener("change", refreshDashboard);
  }

  // Sync time fields on change
  ["startHour", "startMin", "startAMPM", "endHour", "endMin", "endAMPM"].forEach(id => {
    $(id)?.addEventListener("change", syncTimeFields);
  });

  // Initial sync
  syncTimeFields();
});

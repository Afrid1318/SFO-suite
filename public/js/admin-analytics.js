async function loadAnalytics() {
  try {
    const res = await fetch("/admin/analytics", {
      credentials: "include"
    });

    if (!res.ok) throw new Error("Unauthorized");

    const data = await res.json();

    document.getElementById("totalCount").innerText =
      data.totalBookings;

    renderMap("roomStats", data.roomUsage, "Room");
    renderMap("hourStats", data.hourUsage, "Hour");
    renderMap("dateStats", data.dateUsage, "Date");

  } catch (err) {
    alert("Failed to load analytics");
  }
}

function renderMap(id, obj, label) {
  const el = document.getElementById(id);
  el.innerHTML = Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) =>
      `<div>${label}: <b>${k}</b> — ${v}</div>`
    )
    .join("") || "<i>No data</i>";
}

document.addEventListener("DOMContentLoaded", loadAnalytics);

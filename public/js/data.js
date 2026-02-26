/* ===============================
   APPLICATION DATA
================================ */

// cspell:ignore ICAM NATDC

// Divisions available in the organization
window.DIVISIONS = [
  "Electronic division",
  "Mechanical division",
  "ICAM",
  "NATDC",
  "Plastic division",
  "Tooling division"
];

// Meeting types
window.MEETING_TYPES = [
  "Conference",
  "Training",
  "Interview",
  "Presentation",
  "Workshop",
  "Team Meeting"
];

// Rooms organized by division
window.ROOMS = {
  "Electronic division": [
    { name: "Electronic-Conf-A", cap: 15 },
    { name: "Electronic-Lab-1", cap: 10 },
    { name: "Electronic-Meeting-Room", cap: 6 }
  ],
  "Mechanical division": [
    { name: "Mech-Board-Room", cap: 20 },
    { name: "Mech-Design-Room", cap: 12 },
    { name: "Mech-Workshop-Conf", cap: 8 }
  ],
  "ICAM": [
    { name: "ICAM-Main-Conf", cap: 25 },
    { name: "ICAM-Training-Room", cap: 15 },
    { name: "ICAM-Review-Room", cap: 10 }
  ],
  "NATDC": [
    { name: "NATDC-Conference-Room", cap: 30 },
    { name: "NATDC-Meeting-Room-1", cap: 8 },
    { name: "NATDC-Seminar-Hall", cap: 50 }
  ],
  "Plastic division": [
    { name: "Plastic-Conf-Room", cap: 12 },
    { name: "Plastic-Meeting-Room", cap: 6 },
    { name: "Plastic-Molding-Conf", cap: 10 }
  ],
  "Tooling division": [
    { name: "Tooling-Main-Conf", cap: 20 },
    { name: "Tooling-Meeting-1", cap: 8 },
    { name: "Tooling-Design-Studio", cap: 15 }
  ]
};

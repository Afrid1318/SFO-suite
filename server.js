require("dotenv").config();
require("./config/db");

const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

/* MIDDLEWARE */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

/* STATIC FILES */
app.use(express.static(path.join(__dirname, "public")));

/* ROUTES */
app.use("/auth", require("./routes/auth"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/admin", require("./routes/admin"));
app.use("/api/email", require("./routes/email"));

/* PAGES */
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public/index.html"))
);

/* START */
const PORT = process.env.PORT || 3002;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);

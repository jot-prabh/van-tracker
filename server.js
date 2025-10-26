// server.js
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve driver.html, dashboard.html, style.css, etc.

// Allowed vans (example)
const allowedVans = ["VAN001", "VAN002", "VAN003"];

// New API to return allowed vans
app.get("/api/allowedVans", (req, res) => {
  res.json(allowedVans);
}); 

// Store latest van locations
const vanLocations = {}; // vanID -> {lat, lon, updated}

// API to receive driver location
app.post("/api/locations", (req, res) => {
  const { vanID, lat, lon } = req.body;

  if (!allowedVans.includes(vanID)) {
    return res.status(403).json({ error: "Van ID not allowed" });
  }

  vanLocations[vanID] = { lat, lon, updated: new Date() };
  res.json({ success: true });
});

// API to get all van locations (for students)
app.get("/api/locations", (req, res) => {
  res.json(vanLocations);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

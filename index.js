const express = require("express");
const bodyParser = require("body-parser");
const { events, addEvent } = require("./event");
const { hasConflict, suggestTimes } = require("./utils");

const app = express();
app.use(bodyParser.json());

// If someone has a meeting from 10:00–11:00, another meeting can’t start at 11:00 immediately
//  because we add a 15 min buffer, so the next meeting must start at 11:15.
const BUFFER_MINUTES = 15;
const WORK_HOURS = { start: 9, end: 17 }; // 9 AM - 5 PM

// POST /check-conflicts

app.post("/check-conflicts", (req, res) => {
  const { startTime, endTime, participants } = req.body;

  // check for missing fields
  if (!startTime || !endTime || !participants) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  // Check for conflicts, goes to utils.js
  const conflicts = hasConflict(events, { startTime, endTime, participants }, BUFFER_MINUTES);

 // If conflicts exist, return them
  if (conflicts.length > 0) {
    return res.json({ conflict: true, conflicts });
  }
  
  // If no conflicts, add to calendar
  addEvent({ startTime, endTime, participants });
  return res.json({ conflict: false, message: "Event scheduled successfully" });
});

// POST /suggest-times
app.post("/suggest-times", (req, res) => {
  const { startTime, endTime, participants } = req.body;

  // check for missing fields in request body
  if (!startTime || !endTime || !participants) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Suggest alternative times, goes to utils.js
  const suggestions = suggestTimes(events, { startTime, endTime, participants }, BUFFER_MINUTES, WORK_HOURS);

  // Return suggestions
  return res.json({ suggestions });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

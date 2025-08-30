const express = require("express");
const bodyParser = require("body-parser");
const { events, addEvent } = require("./event");
const { hasConflict, suggestTimes } = require("./utils");

const app = express();
app.use(bodyParser.json());

// Default config
const BUFFER_MINUTES = 15;
const WORK_HOURS = { start: 9, end: 17 }; // 9 AM - 5 PM

/**
 * POST /check-conflicts
 * Checks if a proposed event conflicts with existing ones
 */
app.post("/check-conflicts", (req, res) => {
  const { startTime, endTime, participants } = req.body;

  if (!startTime || !endTime || !participants) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const conflicts = hasConflict(events, { startTime, endTime, participants }, BUFFER_MINUTES);

  if (conflicts.length > 0) {
    return res.json({ conflict: true, conflicts });
  }
  
  // If no conflicts, add to calendar
  addEvent({ startTime, endTime, participants });
  return res.json({ conflict: false, message: "Event scheduled successfully" });
});

/**
 * POST /suggest-times
 * Suggests 3 alternative slots if conflict exists
 */
app.post("/suggest-times", (req, res) => {
  const { startTime, endTime, participants } = req.body;

  if (!startTime || !endTime || !participants) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const suggestions = suggestTimes(events, { startTime, endTime, participants }, BUFFER_MINUTES, WORK_HOURS);

  return res.json({ suggestions });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

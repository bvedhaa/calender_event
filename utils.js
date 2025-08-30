const { DateTime } = require("luxon");

//  Check for conflicts
function hasConflict(existingEvents, newEvent, bufferMinutes) {
  
  // Parse new event times
  const newStart = DateTime.fromISO(newEvent.startTime);
  const newEnd = DateTime.fromISO(newEvent.endTime);

  // Check each existing event for conflicts
  return existingEvents.filter(event => {
    const eventStart = DateTime.fromISO(event.startTime);
    const eventEnd = DateTime.fromISO(event.endTime);

    // Check if participants overlap
    const commonParticipants = event.participants.filter(p => newEvent.participants.includes(p));
    if (commonParticipants.length === 0) return false;

    // Apply buffer
    const adjustedStart = eventStart.minus({ minutes: bufferMinutes });
    const adjustedEnd = eventEnd.plus({ minutes: bufferMinutes });

    // Check time overlap
    const overlap = newStart < adjustedEnd && newEnd > adjustedStart;
    return overlap;
  });
}

// Suggest alternative times
function suggestTimes(existingEvents, newEvent, bufferMinutes, workHours) {
  const suggestions = [];

  // Start searching 15 min after the proposed event's end time
  let candidateStart = DateTime.fromISO(newEvent.endTime).plus({ minutes: bufferMinutes });
  const duration = DateTime.fromISO(newEvent.endTime).diff(DateTime.fromISO(newEvent.startTime), "minutes").minutes;

  // Try to find 3 suggestions
  while (suggestions.length < 3) {
    const candidateEnd = candidateStart.plus({ minutes: duration });

    // Respect working hours
    if (candidateStart.hour >= workHours.start && candidateEnd.hour <= workHours.end) {
      const conflict = hasConflict(existingEvents, { ...newEvent, startTime: candidateStart.toISO(), endTime: candidateEnd.toISO() }, bufferMinutes);
      if (conflict.length === 0) {
        suggestions.push({
          startTime: candidateStart.toISO(),
          endTime: candidateEnd.toISO()
        });
      }
    }

    // Move 15 min ahead and try again
    candidateStart = candidateStart.plus({ minutes: 15 });

    // Stop after the day ends
    if (candidateStart.hour >= workHours.end) break;
  }

  return suggestions;
}

module.exports = {
  hasConflict,
  suggestTimes
};

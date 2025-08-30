// In-memory storage (could be replaced with DB later)
let events = [];

/**
 * Adds an event to the calendar
 */
function addEvent(event) {
  events.push(event);
}

module.exports = {
  events,
  addEvent
};

// For now I'm using an in-memory array to store events. 
// In a real-world scenario, this would be replaced with a database.
let events = [];



function addEvent(event) {
  //Adding an event to the calendar
  events.push(event);
}

module.exports = {
  events,
  addEvent
};

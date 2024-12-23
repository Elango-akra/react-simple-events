// Import required dependencies
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css'; // Add custom styles if needed

const App = () => {
  const [formData, setFormData] = useState({
    churchName: "",
    name: "",
    no: "",
    token: "",
    author: "",
    mobileNo: "",
  });
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem("events");
    return savedEvents ? JSON.parse(savedEvents) : [];
  });
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEvents([...events, { ...formData, id: Date.now(), completed: false }]);
    setFormData({ churchName: "", name: "", no: "", token: "", author: "", mobileNo: "" });
  };

  const handleDelete = (id) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const handleEdit = (id) => {
    const eventToEdit = events.find((event) => event.id === id);
    setFormData(eventToEdit);
    setEvents(events.filter((event) => event.id !== id));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDrop = (index) => {
    const reorderedEvents = [...events];
    const [removed] = reorderedEvents.splice(draggedIndex, 1);
    reorderedEvents.splice(index, 0, removed);
    setEvents(reorderedEvents);
    setDraggedIndex(null);
  };

  const toggleCompletion = (id) => {
    setEvents(
      events.map((event) =>
        event.id === id ? { ...event, completed: !event.completed } : event
      )
    );
  };

  const EventViewer = () => {
    const pendingEvents = events.filter((event) => !event.completed);
  
    // Ensure currentEventIndex is valid and within bounds
    const validIndex = Math.min(currentEventIndex, pendingEvents.length - 1);
    const currentEvent = pendingEvents[validIndex] || null;
    const previousEvent = validIndex > 0 ? pendingEvents[validIndex - 1] : null;
    const nextEvent = validIndex < pendingEvents.length - 1 ? pendingEvents[validIndex + 1] : null;
  
    useEffect(() => {
      const interval = setInterval(() => {
        const savedEvents = localStorage.getItem("events");
        if (savedEvents) {
          setEvents(JSON.parse(savedEvents));
        }
      }, 1000);
      return () => clearInterval(interval);
    }, []);
  
    return (
      <div className="event-viewer">
        <h2>Event Viewer</h2>
        <div>
          {previousEvent && (
            <div className="previous-event">
              <h3>Previous Event</h3>
              <p>{previousEvent.name} - {previousEvent.churchName}</p>
            </div>
          )}
          {currentEvent && (
            <div className="current-event">
              <h3>Current Event</h3>
              <p>{currentEvent.name} - {currentEvent.churchName}</p>
            </div>
          )}
          {nextEvent && (
            <div className="next-event">
              <h3>Next Event</h3>
              <p>{nextEvent.name} - {nextEvent.churchName}</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  return (
    <Router>
      <div className="App">
        <h1>Christmas Stage Performance</h1>

        <nav>
          <Link to="/">Home</Link> | <Link to="/order">Event Order</Link> | <Link to="/viewer">Event Viewer</Link>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="form">
                  <input
                    type="text"
                    name="churchName"
                    placeholder="Church Name"
                    value={formData.churchName}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="no"
                    placeholder="No"
                    value={formData.no}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="token"
                    placeholder="Token"
                    value={formData.token}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="author"
                    placeholder="Author"
                    value={formData.author}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="mobileNo"
                    placeholder="Mobile No"
                    value={formData.mobileNo}
                    onChange={handleChange}
                    required
                  />
                  <button type="submit">Add Event</button>
                </form>

                {/* Events List */}
                <ul className="event-list">
                  {events.map((event, index) => (
                    <li
                      key={event.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(index)}
                      className="event-item"
                    >
                      <div>
                        <strong>{event.name}</strong> - {event.churchName}
                        <p>
                          No: {event.no}, Token: {event.token}, Author: {event.author},
                          Mobile: {event.mobileNo}
                        </p>
                        <p>Status: {event.completed ? "Completed" : "Pending"}</p>
                      </div>
                      <button onClick={() => toggleCompletion(event.id)}>
                        Mark as {event.completed ? "Pending" : "Completed"}
                      </button>
                      <button onClick={() => handleEdit(event.id)}>Edit</button>
                      <button onClick={() => handleDelete(event.id)}>Delete</button>
                    </li>
                  ))}
                </ul>
              </>
            }
          />

          <Route
            path="/order"
            element={
              <div className="preview">
                <h2>Event Order</h2>
                <h3>Completed Events</h3>
                <ol>
                  {events
                    .filter((event) => event.completed)
                    .map((event) => (
                      <li key={event.id}>
                        {event.name} - {event.churchName}
                      </li>
                    ))}
                </ol>
                <h3>Pending Events</h3>
                <ol>
                  {events
                    .filter((event) => !event.completed)
                    .map((event) => (
                      <li key={event.id}>
                        {event.name} - {event.churchName}
                      </li>
                    ))}
                </ol>
              </div>
            }
          />

          <Route path="/viewer" element={<EventViewer />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

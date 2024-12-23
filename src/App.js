import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import './App.css';

const apiUrl = `${process.env.REACT_APP_API_URL}/events`; // Backend API URL

const App = () => {
  const [formData, setFormData] = useState({
    churchName: "",
    name: "",
    no: "",
    token: "",
    author: "",
    mobileNo: "",
  });
  const [events, setEvents] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Load events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(apiUrl);
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(apiUrl, { ...formData, completed: false });
      setEvents([...events, response.data]);
      setFormData({ churchName: "", name: "", no: "", token: "", author: "", mobileNo: "" });
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/${id}`);
      setEvents(events.filter((event) => event.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleEdit = async (id) => {
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

  const toggleCompletion = async (id) => {
    const event = events.find((event) => event.id === id);
    try {
      const updatedEvent = await axios.put(`${apiUrl}/${id}`, { ...event, completed: !event.completed });
      setEvents(events.map((e) => (e.id === id ? updatedEvent.data : e)));
    } catch (error) {
      console.error("Error updating event:", error);
    }
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
        const fetchEvents = async () => {
          try {
            const response = await axios.get(apiUrl);
            setEvents(response.data);
          } catch (error) {
            console.error("Error fetching events:", error);
          }
        };
        fetchEvents();
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
              {/* <strong>Church Name</strong> - {previousEvent.churchName}<br/> */}
              <strong>Token</strong> - {previousEvent.token}<br/>
              <strong>Dance</strong> - {previousEvent.no}<br/>
              {/* <strong>Name</strong> - {previousEvent.name} */}
            </div>
          )}
          {currentEvent && (
            <div className="current-event">
              <h3>Current Event</h3>
              {/* <strong>Church Name</strong> - {currentEvent.churchName}<br/> */}
              <strong>Token</strong> - {currentEvent.token}<br/>
              <strong>Dance</strong> - {currentEvent.no}<br/>
              {/* <strong>Name</strong> - {currentEvent.name} */}
            </div>
          )}
          {nextEvent && (
            <div className="next-event">
              <h3>Next Event</h3>
              {/* <strong>Church Name</strong> - {nextEvent.churchName}<br/> */}
              <strong>Token</strong> - {nextEvent.token}<br/>
              <strong>Dance</strong> - {nextEvent.no}<br/>
              {/* <strong>Name</strong> - {nextEvent.name} */}
            </div>
          )}
        </div>
      </div>
    );
  };

  // EventOrder Component (added here)
  const EventOrder = () => {
    return (
      <div className="preview">
        <h2>Event Order</h2>
        <h3>Completed Events</h3>
        <ol>
          {events
            .filter((event) => event.completed)
            .map((event) => (
              <li key={event.id}>
                {event.token} - {event.churchName}
              </li>
            ))}
        </ol>
        <h3>Pending Events</h3>
        <ol>
          {events
            .filter((event) => !event.completed)
            .map((event) => (
              <li key={event.id}>
                {event.token} - {event.churchName}
              </li>
            ))}
        </ol>
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
                    placeholder="Dance"
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
                      className={event.completed ? "completed" : ""}
                    >
                       <div>
                        <strong>Church Name</strong> - {event.churchName}
                        <p>
                          Dance: {event.no}, Token: {event.token}, Author: {event.author},
                          Mobile: {event.mobileNo} Name: {event.name}
                        </p>
                        <p>Status: {event.completed ? "Completed" : "Pending"}</p>
                      </div>
                      <button onClick={() => toggleCompletion(event.id)}>
                        {event.completed ? "Undo" : "Complete"}
                      </button>
                      <button onClick={() => handleEdit(event.id)}>Edit</button>
                      <button onClick={() => handleDelete(event.id)}>Delete</button>
                    </li>
                  ))}
                </ul>
              </>
            }
          />
          <Route path="/order" element={<EventOrder />} />
          <Route path="/viewer" element={<EventViewer />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

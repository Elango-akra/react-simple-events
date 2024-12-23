const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const port = 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize SQLite database (this will create a file called events.db)
const db = new sqlite3.Database(path.resolve(__dirname, "events.db"), (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    // Create the table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        churchName TEXT,
        name TEXT,
        no TEXT,
        token TEXT,
        author TEXT,
        mobileNo TEXT,
        completed BOOLEAN DEFAULT 0
      )
    `);
  }
});

// CRUD Routes

// Create Event
app.post("/events", (req, res) => {
  const { churchName, name, no, token, author, mobileNo } = req.body;
  const stmt = db.prepare(
    `INSERT INTO events (churchName, name, no, token, author, mobileNo) VALUES (?, ?, ?, ?, ?, ?)`
  );
  stmt.run([churchName, name, no, token, author, mobileNo], function (err) {
    if (err) {
      return res.status(400).json({ message: "Error adding event", error: err });
    }
    res.status(201).json({ id: this.lastID, ...req.body });
  });
  stmt.finalize();
});

// Get all events
app.get("/events", (req, res) => {
  db.all("SELECT * FROM events", (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching events", error: err });
    }
    res.json(rows);
  });
});

// Update Event
app.put("/events/:id", (req, res) => {
  const { id } = req.params;
  const { churchName, name, no, token, author, mobileNo, completed } = req.body;
  const stmt = db.prepare(
    `UPDATE events SET churchName = ?, name = ?, no = ?, token = ?, author = ?, mobileNo = ?, completed = ? WHERE id = ?`
  );
  stmt.run([churchName, name, no, token, author, mobileNo, completed, id], function (err) {
    if (err) {
      return res.status(400).json({ message: "Error updating event", error: err });
    }
    res.json({ id, churchName, name, no, token, author, mobileNo, completed });
  });
  stmt.finalize();
});

// Delete Event
app.delete("/events/:id", (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare(`DELETE FROM events WHERE id = ?`);
  stmt.run(id, function (err) {
    if (err) {
      return res.status(400).json({ message: "Error deleting event", error: err });
    }
    res.status(200).json({ message: "Event deleted", id });
  });
  stmt.finalize();
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

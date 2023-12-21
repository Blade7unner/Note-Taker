const express = require('express');
const path = require('path');
const fs = require('fs').promises; // Use the promise-based functions of 'fs'
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// HTML Routes
// Route to serve the notes.html page
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

// Route to serve the index.html page (catch-all route)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// API Routes
// Route to get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to create a new note
app.post('/api/notes', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8');
    const notes = JSON.parse(data);
    const newNote = { ...req.body, id: uuidv4() }; // Spread the request body and add a unique ID
    notes.push(newNote);

    await fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes));
    res.json(newNote); // Send back the new note with its unique ID
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to delete a note by id
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id; // Get the ID from the request parameters
    const data = await fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8');
    let notes = JSON.parse(data);
    notes = notes.filter((note) => note.id !== noteId); // Remove the note with the given ID

    await fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes));
    res.status(204).end(); // Respond with a 204 No Content status
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

  
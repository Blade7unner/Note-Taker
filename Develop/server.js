const express = require('express');
const path = require('path');
const fs = require('fs').promises; // Use the promise-based functions
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// HTML Routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// API Routes
app.get('/api/notes', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8');
    const notes = JSON.parse(data);
    const newNote = { ...req.body, id: uuidv4() };
    notes.push(newNote);

    await fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes));
    res.json(newNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const data = await fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8');
    let notes = JSON.parse(data);
    notes = notes.filter((note) => note.id !== noteId);

    await fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes));
    res.status(204).end(); // No content to send back
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

  
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const DATA_PATH = path.join(__dirname, 'src', 'interview-records.json');
const JOBS_DATA_PATH = path.join(__dirname, 'src', 'job-records.json');

app.use(cors());
app.use(express.json());

// --- INTERVIEWS API ---
app.get('/api/interviews', (req, res) => {
  fs.readFile(DATA_PATH, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read error' });
    res.json(JSON.parse(data));
  });
});

app.post('/api/interviews', (req, res) => {
  const newRecord = req.body;
  fs.readFile(DATA_PATH, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read error' });
    const records = JSON.parse(data);
    newRecord.id = Date.now();
    newRecord.date = newRecord.date || new Date().toISOString().slice(0, 10);
    records.push(newRecord);
    fs.writeFile(DATA_PATH, JSON.stringify(records, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Write error' });
      res.json(newRecord);
    });
  });
});

app.delete('/api/interviews/:id', (req, res) => {
  const id = Number(req.params.id);
  fs.readFile(DATA_PATH, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read error' });
    let records = JSON.parse(data);
    const newRecords = records.filter(r => r.id !== id);
    fs.writeFile(DATA_PATH, JSON.stringify(newRecords, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Write error' });
      res.json({ success: true });
    });
  });
});

// --- JOBS API ---
app.get('/api/jobs', (req, res) => {
  fs.readFile(JOBS_DATA_PATH, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read error' });
    // console.log('job-records.json:', data); // debug log
    try {
      const jobs = JSON.parse(data);
      res.json(jobs);
    } catch (e) {
      console.error('JSON parse error:', e);
      res.status(500).json({ error: 'JSON parse error' });
    }
  });
});

app.post('/api/jobs', (req, res) => {
  const newJob = req.body;
  fs.readFile(JOBS_DATA_PATH, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read error' });
    const jobs = JSON.parse(data);
    newJob.id = Date.now();
    newJob.date = newJob.date || new Date().toISOString().slice(0, 10);
    jobs.push(newJob);
    fs.writeFile(JOBS_DATA_PATH, JSON.stringify(jobs, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Write error' });
      res.json(newJob);
    });
  });
});

app.delete('/api/jobs/:id', (req, res) => {
  const id = Number(req.params.id);
  fs.readFile(JOBS_DATA_PATH, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read error' });
    let jobs = JSON.parse(data);
    const newJobs = jobs.filter(j => j.id !== id);
    fs.writeFile(JOBS_DATA_PATH, JSON.stringify(newJobs, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Write error' });
      res.json({ success: true });
    });
  });
});

app.listen(PORT,'0.0.0.0', () => {
  // console.log(`Interview API server running on http://localhost:${PORT}`);
});

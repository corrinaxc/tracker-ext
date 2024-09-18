require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Convert ISO date to MySQL DATETIME format
function convertToMySQLDatetime(isoDate) {
  const date = new Date(isoDate);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Log entry data to the Entry table
app.post('/logEntry', (req, res) => {
  const { sessionId, entryUrl, entryDomain, entryTimestamp, isSearchEngine } = req.body;

  if (!sessionId || !entryUrl || !entryDomain || !entryTimestamp) {
    console.error('Invalid data received for entry:', req.body);
    return res.status(400).send('Invalid data');
  }

  const formattedTimestamp = convertToMySQLDatetime(entryTimestamp);

  const query = 'INSERT INTO Entry (SessionID, EntryURL, EntryTimestamp, Domain, IsSearchEngine) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [sessionId, entryUrl, formattedTimestamp, entryDomain, isSearchEngine], (err, result) => {
    if (err) {
      console.error('Error inserting into Entry table:', err);
      return res.status(500).send('Database error');
    }
    console.log('Entry data inserted successfully:', result);
    res.status(200).send('Entry logged successfully');
  });
});

// Log exit data to the Exit table
app.post('/logExit', (req, res) => {
  const { sessionId, pageVisitCounter, exitUrl, exitTimestamp } = req.body;

  if (!sessionId || !pageVisitCounter || !exitUrl || !exitTimestamp) {
    console.error('Invalid data received for exit:', req.body);
    return res.status(400).send('Invalid data');
  }

  const formattedTimestamp = convertToMySQLDatetime(exitTimestamp);

  const query = 'INSERT INTO Exit (SessionID, ExitTimestamp) VALUES (?, ?)';
  db.query(query, [sessionId, formattedTimestamp], (err, result) => {
    if (err) {
      console.error('Error inserting into Exit table:', err);
      return res.status(500).send('Database error');
    }
    console.log('Exit data inserted successfully:', result);
    res.status(200).send('Exit logged successfully');
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

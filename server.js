import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

const MAX_URL_LENGTH = 2048;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

function convertToMySQLDatetime(isoDate) {
  const date = new Date(isoDate);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

app.post('/log', (req, res) => {
  const { sessionId, pageCount, url, domain, isSearchEngine, timestamp } = req.body;

  // Validate input data: check for undefined or null values
  if (sessionId === undefined || pageCount === undefined || url === undefined || domain === undefined || isSearchEngine === undefined || timestamp === undefined) {
    console.error('Invalid data received:', req.body);
    return res.status(400).send('Invalid data');
  }

  if (url.length > MAX_URL_LENGTH) {
    console.error('URL exceeds maximum length:', url);
    return res.status(400).send('URL is too long');
  }

  const formattedTimestamp = convertToMySQLDatetime(timestamp);

  // Correct query and column names
  const query = 'INSERT INTO UserSessions (SessionId, PageCount, URL, Domain, isSearchEngine, Timestamp) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [sessionId, pageCount, url, domain, isSearchEngine, formattedTimestamp], (err, result) => {
    if (err) {
      console.error('Error inserting into MySQL:', err);
      return res.status(500).send('Database error');
    }
    console.log('Data inserted successfully:', result);
    res.status(200).send('Logged successfully');
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
console.log(`Server running on port ${port}`);
});
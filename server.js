import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

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
  const { sessionId, pageCount, url, domain, isSearchEngine, timestamp} = req.body; // Corrected 'sessionID' to 'sessionId'

  // Validate input data
  if (!sessionId || !pageCount || !url || !domain || !isSearchEngine || !timestamp) {
      console.error('Invalid data received:', req.body);
      return res.status(400).send('Invalid data');
  }

  const formattedTimestamp = convertToMySQLDatetime(timestamp);

  // Ensure the query parameters match the expected order
  const query = 'INSERT INTO UserSessions (sessionId, pageCount, url, domain, isSearchEngine, timestamp) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [sessionId, pageCount, url, domain, isSearchEngine, formattedTimestamp], (err, result) => { // Ensure correct order
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
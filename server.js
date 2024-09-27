// server.mjs
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

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the database');
});

// Convert ISO date to MySQL DATETIME format
function convertToMySQLDatetime(isoDate) {
  const date = new Date(isoDate);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Log entry data to the UserSessions table
app.post('/logEntry', (req, res) => {
  const { sessionId, entryUrl, entryDomain, entryTimestamp, isSearchEngine } = req.body;

  if (!sessionId || !entryUrl || !entryDomain || !entryTimestamp) {
    console.error('Invalid data received for entry:', req.body);
    return res.status(400).send('Invalid data');
  }

  const formattedTimestamp = convertToMySQLDatetime(entryTimestamp);

  const query = 'INSERT INTO UserSessions (SessionID, URL, Timestamp, Domain, IsSearchEngine) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [sessionId, entryUrl, formattedTimestamp, entryDomain, isSearchEngine], (err, result) => {
    if (err) {
      console.error('Error inserting into UserSessions table:', err);
      return res.status(500).send('Database error');
    }
    console.log('Entry data inserted successfully:', result);
    res.status(200).send('Entry logged successfully');
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

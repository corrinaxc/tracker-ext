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

function convertToMySQLDatetime(isoDate) {
  const date = new Date(isoDate);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

app.post('/log', (req, res) => {
  const { url, timestamp } = req.body;

  if (!url || !timestamp) {
      console.error('Invalid data received:', req.body);
      return res.status(400).send('Invalid data');
  }

  const formattedTimestamp = convertToMySQLDatetime(timestamp);

  const query = 'INSERT INTO url_test (url, timestamp) VALUES (?, ?)';
  db.query(query, [url, formattedTimestamp], (err, result) => {
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
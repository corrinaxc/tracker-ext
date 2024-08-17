const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.post('/log', (req, res) => {
    const { url, timestamp } = req.body;

    if (!url || !timestamp) {
        return res.status(400).send('Invalid data');
    }

    // Insert into the url_test table
    const query = 'INSERT INTO url_test (url, timestamp) VALUES (?, ?)';
    db.query(query, [url, timestamp], (err, result) => {
        if (err) {
            console.error('Error inserting into MySQL:', err);
            return res.status(500).send('Database error');
        }
        res.status(200).send('Logged successfully');
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
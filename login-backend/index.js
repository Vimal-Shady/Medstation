const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',           // your MySQL password
  database: 'medico'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to medico database.');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT role FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ role: results[0].role });
  });
});

app.listen(4000, () => {
  console.log('Login server running on port 4000');
});

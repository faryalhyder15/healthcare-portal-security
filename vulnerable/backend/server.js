const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(session({
    secret: 'weak-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: false,
        sameSite: false,  
        secure: false
    }
}));
app.use(express.static(path.join(__dirname, '../frontend')));

// DATABASE CONNECTION 
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'healthcare_portal',
    multipleStatements: true
});

// SQLi EASY 
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    console.log('[VULN LOGIN]', query);
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            req.session.user = results[0];
            return res.json({ success: true, user: results[0] });
        }
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    });
});

// SQLi INTERMEDIATE 
app.get('/api/patients/search', (req, res) => {
    const name = req.query.name || '';
    const query = `SELECT id, full_name, diagnosis FROM patients WHERE full_name LIKE '%${name}%'`;
    console.log('[VULN SEARCH]', query);
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// SQLi ADVANCED 
app.get('/api/patients/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM patients WHERE id = ${id}`;
    console.log('[VULN DETAIL]', query);
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// REFLECTED XSS 
app.get('/api/greet', (req, res) => {
    const name = req.query.name || 'Guest';
    res.send(`<h2>Welcome back, ${name}!</h2><p>Your session is active.</p>`);
});

// STORED XSS
app.post('/api/comments', (req, res) => {
    const { user_id, content } = req.body;
    db.query('INSERT INTO comments (user_id, content) VALUES (?, ?)',
        [user_id, content],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.get('/api/comments', (req, res) => {
    db.query('SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id ORDER BY c.id DESC',
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
});

// CSRF 
app.post('/api/change-email', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
    const { email } = req.body;
    db.query('UPDATE users SET email = ? WHERE id = ?',
        [email, req.session.user.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, newEmail: email });
        });
});

// Session helpers
app.get('/api/me', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
    res.json(req.session.user);
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});
// START
app.listen(3001, () => console.log('VULNERABLE app: http://localhost:3001'));
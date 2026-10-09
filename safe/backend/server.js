const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const csrf = require('csurf');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(helmet({
    contentSecurityPolicy: false 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, sameSite: 'strict', secure: false }
}));

const csrfProtection = csrf({ cookie: false });

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'healthcare_portal'
});

app.use(express.static(path.join(__dirname, '../frontend')));

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

// CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const user = results[0];
        if (password !== user.password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.json({ success: true, user: req.session.user });
    });
});

app.get('/api/patients/search', (req, res) => {
    const name = req.query.name || '';
    db.query('SELECT id, full_name, diagnosis FROM patients WHERE full_name LIKE ?',
        ['%' + name + '%'],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Server error' });
            res.json(results.map(r => ({
                id: r.id,
                full_name: escapeHtml(r.full_name),
                diagnosis: escapeHtml(r.diagnosis)
            })));
        });
});

app.get('/api/patients/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad ID' });
    db.query('SELECT * FROM patients WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

app.get('/api/greet', (req, res) => {
    const name = escapeHtml(req.query.name || 'Guest');
    res.type('html').send('<h2>Welcome back, ' + name + '!</h2><p>Your session is active.</p>');
});

app.post('/api/comments', (req, res) => {
    const { user_id, content } = req.body;
    if (typeof content !== 'string' || content.length > 1000) {
        return res.status(400).json({ error: 'Invalid content' });
    }
    db.query('INSERT INTO comments (user_id, content) VALUES (?, ?)',
        [parseInt(user_id, 10), content],
        (err) => {
            if (err) return res.status(500).json({ error: 'Server error' });
            res.json({ success: true });
        });
});

app.get('/api/comments', (req, res) => {
    db.query('SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id ORDER BY c.id DESC',
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Server error' });
            res.json(results.map(c => ({
                id: c.id,
                username: escapeHtml(c.username),
                content: escapeHtml(c.content),
                created_at: c.created_at
            })));
        });
});

app.post('/api/change-email', csrfProtection, (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
    const { email } = req.body;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email' });
    }
    db.query('UPDATE users SET email = ? WHERE id = ?',
        [email, req.session.user.id],
        (err) => {
            if (err) return res.status(500).json({ error: 'Server error' });
            res.json({ success: true, newEmail: email });
        });
});

app.get('/api/me', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
    res.json(req.session.user);
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'CSRF token invalid or missing' });
    }
    res.status(500).json({ error: 'Server error: ' + err.message });
});

app.listen(3002, () => console.log('SAFE app: http://localhost:3002'));
# Healthcare Portal â€” Blue Team Security Project

## Use Case
A healthcare portal where patients log in, search records, post comments, and update their email.
Demonstrates 7 real web vulnerabilities and their fixes in two switchable versions.

## Tech Stack
- Node.js + Express
- MySQL
- Vanilla HTML/CSS/JS frontend

## Folder Structure
- `vulnerable/` â€” intentionally insecure version (port 3001)
- `safe/` â€” hardened version (port 3002)
- `schema.sql` â€” database schema and seed data
- `evidence/` â€” payloads and screenshots

## How to Run

### 1. Setup Database
    mysql -u root -p < schema.sql

### 2. Vulnerable Version
    cd vulnerable/backend
    npm install
    node server.js
    # Open http://localhost:3001

### 3. Safe Version
    cd safe/backend
    npm install
    node server.js
    # Open http://localhost:3002

## Vulnerabilities Implemented

| # | Vulnerability | Vulnerable | Safe Fix |
|---|---------------|------------|----------|
| 1 | Reflected XSS | res.send(name) unescaped | HTML escape + textContent |
| 2 | Stored XSS | innerHTML render of DB content | Output encoding + textContent |
| 3 | DOM XSS | innerHTML = location.hash | textContent |
| 4 | CSRF | No token, SameSite=false | csurf token + SameSite=Strict |
| 5 | SQLi Easy | String concat login | Prepared statement |
| 6 | SQLi Intermediate | UNION via search | Prepared statement |
| 7 | SQLi Advanced | Full info_schema chain | parseInt + prepared statement |

## Default Credentials
- admin / admin123
- dr_smith / doctor123
- john_doe / patient123
- jane_roe / jane123

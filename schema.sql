DROP DATABASE IF EXISTS healthcare_portal;
CREATE DATABASE healthcare_portal;
USE healthcare_portal;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    email VARCHAR(100),
    role ENUM('patient','doctor','admin') DEFAULT 'patient',
    api_token VARCHAR(64)
);

CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    full_name VARCHAR(100),
    ssn VARCHAR(11),
    diagnosis TEXT,
    prescription TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_user INT,
    to_user INT,
    amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, email, role, api_token) VALUES
('admin', 'admin123', 'admin@health.com', 'admin', 'tok_admin_001'),
('dr_smith', 'doctor123', 'smith@health.com', 'doctor', 'tok_doc_002'),
('john_doe', 'patient123', 'john@mail.com', 'patient', 'tok_pat_003'),
('jane_roe', 'jane123', 'jane@mail.com', 'patient', 'tok_pat_004');

INSERT INTO patients (user_id, full_name, ssn, diagnosis, prescription) VALUES
(3, 'John Doe', '123-45-6789', 'Hypertension', 'Lisinopril 10mg'),
(4, 'Jane Roe', '987-65-4321', 'Diabetes Type 2', 'Metformin 500mg');

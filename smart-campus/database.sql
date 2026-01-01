CREATE DATABASE smart_campus;
USE smart_campus;

CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

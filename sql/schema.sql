CREATE DATABASE IF NOT EXISTS applyvault;
USE applyvault;

DROP TABLE IF EXISTS parsed_resumes;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('candidate', 'recruiter', 'admin') NOT NULL DEFAULT 'candidate',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  company VARCHAR(150) NOT NULL,
  location VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_id INT NOT NULL,
  resume_path VARCHAR(255) NOT NULL,
  status ENUM('Pending', 'Shortlisted', 'Interview', 'Rejected', 'Selected') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_job (user_id, job_id)
);

CREATE TABLE parsed_resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL UNIQUE,
  extracted_name VARCHAR(140) DEFAULT NULL,
  extracted_email VARCHAR(180) DEFAULT NULL,
  extracted_phone VARCHAR(40) DEFAULT NULL,
  skills TEXT,
  education TEXT,
  extracted_text MEDIUMTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_parsed_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_jobs_title_company ON jobs(title, company);

-- Default login credentials for demo:
-- recruiter@applyvault.com / password
-- admin@applyvault.com / password
INSERT INTO users (name, email, password, role) VALUES
('Recruiter One', 'recruiter@applyvault.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi0iFQH4fXg5lHppZArYrusS4x2rxy.', 'recruiter'),
('Admin User', 'admin@applyvault.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi0iFQH4fXg5lHppZArYrusS4x2rxy.', 'admin');

INSERT INTO jobs (title, company, location, description) VALUES
('Frontend Developer', 'NovaTech Labs', 'Bengaluru', 'Build modern React interfaces with API integrations and testing best practices.'),
('Backend Engineer', 'CloudBridge Systems', 'Hyderabad', 'Design scalable Node.js services, MySQL queries, and secure authentication flows.'),
('Data Analyst Intern', 'InsightFrame', 'Remote', 'Create reporting dashboards, SQL analyses, and automation scripts for hiring data.');

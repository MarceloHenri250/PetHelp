CREATE DATABASE IF NOT EXISTS pethelp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pethelp;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_type ENUM('owner', 'clinic') NOT NULL,
  clinic_name VARCHAR(180) NULL,
  phone VARCHAR(30) NULL,
  address VARCHAR(255) NULL,
  connection_code VARCHAR(32) NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pets (
  id CHAR(36) PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  linked_clinic_id CHAR(36) NULL,
  name VARCHAR(120) NOT NULL,
  species VARCHAR(80) NULL,
  breed VARCHAR(120) NOT NULL,
  age VARCHAR(50) NOT NULL,
  weight VARCHAR(50) NOT NULL,
  photo VARCHAR(500) NULL,
  allergies JSON NULL,
  conditions JSON NULL,
  initial_health_history TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_pets_clinic FOREIGN KEY (linked_clinic_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS medical_records (
  id CHAR(36) PRIMARY KEY,
  pet_id CHAR(36) NOT NULL,
  clinic_id CHAR(36) NULL,
  veterinarian_name VARCHAR(120) NULL,
  record_date DATE NOT NULL,
  description TEXT NOT NULL,
  documents JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_medical_records_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT fk_medical_records_clinic FOREIGN KEY (clinic_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vaccines (
  id CHAR(36) PRIMARY KEY,
  pet_id CHAR(36) NOT NULL,
  clinic_id CHAR(36) NULL,
  veterinarian_name VARCHAR(120) NULL,
  name VARCHAR(120) NOT NULL,
  applied_date DATE NOT NULL,
  next_dose_date DATE NOT NULL,
  status ENUM('up-to-date', 'late') NOT NULL DEFAULT 'up-to-date',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vaccines_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT fk_vaccines_clinic FOREIGN KEY (clinic_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id CHAR(36) PRIMARY KEY,
  pet_id CHAR(36) NOT NULL,
  owner_id CHAR(36) NOT NULL,
  clinic_id CHAR(36) NOT NULL,
  clinic_name VARCHAR(180) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_clinic FOREIGN KEY (clinic_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  pet_id CHAR(36) NULL,
  appointment_id CHAR(36) NULL,
  type ENUM('vaccine', 'appointment', 'connection') NOT NULL,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  notification_date DATE NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL,
  CONSTRAINT fk_notifications_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);
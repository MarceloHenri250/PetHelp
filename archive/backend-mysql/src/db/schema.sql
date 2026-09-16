-- Active: 1780852270164@@127.0.0.1@3306@pethelp
CREATE DATABASE IF NOT EXISTS pethelp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pethelp;

-- ============================================================================
-- 1. AUTENTICAÃ‡ÃƒO E PERFIS
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_type ENUM('tutor', 'clinic', 'veterinarian') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tutors (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NULL,
  cpf VARCHAR(14) NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tutors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clinics (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  trade_name VARCHAR(180) NOT NULL,
  corporate_name VARCHAR(180) NULL,
  cnpj VARCHAR(18) NULL UNIQUE,
  phone VARCHAR(30) NULL,
  address VARCHAR(255) NULL,
  connection_code VARCHAR(32) NULL UNIQUE,
  services JSON NULL,
  working_hours JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_clinics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS veterinarians (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  crmv VARCHAR(50) NOT NULL,
  crmv_uf CHAR(2) NOT NULL,
  specialty VARCHAR(120) NULL,
  phone VARCHAR(30) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_veterinarians_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_veterinarian_crmv_state UNIQUE (crmv, crmv_uf)
);

-- ============================================================================
-- 2. RELACIONAMENTOS E VÃNCULOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS clinic_veterinarians (
  id CHAR(36) PRIMARY KEY,
  clinic_id CHAR(36) NOT NULL,
  veterinarian_id CHAR(36) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  requested_by ENUM('clinic', 'veterinarian') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_clinic_veterinarians_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
  CONSTRAINT fk_clinic_veterinarians_veterinarian FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE CASCADE,
  CONSTRAINT uq_clinic_veterinarian UNIQUE (clinic_id, veterinarian_id)
);

-- ============================================================================
-- 3. ENTIDADES PRINCIPAIS
-- ============================================================================

CREATE TABLE IF NOT EXISTS pets (
  id CHAR(36) PRIMARY KEY,
  current_tutor_id CHAR(36) NULL,
  linked_clinic_id CHAR(36) NULL,
  name VARCHAR(120) NOT NULL,
  species VARCHAR(80) NOT NULL,
  breed VARCHAR(120) NULL,
  age VARCHAR(50) NULL,
  weight VARCHAR(50) NULL,
  photo LONGTEXT NULL,
  allergies JSON NULL,
  conditions JSON NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pets_tutor FOREIGN KEY (current_tutor_id) REFERENCES tutors(id) ON DELETE SET NULL,
  CONSTRAINT fk_pets_clinic FOREIGN KEY (linked_clinic_id) REFERENCES clinics(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pet_ownership_history (
  id CHAR(36) PRIMARY KEY,
  pet_id CHAR(36) NOT NULL,
  previous_tutor_id CHAR(36) NULL,
  new_tutor_id CHAR(36) NOT NULL,
  transferred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pet_ownership_history_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT fk_pet_ownership_history_previous_tutor FOREIGN KEY (previous_tutor_id) REFERENCES tutors(id) ON DELETE SET NULL,
  CONSTRAINT fk_pet_ownership_history_new_tutor FOREIGN KEY (new_tutor_id) REFERENCES tutors(id) ON DELETE RESTRICT
);

-- ============================================================================
-- 4. ATENDIMENTOS E SAÃšDE
-- ============================================================================

CREATE TABLE IF NOT EXISTS appointments (
  id CHAR(36) PRIMARY KEY,
  pet_id CHAR(36) NOT NULL,
  pet_name VARCHAR(120) NOT NULL,
  tutor_id CHAR(36) NOT NULL,
  veterinarian_id CHAR(36) NULL,
  clinic_id CHAR(36) NULL,
  clinic_name VARCHAR(180) NULL,
  veterinarian_name VARCHAR(120) NULL,
  veterinarian_email VARCHAR(180) NULL,
  veterinarian_phone VARCHAR(30) NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_tutor FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_veterinarian FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) PRIMARY KEY,
  appointment_id CHAR(36) NOT NULL UNIQUE,
  pet_id CHAR(36) NOT NULL,
  tutor_id CHAR(36) NOT NULL,
  veterinarian_id CHAR(36) NOT NULL,
  clinic_name VARCHAR(180) NULL,
  rating TINYINT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_tutor FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_veterinarian FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE CASCADE,
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS medical_records (
  id CHAR(36) PRIMARY KEY,
  pet_id CHAR(36) NOT NULL,
  veterinarian_id CHAR(36) NULL,
  veterinarian_name VARCHAR(120) NULL,
  clinic_id CHAR(36) NULL,
  clinic_name VARCHAR(180) NULL,
  record_date DATE NOT NULL,
  description TEXT NOT NULL,
  treatment TEXT NULL,
  documents JSON NULL,
  added_by ENUM('tutor', 'veterinarian', 'clinic') NOT NULL DEFAULT 'veterinarian',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_medical_records_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE RESTRICT,
  CONSTRAINT fk_medical_records_veterinarian FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE SET NULL,
  CONSTRAINT fk_medical_records_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vaccines (
  id CHAR(36) PRIMARY KEY,
  pet_id CHAR(36) NOT NULL,
  veterinarian_id CHAR(36) NULL,
  veterinarian_name VARCHAR(120) NULL,
  clinic_id CHAR(36) NULL,
  clinic_name VARCHAR(180) NULL,
  name VARCHAR(120) NOT NULL,
  applied_date DATE NOT NULL,
  next_dose_date DATE NULL,
  status ENUM('up-to-date', 'late') NOT NULL DEFAULT 'up-to-date',
  added_by ENUM('tutor', 'veterinarian', 'clinic') NOT NULL DEFAULT 'veterinarian',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vaccines_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE RESTRICT,
  CONSTRAINT fk_vaccines_veterinarian FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE SET NULL,
  CONSTRAINT fk_vaccines_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS referrals (
  id CHAR(36) PRIMARY KEY,
  pet_id CHAR(36) NOT NULL,
  veterinarian_id CHAR(36) NOT NULL,
  target_clinic_id CHAR(36) NULL,
  reason TEXT NOT NULL,
  referral_code VARCHAR(12) NOT NULL UNIQUE,
  status ENUM('pending', 'completed', 'expired') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_referrals_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE RESTRICT,
  CONSTRAINT fk_referrals_veterinarian FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE RESTRICT,
  CONSTRAINT fk_referrals_clinic FOREIGN KEY (target_clinic_id) REFERENCES clinics(id) ON DELETE SET NULL
);

-- ============================================================================
-- 5. COMUNICAÃ‡ÃƒO E SUPORTE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  pet_id CHAR(36) NULL,
  appointment_id CHAR(36) NULL,
  source_key VARCHAR(120) NULL,
  type ENUM('vaccine', 'appointment', 'connection', 'referral') NOT NULL,
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

CREATE TABLE IF NOT EXISTS vet_passes (
  id CHAR(36) PRIMARY KEY,
  pass_code VARCHAR(64) NOT NULL UNIQUE,
  tutor_id CHAR(36) NOT NULL,
  pet_id CHAR(36) NOT NULL,
  pet_name VARCHAR(120) NOT NULL,
  documents JSON NOT NULL,
  redeemed_by_user_id CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  redeemed_at TIMESTAMP NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vet_passes_tutor FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
  CONSTRAINT fk_vet_passes_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT fk_vet_passes_redeemed_by FOREIGN KEY (redeemed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);


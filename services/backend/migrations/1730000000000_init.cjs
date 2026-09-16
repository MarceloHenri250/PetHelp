/* eslint-disable camelcase */

exports.shorthands = undefined;

/**
 * Initial PostgreSQL schema for PetHelp.
 *
 * This is a direct translation of the previous MySQL schema
 * (`legacy-mysql/src/db/schema.sql` + the runtime patches that used to live in
 * `legacy-mysql/src/db/ensure-schema.ts`), using native Postgres types:
 *   - CHAR(36) ids            -> uuid
 *   - ENUM(...)               -> native CREATE TYPE ... AS ENUM
 *   - JSON                    -> jsonb
 *   - ON UPDATE CURRENT_TIMESTAMP -> set_updated_at() BEFORE UPDATE trigger
 */
exports.up = (pgm) => {
  pgm.sql(`
    -- ----------------------------------------------------------------------
    -- Enum types
    -- ----------------------------------------------------------------------
    CREATE TYPE user_type AS ENUM ('tutor', 'clinic', 'veterinarian');
    CREATE TYPE clinic_link_status AS ENUM ('pending', 'approved', 'rejected');
    CREATE TYPE clinic_link_requester AS ENUM ('clinic', 'veterinarian');
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');
    CREATE TYPE record_source AS ENUM ('tutor', 'veterinarian', 'clinic');
    CREATE TYPE vaccine_status AS ENUM ('up-to-date', 'late');
    CREATE TYPE referral_status AS ENUM ('pending', 'completed', 'expired');
    CREATE TYPE notification_type AS ENUM ('vaccine', 'appointment', 'connection', 'referral');

    -- ----------------------------------------------------------------------
    -- updated_at trigger helper
    -- ----------------------------------------------------------------------
    CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- ----------------------------------------------------------------------
    -- 1. Authentication & profiles
    -- ----------------------------------------------------------------------
    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email varchar(180) NOT NULL UNIQUE,
      password_hash varchar(255) NOT NULL,
      user_type user_type NOT NULL,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE tutors (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      name varchar(120) NOT NULL,
      phone varchar(30),
      cpf varchar(14) UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE clinics (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      trade_name varchar(180) NOT NULL,
      corporate_name varchar(180),
      cnpj varchar(18) UNIQUE,
      phone varchar(30),
      address varchar(255),
      connection_code varchar(32) UNIQUE,
      services jsonb,
      working_hours jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE veterinarians (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      name varchar(120) NOT NULL,
      crmv varchar(50) NOT NULL,
      crmv_uf char(2) NOT NULL,
      specialty varchar(120),
      phone varchar(30),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT uq_veterinarian_crmv_state UNIQUE (crmv, crmv_uf)
    );

    -- ----------------------------------------------------------------------
    -- 2. Relationships
    -- ----------------------------------------------------------------------
    CREATE TABLE clinic_veterinarians (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
      veterinarian_id uuid NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
      status clinic_link_status NOT NULL DEFAULT 'pending',
      requested_by clinic_link_requester NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT uq_clinic_veterinarian UNIQUE (clinic_id, veterinarian_id)
    );

    -- ----------------------------------------------------------------------
    -- 3. Core entities
    -- ----------------------------------------------------------------------
    CREATE TABLE pets (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      current_tutor_id uuid REFERENCES tutors(id) ON DELETE SET NULL,
      linked_clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL,
      name varchar(120) NOT NULL,
      species varchar(80) NOT NULL,
      breed varchar(120),
      age varchar(50),
      weight varchar(50),
      photo text,
      allergies jsonb,
      conditions jsonb,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE pet_ownership_history (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
      previous_tutor_id uuid REFERENCES tutors(id) ON DELETE SET NULL,
      new_tutor_id uuid NOT NULL REFERENCES tutors(id) ON DELETE RESTRICT,
      transferred_at timestamptz NOT NULL DEFAULT now()
    );

    -- ----------------------------------------------------------------------
    -- 4. Appointments & health
    -- ----------------------------------------------------------------------
    CREATE TABLE appointments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,
      pet_name varchar(120) NOT NULL,
      tutor_id uuid NOT NULL REFERENCES tutors(id) ON DELETE RESTRICT,
      veterinarian_id uuid REFERENCES veterinarians(id) ON DELETE RESTRICT,
      clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL,
      clinic_name varchar(180),
      veterinarian_name varchar(120),
      veterinarian_email varchar(180),
      veterinarian_phone varchar(30),
      appointment_date date NOT NULL,
      appointment_time time NOT NULL,
      reason text NOT NULL,
      status appointment_status NOT NULL DEFAULT 'scheduled',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE reviews (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id uuid NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
      pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
      tutor_id uuid NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
      veterinarian_id uuid NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
      clinic_name varchar(180),
      rating smallint NOT NULL,
      comment text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
    );

    CREATE TABLE medical_records (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,
      veterinarian_id uuid REFERENCES veterinarians(id) ON DELETE SET NULL,
      veterinarian_name varchar(120),
      clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL,
      clinic_name varchar(180),
      record_date date NOT NULL,
      description text NOT NULL,
      treatment text,
      documents jsonb,
      added_by record_source NOT NULL DEFAULT 'veterinarian',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE vaccines (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,
      veterinarian_id uuid REFERENCES veterinarians(id) ON DELETE SET NULL,
      veterinarian_name varchar(120),
      clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL,
      clinic_name varchar(180),
      name varchar(120) NOT NULL,
      applied_date date NOT NULL,
      next_dose_date date,
      status vaccine_status NOT NULL DEFAULT 'up-to-date',
      added_by record_source NOT NULL DEFAULT 'veterinarian',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE referrals (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,
      veterinarian_id uuid NOT NULL REFERENCES veterinarians(id) ON DELETE RESTRICT,
      target_clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL,
      reason text NOT NULL,
      referral_code varchar(12) NOT NULL UNIQUE,
      status referral_status NOT NULL DEFAULT 'pending',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    -- ----------------------------------------------------------------------
    -- 5. Communication & support
    -- ----------------------------------------------------------------------
    CREATE TABLE notifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pet_id uuid REFERENCES pets(id) ON DELETE SET NULL,
      appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
      source_key varchar(120),
      type notification_type NOT NULL,
      title varchar(180) NOT NULL,
      message text NOT NULL,
      notification_date date NOT NULL,
      read_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE vet_passes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      pass_code varchar(64) NOT NULL UNIQUE,
      tutor_id uuid NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
      pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
      pet_name varchar(120) NOT NULL,
      documents jsonb NOT NULL,
      redeemed_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL,
      redeemed_at timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    -- ----------------------------------------------------------------------
    -- updated_at triggers
    -- ----------------------------------------------------------------------
    DO $$
    DECLARE
      t text;
    BEGIN
      FOREACH t IN ARRAY ARRAY[
        'users', 'tutors', 'clinics', 'veterinarians', 'clinic_veterinarians',
        'pets', 'appointments', 'reviews', 'medical_records', 'vaccines',
        'referrals', 'notifications', 'vet_passes'
      ]
      LOOP
        EXECUTE format(
          'CREATE TRIGGER trg_%1$s_updated_at BEFORE UPDATE ON %1$s
             FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t
        );
      END LOOP;
    END $$;

    -- ----------------------------------------------------------------------
    -- Helpful indexes
    -- ----------------------------------------------------------------------
    CREATE INDEX idx_pets_current_tutor ON pets(current_tutor_id);
    CREATE INDEX idx_pets_linked_clinic ON pets(linked_clinic_id);
    CREATE INDEX idx_appointments_pet ON appointments(pet_id);
    CREATE INDEX idx_appointments_tutor ON appointments(tutor_id);
    CREATE INDEX idx_appointments_veterinarian ON appointments(veterinarian_id);
    CREATE INDEX idx_medical_records_pet ON medical_records(pet_id);
    CREATE INDEX idx_vaccines_pet ON vaccines(pet_id);
    CREATE INDEX idx_notifications_user ON notifications(user_id);
    CREATE INDEX idx_vet_passes_tutor ON vet_passes(tutor_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS
      vet_passes, notifications, referrals, vaccines, medical_records, reviews,
      appointments, pet_ownership_history, pets, clinic_veterinarians,
      veterinarians, clinics, tutors, users CASCADE;

    DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

    DROP TYPE IF EXISTS
      notification_type, referral_status, vaccine_status, record_source,
      appointment_status, clinic_link_requester, clinic_link_status, user_type;
  `);
};

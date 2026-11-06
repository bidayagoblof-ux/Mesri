-- =========================================================================
-- SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
-- KECAMATAN GOMO, KABUPATEN NIAS SELATAN, SUMATERA UTARA
-- RELATIONAL DATABASE SCHEMA (MySQL 8.0+ / PostgreSQL Compatible)
-- =========================================================================

-- 1. Tabel Peran Pengguna (Roles)
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Pengguna (Users)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  nik VARCHAR(16) UNIQUE,
  email VARCHAR(128) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(128) NOT NULL,
  phone VARCHAR(20),
  role_id VARCHAR(32) NOT NULL,
  dusun VARCHAR(64),
  rt_rw VARCHAR(16),
  avatar_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- 3. Tabel Data Penduduk (Residents)
CREATE TABLE IF NOT EXISTS residents (
  nik VARCHAR(16) PRIMARY KEY,
  no_kk VARCHAR(16) NOT NULL,
  full_name VARCHAR(128) NOT NULL,
  gender ENUM('L', 'P') NOT NULL,
  birth_place VARCHAR(64) NOT NULL,
  birth_date DATE NOT NULL,
  religion VARCHAR(32) NOT NULL,
  education VARCHAR(64),
  occupation VARCHAR(64) NOT NULL,
  marital_status ENUM('Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati') NOT NULL,
  address_dusun VARCHAR(64) NOT NULL,
  rt_rw VARCHAR(16) DEFAULT '001/001',
  citizenship VARCHAR(3) DEFAULT 'WNI',
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Tabel Jenis Layanan Administrasi (Services)
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  category VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  processing_days INT DEFAULT 2,
  responsible_role VARCHAR(32) NOT NULL DEFAULT 'perangkat',
  approval_role VARCHAR(32) NOT NULL DEFAULT 'kades',
  letter_code_prefix VARCHAR(16) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Tabel Persyaratan Layanan (Service Requirements)
CREATE TABLE IF NOT EXISTS service_requirements (
  id VARCHAR(64) PRIMARY KEY,
  service_id VARCHAR(64) NOT NULL,
  requirement_name VARCHAR(255) NOT NULL,
  is_mandatory BOOLEAN DEFAULT TRUE,
  file_format_hint VARCHAR(64) DEFAULT 'PDF / JPG / PNG (Maks 2MB)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 6. Tabel Permohonan Administrasi (Applications)
CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(64) PRIMARY KEY,
  registration_number VARCHAR(64) UNIQUE NOT NULL,
  service_id VARCHAR(64) NOT NULL,
  applicant_user_id VARCHAR(64) NOT NULL,
  applicant_nik VARCHAR(16) NOT NULL,
  applicant_name VARCHAR(128) NOT NULL,
  applicant_phone VARCHAR(20),
  purpose TEXT NOT NULL,
  custom_fields_json JSON,
  status ENUM(
    'diajukan',
    'menunggu_pemeriksaan',
    'perlu_perbaikan',
    'terverifikasi',
    'menunggu_persetujuan',
    'disetujui',
    'diproses',
    'selesai',
    'ditolak'
  ) NOT NULL DEFAULT 'diajukan',
  officer_notes TEXT,
  assigned_officer_id VARCHAR(64),
  verified_by VARCHAR(64),
  verified_at TIMESTAMP NULL,
  approved_by VARCHAR(64),
  approved_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
  FOREIGN KEY (applicant_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Tabel Dokumen Persyaratan Permohonan (Application Documents)
CREATE TABLE IF NOT EXISTS application_documents (
  id VARCHAR(64) PRIMARY KEY,
  application_id VARCHAR(64) NOT NULL,
  requirement_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT,
  file_type VARCHAR(64),
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 8. Tabel Riwayat Status Permohonan (Application Status Histories)
CREATE TABLE IF NOT EXISTS application_status_histories (
  id VARCHAR(64) PRIMARY KEY,
  application_id VARCHAR(64) NOT NULL,
  from_status VARCHAR(64),
  to_status VARCHAR(64) NOT NULL,
  actor_id VARCHAR(64) NOT NULL,
  actor_name VARCHAR(128) NOT NULL,
  actor_role VARCHAR(32) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 9. Tabel Surat Diterbitkan & Arsip (Letters & Archives)
CREATE TABLE IF NOT EXISTS letters (
  id VARCHAR(64) PRIMARY KEY,
  letter_number VARCHAR(128) UNIQUE NOT NULL,
  application_id VARCHAR(64) UNIQUE NOT NULL,
  service_id VARCHAR(64) NOT NULL,
  recipient_nik VARCHAR(16) NOT NULL,
  recipient_name VARCHAR(128) NOT NULL,
  letter_date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content_body TEXT NOT NULL,
  signatory_name VARCHAR(128) NOT NULL,
  signatory_role VARCHAR(64) NOT NULL,
  qr_verification_code VARCHAR(128) NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE RESTRICT,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
);

-- 10. Tabel Notifikasi Pengguna (Notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link_url VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Tabel Log Aktivitas (Activity Logs)
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64),
  user_name VARCHAR(128),
  role VARCHAR(32),
  action VARCHAR(64) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tabel Profil dan Konfigurasi Desa (Village Config)
CREATE TABLE IF NOT EXISTS village_configs (
  key_name VARCHAR(64) PRIMARY KEY,
  value_text TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

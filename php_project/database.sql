-- =========================================================================
-- SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
-- KECAMATAN GOMO, KABUPATEN NIAS SELATAN, SUMATERA UTARA
-- DATABASE: sipadlo_lolosoni (MySQL 5.7+ / 8.0+ / MariaDB)
-- Pendekatan Berorientasi Objek (OOP) dengan PDO
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `sipadlo_lolosoni` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sipadlo_lolosoni`;

-- 1. Tabel Peran Pengguna (Roles)
CREATE TABLE IF NOT EXISTS `roles` (
  `id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
('kades', 'Kepala Desa / Administrator', 'Persetujuan akhir surat, konfigurasi layanan, dan laporan'),
('sekdes', 'Sekretaris Desa', 'Verifikasi berkas, penerusan surat, dan penomoran dinas'),
('perangkat', 'Kaur Pelayanan & Umum', 'Pemeriksaan berkas masuk dan verifikasi kelengkapan'),
('masyarakat', 'Masyarakat Desa', 'Pemohon pelayanan administrasi kependudukan online')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 2. Tabel Pengguna (Users)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `nik` VARCHAR(16) UNIQUE NULL,
  `email` VARCHAR(128) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(128) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `role_id` VARCHAR(32) NOT NULL,
  `dusun` VARCHAR(64) NULL,
  `rt_rw` VARCHAR(16) NULL DEFAULT '001/001',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Password hash default untuk admin123 / sekdes123 / perangkat123 / warga123 menggunakan SHA256 atau password_hash()
INSERT INTO `users` (`id`, `nik`, `email`, `password_hash`, `full_name`, `phone`, `role_id`, `dusun`) VALUES
('usr_kades', '1214081005780001', 'kades@lolosoni.desa.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ya\'atulo Hia', '081265001122', 'kades', 'Dusun I Bawonahono'),
('usr_sekdes', '1214081406830002', 'sekdes@lolosoni.desa.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faomakhoda Telambanua, S.AP', '081375112233', 'sekdes', 'Dusun II Hilibadalu'),
('usr_perangkat', '1214082209890003', 'perangkat@lolosoni.desa.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Yulianus Lase', '082199887766', 'perangkat', 'Dusun I Bawonahono'),
('usr_warga_1', '1214081504920001', 'warga@lolosoni.desa.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bezisokhi Hia', '085277119922', 'masyarakat', 'Dusun I Bawonahono'),
('usr_warga_2', '1214086208950002', 'sarinah@lolosoni.desa.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarinah Zagoto', '085388223344', 'masyarakat', 'Dusun II Hilibadalu')
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- 3. Tabel Data Penduduk (Residents)
CREATE TABLE IF NOT EXISTS `residents` (
  `nik` VARCHAR(16) NOT NULL,
  `no_kk` VARCHAR(16) NOT NULL,
  `full_name` VARCHAR(128) NOT NULL,
  `gender` ENUM('L', 'P') NOT NULL,
  `birth_place` VARCHAR(64) NOT NULL,
  `birth_date` DATE NOT NULL,
  `religion` VARCHAR(32) NOT NULL,
  `education` VARCHAR(64) NULL,
  `occupation` VARCHAR(64) NOT NULL,
  `marital_status` ENUM('Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati') NOT NULL,
  `address_dusun` VARCHAR(64) NOT NULL,
  `rt_rw` VARCHAR(16) DEFAULT '001/001',
  `phone` VARCHAR(20) NULL,
  PRIMARY KEY (`nik`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `residents` (`nik`, `no_kk`, `full_name`, `gender`, `birth_place`, `birth_date`, `religion`, `education`, `occupation`, `marital_status`, `address_dusun`, `phone`) VALUES
('1214081504920001', '1214080101150001', 'Bezisokhi Hia', 'L', 'Lolosoni', '1992-04-15', 'Kristen Protestan', 'SLTA / Sederajat', 'Petani / Pekebun', 'Kawin', 'Dusun I Bawonahono', '085277119922'),
('1214086208950002', '1214080101150002', 'Sarinah Zagoto', 'P', 'Gomo', '1995-08-22', 'Kristen Protestan', 'Diploma / Sarjana', 'Wiraswasta', 'Belum Kawin', 'Dusun II Hilibadalu', '085388223344'),
('1214081005780001', '1214080101120005', 'Ya\'atulo Hia', 'L', 'Lolosoni', '1978-05-10', 'Kristen Protestan', 'S1 Ilmu Pemerintahan', 'Kepala Desa', 'Kawin', 'Dusun I Bawonahono', '081265001122'),
('1214081406830002', '1214080101130007', 'Faomakhoda Telambanua, S.AP', 'L', 'Gomo', '1983-06-14', 'Kristen Protestan', 'S1 Administrasi Publik', 'Perangkat Desa', 'Kawin', 'Dusun II Hilibadalu', '081375112233'),
('1214082209890003', '1214080101140010', 'Yulianus Lase', 'L', 'Lolosoni', '1989-09-22', 'Kristen Protestan', 'SLTA / Sederajat', 'Perangkat Desa', 'Kawin', 'Dusun I Bawonahono', '082199887766')
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- 4. Tabel Jenis Layanan Administrasi (Services)
CREATE TABLE IF NOT EXISTS `services` (
  `id` VARCHAR(64) NOT NULL,
  `code` VARCHAR(32) UNIQUE NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `description` TEXT NOT NULL,
  `processing_days` INT DEFAULT 2,
  `responsible_role` VARCHAR(32) DEFAULT 'perangkat',
  `approval_role` VARCHAR(32) DEFAULT 'kades',
  `letter_code_prefix` VARCHAR(16) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `services` (`id`, `code`, `name`, `category`, `description`, `processing_days`, `letter_code_prefix`) VALUES
('srv_domisili', 'SKD', 'Surat Keterangan Domisili', 'Kependudukan', 'Keterangan resmi status kependudukan dan domisili sah di Desa Lolosoni.', 1, '470'),
('srv_ktp_kk', 'SP-KTP', 'Surat Pengantar KTP / Kartu Keluarga', 'Kependudukan', 'Pengantar pengurusan KTP-el atau KK ke Camat Gomo / Disdukcapil Nias Selatan.', 1, '474'),
('srv_sku', 'SKU', 'Surat Keterangan Usaha (SKU)', 'Perekonomian', 'Keterangan kepemilikan usaha untuk pengajuan KUR bank atau izin usaha mikro.', 2, '510'),
('srv_sktm', 'SKTM', 'Surat Keterangan Tidak Mampu (SKTM)', 'Sosial', 'Keterangan keluarga kurang mampu untuk beasiswa sekolah/kuliah dan bansos.', 1, '401'),
('srv_kelahiran', 'SK-LAHIR', 'Surat Keterangan Kelahiran', 'Kependudukan', 'Keterangan kelahiran anak untuk pengurusan Akta Kelahiran.', 1, '474.1'),
('srv_kematian', 'SK-MATI', 'Surat Keterangan Kematian', 'Kependudukan', 'Keterangan kematian warga untuk administrasi kependudukan dan waris.', 1, '474.3'),
('srv_pengantar_nikah', 'SP-NIKAH', 'Surat Pengantar Nikah', 'Pernikahan', 'Surat pengantar permohonan pencatatan nikah ke KUA atau Catatan Sipil.', 2, '474.2'),
('srv_belum_nikah', 'SK-BN', 'Surat Keterangan Belum Menikah', 'Pernikahan', 'Keterangan status belum pernah menikah untuk melamar pekerjaan/kedinasan.', 1, '474.21'),
('srv_lainnya', 'SK-LAIN', 'Pengajuan Surat Keterangan Lainnya', 'Umum', 'Layanan terpadu untuk keperluan surat non-standar kewenangan desa.', 2, '470.9')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 5. Tabel Permohonan Administrasi (Applications)
CREATE TABLE IF NOT EXISTS `applications` (
  `id` VARCHAR(64) NOT NULL,
  `registration_number` VARCHAR(64) UNIQUE NOT NULL,
  `service_id` VARCHAR(64) NOT NULL,
  `applicant_user_id` VARCHAR(64) NOT NULL,
  `applicant_nik` VARCHAR(16) NOT NULL,
  `applicant_name` VARCHAR(128) NOT NULL,
  `applicant_phone` VARCHAR(20) NULL,
  `purpose` TEXT NOT NULL,
  `status` ENUM('diajukan', 'menunggu_pemeriksaan', 'perlu_perbaikan', 'terverifikasi', 'menunggu_persetujuan', 'disetujui', 'diproses', 'selesai', 'ditolak') DEFAULT 'diajukan',
  `officer_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`),
  FOREIGN KEY (`applicant_user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel Surat Diterbitkan & Arsip (Letters)
CREATE TABLE IF NOT EXISTS `letters` (
  `id` VARCHAR(64) NOT NULL,
  `letter_number` VARCHAR(128) UNIQUE NOT NULL,
  `application_id` VARCHAR(64) UNIQUE NOT NULL,
  `service_id` VARCHAR(64) NOT NULL,
  `recipient_nik` VARCHAR(16) NOT NULL,
  `recipient_name` VARCHAR(128) NOT NULL,
  `recipient_address` TEXT NOT NULL,
  `recipient_birth` VARCHAR(64) NOT NULL,
  `recipient_occupation` VARCHAR(64) NOT NULL,
  `purpose` TEXT NOT NULL,
  `letter_date` DATE NOT NULL,
  `signatory_name` VARCHAR(128) NOT NULL,
  `signatory_role` VARCHAR(64) NOT NULL,
  `qr_verification_code` VARCHAR(128) NOT NULL,
  `content_body` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`),
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabel Profil & Konfigurasi Desa (Village Config)
CREATE TABLE IF NOT EXISTS `village_configs` (
  `key_name` VARCHAR(64) NOT NULL,
  `value_text` TEXT NOT NULL,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `village_configs` (`key_name`, `value_text`) VALUES
('village_name', 'Desa Lolosoni'),
('district_name', 'Kecamatan Gomo'),
('regency_name', 'Kabupaten Nias Selatan'),
('province_name', 'Sumatera Utara'),
('office_address', 'Jalan Poros Desa Lolosoni, Kec. Gomo, Kab. Nias Selatan'),
('postal_code', '22873'),
('kades_name', 'Ya\'atulo Hia'),
('sekdes_name', 'Faomakhoda Telambanua, S.AP'),
('kaur_pelayanan_name', 'Yulianus Lase'),
('vision', 'Mewujudkan Desa Lolosoni yang Maju, Berdaya Saing, Mandiri, Berkeadilan, dan Religius Berbasis Pelayanan Publik Terpadu dan Kearifan Lokal Ono Niha.'),
('resident_count', '1482')
ON DUPLICATE KEY UPDATE `value_text`=VALUES(`value_text`);

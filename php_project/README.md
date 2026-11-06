# SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
### IMPLEMENTASI SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA BERBASIS WEB MENGGUNAKAN PENDEKATAN BERORIENTASI OBJEK DI DESA LOLOSONI KABUPATEN NIAS SELATAN

---

## 1. Identitas & Latar Belakang Proyek
- **Nama Sistem**: SIPADLO – Sistem Informasi Pelayanan Administrasi Desa Lolosoni
- **Lokasi Penelitian**: Desa Lolosoni, Kecamatan Gomo, Kabupaten Nias Selatan, Sumatera Utara
- **Bahasa Pemrograman**: PHP (Object-Oriented Programming / OOP)
- **Database**: MySQL / MariaDB (Relasional dengan Foreign Key & PDO Prepared Statements)
- **Antarmuka**: HTML5, CSS Tailwind, Font Awesome, Chart.js

---

## 2. Struktur Direktori Proyek OOP

```text
sipadlo/
├── config/
│   └── Database.php          # Kelas OOP Koneksi Database PDO MySQL
├── models/
│   ├── User.php              # Kelas Model Pengguna & Otentikasi
│   ├── Service.php           # Kelas Model Katalog Layanan Surat Desa
│   ├── Application.php       # Kelas Model Permohonan Administrasi & Analitik
│   ├── Letter.php            # Kelas Model Penerbitan Surat Resmi & QR Code
│   └── Resident.php          # Kelas Model Kependudukan Desa Lolosoni
├── includes/
│   ├── header.php            # Template Navbar & Metadata
│   └── footer.php            # Template Footer & Informasi Kontak Kantor Desa
├── ajukan.php                # Formulir Pengajuan Permohonan Surat Online
├── cetak_surat.php           # Format Cetak Dokumen Surat A4 Resmi & Tanda Tangan
├── dashboard.php             # Dashboard Multi-Peran dengan Grafik Tren Chart.js
├── database.sql              # Skema Database Relasional MySQL + Data Seed Desa
├── index.php                 # Halaman Portal Utama Publik & Pelacakan Surat
├── laporan.php               # Rekapitulasi Buku Register Surat Masuk & Keluar
├── login.php                 # Halaman Masuk dengan 1-Klik Role Switcher
├── logout.php                # Script Keluar Sesi
├── register.php              # Pendaftaran Akun Warga Baru
└── README.md                 # Dokumentasi Lengkap Sistem
```

---

## 3. Penerapan Konsep Berorientasi Objek (OOP)
Aplikasi ini dibangun dengan kaidah Object-Oriented Programming (OOP) yang bersih:
1. **Encapsulation (Enkapsulasi)**: Semua properti koneksi dan tabel dibungkus dalam atribut `private` / `protected` dengan metode publik.
2. **Class & Object**: Setiap entitas utama desa memiliki kelas terpisah (`User`, `Service`, `Application`, `Letter`, `Resident`).
3. **Data Access via PDO Prepared Statements**: Mencegah SQL Injection secara menyeluruh dengan parameter binding.
4. **Separation of Concerns**: Logika database dienkapsulasi dalam model, sedangkan alur antarmuka diatur dalam file controller/view.

---

## 4. Panduan Instalasi Lokal (XAMPP / Laragon / cPanel)

### Langkah 1: Pindahkan Berkas Proyek
- **XAMPP (Windows)**: Salin seluruh isi folder ini ke `C:\xampp\htdocs\sipadlo\`
- **Laragon (Windows)**: Salin seluruh isi folder ini ke `C:\laragon\www\sipadlo\`
- **Linux (Apache)**: Salin ke `/var/www/html/sipadlo/`

### Langkah 2: Import Database MySQL
1. Buka browser dan akses **phpMyAdmin** (`http://localhost/phpmyadmin`).
2. Buat database baru bernama: `sipadlo_lolosoni`.
3. Pilih database tersebut, lalu klik menu **Import**.
4. Pilih berkas `database.sql` yang berada di direktori ini, kemudian klik **Go** / **Kirim**.
5. Database akan otomatis membuat 7 tabel relasional (`roles`, `users`, `residents`, `services`, `applications`, `letters`, `village_configs`) beserta data awal Desa Lolosoni.

### Langkah 3: Konfigurasi Database (Jika Diperlukan)
Buka file `config/Database.php` dan sesuaikan kredensial jika berbeda dari default XAMPP:
```php
private string $host = "localhost";
private string $db_name = "sipadlo_lolosoni";
private string $username = "root";
private string $password = ""; // Isi jika MySQL Anda memiliki password
```

### Langkah 4: Buka Aplikasi di Browser
Akses alamat berikut di browser:
```text
http://localhost/sipadlo
```

---

## 5. Akun Pengujian Sistem (Multi-Role)

Tersedia tombol **1-Klik Masuk** di halaman `login.php` untuk kemudahan pengujian sidang/evaluasi:

| Peran (Role) | Nama Pejabat / Pengguna | Email Login | Kata Sandi | Wewenang Utama |
|---|---|---|---|---|
| **Kepala Desa** | Ya'atulo Hia | `kades@lolosoni.desa.id` | `admin123` | Persetujuan akhir & penandatanganan surat dinas |
| **Sekretaris Desa** | Faomakhoda Telambanua, S.AP | `sekdes@lolosoni.desa.id` | `sekdes123` | Verifikasi berkas, penomoran surat |
| **Kaur Pelayanan** | Yulianus Lase | `perangkat@lolosoni.desa.id` | `perangkat123` | Pemeriksaan kelengkapan permohonan baru |
| **Masyarakat Desa** | Bezisokhi Hia | `warga@lolosoni.desa.id` | `warga123` | Mengajukan permohonan & lacak surat |

---

## 6. Fitur Unggulan Sistem
1. **9 Katalog Layanan Surat Desa**: Surat Keterangan Domisili, KTP/KK, Usaha (SKU), Tidak Mampu (SKTM), Kelahiran, Kematian, Pengantar Nikah, Belum Nikah, dan Surat Lainnya.
2. **Pelacakan Surat Real-Time**: Warga dapat mengecek progres surat cukup dengan nomor registrasi tanpa perlu login.
3. **Format Dokumen Resmi Siap Cetak A4**: Kop resmi Desa Lolosoni, nomor surat otomatis standar dinas, biodata pemohon, stempel, dan **QR Code Validasi Digital**.
4. **Visualisasi Data Analitik**: Grafik volume permohonan per bulan (diajukan, diproses, selesai) dengan Chart.js.
5. **Keamanan**: Password hashing standar BCRYPT, filter input, dan prepared statements.

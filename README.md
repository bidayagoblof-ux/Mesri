# SIPADLO – Sistem Informasi Pelayanan Administrasi Desa Lolosoni

Aplikasi web modern pemerintahan desa untuk **Desa Lolosoni, Kecamatan Gomo, Kabupaten Nias Selatan, Provinsi Sumatera Utara**.

---

## 🏛️ Identitas Proyek & Penelitian
- **Nama Aplikasi:** SIPADLO (Sistem Informasi Pelayanan Administrasi Desa Lolosoni)
- **Judul Penelitian:** Implementasi Sistem Informasi Pelayanan Administrasi Desa Berbasis Web Menggunakan Pendekatan Berorientasi Objek di Desa Lolosoni Kabupaten Nias Selatan.
- **Lokasi Pelaksanaan:** Desa Lolosoni, Kec. Gomo, Kab. Nias Selatan, Sumatera Utara (Kode Pos: 22873).

---

## ✨ Fitur Utama
1. **Hero Section 3D Interaktif (Three.js):**
   - Visualisasi 3D Kantor Desa Lolosoni berarsitektur modern dengan sentuhan atap adat Nias (Omo Sebua), bendera Merah Putih berkibar, batu megalitikum Gomo, pepohonan lanskap, dan dokumen digital terapung.
   - Pilihan pencahayaan Siang, Senja, dan Malam Digital.
   - Mode 2D Fallback untuk perangkat hemat daya.
2. **Sistem 4 Hak Akses (Multi-Role):**
   - **Administrator / Kepala Desa:** Statistik real-time, persetujuan naskah surat resmi dinas, konfigurasi layanan, log audit, export SQL schema.
   - **Sekretaris Desa:** Verifikasi kelengkapan berkas, nomor surat resmi dinas, penerusan surat ke Kades.
   - **Perangkat Desa (Kaur Pelayanan):** Pemeriksaan berkas masuk, catatan perbaikan bagi warga.
   - **Masyarakat (Warga):** Pendaftaran akun, pengajuan layanan online, unggah dokumen, pelacakan real-time, unduh surat resmi ber-QR Code.
3. **Katalog 9 Layanan Administrasi Kependudukan:**
   - Surat Keterangan Domisili
   - Surat Pengantar KTP / Kartu Keluarga
   - Surat Keterangan Usaha (SKU)
   - Surat Keterangan Tidak Mampu (SKTM)
   - Surat Keterangan Kelahiran
   - Surat Keterangan Kematian
   - Surat Pengantar Nikah (N1-N4)
   - Surat Keterangan Belum Menikah
   - Pengajuan Surat Keterangan Lainnya
4. **Naskah Dinas & Cetak Surat Standar Kemendagri:**
   - Kop Surat resmi Pemerintah Desa Lolosoni, Kecamatan Gomo, Kabupaten Nias Selatan.
   - Penomoran dinas terstandar (contoh: `470/012/D-LSN/GM/2026`).
   - QR Code verifikasi dokumen dan stempel dinas resmi (dapat dicetak langsung ke printer atau PDF).
5. **Brand Bible & Generator Identitas Visual Desa:**
   - Logo primer, stempel dinas sekunder, palet 5-warna resmi, dan Google Font pairings.
   - Generator gambar resolusi tinggi (1K, 2K, 4K) berbasis **Gemini AI (`gemini-3-pro-image`)**.
6. **Asisten AI Cerdas SIPADLO (Gemini 3.8 Flash):**
   - Chatbot multi-turn ramah berbahasa Indonesia & salam khas Ono Niha (*Ya'ahowu*) untuk membantu warga mengetahui syarat berkas dan merumuskan kalimat keperluan surat dinas.
7. **Skema Database Relasional Lengkap:**
   - File `server/schema.sql` siap deploy untuk MySQL 8.0+ atau PostgreSQL.

---

## 🔑 Akun Demo (1-Click Switcher Tersedia di Bilah Atas Aplikasi)
| Peran (Role) | Nama Pejabat / Warga | Email Login | Kata Sandi |
|---|---|---|---|
| **Kepala Desa (Admin)** | Ya'atulo Hia | `kades@lolosoni.desa.id` | `admin123` |
| **Sekretaris Desa** | Faomakhoda Telambanua, S.AP | `sekdes@lolosoni.desa.id` | `sekdes123` |
| **Kaur Pelayanan** | Yulianus Lase | `perangkat@lolosoni.desa.id` | `perangkat123` |
| **Masyarakat / Warga** | Bezisokhi Hia | `warga@lolosoni.desa.id` | `warga123` |
| **Masyarakat 2** | Sarinah Zagoto | `sarinah@lolosoni.desa.id` | `warga123` |

---

## 🚀 Menjalankan Aplikasi Secara Mandiri
1. Pasang dependensi:
   ```bash
   npm install
   ```
2. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
3. Buka peramban pada alamat `http://localhost:3000`.

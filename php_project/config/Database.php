<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Kelas Koneksi Database MySQL Berorientasi Objek (PDO)
 * File: config/Database.php
 */

class Database {
    private string $host = "localhost";
    private string $db_name = "sipadlo_lolosoni";
    private string $username = "root";
    private string $password = "";
    private ?PDO $conn = null;

    /**
     * Mendapatkan koneksi PDO ke database MySQL
     * @return PDO|null
     */
    public function getConnection(): ?PDO {
        if ($this->conn !== null) {
            return $this->conn;
        }

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $exception) {
            // Tampilkan pesan error ramah
            die("Koneksi Database Gagal: " . htmlspecialchars($exception->getMessage()));
        }

        return $this->conn;
    }
}
?>

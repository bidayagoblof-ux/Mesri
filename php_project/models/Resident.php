<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Kelas Model Penduduk (Resident Model - OOP)
 * File: models/Resident.php
 */

require_once __DIR__ . '/../config/Database.php';

class Resident {
    private ?PDO $conn;
    private string $table_name = "residents";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Mencari data penduduk berdasarkan NIK 16 digit
     */
    public function findByNik(string $nik): ?array {
        $query = "SELECT * FROM " . $this->table_name . " WHERE nik = :nik LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':nik' => $nik]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Mengambil daftar penduduk dengan opsi pencarian nama / dusun
     */
    public function getAll(?string $keyword = null, int $limit = 50): array {
        $query = "SELECT * FROM " . $this->table_name;
        $params = [];

        if (!empty($keyword)) {
            $query .= " WHERE full_name LIKE :kw OR nik LIKE :kw OR address_dusun LIKE :kw";
            $params[':kw'] = '%' . $keyword . '%';
        }

        $query .= " ORDER BY full_name ASC LIMIT " . (int)$limit;
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Menghitung total penduduk desa terdaftar
     */
    public function countTotal(): int {
        $stmt = $this->conn->query("SELECT COUNT(*) as total FROM " . $this->table_name);
        $res = $stmt->fetch();
        return (int)($res['total'] ?? 0);
    }
}
?>

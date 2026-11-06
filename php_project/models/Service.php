<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Kelas Model Layanan Administrasi (Service Model - OOP)
 * File: models/Service.php
 */

require_once __DIR__ . '/../config/Database.php';

class Service {
    private ?PDO $conn;
    private string $table_name = "services";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Mengambil seluruh daftar layanan administrasi aktif
     */
    public function getAll(bool $onlyActive = true): array {
        $query = "SELECT * FROM " . $this->table_name;
        if ($onlyActive) {
            $query .= " WHERE is_active = 1";
        }
        $query .= " ORDER BY name ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Mengambil data layanan berdasarkan ID
     */
    public function getById(string $id): ?array {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':id' => $id]);
        $service = $stmt->fetch();
        return $service ?: null;
    }

    /**
     * Mengambil layanan berdasarkan kode unik (misal: 'SKD', 'SKU')
     */
    public function getByCode(string $code): ?array {
        $query = "SELECT * FROM " . $this->table_name . " WHERE code = :code LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':code' => $code]);
        $service = $stmt->fetch();
        return $service ?: null;
    }

    /**
     * Menambahkan layanan administrasi baru (Akses Kades / Administrator)
     */
    public function create(array $data): bool {
        $query = "INSERT INTO " . $this->table_name . " 
                  (id, code, name, category, description, processing_days, responsible_role, approval_role, letter_code_prefix, is_active)
                  VALUES (:id, :code, :name, :category, :description, :processing_days, :responsible_role, :approval_role, :letter_code_prefix, :is_active)";
        
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            ':id' => $data['id'] ?? ('srv_' . strtolower($data['code'])),
            ':code' => strtoupper($data['code']),
            ':name' => $data['name'],
            ':category' => $data['category'] ?? 'Umum',
            ':description' => $data['description'] ?? '',
            ':processing_days' => $data['processing_days'] ?? 1,
            ':responsible_role' => $data['responsible_role'] ?? 'perangkat',
            ':approval_role' => $data['approval_role'] ?? 'kades',
            ':letter_code_prefix' => $data['letter_code_prefix'] ?? '470',
            ':is_active' => $data['is_active'] ?? 1
        ]);
    }
}
?>

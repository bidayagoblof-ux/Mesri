<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Kelas Model Permohonan Administrasi (Application Model - OOP)
 * File: models/Application.php
 */

require_once __DIR__ . '/../config/Database.php';

class Application {
    private ?PDO $conn;
    private string $table_name = "applications";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Mengambil daftar permohonan dengan filter peran & status
     */
    public function getAll(?string $userId = null, ?string $role = null, ?string $status = null): array {
        $query = "SELECT a.*, s.name as service_name, s.code as service_code, s.category as service_category,
                         s.processing_days, u.full_name as user_full_name, u.email as user_email
                  FROM " . $this->table_name . " a
                  JOIN services s ON a.service_id = s.id
                  JOIN users u ON a.applicant_user_id = u.id";
        
        $where = [];
        $params = [];

        // Jika masyarakat, batasi hanya permohonan miliknya sendiri
        if ($role === 'masyarakat' && $userId) {
            $where[] = "a.applicant_user_id = :userId";
            $params[':userId'] = $userId;
        }

        if (!empty($status)) {
            $where[] = "a.status = :status";
            $params[':status'] = $status;
        }

        if (!empty($where)) {
            $query .= " WHERE " . implode(" AND ", $where);
        }

        $query .= " ORDER BY a.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Mengambil detail permohonan berdasarkan ID
     */
    public function getById(string $id): ?array {
        $query = "SELECT a.*, s.name as service_name, s.code as service_code, s.letter_code_prefix,
                         u.full_name as user_full_name, u.email as user_email, u.phone as user_phone, u.dusun
                  FROM " . $this->table_name . " a
                  JOIN services s ON a.service_id = s.id
                  JOIN users u ON a.applicant_user_id = u.id
                  WHERE a.id = :id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([':id' => $id]);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    /**
     * Lacak permohonan berdasarkan Nomor Registrasi publik
     */
    public function trackByRegistrationNumber(string $regNumber): ?array {
        $query = "SELECT a.*, s.name as service_name, s.code as service_code,
                         l.letter_number, l.letter_date, l.qr_verification_code
                  FROM " . $this->table_name . " a
                  JOIN services s ON a.service_id = s.id
                  LEFT JOIN letters l ON l.application_id = a.id
                  WHERE a.registration_number = :regNumber OR a.applicant_nik = :regNumber
                  ORDER BY a.created_at DESC LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([':regNumber' => trim($regNumber)]);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    /**
     * Membuat permohonan administrasi baru oleh masyarakat
     */
    public function create(array $data): array {
        $id = "app_" . time() . "_" . bin2hex(random_bytes(3));
        $regNumber = "REG-" . date('Ymd') . "-" . strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));

        $query = "INSERT INTO " . $this->table_name . "
                  (id, registration_number, service_id, applicant_user_id, applicant_nik, applicant_name, applicant_phone, purpose, status)
                  VALUES (:id, :regNumber, :serviceId, :userId, :nik, :name, :phone, :purpose, 'diajukan')";

        $stmt = $this->conn->prepare($query);
        $success = $stmt->execute([
            ':id' => $id,
            ':regNumber' => $regNumber,
            ':serviceId' => $data['service_id'],
            ':userId' => $data['applicant_user_id'],
            ':nik' => $data['applicant_nik'],
            ':name' => $data['applicant_name'],
            ':phone' => $data['applicant_phone'] ?? null,
            ':purpose' => $data['purpose']
        ]);

        return $success 
            ? ['success' => true, 'id' => $id, 'registration_number' => $regNumber] 
            : ['success' => false, 'error' => 'Gagal menyimpan permohonan ke database.'];
    }

    /**
     * Memperbarui status permohonan administrasi
     */
    public function updateStatus(string $id, string $newStatus, ?string $officerNotes = null): bool {
        $query = "UPDATE " . $this->table_name . " 
                  SET status = :status, officer_notes = :notes 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            ':status' => $newStatus,
            ':notes' => $officerNotes,
            ':id' => $id
        ]);
    }

    /**
     * Menghitung ringkasan statistik permohonan
     */
    public function getSummaryStats(): array {
        $stmt = $this->conn->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('diajukan', 'menunggu_pemeriksaan') THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status IN ('diproses', 'terverifikasi', 'menunggu_persetujuan') THEN 1 ELSE 0 END) as processing,
                SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) as rejected
            FROM " . $this->table_name
        );
        $stats = $stmt->fetch();
        return [
            'total' => (int)($stats['total'] ?? 0),
            'pending' => (int)($stats['pending'] ?? 0),
            'processing' => (int)($stats['processing'] ?? 0),
            'completed' => (int)($stats['completed'] ?? 0),
            'rejected' => (int)($stats['rejected'] ?? 0),
        ];
    }

    /**
     * Data bulanan untuk grafik Recharts / Chart.js
     * Mengembalikan data tren: diajukan, diproses, selesai per bulan
     */
    public function getMonthlyTrends(int $months = 6): array {
        $query = "
            SELECT 
                DATE_FORMAT(created_at, '%b %Y') as month_label,
                DATE_FORMAT(created_at, '%Y-%m') as sort_key,
                COUNT(*) as total_submitted,
                SUM(CASE WHEN status IN ('diproses', 'terverifikasi', 'menunggu_persetujuan') THEN 1 ELSE 0 END) as total_processed,
                SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as total_completed
            FROM " . $this->table_name . "
            GROUP BY sort_key, month_label
            ORDER BY sort_key DESC
            LIMIT " . (int)$months;

        $stmt = $this->conn->query($query);
        $results = $stmt->fetchAll();
        return array_reverse($results);
    }
}
?>

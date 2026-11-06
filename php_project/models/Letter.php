<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Kelas Model Surat & Pengarsipan (Letter Model - OOP)
 * File: models/Letter.php
 */

require_once __DIR__ . '/../config/Database.php';

class Letter {
    private ?PDO $conn;
    private string $table_name = "letters";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Mengambil surat berdasarkan ID
     */
    public function getById(string $id): ?array {
        $query = "SELECT l.*, s.name as service_name, s.code as service_code,
                         a.registration_number, a.purpose as app_purpose
                  FROM " . $this->table_name . " l
                  JOIN services s ON l.service_id = s.id
                  JOIN applications a ON l.application_id = a.id
                  WHERE l.id = :id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([':id' => $id]);
        $letter = $stmt->fetch();
        return $letter ?: null;
    }

    /**
     * Mengambil surat berdasarkan ID Permohonan
     */
    public function getByApplicationId(string $appId): ?array {
        $query = "SELECT l.*, s.name as service_name, s.code as service_code
                  FROM " . $this->table_name . " l
                  JOIN services s ON l.service_id = s.id
                  WHERE l.application_id = :appId LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([':appId' => $appId]);
        $letter = $stmt->fetch();
        return $letter ?: null;
    }

    /**
     * Menghasilkan nomor surat dinas resmi standar Desa Lolosoni
     * Format: [Kode Klasifikasi] / [Nomor Urut 3 digit] / PEM-LLS / [Tahun]
     * Contoh: 470/024/PEM-LLS/2026
     */
    public function generateLetterNumber(string $prefixCode): string {
        $year = date('Y');
        $stmt = $this->conn->query("SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE YEAR(created_at) = '$year'");
        $count = (int)($stmt->fetch()['count'] ?? 0) + 1;
        $order = str_pad((string)$count, 3, '0', STR_PAD_LEFT);
        return "{$prefixCode}/{$order}/PEM-LLS/{$year}";
    }

    /**
     * Menerbitkan dan mengarsipkan surat resmi dari permohonan yang telah disetujui Kades
     */
    public function issueLetter(array $appData, array $residentData, string $signatoryName = "Ya'atulo Hia", string $signatoryRole = "Kepala Desa Lolosoni"): array {
        // Cek jika surat sudah pernah diterbitkan untuk permohonan ini
        $existing = $this->getByApplicationId($appData['id']);
        if ($existing) {
            return ['success' => true, 'letter' => $existing];
        }

        $letterId = "ltr_" . time() . "_" . bin2hex(random_bytes(3));
        $prefix = $appData['letter_code_prefix'] ?? '470';
        $letterNumber = $this->generateLetterNumber($prefix);
        $qrCode = "SIPADLO-" . strtoupper(bin2hex(random_bytes(6))) . "-VERIFIED";
        $today = date('Y-m-d');

        $birthInfo = ($residentData['birth_place'] ?? 'Lolosoni') . ", " . ($residentData['birth_date'] ?? '1990-01-01');
        $address = ($residentData['address_dusun'] ?? 'Dusun I Bawonahono') . ", RT/RW " . ($residentData['rt_rw'] ?? '001/001') . ", Desa Lolosoni, Kec. Gomo, Kab. Nias Selatan";

        $bodyText = "Yang bertanda tangan di bawah ini Kepala Desa Lolosoni, Kecamatan Gomo, Kabupaten Nias Selatan, menerangkan dengan sebenarnya bahwa orang tersebut di atas adalah benar penduduk/warga sah yang berdomisili di Desa Lolosoni. Surat keterangan ini diterbitkan dengan sebenarnya untuk keperluan: " . $appData['purpose'] . ".";

        $query = "INSERT INTO " . $this->table_name . "
                  (id, letter_number, application_id, service_id, recipient_nik, recipient_name, recipient_address, 
                   recipient_birth, recipient_occupation, purpose, letter_date, signatory_name, signatory_role, qr_verification_code, content_body)
                  VALUES 
                  (:id, :letterNumber, :appId, :serviceId, :nik, :name, :address, 
                   :birth, :occupation, :purpose, :letterDate, :signatoryName, :signatoryRole, :qrCode, :body)";

        $stmt = $this->conn->prepare($query);
        $success = $stmt->execute([
            ':id' => $letterId,
            ':letterNumber' => $letterNumber,
            ':appId' => $appData['id'],
            ':serviceId' => $appData['service_id'],
            ':nik' => $appData['applicant_nik'],
            ':name' => $appData['applicant_name'],
            ':address' => $address,
            ':birth' => $birthInfo,
            ':occupation' => $residentData['occupation'] ?? 'Wiraswasta',
            ':purpose' => $appData['purpose'],
            ':letterDate' => $today,
            ':signatoryName' => $signatoryName,
            ':signatoryRole' => $signatoryRole,
            ':qrCode' => $qrCode,
            ':body' => $bodyText
        ]);

        if ($success) {
            // Update status permohonan menjadi 'selesai'
            $updateApp = "UPDATE applications SET status = 'selesai' WHERE id = :appId";
            $stmtUp = $this->conn->prepare($updateApp);
            $stmtUp->execute([':appId' => $appData['id']]);

            return [
                'success' => true,
                'letter_id' => $letterId,
                'letter_number' => $letterNumber,
                'qr_code' => $qrCode
            ];
        }

        return ['success' => false, 'error' => 'Gagal menerbitkan surat resmi.'];
    }

    /**
     * Mengambil semua arsip surat
     */
    public function getAll(int $limit = 100): array {
        $query = "SELECT l.*, s.name as service_name 
                  FROM " . $this->table_name . " l
                  JOIN services s ON l.service_id = s.id
                  ORDER BY l.created_at DESC LIMIT " . (int)$limit;
        $stmt = $this->conn->query($query);
        return $stmt->fetchAll();
    }
}
?>

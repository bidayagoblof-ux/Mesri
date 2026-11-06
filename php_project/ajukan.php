<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Formulir Pengajuan Permohonan Surat Online
 * File: ajukan.php
 */

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/models/Service.php';
require_once __DIR__ . '/models/Application.php';
require_once __DIR__ . '/models/Resident.php';

session_start();
$currentUser = $_SESSION['user'] ?? null;

$serviceModel = new Service();
$appModel = new Application();
$residentModel = new Resident();

$services = $serviceModel->getAll();
$selectedServiceId = $_GET['service_id'] ?? ($services[0]['id'] ?? '');

$error = null;
$success = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $serviceId = $_POST['service_id'] ?? '';
    $nik = trim($_POST['applicant_nik'] ?? '');
    $name = trim($_POST['applicant_name'] ?? '');
    $phone = trim($_POST['applicant_phone'] ?? '');
    $purpose = trim($_POST['purpose'] ?? '');

    if (empty($serviceId) || empty($nik) || empty($name) || empty($purpose)) {
        $error = "Mohon lengkapi semua kolom formulir bertanda bintang (*).";
    } elseif (strlen($nik) !== 16 || !ctype_digit($nik)) {
        $error = "NIK harus terdiri dari 16 digit angka kependudukan yang sah.";
    } else {
        // Ambil User ID (jika login, pakai ID pengguna; jika tidak, pakai user warga umum/default)
        $userId = $currentUser ? $currentUser['id'] : 'usr_warga_1';

        $data = [
            'service_id' => $serviceId,
            'applicant_user_id' => $userId,
            'applicant_nik' => $nik,
            'applicant_name' => $name,
            'applicant_phone' => $phone,
            'purpose' => $purpose
        ];

        $res = $appModel->create($data);
        if ($res['success']) {
            $success = [
                'reg_number' => $res['registration_number'],
                'service_id' => $serviceId,
                'name' => $name
            ];
        } else {
            $error = $res['error'] ?? 'Gagal menyimpan permohonan.';
        }
    }
}

$pageTitle = "Formulir Pengajuan Surat";
require_once __DIR__ . '/includes/header.php';
?>

<div class="py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
    <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div class="border-b border-slate-200 pb-5 mb-6">
            <span class="text-xs font-bold text-blue-600 uppercase tracking-widest">Pelayanan Online Mandiri</span>
            <h1 class="text-2xl font-extrabold text-slate-800 mt-1">Pengajuan Surat Keterangan Desa</h1>
            <p class="text-xs text-slate-500 mt-1">Silakan isi formulir dengan data yang valid dan dapat dipertanggungjawabkan.</p>
        </div>

        <?php if ($error): ?>
            <div class="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <i class="fa-solid fa-circle-exclamation text-red-500"></i>
                <span><?= htmlspecialchars($error) ?></span>
            </div>
        <?php endif; ?>

        <?php if ($success): ?>
            <div class="mb-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center">
                <div class="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 text-xl">
                    <i class="fa-solid fa-check"></i>
                </div>
                <h3 class="text-lg font-bold text-emerald-900">Permohonan Berhasil Dikirimkan!</h3>
                <p class="text-xs text-emerald-700 mt-1">Nomor Registrasi resmi Anda:</p>
                <div class="text-2xl font-mono font-extrabold text-emerald-950 my-3 tracking-wider bg-emerald-100/70 py-2 px-4 rounded-xl inline-block border border-emerald-300">
                    <?= htmlspecialchars($success['reg_number']) ?>
                </div>
                <p class="text-xs text-emerald-700 max-w-md mx-auto">
                    Simpan nomor ini untuk melacak proses penerbitan surat. Petugas Kaur Pelayanan dan Sekdes Desa Lolosoni akan segera memproses berkas Anda.
                </p>

                <div class="mt-6 flex flex-wrap justify-center gap-3">
                    <a href="index.php?track=<?= urlencode($success['reg_number']) ?>#lacak" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm">
                        <i class="fa-solid fa-magnifying-glass mr-1"></i> Lacak Permohonan
                    </a>
                    <a href="dashboard.php" class="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 font-bold text-xs transition">
                        Buka Dashboard
                    </a>
                </div>
            </div>
        <?php else: ?>

        <form method="POST" action="ajukan.php" class="space-y-5">
            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Pilih Jenis Layanan Administrasi *
                </label>
                <select name="service_id" required class="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm bg-white font-medium">
                    <?php foreach ($services as $srv): ?>
                        <option value="<?= htmlspecialchars($srv['id']) ?>" <?= $srv['id'] === $selectedServiceId ? 'selected' : '' ?>>
                            [<?= htmlspecialchars($srv['code']) ?>] <?= htmlspecialchars($srv['name']) ?> (Est. <?= $srv['processing_days'] ?> Hari)
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        NIK Pemohon (16 Digit) *
                    </label>
                    <input type="text" name="applicant_nik" maxlength="16" required placeholder="Contoh: 12140815..." 
                           value="<?= htmlspecialchars($currentUser['nik'] ?? $_POST['applicant_nik'] ?? '') ?>"
                           class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm font-mono">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nama Lengkap Sesuai KTP *
                    </label>
                    <input type="text" name="applicant_name" required placeholder="Nama Lengkap" 
                           value="<?= htmlspecialchars($currentUser['full_name'] ?? $_POST['applicant_name'] ?? '') ?>"
                           class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm">
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp / HP yang Dapat Dihubungi
                </label>
                <input type="text" name="applicant_phone" placeholder="Contoh: 08126500xxxx" 
                       value="<?= htmlspecialchars($currentUser['phone'] ?? $_POST['applicant_phone'] ?? '') ?>"
                       class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm">
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Keperluan / Keterangan Tambahan *
                </label>
                <textarea name="purpose" rows="4" required placeholder="Jelaskan secara rinci untuk apa surat ini diajukan (contoh: Untuk pengajuan beasiswa kuliah di Universitas, pembuatan rekening tabungan bank, kelengkapan berkas lamaran kerja, dsb.)"
                          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm"><?= htmlspecialchars($_POST['purpose'] ?? '') ?></textarea>
            </div>

            <div class="pt-2">
                <button type="submit" class="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2">
                    <i class="fa-solid fa-paper-plane"></i> Kirim Permohonan Administrasi
                </button>
            </div>
        </form>

        <?php endif; ?>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

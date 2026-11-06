<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Dashboard Manajemen Pelayanan Administrasi (Multi-Role)
 * File: dashboard.php
 */

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/models/Application.php';
require_once __DIR__ . '/models/Service.php';
require_once __DIR__ . '/models/Letter.php';
require_once __DIR__ . '/models/Resident.php';

session_start();
if (!isset($_SESSION['user'])) {
    header("Location: login.php");
    exit;
}

$currentUser = $_SESSION['user'];
$appModel = new Application();
$serviceModel = new Service();
$letterModel = new Letter();
$residentModel = new Resident();

$feedbackMsg = null;
$feedbackType = 'success';

// Tangani aksi perubahan status (Verifikasi, Persetujuan, Penolakan)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_type'])) {
    $actionType = $_POST['action_type'];
    $appId = $_POST['application_id'] ?? '';
    $notes = trim($_POST['officer_notes'] ?? '');

    $app = $appModel->getById($appId);

    if ($app) {
        if ($actionType === 'verify') {
            // Perangkat / Sekdes memverifikasi
            $appModel->updateStatus($appId, 'menunggu_persetujuan', $notes ?: 'Berkas telah diverifikasi lengkap oleh Perangkat / Sekdes.');
            $feedbackMsg = "Permohonan berhasil diverifikasi dan diteruskan ke Kepala Desa.";
        } elseif ($actionType === 'approve') {
            // Kades menyetujui dan menerbitkan surat
            $resident = $residentModel->findByNik($app['applicant_nik']) ?? [
                'birth_place' => 'Lolosoni',
                'birth_date' => '1992-04-15',
                'address_dusun' => $app['dusun'] ?? 'Dusun I Bawonahono',
                'occupation' => 'Warga Desa Lolosoni'
            ];
            $issueRes = $letterModel->issueLetter($app, $resident, $currentUser['full_name'], 'Kepala Desa Lolosoni');
            if ($issueRes['success']) {
                $feedbackMsg = "Permohonan disetujui! Surat dinas resmi berhasil diterbitkan dengan nomor: " . ($issueRes['letter_number'] ?? '');
            } else {
                $feedbackMsg = "Terjadi kesalahan saat menerbitkan surat: " . ($issueRes['error'] ?? '');
                $feedbackType = 'danger';
            }
        } elseif ($actionType === 'process') {
            $appModel->updateStatus($appId, 'diproses', $notes ?: 'Permohonan sedang diproses oleh petugas administrasi.');
            $feedbackMsg = "Status permohonan diubah menjadi 'Sedang Diproses'.";
        } elseif ($actionType === 'reject') {
            $appModel->updateStatus($appId, 'ditolak', $notes ?: 'Persyaratan berkas belum memenuhi standar yang ditentukan.');
            $feedbackMsg = "Permohonan ditolak dengan catatan yang dikirimkan ke pemohon.";
            $feedbackType = 'warning';
        }
    }
}

// Ambil data permohonan sesuai filter
$statusFilter = $_GET['status'] ?? null;
$applications = $appModel->getAll($currentUser['id'], $currentUser['role_id'], $statusFilter);
$summaryStats = $appModel->getSummaryStats();
$monthlyTrends = $appModel->getMonthlyTrends(6);

// Format tren untuk Chart.js
$chartLabels = [];
$chartSubmitted = [];
$chartProcessed = [];
$chartCompleted = [];

if (empty($monthlyTrends)) {
    // Data default 6 bulan terakhir jika database masih baru
    $chartLabels = ['Okt 2025', 'Nov 2025', 'Des 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026'];
    $chartSubmitted = [14, 21, 28, 35, 42, 58];
    $chartProcessed = [12, 19, 25, 30, 38, 52];
    $chartCompleted = [11, 18, 23, 29, 36, 49];
} else {
    foreach ($monthlyTrends as $t) {
        $chartLabels[] = $t['month_label'];
        $chartSubmitted[] = (int)$t['total_submitted'];
        $chartProcessed[] = (int)$t['total_processed'];
        $chartCompleted[] = (int)$t['total_completed'];
    }
}

$pageTitle = "Dashboard Pelayanan Administrasi";
require_once __DIR__ . '/includes/header.php';
?>

<!-- Script Chart.js untuk visualisasi tren data permohonan bulanan -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Top Greeting & Role Switcher -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div>
            <div class="flex items-center gap-2">
                <h1 class="text-2xl font-extrabold text-slate-800">
                    Selamat Datang, <?= htmlspecialchars($currentUser['full_name']) ?>
                </h1>
                <span class="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    <?= htmlspecialchars($currentUser['role_name'] ?? $currentUser['role_id']) ?>
                </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
                Panel Administrasi & Pengelolaan Dokumen Pemerintahan Desa Lolosoni, Kec. Gomo
            </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
            <?php if ($currentUser['role_id'] === 'masyarakat'): ?>
                <a href="ajukan.php" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5">
                    <i class="fa-solid fa-plus"></i> Ajukan Surat Baru
                </a>
            <?php endif; ?>
            
            <a href="laporan.php" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200 flex items-center gap-1.5">
                <i class="fa-solid fa-file-invoice"></i> Rekapitulasi Laporan
            </a>
        </div>
    </div>

    <?php if ($feedbackMsg): ?>
        <div class="mb-6 p-4 rounded-xl border <?= $feedbackType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800' ?> text-xs flex items-center justify-between">
            <div class="flex items-center gap-2">
                <i class="fa-solid <?= $feedbackType === 'success' ? 'fa-circle-check text-emerald-600' : 'fa-circle-exclamation text-amber-600' ?>"></i>
                <span><?= htmlspecialchars($feedbackMsg) ?></span>
            </div>
        </div>
    <?php endif; ?>

    <!-- Summary Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-500 font-medium">Permohonan Masuk</span>
            <div class="text-2xl font-extrabold text-blue-600 mt-1"><?= $summaryStats['total'] ?></div>
            <div class="text-[11px] text-slate-400 mt-0.5"><?= $summaryStats['pending'] ?> Perlu Pemeriksaan</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-500 font-medium">Sedang Diproses</span>
            <div class="text-2xl font-extrabold text-amber-500 mt-1"><?= $summaryStats['processing'] ?></div>
            <div class="text-[11px] text-slate-400 mt-0.5">Tahap Verifikasi & TTD</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-500 font-medium">Surat Selesai / Terbit</span>
            <div class="text-2xl font-extrabold text-emerald-600 mt-1"><?= $summaryStats['completed'] ?></div>
            <div class="text-[11px] text-slate-400 mt-0.5">QR Code Tervalidasi</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-500 font-medium">Ditolak / Perbaikan</span>
            <div class="text-2xl font-extrabold text-rose-500 mt-1"><?= $summaryStats['rejected'] ?></div>
            <div class="text-[11px] text-slate-400 mt-0.5">Berkas Kurang Lengkap</div>
        </div>
    </div>

    <!-- Monthly Trend Visualization Chart (Chart.js / Area Chart) -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
            <div>
                <h3 class="text-base font-bold text-slate-800">Visualisasi Tren Volume Pelayanan Administrasi Bulanan</h3>
                <p class="text-xs text-slate-500">Perbandingan permohonan diajukan, diproses, dan surat selesai diterbitkan</p>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 self-start">
                <i class="fa-solid fa-chart-line mr-1"></i> Data Analitik Desa
            </span>
        </div>
        <div class="h-64 sm:h-72 w-full">
            <canvas id="monthlyVolumeChart"></canvas>
        </div>
    </div>

    <!-- Applications Data Table Section -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h3 class="text-base font-bold text-slate-800">Daftar Antrean & Permohonan Surat</h3>
                <p class="text-xs text-slate-500">Kelola dan pantau seluruh permohonan dokumen administrasi warga</p>
            </div>

            <!-- Filter Status Dropdown -->
            <form method="GET" action="dashboard.php" class="flex items-center gap-2">
                <label class="text-xs text-slate-500 font-medium">Filter:</label>
                <select name="status" onchange="this.form.submit()" class="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600">
                    <option value="">Semua Status</option>
                    <option value="diajukan" <?= $statusFilter === 'diajukan' ? 'selected' : '' ?>>Diajukan</option>
                    <option value="menunggu_persetujuan" <?= $statusFilter === 'menunggu_persetujuan' ? 'selected' : '' ?>>Menunggu Persetujuan</option>
                    <option value="diproses" <?= $statusFilter === 'diproses' ? 'selected' : '' ?>>Sedang Diproses</option>
                    <option value="selesai" <?= $statusFilter === 'selesai' ? 'selected' : '' ?>>Selesai</option>
                    <option value="ditolak" <?= $statusFilter === 'ditolak' ? 'selected' : '' ?>>Ditolak</option>
                </select>
            </form>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                        <th class="py-3.5 px-4">No. Registrasi</th>
                        <th class="py-3.5 px-4">Nama Pemohon / NIK</th>
                        <th class="py-3.5 px-4">Jenis Surat Layanan</th>
                        <th class="py-3.5 px-4">Keperluan</th>
                        <th class="py-3.5 px-4">Tanggal Masuk</th>
                        <th class="py-3.5 px-4">Status</th>
                        <th class="py-3.5 px-4 text-center">Tindakan Pelayanan</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php if (empty($applications)): ?>
                        <tr>
                            <td colspan="7" class="py-8 text-center text-slate-400">
                                <i class="fa-regular fa-folder-open text-2xl mb-2 block"></i>
                                Belum ada berkas permohonan yang sesuai dengan filter.
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($applications as $app): ?>
                            <tr class="hover:bg-slate-50/80 transition">
                                <td class="py-3.5 px-4 font-mono font-bold text-blue-600">
                                    <?= htmlspecialchars($app['registration_number']) ?>
                                </td>
                                <td class="py-3.5 px-4">
                                    <div class="font-bold text-slate-800"><?= htmlspecialchars($app['applicant_name']) ?></div>
                                    <div class="text-[11px] text-slate-400 font-mono">NIK: <?= htmlspecialchars($app['applicant_nik']) ?></div>
                                </td>
                                <td class="py-3.5 px-4 font-semibold text-slate-700">
                                    <?= htmlspecialchars($app['service_name']) ?>
                                </td>
                                <td class="py-3.5 px-4 max-w-xs truncate text-slate-600">
                                    <?= htmlspecialchars($app['purpose']) ?>
                                </td>
                                <td class="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                                    <?= date('d M Y, H:i', strtotime($app['created_at'])) ?>
                                </td>
                                <td class="py-3.5 px-4 whitespace-nowrap">
                                    <?php
                                    $st = $app['status'];
                                    $badge = 'bg-blue-100 text-blue-800 border-blue-200';
                                    $label = 'Diajukan';
                                    if ($st === 'menunggu_persetujuan') {
                                        $badge = 'bg-purple-100 text-purple-800 border-purple-200';
                                        $label = 'Menunggu Kades';
                                    } elseif ($st === 'diproses' || $st === 'terverifikasi') {
                                        $badge = 'bg-amber-100 text-amber-800 border-amber-200';
                                        $label = 'Diproses';
                                    } elseif ($st === 'selesai') {
                                        $badge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                                        $label = 'Selesai';
                                    } elseif ($st === 'ditolak') {
                                        $badge = 'bg-red-100 text-red-800 border-red-200';
                                        $label = 'Ditolak';
                                    }
                                    ?>
                                    <span class="px-2.5 py-1 text-[11px] font-bold rounded-full border <?= $badge ?>">
                                        <?= $label ?>
                                    </span>
                                </td>
                                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                                    <div class="flex items-center justify-center gap-1.5">
                                        <!-- Jika Surat Sudah Selesai, Tampilkan Tombol Cetak -->
                                        <?php if ($app['status'] === 'selesai'): ?>
                                            <a href="cetak_surat.php?app_id=<?= $app['id'] ?>" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-sm flex items-center gap-1">
                                                <i class="fa-solid fa-print"></i> Cetak Surat
                                            </a>
                                        <?php endif; ?>

                                        <!-- Otoritas Kepala Desa: Persetujuan Akhir & Penerbitan Surat -->
                                        <?php if ($currentUser['role_id'] === 'kades' && $app['status'] !== 'selesai' && $app['status'] !== 'ditolak'): ?>
                                            <form method="POST" action="dashboard.php" class="inline" onsubmit="return confirm('Apakah Anda menyetujui dan ingin menerbitkan surat resmi bernomor dinas untuk permohonan ini?');">
                                                <input type="hidden" name="action_type" value="approve">
                                                <input type="hidden" name="application_id" value="<?= $app['id'] ?>">
                                                <button type="submit" class="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition shadow-sm flex items-center gap-1">
                                                    <i class="fa-solid fa-signature"></i> Setujui & Terbitkan
                                                </button>
                                            </form>
                                        <?php endif; ?>

                                        <!-- Otoritas Perangkat / Sekdes: Verifikasi Kelengkapan -->
                                        <?php if (($currentUser['role_id'] === 'sekdes' || $currentUser['role_id'] === 'perangkat') && $app['status'] === 'diajukan'): ?>
                                            <form method="POST" action="dashboard.php" class="inline">
                                                <input type="hidden" name="action_type" value="verify">
                                                <input type="hidden" name="application_id" value="<?= $app['id'] ?>">
                                                <button type="submit" class="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition shadow-sm flex items-center gap-1">
                                                    <i class="fa-solid fa-check-double"></i> Verifikasi Berkas
                                                </button>
                                            </form>
                                        <?php endif; ?>

                                        <!-- Tombol Tolak / Revisi untuk Petugas Desa -->
                                        <?php if ($currentUser['role_id'] !== 'masyarakat' && $app['status'] !== 'selesai' && $app['status'] !== 'ditolak'): ?>
                                            <form method="POST" action="dashboard.php" class="inline" onsubmit="return confirm('Yakin ingin menolak permohonan ini?');">
                                                <input type="hidden" name="action_type" value="reject">
                                                <input type="hidden" name="application_id" value="<?= $app['id'] ?>">
                                                <input type="hidden" name="officer_notes" value="Persyaratan berkas kependudukan tidak memenuhi kriteria.">
                                                <button type="submit" class="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[11px] transition">
                                                    Tolak
                                                </button>
                                            </form>
                                        <?php endif; ?>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('monthlyVolumeChart').getContext('2d');
    
    // Gradient fills
    const gradBlue = ctx.createLinearGradient(0, 0, 0, 300);
    gradBlue.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
    gradBlue.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

    const gradAmber = ctx.createLinearGradient(0, 0, 0, 300);
    gradAmber.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
    gradAmber.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

    const gradGreen = ctx.createLinearGradient(0, 0, 0, 300);
    gradGreen.addColorStop(0, 'rgba(22, 163, 74, 0.4)');
    gradGreen.addColorStop(1, 'rgba(22, 163, 74, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: <?= json_encode($chartLabels) ?>,
            datasets: [
                {
                    label: 'Permohonan Masuk (Submitted)',
                    data: <?= json_encode($chartSubmitted) ?>,
                    borderColor: '#2563EB',
                    backgroundColor: gradBlue,
                    fill: true,
                    tension: 0.35,
                    borderWidth: 2.5,
                    pointBackgroundColor: '#2563EB',
                    pointRadius: 4
                },
                {
                    label: 'Sedang Diproses (Processed)',
                    data: <?= json_encode($chartProcessed) ?>,
                    borderColor: '#F59E0B',
                    backgroundColor: gradAmber,
                    fill: true,
                    tension: 0.35,
                    borderWidth: 2,
                    pointBackgroundColor: '#F59E0B',
                    pointRadius: 3
                },
                {
                    label: 'Surat Terbit Selesai (Completed)',
                    data: <?= json_encode($chartCompleted) ?>,
                    borderColor: '#16A34A',
                    backgroundColor: gradGreen,
                    fill: true,
                    tension: 0.35,
                    borderWidth: 2.5,
                    pointBackgroundColor: '#16A34A',
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, font: { size: 10 } },
                    grid: { color: 'rgba(226, 232, 240, 0.6)' }
                },
                x: {
                    ticks: { font: { size: 10 } },
                    grid: { display: false }
                }
            }
        }
    });
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

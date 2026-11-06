<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Halaman Rekapitulasi Laporan Administrasi Pelayanan
 * File: laporan.php
 */

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/models/Application.php';
require_once __DIR__ . '/models/Letter.php';

session_start();
if (!isset($_SESSION['user'])) {
    header("Location: login.php");
    exit;
}

$currentUser = $_SESSION['user'];
$appModel = new Application();
$letterModel = new Letter();

$letters = $letterModel->getAll(200);
$summaryStats = $appModel->getSummaryStats();

$pageTitle = "Laporan Rekapitulasi Pelayanan";
require_once __DIR__ . '/includes/header.php';
?>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div>
            <h1 class="text-2xl font-extrabold text-slate-800">Laporan Rekapitulasi Pelayanan Desa</h1>
            <p class="text-xs text-slate-500 mt-1">Buku Register Dokumen & Arsip Surat Keluar Pemerintahan Desa Lolosoni</p>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 no-print">
                <i class="fa-solid fa-print"></i> Cetak Laporan Fisik
            </button>
            <a href="dashboard.php" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200 no-print">
                Kembali
            </a>
        </div>
    </div>

    <!-- Summary Box -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <span class="text-xs text-slate-400">Total Permohonan</span>
            <div class="text-2xl font-extrabold text-slate-800 mt-1"><?= $summaryStats['total'] ?></div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <span class="text-xs text-slate-400">Surat Diterbitkan</span>
            <div class="text-2xl font-extrabold text-emerald-600 mt-1"><?= $summaryStats['completed'] ?></div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <span class="text-xs text-slate-400">Dalam Proses</span>
            <div class="text-2xl font-extrabold text-amber-500 mt-1"><?= $summaryStats['processing'] + $summaryStats['pending'] ?></div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <span class="text-xs text-slate-400">Ditolak</span>
            <div class="text-2xl font-extrabold text-rose-500 mt-1"><?= $summaryStats['rejected'] ?></div>
        </div>
    </div>

    <!-- Letter Register Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-200 font-bold text-sm text-slate-800">
            Buku Agenda & Register Surat Keluar Resmi
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                        <th class="py-3 px-4">No.</th>
                        <th class="py-3 px-4">Nomor Surat Dinas</th>
                        <th class="py-3 px-4">Tanggal Terbit</th>
                        <th class="py-3 px-4">Nama Pemohon (Warga)</th>
                        <th class="py-3 px-4">NIK</th>
                        <th class="py-3 px-4">Jenis Surat</th>
                        <th class="py-3 px-4">Keperluan</th>
                        <th class="py-3 px-4 text-center no-print">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php if (empty($letters)): ?>
                        <tr>
                            <td colspan="8" class="py-6 text-center text-slate-400">Belum ada arsip surat yang diterbitkan.</td>
                        </tr>
                    <?php else: ?>
                        <?php $no = 1; foreach ($letters as $l): ?>
                            <tr class="hover:bg-slate-50 transition">
                                <td class="py-3 px-4 font-bold text-slate-400"><?= $no++ ?></td>
                                <td class="py-3 px-4 font-mono font-bold text-blue-700"><?= htmlspecialchars($l['letter_number']) ?></td>
                                <td class="py-3 px-4 text-slate-600"><?= date('d/m/Y', strtotime($l['letter_date'])) ?></td>
                                <td class="py-3 px-4 font-bold text-slate-800"><?= htmlspecialchars($l['recipient_name']) ?></td>
                                <td class="py-3 px-4 font-mono text-slate-500"><?= htmlspecialchars($l['recipient_nik']) ?></td>
                                <td class="py-3 px-4 font-medium text-slate-700"><?= htmlspecialchars($l['service_name']) ?></td>
                                <td class="py-3 px-4 text-slate-600 max-w-xs truncate"><?= htmlspecialchars($l['purpose']) ?></td>
                                <td class="py-3 px-4 text-center no-print">
                                    <a href="cetak_surat.php?letter_id=<?= $l['id'] ?>" target="_blank" class="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold text-[11px] transition">
                                        <i class="fa-solid fa-print"></i> Cetak
                                    </a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

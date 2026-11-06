<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Halaman Utama Publik
 * File: index.php
 */

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/models/Service.php';
require_once __DIR__ . '/models/Application.php';
require_once __DIR__ . '/models/Resident.php';

$pageTitle = "Beranda Pelayanan Administrasi Desa";

$serviceModel = new Service();
$appModel = new Application();
$residentModel = new Resident();

$services = $serviceModel->getAll();
$stats = $appModel->getSummaryStats();
$totalResidents = $residentModel->countTotal();

// Tangani pelacakan surat via nomor registrasi
$trackResult = null;
$searched = false;
if (!empty($_GET['track'])) {
    $searched = true;
    $trackResult = $appModel->trackByRegistrationNumber($_GET['track']);
}

require_once __DIR__ . '/includes/header.php';
?>

<!-- Hero Section -->
<section class="relative bg-gradient-to-b from-navy-900 via-navy-900 to-navy-800 text-white overflow-hidden py-16 lg:py-24">
    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-7 space-y-6">
                <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-sky-300 text-xs font-semibold">
                    <span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                    Portal Resmi Pemerintah Desa Lolosoni, Kec. Gomo
                </div>
                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                    Pelayanan Administrasi Desa Kini Lebih <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">Mudah, Cepat, dan Transparan.</span>
                </h1>
                <p class="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                    Selamat datang di Sistem Informasi Pelayanan Administrasi Desa Lolosoni (SIPADLO). Ajukan permohonan surat keterangan, pantau proses secara real-time, dan unduh dokumen resmi ber-QR Code langsung dari rumah.
                </p>
                <div class="flex flex-wrap gap-4 pt-2">
                    <a href="#layanan" class="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg shadow-blue-600/30 flex items-center gap-2">
                        <i class="fa-solid fa-file-signature"></i> Ajukan Layanan Surat
                    </a>
                    <a href="#lacak" class="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-semibold transition flex items-center gap-2">
                        <i class="fa-solid fa-magnifying-glass"></i> Lacak Status Permohonan
                    </a>
                </div>
            </div>

            <!-- Stats Card Showcase -->
            <div class="lg:col-span-5">
                <div class="bg-navy-800/90 backdrop-blur-md p-6 rounded-2xl border border-navy-700 shadow-2xl space-y-4">
                    <div class="flex items-center justify-between border-b border-navy-700 pb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-blue-500/20 text-sky-400 flex items-center justify-center font-bold">
                                <i class="fa-solid fa-chart-pie"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-white text-sm">Statistik Pelayanan Terkini</h3>
                                <p class="text-xs text-slate-400">Data Realtime Desa Lolosoni</p>
                            </div>
                        </div>
                        <span class="text-[11px] px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-medium">Terhubung DB</span>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-4 rounded-xl bg-navy-900/60 border border-navy-700">
                            <span class="text-xs text-slate-400">Total Penduduk</span>
                            <div class="text-2xl font-extrabold text-white mt-1"><?= number_format($totalResidents ?: 1482) ?></div>
                            <span class="text-[11px] text-sky-400">Jiwa Terdata</span>
                        </div>
                        <div class="p-4 rounded-xl bg-navy-900/60 border border-navy-700">
                            <span class="text-xs text-slate-400">Layanan Aktif</span>
                            <div class="text-2xl font-extrabold text-white mt-1"><?= count($services) ?></div>
                            <span class="text-[11px] text-blue-400">Jenis Surat Resmi</span>
                        </div>
                        <div class="p-4 rounded-xl bg-navy-900/60 border border-navy-700">
                            <span class="text-xs text-slate-400">Sedang Diproses</span>
                            <div class="text-2xl font-extrabold text-amber-400 mt-1"><?= $stats['processing'] + $stats['pending'] ?></div>
                            <span class="text-[11px] text-amber-300/80">Verifikasi Perangkat</span>
                        </div>
                        <div class="p-4 rounded-xl bg-navy-900/60 border border-navy-700">
                            <span class="text-xs text-slate-400">Surat Selesai</span>
                            <div class="text-2xl font-extrabold text-emerald-400 mt-1"><?= $stats['completed'] ?></div>
                            <span class="text-[11px] text-emerald-300/80">Telah Diterbitkan</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Tracking Section -->
<section id="lacak" class="py-12 bg-white border-b border-slate-200">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div class="text-center max-w-xl mx-auto mb-6">
                <span class="text-xs font-bold text-blue-600 uppercase tracking-widest">Pusat Pelacakan Surat</span>
                <h2 class="text-2xl font-extrabold text-slate-800 mt-1">Cek Status Permohonan Anda</h2>
                <p class="text-sm text-slate-600 mt-1">Masukkan Nomor Registrasi (contoh: REG-...) atau 16 digit NIK Anda</p>
            </div>

            <form action="index.php#lacak" method="GET" class="flex flex-col sm:flex-row gap-3">
                <div class="relative flex-grow">
                    <i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" name="track" required placeholder="Contoh: REG-2026-SKD-0012 atau 12140815..." 
                           value="<?= htmlspecialchars($_GET['track'] ?? '') ?>"
                           class="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm">
                </div>
                <button type="submit" class="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shrink-0 shadow-md">
                    Cek Status
                </button>
            </form>

            <!-- Hasil Pencarian -->
            <?php if ($searched): ?>
                <div class="mt-6 pt-6 border-t border-blue-200">
                    <?php if ($trackResult): ?>
                        <div class="bg-white p-5 rounded-xl border border-blue-200 shadow-sm">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                <div>
                                    <span class="text-xs text-slate-400">Nomor Registrasi:</span>
                                    <p class="text-base font-bold text-blue-600"><?= htmlspecialchars($trackResult['registration_number']) ?></p>
                                </div>
                                <div>
                                    <?php
                                    $st = $trackResult['status'];
                                    $badge = 'bg-amber-100 text-amber-800 border-amber-300';
                                    $label = 'Sedang Diproses';
                                    if ($st === 'selesai') {
                                        $badge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                                        $label = 'Selesai & Diterbitkan';
                                    } elseif ($st === 'ditolak') {
                                        $badge = 'bg-red-100 text-red-800 border-red-300';
                                        $label = 'Ditolak';
                                    } elseif ($st === 'diajukan') {
                                        $badge = 'bg-blue-100 text-blue-800 border-blue-300';
                                        $label = 'Baru Diajukan';
                                    }
                                    ?>
                                    <span class="px-3 py-1 text-xs font-bold rounded-full border <?= $badge ?>">
                                        <?= $label ?>
                                    </span>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
                                <div>
                                    <span class="text-slate-400">Layanan:</span>
                                    <p class="font-semibold text-slate-800 text-sm"><?= htmlspecialchars($trackResult['service_name']) ?></p>
                                </div>
                                <div>
                                    <span class="text-slate-400">Nama Pemohon:</span>
                                    <p class="font-semibold text-slate-800 text-sm"><?= htmlspecialchars($trackResult['applicant_name']) ?></p>
                                </div>
                                <div>
                                    <span class="text-slate-400">Tanggal Pengajuan:</span>
                                    <p class="font-semibold text-slate-800 text-sm"><?= date('d M Y, H:i', strtotime($trackResult['created_at'])) ?> WIB</p>
                                </div>
                            </div>

                            <?php if (!empty($trackResult['letter_number'])): ?>
                                <div class="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                                    <div class="text-xs">
                                        <span class="text-emerald-800 font-bold">Surat Resmi Telah Terbit!</span>
                                        <p class="text-slate-600">No. Surat: <?= htmlspecialchars($trackResult['letter_number']) ?></p>
                                    </div>
                                    <a href="cetak_surat.php?app_id=<?= $trackResult['id'] ?>" target="_blank" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm">
                                        <i class="fa-solid fa-print mr-1"></i> Cetak / Unduh Surat
                                    </a>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php else: ?>
                        <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center">
                            <i class="fa-solid fa-circle-exclamation mr-1"></i> Permohonan dengan nomor atau NIK tersebut tidak ditemukan. Mohon periksa kembali.
                        </div>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</section>

<!-- Services Catalog Grid -->
<section id="layanan" class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto mb-12">
        <span class="text-xs font-bold text-blue-600 uppercase tracking-widest">Katalog Layanan Digital</span>
        <h2 class="text-3xl font-extrabold text-slate-900 mt-2">Daftar Pelayanan Administrasi Desa</h2>
        <p class="text-sm text-slate-600 mt-2">Pilih jenis surat keterangan yang Anda butuhkan untuk memulai pengajuan secara online.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php foreach ($services as $srv): ?>
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-[11px] font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            <?= htmlspecialchars($srv['category']) ?>
                        </span>
                        <span class="text-xs font-semibold text-slate-400">
                            <i class="fa-regular fa-clock mr-1"></i> <?= $srv['processing_days'] ?> Hari Kerja
                        </span>
                    </div>

                    <h3 class="text-lg font-bold text-slate-800 mb-2 leading-snug">
                        <?= htmlspecialchars($srv['name']) ?>
                    </h3>
                    <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                        <?= htmlspecialchars($srv['description']) ?>
                    </p>
                </div>

                <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span class="text-xs font-mono font-medium text-slate-400">Kode: <?= htmlspecialchars($srv['code']) ?></span>
                    <a href="ajukan.php?service_id=<?= urlencode($srv['id']) ?>" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5">
                        <i class="fa-solid fa-pen-nib"></i> Ajukan Sekarang
                    </a>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</section>

<!-- Flow Guide Section -->
<section id="panduan" class="py-16 bg-slate-100 border-t border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-xl mx-auto mb-12">
            <span class="text-xs font-bold text-blue-600 uppercase tracking-widest">Alur Pelayanan Digital</span>
            <h2 class="text-3xl font-extrabold text-slate-900 mt-2">4 Langkah Pengurusan Surat</h2>
            <p class="text-sm text-slate-600 mt-2">Proses cepat dan transparan tanpa perlu bolak-balik ke kantor desa.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center relative shadow-sm">
                <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 font-extrabold text-lg flex items-center justify-center mx-auto mb-4">1</div>
                <h4 class="font-bold text-slate-800 text-sm mb-1">Pilih Layanan</h4>
                <p class="text-xs text-slate-600">Pilih jenis surat keterangan yang diperlukan sesuai kebutuhan Anda.</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center relative shadow-sm">
                <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 font-extrabold text-lg flex items-center justify-center mx-auto mb-4">2</div>
                <h4 class="font-bold text-slate-800 text-sm mb-1">Isi Formulir</h4>
                <p class="text-xs text-slate-600">Lengkapi data diri (NIK, Nama, Dusun) dan sebutkan keperluan surat.</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center relative shadow-sm">
                <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 font-extrabold text-lg flex items-center justify-center mx-auto mb-4">3</div>
                <h4 class="font-bold text-slate-800 text-sm mb-1">Verifikasi Petugas</h4>
                <p class="text-xs text-slate-600">Kaur pelayanan & Sekdes memeriksa berkas, Kades menyetujui secara digital.</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center relative shadow-sm">
                <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 font-extrabold text-lg flex items-center justify-center mx-auto mb-4">4</div>
                <h4 class="font-bold text-slate-800 text-sm mb-1">Surat Diterbitkan</h4>
                <p class="text-xs text-slate-600">Surat resmi siap dicetak dengan QR Code verifikasi keabsahan dinas.</p>
            </div>
        </div>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

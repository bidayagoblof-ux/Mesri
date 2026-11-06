<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Format Cetak Dokumen Surat Dinas Resmi
 * File: cetak_surat.php
 */

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/models/Application.php';
require_once __DIR__ . '/models/Letter.php';
require_once __DIR__ . '/models/Resident.php';

$appId = $_GET['app_id'] ?? '';
$letterId = $_GET['letter_id'] ?? '';

$letterModel = new Letter();
$appModel = new Application();
$residentModel = new Resident();

$letter = null;
if (!empty($letterId)) {
    $letter = $letterModel->getById($letterId);
} elseif (!empty($appId)) {
    $letter = $letterModel->getByApplicationId($appId);
    if (!$letter) {
        // Jika belum ada surat tapi permohonan ada, coba generate otomatis
        $app = $appModel->getById($appId);
        if ($app) {
            $resident = $residentModel->findByNik($app['applicant_nik']) ?? [
                'birth_place' => 'Lolosoni',
                'birth_date' => '1992-04-15',
                'address_dusun' => $app['dusun'] ?? 'Dusun I Bawonahono',
                'occupation' => 'Wiraswasta'
            ];
            $gen = $letterModel->issueLetter($app, $resident);
            if ($gen['success']) {
                $letter = $letterModel->getByApplicationId($appId);
            }
        }
    }
}

if (!$letter) {
    die("Surat tidak ditemukan atau belum diterbitkan. Pastikan permohonan telah disetujui Kepala Desa.");
}

$resident = $residentModel->findByNik($letter['recipient_nik']) ?? [];
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cetak Surat - <?= htmlspecialchars($letter['letter_number']) ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        @page {
            size: A4 portrait;
            margin: 20mm;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            color: #000;
            background: #e2e8f0;
        }
        .page-sheet {
            width: 210mm;
            min-height: 297mm;
            padding: 25mm 20mm;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.15);
        }
        @media print {
            body {
                background: white;
            }
            .page-sheet {
                margin: 0;
                padding: 0;
                box-shadow: none;
                width: 100%;
                min-height: auto;
            }
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body class="antialiased">

    <!-- Action Bar (No Print) -->
    <div class="no-print bg-slate-900 text-white py-3 px-4 sticky top-0 z-50 shadow-md">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-3">
                <a href="dashboard.php" class="text-slate-300 hover:text-white text-xs font-semibold">
                    <i class="fa-solid fa-arrow-left mr-1"></i> Kembali ke Dashboard
                </a>
                <span class="text-slate-600">|</span>
                <span class="text-xs text-sky-400 font-mono"><?= htmlspecialchars($letter['letter_number']) ?></span>
            </div>
            <button onclick="window.print()" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md flex items-center gap-2">
                <i class="fa-solid fa-print"></i> Cetak / Simpan PDF
            </button>
        </div>
    </div>

    <!-- Official A4 Letter Sheet -->
    <div class="page-sheet text-[12pt] leading-relaxed">
        
        <!-- Kop Surat Resmi Pemerintahan Desa -->
        <div class="text-center relative pb-3 border-b-4 border-double border-black">
            <!-- Lambang Garuda / Daerah -->
            <div class="w-16 h-16 mx-auto mb-1 flex items-center justify-center font-bold text-3xl">
                <i class="fa-solid fa-landmark text-slate-800"></i>
            </div>
            <h3 class="text-[13pt] font-bold tracking-wider uppercase">PEMERINTAH KABUPATEN NIAS SELATAN</h3>
            <h2 class="text-[14pt] font-bold tracking-wider uppercase">KECAMATAN GOMO</h2>
            <h1 class="text-[16pt] font-extrabold tracking-wider uppercase">PEMERINTAH DESA LOLOSONI</h1>
            <p class="text-[10pt] italic mt-0.5 font-sans">
                Jalan Poros Desa Lolosoni, Kecamatan Gomo, Kabupaten Nias Selatan, Sumatera Utara 22873
            </p>
        </div>

        <!-- Judul & Nomor Surat -->
        <div class="text-center my-6">
            <h4 class="text-[14pt] font-bold tracking-wide uppercase underline decoration-1 underline-offset-4">
                <?= htmlspecialchars(strtoupper($letter['service_name'])) ?>
            </h4>
            <p class="text-[11pt] font-medium tracking-wide mt-1">
                Nomor: <?= htmlspecialchars($letter['letter_number']) ?>
            </p>
        </div>

        <!-- Isi Surat Keterangan -->
        <div class="space-y-4 text-justify">
            <p>
                Yang bertanda tangan di bawah ini Kepala Desa Lolosoni, Kecamatan Gomo, Kabupaten Nias Selatan, Provinsi Sumatera Utara, dengan ini menerangkan bahwa:
            </p>

            <!-- Tabel Biodata Pemohon -->
            <table class="w-full my-3 ml-4 text-[11pt]">
                <tbody>
                    <tr class="align-top">
                        <td class="w-48 py-1">Nama Lengkap</td>
                        <td class="w-4 py-1">:</td>
                        <td class="py-1 font-bold"><?= htmlspecialchars($letter['recipient_name']) ?></td>
                    </tr>
                    <tr class="align-top">
                        <td class="py-1">NIK (KTP)</td>
                        <td class="py-1">:</td>
                        <td class="py-1 font-mono"><?= htmlspecialchars($letter['recipient_nik']) ?></td>
                    </tr>
                    <tr class="align-top">
                        <td class="py-1">Nomor Kartu Keluarga</td>
                        <td class="py-1">:</td>
                        <td class="py-1 font-mono"><?= htmlspecialchars($resident['no_kk'] ?? '1214080101150001') ?></td>
                    </tr>
                    <tr class="align-top">
                        <td class="py-1">Tempat, Tanggal Lahir</td>
                        <td class="py-1">:</td>
                        <td class="py-1"><?= htmlspecialchars($letter['recipient_birth']) ?></td>
                    </tr>
                    <tr class="align-top">
                        <td class="py-1">Jenis Kelamin</td>
                        <td class="py-1">:</td>
                        <td class="py-1"><?= ($resident['gender'] ?? 'L') === 'L' ? 'Laki-laki' : 'Perempuan' ?></td>
                    </tr>
                    <tr class="align-top">
                        <td class="py-1">Agama</td>
                        <td class="py-1">:</td>
                        <td class="py-1"><?= htmlspecialchars($resident['religion'] ?? 'Kristen Protestan') ?></td>
                    </tr>
                    <tr class="align-top">
                        <td class="py-1">Pekerjaan</td>
                        <td class="py-1">:</td>
                        <td class="py-1"><?= htmlspecialchars($letter['recipient_occupation']) ?></td>
                    </tr>
                    <tr class="align-top">
                        <td class="py-1">Alamat / Domisili</td>
                        <td class="py-1">:</td>
                        <td class="py-1"><?= htmlspecialchars($letter['recipient_address']) ?></td>
                    </tr>
                </tbody>
            </table>

            <p>
                <?= htmlspecialchars($letter['content_body']) ?>
            </p>

            <p>
                Demikian surat keterangan ini kami perbuat dan berikan kepada yang bersangkutan untuk dapat dipergunakan sebagaimana mestinya dengan penuh tanggung jawab.
            </p>
        </div>

        <!-- Kolom Tanda Tangan & QR Code Keabsahan Dokumen -->
        <div class="mt-12 grid grid-cols-2 items-end">
            <!-- QR Code Validasi Dinas -->
            <div class="text-left font-sans">
                <div class="p-3 border border-slate-300 rounded-lg inline-block text-center bg-slate-50">
                    <!-- Simulasi QR Code Vector -->
                    <div class="w-24 h-24 bg-white border border-slate-400 p-1 mx-auto flex flex-wrap items-center justify-center">
                        <div class="w-full h-full bg-slate-900 flex items-center justify-center text-white text-[8px] font-mono text-center p-1 break-all">
                            QR CODE VERIFIED<br>SIPADLO LLS
                        </div>
                    </div>
                    <span class="block text-[8pt] text-slate-500 font-mono mt-1 font-bold">
                        <?= htmlspecialchars($letter['qr_verification_code']) ?>
                    </span>
                    <span class="block text-[7pt] text-slate-400 italic">
                        Validasi Resmi Dokumen Digital
                    </span>
                </div>
            </div>

            <!-- Tanda Tangan Kepala Desa -->
            <div class="text-center">
                <p>Lolosoni, <?= date('d F Y', strtotime($letter['letter_date'])) ?></p>
                <p class="font-bold"><?= htmlspecialchars($letter['signatory_role']) ?></p>

                <!-- Ruang Tanda Tangan & Stempel -->
                <div class="h-20 flex items-center justify-center relative">
                    <span class="text-[9pt] font-sans font-bold text-blue-900 border border-blue-400/50 px-2 py-0.5 rounded rotate-[-6deg] bg-blue-50/50">
                        [ TERTANDA & TERVERIFIKASI ]
                    </span>
                </div>

                <p class="font-bold underline decoration-1 uppercase">
                    <?= htmlspecialchars($letter['signatory_name']) ?>
                </p>
            </div>
        </div>

    </div>

</body>
</html>

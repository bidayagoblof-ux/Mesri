<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Header Template - Modern Government UI
 * File: includes/header.php
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$currentUser = $_SESSION['user'] ?? null;
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($pageTitle) ? htmlspecialchars($pageTitle) . " - " : "" ?>SIPADLO Desa Lolosoni</title>
    <!-- Tailwind CSS CDN for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        navy: { 900: '#102A43', 800: '#1A365D', 700: '#2A4365' },
                        primary: '#2563EB',
                        sky: '#38BDF8',
                    }
                }
            }
        }
    </script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col antialiased">
    <!-- Navbar -->
    <nav class="bg-navy-900 text-white sticky top-0 z-50 shadow-md border-b border-navy-800 no-print">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20 items-center">
                <!-- Brand / Logo -->
                <a href="index.php" class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white text-xl">
                        <i class="fa-solid fa-landmark"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-extrabold text-xl tracking-tight text-white">SIPADLO</span>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/30 text-sky-300 border border-blue-500/30 uppercase tracking-widest">Desa Lolosoni</span>
                        </div>
                        <p class="text-xs text-slate-300 hidden sm:block">Sistem Informasi Pelayanan Administrasi Desa Lolosoni</p>
                    </div>
                </a>

                <!-- Nav Links -->
                <div class="hidden md:flex items-center gap-6 text-sm font-medium">
                    <a href="index.php" class="text-slate-200 hover:text-white transition">Beranda</a>
                    <a href="index.php#layanan" class="text-slate-200 hover:text-white transition">Layanan Surat</a>
                    <a href="index.php#lacak" class="text-slate-200 hover:text-white transition">Lacak Surat</a>
                    <a href="index.php#panduan" class="text-slate-200 hover:text-white transition">Panduan</a>
                    
                    <?php if ($currentUser): ?>
                        <a href="dashboard.php" class="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center gap-2 shadow-sm">
                            <i class="fa-solid fa-gauge-high"></i> Dashboard
                        </a>
                        <div class="flex items-center gap-2 pl-2 border-l border-navy-700">
                            <span class="text-xs text-slate-300"><?= htmlspecialchars($currentUser['full_name']) ?> (<?= htmlspecialchars($currentUser['role_name'] ?? $currentUser['role_id']) ?>)</span>
                            <a href="logout.php" class="text-red-400 hover:text-red-300 text-xs ml-2 font-semibold">Keluar</a>
                        </div>
                    <?php else: ?>
                        <a href="login.php" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-md shadow-blue-600/30">
                            <i class="fa-solid fa-right-to-bracket mr-1"></i> Masuk Sistem
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </nav>
    <main class="flex-grow">

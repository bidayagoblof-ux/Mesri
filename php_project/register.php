<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Pendaftaran Akun Warga Baru
 * File: register.php
 */

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Resident.php';

session_start();
if (isset($_SESSION['user'])) {
    header("Location: dashboard.php");
    exit;
}

$error = null;
$success = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nik = trim($_POST['nik'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $fullName = trim($_POST['full_name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $dusun = trim($_POST['dusun'] ?? 'Dusun I Bawonahono');

    if (strlen($nik) !== 16 || !ctype_digit($nik)) {
        $error = "NIK harus terdiri dari tepat 16 digit angka kependudukan.";
    } elseif (empty($email) || empty($password) || empty($fullName)) {
        $error = "Mohon lengkapi seluruh kolom bertanda bintang (*).";
    } else {
        $userModel = new User();
        $res = $userModel->register($nik, $email, $password, $fullName, $phone, $dusun);
        if ($res['success']) {
            $success = "Pendaftaran berhasil! Silakan masuk dengan email dan kata sandi Anda.";
        } else {
            $error = $res['error'] ?? "Gagal mendaftar.";
        }
    }
}

$pageTitle = "Pendaftaran Akun Warga";
require_once __DIR__ . '/includes/header.php';
?>

<div class="py-12 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto">
    <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-md">
        <div class="text-center mb-6">
            <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 text-xl shadow-md shadow-blue-500/20">
                <i class="fa-solid fa-user-plus"></i>
            </div>
            <h2 class="text-2xl font-extrabold text-slate-800">Daftar Akun Warga</h2>
            <p class="text-xs text-slate-500 mt-1">Sistem Informasi Pelayanan Administrasi Desa Lolosoni</p>
        </div>

        <?php if ($error): ?>
            <div class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                <i class="fa-solid fa-circle-exclamation mr-1"></i> <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <?php if ($success): ?>
            <div class="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <i class="fa-solid fa-circle-check mr-1"></i> <?= htmlspecialchars($success) ?>
                <div class="mt-2">
                    <a href="login.php" class="font-bold underline text-emerald-900">Klik di sini untuk Masuk</a>
                </div>
            </div>
        <?php else: ?>

        <form method="POST" action="register.php" class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">NIK (Nomor Induk Kependudukan) *</label>
                <input type="text" name="nik" maxlength="16" required placeholder="16 Digit NIK KTP Anda"
                       value="<?= htmlspecialchars($_POST['nik'] ?? '') ?>"
                       class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm">
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Lengkap (Sesuai KTP) *</label>
                <input type="text" name="full_name" required placeholder="Nama Lengkap"
                       value="<?= htmlspecialchars($_POST['full_name'] ?? '') ?>"
                       class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Alamat Email *</label>
                    <input type="email" name="email" required placeholder="nama@email.com"
                           value="<?= htmlspecialchars($_POST['email'] ?? '') ?>"
                           class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nomor WhatsApp / HP</label>
                    <input type="text" name="phone" placeholder="08xxxxxxxxxx"
                           value="<?= htmlspecialchars($_POST['phone'] ?? '') ?>"
                           class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm">
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Dusun Domisili di Desa Lolosoni *</label>
                <select name="dusun" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm">
                    <option value="Dusun I Bawonahono">Dusun I Bawonahono</option>
                    <option value="Dusun II Hilibadalu">Dusun II Hilibadalu</option>
                    <option value="Dusun III Onohondro">Dusun III Onohondro</option>
                </select>
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Kata Sandi Baru *</label>
                <input type="password" name="password" required placeholder="Minimal 6 karakter"
                       class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm">
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md shadow-blue-600/20">
                Daftar Sekarang
            </button>
        </form>

        <?php endif; ?>

        <div class="mt-6 pt-4 border-t border-slate-200 text-center">
            <span class="text-xs text-slate-500">Sudah memiliki akun?</span>
            <a href="login.php" class="text-xs font-bold text-blue-600 hover:underline ml-1">Masuk ke Sistem</a>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

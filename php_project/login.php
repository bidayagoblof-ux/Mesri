<?php
/**
 * SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI (SIPADLO)
 * Halaman Masuk / Login
 * File: login.php
 */

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/models/User.php';

session_start();

// Jika sudah login, langsung ke dashboard
if (isset($_SESSION['user'])) {
    header("Location: dashboard.php");
    exit;
}

$error = null;
$userModel = new User();

// Tangani form submit atau quick demo login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identifier = trim($_POST['identifier'] ?? '');
    $password = trim($_POST['password'] ?? '');

    // Cek quick demo click
    if (!empty($_POST['demo_user'])) {
        $demoUser = $_POST['demo_user'];
        if ($demoUser === 'kades') {
            $identifier = 'kades@lolosoni.desa.id';
            $password = 'admin123';
        } elseif ($demoUser === 'sekdes') {
            $identifier = 'sekdes@lolosoni.desa.id';
            $password = 'sekdes123';
        } elseif ($demoUser === 'perangkat') {
            $identifier = 'perangkat@lolosoni.desa.id';
            $password = 'perangkat123';
        } elseif ($demoUser === 'warga') {
            $identifier = 'warga@lolosoni.desa.id';
            $password = 'warga123';
        }
    }

    if (empty($identifier) || empty($password)) {
        $error = "Silakan masukkan Email / NIK dan kata sandi Anda.";
    } else {
        $auth = $userModel->authenticate($identifier, $password);
        if ($auth) {
            $_SESSION['user'] = $auth;
            header("Location: dashboard.php");
            exit;
        } else {
            $error = "Email/NIK atau kata sandi tidak cocok. Silakan coba kembali.";
        }
    }
}

$pageTitle = "Masuk ke Sistem";
require_once __DIR__ . '/includes/header.php';
?>

<div class="py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
    <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-md">
        <div class="text-center mb-6">
            <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 text-xl shadow-md shadow-blue-500/20">
                <i class="fa-solid fa-lock"></i>
            </div>
            <h2 class="text-2xl font-extrabold text-slate-800">Masuk SIPADLO</h2>
            <p class="text-xs text-slate-500 mt-1">Sistem Informasi Pelayanan Administrasi Desa Lolosoni</p>
        </div>

        <?php if ($error): ?>
            <div class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                <i class="fa-solid fa-circle-exclamation mr-1"></i> <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="login.php" class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email atau NIK</label>
                <div class="relative">
                    <i class="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input type="text" name="identifier" required placeholder="Contoh: kades@lolosoni.desa.id / NIK"
                           class="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm">
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Kata Sandi</label>
                <div class="relative">
                    <i class="fa-solid fa-key absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input type="password" name="password" required placeholder="••••••••"
                           class="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm">
                </div>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md shadow-blue-600/20">
                Masuk ke Akun
            </button>
        </form>

        <!-- Quick 1-Click Role Switcher for Academic Demo -->
        <div class="mt-6 pt-6 border-t border-slate-200">
            <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">Akses Cepat Pengujian (1-Klik)</span>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <form method="POST" action="login.php">
                    <input type="hidden" name="demo_user" value="kades">
                    <button type="submit" class="w-full p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition text-left border border-slate-200">
                        <div class="font-bold text-blue-600 text-[11px]">Kepala Desa</div>
                        <div class="text-[10px] text-slate-500">Ya'atulo Hia</div>
                    </button>
                </form>
                <form method="POST" action="login.php">
                    <input type="hidden" name="demo_user" value="sekdes">
                    <button type="submit" class="w-full p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition text-left border border-slate-200">
                        <div class="font-bold text-blue-600 text-[11px]">Sekretaris Desa</div>
                        <div class="text-[10px] text-slate-500">Faomakhoda, S.AP</div>
                    </button>
                </form>
                <form method="POST" action="login.php">
                    <input type="hidden" name="demo_user" value="perangkat">
                    <button type="submit" class="w-full p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition text-left border border-slate-200">
                        <div class="font-bold text-blue-600 text-[11px]">Kaur Pelayanan</div>
                        <div class="text-[10px] text-slate-500">Yulianus Lase</div>
                    </button>
                </form>
                <form method="POST" action="login.php">
                    <input type="hidden" name="demo_user" value="warga">
                    <button type="submit" class="w-full p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition text-left border border-slate-200">
                        <div class="font-bold text-emerald-600 text-[11px]">Masyarakat</div>
                        <div class="text-[10px] text-slate-500">Bezisokhi Hia</div>
                    </button>
                </form>
            </div>
        </div>

        <div class="mt-4 text-center">
            <span class="text-xs text-slate-500">Belum punya akun warga?</span>
            <a href="register.php" class="text-xs font-bold text-blue-600 hover:underline ml-1">Daftar Akun Baru</a>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api, setStoredToken, getStoredToken } from './api.ts';
import {
  User,
  ServiceItem,
  VillageConfig,
  SystemStats,
  NotificationItem,
  Letter,
  RoleType
} from './types.ts';

// Components
import { QuickRoleSwitcher } from './components/QuickRoleSwitcher.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Village3DScene } from './components/Village3DScene.tsx';
import { PublicServicesView } from './components/PublicServicesView.tsx';
import { VillageProfileView } from './components/VillageProfileView.tsx';
import { PublicGuideView } from './components/PublicGuideView.tsx';
import { BrandAndVisualGenerator } from './components/BrandAndVisualGenerator.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ApplicationFormModal } from './components/ApplicationFormModal.tsx';
import { OfficialLetterViewer } from './components/OfficialLetterViewer.tsx';
import { AiAssistantModal } from './components/AiAssistantModal.tsx';
import { TrackingModal } from './components/TrackingModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { NotificationModal } from './components/NotificationModal.tsx';
import { PhpSourceModal } from './components/PhpSourceModal.tsx';

// Icons
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Users,
  Compass,
  Sparkles,
  Search,
  Briefcase,
  Heart,
  Baby,
  Eye,
  Layers,
  Lock,
  Code2
} from 'lucide-react';

export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('beranda');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [villageConfig, setVillageConfig] = useState<VillageConfig>({
    villageName: 'Desa Lolosoni',
    districtName: 'Kecamatan Gomo',
    regencyName: 'Kabupaten Nias Selatan',
    provinceName: 'Sumatera Utara',
    officeAddress: 'Jalan Poros Desa Lolosoni, Kec. Gomo, Kab. Nias Selatan',
    postalCode: '22873',
    kadesName: "Ya'atulo Hia",
    sekdesName: 'Faomakhoda Telambanua, S.AP',
    kaurPelayananName: 'Yulianus Lase',
    vision: 'Mewujudkan Desa Lolosoni yang Maju, Berdaya Saing, Mandiri, Berkeadilan, dan Religius Berbasis Pelayanan Publik Terpadu dan Kearifan Lokal Ono Niha.',
    mission: [
      'Menyelenggarakan tata kelola pemerintahan desa yang bersih, transparan, akuntabel, dan berbasis digital.',
      'Meningkatkan mutu pelayanan administrasi kependudukan yang cepat, mudah, dan bebas pungutan liar.',
      'Mendorong peningkatan ekonomi masyarakat berbasis pertanian dan kearifan lokal.'
    ],
    history: 'Desa Lolosoni merupakan salah satu desa di wilayah Kecamatan Gomo, Kabupaten Nias Selatan yang kaya akan warisan megalitikum dan semangat persaudaraan Ono Niha.',
    residentCount: 1482,
    familyCount: 364,
    dusunList: ['Dusun I Bawonahono', 'Dusun II Hilibadalu', 'Dusun III Hiligodu'],
    contactEmail: 'pemdes@lolosoni.desa.id',
    contactPhone: '+62 821-6543-9870'
  });
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState<string>('');
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedServiceForApply, setSelectedServiceForApply] = useState<ServiceItem | null>(null);
  const [selectedLetterForView, setSelectedLetterForView] = useState<Letter | null>(null);
  const [isPhpSourceModalOpen, setIsPhpSourceModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      const [servicesData, configData, statsData] = await Promise.all([
        api.getServices(),
        api.getVillageConfig(),
        api.getStats()
      ]);
      setServices(servicesData);
      setVillageConfig(configData);
      setSystemStats(statsData);

      // Check existing auth token
      const token = getStoredToken();
      if (token) {
        const me = await api.getMe();
        if (me && me.user) {
          setCurrentUser(me.user);
          const notifs = await api.getNotifications();
          setNotifications(notifs);
        }
      }
    } catch (err) {
      console.warn('Initial data load note:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Show Toast Helper
  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Switch Role
  const handleSwitchRole = async (role: RoleType) => {
    try {
      const res = await api.switchDemoRole(role);
      setCurrentUser(res.user);
      const notifs = await api.getNotifications();
      setNotifications(notifs);
      showToast(`Beralih peran sebagai: ${res.user.roleName} (${res.user.fullName})`);
    } catch (err: any) {
      alert(err?.message || 'Gagal beralih peran.');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setNotifications([]);
    if (currentView === 'dashboard') {
      setCurrentView('beranda');
    }
    showToast('Berhasil keluar dari akun.');
  };

  // Apply service triggered
  const handleSelectServiceToApply = (service: ServiceItem) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      setAuthMode('login');
      return;
    }
    setSelectedServiceForApply(service);
  };

  // Open AI Assistant with prompt
  const handleOpenAiWithPrompt = (prompt: string) => {
    setAiAssistantPrompt(prompt);
    setIsAiAssistantOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB] text-[#172B4D] selection:bg-blue-600 selection:text-white">
      {/* 1-Click Role Switcher Bar */}
      <QuickRoleSwitcher
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
      />

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        notifications={notifications}
        currentView={currentView}
        onNavigate={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLogin={() => {
          setAuthMode('login');
          setIsAuthModalOpen(true);
        }}
        onOpenRegister={() => {
          setAuthMode('register');
          setIsAuthModalOpen(true);
        }}
        onOpenAiAssistant={() => {
          setAiAssistantPrompt('');
          setIsAiAssistantOpen(true);
        }}
        onOpenTracking={() => setIsTrackingModalOpen(true)}
        onOpenPhpSource={() => setIsPhpSourceModalOpen(true)}
        onLogout={handleLogout}
        onToggleNotifications={() => setIsNotificationModalOpen(true)}
      />

      {/* Toast Announcement */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#102A43] text-white px-5 py-3 rounded-2xl shadow-2xl border border-blue-500/40 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* VIEW CONTENT ROUTER */}
      <main className="flex-1">
        {/* VIEW 1: BERANDA (HOME) */}
        {currentView === 'beranda' && (
          <div className="space-y-16 pb-16">
            {/* Hero Section 3D */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
              <Village3DScene
                onExploreServices={() => {
                  setCurrentView('layanan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onApplyService={() => {
                  if (services.length > 0) {
                    handleSelectServiceToApply(services[0]);
                  }
                }}
              />
            </section>

            {/* Live Statistics Cards (Section 4 D) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Jumlah Penduduk
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#102A43]">
                      {systemStats?.residentCount ?? villageConfig.residentCount}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{villageConfig.familyCount} Kepala Keluarga</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Layanan Administrasi
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#102A43]">
                      {services.filter((s) => s.isActive).length}
                    </span>
                    <span className="text-[11px] text-slate-400 block">Katalog Surat Aktif</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Permohonan Diproses
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                      {systemStats?.processingApplications ?? 0}
                    </span>
                    <span className="text-[11px] text-slate-400 block">Verifikasi Berjenjang</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Surat Selesai
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                      {systemStats?.completedApplications ?? 0}
                    </span>
                    <span className="text-[11px] text-slate-400 block">Terbit Ber-QR Code</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Banner Khusus Penelitian: PHP & MySQL (OOP) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#102A43] via-[#1A365D] to-purple-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-500/30">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold">
                    <Code2 className="w-3.5 h-3.5 text-purple-300" />
                    Kode Sumber PHP (OOP) & MySQL Tersedia Lengkap
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    Implementasi Pendekatan Berorientasi Objek (OOP) & MySQL
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Sistem informasi ini dilengkapi dengan seluruh kode sumber PHP OOP murni (<span className="font-mono text-purple-200">config/Database.php</span>, <span className="font-mono text-purple-200">models/</span>, <span className="font-mono text-purple-200">database.sql</span>, <span className="font-mono text-purple-200">index.php</span>, <span className="font-mono text-purple-200">dashboard.php</span>, <span className="font-mono text-purple-200">cetak_surat.php</span>) yang siap dipasang dan diuji pada XAMPP atau Laragon.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setIsPhpSourceModalOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Jelajah & Unduh Kode PHP</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Popular Services Highlights (Section 4 E) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Pelayanan Cepat Warga
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight">
                    Jenis Layanan Administrasi Desa
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl mt-1">
                    Ajukan permohonan surat keterangan kependudukan langsung dari rumah secara mudah dan transparan.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('layanan')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <span>Lihat Seluruh Layanan ({services.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.slice(0, 4).map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base text-[#102A43]">{service.name}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {service.description}
                      </p>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>SLA: {service.processingDays} hari kerja</span>
                      </div>
                    </div>

                    <div className="pt-6 flex gap-2">
                      <button
                        onClick={() => handleSelectServiceToApply(service)}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span>Ajukan Surat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4-Langkah Alur Pelayanan Digital (Section 4 F) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-[#102A43] text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
                <div className="max-w-2xl space-y-2">
                  <span className="px-3.5 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider">
                    Tata Cara Pelayanan
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Alur Pelayanan Administrasi Digital
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Proses transparan mulai dari pendaftaran berkas hingga surat resmi diterbitkan dengan QR Code.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      step: '1',
                      title: 'Pilih Layanan',
                      desc: 'Pilih jenis surat yang dibutuhkan dan periksa kelengkapan persyaratan berkas.'
                    },
                    {
                      step: '2',
                      title: 'Isi & Unggah Berkas',
                      desc: 'Isi formulir online dan unggah foto/scan berkas KTP, KK, atau bukti pendukung.'
                    },
                    {
                      step: '3',
                      title: 'Pemeriksaan & Validasi',
                      desc: 'Perangkat dan Sekretaris Desa memeriksa berkas sebelum persetujuan Kepala Desa.'
                    },
                    {
                      step: '4',
                      title: 'Terbit Surat Ber-QR',
                      desc: 'Surat dinas resmi diterbitkan ber-QR Code dan dapat langsung diunduh atau dicetak.'
                    }
                  ].map((s) => (
                    <div key={s.step} className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                        {s.step}
                      </span>
                      <h4 className="font-bold text-sm text-white">{s.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Keunggulan Sistem (Section 4 G) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Standar Pelayanan Prima
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#102A43]">
                  Keunggulan Sistem Informasi SIPADLO
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-[#102A43]">Pengajuan Administrasi Online</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Masyarakat Desa Lolosoni dapat mengajukan surat kapan saja dan dari mana saja tanpa harus datang berkali-kali ke kantor desa.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-[#102A43]">Pemantauan Real-Time & Transparan</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Setiap tahapan status berkas dapat dipantau langsung melalui nomor registrasi, lengkap dengan catatan perbaikan jika ada berkas yang kurang.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-[#102A43]">Arsip Digital & Validasi QR Code</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Naskah dinas resmi tersimpan aman dalam buku register digital dengan QR Code verifikasi dokumen yang dapat dipindai oleh instansi terkait.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: PROFIL DESA */}
        {currentView === 'profil' && (
          <VillageProfileView
            config={villageConfig}
            onNavigateLayanan={() => {
              setCurrentView('layanan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 3: LAYANAN ADMINISTRASI */}
        {currentView === 'layanan' && (
          <PublicServicesView
            services={services}
            onSelectService={handleSelectServiceToApply}
            onOpenAiHelper={handleOpenAiWithPrompt}
          />
        )}

        {/* VIEW 4: PANDUAN PELAYANAN */}
        {currentView === 'panduan' && (
          <PublicGuideView
            onStartApply={() => {
              if (services.length > 0) {
                handleSelectServiceToApply(services[0]);
              }
            }}
            onOpenAiAssistant={() => {
              setAiAssistantPrompt('');
              setIsAiAssistantOpen(true);
            }}
          />
        )}

        {/* VIEW 5: BRAND BIBLE & VISUAL GENERATOR */}
        {currentView === 'brand_bible' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <BrandAndVisualGenerator />
          </div>
        )}

        {/* VIEW 6: DASHBOARD */}
        {currentView === 'dashboard' && currentUser && (
          <DashboardView
            currentUser={currentUser}
            services={services}
            onOpenApplyModal={handleSelectServiceToApply}
            onViewLetter={(letItem) => setSelectedLetterForView(letItem)}
            onOpenAiAssistant={() => {
              setAiAssistantPrompt('');
              setIsAiAssistantOpen(true);
            }}
            onOpenPhpSource={() => setIsPhpSourceModalOpen(true)}
          />
        )}
      </main>

      {/* Main Footer */}
      <Footer
        config={villageConfig}
        onNavigate={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTracking={() => setIsTrackingModalOpen(true)}
        onOpenAiAssistant={() => {
          setAiAssistantPrompt('');
          setIsAiAssistantOpen(true);
        }}
        onOpenPhpSource={() => setIsPhpSourceModalOpen(true)}
      />

      {/* MODAL 1: FORM PENGAJUAN LAYANAN */}
      {selectedServiceForApply && (
        <ApplicationFormModal
          service={selectedServiceForApply}
          user={currentUser}
          onClose={() => setSelectedServiceForApply(null)}
          onSuccess={(regNumber) => {
            setSelectedServiceForApply(null);
            showToast(`Permohonan berhasil didaftarkan! No. Registrasi: ${regNumber}`);
            if (currentUser) {
              setCurrentView('dashboard');
            }
          }}
          onOpenAiHelper={handleOpenAiWithPrompt}
        />
      )}

      {/* MODAL 2: OFFICIAL LETTER VIEWER & PRINTER */}
      {selectedLetterForView && (
        <OfficialLetterViewer
          letter={selectedLetterForView}
          onClose={() => setSelectedLetterForView(null)}
        />
      )}

      {/* MODAL 3: GEMINI AI ASSISTANT */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        initialPrompt={aiAssistantPrompt}
      />

      {/* MODAL 4: PUBLIC TRACKING MODAL */}
      <TrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        onViewLetter={(letItem) => setSelectedLetterForView(letItem)}
      />

      {/* MODAL 5: AUTHENTICATION (LOGIN / REGISTER) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Selamat datang, ${user.fullName}!`);
        }}
        onSwitchRole={handleSwitchRole}
      />

      {/* MODAL 6: NOTIFICATIONS */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onMarkAllRead={async () => {
          await api.markAllNotificationsRead();
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }}
        onSelectNotification={(notif) => {
          api.markNotificationRead(notif.id);
          setNotifications((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
          );
          setIsNotificationModalOpen(false);
          if (currentUser) {
            setCurrentView('dashboard');
          }
        }}
      />

      {/* MODAL 7: SOURCE CODE PHP & MYSQL (OOP) */}
      <PhpSourceModal
        isOpen={isPhpSourceModalOpen}
        onClose={() => setIsPhpSourceModalOpen(false)}
      />
    </div>
  );
}

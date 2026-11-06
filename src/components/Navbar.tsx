import React, { useState } from 'react';
import { User, NotificationItem } from '../types.ts';
import {
  Shield,
  Bell,
  Sparkles,
  Menu,
  X,
  Search,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Palette,
  Code2
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  notifications: NotificationItem[];
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenAiAssistant: () => void;
  onOpenTracking: () => void;
  onOpenPhpSource: () => void;
  onLogout: () => void;
  onToggleNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  notifications,
  currentView,
  onNavigate,
  onOpenLogin,
  onOpenRegister,
  onOpenAiAssistant,
  onOpenTracking,
  onOpenPhpSource,
  onLogout,
  onToggleNotifications
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navItems = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'profil', label: 'Profil Desa' },
    { id: 'layanan', label: 'Layanan Administrasi' },
    { id: 'panduan', label: 'Panduan' },
    { id: 'brand_bible', label: 'Identitas & Visual', icon: Palette }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo SIPADLO */}
          <div
            onClick={() => onNavigate('beranda')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#102A43] to-blue-700 p-2 flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition">
              <Shield className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#102A43]">SIPADLO</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  DESA
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest -mt-0.5">
                Desa Lolosoni • Gomo
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Public Tracking Shortcut */}
            <button
              onClick={onOpenTracking}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Lacak Surat</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PHP & MySQL Source Code Modal Button */}
            <button
              onClick={onOpenPhpSource}
              className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200/80 transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title="Lihat & Unduh Source Code PHP (OOP) & MySQL"
            >
              <Code2 className="w-4 h-4 text-purple-600" />
              <span className="hidden sm:inline">PHP & MySQL</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiAssistant}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-sky-600/10 hover:from-blue-600/20 hover:to-indigo-600/20 text-blue-700 text-xs font-bold border border-blue-200/80 transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title="Konsultasi Pelayanan dengan Asisten AI SIPADLO"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Asisten AI</span>
            </button>

            {/* Notifications Bell (if logged in) */}
            {currentUser && (
              <button
                onClick={onToggleNotifications}
                className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                title="Notifikasi Pelayanan"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth Buttons / Dashboard Trigger */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm ${
                    currentView === 'dashboard'
                      ? 'bg-[#102A43] text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden md:inline">Dashboard ({currentUser.roleName})</span>
                  <span className="md:hidden">Dashboard</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#102A43] hover:bg-slate-100 transition cursor-pointer"
                >
                  Masuk
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  Daftar
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                currentView === item.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onOpenTracking();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-blue-600" /> Lacak Status Surat
          </button>
          <button
            onClick={() => {
              onOpenPhpSource();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 flex items-center gap-2"
          >
            <Code2 className="w-4 h-4 text-purple-600" /> Source Code PHP & MySQL (OOP)
          </button>
        </div>
      )}
    </header>
  );
};

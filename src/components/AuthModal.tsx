import React, { useState } from 'react';
import { api } from '../api.ts';
import { User, RoleType } from '../types.ts';
import { X, Lock, Mail, UserCheck, Shield, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchRole: (role: RoleType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
  onSwitchRole
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [emailOrNik, setEmailOrNik] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');
  const [dusun, setDusun] = useState('Dusun I Bawonahono');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        const res = await api.login(emailOrNik, password);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.register({
          nik,
          email: emailOrNik,
          password,
          fullName,
          phone,
          dusun
        });
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat otentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full my-6 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#102A43] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">
                {mode === 'login' ? 'Masuk ke SIPADLO' : 'Pendaftaran Akun Warga'}
              </h3>
              <p className="text-xs text-sky-300">Desa Lolosoni, Kecamatan Gomo</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="16 Digit NIK sesuai KTP/KK"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Sesuai KTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Wilayah Dusun
                  </label>
                  <select
                    value={dusun}
                    onChange={(e) => setDusun(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="Dusun I Bawonahono">Dusun I Bawonahono</option>
                    <option value="Dusun II Hilibadalu">Dusun II Hilibadalu</option>
                    <option value="Dusun III Hiligodu">Dusun III Hiligodu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    No. Handphone / WA
                  </label>
                  <input
                    type="tel"
                    placeholder="0812..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {mode === 'login' ? 'Alamat Email atau NIK' : 'Alamat Email'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={mode === 'login' ? 'Email atau 16 digit NIK' : 'email@contoh.id'}
                value={emailOrNik}
                onChange={(e) => setEmailOrNik(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Kata Sandi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            {isLoading ? 'Memproses...' : mode === 'login' ? 'Masuk ke Sistem' : 'Daftarkan Akun'}
          </button>

          {/* Quick Demo Role Logins */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold block text-center mb-2">
              Atau masuk instan sebagai akun demo:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onSwitchRole('kades');
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-semibold text-left transition cursor-pointer"
              >
                Kepala Desa (Admin)
              </button>
              <button
                type="button"
                onClick={() => {
                  onSwitchRole('sekdes');
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-semibold text-left transition cursor-pointer"
              >
                Sekretaris Desa
              </button>
              <button
                type="button"
                onClick={() => {
                  onSwitchRole('perangkat');
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-semibold text-left transition cursor-pointer"
              >
                Kaur Pelayanan
              </button>
              <button
                type="button"
                onClick={() => {
                  onSwitchRole('masyarakat');
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-semibold text-left transition cursor-pointer"
              >
                Warga (Bezisokhi Hia)
              </button>
            </div>
          </div>

          {/* Switch Mode Toggle */}
          <div className="text-center pt-2 text-xs text-slate-600">
            {mode === 'login' ? (
              <span>
                Belum punya akun warga?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Daftar Sekarang
                </button>
              </span>
            ) : (
              <span>
                Sudah memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Masuk di sini
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

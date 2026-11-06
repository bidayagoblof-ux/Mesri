import React from 'react';
import { VillageConfig } from '../types.ts';
import { Shield, MapPin, Mail, Phone, ExternalLink, Heart } from 'lucide-react';

interface FooterProps {
  config: VillageConfig;
  onNavigate: (view: string) => void;
  onOpenTracking: () => void;
  onOpenAiAssistant: () => void;
  onOpenPhpSource?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  config,
  onNavigate,
  onOpenTracking,
  onOpenAiAssistant,
  onOpenPhpSource
}) => {
  return (
    <footer className="bg-[#102A43] text-white pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Village Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg tracking-tight">SIPADLO</h3>
                <p className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
                  Desa Lolosoni • Gomo
                </p>
              </div>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Sistem Informasi Pelayanan Administrasi Desa Lolosoni, Kecamatan Gomo, Kabupaten Nias Selatan.
              Mewujudkan pelayanan publik desa yang mandiri, berkeadilan, cepat, dan transparan berbasis teknologi digital.
            </p>
            <div className="pt-1">
              <span className="text-[11px] font-mono text-slate-400 block">
                Kode Wilayah Kemendagri: 12.14.08.2009
              </span>
            </div>
          </div>

          {/* Col 2: Navigasi Layanan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Layanan Administrasi
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('layanan')}
                  className="hover:text-white transition text-left cursor-pointer"
                >
                  Surat Keterangan Domisili
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('layanan')}
                  className="hover:text-white transition text-left cursor-pointer"
                >
                  Surat Pengantar KTP / KK
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('layanan')}
                  className="hover:text-white transition text-left cursor-pointer"
                >
                  Surat Keterangan Usaha (SKU)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('layanan')}
                  className="hover:text-white transition text-left cursor-pointer"
                >
                  Surat Keterangan Tidak Mampu (SKTM)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('layanan')}
                  className="hover:text-white transition text-left cursor-pointer"
                >
                  Surat Keterangan Kelahiran & Kematian
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Informasi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Akses Digital & Bantuan
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Pelacakan Status Berkas</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAiAssistant}
                  className="hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Asisten AI SIPADLO</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('panduan')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Panduan & Syarat Pengajuan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('profil')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Sejarah, Visi & Misi Desa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('brand_bible')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Brand Bible & Identitas Visual
                </button>
              </li>
              {onOpenPhpSource && (
                <li>
                  <button
                    onClick={onOpenPhpSource}
                    className="text-purple-300 hover:text-white transition cursor-pointer font-bold flex items-center gap-1.5"
                  >
                    <span>Source Code PHP & MySQL (OOP)</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Kontak Kantor Desa */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Kantor Pemerintah Desa
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{config.officeAddress}, Kode Pos {config.postalCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{config.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{config.contactPhone}</span>
              </div>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                Jam Pelayanan: Senin - Jumat (08.00 - 15.00 WIB)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 Pemerintah Desa Lolosoni, Kecamatan Gomo, Kabupaten Nias Selatan. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>Sistem Informasi Pelayanan Administrasi Desa (SIPADLO)</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

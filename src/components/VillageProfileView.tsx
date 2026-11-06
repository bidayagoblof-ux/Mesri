import React from 'react';
import { VillageConfig } from '../types.ts';
import {
  MapPin,
  Building,
  Users,
  Compass,
  Award,
  BookOpen,
  CheckCircle2,
  Phone,
  Mail,
  Shield
} from 'lucide-react';

interface VillageProfileViewProps {
  config: VillageConfig;
  onNavigateLayanan: () => void;
}

export const VillageProfileView: React.FC<VillageProfileViewProps> = ({
  config,
  onNavigateLayanan
}) => {
  const apparatList = [
    {
      role: 'Kepala Desa',
      name: config.kadesName,
      nip: config.kadesNip || '19780512 200801 1 003',
      education: 'S1 Ilmu Pemerintahan',
      dusun: 'Dusun I Bawonahono'
    },
    {
      role: 'Sekretaris Desa',
      name: config.sekdesName,
      nip: '19830614 201001 1 008',
      education: 'S1 Administrasi Publik',
      dusun: 'Dusun II Hilibadalu'
    },
    {
      role: 'Kaur Pelayanan & Umum',
      name: config.kaurPelayananName,
      nip: 'Aparatur Desa Lolosoni',
      education: 'SLTA / Sederajat',
      dusun: 'Dusun I Bawonahono'
    },
    {
      role: 'Kaur Keuangan',
      name: 'Faahakhododo Hia',
      nip: 'Aparatur Desa Lolosoni',
      education: 'D3 Akuntansi',
      dusun: 'Dusun III Hiligodu'
    },
    {
      role: 'Kasi Pemerintahan',
      name: 'Kurniawan Lase',
      nip: 'Aparatur Desa Lolosoni',
      education: 'SLTA / Sederajat',
      dusun: 'Dusun II Hilibadalu'
    },
    {
      role: 'Kasi Kesejahteraan',
      name: 'Yuniwati Telambanua',
      nip: 'Aparatur Desa Lolosoni',
      education: 'S1 Sosiologi',
      dusun: 'Dusun I Bawonahono'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="bg-[#102A43] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Shield className="w-96 h-96 text-sky-400" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider border border-blue-400/20">
            Profil Resmi Pemerintahan Desa
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Desa Lolosoni, Kecamatan Gomo
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Kabupaten Nias Selatan, Provinsi Sumatera Utara. Berakar pada kekayaan budaya Ono Niha dan sejarah megalitikum Gomo, melangkah maju dengan tata kelola digital modern.
          </p>
        </div>
      </div>

      {/* Visi & Misi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
            Arah & Cita-Cita Pembangunan
          </span>
          <h3 className="text-xl font-bold text-[#102A43]">Visi Desa Lolosoni</h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-200">
            "{config.vision}"
          </p>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
            Agenda Strategis
          </span>
          <h3 className="text-xl font-bold text-[#102A43]">Misi Pemerintah Desa</h3>
          <div className="space-y-3">
            {config.mission.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sejarah Desa Lolosoni */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-[#102A43]">Sejarah & Asal-Usul Desa Lolosoni</h3>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed indent-8">
          {config.history}
        </p>
        <p className="text-sm text-slate-700 leading-relaxed indent-8">
          Secara geografis, Desa Lolosoni terletak di kawasan perbukitan dataran tinggi Kecamatan Gomo yang subur, terkenal dengan komoditas pertanian dan perkebunan karet, kelapa, dan kakao. Keberadaan peninggalan batu megalitik di sekitar wilayah Gomo menjadi bukti bahwa masyarakat Lolosoni memegang teguh tradisi gotong royong dan musyawarah mufakat (Fahasara Dödö).
        </p>
      </div>

      {/* Wilayah Dusun */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#102A43]">Wilayah Dusun Administratif</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {config.dusunList.map((dusun, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-[#102A43]">{dusun}</h4>
              <p className="text-xs text-slate-500">
                Pemerintahan Desa Lolosoni, Kecamatan Gomo, Kabupaten Nias Selatan.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Struktur Organisasi Pemerintah Desa */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[#102A43]">Struktur Aparatur Pemerintah Desa</h3>
          <p className="text-xs text-slate-500 mt-1">
            Pejabat dan perangkat desa pelayan masyarakat Desa Lolosoni.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {apparatList.map((ap, i) => (
            <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                {ap.role}
              </span>
              <h4 className="font-bold text-sm text-[#102A43]">{ap.name}</h4>
              <p className="text-[11px] text-slate-500 font-mono">NIP / SK: {ap.nip}</p>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex justify-between">
                <span>Pendidikan: {ap.education}</span>
                <span>{ap.dusun}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

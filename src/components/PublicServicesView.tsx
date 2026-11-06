import React, { useState } from 'react';
import { ServiceItem } from '../types.ts';
import {
  FileText,
  Search,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Briefcase,
  Heart,
  Baby,
  X
} from 'lucide-react';

interface PublicServicesViewProps {
  services: ServiceItem[];
  onSelectService: (service: ServiceItem) => void;
  onOpenAiHelper?: (serviceName: string) => void;
}

export const PublicServicesView: React.FC<PublicServicesViewProps> = ({
  services,
  onSelectService,
  onOpenAiHelper
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [modalService, setModalService] = useState<ServiceItem | null>(null);

  const categories = ['Semua', 'Kependudukan', 'Perekonomian', 'Sosial', 'Pernikahan', 'Umum'];

  const filteredServices = services.filter((s) => {
    const matchesCat = selectedCategory === 'Semua' || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getServiceIcon = (code: string) => {
    switch (code) {
      case 'SKU':
        return Briefcase;
      case 'SKTM':
        return Heart;
      case 'SK-LAHIR':
      case 'SK-MATI':
        return Baby;
      case 'SP-NIKAH':
      case 'SK-BN':
        return Users;
      default:
        return FileText;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
          Katalog Pelayanan Publik
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102A43] tracking-tight">
          Layanan Administrasi Desa Lolosoni
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Pemerintah Desa Lolosoni menyediakan pengurusan surat keterangan dan rekomendasi dinas secara digital.
          Proses cepat, transparan, dan bebas biaya retribusi (Gratis).
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari jenis surat / layanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const Icon = getServiceIcon(service.code);
          return (
            <div
              key={service.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-slate-100 text-slate-700">
                    {service.code}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                    {service.category}
                  </span>
                  <h3 className="text-base font-bold text-[#102A43] group-hover:text-blue-700 transition">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-500 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{service.processingDays} hari kerja</span>
                  </div>
                  <div>•</div>
                  <div className="text-emerald-700 font-semibold">Gratis (Rp 0)</div>
                </div>
              </div>

              <div className="pt-6 flex items-center gap-2">
                <button
                  onClick={() => setModalService(service)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Detail Syarat
                </button>
                <button
                  onClick={() => onSelectService(service)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <span>Ajukan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Service Detail Modal */}
      {modalService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full my-6 overflow-hidden border border-slate-200">
            <div className="bg-[#102A43] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-sky-300 font-semibold uppercase tracking-wider">
                  Rincian Informasi Layanan
                </span>
                <h3 className="font-bold text-lg">{modalService.name}</h3>
              </div>
              <button
                onClick={() => setModalService(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block text-sm">Deskripsi Layanan</span>
                <p className="leading-relaxed text-slate-600">{modalService.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Waktu Penyelesaian</span>
                  <span className="font-bold text-slate-900 text-xs">{modalService.processingDays} Hari Kerja</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pejabat Berwenang</span>
                  <span className="font-bold text-slate-900 text-xs uppercase">{modalService.approvalRole}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Biaya Retribusi</span>
                  <span className="font-bold text-emerald-700 text-xs">Rp 0 (Bebas Biaya)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Kode Klasifikasi</span>
                  <span className="font-bold font-mono text-slate-900 text-xs">{modalService.letterCodePrefix}</span>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  Persyaratan Dokumen yang Wajib Disiapkan:
                </span>
                <div className="space-y-2">
                  {modalService.requirements.map((req, i) => (
                    <div key={req.id || i} className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{req.name}</span>
                          {req.isMandatory ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">Wajib</span>
                          ) : (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Opsional</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{req.hint}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalService(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const s = modalService;
                    setModalService(null);
                    onSelectService(s);
                  }}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  Ajukan Surat Ini Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

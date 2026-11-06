import React from 'react';
import { CheckCircle2, ShieldCheck, ArrowRight, HelpCircle, Clock, FileCheck } from 'lucide-react';

interface PublicGuideViewProps {
  onStartApply: () => void;
  onOpenAiAssistant: () => void;
}

export const PublicGuideView: React.FC<PublicGuideViewProps> = ({
  onStartApply,
  onOpenAiAssistant
}) => {
  const steps = [
    {
      num: '01',
      title: 'Pilih Layanan Administrasi',
      desc: 'Pilih jenis surat yang Anda butuhkan melalui katalog layanan. Baca deskripsi dan siapkan dokumen persyaratan yang diminta (seperti KTP, Kartu Keluarga, atau surat pengantar).'
    },
    {
      num: '02',
      title: 'Isi Formulir & Unggah Dokumen',
      desc: 'Lengkapi formulir permohonan dengan data valid dan unggah foto/pindai dokumen persyaratan dalam format PDF/JPG/PNG. Anda juga dapat dibantu oleh Asisten AI untuk merumuskan kalimat keperluan.'
    },
    {
      num: '03',
      title: 'Pemeriksaan & Persetujuan Berjenjang',
      desc: 'Kaur Pelayanan dan Sekretaris Desa akan memeriksa kelengkapan berkas Anda. Jika lengkap, permohonan diteruskan kepada Kepala Desa Lolosoni untuk persetujuan penandatanganan dinas.'
    },
    {
      num: '04',
      title: 'Surat Resmi Diterbitkan & Siap Diunduh',
      desc: 'Setelah disetujui, nomor registrasi resmi diterbitkan dan surat dinas ber-QR Code keabsahan dapat langsung diunduh, dicetak mandiri, atau diambil di Kantor Desa Lolosoni.'
    }
  ];

  const faqs = [
    {
      q: 'Apakah pengurusan surat di SIPADLO Desa Lolosoni dipungut biaya?',
      a: 'Tidak. Seluruh pelayanan administrasi di Pemerintah Desa Lolosoni adalah 100% GRATIS dan bebas pungutan liar.'
    },
    {
      q: 'Berapa lama waktu yang dibutuhkan hingga surat resmi selesai?',
      a: 'Waktu proses standar adalah 1 hingga 2 hari kerja setelah dokumen persyaratan diverifikasi lengkap oleh petugas desa.'
    },
    {
      q: 'Bagaimana jika berkas yang saya unggah kurang lengkap atau buram?',
      a: 'Petugas akan mengubah status permohonan menjadi "Perlu Perbaikan" disertai catatan petunjuk. Anda akan menerima notifikasi di akun untuk memperbarui berkas tanpa perlu antre di kantor desa.'
    },
    {
      q: 'Apakah surat yang diterbitkan secara digital sah di mata hukum dan instansi luar?',
      a: 'Ya, sah. Surat dinas resmi dilengkapi nomor agenda dinas desa, kode QR Code validasi keabsahan dokumen Kemendagri, serta tanda tangan dan stempel sah Kepala Desa Lolosoni.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
          Panduan & Prosedur Pelayanan
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102A43] tracking-tight">
          Alur Pelayanan Administrasi Digital
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Empat langkah mudah mengurus dokumen administrasi kependudukan di Desa Lolosoni tanpa antre dan dapat dipantau dari mana saja.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((st, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div className="text-4xl font-black text-blue-100 absolute top-4 right-4 pointer-events-none">
              {st.num}
            </div>
            <div className="space-y-3 relative z-10">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                {st.num}
              </span>
              <h3 className="text-base font-bold text-[#102A43]">{st.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 space-y-6">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-[#102A43]">Pertanyaan yang Sering Diajukan (FAQ)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((f, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-sm text-[#102A43] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{f.q}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-[#102A43] to-blue-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl font-bold">Siap Mengajukan Permohonan Surat?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
            Gunakan portal SIPADLO untuk pelayanan cepat dan transparan, atau konsultasikan kebutuhan Anda bersama Asisten AI kami.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={onOpenAiAssistant}
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer"
          >
            Tanya Asisten AI
          </button>
          <button
            onClick={onStartApply}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition cursor-pointer"
          >
            Ajukan Surat Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

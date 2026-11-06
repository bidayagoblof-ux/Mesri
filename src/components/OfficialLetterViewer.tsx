import React from 'react';
import { Letter } from '../types.ts';
import { Printer, Download, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface OfficialLetterViewerProps {
  letter: Letter;
  onClose?: () => void;
}

export const OfficialLetterViewer: React.FC<OfficialLetterViewerProps> = ({ letter, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Header Toolbar (hidden during print) */}
        <div className="no-print bg-[#102A43] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/30 text-sky-400 border border-blue-400/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Naskah Surat Resmi Pemerintah Desa Lolosoni</h3>
              <p className="text-xs text-slate-300">No. Registrasi: {letter.registrationNumber} • Sah & Terdaftar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow"
            >
              <Printer className="w-4 h-4" /> Cetak / Simpan PDF
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Official Letter Paper (A4 Style) */}
        <div id="printable-letter" className="p-8 sm:p-14 bg-white text-[#172B4D] font-serif leading-relaxed">
          {/* KOP SURAT RESMI PEMERINTAH DESA */}
          <div className="text-center pb-3 relative">
            {/* Left Emblem Logo */}
            <div className="absolute left-0 top-1 hidden sm:block">
              <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="46" stroke="#102A43" strokeWidth="3" fill="#F8FAFC" />
                <path d="M50 14L80 34V66L50 86L20 66V34L50 14Z" fill="#2563EB" opacity="0.15" stroke="#102A43" strokeWidth="2" />
                <path d="M50 24L72 38V62L50 76L28 62V38L50 24Z" fill="#F59E0B" opacity="0.25" stroke="#F59E0B" strokeWidth="2" />
                {/* Traditional Nias Omo Hada Silhouette */}
                <path d="M50 32L66 46H34L50 32Z" fill="#102A43" />
                <rect x="42" y="46" width="16" height="18" fill="#102A43" />
                <circle cx="50" cy="54" r="3" fill="#F59E0B" />
                <text x="50" y="93" textAnchor="middle" fill="#102A43" fontSize="8" fontWeight="bold" fontFamily="sans-serif">NIAS SELATAN</text>
              </svg>
            </div>

            <div className="sm:px-24">
              <h4 className="text-sm sm:text-base font-bold tracking-widest uppercase font-sans text-slate-800">
                PEMERINTAH KABUPATEN NIAS SELATAN
              </h4>
              <h3 className="text-base sm:text-lg font-bold tracking-wider uppercase font-sans text-slate-900">
                KECAMATAN GOMO
              </h3>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase font-sans text-[#102A43]">
                PEMERINTAH DESA LOLOSONI
              </h2>
              <p className="text-xs text-slate-600 font-sans mt-1">
                Alamat: Jalan Poros Desa Lolosoni, Kecamatan Gomo, Kabupaten Nias Selatan, Kode Pos 22873
              </p>
              <p className="text-xs text-slate-500 font-sans">
                Laman Resmi: sipadlo.lolosoni.desa.id • Surel: pemdes@lolosoni.desa.id
              </p>
            </div>
          </div>

          {/* Garis Pembatas Kop Surat */}
          <div className="border-t-4 border-slate-900 mt-2 mb-0.5"></div>
          <div className="border-t border-slate-900 mb-8"></div>

          {/* Judul & Nomor Surat */}
          <div className="text-center mb-8">
            <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider underline decoration-2 underline-offset-4 text-slate-900 font-sans">
              {letter.serviceName}
            </h3>
            <p className="text-sm font-sans font-medium text-slate-700 mt-1">
              Nomor: <span className="font-bold text-slate-900">{letter.letterNumber}</span>
            </p>
          </div>

          {/* Isi Surat */}
          <div className="space-y-4 text-sm sm:text-base text-justify leading-relaxed font-sans">
            <p className="indent-8">
              Yang bertanda tangan di bawah ini <span className="font-semibold">{letter.signatoryRole}</span>, Kecamatan Gomo, Kabupaten Nias Selatan, Provinsi Sumatera Utara, dengan ini menerangkan dengan sesungguhnya bahwa:
            </p>

            {/* Identitas Pemohon */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-2 pl-6 sm:pl-10 text-sm">
              <div className="font-medium text-slate-700">Nama Lengkap</div>
              <div className="col-span-2 sm:col-span-3 font-bold text-slate-900">: {letter.recipientName}</div>

              <div className="font-medium text-slate-700">NIK</div>
              <div className="col-span-2 sm:col-span-3 font-semibold text-slate-900">: {letter.recipientNik}</div>

              <div className="font-medium text-slate-700">Tempat / Tgl Lahir</div>
              <div className="col-span-2 sm:col-span-3 text-slate-900">: {letter.recipientBirth}</div>

              <div className="font-medium text-slate-700">Pekerjaan</div>
              <div className="col-span-2 sm:col-span-3 text-slate-900">: {letter.recipientOccupation}</div>

              <div className="font-medium text-slate-700">Alamat / Dusun</div>
              <div className="col-span-2 sm:col-span-3 text-slate-900">: {letter.recipientAddress}</div>
            </div>

            <p className="indent-8 mt-4">
              Nama tersebut di atas adalah benar-benar penduduk sah yang bertempat tinggal dan berdomisili di wilayah Desa Lolosoni, Kecamatan Gomo, Kabupaten Nias Selatan.
            </p>

            <p className="indent-8">
              Surat keterangan ini diberikan atas dasar permohonan yang bersangkutan serta telah melalui proses pemeriksaan administrasi desa, untuk dipergunakan sebagai:
            </p>

            <div className="p-3 bg-slate-50 border-l-4 border-blue-600 italic rounded-r text-slate-800 text-sm font-medium">
              "{letter.purpose}"
            </div>

            <p className="indent-8">
              Demikian Surat Keterangan ini diperbuat dengan sebenarnya dengan mengingat sumpah jabatan untuk dapat dipergunakan sebagaimana mestinya oleh pihak yang berkepentingan.
            </p>
          </div>

          {/* Tempat, Tanggal, Tanda Tangan & QR Code */}
          <div className="mt-12 pt-4 flex flex-col sm:flex-row justify-between items-end font-sans">
            {/* QR Code Validation Box */}
            <div className="w-full sm:w-auto p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-4 mb-6 sm:mb-0">
              {/* Graphic QR Code Representation */}
              <div className="w-20 h-20 bg-white p-1.5 border border-slate-300 rounded shadow-sm flex flex-col items-center justify-center">
                <svg className="w-full h-full text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="6" height="6" />
                  <rect x="15" y="3" width="6" height="6" />
                  <rect x="3" y="15" width="6" height="6" />
                  <path d="M15 15h2v2h-2z" fill="currentColor" />
                  <path d="M19 15h2v6h-6v-2h4v-4z" fill="currentColor" />
                  <path d="M10 3h4v4h-4z" fill="currentColor" />
                  <path d="M3 10h4v4H3z" fill="currentColor" />
                  <path d="M10 10h4v4h-4z" fill="currentColor" />
                </svg>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> DIVERIFIKASI RESMI
                </div>
                <div className="text-[11px] text-slate-600">Sistem Pelayanan SIPADLO</div>
                <div className="text-[10px] font-mono text-slate-500 max-w-[200px] truncate">
                  Kode: {letter.qrVerificationCode}
                </div>
                <div className="text-[10px] text-slate-400">Pemerintah Desa Lolosoni</div>
              </div>
            </div>

            {/* Kolom Tanda Tangan & Cap Desa */}
            <div className="text-center sm:text-right w-full sm:w-64 space-y-1">
              <p className="text-sm text-slate-700">
                Lolosoni, {new Date(letter.letterDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm font-semibold text-slate-900">{letter.signatoryRole}</p>

              {/* Ruang Stempel Cap dan TTD */}
              <div className="h-24 relative flex items-center justify-center sm:justify-end my-1">
                {/* Visual Cap Stempel Resmi Desa Lolosoni */}
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-600/60 flex items-center justify-center p-1 opacity-80 rotate-[-12deg]">
                  <div className="w-full h-full rounded-full border border-blue-600/60 flex flex-col items-center justify-center text-[7px] font-bold text-blue-700 uppercase tracking-tighter">
                    <span>PEMERINTAH DESA</span>
                    <span className="text-[8px] my-0.5 text-blue-900">★ LOLOSONI ★</span>
                    <span>KEC. GOMO</span>
                  </div>
                </div>
              </div>

              <p className="text-sm font-bold text-slate-900 underline decoration-slate-900 underline-offset-2">
                {letter.signatoryName}
              </p>
              <p className="text-xs text-slate-600">NIP. 19780512 200801 1 003</p>
            </div>
          </div>
        </div>

        {/* Footer info (no-print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-3 text-xs text-slate-500 flex justify-between items-center">
          <span>Surat ini merupakan dokumen resmi yang diterbitkan melalui Sistem Informasi Pelayanan Administrasi Desa Lolosoni (SIPADLO).</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

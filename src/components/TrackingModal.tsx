import React, { useState } from 'react';
import { Application, Letter } from '../types.ts';
import { api } from '../api.ts';
import { Search, ShieldCheck, Clock, CheckCircle2, AlertTriangle, FileText, X, ArrowRight, Printer } from 'lucide-react';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewLetter?: (letter: Letter) => void;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({ isOpen, onClose, onViewLetter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [letter, setLetter] = useState<Letter | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    setIsLoading(true);
    setErrorMsg(null);
    setApplication(null);
    setLetter(null);

    try {
      const apps = await api.getApplications({ search: query });
      if (apps.length === 0) {
        setErrorMsg(`Tidak ditemukan permohonan dengan Nomor Registrasi / NIK "${query}". Mohon pastikan nomor yang Anda masukkan benar.`);
      } else {
        const found = apps[0];
        setApplication(found);
        if (found.letterId) {
          try {
            const letRes = await api.getLetterById(found.letterId);
            setLetter(letRes);
          } catch (e) {
            console.warn('Letter fetch note:', e);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mencari status permohonan.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selesai':
        return <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">Selesai & Diterbitkan</span>;
      case 'disetujui':
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">Telah Disetujui</span>;
      case 'menunggu_persetujuan':
        return <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">Menunggu Persetujuan Kades/Sekdes</span>;
      case 'terverifikasi':
        return <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">Terverifikasi Berkas</span>;
      case 'perlu_perbaikan':
        return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">Perlu Perbaikan Berkas</span>;
      case 'ditolak':
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">Permohonan Ditolak</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">Menunggu Pemeriksaan</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#102A43] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/30 text-sky-400 border border-blue-400/20">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Pelacakan Status Permohonan Publik</h3>
              <p className="text-xs text-slate-300">Pantau proses permohonan surat secara transparan & real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Masukkan Nomor Registrasi (REG-LSN-...) atau NIK..."
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchTerm.trim()}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? 'Mencari...' : 'Lacak'}</span>
            </button>
          </form>

          {/* Quick Example Links */}
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>Contoh pencarian:</span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('REG-LSN-2026-0001');
              }}
              className="font-mono text-blue-600 hover:underline"
            >
              REG-LSN-2026-0001
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('REG-LSN-2026-0002');
              }}
              className="font-mono text-blue-600 hover:underline"
            >
              REG-LSN-2026-0002
            </button>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result Card */}
          {application && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      No. Registrasi: {application.registrationNumber}
                    </span>
                    <h4 className="text-base font-bold text-[#102A43]">{application.serviceName}</h4>
                  </div>
                  <div>{getStatusBadge(application.status)}</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama Pemohon</span>
                    <span className="font-semibold text-slate-900">{application.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Dusun / Lokasi</span>
                    <span className="font-semibold text-slate-900">{application.applicantDusun}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tanggal Pengajuan</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(application.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700 block mb-0.5">Keperluan Permohonan:</span>
                  <p className="text-slate-600 italic">"{application.purpose}"</p>
                </div>

                {application.officerNotes && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                    <span className="font-semibold block mb-0.5">Catatan Petugas Administrasi:</span>
                    <p>{application.officerNotes}</p>
                  </div>
                )}

                {/* If letter ready, button to view/print */}
                {letter && onViewLetter && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        onViewLetter(letter);
                        onClose();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4" /> Lihat & Cetak Surat Resmi (No. {letter.letterNumber})
                    </button>
                  </div>
                )}
              </div>

              {/* Status Timeline History */}
              <div>
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Riwayat Perjalanan Berkas (Audit Trail)
                </h5>
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                  {application.statusHistories.map((hist, idx) => (
                    <div key={hist.id || idx} className="flex items-start gap-3 relative">
                      <div className="w-7 h-7 rounded-full bg-white border-2 border-blue-600 text-blue-600 flex items-center justify-center shrink-0 z-10">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center justify-between text-slate-500 mb-0.5">
                          <span className="font-semibold text-slate-900 capitalize">
                            {hist.toStatus.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px]">
                            {new Date(hist.createdAt).toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </span>
                        </div>
                        <p className="text-slate-600">{hist.notes || 'Status berhasil diperbarui'}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Oleh: {hist.actorName} ({hist.actorRole})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

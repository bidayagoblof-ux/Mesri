import React, { useState } from 'react';
import { ServiceItem, User } from '../types.ts';
import { api } from '../api.ts';
import { X, Upload, CheckCircle2, ShieldCheck, FileText, AlertCircle, Sparkles } from 'lucide-react';

interface ApplicationFormModalProps {
  service: ServiceItem;
  user: User | null;
  onClose: () => void;
  onSuccess: (regNumber: string) => void;
  onOpenAiHelper?: (prompt: string) => void;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  service,
  user,
  onClose,
  onSuccess,
  onOpenAiHelper
}) => {
  const [purpose, setPurpose] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<
    { requirementName: string; fileName: string; fileSize: number; fileType: string; fileUrl: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File upload handler
  const handleFileUpload = (reqName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc = {
        requirementName: reqName,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/pdf',
        fileUrl: URL.createObjectURL(file)
      };

      setUploadedFiles((prev) => [
        ...prev.filter((f) => f.requirementName !== reqName),
        newDoc
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Silakan masuk ke akun Anda terlebih dahulu sebelum mengajukan permohonan.');
      return;
    }

    if (!purpose.trim()) {
      setErrorMsg('Tujuan atau keperluan permohonan wajib diisi dengan jelas.');
      return;
    }

    // Check mandatory requirements
    const mandatoryReqs = service.requirements.filter((r) => r.isMandatory);
    for (const req of mandatoryReqs) {
      const uploaded = uploadedFiles.some((f) => f.requirementName === req.name);
      if (!uploaded) {
        setErrorMsg(`Dokumen persyaratan wajib "${req.name}" belum diunggah.`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.createApplication({
        serviceId: service.id,
        purpose,
        customData: customFields,
        documents: uploadedFiles
      });
      onSuccess(res.registrationNumber);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mengirimkan permohonan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#102A43] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/30 text-sky-400 border border-blue-400/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">
                Formulir Pengajuan Pelayanan
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">{service.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Service Specs Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-[#102A43] mb-0.5">{service.description}</p>
              <p className="text-slate-500">
                Waktu proses: <span className="font-bold text-blue-700">{service.processingDays} hari kerja</span> • Bebas biaya (Gratis).
              </p>
            </div>
          </div>

          {/* Applicant Info (Pre-filled) */}
          {user ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800 text-sm mb-1">Identitas Pemohon (Terverifikasi Akun)</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Lengkap</span>
                  <span className="font-semibold text-slate-900">{user.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">NIK</span>
                  <span className="font-semibold text-slate-900">{user.nik || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Dusun</span>
                  <span className="font-semibold text-slate-900">{user.dusun || 'Desa Lolosoni'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">No. Telepon / WhatsApp</span>
                  <span className="font-semibold text-slate-900">{user.phone || '-'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Anda belum masuk ke akun. Silakan login terlebih dahulu untuk mengajukan permohonan.</span>
            </div>
          )}

          {/* Purpose / Keperluan Permohonan */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Tujuan / Keperluan Permohonan <span className="text-red-500">*</span>
              </label>
              {onOpenAiHelper && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenAiHelper(
                      `Tolong bantu saya merumuskan kalimat keperluan untuk permohonan ${service.name} di Desa Lolosoni agar rapi dan formal.`
                    )
                  }
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Bantu dengan AI</span>
                </button>
              )}
            </div>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={3}
              placeholder="Contoh: Persyaratan pembukaan rekening bank, pengajuan beasiswa kuliah, atau kelengkapan administrasi..."
              className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              required
            />
          </div>

          {/* Dynamic Service Specific Custom Fields */}
          {service.code === 'SKU' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Usaha / Toko</label>
                <input
                  type="text"
                  placeholder="Contoh: Kios Berkah Zagoto"
                  value={customFields.namaUsaha || ''}
                  onChange={(e) => setCustomFields({ ...customFields, namaUsaha: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Bidang Usaha</label>
                <input
                  type="text"
                  placeholder="Contoh: Kelontong / Perkebunan Karet"
                  value={customFields.jenisUsaha || ''}
                  onChange={(e) => setCustomFields({ ...customFields, jenisUsaha: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          )}

          {service.code === 'SKTM' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Anggota Keluarga / Anak</label>
                <input
                  type="text"
                  placeholder="Nama anak yang dibantu"
                  value={customFields.namaAnak || ''}
                  onChange={(e) => setCustomFields({ ...customFields, namaAnak: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instansi / Sekolah Tujuan</label>
                <input
                  type="text"
                  placeholder="Contoh: Universitas Negeri Medan"
                  value={customFields.instansiTujuan || ''}
                  onChange={(e) => setCustomFields({ ...customFields, instansiTujuan: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          )}

          {/* Requirements File Upload Checklist */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Unggah Dokumen Persyaratan
              </label>
              <p className="text-xs text-slate-500">
                Format didukung: PDF, JPG, PNG (Maksimal 2MB per berkas).
              </p>
            </div>

            <div className="space-y-2.5">
              {service.requirements.map((req) => {
                const uploaded = uploadedFiles.find((f) => f.requirementName === req.name);
                return (
                  <div
                    key={req.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
                      uploaded
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : req.isMandatory
                        ? 'border-slate-300 bg-white'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">{req.name}</span>
                        {req.isMandatory ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                            Wajib
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            Opsional
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{req.hint}</p>
                      {uploaded && (
                        <p className="text-[11px] font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Terunggah: {uploaded.fileName} ({(uploaded.fileSize / 1024).toFixed(0)} KB)
                        </p>
                      )}
                    </div>

                    {/* File Input button */}
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploaded ? 'Ganti Berkas' : 'Pilih Berkas'}</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(req.name, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !user}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Mengirimkan...' : 'Kirim Permohonan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

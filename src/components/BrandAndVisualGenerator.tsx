import React, { useState } from 'react';
import { api } from '../api.ts';
import {
  Palette,
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Check,
  Type,
  Shield,
  Layers,
  Sliders,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface PaletteColor {
  hex: string;
  name: string;
  usage: string;
}

export const BrandAndVisualGenerator: React.FC = () => {
  // Tab state: 'brand_bible' or 'ai_image_gen'
  const [activeTab, setActiveTab] = useState<'brand_bible' | 'ai_image_gen'>('brand_bible');

  // Brand Bible Generator State
  const [villageMission, setVillageMission] = useState(
    'Mewujudkan Desa Lolosoni yang Maju, Berdaya Saing, Mandiri, Berkeadilan, dan Religius Berbasis Pelayanan Publik Terpadu dan Kearifan Lokal Ono Niha Nias Selatan.'
  );
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // 5-Color Hex Palette with usage notes
  const [palette, setPalette] = useState<PaletteColor[]>([
    {
      hex: '#102A43',
      name: 'Navy Blue (Warna Utama Kedinasan)',
      usage: 'Warna resmi header surat, kop naskah dinas, latar belakang navbar utama, dan lambang wibawa pemerintah desa.'
    },
    {
      hex: '#2563EB',
      name: 'Royal Blue (Aksen Digital)',
      usage: 'Warna tombol aksi utama (CTA), status permohonan aktif, tautan interaktif, dan portal layanan digital SIPADLO.'
    },
    {
      hex: '#38BDF8',
      name: 'Sky Blue (Komunikasi & Inovasi)',
      usage: 'Elemen grafis visual 3D, badge status terverifikasi, ornamen teknologi, dan ikon asistensi kecerdasan buatan.'
    },
    {
      hex: '#16A34A',
      name: 'Forest Green (Kesejahteraan & Alam Gomo)',
      usage: 'Status selesai/disetujui, indikator verifikasi berhasil, lanskap hijau pertanian/perkebunan karet Desa Lolosoni.'
    },
    {
      hex: '#F59E0B',
      name: 'Nias Heritage Gold (Tradisi & Megalitikum)',
      usage: 'Mahkota ornamen rumah adat Omo Sebua, bintang lambang desa, stempel kehormatan, dan penanda status peringatan.'
    }
  ]);

  // AI Image Generation state (Gemini 3 Pro Image with 1K, 2K, 4K resolution picker)
  const [imagePrompt, setImagePrompt] = useState(
    'Official government emblem seal of Desa Lolosoni Nias Selatan, featuring traditional Omo Sebua house geometry, gold megalith stones, rice and cotton wreath, modern blue cyber vector badge, clean vector art, 8k sharp'
  );
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3'>('1:1');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleGenerateAiImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const res = await api.generateHighQualityImage({
        prompt: imagePrompt,
        aspectRatio,
        imageSize
      });
      setGeneratedImage(res.imageUrl);
    } catch (err: any) {
      setImageError(err?.message || 'Gagal menghasilkan gambar resolusi tinggi.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
      {/* Top Header */}
      <div className="bg-[#102A43] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-semibold mb-2 border border-blue-400/20">
            <Palette className="w-3.5 h-3.5" /> Brand Identity & Official Asset Generator
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Brand Bible & Generator Identitas Visual Desa
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Panduan lengkap identitas visual Desa Lolosoni mencakup logo primer, stempel dinas, palet 5 warna resmi, tipografi Google Fonts, dan generator gambar beresolusi tinggi (1K, 2K, 4K) berbasis Gemini AI.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-700/60 shrink-0">
          <button
            onClick={() => setActiveTab('brand_bible')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'brand_bible'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Brand Bible
          </button>
          <button
            onClick={() => setActiveTab('ai_image_gen')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai_image_gen'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-300" /> AI High-Res Studio
          </button>
        </div>
      </div>

      {activeTab === 'brand_bible' ? (
        <div className="p-6 sm:p-10 space-y-10">
          {/* Section 1: Logo Primer & Secondary Marks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#102A43]">1. Lambang Resmi & Cap Dinas (Primary & Secondary Marks)</h3>
                <p className="text-xs text-slate-500">Filosofi perpaduan kearifan megalitikum Nias Selatan dan modernitas pelayanan digital</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Logo */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center text-center space-y-3">
                <div className="w-32 h-32 p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
                  <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="46" stroke="#102A43" strokeWidth="4" fill="#F8FAFC" />
                    <circle cx="50" cy="50" r="40" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
                    <path d="M50 14L80 34V66L50 86L20 66V34L50 14Z" fill="#2563EB" opacity="0.15" stroke="#102A43" strokeWidth="2" />
                    <path d="M50 28L68 44H32L50 28Z" fill="#102A43" />
                    <rect x="42" y="44" width="16" height="18" fill="#102A43" />
                    <circle cx="50" cy="53" r="3" fill="#F59E0B" />
                    <path d="M30 68C40 74 60 74 70 68" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                    <text x="50" y="93" textAnchor="middle" fill="#102A43" fontSize="8" fontWeight="bold" fontFamily="sans-serif">DESA LOLOSONI</text>
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#102A43]">Logo Primer Desa Lolosoni</h4>
                  <p className="text-xs text-slate-500 mt-1">Digunakan pada Kop Naskah Dinas, Portal Resmi Web, dan Spanduk Pemerintahan.</p>
                </div>
              </div>

              {/* Secondary Mark: Stempel Resmi Cap Dinas */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center text-center space-y-3">
                <div className="w-32 h-32 p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-700 p-1 flex items-center justify-center">
                    <div className="w-full h-full rounded-full border border-blue-700 flex flex-col items-center justify-center text-[7px] font-bold text-blue-800 tracking-tighter">
                      <span>PEMERINTAH DESA</span>
                      <span className="text-[9px] text-amber-600 font-extrabold my-0.5">★ LOLOSONI ★</span>
                      <span>KECAMATAN GOMO</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#102A43]">Stempel Dinas Resmi</h4>
                  <p className="text-xs text-slate-500 mt-1">Cap pengesahan dokumen fisik dan digital bertanda tangan Kepala Desa.</p>
                </div>
              </div>

              {/* Secondary Mark: Monogram SIPADLO Cyber Badge */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center text-center space-y-3">
                <div className="w-32 h-32 p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-2xl bg-[#102A43] flex flex-col items-center justify-center text-white p-2 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500/40 rounded-full blur-md"></div>
                    <Shield className="w-8 h-8 text-sky-400 mb-1" />
                    <span className="text-xs font-black tracking-widest text-white">SIPADLO</span>
                    <span className="text-[8px] text-sky-300 font-medium">DIGITAL NIAS</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#102A43]">Monogram Digital SIPADLO</h4>
                  <p className="text-xs text-slate-500 mt-1">Favicon aplikasi, lencana verifikasi QR Code, dan ikon aplikasi mobile.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Palet 5 Warna Hex & Usage Notes */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[#102A43]">2. Palet 5-Warna Resmi & Catatan Penggunaan (Color System)</h3>
              <p className="text-xs text-slate-500">Kombinasi warna standar pemerintahan digital untuk menjaga konsistensi visual.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {palette.map((color, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                  {/* Color Swatch */}
                  <div
                    className="h-24 w-full flex items-end p-3 text-white justify-between shadow-inner"
                    style={{ backgroundColor: color.hex }}
                  >
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                      {color.hex}
                    </span>
                    <button
                      onClick={() => handleCopyHex(color.hex)}
                      className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 transition cursor-pointer text-white"
                      title="Salin Kode HEX"
                    >
                      {copiedHex === color.hex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Description */}
                  <div className="p-3.5 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">{color.name}</h4>
                    <p className="text-[11px] text-slate-600 leading-normal">{color.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Suggested Google Font Pairings */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[#102A43]">3. Rekomendasi Tipografi Google Fonts</h3>
              <p className="text-xs text-slate-500">Pasangan font modern yang menjamin keterbacaan tinggi di segala ukuran layar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Header Font */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-sm text-slate-900">Font Judul / Header</h4>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Plus Jakarta Sans
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-[#102A43]">
                  Pelayanan Administrasi Desa Modern
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Digunakan untuk Judul Utama (H1-H4), nama lembaga, kop surat resmi, kartu statistik, dan tombol navigasi. Memberikan kesan berwibawa, profesional, dan modern.
                </p>
                <div className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200">
                  font-family: 'Plus Jakarta Sans', sans-serif; (Weight: 600, 700, 800)
                </div>
              </div>

              {/* Body Font */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-sm text-slate-900">Font Teks Isi / Body</h4>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Inter
                  </span>
                </div>
                <p className="text-sm font-normal text-slate-700 leading-relaxed">
                  Pemerintah Desa Lolosoni berkomitmen menyediakan pelayanan administrasi kependudukan yang transparan, bebas pungutan liar, dan terintegrasi secara digital.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Digunakan untuk naskah surat resmi, paragraf keterangan, formulir isian, tabel data penduduk, dan notifikasi. Keterbacaan sangat jernih pada layar kecil.
                </p>
                <div className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200">
                  font-family: 'Inter', sans-serif; (Weight: 400, 500)
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Section: Gemini AI High-Resolution Image Studio (1K, 2K, 4K resolution picker) */
        <div className="p-6 sm:p-10 space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-xl font-bold text-[#102A43]">Studio Gambar Resolusi Tinggi (Gemini AI)</h3>
            <p className="text-sm text-slate-600 mt-1">
              Hasilkan visual konsep resmi desa, kop lambang ornamen nias, atau lanskap digital dengan model <span className="font-semibold text-blue-600">gemini-3-pro-image</span> yang mendukung ukuran resolusi 1K, 2K, dan 4K.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Input Controls */}
            <div className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Deskripsi Prompt Gambar
                </label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  rows={4}
                  className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
                  placeholder="Deskripsikan konsep gambar yang ingin dihasilkan..."
                />
              </div>

              {/* Affordance for User to Specify Image Size (1K, 2K, 4K) as required */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Ukuran Resolusi Gambar (Affordance Ukuran)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1K', '2K', '4K'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setImageSize(sz)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                        imageSize === sz
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{sz} Ultra-HD</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  1K (1024px standar), 2K (2048px tajam), 4K (4096px resolusi cetak format besar).
                </p>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Rasio Aspek (Aspect Ratio)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { ratio: '1:1', label: '1:1 Persegi' },
                    { ratio: '16:9', label: '16:9 Banner' },
                    { ratio: '4:3', label: '4:3 Dokumen' }
                  ].map((item) => (
                    <button
                      key={item.ratio}
                      type="button"
                      onClick={() => setAspectRatio(item.ratio as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                        aspectRatio === item.ratio
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateAiImage}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menghasilkan Gambar Resolusi {imageSize}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sky-300" />
                    <span>Hasilkan Gambar {imageSize} dengan Gemini AI</span>
                  </>
                )}
              </button>

              {imageError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  {imageError}
                </div>
              )}
            </div>

            {/* Image Preview Canvas */}
            <div className="flex flex-col items-center justify-center min-h-[380px] p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 relative">
              {generatedImage ? (
                <div className="space-y-4 w-full">
                  <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-black flex items-center justify-center max-h-[360px]">
                    <img
                      src={generatedImage}
                      alt="Generated Asset"
                      className="w-full h-auto object-contain max-h-[360px]"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Format: PNG • Resolusi: {imageSize} • Rasio: {aspectRatio}</span>
                    <a
                      href={generatedImage}
                      download={`sipadlo-asset-${imageSize.toLowerCase()}.png`}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-1.5 hover:bg-blue-700 transition"
                    >
                      <Download className="w-4 h-4" /> Unduh Gambar
                    </a>
                  </div>
                </div>
              ) : isGeneratingImage ? (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto"></div>
                  <h4 className="font-bold text-sm text-slate-800">Menghasilkan Gambar Resolusi {imageSize}...</h4>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Model sedang memproses detail grafis dan tekstur visual. Ini membutuhkan beberapa detik.
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-2 text-slate-400">
                  <ImageIcon className="w-12 h-12 mx-auto stroke-1" />
                  <p className="text-sm font-medium">Belum ada gambar yang dihasilkan</p>
                  <p className="text-xs max-w-xs">
                    Tentukan deskripsi prompt dan pilih resolusi 1K, 2K, atau 4K di panel samping, lalu klik Hasilkan Gambar.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Code2,
  FileCode,
  Download,
  Copy,
  Check,
  Database as DatabaseIcon,
  BookOpen,
  FolderTree,
  Server,
  Layers,
  ExternalLink
} from 'lucide-react';

interface PhpSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PhpFileItem {
  path: string;
  name: string;
  size: number;
  category: string;
}

export const PhpSourceModal: React.FC<PhpSourceModalProps> = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState<PhpFileItem[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('README.md');
  const [currentContent, setCurrentContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [bundleDownloading, setBundleDownloading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'code' | 'guide'>('code');

  useEffect(() => {
    if (isOpen) {
      fetchFilesList();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPath && isOpen) {
      fetchFileContent(selectedPath);
    }
  }, [selectedPath, isOpen]);

  const fetchFilesList = async () => {
    try {
      const res = await fetch('/api/php-project/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
        if (!selectedPath && data.length > 0) {
          setSelectedPath('README.md');
        }
      }
    } catch (err) {
      console.error('Failed to load PHP files list:', err);
    }
  };

  const fetchFileContent = async (filePath: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/php-project/file?path=${encodeURIComponent(filePath)}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentContent(data.content);
      } else {
        setCurrentContent('// Gagal memuat isi berkas.');
      }
    } catch (err) {
      console.error('Failed to fetch file content:', err);
      setCurrentContent('// Kesalahan koneksi memuat berkas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!currentContent) return;
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    if (!currentContent || !selectedPath) return;
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedPath.split('/').pop() || 'file.php';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllBundle = async () => {
    setBundleDownloading(true);
    try {
      const res = await fetch('/api/php-project/bundle');
      if (!res.ok) throw new Error('Gagal mengunduh bundle.');
      const data = await res.json();

      // Create a text archive of all files
      let combined = `# =========================================================================\n# SIPADLO - SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA LOLOSONI\n# ARSIP LENGKAP KODE SUMBER PHP (OOP) & MYSQL\n# =========================================================================\n\n`;

      for (const [filePath, content] of Object.entries(data.files)) {
        combined += `\n\n# =========================================================================\n# FILE: ${filePath}\n# =========================================================================\n${content}\n`;
      }

      const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SIPADLO_PHP_MYSQL_OOP_Desa_Lolosoni.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Bundle download failed:', err);
      alert('Gagal mengunduh berkas lengkap.');
    } finally {
      setBundleDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#102A43] via-[#1A365D] to-blue-900 text-white flex items-center justify-between border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-sky-400 shadow-sm">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-white">Source Code PHP & MySQL (OOP)</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 uppercase tracking-widest">
                  Native OOP + PDO
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Sistem Informasi Pelayanan Administrasi Desa Lolosoni • Siap Dijalankan di XAMPP / Laragon
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'code' ? 'bg-blue-600 text-white' : 'bg-navy-800 text-slate-300 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Jelajah Kode</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'guide' ? 'bg-blue-600 text-white' : 'bg-navy-800 text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Panduan Instalasi</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'code' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
            {/* Sidebar File Tree */}
            <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-blue-600" /> Daftar Berkas Proyek ({files.length})
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">OOP</span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {files.map((file) => {
                  const isSelected = selectedPath === file.path;
                  const isSql = file.path.endsWith('.sql');
                  const isModel = file.path.startsWith('models/');
                  const isConfig = file.path.startsWith('config/');
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedPath(file.path)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {isSql ? (
                          <DatabaseIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-amber-500'}`} />
                        ) : isModel ? (
                          <Layers className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-purple-500'}`} />
                        ) : isConfig ? (
                          <Server className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                        ) : (
                          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                        )}
                        <span className="truncate">{file.path}</span>
                      </div>
                      <span className={`text-[10px] shrink-0 font-mono ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Download All Bundle Button */}
              <div className="p-3 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={handleDownloadAllBundle}
                  disabled={bundleDownloading}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#102A43] hover:bg-navy-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>{bundleDownloading ? 'Membundel...' : 'Unduh Semua Kode (.TXT/ZIP)'}</span>
                </button>
              </div>
            </div>

            {/* Code Viewer Panel */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 text-slate-100">
              {/* File Title Bar */}
              <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-xs font-bold text-sky-400">{selectedPath}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {selectedPath.endsWith('.sql') ? 'MySQL Schema' : selectedPath.endsWith('.md') ? 'Markdown' : 'PHP (OOP)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSingleFile}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh File</span>
                  </button>
                </div>
              </div>

              {/* Code Text Content */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 font-mono text-xs leading-relaxed">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    Memuat isi berkas...
                  </div>
                ) : (
                  <pre className="text-slate-200 whitespace-pre font-mono selection:bg-blue-600 selection:text-white">
                    {currentContent}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Installation Guide Tab */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Panduan Skripsi & Pengujian</span>
                <h3 className="text-xl font-extrabold text-slate-800 mt-1">
                  Cara Menjalankan SIPADLO (PHP & MySQL) di Komputer Lokal / XAMPP
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Proyek ini dirancang secara berorientasi objek (OOP) dengan PDO, sehingga kompatibel dengan PHP 7.4, PHP 8.0, 8.1, 8.2, dan MySQL/MariaDB pada XAMPP atau Laragon.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-bold flex items-center justify-center mb-3">
                    1
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Salin Berkas Proyek</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Buat folder baru bernama <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">sipadlo</code> di dalam direktori <code className="bg-slate-100 px-1 py-0.5 rounded">C:\xampp\htdocs\</code> atau <code className="bg-slate-100 px-1 py-0.5 rounded">C:\laragon\www\</code>, lalu letakkan seluruh berkas PHP ini di dalamnya.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-bold flex items-center justify-center mb-3">
                    2
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Import Database MySQL</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Buka <code className="bg-slate-100 px-1 py-0.5 rounded">http://localhost/phpmyadmin</code>, buat database <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">sipadlo_lolosoni</code>, lalu import berkas <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-600">database.sql</code>.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-bold flex items-center justify-center mb-3">
                    3
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Cek Koneksi Database</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Buka file <code className="bg-slate-100 px-1 py-0.5 rounded">config/Database.php</code>. Default XAMPP menggunakan username <code className="bg-slate-100 px-1 py-0.5 rounded">root</code> tanpa kata sandi.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-bold flex items-center justify-center mb-3">
                    4
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Buka Aplikasi di Browser</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Akses alamat <code className="bg-blue-50 text-blue-700 font-bold px-1 py-0.5 rounded">http://localhost/sipadlo</code>. Anda dapat menguji login dengan tombol 1-Klik untuk Kades, Sekdes, Perangkat, dan Warga.
                  </p>
                </div>
              </div>

              {/* Academic Details Card */}
              <div className="bg-gradient-to-r from-blue-900 to-[#102A43] text-white p-6 rounded-2xl shadow-sm">
                <h4 className="font-bold text-sm text-sky-300 uppercase tracking-wider mb-2">Informasi Penelitian</h4>
                <p className="text-xs leading-relaxed text-slate-200">
                  <strong>Judul:</strong> IMPLEMENTASI SISTEM INFORMASI PELAYANAN ADMINISTRASI DESA BERBASIS WEB MENGGUNAKAN PENDEKATAN BERORIENTASI OBJEK DI DESA LOLOSONI KABUPATEN NIAS SELATAN.
                </p>
                <div className="mt-3 pt-3 border-t border-navy-700 flex flex-wrap gap-4 text-xs text-slate-300">
                  <span><strong>Lokasi:</strong> Desa Lolosoni, Kec. Gomo, Nias Selatan</span>
                  <span><strong>Metodologi:</strong> Object-Oriented Programming (OOP)</span>
                  <span><strong>DBMS:</strong> MySQL / MariaDB Relasional</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Kode sumber lengkap memenuhi standar tugas akhir / skripsi berbasis OOP PHP & MySQL.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
          >
            Tutup Jendela
          </button>
        </div>

      </div>
    </div>
  );
};

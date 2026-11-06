import React, { useState, useEffect } from 'react';
import {
  User,
  Application,
  ServiceItem,
  Letter,
  Resident,
  SystemStats,
  ActivityLog,
  ApplicationStatus
} from '../types.ts';
import { api } from '../api.ts';
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Settings,
  Archive,
  Printer,
  BarChart3,
  Search,
  Filter,
  Eye,
  Check,
  XCircle,
  FileCheck2,
  Database,
  Download,
  Plus,
  RefreshCw,
  Sparkles,
  Shield,
  UserCheck,
  TrendingUp,
  BarChart2,
  Activity,
  Code2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface DashboardViewProps {
  currentUser: User;
  onOpenApplyModal: (service: ServiceItem) => void;
  onViewLetter: (letter: Letter) => void;
  services: ServiceItem[];
  onOpenAiAssistant?: () => void;
  onOpenPhpSource?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onOpenApplyModal,
  onViewLetter,
  services,
  onOpenAiAssistant,
  onOpenPhpSource
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'applications' | 'services_mgmt' | 'residents' | 'letters' | 'reports' | 'logs' | 'sql_schema'
  >('overview');

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartViewMode, setChartViewMode] = useState<'area' | 'bar'>('area');
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState<'all' | 'submitted' | 'processed' | 'completed'>('all');

  // Selected App for Action Modals
  const [actionApp, setActionApp] = useState<Application | null>(null);
  const [actionType, setActionType] = useState<'verify' | 'revise' | 'approve' | 'reject' | 'issue' | 'view' | null>(null);
  const [officerNotes, setOfficerNotes] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Load Data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, appsData, lettersData] = await Promise.all([
        api.getStats(),
        api.getApplications({
          mine: currentUser.role === 'masyarakat',
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery || undefined
        }),
        api.getLetters()
      ]);

      setStats(statsData);
      setApplications(appsData);
      setLetters(lettersData);

      if (currentUser.role !== 'masyarakat') {
        const [resData, logsData] = await Promise.all([
          api.getResidents(),
          api.getActivityLogs()
        ]);
        setResidents(resData);
        setActivityLogs(logsData);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentUser, statusFilter, searchQuery]);

  // Load SQL Schema when tab clicked
  const handleLoadSqlSchema = async () => {
    setActiveTab('sql_schema');
    try {
      const sql = await api.downloadSchemaSql();
      setSqlSchema(sql);
    } catch (err) {
      console.warn('Failed to fetch sql schema:', err);
    }
  };

  // Perform workflow status action
  const handleExecuteStatusAction = async () => {
    if (!actionApp || !actionType) return;
    setIsProcessingAction(true);
    try {
      if (actionType === 'verify') {
        // Kaur / Sekdes marks verified and forwards to Kades/Sekdes
        await api.updateApplicationStatus(
          actionApp.id,
          'menunggu_persetujuan',
          officerNotes || 'Berkas telah diperiksa dan lengkap. Diteruskan untuk persetujuan surat.'
        );
      } else if (actionType === 'revise') {
        await api.updateApplicationStatus(
          actionApp.id,
          'perlu_perbaikan',
          officerNotes || 'Mohon melengkapi kembali dokumen yang kurang jelas.'
        );
      } else if (actionType === 'approve') {
        // Kades / Sekdes approves
        await api.updateApplicationStatus(
          actionApp.id,
          'disetujui',
          officerNotes || 'Permohonan telah disetujui. Siap diterbitkan naskah surat resmi.'
        );
      } else if (actionType === 'reject') {
        await api.updateApplicationStatus(
          actionApp.id,
          'ditolak',
          officerNotes || 'Permohonan tidak memenuhi ketentuan yang berlaku.'
        );
      } else if (actionType === 'issue') {
        // Issue official letter with standardized letter number
        const letter = await api.issueLetter(
          actionApp.id,
          currentUser.fullName,
          currentUser.role === 'kades' ? 'Kepala Desa Lolosoni' : 'Sekretaris Desa a.n. Kepala Desa'
        );
        setActionType(null);
        setActionApp(null);
        await loadDashboardData();
        onViewLetter(letter);
        return;
      }

      setActionType(null);
      setActionApp(null);
      setOfficerNotes('');
      await loadDashboardData();
    } catch (err: any) {
      alert(err?.message || 'Gagal memperbarui status permohonan.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Navigation Items per Role
  const navMenuItems = [
    { id: 'overview', label: 'Ringkasan & Statistik', icon: LayoutDashboard },
    {
      id: 'applications',
      label: currentUser.role === 'masyarakat' ? 'Permohonan Saya' : 'Daftar Permohonan',
      icon: FileText
    },
    { id: 'letters', label: 'Arsip Surat Resmi', icon: Archive }
  ];

  if (currentUser.role !== 'masyarakat') {
    navMenuItems.push({ id: 'residents', label: 'Data Penduduk', icon: Users });
    navMenuItems.push({ id: 'reports', label: 'Laporan Rekapitulasi', icon: BarChart3 });
  }

  if (currentUser.role === 'kades' || currentUser.role === 'sekdes') {
    navMenuItems.push({ id: 'services_mgmt', label: 'Pengelolaan Layanan', icon: Settings });
    navMenuItems.push({ id: 'logs', label: 'Log Aktivitas Sistem', icon: Clock });
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'selesai':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">Selesai & Diterbitkan</span>;
      case 'disetujui':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">Disetujui</span>;
      case 'menunggu_persetujuan':
        return <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold">Menunggu Persetujuan</span>;
      case 'terverifikasi':
        return <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold">Terverifikasi</span>;
      case 'perlu_perbaikan':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">Perlu Perbaikan</span>;
      case 'ditolak':
        return <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold">Ditolak</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">Menunggu Pemeriksaan</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#102A43] to-blue-700 flex items-center justify-center text-white shadow-md text-xl font-bold">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#102A43]">
                {currentUser.fullName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {currentUser.roleName}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              NIK: {currentUser.nik || '-'} • Lokasi: {currentUser.dusun || 'Desa Lolosoni'} • Email: {currentUser.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentUser.role === 'masyarakat' ? (
            <button
              onClick={() => onOpenApplyModal(services[0])}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Ajukan Permohonan Baru
            </button>
          ) : (
            <button
              onClick={handleLoadSqlSchema}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Database className="w-4 h-4 text-sky-400" /> Export SQL Schema
            </button>
          )}

          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Dynamic Sidebar Nav */}
        <div className="space-y-2 lg:col-span-1">
          <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm space-y-1">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Help Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#102A43] to-blue-900 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Asisten SIPADLO
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Butuh konsultasi syarat pengurusan berkas atau penomoran surat? Asisten AI siap membantu aparatur dan warga desa.
            </p>
            {onOpenAiAssistant && (
              <button
                onClick={onOpenAiAssistant}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
              >
                Buka Asisten AI
              </button>
            )}
          </div>

          {/* PHP & MySQL OOP Source Code Card */}
          {onOpenPhpSource && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-md space-y-3 border border-purple-700/40">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                <Code2 className="w-4 h-4" /> Source Code PHP & MySQL
              </div>
              <p className="text-xs text-purple-100/90 leading-relaxed">
                Struktur OOP (Model, View, Controller) dan database relasional siap pakai di XAMPP / Laragon untuk keperluan skripsi.
              </p>
              <button
                onClick={onOpenPhpSource}
                className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Lihat & Unduh Kode PHP</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Dashboard Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Permohonan
                  </div>
                  <div className="text-3xl font-extrabold text-[#102A43]">
                    {stats?.totalApplications ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-400">Tercatat di sistem</div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                    Perlu Diproses
                  </div>
                  <div className="text-3xl font-extrabold text-amber-600">
                    {stats?.processingApplications ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-400">Pemeriksaan / Verifikasi</div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                    Surat Selesai
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-600">
                    {stats?.completedApplications ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-400">Diterbitkan resmi</div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    Total Penduduk
                  </div>
                  <div className="text-3xl font-extrabold text-blue-600">
                    {stats?.residentCount ?? 1482}
                  </div>
                  <div className="text-[11px] text-slate-400">{stats?.familyCount ?? 364} Kepala Keluarga</div>
                </div>
              </div>

              {/* Monthly Trend & Service Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Recharts Visualization (2 cols) */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-bold text-[#102A43]">
                          Tren Volume Pelayanan Bulanan (2026)
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pemantauan berkala permohonan Diajukan (Submitted), Diproses (Processed), dan Selesai (Completed)
                      </p>
                    </div>

                    {/* Chart Mode Controls */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Metric Filter Tabs */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setSelectedSeriesFilter('all')}
                          className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                            selectedSeriesFilter === 'all'
                              ? 'bg-white text-blue-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Semua
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSeriesFilter('submitted')}
                          className={`px-2 py-0.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                            selectedSeriesFilter === 'submitted'
                              ? 'bg-white text-sky-700 shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> Diajukan
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSeriesFilter('processed')}
                          className={`px-2 py-0.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                            selectedSeriesFilter === 'processed'
                              ? 'bg-white text-amber-700 shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Diproses
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSeriesFilter('completed')}
                          className={`px-2 py-0.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                            selectedSeriesFilter === 'completed'
                              ? 'bg-white text-emerald-700 shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Selesai
                        </button>
                      </div>

                      {/* Area vs Bar Toggle */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setChartViewMode('area')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                            chartViewMode === 'area'
                              ? 'bg-white text-blue-700 shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Grafik Area Bergradasi"
                        >
                          <Activity className="w-3 h-3" /> Area
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartViewMode('bar')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                            chartViewMode === 'bar'
                              ? 'bg-white text-blue-700 shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Diagram Batang"
                        >
                          <BarChart2 className="w-3 h-3" /> Batang
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Micro KPI Row */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1 pb-1">
                    <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                      <span className="text-[10px] text-sky-700 font-bold uppercase tracking-wider block">Total Diajukan</span>
                      <span className="text-base font-extrabold text-sky-900">
                        {stats?.monthlyData.reduce((acc, m) => acc + (m.submitted || m.total || 0), 0) ?? 0}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                      <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Diproses</span>
                      <span className="text-base font-extrabold text-amber-900">
                        {stats?.monthlyData.reduce((acc, m) => acc + (m.processed || 0), 0) ?? 0}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Selesai Terbit</span>
                      <span className="text-base font-extrabold text-emerald-900">
                        {stats?.monthlyData.reduce((acc, m) => acc + (m.completed || 0), 0) ?? 0}
                      </span>
                    </div>
                    <div className="hidden sm:block p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Rasio Selesai</span>
                      <span className="text-base font-extrabold text-blue-700">
                        {(() => {
                          const sub = stats?.monthlyData.reduce((acc, m) => acc + (m.submitted || m.total || 0), 0) || 0;
                          const comp = stats?.monthlyData.reduce((acc, m) => acc + (m.completed || 0), 0) || 0;
                          return sub > 0 ? `${Math.round((comp / sub) * 100)}%` : '0%';
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Recharts Container */}
                  <div className="h-60 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartViewMode === 'area' ? (
                        <AreaChart
                          data={stats?.monthlyData || []}
                          margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
                        >
                          <defs>
                            {/* Submitted Gradient (Sky Blue) */}
                            <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0284C7" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                            </linearGradient>
                            {/* Processed Gradient (Amber) */}
                            <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                            </linearGradient>
                            {/* Completed Gradient (Emerald Green) */}
                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>

                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis
                            dataKey="month"
                            stroke="#94A3B8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: '#E2E8F0' }}
                          />
                          <YAxis
                            stroke="#94A3B8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const subVal = payload.find((p) => p.dataKey === 'submitted')?.value ?? payload[0]?.payload?.submitted ?? 0;
                                const procVal = payload.find((p) => p.dataKey === 'processed')?.value ?? payload[0]?.payload?.processed ?? 0;
                                const compVal = payload.find((p) => p.dataKey === 'completed')?.value ?? payload[0]?.payload?.completed ?? 0;
                                const rate = Number(subVal) > 0 ? Math.round((Number(compVal) / Number(subVal)) * 100) : 0;

                                return (
                                  <div className="bg-[#102A43] text-white p-3.5 rounded-2xl shadow-2xl border border-blue-500/30 text-xs space-y-2 min-w-[210px]">
                                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                                      <span className="font-bold text-sky-300">Bulan {label} 2026</span>
                                      <span className="text-[10px] font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                                        {rate}% Selesai
                                      </span>
                                    </div>
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between text-slate-300">
                                        <span className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                                          Diajukan (Submitted):
                                        </span>
                                        <span className="font-extrabold text-white text-xs">{subVal}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-slate-300">
                                        <span className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                          Diproses (Processed):
                                        </span>
                                        <span className="font-extrabold text-amber-300 text-xs">{procVal}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-slate-300">
                                        <span className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                          Selesai (Completed):
                                        </span>
                                        <span className="font-extrabold text-emerald-300 text-xs">{compVal}</span>
                                      </div>
                                    </div>
                                    <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-700/80">
                                      Pemerintah Desa Lolosoni • Gomo
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />

                          {/* Submitted Series (Diajukan) */}
                          {(selectedSeriesFilter === 'all' || selectedSeriesFilter === 'submitted') && (
                            <Area
                              type="monotone"
                              dataKey="submitted"
                              name="Diajukan (Submitted)"
                              stroke="#0284C7"
                              strokeWidth={2.5}
                              fillOpacity={1}
                              fill="url(#colorSubmitted)"
                              activeDot={{ r: 5, fill: '#0284C7', stroke: '#FFFFFF', strokeWidth: 2 }}
                            />
                          )}

                          {/* Processed Series (Diproses) */}
                          {(selectedSeriesFilter === 'all' || selectedSeriesFilter === 'processed') && (
                            <Area
                              type="monotone"
                              dataKey="processed"
                              name="Diproses (Processed)"
                              stroke="#F59E0B"
                              strokeWidth={2.5}
                              fillOpacity={1}
                              fill="url(#colorProcessed)"
                              activeDot={{ r: 5, fill: '#F59E0B', stroke: '#FFFFFF', strokeWidth: 2 }}
                            />
                          )}

                          {/* Completed Series (Selesai) */}
                          {(selectedSeriesFilter === 'all' || selectedSeriesFilter === 'completed') && (
                            <Area
                              type="monotone"
                              dataKey="completed"
                              name="Selesai (Completed)"
                              stroke="#10B981"
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#colorCompleted)"
                              activeDot={{ r: 6, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2 }}
                            />
                          )}
                        </AreaChart>
                      ) : (
                        <BarChart
                          data={stats?.monthlyData || []}
                          margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis
                            dataKey="month"
                            stroke="#94A3B8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: '#E2E8F0' }}
                          />
                          <YAxis
                            stroke="#94A3B8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const subVal = payload.find((p) => p.dataKey === 'submitted')?.value ?? payload[0]?.payload?.submitted ?? 0;
                                const procVal = payload.find((p) => p.dataKey === 'processed')?.value ?? payload[0]?.payload?.processed ?? 0;
                                const compVal = payload.find((p) => p.dataKey === 'completed')?.value ?? payload[0]?.payload?.completed ?? 0;

                                return (
                                  <div className="bg-[#102A43] text-white p-3 rounded-xl shadow-xl border border-blue-500/30 text-xs space-y-1.5 min-w-[180px]">
                                    <div className="font-bold text-sky-300">Bulan {label} 2026</div>
                                    <div className="text-slate-300 text-[11px] space-y-0.5">
                                      <div>Diajukan: <span className="text-sky-300 font-bold">{subVal}</span></div>
                                      <div>Diproses: <span className="text-amber-300 font-bold">{procVal}</span></div>
                                      <div>Selesai: <span className="text-emerald-300 font-bold">{compVal}</span></div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          {(selectedSeriesFilter === 'all' || selectedSeriesFilter === 'submitted') && (
                            <Bar
                              dataKey="submitted"
                              name="Diajukan"
                              fill="#0284C7"
                              radius={[4, 4, 0, 0]}
                            />
                          )}
                          {(selectedSeriesFilter === 'all' || selectedSeriesFilter === 'processed') && (
                            <Bar
                              dataKey="processed"
                              name="Diproses"
                              fill="#F59E0B"
                              radius={[4, 4, 0, 0]}
                            />
                          )}
                          {(selectedSeriesFilter === 'all' || selectedSeriesFilter === 'completed') && (
                            <Bar
                              dataKey="completed"
                              name="Selesai"
                              fill="#10B981"
                              radius={[4, 4, 0, 0]}
                            />
                          )}
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  {/* Summary Legend Footer */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-semibold text-sky-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Diajukan (Submitted)
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-amber-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Diproses (Processed)
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Selesai (Completed)
                      </span>
                    </div>
                    <span className="font-mono text-slate-400">Periode: Jan - Des 2026</span>
                  </div>
                </div>

                {/* Service Distribution (1 col) */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#102A43]">Distribusi Jenis Layanan</h4>
                    <span className="text-xs text-slate-400">{services.length} Layanan</span>
                  </div>
                  <div className="space-y-3">
                    {services.slice(0, 5).map((srv) => {
                      const count = applications.filter((a) => a.serviceId === srv.id).length;
                      const pct = stats?.totalApplications ? Math.round((count / stats.totalApplications) * 100) : 0;
                      return (
                        <div key={srv.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>{srv.name}</span>
                            <span>{count} berkas ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              style={{ width: `${Math.max(8, pct)}%` }}
                              className="h-full bg-blue-600 rounded-full"
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Applications Preview */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#102A43]">Permohonan Terbaru</h4>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Lihat Seluruhnya →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="pb-3 font-semibold">No. Registrasi</th>
                        <th className="pb-3 font-semibold">Pemohon</th>
                        <th className="pb-3 font-semibold">Jenis Layanan</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {applications.slice(0, 5).map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50">
                          <td className="py-3 font-mono font-bold text-blue-700">{app.registrationNumber}</td>
                          <td className="py-3 font-medium text-slate-900">{app.applicantName}</td>
                          <td className="py-3 text-slate-600">{app.serviceName}</td>
                          <td className="py-3">{getStatusBadge(app.status)}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                setActionApp(app);
                                setActionType('view');
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLICATIONS LIST & WORKFLOW MANAGEMENT */}
          {activeTab === 'applications' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#102A43]">
                    {currentUser.role === 'masyarakat' ? 'Riwayat Permohonan Surat Anda' : 'Manajemen Alur Permohonan Desa'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pemeriksaan berkas, verifikasi kelengkapan, persetujuan berjenjang, dan penerbitan naskah surat resmi.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Cari pemohon / No. Reg..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Status</option>
                    <option value="diajukan">Diajukan</option>
                    <option value="menunggu_pemeriksaan">Menunggu Pemeriksaan</option>
                    <option value="perlu_perbaikan">Perlu Perbaikan</option>
                    <option value="menunggu_persetujuan">Menunggu Persetujuan</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-bold">No. Registrasi</th>
                      <th className="pb-3 font-bold">Pemohon & NIK</th>
                      <th className="pb-3 font-bold">Jenis Layanan</th>
                      <th className="pb-3 font-bold">Tanggal</th>
                      <th className="pb-3 font-bold">Status</th>
                      <th className="pb-3 font-bold text-right">Tindakan Workflow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Tidak ada permohonan yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      applications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 font-mono font-bold text-blue-700">{app.registrationNumber}</td>
                          <td className="py-3">
                            <span className="font-bold text-slate-900 block">{app.applicantName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">NIK: {app.applicantNik}</span>
                          </td>
                          <td className="py-3 font-medium text-slate-700">{app.serviceName}</td>
                          <td className="py-3 text-slate-500">
                            {new Date(app.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3">{getStatusBadge(app.status)}</td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Detail Button */}
                              <button
                                onClick={() => {
                                  setActionApp(app);
                                  setActionType('view');
                                }}
                                className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                              >
                                Detail
                              </button>

                              {/* Perangkat / Sekdes Verification Action */}
                              {(currentUser.role === 'perangkat' || currentUser.role === 'sekdes') &&
                                (app.status === 'diajukan' || app.status === 'menunggu_pemeriksaan') && (
                                  <button
                                    onClick={() => {
                                      setActionApp(app);
                                      setActionType('verify');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold cursor-pointer flex items-center gap-1"
                                    title="Verifikasi Dokumen & Teruskan"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Verifikasi
                                  </button>
                                )}

                              {/* Kepala Desa Persetujuan Akhir */}
                              {(currentUser.role === 'kades' || currentUser.role === 'sekdes') &&
                                app.status === 'menunggu_persetujuan' && (
                                  <button
                                    onClick={() => {
                                      setActionApp(app);
                                      setActionType('approve');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer flex items-center gap-1"
                                    title="Persetujuan Akhir Kepala Desa"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" /> Setujui
                                  </button>
                                )}

                              {/* Penerbitan Naskah Surat Resmi */}
                              {(currentUser.role === 'kades' || currentUser.role === 'sekdes') &&
                                (app.status === 'disetujui' || app.status === 'diproses') && (
                                  <button
                                    onClick={() => {
                                      setActionApp(app);
                                      setActionType('issue');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer flex items-center gap-1 shadow-sm"
                                    title="Terbitkan Surat Resmi Ber-QR Code"
                                  >
                                    <FileCheck2 className="w-3.5 h-3.5" /> Terbitkan Surat
                                  </button>
                                )}

                              {/* View Issued Letter (if finished) */}
                              {app.status === 'selesai' && (
                                <button
                                  onClick={async () => {
                                    if (app.letterId) {
                                      const letObj = await api.getLetterById(app.letterId);
                                      onViewLetter(letObj);
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white font-semibold cursor-pointer flex items-center gap-1"
                                  title="Cetak Naskah Surat Resmi"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Cetak
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LETTERS ARCHIVE */}
          {activeTab === 'letters' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#102A43]">Buku Register & Arsip Surat Resmi</h3>
                <p className="text-xs text-slate-500">
                  Daftar seluruh naskah dinas resmi yang telah diterbitkan dengan nomor surat standar tata naskah desa.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-bold">Nomor Surat Resmi</th>
                      <th className="pb-3 font-bold">Nama Penerima & NIK</th>
                      <th className="pb-3 font-bold">Jenis Surat</th>
                      <th className="pb-3 font-bold">Tanggal Terbit</th>
                      <th className="pb-3 font-bold">Penandatangan</th>
                      <th className="pb-3 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {letters.map((letItem) => (
                      <tr key={letItem.id} className="hover:bg-slate-50">
                        <td className="py-3 font-mono font-bold text-slate-900">{letItem.letterNumber}</td>
                        <td className="py-3">
                          <span className="font-semibold block">{letItem.recipientName}</span>
                          <span className="text-[10px] text-slate-500">{letItem.recipientNik}</span>
                        </td>
                        <td className="py-3 text-slate-700">{letItem.serviceName}</td>
                        <td className="py-3 text-slate-500">{letItem.letterDate}</td>
                        <td className="py-3 text-slate-700">{letItem.signatoryName}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => onViewLetter(letItem)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" /> Buka & Cetak
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DATA PENDUDUK (RESIDENTS) */}
          {activeTab === 'residents' && currentUser.role !== 'masyarakat' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#102A43]">Data Kependudukan Desa Lolosoni</h3>
                  <p className="text-xs text-slate-500">
                    Basis data kependudukan per dusun untuk validasi otomatis identitas pemohon.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-bold">NIK</th>
                      <th className="pb-3 font-bold">Nama Lengkap</th>
                      <th className="pb-3 font-bold">No. KK</th>
                      <th className="pb-3 font-bold">Dusun</th>
                      <th className="pb-3 font-bold">Pekerjaan</th>
                      <th className="pb-3 font-bold">Status Kawin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {residents.map((r) => (
                      <tr key={r.nik} className="hover:bg-slate-50">
                        <td className="py-3 font-mono font-bold text-slate-800">{r.nik}</td>
                        <td className="py-3 font-semibold text-slate-900">{r.fullName}</td>
                        <td className="py-3 font-mono text-slate-600">{r.noKk}</td>
                        <td className="py-3 text-slate-700">{r.addressDusun}</td>
                        <td className="py-3 text-slate-600">{r.occupation}</td>
                        <td className="py-3 text-slate-600">{r.maritalStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: REPORTS & RECAPITULATION */}
          {activeTab === 'reports' && currentUser.role !== 'masyarakat' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#102A43]">Laporan Rekapitulasi Pelayanan Administrasi</h3>
                  <p className="text-xs text-slate-500">
                    Laporan periodik untuk Kepala Desa, Badan Permusyawaratan Desa (BPD), dan Kecamatan Gomo.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Laporan
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900 text-sm">Ringkasan Kinerja Pelayanan Tahun 2026</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
                  <div>Total Permohonan Masuk: <span className="font-bold">{stats?.totalApplications}</span></div>
                  <div>Surat Selesai Diterbitkan: <span className="font-bold text-emerald-700">{stats?.completedApplications}</span></div>
                  <div>Sedang Dalam Proses: <span className="font-bold text-amber-700">{stats?.processingApplications}</span></div>
                  <div>Rata-rata Waktu Proses: <span className="font-bold text-blue-700">1.2 Hari Kerja</span></div>
                </div>
              </div>

              {/* Grafik Tren Volume Pelayanan Recharts pada Laporan */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-[#102A43] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      Grafik Area Tren Volume Pelayanan (Diajukan, Diproses, Selesai)
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Visualisasi komparasi volume bulanan untuk evaluasi kinerja pelayanan desa Lolosoni
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-semibold">
                    <span className="flex items-center gap-1 text-sky-700">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span> Diajukan
                    </span>
                    <span className="flex items-center gap-1 text-amber-700">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span> Diproses
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Selesai
                    </span>
                  </div>
                </div>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.monthlyData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="repColorSubmitted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="repColorProcessed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="repColorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const sub = payload.find((p) => p.dataKey === 'submitted')?.value ?? 0;
                            const proc = payload.find((p) => p.dataKey === 'processed')?.value ?? 0;
                            const comp = payload.find((p) => p.dataKey === 'completed')?.value ?? 0;
                            return (
                              <div className="bg-[#102A43] text-white p-3 rounded-xl shadow-xl border border-blue-500/30 text-xs space-y-1">
                                <div className="font-bold text-sky-300">Bulan {label} 2026</div>
                                <div className="space-y-0.5 text-slate-300 text-[11px]">
                                  <div>Diajukan: <span className="text-sky-300 font-bold">{sub}</span></div>
                                  <div>Diproses: <span className="text-amber-300 font-bold">{proc}</span></div>
                                  <div>Selesai: <span className="text-emerald-300 font-bold">{comp}</span></div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="submitted" name="Diajukan" stroke="#0284C7" strokeWidth={2} fillOpacity={1} fill="url(#repColorSubmitted)" />
                      <Area type="monotone" dataKey="processed" name="Diproses" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#repColorProcessed)" />
                      <Area type="monotone" dataKey="completed" name="Selesai" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#repColorCompleted)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-3 font-bold">No</th>
                      <th className="p-3 font-bold">Jenis Layanan</th>
                      <th className="p-3 font-bold">Kode</th>
                      <th className="p-3 font-bold">Jumlah Masuk</th>
                      <th className="p-3 font-bold">Disetujui/Selesai</th>
                      <th className="p-3 font-bold">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {services.map((srv, idx) => {
                      const totalSrv = applications.filter((a) => a.serviceId === srv.id).length;
                      const doneSrv = applications.filter((a) => a.serviceId === srv.id && a.status === 'selesai').length;
                      const pct = totalSrv > 0 ? Math.round((doneSrv / totalSrv) * 100) : 0;
                      return (
                        <tr key={srv.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">{srv.name}</td>
                          <td className="p-3 font-mono">{srv.code}</td>
                          <td className="p-3">{totalSrv}</td>
                          <td className="p-3 font-semibold text-emerald-700">{doneSrv}</td>
                          <td className="p-3 font-bold text-blue-700">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SERVICES MANAGEMENT */}
          {activeTab === 'services_mgmt' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#102A43]">Pengelolaan Katalog Layanan</h3>
                <p className="text-xs text-slate-500">
                  Konfigurasi syarat, alur, dan pejabat penandatangan layanan administrasi desa.
                </p>
              </div>

              <div className="space-y-3">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#102A43]">{srv.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                          Prefix: {srv.letterCodePrefix}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-xl">{srv.description}</p>
                      <div className="text-[11px] text-slate-500 mt-1">
                        SLA: {srv.processingDays} hari kerja • Pejabat Berwenang: {srv.approvalRole.toUpperCase()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                        Aktif
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: LOG AKTIVITAS */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#102A43]">Log Audit Aktivitas Sistem</h3>
                <p className="text-xs text-slate-500">
                  Pencatatan riwayat setiap tindakan pejabat, verifikator, dan pengguna untuk akuntabilitas.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-bold">Waktu</th>
                      <th className="pb-3 font-bold">Pengguna</th>
                      <th className="pb-3 font-bold">Peran</th>
                      <th className="pb-3 font-bold">Aktivitas</th>
                      <th className="pb-3 font-bold">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-mono text-slate-500">
                          {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 font-bold text-slate-900">{log.userName}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {log.role}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-blue-700 font-semibold">{log.action}</td>
                        <td className="py-2.5 text-slate-600">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: SQL SCHEMA VIEW / DOWNLOAD */}
          {activeTab === 'sql_schema' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#102A43]">Relational SQL Schema (MySQL / PostgreSQL)</h3>
                  <p className="text-xs text-slate-500">
                    Skema database terstruktur untuk deployment di server hosting desa Lolosoni.
                  </p>
                </div>
                <a
                  href="/api/schema-sql"
                  download="sipadlo_lolosoni_schema.sql"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Unduh file .sql
                </a>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-900 text-sky-300 font-mono text-xs overflow-x-auto max-h-[500px]">
                {sqlSchema || 'Memuat skema SQL...'}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Action Workflow Modal */}
      {actionApp && actionType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-bold text-base text-[#102A43]">
                {actionType === 'verify' && 'Verifikasi Kelengkapan Dokumen'}
                {actionType === 'revise' && 'Permintaan Perbaikan Berkas Dokumen'}
                {actionType === 'approve' && 'Persetujuan Surat oleh Kepala Desa'}
                {actionType === 'issue' && 'Penerbitan Naskah Surat Resmi'}
                {actionType === 'view' && 'Detail Berkas Permohonan'}
              </h4>
              <button
                onClick={() => {
                  setActionApp(null);
                  setActionType(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div><span className="font-semibold">No. Registrasi:</span> <span className="font-mono text-blue-700">{actionApp.registrationNumber}</span></div>
                <div><span className="font-semibold">Pemohon:</span> {actionApp.applicantName} (NIK: {actionApp.applicantNik})</div>
                <div><span className="font-semibold">Layanan:</span> {actionApp.serviceName}</div>
                <div><span className="font-semibold">Keperluan:</span> "{actionApp.purpose}"</div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Dokumen Persyaratan Terlampir:
                </span>
                {actionApp.documents.length === 0 ? (
                  <p className="text-slate-400 italic">Tidak ada berkas fisik.</p>
                ) : (
                  actionApp.documents.map((doc) => (
                    <div key={doc.id} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                      <div>
                        <span className="font-semibold block">{doc.requirementName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{doc.fileName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Terverifikasi
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Notes Input for Action */}
              {actionType !== 'view' && actionType !== 'issue' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Catatan Petugas / Alasan Tindakan:
                  </label>
                  <textarea
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    rows={3}
                    placeholder="Tuliskan catatan arahan kepada pemohon atau pejabat berwenang..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setActionApp(null);
                  setActionType(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>

              {actionType === 'verify' && (
                <>
                  <button
                    onClick={() => {
                      setActionType('revise');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Minta Perbaikan
                  </button>
                  <button
                    onClick={handleExecuteStatusAction}
                    disabled={isProcessingAction}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Verifikasi & Teruskan
                  </button>
                </>
              )}

              {actionType === 'approve' && (
                <button
                  onClick={handleExecuteStatusAction}
                  disabled={isProcessingAction}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  Setujui Permohonan
                </button>
              )}

              {actionType === 'issue' && (
                <button
                  onClick={handleExecuteStatusAction}
                  disabled={isProcessingAction}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Terbitkan Surat Resmi Ber-QR
                </button>
              )}

              {actionType === 'revise' && (
                <button
                  onClick={handleExecuteStatusAction}
                  disabled={isProcessingAction}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                >
                  Kirim Catatan Perbaikan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

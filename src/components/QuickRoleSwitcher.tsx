import React from 'react';
import { User, RoleType } from '../types.ts';
import { Shield, UserCheck, Users, User as UserIcon, LogOut, Check } from 'lucide-react';

interface QuickRoleSwitcherProps {
  currentUser: User | null;
  onSwitchRole: (role: RoleType) => void;
  onLogout: () => void;
}

export const QuickRoleSwitcher: React.FC<QuickRoleSwitcherProps> = ({
  currentUser,
  onSwitchRole,
  onLogout
}) => {
  const roles: { role: RoleType; label: string; name: string; icon: any }[] = [
    {
      role: 'kades',
      label: 'Kepala Desa (Admin)',
      name: "Ya'atulo Hia",
      icon: Shield
    },
    {
      role: 'sekdes',
      label: 'Sekretaris Desa',
      name: 'Faomakhoda Telambanua, S.AP',
      icon: UserCheck
    },
    {
      role: 'perangkat',
      label: 'Kaur Pelayanan',
      name: 'Yulianus Lase',
      icon: Users
    },
    {
      role: 'masyarakat',
      label: 'Warga / Pemohon',
      name: 'Bezisokhi Hia',
      icon: UserIcon
    }
  ];

  return (
    <div className="bg-[#102A43] text-white border-b border-blue-900/40 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-sky-400 uppercase text-[10px] bg-blue-900/60 px-2 py-0.5 rounded border border-blue-500/30">
            SIMULASI 4 ROLE PENGGUNA
          </span>
          <span className="text-slate-300 hidden sm:inline text-[11px]">
            Klik untuk beralih peran dan menguji alur verifikasi & persetujuan:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {roles.map((item) => {
            const Icon = item.icon;
            const isActive = currentUser?.role === item.role;
            return (
              <button
                key={item.role}
                onClick={() => onSwitchRole(item.role)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-400 shadow-sm font-semibold'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
                title={`Masuk sebagai ${item.label} (${item.name})`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {isActive && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}

          {currentUser && (
            <button
              onClick={onLogout}
              className="px-2 py-1 rounded-lg text-[11px] text-red-300 hover:bg-red-950/40 hover:text-red-200 border border-red-900/40 transition cursor-pointer flex items-center gap-1"
              title="Keluar ke mode tamu publik"
            >
              <LogOut className="w-3 h-3" />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

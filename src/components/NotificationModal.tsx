import React from 'react';
import { NotificationItem } from '../types.ts';
import { Bell, CheckCheck, X, Clock, ExternalLink } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectNotification: (item: NotificationItem) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectNotification
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center sm:justify-end p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full h-[580px] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#102A43] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-sm">Pemberitahuan Sistem SIPADLO</h3>
              <p className="text-[11px] text-slate-300">{notifications.length} notifikasi tercatat</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="Tandai Semua Sudah Dibaca"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/70">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada notifikasi baru.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onSelectNotification(notif)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col gap-1 ${
                  notif.isRead
                    ? 'bg-white border-slate-200/80 text-slate-700'
                    : 'bg-blue-50/70 border-blue-200 text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{notif.title}</span>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                  <span>
                    {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {notif.linkUrl && (
                    <span className="text-blue-600 font-sans font-semibold flex items-center gap-1">
                      Buka Rincian <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

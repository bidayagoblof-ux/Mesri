import {
  User,
  ServiceItem,
  Application,
  ApplicationStatus,
  Letter,
  Resident,
  SystemStats,
  NotificationItem,
  ActivityLog,
  VillageConfig
} from './types.ts';

const TOKEN_KEY = 'sipadlo_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = 'Terjadi kesalahan sistem.';
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errorMsg;
    } catch {
      errorMsg = await response.text();
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(emailOrNik: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrNik, password })
    });
    setStoredToken(res.token);
    return res;
  },

  async register(params: {
    nik: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    dusun?: string;
    rtRw?: string;
  }): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User } | null> {
    try {
      return await request<{ user: User }>('/api/auth/me');
    } catch {
      return null;
    }
  },

  async getUsers(): Promise<User[]> {
    return request<User[]>('/api/users');
  },

  logout(): void {
    setStoredToken(null);
  },

  // 1-Click Demo Role Switcher helper
  async switchDemoRole(role: 'kades' | 'sekdes' | 'perangkat' | 'masyarakat'): Promise<{ token: string; user: User }> {
    const credentials: Record<string, { email: string; pass: string }> = {
      kades: { email: 'kades@lolosoni.desa.id', pass: 'admin123' },
      sekdes: { email: 'sekdes@lolosoni.desa.id', pass: 'sekdes123' },
      perangkat: { email: 'perangkat@lolosoni.desa.id', pass: 'perangkat123' },
      masyarakat: { email: 'warga@lolosoni.desa.id', pass: 'warga123' }
    };
    const cred = credentials[role];
    return api.login(cred.email, cred.pass);
  },

  // Services
  async getServices(): Promise<ServiceItem[]> {
    return request<ServiceItem[]>('/api/services');
  },

  async getServiceById(id: string): Promise<ServiceItem> {
    return request<ServiceItem>(`/api/services/${id}`);
  },

  async createService(item: Partial<ServiceItem>): Promise<ServiceItem> {
    return request<ServiceItem>('/api/services', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  async updateService(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem> {
    return request<ServiceItem>(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteService(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/services/${id}`, {
      method: 'DELETE'
    });
  },

  // Applications
  async getApplications(params?: {
    status?: string;
    serviceId?: string;
    search?: string;
    mine?: boolean;
  }): Promise<Application[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.serviceId) query.set('serviceId', params.serviceId);
    if (params?.search) query.set('search', params.search);
    if (params?.mine) query.set('mine', 'true');
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Application[]>(`/api/applications${qs}`);
  },

  async getApplicationById(id: string): Promise<Application> {
    return request<Application>(`/api/applications/${id}`);
  },

  async createApplication(params: {
    serviceId: string;
    purpose: string;
    customData?: Record<string, string>;
    documents: { requirementName: string; fileName: string; fileSize: number; fileType: string; fileUrl: string }[];
  }): Promise<Application> {
    return request<Application>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus, notes?: string): Promise<Application> {
    return request<Application>(`/api/applications/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes })
    });
  },

  async issueLetter(
    applicationId: string,
    signatoryName?: string,
    signatoryRole?: string,
    customContent?: string
  ): Promise<Letter> {
    return request<Letter>(`/api/applications/${applicationId}/issue-letter`, {
      method: 'POST',
      body: JSON.stringify({ signatoryName, signatoryRole, customContent })
    });
  },

  // Letters
  async getLetters(): Promise<Letter[]> {
    return request<Letter[]>('/api/letters');
  },

  async getLetterById(id: string): Promise<Letter> {
    return request<Letter>(`/api/letters/${id}`);
  },

  // Residents
  async getResidents(): Promise<Resident[]> {
    return request<Resident[]>('/api/residents');
  },

  async getResidentByNik(nik: string): Promise<Resident> {
    return request<Resident>(`/api/residents/${nik}`);
  },

  async createResident(resident: Partial<Resident>): Promise<Resident> {
    return request<Resident>('/api/residents', {
      method: 'POST',
      body: JSON.stringify(resident)
    });
  },

  // Stats & Reports
  async getStats(): Promise<SystemStats> {
    return request<SystemStats>('/api/stats');
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT'
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PUT'
    });
  },

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    return request<ActivityLog[]>('/api/activity-logs');
  },

  // Village config
  async getVillageConfig(): Promise<VillageConfig> {
    return request<VillageConfig>('/api/village-config');
  },

  async updateVillageConfig(updates: Partial<VillageConfig>): Promise<VillageConfig> {
    return request<VillageConfig>('/api/village-config', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // SQL Schema
  async downloadSchemaSql(): Promise<string> {
    const res = await fetch('/api/schema-sql');
    return res.text();
  },

  // Gemini AI Chat
  async chatWithAssistant(
    history: { role: 'user' | 'model'; parts: { text: string }[] }[],
    message: string
  ): Promise<{ reply: string }> {
    return request<{ reply: string }>('/api/gemini/chat', {
      method: 'POST',
      body: JSON.stringify({ history, message })
    });
  },

  // Gemini AI High-Quality Image Generator
  async generateHighQualityImage(params: {
    prompt: string;
    aspectRatio?: '1:1' | '16:9' | '4:3' | '3:4' | '9:16';
    imageSize?: '1K' | '2K' | '4K';
  }): Promise<{ imageUrl: string; textOutput?: string }> {
    return request<{ imageUrl: string; textOutput?: string }>('/api/gemini/generate-image', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
};

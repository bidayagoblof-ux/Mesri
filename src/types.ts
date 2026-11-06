export type RoleType = 'kades' | 'sekdes' | 'perangkat' | 'masyarakat';

export interface User {
  id: string;
  nik?: string;
  email: string;
  fullName: string;
  phone?: string;
  role: RoleType;
  roleName: string;
  dusun?: string;
  rtRw?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Resident {
  nik: string;
  noKk: string;
  fullName: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  religion: string;
  education: string;
  occupation: string;
  maritalStatus: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';
  addressDusun: string;
  rtRw: string;
  phone?: string;
}

export interface ServiceRequirement {
  id: string;
  name: string;
  isMandatory: boolean;
  hint: string;
}

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  processingDays: number;
  responsibleRole: 'perangkat' | 'sekdes' | 'kades';
  approvalRole: 'sekdes' | 'kades';
  letterCodePrefix: string;
  isActive: boolean;
  requirements: ServiceRequirement[];
}

export type ApplicationStatus =
  | 'diajukan'
  | 'menunggu_pemeriksaan'
  | 'perlu_perbaikan'
  | 'terverifikasi'
  | 'menunggu_persetujuan'
  | 'disetujui'
  | 'diproses'
  | 'selesai'
  | 'ditolak';

export interface ApplicationDocument {
  id: string;
  requirementName: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface StatusHistory {
  id: string;
  fromStatus?: ApplicationStatus;
  toStatus: ApplicationStatus;
  actorId: string;
  actorName: string;
  actorRole: string;
  notes?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  registrationNumber: string;
  serviceId: string;
  serviceName: string;
  applicantUserId: string;
  applicantNik: string;
  applicantName: string;
  applicantPhone: string;
  applicantDusun: string;
  purpose: string;
  customData: Record<string, string>;
  status: ApplicationStatus;
  officerNotes?: string;
  documents: ApplicationDocument[];
  statusHistories: StatusHistory[];
  letterId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Letter {
  id: string;
  letterNumber: string;
  applicationId: string;
  registrationNumber: string;
  serviceId: string;
  serviceName: string;
  recipientNik: string;
  recipientName: string;
  recipientAddress: string;
  recipientBirth: string;
  recipientOccupation: string;
  purpose: string;
  letterDate: string;
  signatoryName: string;
  signatoryRole: string;
  qrVerificationCode: string;
  contentBody: string;
  isPublished: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userName: string;
  role: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface VillageConfig {
  villageName: string;
  districtName: string;
  regencyName: string;
  provinceName: string;
  officeAddress: string;
  postalCode: string;
  kadesName: string;
  kadesNip?: string;
  sekdesName: string;
  kaurPelayananName: string;
  vision: string;
  mission: string[];
  history: string;
  residentCount: number;
  familyCount: number;
  dusunList: string[];
  contactEmail: string;
  contactPhone: string;
}

export interface MonthlyStatsItem {
  month: string;
  total: number;
  submitted: number;
  processed: number;
  completed: number;
}

export interface SystemStats {
  residentCount: number;
  familyCount: number;
  serviceCount: number;
  totalApplications: number;
  completedApplications: number;
  processingApplications: number;
  pendingVerification: number;
  pendingApproval: number;
  totalLettersIssued: number;
  monthlyData: MonthlyStatsItem[];
  serviceDistribution: { serviceId: string; name: string; code: string; count: number }[];
}

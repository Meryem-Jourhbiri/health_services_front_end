// Source: backend OpenAPI schemas (HealthApp API).

export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface AdminDashboardDTO {
  totalUsers?: number;
  totalPatients?: number;
  totalDoctors?: number;
  totalAdmins?: number;
  pendingAppointments?: number;
  confirmedAppointments?: number;
  completedAppointments?: number;
  cancelledAppointments?: number;
  totalReviews?: number;
  pendingDoctors?: number;
  recentActivity?: number;
}

export interface AdminUserDTO {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  verified?: boolean;
  suspended?: boolean;
  specialization?: string;
  createdAt?: string;
}

export interface ApiResponse<T = Record<string, unknown>> {
  success?: boolean;
  message?: string;
  data?: T;
}

export type ApiResponseAdminDashboardDTO = ApiResponse<AdminDashboardDTO>;
export type ApiResponseAdminUserDTO = ApiResponse<AdminUserDTO>;
export type ApiResponseMapStringObject = ApiResponse<Record<string, Record<string, unknown>>>;

export interface AppointmentDTO {
  id?: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  appointmentDate?: string;
  startTime?: LocalTime;
  endTime?: LocalTime;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
  rescheduleCount?: number;
}

export interface AuditLogDTO {
  id?: string;
  userId?: string;
  userEmail?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  createdAt?: string;
}

export interface AvailabilityDTO {
  dayOfWeek: DayOfWeek;
  endTime: LocalTime;
  slotDurationMinutes: number;
  startTime: LocalTime;
  id?: string;
  breakStartTime?: LocalTime;
  breakEndTime?: LocalTime;
}

export interface BookAppointmentRequest {
  appointmentDate: string;
  doctorId: string;
  endTime: LocalTime;
  startTime: LocalTime;
  reason?: string;
}

export interface CreateReviewRequest {
  appointmentId: string;
  rating: number;
  comment?: string;
}

export interface DoctorApprovalDTO {
  id?: string;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  specialization?: string;
  licenseNumber?: string;
  experience?: number;
  education?: string;
  approved?: boolean;
  rejectionReason?: string;
  createdAt?: string;
}

export interface DoctorProfileDTO {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  profilePhotoBase64?: string;
  licenseNumber: string;
  specialization: string;
  experience?: number;
  education?: string;
  bio?: string;
  languages: string[];
  clinicAddress?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface DoctorPublicProfileDTO {
  id?: string;
  firstName?: string;
  lastName?: string;
  specialization?: string;
  experience?: number;
  education?: string;
  bio?: string;
  languages?: string[];
  clinicAddress?: string;
  averageRating?: number;
  reviewCount?: number;
  profilePhotoBase64?: string;
}

export interface DoctorSearchResponse {
  doctors?: DoctorPublicProfileDTO[];
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
}

export interface LocalTime {
  hour?: number;
  minute?: number;
  second?: number;
  nano?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  type?: string;
  userId?: string;
  email?: string;
  role?: UserRole;
  message?: string;
}

export interface PageableObject {
  offset?: number;
  sort?: SortObject;
  unpaged?: boolean;
  paged?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface Page<T> {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: T[];
  number?: number;
  sort?: SortObject;
  numberOfElements?: number;
  pageable?: PageableObject;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export type PageAdminUserDTO = Page<AdminUserDTO>;
export type PageAuditLogDTO = Page<AuditLogDTO>;
export type PageDoctorApprovalDTO = Page<DoctorApprovalDTO>;
export type PageReviewDTO = Page<ReviewDTO>;

export interface PatientProfileDTO {
  firstName?: string;
  lastName?: string;
  dob?: string;
  phone?: string;
  address?: string;
  gender?: string;
  medicalHistory?: Record<string, Record<string, unknown>>;
  profilePhotoBase64?: string;
  insuranceInfo?: string;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  gender: string;
  lastName: string;
  password: string;
  phone: string;
  role: UserRole;
  dob?: string;
  address?: string;
  profilePhotoBase64?: string;
  insuranceInfo?: string;
  medicalQuestionnaire?: Record<string, Record<string, unknown>>;
  licenseNumber?: string;
  specialization?: string;
  experience?: number;
  education?: string;
  bio?: string;
  languages?: string[];
  clinicAddress?: string;
}

export interface RescheduleAppointmentRequest {
  newAppointmentDate: string;
  newStartTime: LocalTime;
  newEndTime: LocalTime;
}

export interface ReviewDTO {
  id?: string;
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SortObject {
  empty?: boolean;
  unsorted?: boolean;
  sorted?: boolean;
}

export interface TimeSlotDTO {
  date?: string;
  startTime?: LocalTime;
  endTime?: LocalTime;
  available?: boolean;
}

export interface UnavailabilityDTO {
  endDate: string;
  startDate: string;
  id: string;
  reason?: string;
}

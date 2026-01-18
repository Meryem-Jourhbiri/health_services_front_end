import { ApiError, authHeaders } from "@/lib/auth/api";
import type {
  AppointmentDTO,
  AppointmentStatus,
  BookAppointmentRequest,
  LocalTime,
  UserRole,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type AppointmentFilters = {
  role: UserRole;
  userId: string;
  status?: AppointmentStatus | "ALL";
  startDate?: string;
  endDate?: string;
};

export type AppointmentReschedulePayload = {
  date: string;
  time: string;
};

export type AppointmentStatusPayload = {
  status: AppointmentStatus;
};

export type DoctorSummary = {
  id: string;
  name: string;
  specialty: string;
  location: string;
};

export type TimeSlot = {
  time: string;
  endTime: string;
  available: boolean;
};

export type AvailabilitySlot = {
  date?: string;
  startTime: string;
  endTime: string;
  available: boolean;
};

type TimeInput = LocalTime | string | null | undefined;

const pad2 = (value: number) => String(value).padStart(2, "0");

function toTimeString(time: TimeInput, includeSeconds = true) {
  if (!time) return "";
  if (typeof time === "string") {
    if (!includeSeconds) return time.slice(0, 5);
    return time.length === 5 ? `${time}:00` : time;
  }
  const hour = time.hour ?? 0;
  const minute = time.minute ?? 0;
  const second = time.second ?? 0;
  const base = `${pad2(hour)}:${pad2(minute)}`;
  return includeSeconds ? `${base}:${pad2(second)}` : base;
}

function toLocalTime(value: string): LocalTime {
  const [hour, minute, second] = value.split(":").map(Number);
  return {
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
    second: Number.isFinite(second) ? second : 0,
    nano: 0,
  };
}

function normalizeLocalTime(time: LocalTime | string): LocalTime {
  return typeof time === "string" ? toLocalTime(time) : time;
}

// Helper function for API requests
async function request<T>(
  path: string,
  init: RequestInit,
  token?: string | null,
): Promise<T> {
  const BASE_URL = API_BASE_URL?.replace(/\/$/, "");
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const auth = authHeaders(token);
  if (auth) {
    const authInit = new Headers(auth);
    authInit.forEach((value, key) => {
      headers.set(key, value);
    });
  }
  
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message =
        (data as { message?: string; error?: string }).message ||
        (data as { message?: string; error?: string }).error ||
        message;
    } catch {
      message = (await response.text()) || message;
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

const STORAGE_KEY = "health-services-appointments";

const mockDoctors: DoctorSummary[] = [
  {
    id: "doctor-mock-123",
    name: "Dr. Demo",
    specialty: "Family Medicine",
    location: "Clinic A - Room 204",
  },
  {
    id: "doctor-mock-456",
    name: "Dr. Priya Singh",
    specialty: "Dermatology",
    location: "Clinic B - Suite 110",
  },
  {
    id: "doctor-mock-789",
    name: "Dr. Carlos Nguyen",
    specialty: "Cardiology",
    location: "Clinic C - Floor 3",
  },
];

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "13:00",
  "13:30",
  "14:00",
  "15:00",
  "15:30",
];

const seedAppointments = (): AppointmentDTO[] => [
  {
    id: "apt-1001",
    patientId: "patient-mock-123",
    patientName: "Patient Demo",
    doctorId: "doctor-mock-123",
    doctorName: "Dr. Demo",
    doctorSpecialization: "Family Medicine",
    appointmentDate: nextDate(2),
    startTime: toLocalTime("09:30:00"),
    endTime: toLocalTime("10:00:00"),
    reason: "Routine checkup",
    status: "CONFIRMED",
    notes: "",
    rescheduleCount: 0,
  },
  {
    id: "apt-1002",
    patientId: "patient-mock-123",
    patientName: "Patient Demo",
    doctorId: "doctor-mock-456",
    doctorName: "Dr. Priya Singh",
    doctorSpecialization: "Dermatology",
    appointmentDate: nextDate(5),
    startTime: toLocalTime("11:00:00"),
    endTime: toLocalTime("11:30:00"),
    reason: "Skin consultation",
    status: "PENDING",
    notes: "",
    rescheduleCount: 0,
  },
  {
    id: "apt-1003",
    patientId: "patient-mock-987",
    patientName: "Jordan Lee",
    doctorId: "doctor-mock-123",
    doctorName: "Dr. Demo",
    doctorSpecialization: "Family Medicine",
    appointmentDate: nextDate(1),
    startTime: toLocalTime("10:30:00"),
    endTime: toLocalTime("11:00:00"),
    reason: "Follow-up",
    status: "CONFIRMED",
    notes: "",
    rescheduleCount: 0,
  },
];

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const getStore = (): AppointmentDTO[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppointmentDTO[];
    }
  } catch {
    // ignore parsing errors
  }

  const seeded = seedAppointments();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
};

const saveStore = (appointments: AppointmentDTO[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
};

const generateId = () =>
  `apt-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`;

function nextDate(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function addMinutes(time: string, minutes: number) {
  const [hours, mins] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(mins)) return time;
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);
  return date.toTimeString().slice(0, 5);
}

function assertBookingFields(payload: BookAppointmentRequest) {
  if (!payload.doctorId) {
    throw new ApiError("Doctor selection is required.");
  }
  if (!payload.appointmentDate || !payload.startTime || !payload.endTime) {
    throw new ApiError("Date, start time, and end time are required.");
  }
}

function checkDoubleBooking(
  appointments: AppointmentDTO[],
  doctorId: string,
  date: string,
  time: string,
  ignoreId?: string,
) {
  const normalizedTime = toTimeString(time, false);
  const conflict = appointments.find(
    (apt) =>
      apt.doctorId === doctorId &&
      (apt.appointmentDate ?? "") === date &&
      toTimeString(apt.startTime, false) === normalizedTime &&
      apt.status !== "CANCELLED" &&
      apt.id !== ignoreId,
  );
  if (conflict) {
    throw new ApiError("That time slot is already booked.", 409);
  }
}

function applyFilters(appointments: AppointmentDTO[], filters: AppointmentFilters) {
  const scoped =
    filters.role === "PATIENT"
      ? appointments.filter((apt) => apt.patientId === filters.userId)
      : appointments.filter((apt) => apt.doctorId === filters.userId);

  return scoped
    .filter((apt) => {
      const appointmentDate = apt.appointmentDate ?? "";
      if (!appointmentDate) return false;
      if (filters.status && filters.status !== "ALL") {
        if (apt.status !== filters.status) return false;
      }
      if (filters.startDate && appointmentDate < filters.startDate) {
        return false;
      }
      if (filters.endDate && appointmentDate > filters.endDate) return false;
      return true;
    })
    .sort((a, b) => {
      const dateCompare = (a.appointmentDate ?? "").localeCompare(
        b.appointmentDate ?? "",
      );
      if (dateCompare !== 0) return dateCompare;
      return toTimeString(a.startTime).localeCompare(toTimeString(b.startTime));
    });
}

export async function getAppointments(
  filters: AppointmentFilters,
  token?: string | null,
): Promise<AppointmentDTO[]> {
  // Real API mode
  if (API_BASE_URL && token) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "ALL") {
      params.append("status", filters.status);
    }
    if (filters.startDate) {
      params.append("startDate", filters.startDate);
    }
    if (filters.endDate) {
      params.append("endDate", filters.endDate);
    }
    const queryString = params.toString();
    const path = `/api/appointments${queryString ? `?${queryString}` : ""}`;
    return request<AppointmentDTO[]>(path, { method: "GET" }, token);
  }

  // Mock mode
  await wait();
  const appointments = getStore();
  return applyFilters(appointments, filters);
}

export async function getAppointmentById(
  id: string,
  token?: string | null,
): Promise<AppointmentDTO> {
  // Real API mode
  if (API_BASE_URL && token) {
    return request<AppointmentDTO>(
      `/api/appointments/${id}`,
      { method: "GET" },
      token,
    );
  }

  // Mock mode
  await wait();
  const appointments = getStore();
  const appointment = appointments.find((apt) => apt.id === id);
  if (!appointment) {
    throw new ApiError("Appointment not found.", 404);
  }
  return appointment;
}

export async function bookAppointment(
  payload: BookAppointmentRequest,
  token?: string | null,
  patient?: { id: string; name: string },
): Promise<AppointmentDTO> {
  assertBookingFields(payload);

  // Real API mode
  if (API_BASE_URL && token) {
    const apiPayload = {
      ...payload,
      startTime: toTimeString(payload.startTime),
      endTime: toTimeString(payload.endTime),
    };
    const data = await request<AppointmentDTO>(
      "/api/appointments",
      {
        method: "POST",
        body: JSON.stringify(apiPayload),
      },
      token,
    );
    return data;
  }

  // Mock mode
  if (!patient?.id || !patient.name) {
    throw new ApiError("Patient information is missing.");
  }
  await wait();
  const appointments = getStore();
  const doctor = mockDoctors.find((item) => item.id === payload.doctorId);
  if (!doctor) {
    throw new ApiError("Selected doctor is unavailable.");
  }

  const startLabel = toTimeString(payload.startTime, false);
  checkDoubleBooking(
    appointments,
    payload.doctorId,
    payload.appointmentDate,
    startLabel,
  );

  const appointment: AppointmentDTO = {
    id: generateId(),
    patientId: patient.id,
    patientName: patient.name,
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorSpecialization: doctor.specialty,
    appointmentDate: payload.appointmentDate,
    startTime: normalizeLocalTime(payload.startTime),
    endTime: normalizeLocalTime(payload.endTime),
    reason: payload.reason || "General consultation",
    status: "PENDING",
    notes: "",
    rescheduleCount: 0,
  };

  appointments.push(appointment);
  saveStore(appointments);
  return appointment;
}

export async function cancelAppointment(
  id: string,
  token?: string | null,
): Promise<AppointmentDTO> {
  // Real API mode
  if (API_BASE_URL && token) {
    return request<AppointmentDTO>(
      `/api/appointments/${id}/cancel`,
      { method: "PUT" },
      token,
    );
  }

  // Mock mode
  await wait();
  const appointments = getStore();
  const index = appointments.findIndex((apt) => apt.id === id);
  if (index < 0) {
    throw new ApiError("Appointment not found.", 404);
  }
  appointments[index] = {
    ...appointments[index],
    status: "CANCELLED",
    // updatedAt: new Date().toISOString(),
  };
  saveStore(appointments);
  return appointments[index];
}

export async function rescheduleAppointment(
  id: string,
  payload: AppointmentReschedulePayload,
  token?: string | null,
): Promise<AppointmentDTO> {
  if (!payload.date || !payload.time) {
    throw new ApiError("New date and time are required.");
  }

  // Real API mode
  if (API_BASE_URL && token) {
    return request<AppointmentDTO>(
      `/api/appointments/${id}/reschedule`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      token,
    );
  }

  // Mock mode
  await wait();
  const appointments = getStore();
  const index = appointments.findIndex((apt) => apt.id === id);
  if (index < 0) {
    throw new ApiError("Appointment not found.", 404);
  }

  const current = appointments[index];
  if (!current.doctorId) {
    throw new ApiError("Doctor information is missing.", 400);
  }
  checkDoubleBooking(
    appointments,
    current.doctorId,
    payload.date,
    payload.time,
    id,
  );

  const startTime = toLocalTime(payload.time);
  const endTime = toLocalTime(addMinutes(payload.time, 30));

  appointments[index] = {
    ...current,
    appointmentDate: payload.date,
    startTime,
    endTime,
    status: "PENDING",
  };
  saveStore(appointments);
  return appointments[index];
}

export async function updateAppointmentStatus(
  id: string,
  payload: AppointmentStatusPayload,
  // payload: AppointmentStatus,
  token?: string | null,
): Promise<AppointmentDTO> {
  if (!payload?.status) {
    throw new ApiError("Appointment status is required.");
  }

  // Real API mode
  if (API_BASE_URL && token) {
    const query = new URLSearchParams({ status: payload.status }).toString();
    return request<AppointmentDTO>(
      `/api/appointments/${id}/status?${query}`,
      {
        method: "PUT",
      },
      token,
    );
  }

  // Mock mode
  await wait();
  const appointments = getStore();
  const index = appointments.findIndex((apt) => apt.id === id);
  if (index < 0) {
    throw new ApiError("Appointment not found.", 404);
  }
  appointments[index] = {
    ...appointments[index],
    status: payload.status,
  };
  saveStore(appointments);
  return appointments[index];
}

export async function getAvailableSlots(
  doctorId: string,
  date: string,
  token?: string | null,
): Promise<TimeSlot[]> {
  if (!doctorId || !date) {
    return [];
  }

  // Real API mode - use availability API endpoint
  if (API_BASE_URL && token) {
    try {
      const data = await request<Array<TimeSlot | AvailabilitySlot>>(
        `/api/availability/slots/${doctorId}?date=${date}`,
        { method: "GET" },
        token,
      );
      return data.map((slot) => {
        if ("time" in slot) {
          return {
            time: slot.time,
            endTime: addMinutes(slot.time, 30),
            available: slot.available,
          };
        }
        const time = slot.startTime?.slice(0, 5) || slot.startTime;
        const endTime = slot.endTime?.slice(0, 5) || slot.endTime;
        return { time, endTime, available: slot.available };
      });
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
      return [];
    }
  }

  // Mock mode
  await wait();
  const appointments = getStore();
  return timeSlots.map((slot) => ({
    time: slot,
    endTime: addMinutes(slot, 30),
    available: !appointments.some(
      (apt) =>
        apt.doctorId === doctorId &&
        (apt.appointmentDate ?? "") === date &&
        toTimeString(apt.startTime, false) === slot &&
        apt.status !== "CANCELLED",
    ),
  }));
}

export async function getDoctors(): Promise<DoctorSummary[]> {
  // This function is deprecated - booking happens from doctor detail page
  // Kept for backward compatibility with existing appointments page
  await wait();
  return [];
}

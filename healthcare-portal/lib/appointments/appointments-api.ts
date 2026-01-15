import { ApiError } from "@/lib/auth/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentFilters = {
  role: "patient" | "doctor";
  userId: string;
  status?: AppointmentStatus | "ALL";
  startDate?: string;
  endDate?: string;
};

export type AppointmentPayload = {
  patientId: string;
  patientName: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
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
  available: boolean;
};

// Helper function for API requests
async function request<T>(
  path: string,
  init: RequestInit,
  token?: string | null,
): Promise<T> {
  const BASE_URL = API_BASE_URL?.replace(/\/$/, "");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
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

const seedAppointments = (): Appointment[] => {
  const now = new Date().toISOString();
  return [
    {
      id: "apt-1001",
      patientId: "patient-mock-123",
      patientName: "Patient Demo",
      doctorId: "doctor-mock-123",
      doctorName: "Dr. Demo",
      specialty: "Family Medicine",
      location: "Clinic A - Room 204",
      date: nextDate(2),
      time: "09:30",
      reason: "Routine checkup",
      status: "CONFIRMED",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "apt-1002",
      patientId: "patient-mock-123",
      patientName: "Patient Demo",
      doctorId: "doctor-mock-456",
      doctorName: "Dr. Priya Singh",
      specialty: "Dermatology",
      location: "Clinic B - Suite 110",
      date: nextDate(5),
      time: "11:00",
      reason: "Skin consultation",
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "apt-1003",
      patientId: "patient-mock-987",
      patientName: "Jordan Lee",
      doctorId: "doctor-mock-123",
      doctorName: "Dr. Demo",
      specialty: "Family Medicine",
      location: "Clinic A - Room 204",
      date: nextDate(1),
      time: "10:30",
      reason: "Follow-up",
      status: "CONFIRMED",
      createdAt: now,
      updatedAt: now,
    },
  ];
};

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const getStore = (): Appointment[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Appointment[];
    }
  } catch {
    // ignore parsing errors
  }

  const seeded = seedAppointments();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
};

const saveStore = (appointments: Appointment[]) => {
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

function assertBookingFields(payload: AppointmentPayload) {
  if (!payload.patientId || !payload.patientName) {
    throw new ApiError("Patient information is missing.");
  }
  if (!payload.doctorId) {
    throw new ApiError("Doctor selection is required.");
  }
  if (!payload.date || !payload.time) {
    throw new ApiError("Date and time are required.");
  }
}

function checkDoubleBooking(
  appointments: Appointment[],
  doctorId: string,
  date: string,
  time: string,
  ignoreId?: string,
) {
  const conflict = appointments.find(
    (apt) =>
      apt.doctorId === doctorId &&
      apt.date === date &&
      apt.time === time &&
      apt.status !== "CANCELLED" &&
      apt.id !== ignoreId,
  );
  if (conflict) {
    throw new ApiError("That time slot is already booked.", 409);
  }
}

function applyFilters(appointments: Appointment[], filters: AppointmentFilters) {
  const scoped =
    filters.role === "patient"
      ? appointments.filter((apt) => apt.patientId === filters.userId)
      : appointments.filter((apt) => apt.doctorId === filters.userId);

  return scoped
    .filter((apt) => {
      if (filters.status && filters.status !== "ALL") {
        return apt.status === filters.status;
      }
      return true;
    })
    .filter((apt) => {
      if (filters.startDate && apt.date < filters.startDate) return false;
      if (filters.endDate && apt.date > filters.endDate) return false;
      return true;
    })
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
}

export async function getAppointments(
  filters: AppointmentFilters,
  token?: string | null,
): Promise<Appointment[]> {
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
    return request<Appointment[]>(path, { method: "GET" }, token);
  }

  // Mock mode
  await wait();
  const appointments = getStore();
  return applyFilters(appointments, filters);
}

export async function getAppointmentById(
  id: string,
  token?: string | null,
): Promise<Appointment> {
  // Real API mode
  if (API_BASE_URL && token) {
    return request<Appointment>(`/api/appointments/${id}`, { method: "GET" }, token);
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
  payload: AppointmentPayload,
  token?: string | null,
): Promise<Appointment> {
  assertBookingFields(payload);

  // Real API mode
  if (API_BASE_URL && token) {
    return request<Appointment>(
      "/api/appointments",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    );
  }

  // Mock mode
  await wait();
  const appointments = getStore();
  const doctor = mockDoctors.find((item) => item.id === payload.doctorId);
  if (!doctor) {
    throw new ApiError("Selected doctor is unavailable.");
  }

  checkDoubleBooking(appointments, payload.doctorId, payload.date, payload.time);

  const now = new Date().toISOString();
  const appointment: Appointment = {
    id: generateId(),
    patientId: payload.patientId,
    patientName: payload.patientName,
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    location: doctor.location,
    date: payload.date,
    time: payload.time,
    reason: payload.reason || "General consultation",
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
  };

  appointments.push(appointment);
  saveStore(appointments);
  return appointment;
}

export async function cancelAppointment(
  id: string,
  token?: string | null,
): Promise<Appointment> {
  // Real API mode
  if (API_BASE_URL && token) {
    return request<Appointment>(
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
    updatedAt: new Date().toISOString(),
  };
  saveStore(appointments);
  return appointments[index];
}

export async function rescheduleAppointment(
  id: string,
  payload: AppointmentReschedulePayload,
  token?: string | null,
): Promise<Appointment> {
  if (!payload.date || !payload.time) {
    throw new ApiError("New date and time are required.");
  }

  // Real API mode
  if (API_BASE_URL && token) {
    return request<Appointment>(
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
  checkDoubleBooking(
    appointments,
    current.doctorId,
    payload.date,
    payload.time,
    id,
  );

  appointments[index] = {
    ...current,
    date: payload.date,
    time: payload.time,
    status: "PENDING",
    updatedAt: new Date().toISOString(),
  };
  saveStore(appointments);
  return appointments[index];
}

export async function updateAppointmentStatus(
  id: string,
  payload: AppointmentStatusPayload,
  token?: string | null,
): Promise<Appointment> {
  // Real API mode
  if (API_BASE_URL && token) {
    return request<Appointment>(
      `/api/appointments/${id}/status`,
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
  appointments[index] = {
    ...appointments[index],
    status: payload.status,
    updatedAt: new Date().toISOString(),
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
      return request<TimeSlot[]>(
        `/api/availability/slots/${doctorId}?date=${date}`,
        { method: "GET" },
        token,
      );
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
    available: !appointments.some(
      (apt) =>
        apt.doctorId === doctorId &&
        apt.date === date &&
        apt.time === slot &&
        apt.status !== "CANCELLED",
    ),
  }));
}

export async function getDoctors(
  token?: string | null,
): Promise<DoctorSummary[]> {
  // Real API mode - use doctor search API
  if (API_BASE_URL && token) {
    try {
      // Get all doctors (no filters)
      type DoctorSearchResult = {
        id?: string;
        userId?: string;
        firstName?: string;
        lastName?: string;
        name?: string;
        specialization?: string;
        specialty?: string;
        city?: string;
        location?: string;
      };
      const doctors = await request<DoctorSearchResult[]>(
        "/api/doctors/search",
        { method: "GET" },
        token,
      );
      // Map to DoctorSummary format
      console.log("Fetched doctors from API:", doctors);
      return doctors.map((doc) => ({
        id: doc.id || doc.userId || "",
        name: `${doc.firstName || ""} ${doc.lastName || ""}`.trim() || doc.name || "Unknown Doctor",
        specialty: doc.specialization || doc.specialty || "General Practice",
        location: doc.city || doc.location || "Unknown Location",
      }));
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      // Fall back to mock data on error
    }
  }

  // Mock mode
  await wait();
  return mockDoctors;
}

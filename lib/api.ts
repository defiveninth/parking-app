const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

async function request<T>(
  path: string,
  options: RequestInit & { authToken?: string } = {},
): Promise<T> {
  const { authToken, headers, ...rest } = options

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(headers || {}),
    },
  })

  let data: any = null
  try {
    data = await res.json()
  } catch {
    // ignore JSON parse errors, fall back to generic message
  }

  if (!res.ok) {
    const message = data?.error || data?.message || "Request failed"
    throw new Error(message)
  }

  return data as T
}

export interface AuthUser {
  id: number
  email: string
  name: string
  phone: string | null
  carNumber: string | null
  avatar: string | null
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export async function loginApi(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function registerApi(params: {
  email: string
  password: string
  name: string
  phone?: string
  carNumber?: string
}) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

export interface BookingPayload {
  parkingSpotId: number
  date?: string
  startTime?: string
  endTime?: string
  duration?: string
  durationMinutes?: number
  price: number
}

export interface BookingDto {
  id: number | string
  parkingName: string
  address: string
  date: string
  startTime: string
  endTime: string
  duration: string
  price: number
  status: "active" | "completed" | "reserved"
  qrCode: string
}

export async function createBookingApi(token: string, payload: BookingPayload) {
  return request<BookingDto>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
    authToken: token,
  })
}

export async function getBookingsApi(token: string) {
  return request<BookingDto[]>("/bookings", {
    method: "GET",
    authToken: token,
  })
}


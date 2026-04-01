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
  balance: number
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
  bookingType?: "enter_now" | "book_later"
}

export interface BookingDto {
  id: number | string
  parkingSpotId?: number
  parkingName: string
  address: string
  date: string
  startTime: string
  endTime: string
  duration: string
  price: number
  status: "active" | "completed" | "reserved"
  qrCode: string
  bookingType?: "enter_now" | "book_later"
  expiresAt?: string
  enteredAt?: string
  pricePerHour?: number
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

export interface ParkingSpotDto {
  id: string
  name: string
  address: string
  distance: string
  availableSpots: number
  totalSpots: number
  pricePerHour: number
  lat: number
  lng: number
  hasCovered: boolean
  hasCharging: boolean
  hasDisabled: boolean
}

export async function getParkingSpotsApi() {
  return request<ParkingSpotDto[]>("/parking/spots", {
    method: "GET",
  })
}

export async function getParkingSpotApi(id: string) {
  return request<ParkingSpotDto>(`/parking/spots/${id}`, {
    method: "GET",
  })
}

export interface UserProfileDto {
  name: string
  email: string
  phone: string | null
  carNumber: string | null
  avatar: string | null
  balance: number
}

export async function getUserProfileApi(token: string) {
  return request<UserProfileDto>("/users/me", {
    method: "GET",
    authToken: token,
  })
}

export async function updateUserProfileApi(
  token: string,
  payload: Partial<UserProfileDto>,
) {
  return request<UserProfileDto>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
    authToken: token,
  })
}

export async function topUpBalanceApi(token: string, amount: number) {
  return request<UserProfileDto>("/users/me/topup", {
    method: "POST",
    body: JSON.stringify({ amount }),
    authToken: token,
  })
}

export async function updateBookingStatusApi(
  token: string,
  bookingId: string | number,
  status: "active" | "completed" | "reserved",
) {
  return request<BookingDto>(`/bookings/${bookingId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    authToken: token,
  })
}

export async function getBookingApi(token: string, bookingId: string | number) {
  return request<BookingDto>(`/bookings/${bookingId}`, {
    method: "GET",
    authToken: token,
  })
}

export interface OpenBarrierResponse {
  success: boolean
  message?: string
  error?: string
}

export async function openBarrierApi(token: string, bookingId: string | number) {
  return request<OpenBarrierResponse>(`/bookings/${bookingId}/open-barrier`, {
    method: "POST",
    authToken: token,
  })
}

export interface ExitBarrierResponse {
  success: boolean
  message?: string
  error?: string
  duration?: string
  durationMinutes?: number
  cost?: number
  pricePerHour?: number
  billedHours?: number
  newBalance?: number
}

export async function exitBarrierApi(token: string, bookingId: string | number) {
  return request<ExitBarrierResponse>(`/bookings/${bookingId}/exit-barrier`, {
    method: "POST",
    authToken: token,
  })
}

// ============ ADMIN API ============

const ADMIN_KEY_STORAGE = "admin_private_key"

export function getAdminKey(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ADMIN_KEY_STORAGE)
}

export function setAdminKey(key: string): void {
  localStorage.setItem(ADMIN_KEY_STORAGE, key)
}

export function clearAdminKey(): void {
  localStorage.removeItem(ADMIN_KEY_STORAGE)
}

async function adminRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const privateKey = getAdminKey()
  if (!privateKey) {
    throw new Error("Admin key not set")
  }

  const { headers, ...rest } = options

  const res = await fetch(`${API_BASE}/admin${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      "X-Private-Key": privateKey,
      ...(headers || {}),
    },
  })

  let data: any = null
  try {
    data = await res.json()
  } catch {
    // ignore JSON parse errors
  }

  if (!res.ok) {
    const message = data?.error || data?.message || "Request failed"
    throw new Error(message)
  }

  return data as T
}

export async function verifyAdminKeyApi(key: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Private-Key": key,
    },
  })
  return res.ok
}

// Admin User DTOs
export interface AdminUserDto {
  id: number
  email: string
  name: string
  phone: string | null
  carNumber: string | null
  avatar: string | null
  createdAt: string
  updatedAt: string
}

export async function getAdminUsersApi() {
  return adminRequest<AdminUserDto[]>("/users", { method: "GET" })
}

export async function getAdminUserApi(id: number) {
  return adminRequest<AdminUserDto>(`/users/${id}`, { method: "GET" })
}

export async function createAdminUserApi(data: {
  email: string
  password: string
  name: string
  phone?: string
  carNumber?: string
}) {
  return adminRequest<AdminUserDto>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateAdminUserApi(
  id: number,
  data: {
    email?: string
    password?: string
    name?: string
    phone?: string
    carNumber?: string
  }
) {
  return adminRequest<AdminUserDto>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteAdminUserApi(id: number) {
  return adminRequest<{ success: boolean }>(`/users/${id}`, { method: "DELETE" })
}

// Admin Parking DTOs
export interface AdminParkingDto {
  id: number
  name: string
  address: string
  distance: string
  availableSpots: number
  totalSpots: number
  pricePerHour: number
  lat: number
  lng: number
  hasCovered: boolean
  hasCharging: boolean
  hasDisabled: boolean
  createdAt: string
}

export async function getAdminParkingApi() {
  return adminRequest<AdminParkingDto[]>("/parking", { method: "GET" })
}

export async function getAdminParkingByIdApi(id: number) {
  return adminRequest<AdminParkingDto>(`/parking/${id}`, { method: "GET" })
}

export async function createAdminParkingApi(data: {
  name: string
  address: string
  distance?: string
  availableSpots?: number
  totalSpots?: number
  pricePerHour?: number
  lat: number
  lng: number
  hasCovered?: boolean
  hasCharging?: boolean
  hasDisabled?: boolean
}) {
  return adminRequest<AdminParkingDto>("/parking", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateAdminParkingApi(
  id: number,
  data: Partial<{
    name: string
    address: string
    distance: string
    availableSpots: number
    totalSpots: number
    pricePerHour: number
    lat: number
    lng: number
    hasCovered: boolean
    hasCharging: boolean
    hasDisabled: boolean
  }>
) {
  return adminRequest<AdminParkingDto>(`/parking/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteAdminParkingApi(id: number) {
  return adminRequest<{ success: boolean }>(`/parking/${id}`, { method: "DELETE" })
}

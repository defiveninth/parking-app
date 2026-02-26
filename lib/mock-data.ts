export interface ParkingSpot {
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

export interface Booking {
  id: string
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

export interface UserProfile {
  name: string
  email: string
  phone: string
  carNumber: string
  avatar: string
}

export const parkingSpots: ParkingSpot[] = [
  {
    id: "1",
    name: "Dostyk Plaza Parking",
    address: "Dostyk Ave 111, Almaty",
    distance: "200m",
    availableSpots: 24,
    totalSpots: 80,
    pricePerHour: 500,
    lat: 43.2380,
    lng: 76.9458,
    hasCovered: true,
    hasCharging: true,
    hasDisabled: true,
  },
  {
    id: "2",
    name: "Mega Park Parking",
    address: "Rozybakiyev St 263, Almaty",
    distance: "450m",
    availableSpots: 12,
    totalSpots: 120,
    pricePerHour: 600,
    lat: 43.2320,
    lng: 76.9270,
    hasCovered: true,
    hasCharging: false,
    hasDisabled: true,
  },
  {
    id: "3",
    name: "Arbat Parking Lot",
    address: "Zhybek Zholy Ave 50, Almaty",
    distance: "800m",
    availableSpots: 45,
    totalSpots: 60,
    pricePerHour: 300,
    lat: 43.2565,
    lng: 76.9435,
    hasCovered: false,
    hasCharging: true,
    hasDisabled: false,
  },
  {
    id: "4",
    name: "Esentai Mall Garage",
    address: "Al-Farabi Ave 77/8, Almaty",
    distance: "1.2km",
    availableSpots: 8,
    totalSpots: 50,
    pricePerHour: 800,
    lat: 43.2185,
    lng: 76.9600,
    hasCovered: true,
    hasCharging: true,
    hasDisabled: true,
  },
  {
    id: "5",
    name: "Kok-Tobe Parking",
    address: "Kok-Tobe, Almaty",
    distance: "1.5km",
    availableSpots: 32,
    totalSpots: 100,
    pricePerHour: 200,
    lat: 43.2270,
    lng: 76.9780,
    hasCovered: false,
    hasCharging: false,
    hasDisabled: true,
  },
]

export const bookings: Booking[] = [
  {
    id: "BK-2847",
    parkingName: "Dostyk Plaza Parking",
    address: "Dostyk Ave 111, Almaty",
    date: "Today",
    startTime: "10:30 AM",
    endTime: "2:30 PM",
    duration: "4h 00m",
    price: 2000,
    status: "active",
    qrCode: "BK-2847-QR",
  },
  {
    id: "BK-1923",
    parkingName: "Mega Park Parking",
    address: "Rozybakiyev St 263, Almaty",
    date: "Yesterday",
    startTime: "2:00 PM",
    endTime: "5:00 PM",
    duration: "3h 00m",
    price: 1800,
    status: "completed",
    qrCode: "BK-1923-QR",
  },
  {
    id: "BK-3412",
    parkingName: "Esentai Mall Garage",
    address: "Al-Farabi Ave 77/8, Almaty",
    date: "Tomorrow",
    startTime: "9:00 AM",
    endTime: "12:00 PM",
    duration: "3h 00m",
    price: 2400,
    status: "reserved",
    qrCode: "BK-3412-QR",
  },
  {
    id: "BK-0892",
    parkingName: "Arbat Parking Lot",
    address: "Zhybek Zholy Ave 50, Almaty",
    date: "Feb 22",
    startTime: "11:00 AM",
    endTime: "1:00 PM",
    duration: "2h 00m",
    price: 600,
    status: "completed",
    qrCode: "BK-0892-QR",
  },
]

export const userProfile: UserProfile = {
  name: "Alikhan Nazarbayev",
  email: "alikhan@email.com",
  phone: "+7 (707) 123-4567",
  carNumber: "A 123 BCD",
  avatar: "AJ",
}

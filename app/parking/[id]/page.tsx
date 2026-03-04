import { CarParkDetailsScreen } from "@/components/screens/carpark-details-screen"

export default async function ParkingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CarParkDetailsScreen spotId={id} />
}

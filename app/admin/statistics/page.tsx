"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminStatisticsApi, type AdminStatisticsDto } from "@/lib/api"
import { useTranslation } from "@/lib/i18n/language-context"
import { Users, Car, Receipt, Activity, TrendingUp, Clock, BarChart3, DollarSign } from "lucide-react"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

export default function StatisticsPage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<AdminStatisticsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const data = await getAdminStatisticsApi()
      setStats(data)
      setError("")
    } catch (err) {
      console.error("Failed to load statistics:", err)
      setError("Failed to load statistics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t("common.loading")}</div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error || "No statistics available"}</p>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    active: COLORS[0],
    completed: COLORS[1],
    reserved: COLORS[2],
  }

  const statusLabels: Record<string, string> = {
    active: "Active",
    completed: "Completed",
    reserved: "Reserved",
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground lg:text-3xl">Statistics Dashboard</h2>
        <p className="mt-1 text-muted-foreground">Overview of your parking business metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Parking Spots</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalParkingSpots}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overview.activeBookings} active now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₸{stats.overview.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Booking Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.avgBookingDuration} min</div>
            <p className="text-xs text-muted-foreground">Average parking time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.activeBookings}</div>
            <p className="text-xs text-muted-foreground">Currently parked vehicles</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Trend (Last 7 Days) */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={COLORS[0]} 
                  strokeWidth={2}
                  name="Revenue (₸)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Status</CardTitle>
            <CardDescription>Current distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.bookingsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${statusLabels[status] || status}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.bookingsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.status] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>Bookings by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.peakHours}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="hour" 
                  className="text-xs"
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  labelFormatter={(value) => `Hour: ${value}:00`}
                />
                <Bar dataKey="bookings" fill={COLORS[1]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Registration Trend */}
        <Card>
          <CardHeader>
            <CardTitle>User Registrations</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.userRegistrationTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <Line 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke={COLORS[2]} 
                  strokeWidth={2}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Parking Spots */}
      <Card>
        <CardHeader>
          <CardTitle>Top Parking Spots</CardTitle>
          <CardDescription>By total bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.topParkingSpots} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={150}
                className="text-xs"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Bar dataKey="bookingCount" fill={COLORS[3]} name="Bookings" />
              <Bar dataKey="totalRevenue" fill={COLORS[4]} name="Revenue (₸)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
          <CardDescription>Last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tickFormatter={(value) => {
                  const [year, month] = value.split('-')
                  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                }}
              />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                labelFormatter={(value) => {
                  const [year, month] = value.split('-')
                  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill={COLORS[0]} name="Revenue (₸)" />
              <Bar dataKey="bookings" fill={COLORS[1]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

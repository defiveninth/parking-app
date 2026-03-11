"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Lock, Users, Car, Plus, Pencil, Trash2, LogOut } from "lucide-react"
import {
  getAdminKey,
  setAdminKey,
  clearAdminKey,
  verifyAdminKeyApi,
  getAdminUsersApi,
  createAdminUserApi,
  updateAdminUserApi,
  deleteAdminUserApi,
  getAdminParkingApi,
  createAdminParkingApi,
  updateAdminParkingApi,
  deleteAdminParkingApi,
  type AdminUserDto,
  type AdminParkingDto,
} from "@/lib/api"
import { MapPicker } from "@/components/admin/map-picker"

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [privateKey, setPrivateKey] = useState("")
  const [authError, setAuthError] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      const storedKey = getAdminKey()
      if (storedKey) {
        try {
          const valid = await verifyAdminKeyApi(storedKey)
          if (valid) {
            setIsAuthorized(true)
          } else {
            clearAdminKey()
          }
        } catch {
          clearAdminKey()
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const handleAuth = async () => {
    setAuthError("")
    try {
      const valid = await verifyAdminKeyApi(privateKey)
      if (valid) {
        setAdminKey(privateKey)
        setIsAuthorized(true)
      } else {
        setAuthError("Invalid private key")
      }
    } catch {
      setAuthError("Invalid private key")
    }
  }

  const handleLogout = () => {
    clearAdminKey()
    setIsAuthorized(false)
    setPrivateKey("")
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>Enter your private key to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder="Enter private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            />
            {authError && <p className="text-sm text-destructive">{authError}</p>}
            <Button onClick={handleAuth} className="w-full">
              Authenticate
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <main className="container px-4 py-6">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="parkings" className="gap-2">
              <Car className="h-4 w-4" />
              Parkings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="parkings">
            <ParkingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// ============ USERS TAB ============

function UsersTab() {
  const [users, setUsers] = useState<AdminUserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUserDto | null>(null)
  const [deleteUser, setDeleteUser] = useState<AdminUserDto | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    carNumber: "",
  })

  const loadUsers = async () => {
    try {
      const data = await getAdminUsersApi()
      setUsers(data)
    } catch (err) {
      console.error("Failed to load users:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const openCreateDialog = () => {
    setEditingUser(null)
    setFormData({ email: "", password: "", name: "", phone: "", carNumber: "" })
    setDialogOpen(true)
  }

  const openEditDialog = (user: AdminUserDto) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: "",
      name: user.name,
      phone: user.phone || "",
      carNumber: user.carNumber || "",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingUser) {
        await updateAdminUserApi(editingUser.id, {
          email: formData.email,
          name: formData.name,
          phone: formData.phone || undefined,
          carNumber: formData.carNumber || undefined,
          password: formData.password || undefined,
        })
      } else {
        await createAdminUserApi({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || undefined,
          carNumber: formData.carNumber || undefined,
        })
      }
      setDialogOpen(false)
      loadUsers()
    } catch (err) {
      console.error("Save user failed:", err)
    }
  }

  const handleDelete = async () => {
    if (!deleteUser) return
    try {
      await deleteAdminUserApi(deleteUser.id)
      setDeleteUser(null)
      loadUsers()
    } catch (err) {
      console.error("Delete user failed:", err)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading users...</div>
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Users ({users.length})</h2>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Car Number</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || "-"}</TableCell>
                <TableCell>{user.carNumber || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteUser(user)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the user information below." : "Fill in the details for the new user."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password {editingUser && "(leave empty to keep current)"}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="carNumber">Car Number</Label>
              <Input
                id="carNumber"
                value={formData.carNumber}
                onChange={(e) => setFormData({ ...formData, carNumber: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteUser?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============ PARKINGS TAB ============

function ParkingsTab() {
  const [parkings, setParkings] = useState<AdminParkingDto[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingParking, setEditingParking] = useState<AdminParkingDto | null>(null)
  const [deleteParking, setDeleteParking] = useState<AdminParkingDto | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    distance: "",
    totalSpots: 0,
    availableSpots: 0,
    pricePerHour: 0,
    lat: 43.238,
    lng: 76.9458,
    hasCovered: false,
    hasCharging: false,
    hasDisabled: false,
  })

  const loadParkings = async () => {
    try {
      const data = await getAdminParkingApi()
      setParkings(data)
    } catch (err) {
      console.error("Failed to load parkings:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadParkings()
  }, [])

  const openCreateDialog = () => {
    setEditingParking(null)
    setFormData({
      name: "",
      address: "",
      distance: "",
      totalSpots: 0,
      availableSpots: 0,
      pricePerHour: 0,
      lat: 43.238,
      lng: 76.9458,
      hasCovered: false,
      hasCharging: false,
      hasDisabled: false,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (parking: AdminParkingDto) => {
    setEditingParking(parking)
    setFormData({
      name: parking.name,
      address: parking.address,
      distance: parking.distance || "",
      totalSpots: parking.totalSpots,
      availableSpots: parking.availableSpots,
      pricePerHour: parking.pricePerHour,
      lat: parking.lat,
      lng: parking.lng,
      hasCovered: parking.hasCovered,
      hasCharging: parking.hasCharging,
      hasDisabled: parking.hasDisabled,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingParking) {
        await updateAdminParkingApi(editingParking.id, formData)
      } else {
        await createAdminParkingApi(formData)
      }
      setDialogOpen(false)
      loadParkings()
    } catch (err) {
      console.error("Save parking failed:", err)
    }
  }

  const handleDelete = async () => {
    if (!deleteParking) return
    try {
      await deleteAdminParkingApi(deleteParking.id)
      setDeleteParking(null)
      loadParkings()
    } catch (err) {
      console.error("Delete parking failed:", err)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading parkings...</div>
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Parking Spots ({parkings.length})</h2>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Parking
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Price/hr</TableHead>
              <TableHead>Features</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parkings.map((parking) => (
              <TableRow key={parking.id}>
                <TableCell>{parking.id}</TableCell>
                <TableCell className="font-medium">{parking.name}</TableCell>
                <TableCell className="max-w-[200px] truncate">{parking.address}</TableCell>
                <TableCell>
                  {parking.availableSpots}/{parking.totalSpots}
                </TableCell>
                <TableCell>{parking.pricePerHour} KZT</TableCell>
                <TableCell>
                  <div className="flex gap-1 text-xs">
                    {parking.hasCovered && <span className="rounded bg-muted px-1">Covered</span>}
                    {parking.hasCharging && <span className="rounded bg-muted px-1">EV</span>}
                    {parking.hasDisabled && <span className="rounded bg-muted px-1">Disabled</span>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(parking)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteParking(parking)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {parkings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No parking spots found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingParking ? "Edit Parking" : "Create Parking"}</DialogTitle>
            <DialogDescription>
              {editingParking ? "Update the parking spot information." : "Fill in the details for the new parking spot."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="p-name">Name</Label>
                <Input
                  id="p-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-distance">Distance (display)</Label>
                <Input
                  id="p-distance"
                  placeholder="e.g., 1.2 km"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-address">Address</Label>
              <Input
                id="p-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="p-total">Total Spots (Max Capacity)</Label>
                <Input
                  id="p-total"
                  type="number"
                  value={formData.totalSpots}
                  onChange={(e) => setFormData({ ...formData, totalSpots: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-available">Available Spots</Label>
                <Input
                  id="p-available"
                  type="number"
                  value={formData.availableSpots}
                  onChange={(e) => setFormData({ ...formData, availableSpots: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-price">Price/Hour (KZT)</Label>
                <Input
                  id="p-price"
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Location (click on map to set)</Label>
              <MapPicker
                lat={formData.lat}
                lng={formData.lng}
                onChange={(lat, lng) => setFormData({ ...formData, lat, lng })}
              />
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Lat: {formData.lat.toFixed(6)}</span>
                <span>Lng: {formData.lng.toFixed(6)}</span>
              </div>
            </div>
            <div className="grid gap-4">
              <Label>Features</Label>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="p-covered"
                    checked={formData.hasCovered}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasCovered: checked })}
                  />
                  <Label htmlFor="p-covered" className="font-normal">Covered Parking</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="p-charging"
                    checked={formData.hasCharging}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasCharging: checked })}
                  />
                  <Label htmlFor="p-charging" className="font-normal">EV Charging</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="p-disabled"
                    checked={formData.hasDisabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasDisabled: checked })}
                  />
                  <Label htmlFor="p-disabled" className="font-normal">Disabled Access</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteParking} onOpenChange={(open) => !open && setDeleteParking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Parking Spot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteParking?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

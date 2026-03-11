"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lock, Users, Car, Plus, Pencil, Trash2, LogOut, Menu, X, MapPin, Zap, Accessibility, Building2 } from "lucide-react"
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

type TabValue = "users" | "parkings"

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [privateKey, setPrivateKey] = useState("")
  const [authError, setAuthError] = useState("")
  const [activeTab, setActiveTab] = useState<TabValue>("users")
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
            <CardDescription className="text-base">Enter your private key to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder="Enter private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              className="h-12 text-base"
            />
            {authError && <p className="text-sm text-destructive">{authError}</p>}
            <Button onClick={handleAuth} className="h-12 text-base font-medium">
              Authenticate
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const navItems = [
    { id: "users" as const, label: "Users", icon: Users },
    { id: "parkings" as const, label: "Parking Spots", icon: Car },
  ]

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar for mobile */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">
            {navItems.find((item) => item.id === activeTab)?.label}
          </h1>
          <div className="w-10" />
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {activeTab === "users" && <UsersTab />}
            {activeTab === "parkings" && <ParkingsTab />}
          </div>
        </main>
      </div>
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
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground lg:text-3xl">Users</h2>
          <p className="mt-1 text-muted-foreground">
            Manage user accounts ({users.length} total)
          </p>
        </div>
        <Button onClick={openCreateDialog} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Add User
        </Button>
      </div>

      {/* Desktop Table */}
      <Card className="hidden lg:block">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Car Number</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-muted-foreground">{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || <span className="text-muted-foreground">-</span>}</TableCell>
                  <TableCell>
                    {user.carNumber ? (
                      <Badge variant="secondary">{user.carNumber}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
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
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No users found. Create your first user.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                {user.carNumber && (
                  <Badge variant="secondary" className="mt-2">{user.carNumber}</Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteUser(user)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {users.length === 0 && (
          <Card>
            <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
              No users found
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingUser ? "Edit User" : "Create User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the user information below." : "Fill in the details for the new user."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">
                Password {editingUser && <span className="font-normal text-muted-foreground">(leave empty to keep current)</span>}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="carNumber">Car Number</Label>
                <Input
                  id="carNumber"
                  value={formData.carNumber}
                  onChange={(e) => setFormData({ ...formData, carNumber: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteUser?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
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
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading parking spots...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground lg:text-3xl">Parking Spots</h2>
          <p className="mt-1 text-muted-foreground">
            Manage parking locations ({parkings.length} total)
          </p>
        </div>
        <Button onClick={openCreateDialog} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Add Parking
        </Button>
      </div>

      {/* Desktop Table */}
      <Card className="hidden xl:block">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[200px]">Address</TableHead>
                <TableHead className="w-32">Capacity</TableHead>
                <TableHead className="w-32">Price/hr</TableHead>
                <TableHead className="min-w-[160px]">Features</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parkings.map((parking) => (
                <TableRow key={parking.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-muted-foreground">{parking.id}</TableCell>
                  <TableCell className="font-medium">{parking.name}</TableCell>
                  <TableCell className="max-w-[250px]">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="line-clamp-2">{parking.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary">{parking.availableSpots}</span>
                      <span className="text-muted-foreground">/</span>
                      <span>{parking.totalSpots}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{parking.pricePerHour}</span>
                    <span className="ml-1 text-muted-foreground">KZT</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {parking.hasCovered && (
                        <Badge variant="secondary" className="gap-1">
                          <Building2 className="h-3 w-3" />
                          Covered
                        </Badge>
                      )}
                      {parking.hasCharging && (
                        <Badge variant="secondary" className="gap-1">
                          <Zap className="h-3 w-3" />
                          EV
                        </Badge>
                      )}
                      {parking.hasDisabled && (
                        <Badge variant="secondary" className="gap-1">
                          <Accessibility className="h-3 w-3" />
                          Accessible
                        </Badge>
                      )}
                      {!parking.hasCovered && !parking.hasCharging && !parking.hasDisabled && (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
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
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No parking spots found. Create your first parking spot.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Tablet/Mobile Cards */}
      <div className="grid gap-4 xl:hidden sm:grid-cols-2 lg:grid-cols-3">
        {parkings.map((parking) => (
          <Card key={parking.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{parking.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-start gap-1">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                    <span className="line-clamp-2">{parking.address}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(parking)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteParking(parking)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3 pt-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Capacity</span>
                <span>
                  <span className="font-medium text-primary">{parking.availableSpots}</span>
                  <span className="text-muted-foreground"> / {parking.totalSpots}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">{parking.pricePerHour} KZT/hr</span>
              </div>
              {(parking.hasCovered || parking.hasCharging || parking.hasDisabled) && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {parking.hasCovered && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Building2 className="h-3 w-3" />
                      Covered
                    </Badge>
                  )}
                  {parking.hasCharging && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Zap className="h-3 w-3" />
                      EV
                    </Badge>
                  )}
                  {parking.hasDisabled && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Accessibility className="h-3 w-3" />
                      Accessible
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {parkings.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
              No parking spots found
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingParking ? "Edit Parking" : "Create Parking"}</DialogTitle>
            <DialogDescription>
              {editingParking ? "Update the parking spot information." : "Fill in the details for the new parking spot."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 lg:grid-cols-2">
            {/* Left column - Form fields */}
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="p-name">Name</Label>
                <Input
                  id="p-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11"
                  placeholder="e.g., Central Parking"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-address">Address</Label>
                <Input
                  id="p-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="h-11"
                  placeholder="Full street address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-distance">Distance (display text)</Label>
                <Input
                  id="p-distance"
                  placeholder="e.g., 1.2 km"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="p-total">Total Spots</Label>
                  <Input
                    id="p-total"
                    type="number"
                    value={formData.totalSpots}
                    onChange={(e) => setFormData({ ...formData, totalSpots: parseInt(e.target.value) || 0 })}
                    className="h-11"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="p-available">Available</Label>
                  <Input
                    id="p-available"
                    type="number"
                    value={formData.availableSpots}
                    onChange={(e) => setFormData({ ...formData, availableSpots: parseInt(e.target.value) || 0 })}
                    className="h-11"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="p-price">Price (KZT)</Label>
                  <Input
                    id="p-price"
                    type="number"
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData({ ...formData, pricePerHour: parseInt(e.target.value) || 0 })}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid gap-3">
                <Label>Features</Label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="p-covered" className="font-normal">Covered Parking</Label>
                    </div>
                    <Switch
                      id="p-covered"
                      checked={formData.hasCovered}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasCovered: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="p-charging" className="font-normal">EV Charging</Label>
                    </div>
                    <Switch
                      id="p-charging"
                      checked={formData.hasCharging}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasCharging: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Accessibility className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="p-disabled" className="font-normal">Accessible Parking</Label>
                    </div>
                    <Switch
                      id="p-disabled"
                      checked={formData.hasDisabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasDisabled: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Map */}
            <div className="flex flex-col gap-3">
              <Label>Location (click on map to set)</Label>
              <div className="flex-1">
                <MapPicker
                  lat={formData.lat}
                  lng={formData.lng}
                  onChange={(lat, lng) => setFormData({ ...formData, lat, lng })}
                />
              </div>
              <div className="flex gap-4 rounded-lg bg-muted/50 p-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Lat: </span>
                  <span className="font-mono font-medium">{formData.lat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lng: </span>
                  <span className="font-mono font-medium">{formData.lng.toFixed(6)}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteParking} onOpenChange={(open) => !open && setDeleteParking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Parking Spot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteParking?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

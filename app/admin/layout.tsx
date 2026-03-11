export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout min-h-dvh w-full bg-background">
      {children}
    </div>
  )
}

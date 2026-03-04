export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted">
      <div className="mx-auto h-dvh w-full max-w-md overflow-hidden bg-background shadow-2xl sm:my-4 sm:h-[calc(100dvh-2rem)] sm:rounded-[2rem] sm:border sm:border-border">
        {children}
      </div>
    </main>
  )
}

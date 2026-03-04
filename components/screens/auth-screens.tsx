"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { useTranslation } from "@/lib/i18n/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { ArrowLeft, Car, Eye, EyeOff } from "lucide-react"
import { loginApi, registerApi } from "@/lib/api"

export function LoginScreen() {
  const router = useRouter()
  const { setAuth } = useApp()
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setError(null)
    setLoading(true)
    try {
      const res = await loginApi(email, password)
      setAuth(res.user, res.token)
      router.push("/home")
    } catch (err: any) {
      setError(err?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex flex-1 flex-col px-6 pt-16">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground">
            <Car className="h-8 w-8 text-background" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("login.welcomeBack")}</h1>
          <p className="text-sm text-muted-foreground">{t("login.signInToAccount")}</p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">{t("login.email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailPlaceholder")}
              className="h-12 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">{t("login.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("login.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-border bg-card pr-12 text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <button
              className="self-end text-sm font-medium text-accent"
              onClick={() => {}}
            >
              {t("login.forgotPassword")}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <Button
            className="h-14 rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? t("login.loggingIn") : t("login.login")}
          </Button>
        </div>

        <div className="mt-8 text-center">
          <span className="text-sm text-muted-foreground">{t("login.noAccount")}</span>
          <button className="text-sm font-semibold text-accent" onClick={() => router.push("/signup")}>
            {t("login.signUp")}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SignupScreen() {
  const router = useRouter()
  const { setAuth } = useApp()
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [carNumber, setCarNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignup() {
    setError(null)
    setLoading(true)
    try {
      const res = await registerApi({
        name,
        email,
        phone,
        carNumber,
        password,
      })
      setAuth(res.user, res.token)
      router.push("/home")
    } catch (err: any) {
      setError(err?.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center px-4 pt-14 pb-4">
        <button onClick={() => router.back()} className="rounded-xl p-2 text-foreground hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">{t("signup.createAccount")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("signup.fillDetails")}</p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullname" className="text-sm font-medium text-foreground">{t("signup.fullName")}</Label>
            <Input
              id="fullname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("signup.fullNamePlaceholder")}
              className="h-12 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">{t("signup.email")}</Label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("signup.emailPlaceholder")}
              className="h-12 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">{t("signup.phone")}</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("signup.phonePlaceholder")}
              className="h-12 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="car" className="text-sm font-medium text-foreground">{t("signup.carNumber")}</Label>
            <Input
              id="car"
              value={carNumber}
              onChange={(e) => setCarNumber(e.target.value)}
              placeholder={t("signup.carNumberPlaceholder")}
              className="h-12 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">{t("signup.password")}</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("signup.passwordPlaceholder")}
                className="h-12 rounded-xl border-border bg-card pr-12 text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <Button
            className="mt-2 h-14 rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? t("signup.creatingAccount") : t("signup.create")}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <span className="text-sm text-muted-foreground">{t("signup.haveAccount")}</span>
          <button className="text-sm font-semibold text-accent" onClick={() => router.push("/login")}>
            {t("signup.login")}
          </button>
        </div>
      </div>
    </div>
  )
}

export function OTPScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [otp, setOtp] = useState("")

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center px-4 pt-14 pb-4">
        <button onClick={() => router.back()} className="rounded-xl p-2 text-foreground hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center px-6">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-foreground">{t("otp.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("otp.subtitle")}
          </p>
        </div>

        <div className="mb-8">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup className="gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-14 w-12 rounded-xl border-border bg-card text-lg font-semibold text-foreground"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button className="mb-8 text-sm font-medium text-accent">
          {t("otp.resend")}
        </button>

        <Button
          className="h-14 w-full rounded-xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90"
          onClick={() => router.push("/home")}
        >
          {t("otp.next")}
        </Button>
      </div>
    </div>
  )
}

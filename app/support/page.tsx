"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "@/lib/i18n/language-context"
import { PhoneFrame } from "@/components/phone-frame"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageCircle, Plus, ArrowLeft, Send, X } from "lucide-react"
import {
  getSupportTicketsApi,
  getSupportTicketApi,
  createSupportTicketApi,
  addSupportMessageApi,
  closeSupportTicketApi,
  type SupportTicketDto,
} from "@/lib/api"

export default function SupportPage() {
  return (
    <PhoneFrame>
      <SupportScreen />
    </PhoneFrame>
  )
}

function SupportScreen() {
  const { t } = useTranslation()
  const [tickets, setTickets] = useState<SupportTicketDto[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newMessage, setNewMessage] = useState("")

  const loadTickets = async () => {
    try {
      const data = await getSupportTicketsApi()
      setTickets(data)
    } catch (err) {
      console.error("Failed to load tickets:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadTicketDetails = async (ticketId: number) => {
    try {
      const data = await getSupportTicketApi(ticketId)
      setSelectedTicket(data)
    } catch (err) {
      console.error("Failed to load ticket details:", err)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return

    try {
      await addSupportMessageApi(selectedTicket.id, newMessage)
      setNewMessage("")
      await loadTicketDetails(selectedTicket.id)
    } catch (err) {
      console.error("Failed to send message:", err)
    }
  }

  const handleCloseTicket = async () => {
    if (!selectedTicket) return

    try {
      await closeSupportTicketApi(selectedTicket.id)
      setSelectedTicket(null)
      await loadTickets()
    } catch (err) {
      console.error("Failed to close ticket:", err)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      open: "default",
      in_progress: "secondary",
      closed: "outline",
    }
    return variants[status] || "default"
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      urgent: "destructive",
      high: "destructive",
      medium: "secondary",
      low: "outline",
    }
    return variants[priority] || "default"
  }

  if (selectedTicket) {
    return (
      <div className="flex h-full flex-col bg-background">
        {/* Header */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedTicket(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">{selectedTicket.subject}</h2>
              <div className="mt-1 flex gap-2">
                <Badge variant={getStatusBadge(selectedTicket.status)}>
                  {t(`support.${selectedTicket.status.replace("_", "")}`)}
                </Badge>
                <Badge variant={getPriorityBadge(selectedTicket.priority)}>
                  {t(`support.${selectedTicket.priority}`)}
                </Badge>
              </div>
            </div>
            {selectedTicket.status !== "closed" && (
              <Button variant="outline" size="sm" onClick={handleCloseTicket}>
                <X className="mr-2 h-4 w-4" />
                {t("support.closeTicket")}
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-4">
            {selectedTicket.messages?.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.is_admin
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-xs font-semibold opacity-80">
                    {msg.is_admin ? t("support.admin") : t("support.you")}
                  </p>
                  <p className="mt-1 text-sm">{msg.message}</p>
                  <p className="mt-1 text-xs opacity-60">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        {selectedTicket.status !== "closed" && (
          <div className="border-t bg-card p-4">
            <div className="flex gap-2">
              <Input
                placeholder={t("support.typeMessage")}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("support.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("support.subtitle")}</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("support.newTicket")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CreateTicketDialog
                onClose={() => setCreateDialogOpen(false)}
                onCreated={() => {
                  setCreateDialogOpen(false)
                  loadTickets()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tickets List */}
      <ScrollArea className="flex-1 p-6">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2">
            <MessageCircle className="h-12 w-12 text-muted-foreground" />
            <p className="font-semibold text-foreground">{t("support.noTickets")}</p>
            <p className="text-sm text-muted-foreground">{t("support.createFirst")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => loadTicketDetails(ticket.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{ticket.subject}</CardTitle>
                    <div className="flex gap-1">
                      <Badge variant={getStatusBadge(ticket.status)} className="text-xs">
                        {t(`support.${ticket.status.replace("_", "")}`)}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {ticket.last_message}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(ticket.updated_at).toLocaleDateString()}</span>
                    <Badge variant={getPriorityBadge(ticket.priority)} className="text-xs">
                      {t(`support.${ticket.priority}`)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

function CreateTicketDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const { t } = useTranslation()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return

    setSubmitting(true)
    try {
      await createSupportTicketApi({ subject, message, priority })
      onCreated()
    } catch (err) {
      console.error("Failed to create ticket:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("support.createTicket")}</DialogTitle>
        <DialogDescription>{t("support.subtitle")}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">{t("support.subject")}</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t("support.subject")}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">{t("support.priority")}</label>
          <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{t("support.low")}</SelectItem>
              <SelectItem value="medium">{t("support.medium")}</SelectItem>
              <SelectItem value="high">{t("support.high")}</SelectItem>
              <SelectItem value="urgent">{t("support.urgent")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">{t("support.message")}</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("support.typeMessage")}
            rows={4}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t("support.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!subject.trim() || !message.trim() || submitting}
            className="flex-1"
          >
            {t("support.send")}
          </Button>
        </div>
      </div>
    </>
  )
}

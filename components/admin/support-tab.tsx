"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "@/lib/i18n/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageCircle, Send, Clock } from "lucide-react"
import {
  getAdminSupportTicketsApi,
  getAdminSupportTicketApi,
  addAdminSupportMessageApi,
  updateSupportTicketStatusApi,
  updateSupportTicketPriorityApi,
  type SupportTicketDto,
} from "@/lib/api"

export function SupportTab() {
  const { t } = useTranslation()
  const [tickets, setTickets] = useState<SupportTicketDto[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyMessage, setReplyMessage] = useState("")
  const [sending, setSending] = useState(false)

  const loadTickets = async () => {
    try {
      const data = await getAdminSupportTicketsApi()
      setTickets(data)
    } catch (err) {
      console.error("Failed to load support tickets:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadTicketDetails = async (ticketId: number) => {
    try {
      const data = await getAdminSupportTicketApi(ticketId)
      setSelectedTicket(data)
    } catch (err) {
      console.error("Failed to load ticket details:", err)
    }
  }

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return

    setSending(true)
    try {
      await addAdminSupportMessageApi(selectedTicket.id, replyMessage)
      setReplyMessage("")
      await loadTicketDetails(selectedTicket.id)
      await loadTickets()
    } catch (err) {
      console.error("Failed to send reply:", err)
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (status: "open" | "in_progress" | "closed") => {
    if (!selectedTicket) return

    try {
      await updateSupportTicketStatusApi(selectedTicket.id, status)
      await loadTicketDetails(selectedTicket.id)
      await loadTickets()
    } catch (err) {
      console.error("Failed to update status:", err)
    }
  }

  const handlePriorityChange = async (priority: "low" | "medium" | "high" | "urgent") => {
    if (!selectedTicket) return

    try {
      await updateSupportTicketPriorityApi(selectedTicket.id, priority)
      await loadTicketDetails(selectedTicket.id)
      await loadTickets()
    } catch (err) {
      console.error("Failed to update priority:", err)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

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
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedTicket(null)}>
            ← {t("common.goBack")}
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{t("support.ticketDetails")}</h2>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Ticket Details Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
              <CardDescription>#{selectedTicket.id}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">{t("support.status")}</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Badge variant={getStatusBadge(selectedTicket.status)} className="mr-2">
                        {t(`support.${selectedTicket.status.replace("_", "")}`)}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleStatusChange("open")}>
                      {t("support.open")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                      {t("support.inProgress")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("closed")}>
                      {t("support.closed")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">{t("support.priority")}</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Badge variant={getPriorityBadge(selectedTicket.priority)} className="mr-2">
                        {t(`support.${selectedTicket.priority}`)}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handlePriorityChange("low")}>
                      {t("support.low")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePriorityChange("medium")}>
                      {t("support.medium")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePriorityChange("high")}>
                      {t("support.high")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePriorityChange("urgent")}>
                      {t("support.urgent")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium">User Information</p>
                <p className="mt-2 text-sm text-muted-foreground">{selectedTicket.user_name}</p>
                <p className="text-sm text-muted-foreground">{selectedTicket.user_email}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedTicket.created_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("support.messages")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="flex flex-col gap-4">
                  {selectedTicket.messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_admin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.is_admin
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <p className="text-xs font-semibold opacity-80">
                            {msg.is_admin ? t("support.admin") : msg.sender_name}
                          </p>
                          <Clock className="h-3 w-3 opacity-60" />
                          <p className="text-xs opacity-60">
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {selectedTicket.status !== "closed" && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("support.typeMessage")}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendReply()
                        }
                      }}
                    />
                    <Button onClick={handleSendReply} disabled={!replyMessage.trim() || sending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground lg:text-3xl">{t("support.allTickets")}</h2>
        <p className="mt-1 text-muted-foreground">Manage customer support tickets</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-semibold text-foreground">{t("support.noTickets")}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => loadTicketDetails(ticket.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base">{ticket.subject}</CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      {ticket.user_name} • {ticket.user_email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getStatusBadge(ticket.status)}>
                    {t(`support.${ticket.status.replace("_", "")}`)}
                  </Badge>
                  <Badge variant={getPriorityBadge(ticket.priority)}>
                    {t(`support.${ticket.priority}`)}
                  </Badge>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {ticket.last_message}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{ticket.message_count} messages</span>
                  <span>{new Date(ticket.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

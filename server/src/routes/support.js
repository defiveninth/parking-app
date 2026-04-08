import { Router } from "express";
import { query } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// ============ USER SUPPORT ENDPOINTS ============

// GET /support/tickets - Get all tickets for the authenticated user
router.get("/tickets", authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        st.id,
        st.subject,
        st.status,
        st.priority,
        st.created_at,
        st.updated_at,
        (SELECT COUNT(*) FROM support_messages WHERE ticket_id = st.id) as message_count,
        (SELECT message FROM support_messages WHERE ticket_id = st.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM support_tickets st
      WHERE st.user_id = ?
      ORDER BY st.updated_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get tickets error:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// GET /support/tickets/:id - Get a specific ticket with all messages
router.get("/tickets/:id", authenticateToken, async (req, res) => {
  const ticketId = parseInt(req.params.id);

  try {
    // Get ticket details
    const ticketResult = await query(
      `SELECT st.*, u.name as user_name, u.email as user_email
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      WHERE st.id = ? AND st.user_id = ?`,
      [ticketId, req.user.id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Get all messages for this ticket
    const messagesResult = await query(
      `SELECT 
        sm.id,
        sm.message,
        sm.is_admin,
        sm.created_at,
        u.name as sender_name
      FROM support_messages sm
      LEFT JOIN users u ON sm.user_id = u.id
      WHERE sm.ticket_id = ?
      ORDER BY sm.created_at ASC`,
      [ticketId]
    );

    const ticket = ticketResult.rows[0];
    ticket.messages = messagesResult.rows;

    res.json(ticket);
  } catch (err) {
    console.error("Get ticket error:", err);
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
});

// POST /support/tickets - Create a new support ticket
router.post("/tickets", authenticateToken, async (req, res) => {
  const { subject, message, priority = "medium" } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: "Subject and message are required" });
  }

  try {
    // Create the ticket
    const ticketResult = await query(
      `INSERT INTO support_tickets (user_id, subject, priority, status)
      VALUES (?, ?, ?, 'open')
      RETURNING id`,
      [req.user.id, subject, priority]
    );

    const ticketId = ticketResult.rows[0].id;

    // Add the initial message
    await query(
      `INSERT INTO support_messages (ticket_id, user_id, is_admin, message)
      VALUES (?, ?, 0, ?)`,
      [ticketId, req.user.id, message]
    );

    res.status(201).json({ 
      id: ticketId,
      subject,
      status: "open",
      priority,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Create ticket error:", err);
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

// POST /support/tickets/:id/messages - Add a message to a ticket
router.post("/tickets/:id/messages", authenticateToken, async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Verify ticket belongs to user
    const ticketResult = await query(
      "SELECT id FROM support_tickets WHERE id = ? AND user_id = ?",
      [ticketId, req.user.id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Add the message
    const messageResult = await query(
      `INSERT INTO support_messages (ticket_id, user_id, is_admin, message)
      VALUES (?, ?, 0, ?)
      RETURNING id, created_at`,
      [ticketId, req.user.id, message]
    );

    // Update ticket's updated_at
    await query(
      "UPDATE support_tickets SET updated_at = datetime('now') WHERE id = ?",
      [ticketId]
    );

    res.status(201).json(messageResult.rows[0]);
  } catch (err) {
    console.error("Add message error:", err);
    res.status(500).json({ error: "Failed to add message" });
  }
});

// PATCH /support/tickets/:id/close - Close a ticket
router.patch("/tickets/:id/close", authenticateToken, async (req, res) => {
  const ticketId = parseInt(req.params.id);

  try {
    const result = await query(
      `UPDATE support_tickets 
      SET status = 'closed', updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
      RETURNING id`,
      [ticketId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Close ticket error:", err);
    res.status(500).json({ error: "Failed to close ticket" });
  }
});

export default router;

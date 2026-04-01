-- Add booking_type (enter_now or book_later) and expires_at to bookings table

-- Add booking_type column
ALTER TABLE bookings ADD COLUMN booking_type TEXT DEFAULT 'enter_now' CHECK (booking_type IN ('enter_now', 'book_later'));

-- Add expires_at column (ISO datetime string)
ALTER TABLE bookings ADD COLUMN expires_at TEXT;

-- Add index for quick expiry checks
CREATE INDEX IF NOT EXISTS idx_bookings_expires_at ON bookings(expires_at);

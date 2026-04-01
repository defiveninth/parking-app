-- Migration: Add balance column to users table
-- This migration adds a balance field to track user account balance

ALTER TABLE users ADD COLUMN balance INTEGER DEFAULT 0;

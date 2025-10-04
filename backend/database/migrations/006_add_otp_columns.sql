-- Add OTP columns to users table for forgot password functionality
ALTER TABLE users 
ADD COLUMN otp VARCHAR(6),
ADD COLUMN otp_expiry TIMESTAMP;
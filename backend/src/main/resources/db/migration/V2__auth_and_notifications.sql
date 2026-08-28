-- Password reset support (forgot password / reset password)
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMPTZ;
CREATE INDEX idx_users_reset_token ON users(reset_token);

-- Quarterly & annual report preferences (daily/weekly/monthly already existed)
ALTER TABLE notification_preferences ADD COLUMN quarterly_report BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE notification_preferences ADD COLUMN annual_report BOOLEAN NOT NULL DEFAULT FALSE;

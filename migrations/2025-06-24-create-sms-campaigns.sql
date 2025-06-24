-- Migration: Create sms_campaigns table for storing SMS campaign data
CREATE TABLE IF NOT EXISTS sms_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    message text NOT NULL,
    recipients text[], -- Array of phone numbers or user IDs
    status text NOT NULL DEFAULT 'draft', -- draft, scheduled, sent, failed
    scheduled_at timestamptz,
    sent_at timestamptz,
    created_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for faster queries by status
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_status ON sms_campaigns(status);

-- Index for scheduled campaigns
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_scheduled_at ON sms_campaigns(scheduled_at);

-- Enable RLS
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;

-- Allow all users to SELECT
CREATE POLICY "Allow all users to select sms_campaigns" ON sms_campaigns
  FOR SELECT USING (true);

-- Allow all users to INSERT
CREATE POLICY "Allow all users to insert sms_campaigns" ON sms_campaigns
  FOR INSERT WITH CHECK (true);

-- Allow all users to UPDATE
CREATE POLICY "Allow all users to update sms_campaigns" ON sms_campaigns
  FOR UPDATE USING (true);

-- Allow all users to DELETE
CREATE POLICY "Allow all users to delete sms_campaigns" ON sms_campaigns
  FOR DELETE USING (true);

-- Sample data for sms_campaigns
INSERT INTO sms_campaigns (name, message, recipients, status, scheduled_at, sent_at, created_by)
VALUES
  ('Welcome Campaign', 'Welcome to our service! Enjoy your stay.', ARRAY['+1234567890', '+1987654321'], 'sent', now() - interval '2 days', now() - interval '2 days', NULL),
  ('Promo June', 'June promo: 20% off for all users!', ARRAY['+1234567890'], 'scheduled', now() + interval '1 day', NULL, NULL),
  ('Feedback Request', 'How was your experience? Reply to this SMS.', ARRAY['+1987654321'], 'draft', NULL, NULL, NULL);

-- Add CampaignNumber: autonumber with prefix 'C-' starting from 10000
-- Sequence for campaign numbers
CREATE SEQUENCE IF NOT EXISTS sms_campaigns_campaign_number_seq START 10000;

-- Add CampaignNumber column
ALTER TABLE sms_campaigns ADD COLUMN IF NOT EXISTS "CampaignNumber" text UNIQUE;

-- Trigger function to set CampaignNumber
CREATE OR REPLACE FUNCTION set_sms_campaigns_campaign_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."CampaignNumber" IS NULL THEN
    NEW."CampaignNumber" := 'C-' || nextval('sms_campaigns_campaign_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before insert
DROP TRIGGER IF EXISTS set_sms_campaigns_campaign_number_trigger ON sms_campaigns;
CREATE TRIGGER set_sms_campaigns_campaign_number_trigger
  BEFORE INSERT ON sms_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION set_sms_campaigns_campaign_number();

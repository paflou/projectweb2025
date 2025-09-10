-- Migration script to add thesis management fields
-- Run this script to add the new columns for secretary thesis management

-- Add secretary management fields to thesis table
ALTER TABLE thesis
ADD COLUMN ap_number VARCHAR(50) AFTER grade,
ADD COLUMN ap_year YEAR AFTER ap_number,
ADD COLUMN cancellation_ap_number VARCHAR(50) AFTER ap_year,
ADD COLUMN cancellation_ap_year YEAR AFTER cancellation_ap_number,
ADD COLUMN cancellation_reason TEXT AFTER cancellation_ap_year,
ADD COLUMN cancellation_date TIMESTAMP NULL AFTER cancellation_reason;

-- Migration script to remove examination report fields
-- Run this script to remove the examination report columns that were added by mistake

-- Remove examination report fields from thesis table
ALTER TABLE thesis 
DROP COLUMN IF EXISTS examination_report_generated,
DROP COLUMN IF EXISTS examination_report_date;

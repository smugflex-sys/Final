-- Add rejection tracking columns to scores table
ALTER TABLE scores 
ADD COLUMN rejection_reason TEXT NULL,
ADD COLUMN rejected_by INT NULL,
ADD COLUMN rejected_date TIMESTAMP NULL;

-- Add rejection tracking columns to compiled_results table
ALTER TABLE compiled_results 
ADD COLUMN rejection_reason TEXT NULL,
ADD COLUMN rejected_by INT NULL,
ADD COLUMN rejected_date TIMESTAMP NULL;

# Rejection Tracking Database Migration

## Overview
This migration adds rejection tracking columns to enable persistent storage of rejection reasons and metadata.

## Files Added
- `add_rejection_columns_to_scores.sql` - Database migration script

## Migration Details

### New Columns Added to `scores` table:
- `rejection_reason` (TEXT NULL) - Reason for rejection
- `rejected_by` (INT NULL) - ID of user who rejected the score
- `rejected_date` (TIMESTAMP NULL) - When the score was rejected

### New Columns Added to `compiled_results` table:
- `rejection_reason` (TEXT NULL) - Reason for rejection
- `rejected_by` (INT NULL) - ID of user who rejected the result
- `rejected_date` (TIMESTAMP NULL) - When the result was rejected

## How to Apply Migration

1. Run the SQL script in your MySQL database:
```bash
mysql -u root -p graceland_academy < database/migrations/add_rejection_columns_to_scores.sql
```

Or execute directly in MySQL:
```sql
source database/migrations/add_rejection_columns_to_scores.sql;
```

## Features Enabled After Migration

1. **Persistent Rejection Tracking**: All rejection data is now saved to database
2. **Admin Dashboard Filtering**: Rejected results are hidden from "All" tab
3. **Score Rejection Workflow**: Class teachers can reject subject scores with reasons
4. **Audit Trail**: Complete history of who rejected what and when

## Code Changes

- Updated `rejectScore()` function to save all rejection data to database
- Updated `/QQapproveScore()` function to clear rejection columns
- Added type annotations to fix TypeScript errors
- Modified admin dashboard to exclude rejected results from "All" tab

## Testing

After applying the migration:
1. Test score rejection functionality
2. Verify rejection reasons persist after logout/login
3. Check admin dashboard filtering
4. Test result rejection workflow

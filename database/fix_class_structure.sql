-- STEP 1: Delete extra classes to meet requirements
-- Keep only 9 Primary classes: Primary 1A through Primary 3A (3 classes each level)
-- Keep only 3 Secondary classes: JSS 1A, JSS 2A, JSS 3A

-- Delete extra Primary classes (keep Primary 1A, 2A, 3A, 4A, 5A, 6A, 1B, 2B, 3B = 9 total)
DELETE FROM classes WHERE name IN ('Primary 4B', 'Primary 5B', 'Primary 6B');

-- Delete extra Secondary classes (keep only JSS 1A, JSS 2A, JSS 3A = 3 total)
DELETE FROM classes WHERE name IN ('JSS 1B', 'JSS 2B', 'JSS 3B', 'SSS 1A', 'SSS 1B', 'SSS 2A', 'SSS 2B', 'SSS 3A', 'SSS 3B');

-- STEP 2: Move students to the remaining classes to ensure 30+ students each
-- Update students from deleted classes to remaining ones

-- Move students from deleted Primary classes to remaining ones
UPDATE students SET class_id = 1 WHERE class_id IN (SELECT id FROM classes WHERE name IN ('Primary 4B', 'Primary 5B', 'Primary 6B'));
UPDATE students SET class_id = 3 WHERE class_id IN (SELECT id FROM classes WHERE name IN ('Primary 4B', 'Primary 5B', 'Primary 6B')) AND class_id = 1;

-- Move students from deleted Secondary classes to remaining ones
UPDATE students SET class_id = 13 WHERE class_id IN (SELECT id FROM classes WHERE name IN ('JSS 1B', 'JSS 2B', 'JSS 3B', 'SSS 1A', 'SSS 1B', 'SSS 2A', 'SSS 2B', 'SSS 3A', 'SSS 3B'));

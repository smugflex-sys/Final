-- STEP 1: Get class IDs for reference
-- Primary classes to keep: Primary 1A (id=1), 2A (id=3), 3A (id=5), 4A (id=7), 5A (id=9), 6A (id=11), 1B (id=2), 2B (id=4), 3B (id=6) = 9 total
-- Secondary classes to keep: JSS 1A (id=13), JSS 2A (id=15), JSS 3A (id=17) = 3 total

-- STEP 2: Move students from classes we will delete to classes we will keep
-- Move students from Primary 4B, 5B, 6B to Primary 1A, 2A, 3A
UPDATE students SET class_id = 1 WHERE class_id = 8;  -- Primary 4B -> Primary 1A
UPDATE students SET class_id = 3 WHERE class_id = 10; -- Primary 5B -> Primary 2A  
UPDATE students SET class_id = 5 WHERE class_id = 12; -- Primary 6B -> Primary 3A

-- Move students from deleted Secondary classes to remaining ones
UPDATE students SET class_id = 13 WHERE class_id = 14; -- JSS 1B -> JSS 1A
UPDATE students SET class_id = 15 WHERE class_id = 16; -- JSS 2B -> JSS 2A
UPDATE students SET class_id = 17 WHERE class_id = 18; -- JSS 3B -> JSS 3A

-- Move all SSS students to JSS classes
UPDATE students SET class_id = 13 WHERE class_id IN (19,20); -- SSS 1A,1B -> JSS 1A
UPDATE students SET class_id = 15 WHERE class_id IN (21,22); -- SSS 2A,2B -> JSS 2A
UPDATE students SET class_id = 17 WHERE class_id IN (23,24); -- SSS 3A,3B -> JSS 3A

-- STEP 3: Delete subject registrations for classes we will delete
DELETE FROM subject_registrations WHERE class_id IN (8,10,12,14,16,18,19,20,21,22,23,24);

-- STEP 4: Delete subject assignments for classes we will delete
DELETE FROM subject_assignments WHERE class_id IN (8,10,12,14,16,18,19,20,21,22,23,24);

-- STEP 5: Now delete the extra classes
DELETE FROM classes WHERE id IN (8,10,12,14,16,18,19,20,21,22,23,24);

-- STEP 6: Add more students to ensure each class has 30+ students
-- Add students to Primary classes
INSERT INTO students (first_name, last_name, admission_number, class_id, level, parent_id, date_of_birth, gender, status, academic_year, admission_date) VALUES
('Samuel', 'Ade', 'GR2024121', 1, 'Primary 1', 1, '2018-03-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Grace', 'Ojo', 'GR2024122', 1, 'Primary 1', 2, '2018-04-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('David', 'Eze', 'GR2024123', 1, 'Primary 1', 3, '2018-05-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Joy', 'Mohammed', 'GR2024124', 1, 'Primary 1', 4, '2018-06-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Peter', 'Okonkwo', 'GR2024125', 1, 'Primary 1', 5, '2018-07-05', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Ruth', 'Bello', 'GR2024126', 1, 'Primary 1', 6, '2018-08-10', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Michael', 'Yusuf', 'GR2024127', 1, 'Primary 1', 7, '2018-09-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Sarah', 'Sani', 'GR2024128', 1, 'Primary 1', 8, '2018-10-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('John', 'Ibrahim', 'GR2024129', 1, 'Primary 1', 9, '2018-11-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mary', 'Abubakar', 'GR2024130', 1, 'Primary 1', 10, '2018-12-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Daniel', 'Thomas', 'GR2024131', 1, 'Primary 1', 11, '2018-01-04', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Esther', 'Matthew', 'GR2024132', 1, 'Primary 1', 12, '2018-02-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Benjamin', 'Mark', 'GR2024133', 1, 'Primary 1', 1, '2018-03-14', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Rebecca', 'Luke', 'GR2024134', 1, 'Primary 1', 2, '2018-04-19', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Isaac', 'John', 'GR2024135', 1, 'Primary 1', 3, '2018-05-24', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Naomi', 'Paul', 'GR2024136', 1, 'Primary 1', 4, '2018-06-29', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Joseph', 'Peter', 'GR2024137', 1, 'Primary 1', 5, '2018-08-04', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Hannah', 'Andrew', 'GR2024138', 1, 'Primary 1', 6, '2018-09-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Aaron', 'Simon', 'GR2024139', 1, 'Primary 1', 7, '2018-10-14', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Lydia', 'James', 'GR2024140', 1, 'Primary 1', 8, '2018-11-19', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Joshua', 'Philip', 'GR2024141', 1, 'Primary 1', 9, '2018-12-24', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Miriam', 'Bartholomew', 'GR2024142', 1, 'Primary 1', 10, '2018-01-29', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Samuel', 'Matthew', 'GR2024143', 1, 'Primary 1', 11, '2018-03-05', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Deborah', 'Thaddeus', 'GR2024144', 1, 'Primary 1', 12, '2018-04-10', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abigail', 'Thomas', 'GR2024145', 1, 'Primary 1', 1, '2018-05-15', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Nathan', 'Matthew', 'GR2024146', 1, 'Primary 1', 2, '2018-06-20', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Rachel', 'Mark', 'GR2024147', 1, 'Primary 1', 3, '2018-07-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Caleb', 'Luke', 'GR2024148', 1, 'Primary 1', 4, '2018-08-30', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Elizabeth', 'John', 'GR2024149', 1, 'Primary 1', 5, '2018-10-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ethan', 'Paul', 'GR2024150', 1, 'Primary 1', 6, '2018-11-10', 'Male', 'Active', '2024/2025', '2024-09-15');

-- Add students to other Primary classes (2A, 3A, 4A, 5A, 6A, 1B, 2B, 3B)
-- This will be continued in the next file...

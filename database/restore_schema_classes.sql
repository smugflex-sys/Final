-- STEP 1: Delete all current classes and related data
DELETE FROM subject_registrations WHERE class_id IN (SELECT id FROM classes);
DELETE FROM subject_assignments WHERE class_id IN (SELECT id FROM classes);
UPDATE students SET class_id = NULL WHERE class_id IS NOT NULL;
DELETE FROM classes;

-- STEP 2: Restore original schema classes
INSERT INTO classes (name, level, section, category, capacity, academic_year) VALUES
-- Primary Classes (9 classes - 3 per level)
('Primary 1A', 'Primary 1', 'A', 'Primary', 30, '2024/2025'),
('Primary 1B', 'Primary 1', 'B', 'Primary', 30, '2024/2025'),
('Primary 1C', 'Primary 1', 'C', 'Primary', 30, '2024/2025'),
('Primary 2A', 'Primary 2', 'A', 'Primary', 30, '2024/2025'),
('Primary 2B', 'Primary 2', 'B', 'Primary', 30, '2024/2025'),
('Primary 2C', 'Primary 2', 'C', 'Primary', 30, '2024/2025'),
('Primary 3A', 'Primary 3', 'A', 'Primary', 30, '2024/2025'),
('Primary 3B', 'Primary 3', 'B', 'Primary', 30, '2024/2025'),
('Primary 3C', 'Primary 3', 'C', 'Primary', 30, '2024/2025'),
-- Secondary Classes (3 classes)
('JSS 1A', 'JSS 1', 'A', 'Secondary', 35, '2024/2025'),
('JSS 2A', 'JSS 2', 'A', 'Secondary', 35, '2024/2025'),
('SS 1A', 'SS 1', 'A', 'Secondary', 35, '2024/2025');

-- STEP 3: Register 14 subjects for each class (9 Primary + 3 Secondary = 12 classes × 14 subjects = 168 registrations)
INSERT INTO subject_registrations (subject_id, class_id, academic_year, term, is_compulsory, status)
SELECT 
    s.id as subject_id,
    c.id as class_id,
    '2024/2025' as academic_year,
    'First Term' as term,
    CASE 
        WHEN s.category IN ('Creche', 'Nursery', 'Primary') THEN TRUE
        WHEN s.category = 'JSS' AND c.category = 'Secondary' THEN TRUE
        ELSE FALSE
    END as is_compulsory,
    'Active' as status
FROM subjects s
CROSS JOIN classes c
WHERE 
    (s.category IN ('Creche', 'Nursery', 'Primary') AND c.category = 'Primary')
    OR (s.category IN ('JSS', 'SS', 'General') AND c.category = 'Secondary')
LIMIT 168;

-- STEP 4: Add 30+ students to each Primary class
-- Primary 1A (class_id=1)
INSERT INTO students (first_name, last_name, admission_number, class_id, level, parent_id, date_of_birth, gender, status, academic_year, admission_date) VALUES
('Samuel', 'Ade', 'GR2024001', 1, 'Primary 1', 1, '2018-03-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Grace', 'Ojo', 'GR2024002', 1, 'Primary 1', 2, '2018-04-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('David', 'Eze', 'GR2024003', 1, 'Primary 1', 3, '2018-05-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Joy', 'Mohammed', 'GR2024004', 1, 'Primary 1', 4, '2018-06-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Peter', 'Okonkwo', 'GR2024005', 1, 'Primary 1', 5, '2018-07-05', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Ruth', 'Bello', 'GR2024006', 1, 'Primary 1', 6, '2018-08-10', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Michael', 'Yusuf', 'GR2024007', 1, 'Primary 1', 7, '2018-09-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Sarah', 'Sani', 'GR2024008', 1, 'Primary 1', 8, '2018-10-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('John', 'Ibrahim', 'GR2024009', 1, 'Primary 1', 9, '2018-11-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mary', 'Abubakar', 'GR2024010', 1, 'Primary 1', 10, '2018-12-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Daniel', 'Thomas', 'GR2024011', 1, 'Primary 1', 11, '2018-01-04', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Esther', 'Matthew', 'GR2024012', 1, 'Primary 1', 12, '2018-02-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Benjamin', 'Mark', 'GR2024013', 1, 'Primary 1', 1, '2018-03-14', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Rebecca', 'Luke', 'GR2024014', 1, 'Primary 1', 2, '2018-04-19', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Isaac', 'John', 'GR2024015', 1, 'Primary 1', 3, '2018-05-24', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Naomi', 'Paul', 'GR2024016', 1, 'Primary 1', 4, '2018-06-29', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Joseph', 'Peter', 'GR2024017', 1, 'Primary 1', 5, '2018-08-04', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Hannah', 'Andrew', 'GR2024018', 1, 'Primary 1', 6, '2018-09-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Aaron', 'Simon', 'GR2024019', 1, 'Primary 1', 7, '2018-10-14', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Lydia', 'James', 'GR2024020', 1, 'Primary 1', 8, '2018-11-19', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Joshua', 'Philip', 'GR2024021', 1, 'Primary 1', 9, '2018-12-24', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Miriam', 'Bartholomew', 'GR2024022', 1, 'Primary 1', 10, '2018-01-29', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Samuel', 'Matthew', 'GR2024023', 1, 'Primary 1', 11, '2018-03-05', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Deborah', 'Thaddeus', 'GR2024024', 1, 'Primary 1', 12, '2018-04-10', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abigail', 'Thomas', 'GR2024025', 1, 'Primary 1', 1, '2018-05-15', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Nathan', 'Matthew', 'GR2024026', 1, 'Primary 1', 2, '2018-06-20', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Rachel', 'Mark', 'GR2024027', 1, 'Primary 1', 3, '2018-07-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Caleb', 'Luke', 'GR2024028', 1, 'Primary 1', 4, '2018-08-30', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Elizabeth', 'John', 'GR2024029', 1, 'Primary 1', 5, '2018-10-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ethan', 'Paul', 'GR2024030', 1, 'Primary 1', 6, '2018-11-10', 'Male', 'Active', '2024/2025', '2024-09-15');

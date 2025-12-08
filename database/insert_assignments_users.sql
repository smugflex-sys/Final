-- Insert Subject Assignments (Teacher-Subject-Class assignments)
INSERT INTO subject_assignments (subject_id, class_id, teacher_id, academic_year, term, status) VALUES
-- Primary 1A Assignments
(1, 1, 1, '2024/2025', 'First Term', 'Active'), -- English - Dr. Sarah Johnson
(2, 1, 11, '2024/2025', 'First Term', 'Active'), -- Math - Richard Harris
(3, 1, 6, '2024/2025', 'First Term', 'Active'), -- Science - Patricia Miller
(4, 1, 8, '2024/2025', 'First Term', 'Active'), -- Social Studies - Jennifer Thomas
(5, 1, 12, '2024/2025', 'First Term', 'Active'), -- CRS - Mary Martin
(6, 1, 5, '2024/2025', 'First Term', 'Active'), -- PHE - James Anderson

-- Primary 2A Assignments  
(1, 3, 1, '2024/2025', 'First Term', 'Active'), -- English - Dr. Sarah Johnson
(2, 3, 11, '2024/2025', 'First Term', 'Active'), -- Math - Richard Harris
(3, 3, 6, '2024/2025', 'First Term', 'Active'), -- Science - Patricia Miller
(4, 3, 9, '2024/2025', 'First Term', 'Active'), -- Social Studies - William Jackson
(5, 3, 12, '2024/2025', 'First Term', 'Active'), -- CRS - Mary Martin
(6, 3, 5, '2024/2025', 'First Term', 'Active'), -- PHE - James Anderson

-- JSS 1A Assignments
(13, 13, 3, '2024/2025', 'First Term', 'Active'), -- English - Emily Davis
(14, 13, 2, '2024/2025', 'First Term', 'Active'), -- Math - Michael Brown
(15, 13, 6, '2024/2025', 'First Term', 'Active'), -- Biology - Patricia Miller
(16, 13, 7, '2024/2025', 'First Term', 'Active'), -- Chemistry - David Taylor
(17, 13, 2, '2024/2025', 'First Term', 'Active'), -- Physics - Michael Brown
(18, 13, 4, '2024/2025', 'First Term', 'Active'), -- Economics - Robert Wilson
(19, 13, 4, '2024/2025', 'First Term', 'Active'), -- Commerce - Robert Wilson
(20, 13, 4, '2024/2025', 'First Term', 'Active'), -- Accounting - Robert Wilson
(21, 13, 9, '2024/2025', 'First Term', 'Active'), -- Geography - William Jackson
(22, 13, 8, '2024/2025', 'First Term', 'Active'), -- History - Jennifer Thomas
(23, 13, 8, '2024/2025', 'First Term', 'Active'), -- Government - Jennifer Thomas
(24, 13, 3, '2024/2025', 'First Term', 'Active'), -- Literature - Emily Davis
(25, 13, 3, '2024/2025', 'First Term', 'Active'), -- French - Emily Davis

-- SSS 1A Assignments
(13, 17, 3, '2024/2025', 'First Term', 'Active'), -- English - Emily Davis
(14, 17, 2, '2024/2025', 'First Term', 'Active'), -- Math - Michael Brown
(15, 17, 6, '2024/2025', 'First Term', 'Active'), -- Biology - Patricia Miller
(16, 17, 7, '2024/2025', 'First Term', 'Active'), -- Chemistry - David Taylor
(17, 17, 2, '2024/2025', 'First Term', 'Active'), -- Physics - Michael Brown
(18, 17, 4, '2024/2025', 'First Term', 'Active'), -- Economics - Robert Wilson
(19, 17, 4, '2024/2025', 'First Term', 'Active'), -- Commerce - Robert Wilson
(20, 17, 4, '2024/2025', 'First Term', 'Active'), -- Accounting - Robert Wilson
(21, 17, 9, '2024/2025', 'First Term', 'Active'), -- Geography - William Jackson
(22, 17, 8, '2024/2025', 'First Term', 'Active'), -- History - Jennifer Thomas
(23, 17, 8, '2024/2025', 'First Term', 'Active'), -- Government - Jennifer Thomas
(24, 17, 3, '2024/2025', 'First Term', 'Active'), -- Literature - Emily Davis
(25, 17, 3, '2024/2025', 'First Term', 'Active'), -- French - Emily Davis
(26, 17, 2, '2024/2025', 'First Term', 'Active'), -- Further Math - Michael Brown
(27, 17, 7, '2024/2025', 'First Term', 'Active'); -- Technical Drawing - David Taylor

-- Insert User Accounts for Teachers (linked to teacher records)
INSERT INTO users (username, password_hash, role, linked_id, email, status) VALUES
('sarah.johnson', 'teacher123', 'teacher', 1, 'sarah.johnson@gracelandacademy.com', 'Active'),
('michael.brown', 'teacher123', 'teacher', 2, 'michael.brown@gracelandacademy.com', 'Active'),
('emily.davis', 'teacher123', 'teacher', 3, 'emily.davis@gracelandacademy.com', 'Active'),
('robert.wilson', 'teacher123', 'teacher', 4, 'robert.wilson@gracelandacademy.com', 'Active'),
('james.anderson', 'teacher123', 'teacher', 5, 'james.anderson@gracelandacademy.com', 'Active'),
('patricia.miller', 'teacher123', 'teacher', 6, 'patricia.miller@gracelandacademy.com', 'Active'),
('david.taylor', 'teacher123', 'teacher', 7, 'david.taylor@gracelandacademy.com', 'Active'),
('jennifer.thomas', 'teacher123', 'teacher', 8, 'jennifer.thomas@gracelandacademy.com', 'Active'),
('william.jackson', 'teacher123', 'teacher', 9, 'william.jackson@gracelandacademy.com', 'Active'),
('linda.white', 'teacher123', 'teacher', 10, 'linda.white@gracelandacademy.com', 'Active'),
('richard.harris', 'teacher123', 'teacher', 11, 'richard.harris@gracelandacademy.com', 'Active'),
('mary.martin', 'teacher123', 'teacher', 12, 'mary.martin@gracelandacademy.com', 'Active');

-- Insert User Accounts for Parents (linked to parent records)
INSERT INTO users (username, password_hash, role, linked_id, email, status) VALUES
('john.smith', 'parent123', 'parent', 1, 'john.smith@email.com', 'Active'),
('mary.johnson', 'parent123', 'parent', 2, 'mary.johnson@email.com', 'Active'),
('david.williams', 'parent123', 'parent', 3, 'david.williams@email.com', 'Active'),
('elizabeth.brown', 'parent123', 'parent', 4, 'elizabeth.brown@email.com', 'Active'),
('michael.davis', 'parent123', 'parent', 5, 'michael.davis@email.com', 'Active'),
('sarah.miller', 'parent123', 'parent', 6, 'sarah.miller@email.com', 'Active'),
('robert.wilson.parent', 'parent123', 'parent', 7, 'robert.wilson.parent@email.com', 'Active'),
('jennifer.moore', 'parent123', 'parent', 8, 'jennifer.moore@email.com', 'Active'),
('william.taylor.parent', 'parent123', 'parent', 9, 'william.taylor.parent@email.com', 'Active'),
('linda.anderson', 'parent123', 'parent', 10, 'linda.anderson@email.com', 'Active'),
('richard.thomas', 'parent123', 'parent', 11, 'richard.thomas@email.com', 'Active'),
('patricia.jackson', 'parent123', 'parent', 12, 'patricia.jackson@email.com', 'Active');

-- Insert User Accounts for Accountants (linked to accountant records)
INSERT INTO users (username, password_hash, role, linked_id, email, status) VALUES
('peter.okonkwo', 'accountant123', 'accountant', 1, 'peter.okonkwo@gracelandacademy.com', 'Active'),
('grace.adebayo', 'accountant123', 'accountant', 2, 'grace.adebayo@gracelandacademy.com', 'Active'),
('samuel.okafor', 'accountant123', 'accountant', 3, 'samuel.okafor@gracelandacademy.com', 'Active');

-- Update class_teacher_id for classes with class teachers
UPDATE classes SET class_teacher_id = 1 WHERE id = 1;  -- Dr. Sarah Johnson - Primary 1A
UPDATE classes SET class_teacher_id = 3 WHERE id = 3;  -- Mrs. Emily Davis - Primary 2A
UPDATE classes SET class_teacher_id = 6 WHERE id = 5;  -- Ms. Patricia Miller - Primary 3A
UPDATE classes SET class_teacher_id = 8 WHERE id = 7;  -- Mrs. Jennifer Thomas - Primary 4A
UPDATE classes SET class_teacher_id = 10 WHERE id = 9; -- Ms. Linda White - Primary 5A
UPDATE classes SET class_teacher_id = 12 WHERE id = 11; -- Mrs. Mary Martin - Primary 6A

UPDATE classes SET class_teacher_id = 3 WHERE id = 13; -- Mrs. Emily Davis - JSS 1A
UPDATE classes SET class_teacher_id = 8 WHERE id = 15; -- Mrs. Jennifer Thomas - JSS 2A
UPDATE classes SET class_teacher_id = 2 WHERE id = 16; -- Prof. Michael Brown - JSS 3A

UPDATE classes SET class_teacher_id = 3 WHERE id = 17; -- Mrs. Emily Davis - SSS 1A
UPDATE classes SET class_teacher_id = 4 WHERE id = 18; -- Mr. Robert Wilson - SSS 2A
UPDATE classes SET class_teacher_id = 2 WHERE id = 19; -- Prof. Michael Brown - SSS 3A

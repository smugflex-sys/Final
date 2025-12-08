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
('david.williams.parent', 'parent123', 'parent', 3, 'david.williams.parent@email.com', 'Active'),
('elizabeth.brown', 'parent123', 'parent', 4, 'elizabeth.brown@email.com', 'Active'),
('michael.davis.parent', 'parent123', 'parent', 5, 'michael.davis.parent@email.com', 'Active'),
('sarah.miller.parent', 'parent123', 'parent', 6, 'sarah.miller.parent@email.com', 'Active'),
('robert.wilson.parent', 'parent123', 'parent', 7, 'robert.wilson.parent@email.com', 'Active'),
('jennifer.moore.parent', 'parent123', 'parent', 8, 'jennifer.moore.parent@email.com', 'Active'),
('william.taylor.parent', 'parent123', 'parent', 9, 'william.taylor.parent@email.com', 'Active'),
('linda.anderson.parent', 'parent123', 'parent', 10, 'linda.anderson.parent@email.com', 'Active'),
('richard.thomas.parent', 'parent123', 'parent', 11, 'richard.thomas.parent@email.com', 'Active'),
('patricia.jackson.parent', 'parent123', 'parent', 12, 'patricia.jackson.parent@email.com', 'Active');

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

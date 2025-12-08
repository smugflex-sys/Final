-- Insert Parents
INSERT INTO parents (first_name, last_name, email, phone, alternate_phone, address, occupation, status) VALUES
('John', 'Smith', 'john.smith@email.com', '08012345678', '08098765432', '123 Lagos Street, Ikeja', 'Business Owner', 'Active'),
('Mary', 'Johnson', 'mary.johnson@email.com', '08023456789', '08087654321', '456 Abuja Road, Garki', 'Teacher', 'Active'),
('David', 'Williams', 'david.williams@email.com', '08034567890', '08076543210', '789 Port Harcourt Avenue', 'Engineer', 'Active'),
('Elizabeth', 'Brown', 'elizabeth.brown@email.com', '08045678901', '08065432109', '321 Kano Street', 'Doctor', 'Active'),
('Michael', 'Davis', 'michael.davis@email.com', '08056789012', '08054321098', '654 Ibadan Road', 'Lawyer', 'Active'),
('Sarah', 'Miller', 'sarah.miller@email.com', '08067890123', '08043210987', '987 Benin City', 'Accountant', 'Active'),
('Robert', 'Wilson', 'robert.wilson@email.com', '08078901234', '08032109876', '147 Enugu Road', 'Banker', 'Active'),
('Jennifer', 'Moore', 'jennifer.moore@email.com', '08089012345', '08021098765', '258 Calabar Street', 'Nurse', 'Active'),
('William', 'Taylor', 'william.taylor@email.com', '08090123456', '08010987654', '369 Jos Road', 'Architect', 'Active'),
('Linda', 'Anderson', 'linda.anderson@email.com', '08001234567', '08009876543', '741 Ilorin Avenue', 'Pharmacist', 'Active'),
('Richard', 'Thomas', 'richard.thomas@email.com', '08012345678', '08098765432', '852 Oyo Street', 'Consultant', 'Active'),
('Patricia', 'Jackson', 'patricia.jackson@email.com', '08023456789', '08087654321', '963 Akure Road', 'Manager', 'Active');

-- Insert Accountants
INSERT INTO accountants (first_name, last_name, employee_id, email, phone, department, status) VALUES
('Peter', 'Okonkwo', 'A001', 'peter.okonkwo@gracelandacademy.com', '08012345678', 'Finance', 'Active'),
('Grace', 'Adebayo', 'A002', 'grace.adebayo@gracelandacademy.com', '08023456789', 'Accounts', 'Active'),
('Samuel', 'Okafor', 'A003', 'samuel.okafor@gracelandacademy.com', '08034567890', 'Finance', 'Active');

-- Insert Students (sample data)
INSERT INTO students (first_name, last_name, other_name, admission_number, class_id, level, parent_id, date_of_birth, gender, status, academic_year, admission_date) VALUES
('Ahmed', 'Bello', NULL, 'GR2024001', 1, 'Primary 1', 1, '2018-03-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Muhammad', NULL, 'GR2024002', 1, 'Primary 1', 2, '2018-05-22', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Chukwu', 'Okafor', NULL, 'GR2024003', 1, 'Primary 1', 3, '2018-07-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Yusuf', NULL, 'GR2024004', 2, 'Primary 1', 4, '2018-09-18', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Emeka', 'Nwosu', NULL, 'GR2024005', 2, 'Primary 1', 5, '2018-11-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Ngozi', 'Eze', NULL, 'GR2024006', 3, 'Primary 2', 6, '2017-01-12', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Tunde', 'Adeleke', NULL, 'GR2024007', 3, 'Primary 2', 7, '2017-03-20', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Funke', 'Olawale', NULL, 'GR2024008', 4, 'Primary 2', 8, '2017-05-28', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Obi', 'Mba', NULL, 'GR2024009', 4, 'Primary 2', 9, '2017-07-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Chioma', 'Okoro', NULL, 'GR2024010', 5, 'Primary 2', 10, '2017-09-22', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Suleiman', NULL, 'GR2024011', 5, 'Primary 3', 11, '2016-02-14', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Abubakar', NULL, 'GR2024012', 6, 'Primary 3', 12, '2016-04-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Uche', 'Nwankwo', NULL, 'GR2024013', 6, 'Primary 3', 1, '2016-06-18', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Ruth', 'Daniel', NULL, 'GR2024014', 7, 'Primary 3', 2, '2016-08-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('David', 'Chukwu', NULL, 'GR2024015', 7, 'Primary 4', 3, '2015-10-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Esther', 'Paul', NULL, 'GR2024016', 8, 'Primary 4', 4, '2015-12-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Gabriel', 'Thomas', NULL, 'GR2024017', 8, 'Primary 4', 5, '2015-02-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Miriam', 'Peter', NULL, 'GR2024018', 9, 'Primary 4', 6, '2015-04-15', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Samuel', 'Matthew', NULL, 'GR2024019', 9, 'Primary 5', 7, '2014-06-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Rebecca', 'James', NULL, 'GR2024020', 10, 'Primary 5', 8, '2014-08-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Benjamin', 'Abraham', NULL, 'GR2024021', 10, 'Primary 5', 9, '2014-11-07', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Deborah', 'Isaac', NULL, 'GR2024022', 11, 'Primary 6', 10, '2013-01-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Joseph', 'Jacob', NULL, 'GR2024023', 11, 'Primary 6', 11, '2013-03-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Naomi', 'David', NULL, 'GR2024024', 12, 'Primary 6', 12, '2013-05-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Daniel', 'Michael', NULL, 'GR2024025', 13, 'JSS 1', 1, '2012-07-18', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Hannah', 'Christopher', NULL, 'GR2024026', 13, 'JSS 1', 2, '2012-09-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Joshua', 'Anthony', NULL, 'GR2024027', 14, 'JSS 1', 3, '2012-11-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Rachel', 'Matthew', NULL, 'GR2024028', 14, 'JSS 2', 4, '2011-01-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Caleb', 'Joshua', NULL, 'GR2024029', 15, 'JSS 2', 5, '2011-03-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Lydia', 'Mark', NULL, 'GR2024030', 15, 'JSS 2', 6, '2011-05-15', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Nathan', 'Luke', NULL, 'GR2024031', 16, 'JSS 3', 7, '2010-07-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Kezia', 'John', NULL, 'GR2024032', 16, 'JSS 3', 8, '2010-09-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Aaron', 'Paul', NULL, 'GR2024033', 17, 'SSS 1', 9, '2009-12-07', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Elizabeth', 'Peter', NULL, 'GR2024034', 17, 'SSS 1', 10, '2009-02-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Isaac', 'Andrew', NULL, 'GR2024035', 18, 'SSS 1', 11, '2009-04-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mary', 'Simon', NULL, 'GR2024036', 18, 'SSS 2', 12, '2008-06-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Peter', 'James', NULL, 'GR2024037', 19, 'SSS 2', 1, '2008-09-07', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Martha', 'Philip', NULL, 'GR2024038', 19, 'SSS 3', 2, '2007-11-15', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Thomas', 'Bartholomew', NULL, 'GR2024039', 20, 'SSS 3', 3, '2007-01-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Sarah', 'Thaddeus', NULL, 'GR2024040', 20, 'SSS 3', 4, '2007-03-30', 'Female', 'Active', '2024/2025', '2024-09-15');

-- Insert Parent-Student Links
INSERT INTO parent_student_links (parent_id, student_id, relationship, is_primary) VALUES
(1, 1, 'Father', TRUE), (1, 2, 'Father', TRUE),
(2, 3, 'Mother', TRUE), (2, 4, 'Mother', TRUE),
(3, 5, 'Father', TRUE), (3, 6, 'Father', TRUE),
(4, 7, 'Mother', TRUE), (4, 8, 'Mother', TRUE),
(5, 9, 'Father', TRUE), (5, 10, 'Father', TRUE),
(6, 11, 'Mother', TRUE), (6, 12, 'Mother', TRUE),
(7, 13, 'Father', TRUE), (7, 14, 'Father', TRUE),
(8, 15, 'Mother', TRUE), (8, 16, 'Mother', TRUE),
(9, 17, 'Father', TRUE), (9, 18, 'Father', TRUE),
(10, 19, 'Mother', TRUE), (10, 20, 'Mother', TRUE),
(11, 21, 'Father', TRUE), (11, 22, 'Father', TRUE),
(12, 23, 'Mother', TRUE), (12, 24, 'Mother', TRUE),
(1, 25, 'Father', TRUE), (1, 26, 'Father', TRUE),
(2, 27, 'Mother', TRUE), (2, 28, 'Mother', TRUE),
(3, 29, 'Father', TRUE), (3, 30, 'Father', TRUE),
(4, 31, 'Mother', TRUE), (4, 32, 'Mother', TRUE),
(5, 33, 'Father', TRUE), (5, 34, 'Father', TRUE),
(6, 35, 'Mother', TRUE), (6, 36, 'Mother', TRUE),
(7, 37, 'Father', TRUE), (7, 38, 'Father', TRUE),
(8, 39, 'Mother', TRUE), (8, 40, 'Mother', TRUE);

-- Insert Subject Registrations for First Term 2024/2025
INSERT INTO subject_registrations (subject_id, class_id, academic_year, term, is_compulsory, status) VALUES
-- Primary 1 Classes (Core Subjects)
(1, 1, '2024/2025', 'First Term', TRUE, 'Active'), (2, 1, '2024/2025', 'First Term', TRUE, 'Active'), 
(3, 1, '2024/2025', 'First Term', TRUE, 'Active'), (4, 1, '2024/2025', 'First Term', TRUE, 'Active'),
(5, 1, '2024/2025', 'First Term', TRUE, 'Active'), (6, 1, '2024/2025', 'First Term', TRUE, 'Active'),
(7, 1, '2024/2025', 'First Term', FALSE, 'Active'), (8, 1, '2024/2025', 'First Term', FALSE, 'Active'),
(9, 1, '2024/2025', 'First Term', FALSE, 'Active'), (10, 1, '2024/2025', 'First Term', FALSE, 'Active'),
(11, 1, '2024/2025', 'First Term', FALSE, 'Active'), (12, 1, '2024/2025', 'First Term', FALSE, 'Active'),

(1, 2, '2024/2025', 'First Term', TRUE, 'Active'), (2, 2, '2024/2025', 'First Term', TRUE, 'Active'), 
(3, 2, '2024/2025', 'First Term', TRUE, 'Active'), (4, 2, '2024/2025', 'First Term', TRUE, 'Active'),
(5, 2, '2024/2025', 'First Term', TRUE, 'Active'), (6, 2, '2024/2025', 'First Term', TRUE, 'Active'),
(7, 2, '2024/2025', 'First Term', FALSE, 'Active'), (8, 2, '2024/2025', 'First Term', FALSE, 'Active'),
(9, 2, '2024/2025', 'First Term', FALSE, 'Active'), (10, 2, '2024/2025', 'First Term', FALSE, 'Active'),
(11, 2, '2024/2025', 'First Term', FALSE, 'Active'), (12, 2, '2024/2025', 'First Term', FALSE, 'Active'),

-- Secondary Classes (Core Subjects)
(13, 13, '2024/2025', 'First Term', TRUE, 'Active'), (14, 13, '2024/2025', 'First Term', TRUE, 'Active'),
(15, 13, '2024/2025', 'First Term', FALSE, 'Active'), (16, 13, '2024/2025', 'First Term', FALSE, 'Active'),
(17, 13, '2024/2025', 'First Term', FALSE, 'Active'), (18, 13, '2024/2025', 'First Term', FALSE, 'Active'),
(19, 13, '2024/2025', 'First Term', FALSE, 'Active'), (20, 13, '2024/2025', 'First Term', FALSE, 'Active'),
(21, 13, '2024/2025', 'First Term', FALSE, 'Active'), (22, 13, '2024/2025', 'First Term', FALSE, 'Active'),
(23, 13, '2024/2025', 'First Term', FALSE, 'Active'), (24, 13, '2024/2025', 'First Term', FALSE, 'Active'),
(25, 13, '2024/2025', 'First Term', FALSE, 'Active'), (26, 13, '2024/2025', 'First Term', FALSE, 'Active'),

(13, 17, '2024/2025', 'First Term', TRUE, 'Active'), (14, 17, '2024/2025', 'First Term', TRUE, 'Active'),
(15, 17, '2024/2025', 'First Term', FALSE, 'Active'), (16, 17, '2024/2025', 'First Term', FALSE, 'Active'),
(17, 17, '2024/2025', 'First Term', FALSE, 'Active'), (18, 17, '2024/2025', 'First Term', FALSE, 'Active'),
(19, 17, '2024/2025', 'First Term', FALSE, 'Active'), (20, 17, '2024/2025', 'First Term', FALSE, 'Active'),
(21, 17, '2024/2025', 'First Term', FALSE, 'Active'), (22, 17, '2024/2025', 'First Term', FALSE, 'Active'),
(23, 17, '2024/2025', 'First Term', FALSE, 'Active'), (24, 17, '2024/2025', 'First Term', FALSE, 'Active'),
(25, 17, '2024/2025', 'First Term', FALSE, 'Active'), (26, 17, '2024/2025', 'First Term', FALSE, 'Active'),
(27, 17, '2024/2025', 'First Term', FALSE, 'Active');

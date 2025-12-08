-- Graceland Royal Academy School Management System Database Schema
-- Remaining tables to transfer (excluding existing tables)

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- ACADEMIC MANAGEMENT TABLES
-- =============================================

-- Departments
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    head_of_department VARCHAR(100),
    head_of_department_id INT NULL,
    description TEXT,
    teacher_count INT DEFAULT 0,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_status (status)
);

-- Classes/Academic Levels - 9 Primary + 3 Secondary
CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL,
    section VARCHAR(10),
    category ENUM('Primary', 'Secondary') NOT NULL DEFAULT 'Primary',
    capacity INT NOT NULL DEFAULT 30,
    current_students INT DEFAULT 0,
    class_teacher_id INT NULL,
    class_teacher VARCHAR(100),
    academic_year VARCHAR(20) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_category (category),
    INDEX idx_academic_year (academic_year),
    INDEX idx_class_teacher (class_teacher_id),
    INDEX idx_status (status)
);

-- Subjects
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    category ENUM('Creche', 'Nursery', 'Primary', 'JSS', 'SS', 'General'),
    department VARCHAR(100),
    description TEXT,
    is_core BOOLEAN DEFAULT FALSE,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_category (category),
    INDEX idx_status (status)
);

-- Subject Registration (Subjects offered per class per term/session)
CREATE TABLE subject_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    class_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    is_compulsory BOOLEAN DEFAULT TRUE,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (subject_id, class_id, academic_year, term),
    INDEX idx_class (class_id),
    INDEX idx_subject (subject_id),
    INDEX idx_academic_year (academic_year),
    INDEX idx_term (term),
    INDEX idx_status (status)
);

-- Subject Assignments (Teacher-Subject-Class mapping)
CREATE TABLE subject_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (subject_id, class_id, academic_year, term),
    INDEX idx_teacher (teacher_id),
    INDEX idx_class (class_id),
    INDEX idx_subject (subject_id)
);

-- =============================================
-- PEOPLE MANAGEMENT TABLES
-- =============================================

-- Teachers
CREATE TABLE teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    other_name VARCHAR(50),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    gender ENUM('Male', 'Female'),
    qualification VARCHAR(100),
    specialization JSON, -- Array of specializations
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    is_class_teacher BOOLEAN DEFAULT FALSE,
    department_id INT,
    signature TEXT, -- base64 encoded signature
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee_id (employee_id),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_department (department_id)
);

-- Students
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    other_name VARCHAR(50),
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    class_id INT NOT NULL,
    level VARCHAR(50),
    parent_id INT NULL,
    date_of_birth DATE,
    gender ENUM('Male', 'Female') NOT NULL,
    photo_url VARCHAR(255),
    passport_photo TEXT, -- base64 encoded photo
    status ENUM('Active', 'Inactive', 'Graduated', 'Transferred') DEFAULT 'Active',
    academic_year VARCHAR(20) NOT NULL,
    admission_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (parent_id) REFERENCES parents(id),
    INDEX idx_admission_number (admission_number),
    INDEX idx_class (class_id),
    INDEX idx_parent (parent_id),
    INDEX idx_status (status),
    INDEX idx_academic_year (academic_year)
);

-- Parents
CREATE TABLE parents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    address TEXT,
    occupation VARCHAR(100),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Parent-Student Relationships
CREATE TABLE parent_student_links (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    relationship ENUM('Father', 'Mother', 'Guardian') NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent_student (parent_id, student_id),
    INDEX idx_parent (parent_id),
    INDEX idx_student (student_id)
);

-- Accountants
CREATE TABLE accountants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee_id (employee_id),
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- =============================================
-- ACADEMIC RECORDS TABLES
-- =============================================

-- Scores/Results
CREATE TABLE scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_assignment_id INT NOT NULL,
    ca1 DECIMAL(5,2) DEFAULT 0,
    ca2 DECIMAL(5,2) DEFAULT 0,
    exam DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(5,2) GENERATED ALWAYS AS (ca1 + ca2 + exam) STORED,
    grade VARCHAR(2),
    remark VARCHAR(50),
    class_average DECIMAL(5,2),
    class_min DECIMAL(5,2),
    class_max DECIMAL(5,2),
    entered_by INT NOT NULL,
    entered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Draft', 'Submitted') DEFAULT 'Draft',
    academic_year VARCHAR(20),
    term ENUM('First Term', 'Second Term', 'Third Term'),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_assignment_id) REFERENCES subject_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (entered_by) REFERENCES users(id),
    INDEX idx_student (student_id),
    INDEX idx_assignment (subject_assignment_id),
    INDEX idx_entered_by (entered_by),
    INDEX idx_academic_year (academic_year),
    INDEX idx_term (term)
);

-- Affective Domains (Behavioral Assessment)
CREATE TABLE affective_domains (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    attentiveness INT CHECK (attentiveness BETWEEN 1 AND 5),
    attentiveness_remark TEXT,
    honesty INT CHECK (honesty BETWEEN 1 AND 5),
    honesty_remark TEXT,
    neatness INT CHECK (neatness BETWEEN 1 AND 5),
    neatness_remark TEXT,
    punctuality INT CHECK (punctuality BETWEEN 1 AND 5),
    punctuality_remark TEXT,
    politeness INT CHECK (politeness BETWEEN 1 AND 5),
    politeness_remark TEXT,
    cooperation INT CHECK (cooperation BETWEEN 1 AND 5),
    cooperation_remark TEXT,
    entered_by INT NOT NULL,
    entered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (entered_by) REFERENCES users(id),
    UNIQUE KEY unique_affective (student_id, class_id, term, academic_year),
    INDEX idx_student (student_id),
    INDEX idx_class (class_id),
    INDEX idx_academic_year (academic_year),
    INDEX idx_term (term)
);

-- Psychomotor Domains (Skills Assessment)
CREATE TABLE psychomotor_domains (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    sports INT CHECK (sports BETWEEN 1 AND 5),
    sports_remark TEXT,
    crafts INT CHECK (crafts BETWEEN 1 AND 5),
    crafts_remark TEXT,
    drawing INT CHECK (drawing BETWEEN 1 AND 5),
    drawing_remark TEXT,
    music INT CHECK (music BETWEEN 1 AND 5),
    music_remark TEXT,
    entered_by INT NOT NULL,
    entered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (entered_by) REFERENCES users(id),
    UNIQUE KEY unique_psychomotor (student_id, class_id, term, academic_year),
    INDEX idx_student (student_id),
    INDEX idx_class (class_id),
    INDEX idx_academic_year (academic_year),
    INDEX idx_term (term)
);

-- Compiled Results (Complete Result Sheets)
CREATE TABLE compiled_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    total_score DECIMAL(5,2),
    average_score DECIMAL(5,2),
    position_in_class INT,
    class_average DECIMAL(5,2),
    highest_score DECIMAL(5,2),
    lowest_score DECIMAL(5,2),
    number_of_students INT,
    attendance_percentage DECIMAL(5,2),
    conduct_remark TEXT,
    class_teacher_remark TEXT,
    principal_remark TEXT,
    next_term_begins DATE,
    status ENUM('Draft', 'Submitted', 'Approved') DEFAULT 'Draft',
    approved_by INT,
    approved_date DATETIME,
    created_by INT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY unique_result (student_id, class_id, term, academic_year),
    INDEX idx_student (student_id),
    INDEX idx_class (class_id),
    INDEX idx_academic_year (academic_year),
    INDEX idx_term (term),
    INDEX idx_status (status)
);

-- =============================================
-- ATTENDANCE TABLES
-- =============================================

-- Attendance Records
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late', 'Excused') NOT NULL,
    remarks TEXT,
    marked_by INT NOT NULL,
    marked_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    academic_year VARCHAR(20),
    term ENUM('First Term', 'Second Term', 'Third Term'),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id),
    UNIQUE KEY unique_attendance (student_id, class_id, date),
    INDEX idx_student (student_id),
    INDEX idx_class (class_id),
    INDEX idx_date (date),
    INDEX idx_academic_year (academic_year),
    INDEX idx_term (term)
);

-- =============================================
-- TIMETABLE TABLES
-- =============================================

-- Class Timetable
CREATE TABLE class_timetable (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue VARCHAR(100),
    academic_year VARCHAR(20) NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_timetable_slot (class_id, day_of_week, start_time, end_time, academic_year, term),
    INDEX idx_class (class_id),
    INDEX idx_subject (subject_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_day (day_of_week),
    INDEX idx_academic_year (academic_year),
    INDEX idx_term (term)
);

-- Exam Timetable
CREATE TABLE exam_timetable (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    exam_type ENUM('CA1', 'CA2', 'Exam', 'Practical') NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    venue VARCHAR(100),
    supervisor_id INT,
    academic_year VARCHAR(20) NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES teachers(id),
    INDEX idx_class (class_id),
    INDEX idx_subject (subject_id),
    INDEX idx_date (exam_date),
    INDEX idx_academic_year (academic_year),
    INDEX idx_term (term)
);

-- =============================================
-- FINANCIAL TABLES
-- =============================================

-- Fee Structures
CREATE TABLE fee_structures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    tuition_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    development_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    sports_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    laboratory_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    library_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    ict_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    extracurricular_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    maintenance_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    other_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_fee DECIMAL(10,2) GENERATED ALWAYS AS (
        tuition_fee + development_fee + sports_fee + laboratory_fee + 
        library_fee + ict_fee + extracurricular_fee + maintenance_fee + other_fee
    ) STORED,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_fee_structure (class_id, academic_year, term),
    INDEX idx_class (class_id),
    INDEX idx_academic_year (academic_year),
    INDEX idx_term (term)
);

-- Student Fee Balances
CREATE TABLE student_fee_balances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    fee_structure_id INT NOT NULL,
    total_fee DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
    balance DECIMAL(10,2) GENERATED ALWAYS AS (total_fee - amount_paid) STORED,
    academic_year VARCHAR(20) NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    status ENUM('Pending', 'Partial', 'Paid', 'Overdue') DEFAULT 'Pending',
    last_payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_fee (student_id, fee_structure_id),
    INDEX idx_student (student_id),
    INDEX idx_academic_year (academic_year),
    INDEX idx_term (term),
    INDEX idx_status (status)
);

-- Payments
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    fee_structure_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type ENUM('Cash', 'Bank Transfer', 'POS', 'Cheque', 'Online') NOT NULL,
    transaction_id VARCHAR(100),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    payment_date DATE NOT NULL,
    payment_time TIME NOT NULL,
    received_by INT NOT NULL,
    bank_account_id INT,
    notes TEXT,
    status ENUM('Pending', 'Verified', 'Failed') DEFAULT 'Pending',
    verified_by INT,
    verified_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE,
    FOREIGN KEY (received_by) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    INDEX idx_student (student_id),
    INDEX idx_receipt (receipt_number),
    INDEX idx_payment_date (payment_date),
    INDEX idx_status (status)
);

-- Bank Account Settings
CREATE TABLE bank_account_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bank_name VARCHAR(100) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_type ENUM('Savings', 'Current', 'Fixed Deposit') DEFAULT 'Current',
    bank_code VARCHAR(10),
    branch_name VARCHAR(100),
    branch_address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bank_name (bank_name),
    INDEX idx_account_number (account_number),
    INDEX idx_active (is_active),
    INDEX idx_default (is_default)
);

-- =============================================
-- SCHOLARSHIP TABLES
-- =============================================

-- Scholarships
CREATE TABLE scholarships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    scholarship_type ENUM('Academic', 'Sports', 'Financial Need', 'Special') NOT NULL,
    eligibility_criteria TEXT,
    benefits_description TEXT,
    max_awardees INT,
    application_deadline DATE,
    academic_year VARCHAR(20) NOT NULL,
    status ENUM('Active', 'Inactive', 'Closed') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (scholarship_type),
    INDEX idx_academic_year (academic_year),
    INDEX idx_status (status)
);

-- Student Scholarships
CREATE TABLE student_scholarships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    scholarship_id INT NOT NULL,
    application_date DATE NOT NULL,
    award_status ENUM('Applied', 'Under Review', 'Approved', 'Rejected', 'Awarded') DEFAULT 'Applied',
    award_amount DECIMAL(10,2),
    award_percentage DECIMAL(5,2),
    valid_from DATE,
    valid_until DATE,
    terms_conditions TEXT,
    awarded_by INT,
    awarded_date DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE,
    FOREIGN KEY (awarded_by) REFERENCES users(id),
    UNIQUE KEY unique_student_scholarship (student_id, scholarship_id),
    INDEX idx_student (student_id),
    INDEX idx_scholarship (scholarship_id),
    INDEX idx_status (award_status)
);

-- =============================================
-- PROMOTION AND TRANSFER TABLES
-- =============================================

-- Student Promotions
CREATE TABLE student_promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    from_class_id INT NOT NULL,
    to_class_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    promotion_type ENUM('Promotion', 'Detained', 'Transferred') NOT NULL,
    promotion_date DATE NOT NULL,
    reason TEXT,
    promoted_by INT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    approved_by INT,
    approved_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (from_class_id) REFERENCES classes(id),
    FOREIGN KEY (to_class_id) REFERENCES classes(id),
    FOREIGN KEY (promoted_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    UNIQUE KEY unique_promotion (student_id, academic_year),
    INDEX idx_student (student_id),
    INDEX idx_academic_year (academic_year),
    INDEX idx_status (status)
);

-- =============================================
-- COMMUNICATION TABLES
-- =============================================

-- Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('General', 'Academic', 'Financial', 'Emergency', 'System') NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    target_audience ENUM('All', 'Students', 'Parents', 'Teachers', 'Accountants', 'Admin') NOT NULL,
    target_class_id INT NULL,
    target_student_id INT NULL,
    sender_id INT NOT NULL,
    send_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATETIME,
    is_read BOOLEAN DEFAULT FALSE,
    read_count INT DEFAULT 0,
    status ENUM('Draft', 'Sent', 'Expired', 'Cancelled') DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (target_class_id) REFERENCES classes(id),
    FOREIGN KEY (target_student_id) REFERENCES students(id),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    INDEX idx_type (notification_type),
    INDEX idx_priority (priority),
    INDEX idx_audience (target_audience),
    INDEX idx_send_date (send_date),
    INDEX idx_status (status)
);

-- =============================================
-- ASSIGNMENT TABLES
-- =============================================

-- Assignments
CREATE TABLE assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject_assignment_id INT NOT NULL,
    assignment_type ENUM('Homework', 'Class Work', 'Project', 'Test', 'Exam') NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,
    due_date DATETIME NOT NULL,
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    status ENUM('Draft', 'Assigned', 'Closed', 'Graded') DEFAULT 'Draft',
    instructions TEXT,
    attachment_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_assignment_id) REFERENCES subject_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    INDEX idx_subject_assignment (subject_assignment_id),
    INDEX idx_type (assignment_type),
    INDEX idx_due_date (due_date),
    INDEX idx_academic_year (academic_year),
    INDEX idx_term (term),
    INDEX idx_status (status)
);

-- Assignment Submissions
CREATE TABLE assignment_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_text TEXT,
    attachment_url VARCHAR(255),
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    marks_obtained DECIMAL(5,2),
    grade VARCHAR(2),
    remarks TEXT,
    graded_by INT,
    graded_at DATETIME,
    status ENUM('Not Submitted', 'Submitted', 'Late', 'Graded') DEFAULT 'Not Submitted',
    plagiarism_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id),
    UNIQUE KEY unique_submission (assignment_id, student_id),
    INDEX idx_assignment (assignment_id),
    INDEX idx_student (student_id),
    INDEX idx_status (status)
);

-- =============================================
-- FILE UPLOAD TABLES
-- =============================================

-- File Uploads
CREATE TABLE file_uploads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size DECIMAL(10,2) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    upload_category ENUM('Profile', 'Assignment', 'Result', 'Notification', 'Document', 'Other') NOT NULL,
    uploaded_by INT NOT NULL,
    related_entity_type ENUM('User', 'Student', 'Teacher', 'Parent', 'Assignment', 'Result') NULL,
    related_entity_id INT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_category (upload_category),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_entity (related_entity_type, related_entity_id),
    INDEX idx_created_at (created_at)
);

-- =============================================
-- VIEWS FOR OPTIMIZED QUERIES
-- =============================================

-- Student Summary View
CREATE VIEW student_summary AS
SELECT 
    s.id,
    s.admission_number,
    s.first_name,
    s.last_name,
    s.gender,
    s.status,
    c.name as class_name,
    c.level,
    c.category,
    p.first_name as parent_first_name,
    p.last_name as parent_last_name,
    p.phone as parent_phone,
    s.academic_year,
    s.admission_date
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN parents p ON s.parent_id = p.id;

-- Teacher Assignment Summary View
CREATE VIEW teacher_assignments AS
SELECT 
    t.id,
    t.first_name,
    t.last_name,
    t.employee_id,
    t.email,
    sub.name as subject_name,
    sub.code as subject_code,
    c.name as class_name,
    c.level,
    sa.academic_year,
    sa.term,
    sa.status as assignment_status
FROM teachers t
LEFT JOIN subject_assignments sa ON t.id = sa.teacher_id
LEFT JOIN subjects sub ON sa.subject_id = sub.id
LEFT JOIN classes c ON sa.class_id = c.id
WHERE sa.status = 'Active';

-- Class Performance Summary View
CREATE VIEW class_performance_summary AS
SELECT 
    c.id as class_id,
    c.name as class_name,
    c.level,
    COUNT(s.id) as student_count,
    AVG(cr.total_score) as average_total_score,
    MAX(cr.total_score) as highest_score,
    MIN(cr.total_score) as lowest_score,
    cr.academic_year,
    cr.term
FROM classes c
LEFT JOIN students s ON c.id = s.class_id AND s.status = 'Active'
LEFT JOIN compiled_results cr ON s.id = cr.student_id
GROUP BY c.id, c.name, c.level, cr.academic_year, cr.term;

SET FOREIGN_KEY_CHECKS = 1;

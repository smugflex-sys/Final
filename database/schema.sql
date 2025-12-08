-- Graceland Royal Academy School Management System Database Schema
-- MySQL 8.0+ Compatible

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- CORE SYSTEM TABLES
-- =============================================

-- Users table for authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'accountant', 'parent') NOT NULL,
    linked_id INT NOT NULL, -- References teacher/parent/accountant id
    email VARCHAR(100) UNIQUE NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_linked_id (linked_id),
    INDEX idx_email (email)
);

-- Permissions table
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    module VARCHAR(50) NOT NULL, -- e.g., 'users', 'students', 'fees', 'reports'
    action VARCHAR(50) NOT NULL, -- e.g., 'create', 'read', 'update', 'delete'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_module (module),
    INDEX idx_action (action)
);

-- Role Permissions table for role-based access control
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role ENUM('admin', 'teacher', 'accountant', 'parent') NOT NULL,
    permission_id INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id),
    UNIQUE KEY unique_role_permission (role, permission_id),
    INDEX idx_role (role),
    INDEX idx_permission (permission_id),
    INDEX idx_active (is_active)
);

-- User Sessions table for authentication tracking
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    logout_time DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_token (session_token),
    INDEX idx_expires (expires_at),
    INDEX idx_active (is_active)
);

-- School Settings
CREATE TABLE school_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Activity Logs for audit trail
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    actor VARCHAR(255) NOT NULL,
    actor_role ENUM('Admin', 'Teacher', 'Accountant', 'Parent', 'System') NOT NULL,
    action VARCHAR(255) NOT NULL,
    target VARCHAR(255),
    ip_address VARCHAR(45),
    status ENUM('Success', 'Failed') NOT NULL,
    details TEXT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

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

-- Scores (Individual subject scores)
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
    INDEX idx_status (status),
    INDEX idx_term_year (academic_year, term)
);

-- Affective Domain Assessments
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
    obedience INT CHECK (obedience BETWEEN 1 AND 5),
    obedience_remark TEXT,
    sense_of_responsibility INT CHECK (sense_of_responsibility BETWEEN 1 AND 5),
    sense_of_responsibility_remark TEXT,
    entered_by INT NOT NULL,
    entered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (entered_by) REFERENCES users(id),
    UNIQUE KEY unique_affective (student_id, class_id, term, academic_year),
    INDEX idx_student (student_id),
    INDEX idx_class_term (class_id, term, academic_year)
);

-- Psychomotor Domain Assessments
CREATE TABLE psychomotor_domains (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    attention_to_direction INT CHECK (attention_to_direction BETWEEN 1 AND 5),
    attention_to_direction_remark TEXT,
    considerate_of_others INT CHECK (considerate_of_others BETWEEN 1 AND 5),
    considerate_of_others_remark TEXT,
    handwriting INT CHECK (handwriting BETWEEN 1 AND 5),
    handwriting_remark TEXT,
    sports INT CHECK (sports BETWEEN 1 AND 5),
    sports_remark TEXT,
    verbal_fluency INT CHECK (verbal_fluency BETWEEN 1 AND 5),
    verbal_fluency_remark TEXT,
    works_well_independently INT CHECK (works_well_independently BETWEEN 1 AND 5),
    works_well_independently_remark TEXT,
    entered_by INT NOT NULL,
    entered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (entered_by) REFERENCES users(id),
    UNIQUE KEY unique_psychomotor (student_id, class_id, term, academic_year),
    INDEX idx_student (student_id),
    INDEX idx_class_term (class_id, term, academic_year)
);

-- Compiled Results (Complete result sheets)
CREATE TABLE compiled_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    total_score DECIMAL(6,2),
    average_score DECIMAL(5,2),
    class_average DECIMAL(5,2),
    position INT,
    total_students INT,
    times_present INT DEFAULT 0,
    times_absent INT DEFAULT 0,
    total_attendance_days INT DEFAULT 0,
    term_begin DATE,
    term_end DATE,
    next_term_begin DATE,
    class_teacher_name VARCHAR(100),
    class_teacher_comment TEXT,
    principal_name VARCHAR(100),
    principal_comment TEXT,
    principal_signature TEXT,
    compiled_by INT NOT NULL,
    compiled_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Draft', 'Submitted', 'Approved', 'Rejected') DEFAULT 'Draft',
    approved_by INT NULL,
    approved_date DATETIME NULL,
    rejection_reason TEXT,
    print_approved BOOLEAN DEFAULT FALSE,
    print_approved_by INT NULL,
    print_approved_date DATETIME NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (compiled_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (print_approved_by) REFERENCES users(id),
    UNIQUE KEY unique_result (student_id, class_id, term, academic_year),
    INDEX idx_student (student_id),
    INDEX idx_class (class_id),
    INDEX idx_status (status),
    INDEX idx_term_year (academic_year, term),
    INDEX idx_print_approved (print_approved)
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
    marked_by INT NOT NULL,
    marked_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    term ENUM('First Term', 'Second Term', 'Third Term'),
    academic_year VARCHAR(20),
    remarks TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (marked_by) REFERENCES users(id),
    UNIQUE KEY unique_attendance (student_id, date),
    INDEX idx_student (student_id),
    INDEX idx_class_date (class_id, date),
    INDEX idx_date (date)
);

-- =============================================
-- TIMETABLE TABLES
-- =============================================

-- Class Timetable
CREATE TABLE class_timetable (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday') NOT NULL,
    period INT NOT NULL CHECK (period BETWEEN 1 AND 8),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    venue VARCHAR(50),
    academic_year VARCHAR(20) NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    UNIQUE KEY unique_timetable_slot (class_id, day_of_week, period, academic_year, term),
    INDEX idx_class (class_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_subject (subject_id),
    INDEX idx_day_period (day_of_week, period)
);

-- Exam Timetable
CREATE TABLE exam_timetable (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INT NOT NULL, -- in minutes
    venue VARCHAR(50),
    academic_year VARCHAR(20) NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    instructions TEXT,
    created_by INT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_class_date (class_id, exam_date),
    INDEX idx_subject (subject_id),
    INDEX idx_date (exam_date)
);

-- =============================================
-- FINANCIAL TABLES
-- =============================================

-- Fee Structures
CREATE TABLE fee_structures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    level VARCHAR(50),
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    tuition_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    development_levy DECIMAL(10,2) NOT NULL DEFAULT 0,
    sports_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    exam_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    books_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    uniform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    transport_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_fee DECIMAL(10,2) GENERATED ALWAYS AS (
        tuition_fee + development_levy + sports_fee + exam_fee + books_fee + uniform_fee + transport_fee
    ) STORED,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_fee_structure (class_id, term, academic_year),
    INDEX idx_class (class_id),
    INDEX idx_term_year (academic_year, term)
);

-- Student Fee Balances
CREATE TABLE student_fee_balances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    total_fee_required DECIMAL(10,2) NOT NULL,
    total_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
    balance DECIMAL(10,2) GENERATED ALWAYS AS (total_fee_required - total_paid) STORED,
    status ENUM('Paid', 'Partial', 'Unpaid') DEFAULT 'Unpaid',
    last_payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    UNIQUE KEY unique_balance (student_id, term, academic_year),
    INDEX idx_student (student_id),
    INDEX idx_status (status),
    INDEX idx_balance (balance)
);

-- Payments
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type ENUM('School Fees', 'Examination Fees', 'Books', 'Uniform', 'Transport', 'Others') NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term'),
    academic_year VARCHAR(20),
    payment_method ENUM('Bank Transfer', 'Cash', 'POS', 'Online Payment', 'Cheque') NOT NULL,
    transaction_reference VARCHAR(100),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    recorded_by INT NOT NULL,
    recorded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
    verified_by INT NULL,
    verified_date DATETIME NULL,
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    INDEX idx_student (student_id),
    INDEX idx_receipt (receipt_number),
    INDEX idx_status (status),
    INDEX idx_date (recorded_date),
    INDEX idx_term_year (academic_year, term)
);

-- Bank Account Settings
CREATE TABLE bank_account_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bank_name VARCHAR(100) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    bank_transfer_enabled BOOLEAN DEFAULT TRUE,
    online_payment_enabled BOOLEAN DEFAULT FALSE,
    cash_payment_enabled BOOLEAN DEFAULT TRUE,
    updated_by INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =============================================
-- ASSIGNMENTS & COMMUNICATION TABLES
-- =============================================

-- Assignments
CREATE TABLE assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    due_date DATE NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,
    assigned_date DATE NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    status ENUM('Active', 'Completed', 'Overdue') DEFAULT 'Active',
    attachment_url VARCHAR(255),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_class (class_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_due_date (due_date),
    INDEX idx_status (status)
);

-- Assignment Submissions
CREATE TABLE assignment_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_text TEXT,
    attachment_url VARCHAR(255),
    marks_obtained DECIMAL(5,2),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_at DATETIME NULL,
    graded_by INT NULL,
    remarks TEXT,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id),
    UNIQUE KEY unique_submission (assignment_id, student_id),
    INDEX idx_assignment (assignment_id),
    INDEX idx_student (student_id)
);

-- Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error') NOT NULL,
    target_audience ENUM('all', 'teachers', 'parents', 'students', 'accountants', 'specific') NOT NULL,
    target_users JSON, -- Array of specific user IDs if target_audience is 'specific'
    sent_by INT NOT NULL,
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    read_by JSON, -- Array of user IDs who have read this
    expires_at DATETIME NULL,
    FOREIGN KEY (sent_by) REFERENCES users(id),
    INDEX idx_target (target_audience),
    INDEX idx_sent_date (sent_date),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read)
);

-- =============================================
-- SCHOLARSHIPS & DISCOUNTS
-- =============================================

-- Scholarships
CREATE TABLE scholarships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('Percentage', 'Fixed Amount') NOT NULL,
    value DECIMAL(5,2) NOT NULL, -- Percentage or amount
    description TEXT,
    eligibility_criteria TEXT,
    max_beneficiaries INT,
    current_beneficiaries INT DEFAULT 0,
    total_budget DECIMAL(10,2),
    academic_year VARCHAR(20) NOT NULL,
    status ENUM('Active', 'Inactive', 'Expired') DEFAULT 'Active',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_academic_year (academic_year),
    INDEX idx_status (status)
);

-- Student Scholarships
CREATE TABLE student_scholarships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    scholarship_id INT NOT NULL,
    student_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term'),
    academic_year VARCHAR(20) NOT NULL,
    status ENUM('Active', 'Inactive', 'Revoked') DEFAULT 'Active',
    awarded_by INT NOT NULL,
    awarded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (awarded_by) REFERENCES users(id),
    UNIQUE KEY unique_student_scholarship (scholarship_id, student_id, term, academic_year),
    INDEX idx_student (student_id),
    INDEX idx_scholarship (scholarship_id)
);

-- =============================================
-- PROMOTION & TRANSFER TABLES
-- =============================================

-- Student Promotions
CREATE TABLE student_promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    from_class_id INT NOT NULL,
    to_class_id INT NOT NULL,
    from_academic_year VARCHAR(20) NOT NULL,
    to_academic_year VARCHAR(20) NOT NULL,
    promotion_status ENUM('Promoted', 'Repeated', 'Transferred') NOT NULL,
    promoted_by INT NOT NULL,
    promotion_date DATE NOT NULL,
    remarks TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (from_class_id) REFERENCES classes(id),
    FOREIGN KEY (to_class_id) REFERENCES classes(id),
    FOREIGN KEY (promoted_by) REFERENCES users(id),
    UNIQUE KEY unique_promotion (student_id, from_academic_year),
    INDEX idx_student (student_id),
    INDEX idx_from_class (from_class_id),
    INDEX idx_to_class (to_class_id),
    INDEX idx_promotion_date (promotion_date)
);

-- =============================================
-- FILE UPLOADS TABLE
-- =============================================

-- File Uploads (for photos, documents, etc.)
CREATE TABLE file_uploads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    upload_type ENUM('student_photo', 'teacher_signature', 'document', 'assignment_attachment') NOT NULL,
    entity_id INT NOT NULL, -- Reference to student/teacher/etc ID
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_entity (entity_id, upload_type),
    INDEX idx_upload_type (upload_type),
    INDEX idx_uploaded_by (uploaded_by)
);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

DELIMITER //

-- Automatic Admission Number Generation Trigger
CREATE TRIGGER generate_admission_number 
BEFORE INSERT ON students 
FOR EACH ROW
BEGIN
    DECLARE next_number INT;
    DECLARE admission_prefix VARCHAR(10) DEFAULT 'GRA';
    
    -- Get the next number in sequence
    SELECT COALESCE(MAX(CAST(SUBSTRING(admission_number, 5) AS UNSIGNED)), 0) + 1 
    INTO next_number
    FROM students 
    WHERE admission_number REGEXP '^GRA/[0-9]+$';
    
    -- Set the admission number
    SET NEW.admission_number = CONCAT(admission_prefix, '/', LPAD(next_number, 4, '0'));
END//

-- Update class student count when student is added/updated
CREATE TRIGGER update_class_student_count_insert 
AFTER INSERT ON students 
FOR EACH ROW
BEGIN
    UPDATE classes 
    SET current_students = (
        SELECT COUNT(*) FROM students 
        WHERE class_id = NEW.class_id AND status = 'Active'
    )
    WHERE id = NEW.class_id;
END//

CREATE TRIGGER update_class_student_count_update 
AFTER UPDATE ON students 
FOR EACH ROW
BEGIN
    -- Update old class
    IF OLD.class_id != NEW.class_id THEN
        UPDATE classes 
        SET current_students = (
            SELECT COUNT(*) FROM students 
            WHERE class_id = OLD.class_id AND status = 'Active'
        )
        WHERE id = OLD.class_id;
        
        -- Update new class
        UPDATE classes 
        SET current_students = (
            SELECT COUNT(*) FROM students 
            WHERE class_id = NEW.class_id AND status = 'Active'
        )
        WHERE id = NEW.class_id;
    END IF;
END//

CREATE TRIGGER update_class_student_count_delete 
AFTER DELETE ON students 
FOR EACH ROW
BEGIN
    UPDATE classes 
    SET current_students = (
        SELECT COUNT(*) FROM students 
        WHERE class_id = OLD.class_id AND status = 'Active'
    )
    WHERE id = OLD.class_id;
END//

-- Update fee balance when payment is made
CREATE TRIGGER update_fee_balance_payment 
AFTER INSERT ON payments 
FOR EACH ROW
BEGIN
    UPDATE student_fee_balances 
    SET total_paid = total_paid + NEW.amount,
        last_payment_date = NEW.recorded_date,
        status = CASE 
            WHEN total_fee_required <= (total_paid + NEW.amount) THEN 'Paid'
            WHEN total_paid + NEW.amount > 0 THEN 'Partial'
            ELSE 'Unpaid'
        END
    WHERE student_id = NEW.student_id 
    AND (term = NEW.term OR (NEW.term IS NULL AND term = (SELECT current_term FROM school_settings WHERE setting_key = 'current_term')))
    AND (academic_year = NEW.academic_year OR (NEW.academic_year IS NULL AND academic_year = (SELECT current_academic_year FROM school_settings WHERE setting_key = 'current_academic_year')));
END//

DELIMITER ;

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Student Summary View
CREATE VIEW student_summary AS
SELECT 
    s.id,
    s.first_name,
    s.last_name,
    s.admission_number,
    s.gender,
    s.date_of_birth,
    c.name as class_name,
    c.level,
    s.academic_year,
    s.status,
    CONCAT(p.first_name, ' ', p.last_name) as parent_name,
    p.email as parent_email,
    p.phone as parent_phone,
    sfb.balance as fee_balance,
    sfb.status as fee_status
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN parent_student_links psl ON s.id = psl.student_id AND psl.is_primary = TRUE
LEFT JOIN parents p ON psl.parent_id = p.id
LEFT JOIN student_fee_balances sfb ON s.id = sfb.student_id 
    AND sfb.term = (SELECT setting_value FROM school_settings WHERE setting_key = 'current_term')
    AND sfb.academic_year = (SELECT setting_value FROM school_settings WHERE setting_key = 'current_academic_year');

-- Teacher Assignment View
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
JOIN subject_assignments sa ON t.id = sa.teacher_id
JOIN subjects sub ON sa.subject_id = sub.id
JOIN classes c ON sa.class_id = c.id
WHERE sa.status = 'Active';

-- Class Performance Summary View
CREATE VIEW class_performance_summary AS
SELECT 
    c.id as class_id,
    c.name as class_name,
    c.level,
    cr.term,
    cr.academic_year,
    COUNT(cr.id) as total_students,
    ROUND(AVG(cr.average_score), 2) as class_average,
    MAX(cr.average_score) as highest_score,
    MIN(cr.average_score) as lowest_score,
    COUNT(CASE WHEN cr.position = 1 THEN 1 END) as first_position_count
FROM classes c
LEFT JOIN compiled_results cr ON c.id = cr.class_id
WHERE cr.status = 'Approved'
GROUP BY c.id, c.name, c.level, cr.term, cr.academic_year;

-- =============================================
-- INITIAL DATA INSERTION
-- =============================================

-- Insert default school settings
INSERT INTO school_settings (setting_key, setting_value, description) VALUES
('school_name', 'Graceland Royal Academy Gombe', 'Official school name'),
('school_motto', 'Wisdom & Illumination', 'School motto'),
('principal_name', 'Mrs. Grace Okoro', 'Current principal name'),
('current_term', 'First Term', 'Current academic term'),
('current_academic_year', '2024/2025', 'Current academic year'),
('school_address', 'Gombe, Nigeria', 'School physical address'),
('school_phone', '+234-XXX-XXXX-XXXX', 'School contact phone'),
('school_email', 'info@graceland.edu.ng', 'School official email');

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, role, linked_id, email, status) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 0, 'admin@graceland.edu.ng', 'Active');

-- Note: All other users should be created through the application interface
-- This ensures real-time database synchronization and proper linked record creation

-- Insert basic permissions for role-based access control
INSERT INTO permissions (name, description, module, action) VALUES
-- User management permissions
('create_users', 'Create new users', 'users', 'create'),
('read_users', 'View user information', 'users', 'read'),
('update_users', 'Update user information', 'users', 'update'),
('delete_users', 'Delete users', 'users', 'delete'),
('manage_user_roles', 'Assign and remove user roles', 'users', 'manage'),
('reset_passwords', 'Reset user passwords', 'users', 'reset'),

-- Student management permissions
('create_students', 'Create new students', 'students', 'create'),
('read_students', 'View student information', 'students', 'read'),
('update_students', 'Update student information', 'students', 'update'),
('delete_students', 'Delete students', 'students', 'delete'),
('manage_student_admissions', 'Manage student admissions', 'students', 'admit'),

-- Teacher management permissions
('create_teachers', 'Create new teachers', 'teachers', 'create'),
('read_teachers', 'View teacher information', 'teachers', 'read'),
('update_teachers', 'Update teacher information', 'teachers', 'update'),
('delete_teachers', 'Delete teachers', 'teachers', 'delete'),
('assign_subjects', 'Assign subjects to teachers', 'teachers', 'assign'),

-- Parent management permissions
('create_parents', 'Create new parents', 'parents', 'create'),
('read_parents', 'View parent information', 'parents', 'read'),
('update_parents', 'Update parent information', 'parents', 'update'),
('delete_parents', 'Delete parents', 'parents', 'delete'),
('link_students', 'Link students to parents', 'parents', 'link'),

-- Academic management permissions
('manage_classes', 'Manage classes and sections', 'academic', 'classes'),
('manage_subjects', 'Manage subjects', 'academic', 'subjects'),
('manage_timetable', 'Create and manage timetables', 'academic', 'timetable'),
('manage_assignments', 'Create and grade assignments', 'academic', 'assignments'),
('manage_exams', 'Manage examinations', 'academic', 'exams'),

-- Financial permissions
('manage_fees', 'Manage fee structures', 'fees', 'manage'),
('record_payments', 'Record student payments', 'fees', 'record'),
('view_reports', 'View financial reports', 'fees', 'reports'),
('manage_scholarships', 'Manage scholarships', 'fees', 'scholarships'),

-- Report permissions
('view_student_reports', 'View student reports', 'reports', 'students'),
('view_financial_reports', 'View financial reports', 'reports', 'financial'),
('view_academic_reports', 'View academic reports', 'reports', 'academic'),
('export_data', 'Export system data', 'reports', 'export'),

-- System permissions
('manage_settings', 'Manage system settings', 'system', 'settings'),
('view_logs', 'View system logs', 'system', 'logs'),
('manage_notifications', 'Send system notifications', 'system', 'notifications');

-- Assign permissions to roles
-- Admin gets all permissions
INSERT INTO role_permissions (role, permission_id, granted_by, is_active) 
SELECT 'admin', id, 1, TRUE FROM permissions;

-- Teacher permissions - comprehensive access
INSERT INTO role_permissions (role, permission_id, granted_by, is_active) 
SELECT 'teacher', id, 1, TRUE FROM permissions 
WHERE name IN (
    'read_students', 'update_students', 'read_teachers', 'update_teachers',
    'manage_classes', 'manage_subjects', 'manage_assignments', 'manage_exams',
    'view_student_reports', 'view_academic_reports', 'export_data'
);

-- Accountant permissions - financial access
INSERT INTO role_permissions (role, permission_id, granted_by, is_active) 
SELECT 'accountant', id, 1, TRUE FROM permissions 
WHERE name IN (
    'read_students', 'manage_fees', 'record_payments', 'view_reports',
    'view_financial_reports', 'view_student_reports', 'export_data',
    'manage_scholarships'
);

-- Parent permissions - limited access to their children
INSERT INTO role_permissions (role, permission_id, granted_by, is_active) 
SELECT 'parent', id, 1, TRUE FROM permissions 
WHERE name IN ('read_students', 'view_student_reports');

-- Insert comprehensive subject pool for all categories
INSERT INTO subjects (name, code, category, department, is_core) VALUES
-- Primary Subjects (Core)
('English Language', 'ENG001', 'Primary', 'Languages', TRUE),
('Mathematics', 'MATH001', 'Primary', 'Mathematics', TRUE),
('Basic Science', 'SCI001', 'Primary', 'Science', TRUE),
('Social Studies', 'SOC001', 'Primary', 'Social Sciences', TRUE),
('Christian Religious Studies', 'CRS001', 'Primary', 'Religious Studies', TRUE),
('Quantitative Reasoning', 'QR001', 'Primary', 'Mathematics', TRUE),
('Verbal Reasoning', 'VR001', 'Primary', 'Languages', TRUE),
('Home Economics', 'HEC001', 'Primary', 'Vocational', TRUE),
('Agricultural Science', 'AGR001', 'Primary', 'Science', TRUE),
('Physical and Health Education', 'PHE001', 'Primary', 'Physical Education', TRUE),
('Creative Arts', 'ART001', 'Primary', 'Arts', TRUE),
('Computer Studies', 'COMP001', 'Primary', 'ICT', TRUE),
('Civic Education', 'CIV001', 'Primary', 'Social Sciences', TRUE),
('French Language', 'FRE001', 'Primary', 'Languages', TRUE),
('Handwriting', 'HW001', 'Primary', 'Languages', TRUE),
('Phonics', 'PHO001', 'Primary', 'Languages', TRUE),
('Elementary Technology', 'TECH001', 'Primary', 'Science', TRUE),

-- Secondary Subjects (JSS)
('English Language', 'ENG002', 'JSS', 'Languages', TRUE),
('Mathematics', 'MATH002', 'JSS', 'Mathematics', TRUE),
('Basic Science', 'SCI002', 'JSS', 'Science', TRUE),
('Basic Technology', 'BTECH002', 'JSS', 'Technology', TRUE),
('Social Studies', 'SOC002', 'JSS', 'Social Sciences', TRUE),
('Christian Religious Studies', 'CRS002', 'JSS', 'Religious Studies', TRUE),
('Business Studies', 'BUS002', 'JSS', 'Business', TRUE),
('Home Economics', 'HEC002', 'JSS', 'Vocational', TRUE),
('Agricultural Science', 'AGR002', 'JSS', 'Science', TRUE),
('Physical and Health Education', 'PHE002', 'JSS', 'Physical Education', TRUE),
('Creative Arts', 'ART002', 'JSS', 'Arts', TRUE),
('Computer Studies', 'COMP002', 'JSS', 'ICT', TRUE),
('Civic Education', 'CIV002', 'JSS', 'Social Sciences', TRUE),
('French Language', 'FRE002', 'JSS', 'Languages', TRUE),
('Music', 'MUS002', 'JSS', 'Arts', TRUE),

-- Secondary Subjects (SS)
('English Language', 'ENG003', 'SS', 'Languages', TRUE),
('Mathematics', 'MATH003', 'SS', 'Mathematics', TRUE),
('Biology', 'BIO003', 'SS', 'Science', TRUE),
('Chemistry', 'CHEM003', 'SS', 'Science', TRUE),
('Physics', 'PHY003', 'SS', 'Science', TRUE),
('Economics', 'ECO003', 'SS', 'S0ocial Sciences', TRUE),
('Geography', 'GEO003', 'SS', 'Social Sciences', TRUE),
('History', 'HIST003', 'SS', 'Social Sciences', TRUE),
('Christian Religious Studies', 'CRS003', 'SS', 'Religious Studies', TRUE),
('Financial Accounting', 'ACC003', 'SS', 'Business', TRUE),
('Commerce', 'COM003', 'SS', 'Business', TRUE),
('Office Practice', 'OFF003', 'SS', 'Business', TRUE),
('Agricultural Science', 'AGR003', 'SS', 'Science', TRUE),
('Physical and Health Education', 'PHE003', 'SS', 'Physical Education', TRUE),
('Computer Studies', 'COMP003', 'SS', 'ICT', TRUE),
('Civic Education', 'CIV003', 'SS', 'Social Sciences', TRUE),
('French Language', 'FRE003', 'SS', 'Languages', TRUE),
('Literature in English', 'LIT003', 'SS', 'Languages', TRUE),
('Government', 'GOV003', 'SS', 'Social Sciences', TRUE),
('Further Mathematics', 'FMATH003', 'SS', 'Mathematics', FALSE),

-- General Subjects (All Categories)
('Guidance and Counselling', 'GC001', 'General', 'Student Services', FALSE),
('Library Studies', 'LIB001', 'General', 'Academic', FALSE),
('Entrepreneurship', 'ENT001', 'General', 'Business', FALSE),
('Environmental Science', 'ENV001', 'General', 'Science', FALSE),
('National Values', 'NV001', 'General', 'Social Sciences', FALSE),
('Security Education', 'SEC001', 'General', 'Social Sciences', FALSE);

-- Insert comprehensive class structure (9 Primary, 3 Secondary)
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data that depends on classes
DELETE FROM student_fee_balances;
DELETE FROM students;
DELETE FROM subject_registrations;
DELETE FROM classes;

SET FOREIGN_KEY_CHECKS = 1;

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

-- Register 14 subjects for each class (9 Primary + 3 Secondary = 12 classes × 14 subjects = 168 registrations)
INSERT INTO subject_registrations (subject_id, class_id, academic_year, term, is_compulsory, status)
SELECT 
    s.id as subject_id,
    c.id as class_id,
    '2024/2025' as academic_year,
    'First Term' as term,
    TRUE as is_compulsory,
    'Active' as status
FROM subjects s
CROSS JOIN classes c
WHERE s.id <= 14  -- Take first 14 subjects for each class
AND c.id <= 12;  -- For all 12 classes

-- =============================================
-- COMPREHENSIVE DATA SETUP
-- =============================================

-- Insert teachers with diverse specializations
INSERT INTO teachers (first_name, last_name, employee_id, email, phone, gender, qualification, specialization, status) VALUES
('John', 'Smith', 'TCH001', 'john.smith@graceland.edu.ng', '08012345678', 'Male', 'B.Ed Mathematics', '["Mathematics", "Further Mathematics"]', 'Active'),
('Mary', 'Johnson', 'TCH002', 'mary.johnson@graceland.edu.ng', '08023456789', 'Female', 'B.Sc English', '["English Language", "Literature in English"]', 'Active'),
('David', 'Wilson', 'TCH003', 'david.wilson@graceland.edu.ng', '08034567890', 'Male', 'B.Sc Biology', '["Biology", "Agricultural Science"]', 'Active'),
('Sarah', 'Brown', 'TCH004', 'sarah.brown@graceland.edu.ng', '08045678901', 'Female', 'B.Sc Chemistry', '["Chemistry", "Basic Science"]', 'Active'),
('Michael', 'Davis', 'TCH005', 'michael.davis@graceland.edu.ng', '08056789012', 'Male', 'B.Sc Physics', '["Physics", "Basic Technology"]', 'Active'),
('Grace', 'Miller', 'TCH006', 'grace.miller@graceland.edu.ng', '08067890123', 'Female', 'B.Ed Social Studies', '["Social Studies", "Civic Education"]', 'Active');

-- =============================================

-- Insert parents (correct table and columns)
INSERT INTO parents (first_name, last_name, email, phone, address, occupation, status) VALUES
('Ahmed', 'Bello', 'ahmed.bello@email.com', '09012345678', 'No. 1, Kano Road, Gombe', 'Businessman', 'Active'),
('Fatima', 'Mohammed', 'fatima.mohammed@email.com', '09023456789', 'No. 2, Bauchi Road, Gombe', 'Teacher', 'Active'),
('Ibrahim', 'Yusuf', 'ibrahim.yusuf@email.com', '09034567890', 'No. 3, Yola Road, Gombe', 'Civil Servant', 'Active'),
('Aisha', 'Abubakar', 'aisha.abubakar@email.com', '09045678901', 'No. 4, Maiduguri Road, Gombe', 'Nurse', 'Active'),
('Muhammad', 'Sani', 'muhammad.sani@email.com', '09056789012', 'No. 5, Jos Road, Gombe', 'Engineer', 'Active'),
('Mariam', 'Ibrahim', 'mariam.ibrahim@email.com', '09067890123', 'No. 6, Abuja Road, Gombe', 'Banker', 'Active'),
('Abdullahi', 'Umar', 'abdullahi.umar@email.com', '09078901234', 'No. 7, Lagos Road, Gombe', 'Lawyer', 'Active'),
('Khadija', 'Ali', 'khadija.ali@email.com', '09089012345', 'No. 8, Port Harcourt Road, Gombe', 'Doctor', 'Active'),
('Umar', 'Musa', 'umar.musa@email.com', '09090123456', 'No. 9, Katsina Road, Gombe', 'Farmer', 'Active'),
('Zainab', 'Abdullahi', 'zainab.abdullahi@email.com', '09101234567', 'No. 10, Sokoto Road, Gombe', 'Pharmacist', 'Active'),
('Suleiman', 'Ahmed', 'suleiman.ahmed@email.com', '09112345678', 'No. 11, Ilorin Road, Gombe', 'Accountant', 'Active'),
('Amina', 'Yusuf', 'amina.yusuf@email.com', '09123456789', 'No. 12, Benin Road, Gombe', 'Journalist', 'Active');

-- Insert accountants
INSERT INTO accountants (first_name, last_name, employee_id, email, phone, department, status) VALUES
('Peter', 'Okonkwo', 'ACC001', 'peter.okonkwo@graceland.edu.ng', '08011223344', 'Finance', 'Active'),
('Joy', 'Eze', 'ACC002', 'joy.eze@graceland.edu.ng', '08022334455', 'Accounts', 'Active'),
('Samuel', 'Okafor', 'ACC003', 'samuel.okafor@graceland.edu.ng', '08033445566', 'Bursary', 'Active');

-- Register 14 subjects for each class
INSERT INTO subject_registrations (subject_id, class_id, academic_year, term, is_compulsory, status)
SELECT 
    s.id as subject_id,
    c.id as class_id,
    '2024/2025' as academic_year,
    'First Term' as term,
    TRUE as is_compulsory,
    'Active' as status
FROM subjects s
CROSS JOIN classes c
WHERE (
    (c.category = 'Primary' AND s.category = 'Primary' AND s.id BETWEEN 1 AND 14) OR
    (c.category = 'Secondary' AND s.category IN ('JSS', 'SS') AND s.id BETWEEN 18 AND 31)
)
ORDER BY c.id, s.id;

-- Assign class teachers (1 teacher per class max)
UPDATE classes SET class_teacher_id = 1, class_teacher = 'John Smith' WHERE id = 1;
UPDATE classes SET class_teacher_id = 2, class_teacher = 'Mary Johnson' WHERE id = 2;
UPDATE classes SET class_teacher_id = 3, class_teacher = 'David Wilson' WHERE id = 3;
UPDATE classes SET class_teacher_id = 4, class_teacher = 'Sarah Brown' WHERE id = 4;
UPDATE classes SET class_teacher_id = 5, class_teacher = 'Michael Davis' WHERE id = 5;
UPDATE classes SET class_teacher_id = 6, class_teacher = 'Grace Miller' WHERE id = 6;
UPDATE classes SET class_teacher_id = 7, class_teacher = 'James Garcia' WHERE id = 7;
UPDATE classes SET class_teacher_id = 8, class_teacher = 'Patricia Martinez' WHERE id = 8;
UPDATE classes SET class_teacher_id = 9, class_teacher = 'Robert Anderson' WHERE id = 9;
UPDATE classes SET class_teacher_id = 10, class_teacher = 'Linda Taylor' WHERE id = 10;
UPDATE classes SET class_teacher_id = 11, class_teacher = 'William Thomas' WHERE id = 11;
UPDATE classes SET class_teacher_id = 12, class_teacher = 'Jennifer Jackson' WHERE id = 12;

-- Update teachers to mark them as class teachers
UPDATE teachers SET is_class_teacher = TRUE WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);

-- Randomly assign subjects to teachers (each teacher can teach multiple subjects in multiple classes)
INSERT INTO subject_assignments (subject_id, class_id, teacher_id, academic_year, term, status)
SELECT DISTINCT
    sr.subject_id,
    sr.class_id,
    CASE FLOOR(RAND() * 15) + 1
        WHEN 1 THEN 1 WHEN 2 THEN 2 WHEN 3 THEN 3 WHEN 4 THEN 4 WHEN 5 THEN 5
        WHEN 6 THEN 6 WHEN 7 THEN 7 WHEN 8 THEN 8 WHEN 9 THEN 9 WHEN 10 THEN 10
        WHEN 11 THEN 11 WHEN 12 THEN 12 WHEN 13 THEN 13 WHEN 14 THEN 14 WHEN 15 THEN 15
        ELSE 1
    END as teacher_id,
    '2024/2025' as academic_year,
    'First Term' as term,
    'Active' as status
FROM subject_registrations sr
WHERE sr.academic_year = '2024/2025' AND sr.term = 'First Term';

-- Create user accounts for teachers (default password: teacher123)
INSERT INTO users (username, password_hash, role, linked_id, email, status) VALUES
('john.smith', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 1, 'john.smith@graceland.edu.ng', 'Active'),
('mary.johnson', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 2, 'mary.johnson@graceland.edu.ng', 'Active'),
('david.wilson', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 3, 'david.wilson@graceland.edu.ng', 'Active'),
('sarah.brown', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 4, 'sarah.brown@graceland.edu.ng', 'Active'),
('michael.davis', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 5, 'michael.davis@graceland.edu.ng', 'Active'),
('grace.miller', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 6, 'grace.miller@graceland.edu.ng', 'Active'),
('james.garcia', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 7, 'james.garcia@graceland.edu.ng', 'Active'),
('patricia.martinez', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 8, 'patricia.martinez@graceland.edu.ng', 'Active'),
('robert.anderson', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 9, 'robert.anderson@graceland.edu.ng', 'Active'),
('linda.taylor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 10, 'linda.taylor@graceland.edu.ng', 'Active'),
('william.thomas', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 11, 'william.thomas@graceland.edu.ng', 'Active'),
('jennifer.jackson', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 12, 'jennifer.jackson@graceland.edu.ng', 'Active'),
('richard.white', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 13, 'richard.white@graceland.edu.ng', 'Active'),
('nancy.harris', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 14, 'nancy.harris@graceland.edu.ng', 'Active'),
('charles.clark', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 15, 'charles.clark@graceland.edu.ng', 'Active');

-- Create user accounts for parents (default password: parent123)
INSERT INTO users (username, password_hash, role, linked_id, email, status) VALUES
('ahmed.bello', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'parent', 1, 'ahmed.bello@email.com', 'Active'),
('fatima.mohammed', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'parent', 2, 'fatima.mohammed@email.com', 'Active'),
('ibrahim.yusuf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'parent', 3, 'ibrahim.yusuf@email.com', 'Active'),
('aisha.abubakar', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'parent', 4, 'aisha.abubakar@email.com', 'Active'),
('muhammad.sani', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'parent', 5, 'muhammad.sani@email.com', 'Active'),
('mariam.ibrahim', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'parent', 6, 'mariam.ibrahim@email.com', 'Active'),
('abdullahi.um', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'parent', 7, 'abdullahi.umar@email.com', 'Active'),
('khadija.ali', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'parent', 8, 'khadija.ali@email.com', 'Active'),
('umar.musa', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'parent', 9, 'umar.musa@email.com', 'Active'),
('zainab.abdullahi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'parent', 10, 'zainab.abdullahi@email.com', 'Active'),
('suleiman.ahmed', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'parent', 11, 'suleiman.ahmed@email.com', 'Active'),
('amina.yusuf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'parent', 12, 'amina.yusuf@email.com', 'Active');

-- Create user accounts for accountants (default password: accountant123)
INSERT INTO users (username, password_hash, role, linked_id, email, status) VALUES
('peter.okonkwo', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'accountant', 1, 'peter.okonkwo@graceland.edu.ng', 'Active'),
('joy.eze', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'accountant', 2, 'joy.eze@graceland.edu.ng', 'Active'),
('samuel.okafor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'accountant', 3, 'samuel.okafor@graceland.edu.ng', 'Active');

-- Insert 30+ unique students per class (360+ total students)
-- Each student is unique to one class only
-- Updated for 9 Primary + 3 Secondary structure
INSERT INTO students (first_name, last_name, other_name, class_id, level, parent_id, date_of_birth, gender, status, academic_year, admission_date) VALUES
-- Primary 1A (Class 1) - 32 students
('Ahmed', 'Bello', 'Muhammad', 1, 'Primary 1', 1, '2018-03-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Mohammed', 'Ibrahim', 1, 'Primary 1', 2, '2018-06-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Yusuf', 'Abdullahi', 1, 'Primary 1', 3, '2018-01-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Abubakar', 'Suleiman', 1, 'Primary 1', 4, '2018-08-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Sani', 'Umar', 1, 'Primary 1', 5, '2018-04-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ibrahim', 'Yusuf', 1, 'Primary 1', 6, '2018-07-18', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Umar', 'Musa', 1, 'Primary 1', 7, '2018-02-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Ali', 'Bello', 1, 'Primary 1', 8, '2018-09-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Musa', 'Ahmed', 1, 'Primary 1', 9, '2018-05-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Abdullahi', 'Ibrahim', 1, 'Primary 1', 10, '2018-11-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Suleiman', 'Ahmed', 'Yusuf', 1, 'Primary 1', 11, '2018-03-08', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Yusuf', 'Mohammed', 1, 'Primary 1', 12, '2018-12-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Sani', 'Umar', 1, 'Primary 1', 1, '2018-08-17', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Halima', 'Ibrahim', 'Ali', 1, 'Primary 1', 2, '2018-02-23', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Yusuf', 'Mohammed', 'Bello', 1, 'Primary 1', 3, '2018-10-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Umar', 'Sani', 1, 'Primary 1', 4, '2018-04-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ali', 'Ahmed', 1, 'Primary 1', 5, '2018-07-19', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Yusuf', 'Abdullahi', 1, 'Primary 1', 6, '2018-01-26', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Bello', 'Musa', 1, 'Primary 1', 7, '2018-09-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Sani', 'Umar', 1, 'Primary 1', 8, '2018-05-08', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Mohammed', 'Yusuf', 1, 'Primary 1', 9, '2018-11-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Ahmed', 'Ibrahim', 1, 'Primary 1', 10, '2018-06-22', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Ali', 1, 'Primary 1', 11, '2018-03-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Bello', 'Sani', 1, 'Primary 1', 12, '2018-12-11', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Suleiman', 'Ahmed', 1, 'Primary 1', 1, '2018-08-03', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Ali', 'Yusuf', 1, 'Primary 1', 2, '2018-04-17', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Umar', 'Mohammed', 1, 'Primary 1', 3, '2018-10-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Sani', 'Bello', 1, 'Primary 1', 4, '2018-02-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Yusuf', 'Ibrahim', 1, 'Primary 1', 5, '2018-07-31', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Umar', 1, 'Primary 1', 6, '2018-05-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Bello', 'Ali', 1, 'Primary 1', 7, '2018-11-27', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Mohammed', 'Sani', 1, 'Primary 1', 8, '2018-03-20', 'Female', 'Active', '2024/2025', '2024-09-15'),

-- Primary 1 (Class 2) - 32 students
('Ahmed', 'Mohammed', 'Bello', 2, 'Primary 1', 9, '2018-06-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Ibrahim', 'Yusuf', 2, 'Primary 1', 10, '2018-09-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Sani', 'Umar', 2, 'Primary 1', 11, '2018-02-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Ali', 'Mohammed', 2, 'Primary 1', 12, '2018-11-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Yusuf', 'Ahmed', 2, 'Primary 1', 1, '2018-04-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Bello', 'Sani', 2, 'Primary 1', 2, '2018-07-18', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Ahmed', 'Ibrahim', 2, 'Primary 1', 3, '2018-01-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Umar', 'Musa', 2, 'Primary 1', 4, '2018-10-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Ali', 'Bello', 2, 'Primary 1', 5, '2018-05-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Sani', 'Yusuf', 2, 'Primary 1', 6, '2018-12-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Suleiman', 'Mohammed', 'Umar', 2, 'Primary 1', 7, '2018-03-08', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Ahmed', 'Ali', 2, 'Primary 1', 8, '2018-08-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Bello', 'Sani', 2, 'Primary 1', 9, '2018-06-17', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Halima', 'Yusuf', 'Ibrahim', 2, 'Primary 1', 10, '2018-02-23', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Yusuf', 'Ali', 'Mohammed', 2, 'Primary 1', 11, '2018-11-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Ahmed', 'Umar', 2, 'Primary 1', 12, '2018-04-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Sani', 'Bello', 2, 'Primary 1', 1, '2018-09-19', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Umar', 'Yusuf', 2, 'Primary 1', 2, '2018-01-26', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Mohammed', 'Musa', 2, 'Primary 1', 3, '2018-07-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ali', 'Umar', 2, 'Primary 1', 4, '2018-05-08', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Yusuf', 'Ahmed', 2, 'Primary 1', 5, '2018-12-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Bello', 'Sani', 2, 'Primary 1', 6, '2018-03-22', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Ibrahim', 'Ali', 2, 'Primary 1', 7, '2018-10-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Mohammed', 'Yusuf', 2, 'Primary 1', 8, '2018-06-11', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ahmed', 'Bello', 2, 'Primary 1', 9, '2018-02-03', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Sani', 'Ali', 2, 'Primary 1', 10, '2018-08-17', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Umar', 'Mohammed', 2, 'Primary 1', 11, '2018-04-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Bello', 'Yusuf', 2, 'Primary 1', 12, '2018-11-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Ali', 'Sani', 2, 'Primary 1', 1, '2018-07-31', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Yusuf', 'Ibrahim', 2, 'Primary 1', 2, '2018-05-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Mohammed', 'Ahmed', 2, 'Primary 1', 3, '2018-12-27', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Ali', 'Bello', 2, 'Primary 1', 4, '2018-03-20', 'Female', 'Active', '2024/2025', '2024-09-15'),

-- Primary 2 (Class 3) - 31 students
('Muhammad', 'Sani', 'Umar', 3, 'Primary 2', 5, '2017-04-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ibrahim', 'Yusuf', 3, 'Primary 2', 6, '2017-07-18', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Umar', 'Musa', 3, 'Primary 2', 7, '2017-02-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Ali', 'Bello', 3, 'Primary 2', 8, '2017-09-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Musa', 'Ahmed', 3, 'Primary 2', 9, '2017-05-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Abdullahi', 'Ibrahim', 3, 'Primary 2', 10, '2017-11-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Suleiman', 'Ahmed', 'Yusuf', 3, 'Primary 2', 11, '2017-03-08', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Yusuf', 'Mohammed', 3, 'Primary 2', 12, '2017-12-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Sani', 'Umar', 3, 'Primary 2', 1, '2017-08-17', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Halima', 'Ibrahim', 'Ali', 3, 'Primary 2', 2, '2017-02-23', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Yusuf', 'Mohammed', 'Bello', 3, 'Primary 2', 3, '2017-10-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Umar', 'Sani', 3, 'Primary 2', 4, '2017-04-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ali', 'Ahmed', 3, 'Primary 2', 5, '2017-07-19', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Yusuf', 'Abdullahi', 3, 'Primary 2', 6, '2017-01-26', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Bello', 'Musa', 3, 'Primary 2', 7, '2017-09-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Sani', 'Umar', 3, 'Primary 2', 8, '2017-05-08', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Mohammed', 'Yusuf', 3, 'Primary 2', 9, '2017-11-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Ahmed', 'Ibrahim', 3, 'Primary 2', 10, '2017-06-22', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Ali', 3, 'Primary 2', 11, '2017-03-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Bello', 'Sani', 3, 'Primary 2', 12, '2017-12-11', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Suleiman', 'Ahmed', 3, 'Primary 2', 1, '2017-08-03', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Ali', 'Yusuf', 3, 'Primary 2', 2, '2017-04-17', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Umar', 'Mohammed', 3, 'Primary 2', 3, '2017-10-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Sani', 'Bello', 3, 'Primary 2', 4, '2017-02-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Yusuf', 'Ibrahim', 3, 'Primary 2', 5, '2017-07-31', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Umar', 3, 'Primary 2', 6, '2017-05-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Bello', 'Ali', 3, 'Primary 2', 7, '2017-11-27', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Mohammed', 'Sani', 3, 'Primary 2', 8, '2017-03-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ahmed', 'Ibrahim', 'Yusuf', 3, 'Primary 2', 9, '2017-09-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Mohammed', 'Ali', 3, 'Primary 2', 10, '2017-06-20', 'Female', 'Active', '2024/2025', '2024-09-15'),

-- Primary 2 (Class 4) - 31 students
('Ibrahim', 'Yusuf', 'Abdullahi', 4, 'Primary 2', 11, '2017-01-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Abubakar', 'Suleiman', 4, 'Primary 2', 12, '2017-08-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ali', 'Bello', 4, 'Primary 2', 1, '2017-04-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Yusuf', 4, 'Primary 2', 2, '2017-07-18', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Sani', 'Umar', 4, 'Primary 2', 3, '2017-02-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Bello', 'Ali', 4, 'Primary 2', 4, '2017-09-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Musa', 4, 'Primary 2', 5, '2017-05-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Ibrahim', 'Ahmed', 4, 'Primary 2', 6, '2017-11-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Suleiman', 'Umar', 'Yusuf', 4, 'Primary 2', 7, '2017-03-08', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Mohammed', 'Sani', 4, 'Primary 2', 8, '2017-12-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Ahmed', 'Umar', 4, 'Primary 2', 9, '2017-08-17', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Halima', 'Yusuf', 'Ibrahim', 4, 'Primary 2', 10, '2017-02-23', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Yusuf', 'Ali', 'Mohammed', 4, 'Primary 2', 11, '2017-10-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Bello', 'Sani', 4, 'Primary 2', 12, '2017-04-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Umar', 'Ahmed', 4, 'Primary 2', 1, '2017-07-19', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Ibrahim', 'Abdullahi', 4, 'Primary 2', 2, '2017-01-26', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Sani', 'Musa', 4, 'Primary 2', 3, '2017-09-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Yusuf', 'Umar', 4, 'Primary 2', 4, '2017-05-08', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Bello', 'Yusuf', 4, 'Primary 2', 5, '2017-11-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Mohammed', 'Ibrahim', 4, 'Primary 2', 6, '2017-06-22', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Ahmed', 'Ali', 4, 'Primary 2', 7, '2017-03-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Yusuf', 'Bello', 4, 'Primary 2', 8, '2017-12-11', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Bello', 'Sani', 4, 'Primary 2', 9, '2017-08-03', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Umar', 'Ali', 4, 'Primary 2', 10, '2017-04-17', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Mohammed', 'Yusuf', 4, 'Primary 2', 11, '2017-10-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Ali', 'Bello', 4, 'Primary 2', 12, '2017-02-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Sani', 'Ibrahim', 4, 'Primary 2', 1, '2017-07-31', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Yusuf', 'Umar', 4, 'Primary 2', 2, '2017-05-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Ibrahim', 'Ali', 4, 'Primary 2', 3, '2017-11-27', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Ahmed', 'Mohammed', 4, 'Primary 2', 4, '2017-03-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ahmed', 'Yusuf', 'Bello', 4, 'Primary 2', 5, '2017-09-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Sani', 'Ali', 4, 'Primary 2', 6, '2017-06-20', 'Female', 'Active', '2024/2025', '2024-09-15'),

-- Primary 3 (Class 5) - 30 students
('Umar', 'Musa', 'Ahmed', 5, 'Primary 3', 9, '2016-05-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Abdullahi', 'Ibrahim', 5, 'Primary 3', 10, '2016-11-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Suleiman', 'Ahmed', 'Yusuf', 5, 'Primary 3', 11, '2016-03-08', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Yusuf', 'Mohammed', 5, 'Primary 3', 12, '2016-12-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Sani', 'Umar', 5, 'Primary 3', 1, '2016-08-17', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Halima', 'Ibrahim', 'Ali', 5, 'Primary 3', 2, '2016-02-23', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Yusuf', 'Mohammed', 'Bello', 5, 'Primary 3', 3, '2016-10-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Umar', 'Sani', 5, 'Primary 3', 4, '2016-04-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ali', 'Ahmed', 5, 'Primary 3', 5, '2016-07-19', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Yusuf', 'Abdullahi', 5, 'Primary 3', 6, '2016-01-26', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Bello', 'Musa', 5, 'Primary 3', 7, '2016-09-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Sani', 'Umar', 5, 'Primary 3', 8, '2016-05-08', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Mohammed', 'Yusuf', 5, 'Primary 3', 9, '2016-11-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Ahmed', 'Ibrahim', 5, 'Primary 3', 10, '2016-06-22', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Ali', 5, 'Primary 3', 11, '2016-03-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Bello', 'Sani', 5, 'Primary 3', 12, '2016-12-11', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Suleiman', 'Ahmed', 5, 'Primary 3', 1, '2016-08-03', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Ali', 'Yusuf', 5, 'Primary 3', 2, '2016-04-17', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Umar', 'Mohammed', 5, 'Primary 3', 3, '2016-10-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Sani', 'Bello', 5, 'Primary 3', 4, '2016-02-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Yusuf', 'Ibrahim', 5, 'Primary 3', 5, '2016-07-31', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Umar', 5, 'Primary 3', 6, '2016-05-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Bello', 'Ali', 5, 'Primary 3', 7, '2016-11-27', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Mohammed', 'Sani', 5, 'Primary 3', 8, '2016-03-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ahmed', 'Ibrahim', 'Yusuf', 5, 'Primary 3', 9, '2016-09-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Mohammed', 'Ali', 5, 'Primary 3', 10, '2016-06-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Yusuf', 'Abdullahi', 5, 'Primary 3', 11, '2016-01-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Abubakar', 'Suleiman', 5, 'Primary 3', 12, '2016-08-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Ibrahim', 'Musa', 5, 'Primary 3', 1, '2016-04-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Yusuf', 'Ali', 5, 'Primary 3', 2, '2016-07-18', 'Female', 'Active', '2024/2025', '2024-09-15'),

-- Primary 3 (Class 6) - 30 students
('Muhammad', 'Ali', 'Bello', 6, 'Primary 3', 1, '2016-04-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Yusuf', 6, 'Primary 3', 2, '2016-07-18', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Sani', 'Umar', 6, 'Primary 3', 3, '2016-02-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Bello', 'Ali', 6, 'Primary 3', 4, '2016-09-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Musa', 6, 'Primary 3', 5, '2016-05-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Ibrahim', 'Ahmed', 6, 'Primary 3', 6, '2016-11-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Suleiman', 'Umar', 'Yusuf', 6, 'Primary 3', 7, '2016-03-08', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Mohammed', 'Sani', 6, 'Primary 3', 8, '2016-12-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Ahmed', 'Umar', 6, 'Primary 3', 9, '2016-08-17', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Halima', 'Yusuf', 'Ibrahim', 6, 'Primary 3', 10, '2016-02-23', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Yusuf', 'Ali', 'Mohammed', 6, 'Primary 3', 11, '2016-10-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Bello', 'Sani', 6, 'Primary 3', 12, '2016-04-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Umar', 'Ahmed', 6, 'Primary 3', 1, '2016-07-19', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Ibrahim', 'Abdullahi', 6, 'Primary 3', 2, '2016-01-26', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Sani', 'Musa', 6, 'Primary 3', 3, '2016-09-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Yusuf', 'Umar', 6, 'Primary 3', 4, '2016-05-08', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Bello', 'Yusuf', 6, 'Primary 3', 5, '2016-11-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Mohammed', 'Ibrahim', 6, 'Primary 3', 6, '2016-06-22', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Ahmed', 'Ali', 6, 'Primary 3', 7, '2016-03-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Yusuf', 'Bello', 6, 'Primary 3', 8, '2016-12-11', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Bello', 'Sani', 6, 'Primary 3', 9, '2016-08-03', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Umar', 'Ali', 6, 'Primary 3', 10, '2016-04-17', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Mohammed', 'Yusuf', 6, 'Primary 3', 11, '2016-10-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Ali', 'Bello', 6, 'Primary 3', 12, '2016-02-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Sani', 'Ibrahim', 6, 'Primary 3', 1, '2016-07-31', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Yusuf', 'Umar', 6, 'Primary 3', 2, '2016-05-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Ibrahim', 'Ali', 6, 'Primary 3', 3, '2016-11-27', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Ahmed', 'Mohammed', 6, 'Primary 3', 4, '2016-03-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ahmed', 'Yusuf', 'Bello', 6, 'Primary 3', 5, '2016-09-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Sani', 'Ali', 6, 'Primary 3', 6, '2016-06-20', 'Female', 'Active', '2024/2025', '2024-09-15'),

-- Primary 3 (Class 7) - 30 students
('Abubakar', 'Sani', 'Umar', 7, 'Primary 3', 1, '2015-08-17', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Halima', 'Ibrahim', 'Ali', 7, 'Primary 3', 2, '2015-02-23', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Yusuf', 'Mohammed', 'Bello', 7, 'Primary 3', 3, '2015-10-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Umar', 'Sani', 7, 'Primary 3', 4, '2015-04-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ali', 'Ahmed', 7, 'Primary 3', 5, '2015-07-19', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Yusuf', 'Abdullahi', 7, 'Primary 3', 6, '2015-01-26', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Bello', 'Musa', 7, 'Primary 3', 7, '2015-09-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Sani', 'Umar', 7, 'Primary 3', 8, '2015-05-08', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Mohammed', 'Yusuf', 7, 'Primary 3', 9, '2015-11-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Ahmed', 'Ibrahim', 7, 'Primary 3', 10, '2015-06-22', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Ali', 7, 'Primary 3', 11, '2015-03-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Bello', 'Sani', 7, 'Primary 4', 12, '2015-12-11', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Suleiman', 'Ahmed', 7, 'Primary 4', 1, '2015-08-03', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Ali', 'Yusuf', 7, 'Primary 4', 2, '2015-04-17', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Umar', 'Mohammed', 7, 'Primary 4', 3, '2015-10-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Sani', 'Bello', 7, 'Primary 4', 4, '2015-02-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Yusuf', 'Ibrahim', 7, 'Primary 4', 5, '2015-07-31', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Umar', 7, 'Primary 4', 6, '2015-05-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Bello', 'Ali', 7, 'Primary 4', 7, '2015-11-27', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Mohammed', 'Sani', 7, 'Primary 4', 8, '2015-03-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ahmed', 'Ibrahim', 'Yusuf', 7, 'Primary 4', 9, '2015-09-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Mohammed', 'Ali', 7, 'Primary 4', 10, '2015-06-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Yusuf', 'Abdullahi', 7, 'Primary 4', 11, '2015-01-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Abubakar', 'Suleiman', 7, 'Primary 4', 12, '2015-08-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ali', 'Bello', 7, 'Primary 4', 1, '2015-04-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Yusuf', 7, 'Primary 4', 2, '2015-07-18', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Sani', 'Umar', 7, 'Primary 4', 3, '2015-02-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Bello', 'Ali', 7, 'Primary 4', 4, '2015-09-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Musa', 7, 'Primary 4', 5, '2015-05-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Ibrahim', 'Ahmed', 7, 'Primary 4', 6, '2015-11-30', 'Female', 'Active', '2024/2025', '2024-09-15'),

-- Primary 4 (Class 8) - 29 students
('Suleiman', 'Ahmed', 'Yusuf', 8, 'Primary 4', 7, '2015-03-08', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Yusuf', 'Mohammed', 8, 'Primary 4', 8, '2015-12-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Sani', 'Umar', 8, 'Primary 4', 9, '2015-08-17', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Halima', 'Ibrahim', 'Ali', 8, 'Primary 4', 10, '2015-02-23', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Yusuf', 'Mohammed', 'Bello', 8, 'Primary 4', 11, '2015-10-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Umar', 'Sani', 8, 'Primary 4', 12, '2015-04-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ali', 'Ahmed', 8, 'Primary 4', 1, '2015-07-19', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Yusuf', 'Abdullahi', 8, 'Primary 4', 2, '2015-01-26', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Bello', 'Musa', 8, 'Primary 4', 3, '2015-09-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Sani', 'Umar', 8, 'Primary 4', 4, '2015-05-08', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Mohammed', 'Yusuf', 8, 'Primary 4', 5, '2015-11-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Ahmed', 'Ibrahim', 8, 'Primary 4', 6, '2015-06-22', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Ali', 8, 'Primary 4', 7, '2015-03-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Bello', 'Sani', 8, 'Primary 4', 8, '2015-12-11', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Suleiman', 'Ahmed', 8, 'Primary 4', 9, '2015-08-03', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Ali', 'Yusuf', 8, 'Primary 4', 10, '2015-04-17', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Umar', 'Mohammed', 8, 'Primary 4', 11, '2015-10-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Sani', 'Bello', 8, 'Primary 4', 12, '2015-02-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Yusuf', 'Ibrahim', 8, 'Primary 4', 1, '2015-07-31', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Umar', 8, 'Primary 4', 2, '2015-05-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Bello', 'Ali', 8, 'Primary 4', 3, '2015-11-27', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Mohammed', 'Sani', 8, 'Primary 4', 4, '2015-03-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ahmed', 'Ibrahim', 'Yusuf', 8, 'Primary 4', 5, '2015-09-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Mohammed', 'Ali', 8, 'Primary 4', 6, '2015-06-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Yusuf', 'Abdullahi', 8, 'Primary 4', 7, '2015-01-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Abubakar', 'Suleiman', 8, 'Primary 4', 8, '2015-08-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ali', 'Bello', 8, 'Primary 4', 9, '2015-04-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Yusuf', 8, 'Primary 4', 10, '2015-07-18', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Sani', 'Umar', 8, 'Primary 4', 11, '2015-02-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Bello', 'Ali', 8, 'Primary 4', 12, '2015-09-05', 'Female', 'Active', '2024/2025', '2024-09-15'),

-- Primary 5 (Class 9) - 28 students
('Muhammad', 'Ali', 'Ahmed', 9, 'Primary 5', 5, '2014-07-19', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Yusuf', 'Abdullahi', 9, 'Primary 5', 6, '2014-01-26', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Bello', 'Musa', 9, 'Primary 5', 7, '2014-09-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Sani', 'Umar', 9, 'Primary 5', 8, '2014-05-08', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Mohammed', 'Yusuf', 9, 'Primary 5', 9, '2014-11-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Ahmed', 'Ibrahim', 9, 'Primary 5', 10, '2014-06-22', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Ali', 9, 'Primary 5', 11, '2014-03-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Bello', 'Sani', 9, 'Primary 5', 12, '2014-12-11', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Suleiman', 'Ahmed', 9, 'Primary 5', 1, '2014-08-03', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Ali', 'Yusuf', 9, 'Primary 5', 2, '2014-04-17', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Umar', 'Mohammed', 9, 'Primary 5', 3, '2014-10-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Sani', 'Bello', 9, 'Primary 5', 4, '2014-02-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Yusuf', 'Ibrahim', 9, 'Primary 5', 5, '2014-07-31', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Umar', 9, 'Primary 5', 6, '2014-05-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Bello', 'Ali', 9, 'Primary 5', 7, '2014-11-27', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Mohammed', 'Sani', 9, 'Primary 5', 8, '2014-03-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ahmed', 'Ibrahim', 'Yusuf', 9, 'Primary 5', 9, '2014-09-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Mohammed', 'Ali', 9, 'Primary 5', 10, '2014-06-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Yusuf', 'Abdullahi', 9, 'Primary 5', 11, '2014-01-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Abubakar', 'Suleiman', 9, 'Primary 5', 12, '2014-08-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ali', 'Bello', 9, 'Primary 5', 1, '2014-04-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Yusuf', 9, 'Primary 5', 2, '2014-07-18', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Sani', 'Umar', 9, 'Primary 5', 3, '2014-02-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Bello', 'Ali', 9, 'Primary 5', 4, '2014-09-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Musa', 9, 'Primary 5', 5, '2014-05-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Ibrahim', 'Ahmed', 9, 'Primary 5', 6, '2014-11-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Suleiman', 'Ahmed', 'Yusuf', 9, 'Primary 5', 7, '2014-03-08', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Yusuf', 'Mohammed', 9, 'Primary 5', 8, '2014-12-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Ibrahim', 'Musa', 9, 'Primary 5', 1, '2014-08-17', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Halima', 'Yusuf', 'Ali', 9, 'Primary 5', 2, '2014-02-23', 'Female', 'Active', '2024/2025', '2024-09-15'),

-- Primary 6 (Class 10) - 28 students
('Ibrahim', 'Bello', 'Musa', 10, 'JSS 1', 7, '2013-09-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Sani', 'Umar', 10, 'JSS 1', 8, '2013-05-08', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Mohammed', 'Yusuf', 10, 'JSS 1', 9, '2013-11-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Ahmed', 'Ibrahim', 10, 'JSS 1', 10, '2013-06-22', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Ali', 10, 'JSS 1', 11, '2013-03-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Bello', 'Sani', 10, 'JSS 1', 12, '2013-12-11', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Suleiman', 'Ahmed', 10, 'JSS 1', 1, '2013-08-03', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Ali', 'Yusuf', 10, 'JSS 1', 2, '2013-04-17', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Umar', 'Mohammed', 10, 'JSS 1', 3, '2013-10-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Sani', 'Bello', 10, 'JSS 1', 4, '2013-02-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Yusuf', 'Ibrahim', 10, 'JSS 1', 5, '2013-07-31', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Umar', 10, 'JSS 1', 6, '2013-05-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Bello', 'Ali', 10, 'JSS 1', 7, '2013-11-27', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Mohammed', 'Sani', 10, 'JSS 1', 8, '2013-03-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ahmed', 'Ibrahim', 'Yusuf', 10, 'JSS 1', 9, '2013-09-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Mohammed', 'Ali', 10, 'JSS 1', 10, '2013-06-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Yusuf', 'Abdullahi', 10, 'JSS 1', 11, '2013-01-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Abubakar', 'Suleiman', 10, 'JSS 1', 12, '2013-08-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ali', 'Bello', 10, 'JSS 1', 1, '2013-04-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Yusuf', 10, 'JSS 1', 2, '2013-07-18', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Sani', 'Umar', 10, 'JSS 1', 3, '2013-02-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Bello', 'Ali', 10, 'JSS 1', 4, '2013-09-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Musa', 10, 'JSS 1', 5, '2013-05-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Ibrahim', 'Ahmed', 10, 'JSS 1', 6, '2013-11-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Suleiman', 'Ahmed', 'Yusuf', 10, 'JSS 1', 7, '2013-03-08', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Yusuf', 'Mohammed', 10, 'JSS 1', 8, '2013-12-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Sani', 'Umar', 10, 'JSS 1', 9, '2013-08-17', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Halima', 'Ibrahim', 'Ali', 10, 'JSS 1', 10, '2013-02-23', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Yusuf', 'Mohammed', 'Bello', 10, 'JSS 1', 11, '2013-10-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Umar', 'Sani', 10, 'JSS 1', 12, '2013-04-05', 'Female', 'Active', '2024/2025', '2024-09-15'),

-- JSS 2 (Class 11) - 27 students
('Abdullahi', 'Mohammed', 'Yusuf', 11, 'JSS 2', 9, '2012-11-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Ahmed', 'Ibrahim', 11, 'JSS 2', 10, '2012-06-22', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Ali', 11, 'JSS 2', 11, '2012-03-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Bello', 'Sani', 11, 'JSS 2', 12, '2012-12-11', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Suleiman', 'Ahmed', 11, 'JSS 2', 1, '2012-08-03', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Ali', 'Yusuf', 11, 'JSS 2', 2, '2012-04-17', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Umar', 'Mohammed', 11, 'JSS 2', 3, '2012-10-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Sani', 'Bello', 11, 'JSS 2', 4, '2012-02-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Yusuf', 'Ibrahim', 11, 'JSS 2', 5, '2012-07-31', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Umar', 11, 'JSS 2', 6, '2012-05-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Bello', 'Ali', 11, 'JSS 2', 7, '2012-11-27', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Mohammed', 'Sani', 11, 'JSS 2', 8, '2012-03-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ahmed', 'Ibrahim', 'Yusuf', 11, 'JSS 2', 9, '2012-09-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Mohammed', 'Ali', 11, 'JSS 2', 10, '2012-06-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Yusuf', 'Abdullahi', 11, 'JSS 2', 11, '2012-01-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Abubakar', 'Suleiman', 11, 'JSS 2', 12, '2012-08-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ali', 'Bello', 11, 'JSS 2', 1, '2012-04-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Yusuf', 11, 'JSS 2', 2, '2012-07-18', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Sani', 'Umar', 11, 'JSS 2', 3, '2012-02-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Bello', 'Ali', 11, 'JSS 2', 4, '2012-09-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Musa', 11, 'JSS 2', 5, '2012-05-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Ibrahim', 'Ahmed', 11, 'JSS 2', 6, '2012-11-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Suleiman', 'Ahmed', 'Yusuf', 11, 'JSS 2', 7, '2012-03-08', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Yusuf', 'Mohammed', 11, 'JSS 2', 8, '2012-12-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Sani', 'Umar', 11, 'JSS 2', 9, '2012-08-17', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Halima', 'Ibrahim', 'Ali', 11, 'JSS 2', 10, '2012-02-23', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Yusuf', 'Mohammed', 'Bello', 11, 'JSS 2', 11, '2012-10-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Umar', 'Sani', 11, 'JSS 2', 12, '2012-04-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Ibrahim', 'Musa', 11, 'JSS 2', 1, '2012-08-17', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Halima', 'Yusuf', 'Ali', 11, 'JSS 2', 2, '2012-02-23', 'Female', 'Active', '2024/2025', '2024-09-15'),

-- JSS 3 (Class 12) - 27 students
('Umar', 'Yusuf', 'Ali', 12, 'SS 1', 11, '2011-03-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Bello', 'Sani', 12, 'SS 1', 12, '2011-12-11', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Suleiman', 'Ahmed', 12, 'SS 1', 1, '2011-08-03', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Ali', 'Yusuf', 12, 'SS 1', 2, '2011-04-17', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Umar', 'Mohammed', 12, 'SS 1', 3, '2011-10-25', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Sani', 'Bello', 12, 'SS 1', 4, '2011-02-09', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Yusuf', 'Ibrahim', 12, 'SS 1', 5, '2011-07-31', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Umar', 12, 'SS 1', 6, '2011-05-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Bello', 'Ali', 12, 'SS 1', 7, '2011-11-27', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Mohammed', 'Sani', 12, 'SS 1', 8, '2011-03-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ahmed', 'Ibrahim', 'Yusuf', 12, 'SS 1', 9, '2011-09-15', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Mohammed', 'Ali', 12, 'SS 1', 10, '2011-06-20', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Ibrahim', 'Yusuf', 'Abdullahi', 12, 'SS 1', 11, '2011-01-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Abubakar', 'Suleiman', 12, 'SS 1', 12, '2011-08-25', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ali', 'Bello', 12, 'SS 1', 1, '2011-04-12', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Mariam', 'Ahmed', 'Yusuf', 12, 'SS 1', 2, '2011-07-18', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Sani', 'Umar', 12, 'SS 1', 3, '2011-02-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Bello', 'Ali', 12, 'SS 1', 4, '2011-09-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Umar', 'Yusuf', 'Musa', 12, 'SS 1', 5, '2011-05-22', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Zainab', 'Ibrahim', 'Ahmed', 12, 'SS 1', 6, '2011-11-30', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Suleiman', 'Ahmed', 'Yusuf', 12, 'SS 1', 7, '2011-03-08', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Amina', 'Yusuf', 'Mohammed', 12, 'SS 1', 8, '2011-12-14', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abubakar', 'Sani', 'Umar', 12, 'SS 1', 9, '2011-08-17', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Halima', 'Ibrahim', 'Ali', 12, 'SS 1', 10, '2011-02-23', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Yusuf', 'Mohammed', 'Bello', 12, 'SS 1', 11, '2011-10-10', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Aisha', 'Umar', 'Sani', 12, 'SS 1', 12, '2011-04-05', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Muhammad', 'Ali', 'Ahmed', 12, 'SS 1', 1, '2011-07-19', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Fatima', 'Yusuf', 'Abdullahi', 12, 'SS 1', 2, '2011-01-26', 'Female', 'Active', '2024/2025', '2024-09-15'),
('Abdullahi', 'Ibrahim', 'Musa', 12, 'SS 1', 3, '2011-02-28', 'Male', 'Active', '2024/2025', '2024-09-15'),
('Khadija', 'Yusuf', 'Ali', 12, 'SS 1', 4, '2011-09-05', 'Female', 'Active', '2024/2025', '2024-09-15');

-- Link students to parents (comprehensive linking for all students)
INSERT INTO parent_student_links (parent_id, student_id, relationship, is_primary) VALUES
-- Parent 1 (Ahmed Bello) - Multiple children across different classes
(1, 1, 'Father', TRUE), (1, 33, 'Father', TRUE), (1, 65, 'Father', TRUE), (1, 97, 'Father', TRUE),
-- Parent 2 (Fatima Mohammed) - Multiple children across different classes  
(2, 2, 'Mother', TRUE), (2, 34, 'Mother', TRUE), (2, 66, 'Mother', TRUE), (2, 98, 'Mother', TRUE),
-- Parent 3 (Ibrahim Yusuf) - Multiple children across different classes
(3, 3, 'Father', TRUE), (3, 35, 'Father', TRUE), (3, 67, 'Father', TRUE), (3, 99, 'Father', TRUE),
-- Parent 4 (Aisha Abubakar) - Multiple children across different classes
(4, 4, 'Mother', TRUE), (4, 36, 'Mother', TRUE), (4, 68, 'Mother', TRUE), (4, 100, 'Mother', TRUE),
-- Parent 5 (Muhammad Sani) - Multiple children across different classes
(5, 5, 'Father', TRUE), (5, 37, 'Father', TRUE), (5, 69, 'Father', TRUE), (5, 101, 'Father', TRUE),
-- Parent 6 (Mariam Ibrahim) - Multiple children across different classes
(6, 6, 'Mother', TRUE), (6, 38, 'Mother', TRUE), (6, 70, 'Mother', TRUE), (6, 102, 'Mother', TRUE),
-- Parent 7 (Abdullahi Umar) - Multiple children across different classes
(7, 7, 'Father', TRUE), (7, 39, 'Father', TRUE), (7, 71, 'Father', TRUE), (7, 103, 'Father', TRUE),
-- Parent 8 (Khadija Ali) - Multiple children across different classes
(8, 8, 'Mother', TRUE), (8, 40, 'Mother', TRUE), (8, 72, 'Mother', TRUE), (8, 104, 'Mother', TRUE),
-- Parent 9 (Umar Musa) - Multiple children across different classes
(9, 9, 'Father', TRUE), (9, 41, 'Father', TRUE), (9, 73, 'Father', TRUE), (9, 105, 'Father', TRUE),
-- Parent 10 (Zainab Abdullahi) - Multiple children across different classes
(10, 10, 'Mother', TRUE), (10, 42, 'Mother', TRUE), (10, 74, 'Mother', TRUE), (10, 106, 'Mother', TRUE),
-- Parent 11 (Suleiman Ahmed) - Multiple children across different classes
(11, 11, 'Father', TRUE), (11, 43, 'Father', TRUE), (11, 75, 'Father', TRUE), (11, 107, 'Father', TRUE),
-- Parent 12 (Amina Yusuf) - Multiple children across different classes
(12, 12, 'Mother', TRUE), (12, 44, 'Mother', TRUE), (12, 76, 'Mother', TRUE), (12, 108, 'Mother', TRUE),

-- Additional parent-student relationships for remaining students
-- Some parents have 2-4 children, some have 1 child
(1, 129, 'Father', FALSE), (1, 161, 'Father', FALSE), (1, 193, 'Father', FALSE),
(2, 130, 'Mother', FALSE), (2, 162, 'Mother', FALSE), (2, 194, 'Mother', FALSE),
(3, 131, 'Father', FALSE), (3, 163, 'Father', FALSE), (3, 195, 'Father', FALSE),
(4, 132, 'Mother', FALSE), (4, 164, 'Mother', FALSE), (4, 196, 'Mother', FALSE),
(5, 133, 'Father', FALSE), (5, 165, 'Father', FALSE), (5, 197, 'Father', FALSE),
(6, 134, 'Mother', FALSE), (6, 166, 'Mother', FALSE), (6, 198, 'Mother', FALSE),
(7, 135, 'Father', FALSE), (7, 167, 'Father', FALSE), (7, 199, 'Father', FALSE),
(8, 136, 'Mother', FALSE), (8, 168, 'Mother', FALSE), (8, 200, 'Mother', FALSE),
(9, 137, 'Father', FALSE), (9, 169, 'Father', FALSE), (9, 201, 'Father', FALSE),
(10, 138, 'Mother', FALSE), (10, 170, 'Mother', FALSE), (10, 202, 'Mother', FALSE),
(11, 139, 'Father', FALSE), (11, 171, 'Father', FALSE), (11, 203, 'Father', FALSE),
(12, 140, 'Mother', FALSE), (12, 172, 'Mother', FALSE), (12, 204, 'Mother', FALSE),

-- Single child relationships for remaining students
(1, 225, 'Father', TRUE), (2, 226, 'Mother', TRUE), (3, 227, 'Father', TRUE), (4, 228, 'Mother', TRUE),
(5, 229, 'Father', TRUE), (6, 230, 'Mother', TRUE), (7, 231, 'Father', TRUE), (8, 232, 'Mother', TRUE),
(9, 233, 'Father', TRUE), (10, 234, 'Mother', TRUE), (11, 235, 'Father', TRUE), (12, 236, 'Mother', TRUE),
(1, 237, 'Father', TRUE), (2, 238, 'Mother', TRUE), (3, 239, 'Father', TRUE), (4, 240, 'Mother', TRUE),
(5, 241, 'Father', TRUE), (6, 242, 'Mother', TRUE), (7, 243, 'Father', TRUE), (8, 244, 'Mother', TRUE),
(9, 245, 'Father', TRUE), (10, 246, 'Mother', TRUE), (11, 247, 'Father', TRUE), (12, 248, 'Mother', TRUE),
(1, 249, 'Father', TRUE), (2, 250, 'Mother', TRUE), (3, 251, 'Father', TRUE), (4, 252, 'Mother', TRUE),
(5, 253, 'Father', TRUE), (6, 254, 'Mother', TRUE), (7, 255, 'Father', TRUE), (8, 256, 'Mother', TRUE),
(9, 257, 'Father', TRUE), (10, 258, 'Mother', TRUE), (11, 259, 'Father', TRUE), (12, 260, 'Mother', TRUE),
(1, 261, 'Father', TRUE), (2, 262, 'Mother', TRUE), (3, 263, 'Father', TRUE), (4, 264, 'Mother', TRUE),
(5, 265, 'Father', TRUE), (6, 266, 'Mother', TRUE), (7, 267, 'Father', TRUE), (8, 268, 'Mother', TRUE),
(9, 269, 'Father', TRUE), (10, 270, 'Mother', TRUE), (11, 271, 'Father', TRUE), (12, 272, 'Mother', TRUE),
(1, 273, 'Father', TRUE), (2, 274, 'Mother', TRUE), (3, 275, 'Father', TRUE), (4, 276, 'Mother', TRUE),
(5, 277, 'Father', TRUE), (6, 278, 'Mother', TRUE), (7, 279, 'Father', TRUE), (8, 280, 'Mother', TRUE),
(9, 281, 'Father', TRUE), (10, 282, 'Mother', TRUE), (11, 283, 'Father', TRUE), (12, 284, 'Mother', TRUE),
(1, 285, 'Father', TRUE), (2, 286, 'Mother', TRUE), (3, 287, 'Father', TRUE), (4, 288, 'Mother', TRUE),
(5, 289, 'Father', TRUE), (6, 290, 'Mother', TRUE), (7, 291, 'Father', TRUE), (8, 292, 'Mother', TRUE),
(9, 293, 'Father', TRUE), (10, 294, 'Mother', TRUE), (11, 295, 'Father', TRUE), (12, 296, 'Mother', TRUE),
(1, 297, 'Father', TRUE), (2, 298, 'Mother', TRUE), (3, 299, 'Father', TRUE), (4, 300, 'Mother', TRUE),
(5, 301, 'Father', TRUE), (6, 302, 'Mother', TRUE), (7, 303, 'Father', TRUE), (8, 304, 'Mother', TRUE),
(9, 305, 'Father', TRUE), (10, 306, 'Mother', TRUE), (11, 307, 'Father', TRUE), (12, 308, 'Mother', TRUE),
(1, 309, 'Father', TRUE), (2, 310, 'Mother', TRUE), (3, 311, 'Father', TRUE), (4, 312, 'Mother', TRUE),
(5, 313, 'Father', TRUE), (6, 314, 'Mother', TRUE), (7, 315, 'Father', TRUE), (8, 316, 'Mother', TRUE),
(9, 317, 'Father', TRUE), (10, 318, 'Mother', TRUE), (11, 319, 'Father', TRUE), (12, 320, 'Mother', TRUE),
(1, 321, 'Father', TRUE), (2, 322, 'Mother', TRUE), (3, 323, 'Father', TRUE), (4, 324, 'Mother', TRUE),
(5, 325, 'Father', TRUE), (6, 326, 'Mother', TRUE), (7, 327, 'Father', TRUE), (8, 328, 'Mother', TRUE),
(9, 329, 'Father', TRUE), (10, 330, 'Mother', TRUE), (11, 331, 'Father', TRUE), (12, 332, 'Mother', TRUE),
(1, 333, 'Father', TRUE), (2, 334, 'Mother', TRUE), (3, 335, 'Father', TRUE), (4, 336, 'Mother', TRUE),
(5, 337, 'Father', TRUE), (6, 338, 'Mother', TRUE), (7, 339, 'Father', TRUE), (8, 340, 'Mother', TRUE),
(9, 341, 'Father', TRUE), (10, 342, 'Mother', TRUE), (11, 343, 'Father', TRUE), (12, 344, 'Mother', TRUE),
(1, 345, 'Father', TRUE), (2, 346, 'Mother', TRUE), (3, 347, 'Father', TRUE), (4, 348, 'Mother', TRUE),
(5, 349, 'Father', TRUE), (6, 350, 'Mother', TRUE), (7, 351, 'Father', TRUE), (8, 352, 'Mother', TRUE),
(9, 353, 'Father', TRUE), (10, 354, 'Mother', TRUE), (11, 355, 'Father', TRUE), (12, 356, 'Mother', TRUE),
(1, 357, 'Father', TRUE), (2, 358, 'Mother', TRUE), (3, 359, 'Father', TRUE), (4, 360, 'Mother', TRUE),
(1, 361, 'Father', TRUE), (2, 362, 'Mother', TRUE), (3, 363, 'Father', TRUE), (4, 364, 'Mother', TRUE),
(5, 365, 'Father', TRUE), (6, 366, 'Mother', TRUE), (7, 367, 'Father', TRUE), (8, 368, 'Mother', TRUE),
(9, 369, 'Father', TRUE), (10, 370, 'Mother', TRUE), (11, 371, 'Father', TRUE), (12, 372, 'Mother', TRUE);

-- Create fee structures for each class category
INSERT INTO fee_structures (class_id, level, term, academic_year, tuition_fee, development_levy, sports_fee, exam_fee, books_fee, uniform_fee, transport_fee) VALUES
-- Primary Classes
(1, 'Primary 1', 'First Term', '2024/2025', 25000.00, 5000.00, 2000.00, 3000.00, 8000.00, 6000.00, 4000.00),
(2, 'Primary 1', 'First Term', '2024/2025', 25000.00, 5000.00, 2000.00, 3000.00, 8000.00, 6000.00, 4000.00),
(3, 'Primary 2', 'First Term', '2024/2025', 25000.00, 5000.00, 2000.00, 3000.00, 8000.00, 6000.00, 4000.00),
(4, 'Primary 2', 'First Term', '2024/2025', 25000.00, 5000.00, 2000.00, 3000.00, 8000.00, 6000.00, 4000.00),
(5, 'Primary 3', 'First Term', '2024/2025', 28000.00, 5000.00, 2000.00, 3000.00, 9000.00, 6000.00, 4000.00),
(6, 'Primary 3', 'First Term', '2024/2025', 28000.00, 5000.00, 2000.00, 3000.00, 9000.00, 6000.00, 4000.00),
(7, 'Primary 4', 'First Term', '2024/2025', 28000.00, 5000.00, 2000.00, 3000.00, 9000.00, 6000.00, 4000.00),
(8, 'Primary 4', 'First Term', '2024/2025', 28000.00, 5000.00, 2000.00, 3000.00, 9000.00, 6000.00, 4000.00),
(9, 'Primary 5', 'First Term', '2024/2025', 30000.00, 6000.00, 2500.00, 3500.00, 10000.00, 7000.00, 4500.00),
-- Secondary Classes
(10, 'JSS 1', 'First Term', '2024/2025', 45000.00, 8000.00, 3000.00, 5000.00, 12000.00, 8000.00, 6000.00),
(11, 'JSS 2', 'First Term', '2024/2025', 45000.00, 8000.00, 3000.00, 5000.00, 12000.00, 8000.00, 6000.00),
(12, 'SS 1', 'First Term', '2024/2025', 55000.00, 10000.00, 3500.00, 6000.00, 15000.00, 9000.00, 7000.00);

-- Create student fee balances based on fee structures
INSERT INTO student_fee_balances (student_id, class_id, term, academic_year, total_fee_required, total_paid, status)
SELECT 
    s.id as student_id,
    s.class_id,
    'First Term' as term,
    '2024/2025' as academic_year,
    fs.total_fee as total_fee_required,
    0 as total_paid,
    'Unpaid' as status
FROM students s
JOIN fee_structures fs ON s.class_id = fs.class_id
WHERE fs.term = 'First Term' AND fs.academic_year = '2024/2025';

-- Insert default bank account settings
INSERT INTO bank_account_settings (bank_name, account_name, account_number, updated_by) VALUES
('Access Bank', 'Graceland Royal Academy', '1234567890', 1);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- =============================================

-- Additional indexes for performance
CREATE INDEX idx_students_search ON students(first_name, last_name, admission_number);
CREATE INDEX idx_teachers_search ON teachers(first_name, last_name, employee_id);
CREATE INDEX idx_parents_search ON parents(first_name, last_name, email);
CREATE INDEX idx_payments_student_date ON payments(student_id, recorded_date);
CREATE INDEX idx_scores_student_assignment ON scores(student_id, subject_assignment_id);
CREATE INDEX idx_notifications_unread ON notifications(is_read, target_audience);
CREATE INDEX idx_activity_logs_recent ON activity_logs(created_at DESC);

-- Full-text search indexes for content fields
ALTER TABLE notifications ADD FULLTEXT(title, message);
ALTER TABLE assignments ADD FULLTEXT(title, description);

COMMIT;

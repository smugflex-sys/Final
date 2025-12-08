-- Missing tables from the complete schema

SET FOREIGN_KEY_CHECKS = 0;

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

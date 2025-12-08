-- Signature Settings Table
CREATE TABLE IF NOT EXISTS signature_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    academic_year VARCHAR(20) NOT NULL,
    term ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
    principal_name VARCHAR(100) NOT NULL DEFAULT 'OROGUN GLORY EJIRO',
    principal_signature TEXT,
    principal_comment TEXT DEFAULT 'A very good result. Release your potentials cause you can do more dear.',
    head_teacher_name VARCHAR(100) NOT NULL DEFAULT 'MRS. ABDULHAMID BINTA',
    head_teacher_signature TEXT,
    head_teacher_comment TEXT DEFAULT 'A very good result. Keep up the excellent work!',
    resumption_date DATE DEFAULT '2025-09-15',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_academic_term (academic_year, term),
    INDEX idx_academic_year (academic_year),
    INDEX idx_term (term)
);

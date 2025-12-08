<?php
/**
 * Results Controller
 * Graceland Royal Academy School Management System
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Middleware.php';

class ResultsController {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    /**
     * Get Scores by Assignment
     */
    public function getScoresByAssignment($assignment_id) {
        $token_data = Middleware::requireAuth();
        $assignment_id = Middleware::validateInteger($assignment_id, 'assignment_id');
        
        try {
            // Check if teacher has access to this assignment
            if ($token_data['role'] === 'teacher') {
                $check_query = "SELECT COUNT(*) as count FROM subject_assignments WHERE id = :assignment_id AND teacher_id = :teacher_id";
                $check_stmt = $this->conn->prepare($check_query);
                $check_stmt->bindParam(':assignment_id', $assignment_id);
                $check_stmt->bindParam(':teacher_id', $token_data['linked_id']);
                $check_stmt->execute();
                
                if ($check_stmt->fetch()['count'] == 0) {
                    Response::forbidden('Access denied to this assignment');
                }
            }
            
            $query = "SELECT sc.*, s.first_name, s.last_name, s.admission_number,
                             sub.name as subject_name, c.name as class_name
                      FROM scores sc
                      JOIN students s ON sc.student_id = s.id
                      JOIN subject_assignments sa ON sc.subject_assignment_id = sa.id
                      JOIN subjects sub ON sa.subject_id = sub.id
                      JOIN classes c ON sa.class_id = c.id
                      WHERE sc.subject_assignment_id = :assignment_id
                      ORDER BY s.last_name, s.first_name";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':assignment_id', $assignment_id);
            $stmt->execute();
            
            $scores = $stmt->fetchAll();
            
            Response::success($scores, 'Scores retrieved successfully');
            
        } catch (PDOException $e) {
            Response::serverError('Database error retrieving scores');
        }
    }
    
    /**
     * Create or Update Scores
     */
    public function upsertScores() {
        $token_data = Middleware::requireAuth();
        
        if ($token_data['role'] !== 'teacher') {
            Response::forbidden('Only teachers can enter scores');
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        Middleware::validateRequired($data, ['assignment_id', 'scores']);
        
        try {
            $assignment_id = Middleware::validateInteger($data['assignment_id'], 'assignment_id');
            $scores = $data['scores'];
            
            // Verify teacher owns this assignment
            $check_query = "SELECT COUNT(*) as count FROM subject_assignments WHERE id = :assignment_id AND teacher_id = :teacher_id";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->bindParam(':assignment_id', $assignment_id);
            $check_stmt->bindParam(':teacher_id', $token_data['linked_id']);
            $check_stmt->execute();
            
            if ($check_stmt->fetch()['count'] == 0) {
                Response::forbidden('Access denied to this assignment');
            }
            
            $this->conn->beginTransaction();
            
            foreach ($scores as $score_data) {
                Middleware::validateRequired($score_data, ['student_id', 'ca1', 'ca2', 'exam']);
                
                $student_id = Middleware::validateInteger($score_data['student_id'], 'student_id');
                $ca1 = Middleware::validatePositive($score_data['ca1'], 'ca1');
                $ca2 = Middleware::validatePositive($score_data['ca2'], 'ca2');
                $exam = Middleware::validatePositive($score_data['exam'], 'exam');
                
                // Validate score ranges (0-40 for CA, 0-60 for exam)
                if ($ca1 > 40 || $ca2 > 40 || $exam > 60) {
                    Response::badRequest('Invalid score values. CA1 and CA2 should be 0-40, Exam should be 0-60');
                }
                
                $total = $ca1 + $ca2 + $exam;
                $grade = $this->calculateGrade($total);
                $remark = $this->getRemark($grade);
                
                // Calculate class statistics
                $class_stats = $this->calculateClassStatistics($assignment_id, $total);
                
                // Check if score exists
                $existing_query = "SELECT id FROM scores WHERE subject_assignment_id = :assignment_id AND student_id = :student_id";
                $existing_stmt = $this->conn->prepare($existing_query);
                $existing_stmt->bindParam(':assignment_id', $assignment_id);
                $existing_stmt->bindParam(':student_id', $student_id);
                $existing_stmt->execute();
                
                $existing_score = $existing_stmt->fetch();
                
                if ($existing_score) {
                    // Update existing score
                    $update_query = "UPDATE scores SET ca1 = :ca1, ca2 = :ca2, exam = :exam, total = :total,
                                     grade = :grade, remark = :remark, class_average = :class_average,
                                     class_min = :class_min, class_max = :class_max, status = 'Draft'
                                     WHERE id = :score_id";
                    
                    $update_stmt = $this->conn->prepare($update_query);
                    $update_stmt->bindParam(':ca1', $ca1);
                    $update_stmt->bindParam(':ca2', $ca2);
                    $update_stmt->bindParam(':exam', $exam);
                    $update_stmt->bindParam(':total', $total);
                    $update_stmt->bindParam(':grade', $grade);
                    $update_stmt->bindParam(':remark', $remark);
                    $update_stmt->bindParam(':class_average', $class_stats['average']);
                    $update_stmt->bindParam(':class_min', $class_stats['min']);
                    $update_stmt->bindParam(':class_max', $class_stats['max']);
                    $update_stmt->bindParam(':score_id', $existing_score['id']);
                    $update_stmt->execute();
                } else {
                    // Insert new score
                    $insert_query = "INSERT INTO scores (student_id, subject_assignment_id, ca1, ca2, exam, total,
                                     grade, remark, class_average, class_min, class_max, entered_by, status)
                                     VALUES (:student_id, :assignment_id, :ca1, :ca2, :exam, :total,
                                            :grade, :remark, :class_average, :class_min, :class_max, :entered_by, 'Draft')";
                    
                    $insert_stmt = $this->conn->prepare($insert_query);
                    $insert_stmt->bindParam(':student_id', $student_id);
                    $insert_stmt->bindParam(':assignment_id', $assignment_id);
                    $insert_stmt->bindParam(':ca1', $ca1);
                    $insert_stmt->bindParam(':ca2', $ca2);
                    $insert_stmt->bindParam(':exam', $exam);
                    $insert_stmt->bindParam(':total', $total);
                    $insert_stmt->bindParam(':grade', $grade);
                    $insert_stmt->bindParam(':remark', $remark);
                    $insert_stmt->bindParam(':class_average', $class_stats['average']);
                    $insert_stmt->bindParam(':class_min', $class_stats['min']);
                    $insert_stmt->bindParam(':class_max', $class_stats['max']);
                    $insert_stmt->bindParam(':entered_by', $token_data['user_id']);
                    $insert_stmt->execute();
                }
            }
            
            $this->conn->commit();
            
            // Log activity
            Middleware::logActivity(
                $token_data['username'],
                'Teacher',
                'ENTER_SCORES',
                "Assignment ID: $assignment_id",
                'Success',
                count($scores) . ' scores entered/updated',
                $token_data['user_id']
            );
            
            Response::success(null, 'Scores saved successfully');
            
        } catch (PDOException $e) {
            $this->conn->rollBack();
            Response::serverError('Database error saving scores');
        }
    }
    
    /**
     * Submit Scores for Approval
     */
    public function submitScores($assignment_id) {
        $token_data = Middleware::requireAuth();
        
        if ($token_data['role'] !== 'teacher') {
            Response::forbidden('Only teachers can submit scores');
        }
        
        $assignment_id = Middleware::validateInteger($assignment_id, 'assignment_id');
        
        try {
            // Verify teacher owns this assignment
            $check_query = "SELECT COUNT(*) as count FROM subject_assignments WHERE id = :assignment_id AND teacher_id = :teacher_id";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->bindParam(':assignment_id', $assignment_id);
            $check_stmt->bindParam(':teacher_id', $token_data['linked_id']);
            $check_stmt->execute();
            
            if ($check_stmt->fetch()['count'] == 0) {
                Response::forbidden('Access denied to this assignment');
            }
            
            // Check if all students have scores
            $students_query = "SELECT COUNT(*) as total_students FROM students s
                              JOIN subject_assignments sa ON s.class_id = sa.class_id
                              WHERE sa.id = :assignment_id AND s.status = 'Active'";
            $students_stmt = $this->conn->prepare($students_query);
            $students_stmt->bindParam(':assignment_id', $assignment_id);
            $students_stmt->execute();
            $total_students = $students_stmt->fetch()['total_students'];
            
            $scores_query = "SELECT COUNT(*) as entered_scores FROM scores WHERE subject_assignment_id = :assignment_id";
            $scores_stmt = $this->conn->prepare($scores_query);
            $scores_stmt->bindParam(':assignment_id', $assignment_id);
            $scores_stmt->execute();
            $entered_scores = $scores_stmt->fetch()['entered_scores'];
            
            if ($entered_scores < $total_students) {
                Response::badRequest('Cannot submit scores. Some students do not have scores.');
            }
            
            // Update scores status to Submitted
            $update_query = "UPDATE scores SET status = 'Submitted' WHERE subject_assignment_id = :assignment_id";
            $update_stmt = $this->conn->prepare($update_query);
            $update_stmt->bindParam(':assignment_id', $assignment_id);
            $update_stmt->execute();
            
            // Log activity
            Middleware::logActivity(
                $token_data['username'],
                'Teacher',
                'SUBMIT_SCORES',
                "Assignment ID: $assignment_id",
                'Success',
                "$entered_scores scores submitted for approval",
                $token_data['user_id']
            );
            
            Response::success(null, 'Scores submitted successfully');
            
        } catch (PDOException $e) {
            Response::serverError('Database error submitting scores');
        }
    }
    
    /**
     * Get Student Results
     */
    public function getStudentResults($student_id) {
        $token_data = Middleware::requireAuth();
        $student_id = Middleware::validateInteger($student_id, 'student_id');
        
        // Check access permissions
        if ($token_data['role'] === 'parent') {
            // Verify parent owns this student
            $check_query = "SELECT COUNT(*) as count FROM parent_student_links WHERE parent_id = :parent_id AND student_id = :student_id";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->bindParam(':parent_id', $token_data['linked_id']);
            $check_stmt->bindParam(':student_id', $student_id);
            $check_stmt->execute();
            
            if ($check_stmt->fetch()['count'] == 0) {
                Response::forbidden('Access denied to this student');
            }
        } elseif ($token_data['role'] === 'teacher') {
            // Verify teacher has access to this student's class
            $check_query = "SELECT COUNT(*) as count FROM students s
                           JOIN subject_assignments sa ON s.class_id = sa.class_id
                           WHERE s.id = :student_id AND sa.teacher_id = :teacher_id";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->bindParam(':student_id', $student_id);
            $check_stmt->bindParam(':teacher_id', $token_data['linked_id']);
            $check_stmt->execute();
            
            if ($check_stmt->fetch()['count'] == 0) {
                Response::forbidden('Access denied to this student');
            }
        }
        
        try {
            $term = isset($_GET['term']) ? Middleware::sanitizeString($_GET['term']) : 'First Term';
            $academic_year = isset($_GET['academic_year']) ? Middleware::sanitizeString($_GET['academic_year']) : '2024/2025';
            
            $query = "SELECT sc.*, sub.name as subject_name, sub.code as subject_code,
                             CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
                             sa.term, sa.academic_year
                      FROM scores sc
                      JOIN subject_assignments sa ON sc.subject_assignment_id = sa.id
                      JOIN subjects sub ON sa.subject_id = sub.id
                      JOIN teachers t ON sa.teacher_id = t.id
                      WHERE sc.student_id = :student_id AND sa.term = :term AND sa.academic_year = :academic_year
                      ORDER BY sub.name";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':student_id', $student_id);
            $stmt->bindParam(':term', $term);
            $stmt->bindParam(':academic_year', $academic_year);
            $stmt->execute();
            
            $scores = $stmt->fetchAll();
            
            // Get compiled result if available
            $compiled_query = "SELECT * FROM compiled_results 
                              WHERE student_id = :student_id AND term = :term AND academic_year = :academic_year";
            $compiled_stmt = $this->conn->prepare($compiled_query);
            $compiled_stmt->bindParam(':student_id', $student_id);
            $compiled_stmt->bindParam(':term', $term);
            $compiled_stmt->bindParam(':academic_year', $academic_year);
            $compiled_stmt->execute();
            $compiled_result = $compiled_stmt->fetch();
            
            $result_data = [
                'scores' => $scores,
                'compiled_result' => $compiled_result,
                'term' => $term,
                'academic_year' => $academic_year
            ];
            
            Response::success($result_data, 'Student results retrieved successfully');
            
        } catch (PDOException $e) {
            Response::serverError('Database error retrieving student results');
        }
    }
    
    /**
     * Compile Student Results
     */
    public function compileResults() {
        $token_data = Middleware::requireAuth();
        
        if ($token_data['role'] !== 'teacher') {
            Response::forbidden('Only teachers can compile results');
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        Middleware::validateRequired($data, ['class_id', 'term', 'academic_year', 'student_results']);
        
        try {
            $class_id = Middleware::validateInteger($data['class_id'], 'class_id');
            $term = Middleware::validateEnum($data['term'], ['First Term', 'Second Term', 'Third Term'], 'term');
            $academic_year = Middleware::sanitizeString($data['academic_year']);
            $student_results = $data['student_results'];
            
            // Verify teacher is class teacher for this class
            $check_query = "SELECT COUNT(*) as count FROM classes WHERE id = :class_id AND class_teacher_id = :teacher_id";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->bindParam(':class_id', $class_id);
            $check_stmt->bindParam(':teacher_id', $token_data['linked_id']);
            $check_stmt->execute();
            
            if ($check_stmt->fetch()['count'] == 0) {
                Response::forbidden('Only class teachers can compile results');
            }
            
            $this->conn->beginTransaction();
            
            foreach ($student_results as $result_data) {
                Middleware::validateRequired($result_data, ['student_id', 'total_score', 'average_score', 'position']);
                
                $student_id = Middleware::validateInteger($result_data['student_id'], 'student_id');
                $total_score = Middleware::validatePositive($result_data['total_score'], 'total_score');
                $average_score = Middleware::validatePositive($result_data['average_score'], 'average_score');
                $position = Middleware::validateInteger($result_data['position'], 'position');
                $total_students = Middleware::validateInteger($result_data['total_students'], 'total_students');
                
                // Calculate class average
                $class_avg_query = "SELECT AVG(average_score) as class_avg FROM compiled_results 
                                   WHERE class_id = :class_id AND term = :term AND academic_year = :academic_year AND status = 'Approved'";
                $class_avg_stmt = $this->conn->prepare($class_avg_query);
                $class_avg_stmt->bindParam(':class_id', $class_id);
                $class_avg_stmt->bindParam(':term', $term);
                $class_avg_stmt->bindParam(':academic_year', $academic_year);
                $class_avg_stmt->execute();
                $class_average = $class_avg_stmt->fetch()['class_avg'] ?? 0;
                
                // Get class and teacher info
                $class_info_query = "SELECT c.name as class_name, CONCAT(t.first_name, ' ', t.last_name) as teacher_name 
                                    FROM classes c 
                                    JOIN teachers t ON c.class_teacher_id = t.id 
                                    WHERE c.id = :class_id";
                $class_info_stmt = $this->conn->prepare($class_info_query);
                $class_info_stmt->bindParam(':class_id', $class_id);
                $class_info_stmt->execute();
                $class_info = $class_info_stmt->fetch();
                
                // Check if compiled result exists
                $existing_query = "SELECT id FROM compiled_results 
                                   WHERE student_id = :student_id AND class_id = :class_id AND term = :term AND academic_year = :academic_year";
                $existing_stmt = $this->conn->prepare($existing_query);
                $existing_stmt->bindParam(':student_id', $student_id);
                $existing_stmt->bindParam(':class_id', $class_id);
                $existing_stmt->bindParam(':term', $term);
                $existing_stmt->bindParam(':academic_year', $academic_year);
                $existing_stmt->execute();
                
                $existing_result = $existing_stmt->fetch();
                
                $result_data_array = [
                    'student_id' => $student_id,
                    'class_id' => $class_id,
                    'term' => $term,
                    'academic_year' => $academic_year,
                    'total_score' => $total_score,
                    'average_score' => $average_score,
                    'class_average' => $class_average,
                    'position' => $position,
                    'total_students' => $total_students,
                    'class_teacher_name' => $class_info['teacher_name'],
                    'principal_name' => 'Mrs. Grace Okoro',
                    'compiled_by' => $token_data['user_id']
                ];
                
                if ($existing_result) {
                    // Update existing result
                    $update_fields = [];
                    $params = [':id' => $existing_result['id']];
                    
                    foreach ($result_data_array as $key => $value) {
                        $update_fields[] = "$key = :$key";
                        $params[':' . $key] = $value;
                    }
                    
                    $update_query = "UPDATE compiled_results SET " . implode(', ', $update_fields) . " WHERE id = :id";
                    $update_stmt = $this->conn->prepare($update_query);
                    
                    foreach ($params as $key => $value) {
                        $update_stmt->bindValue($key, $value);
                    }
                    $update_stmt->execute();
                } else {
                    // Insert new compiled result
                    $fields = array_keys($result_data_array);
                    $placeholders = array_map(function($field) { return ":$field"; }, $fields);
                    
                    $insert_query = "INSERT INTO compiled_results (" . implode(', ', $fields) . ") 
                                     VALUES (" . implode(', ', $placeholders) . ")";
                    
                    $insert_stmt = $this->conn->prepare($insert_query);
                    
                    foreach ($result_data_array as $key => $value) {
                        $insert_stmt->bindValue(":$key", $value);
                    }
                    $insert_stmt->execute();
                }
            }
            
            $this->conn->commit();
            
            // Log activity
            Middleware::logActivity(
                $token_data['username'],
                'Teacher',
                'COMPILE_RESULTS',
                "Class ID: $class_id",
                'Success',
                count($student_results) . ' results compiled',
                $token_data['user_id']
            );
            
            Response::success(null, 'Results compiled successfully');
            
        } catch (PDOException $e) {
            $this->conn->rollBack();
            Response::serverError('Database error compiling results');
        }
    }
    
    /**
     * Get Pending Approvals (Admin only)
     */
    public function getPendingApprovals() {
        Middleware::requireRole('admin');
        
        try {
            $query = "SELECT cr.*, s.first_name, s.last_name, s.admission_number,
                             c.name as class_name, c.level,
                             CONCAT(t.first_name, ' ', t.last_name) as compiled_by_name
                      FROM compiled_results cr
                      JOIN students s ON cr.student_id = s.id
                      JOIN classes c ON cr.class_id = c.id
                      JOIN users u ON cr.compiled_by = u.id
                      LEFT JOIN teachers t ON u.linked_id = t.id AND u.role = 'teacher'
                      WHERE cr.status = 'Submitted'
                      ORDER BY cr.compiled_date DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $pending_results = $stmt->fetchAll();
            
            Response::success($pending_results, 'Pending approvals retrieved successfully');
            
        } catch (PDOException $e) {
            Response::serverError('Database error retrieving pending approvals');
        }
    }
    
    /**
     * Approve/Reject Result (Admin only)
     */
    public function approveResult($result_id) {
        Middleware::requireRole('admin');
        
        $result_id = Middleware::validateInteger($result_id, 'result_id');
        $data = json_decode(file_get_contents('php://input'), true);
        
        Middleware::validateRequired($data, ['action']);
        
        $action = Middleware::validateEnum($data['action'], ['approve', 'reject'], 'action');
        
        try {
            // Check if result exists and is submitted
            $check_query = "SELECT * FROM compiled_results WHERE id = :result_id AND status = 'Submitted'";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->bindParam(':result_id', $result_id);
            $check_stmt->execute();
            
            $result = $check_stmt->fetch();
            if (!$result) {
                Response::notFound('Result not found or not submitted for approval');
            }
            
            if ($action === 'approve') {
                $update_query = "UPDATE compiled_results SET status = 'Approved', approved_by = :approved_by, approved_date = NOW() 
                                WHERE id = :result_id";
                $message = 'Result approved successfully';
            } else {
                $rejection_reason = isset($data['rejection_reason']) ? Middleware::sanitizeString($data['rejection_reason']) : 'Rejected by admin';
                $update_query = "UPDATE compiled_results SET status = 'Rejected', rejection_reason = :rejection_reason 
                                WHERE id = :result_id";
                $message = 'Result rejected successfully';
            }
            
            $update_stmt = $this->conn->prepare($update_query);
            $update_stmt->bindParam(':result_id', $result_id);
            
            if ($action === 'approve') {
                $approved_by = $_SESSION['user_id'] ?? 1;
                $update_stmt->bindParam(':approved_by', $approved_by);
            } else {
                $update_stmt->bindParam(':rejection_reason', $rejection_reason);
            }
            
            $update_stmt->execute();
            
            // Log activity
            Middleware::logActivity(
                'Admin',
                'Admin',
                strtoupper($action) . '_RESULT',
                "Result ID: $result_id",
                'Success',
                "Result $action" . ($action === 'reject' ? ": $rejection_reason" : ""),
                $_SESSION['user_id'] ?? null
            );
            
            Response::success(null, $message);
            
        } catch (PDOException $e) {
            Response::serverError('Database error updating result status');
        }
    }
    
    /**
     * Calculate Grade
     */
    private function calculateGrade($total) {
        if ($total >= 80) return 'A';
        if ($total >= 70) return 'B';
        if ($total >= 60) return 'C';
        if ($total >= 50) return 'D';
        if ($total >= 40) return 'E';
        return 'F';
    }
    
    /**
     * Get Remark
     */
    private function getRemark($grade) {
        $remarks = [
            'A' => 'Excellent',
            'B' => 'Very Good',
            'C' => 'Good',
            'D' => 'Fair',
            'E' => 'Pass',
            'F' => 'Fail'
        ];
        return $remarks[$grade] ?? 'N/A';
    }
    
    /**
     * Calculate Class Statistics
     */
    private function calculateClassStatistics($assignment_id, $new_score = null) {
        try {
            $query = "SELECT total FROM scores WHERE subject_assignment_id = :assignment_id";
            if ($new_score !== null) {
                // Include the new score in calculation
                $query .= " UNION ALL SELECT :new_score as total";
            }
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':assignment_id', $assignment_id);
            if ($new_score !== null) {
                $stmt->bindParam(':new_score', $new_score);
            }
            $stmt->execute();
            
            $totals = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
            
            if (empty($totals)) {
                return ['average' => 0, 'min' => 0, 'max' => 0];
            }
            
            $average = array_sum($totals) / count($totals);
            $min = min($totals);
            $max = max($totals);
            
            return [
                'average' => round($average, 2),
                'min' => $min,
                'max' => $max
            ];
        } catch (PDOException $e) {
            return ['average' => 0, 'min' => 0, 'max' => 0];
        }
    }
}
?>

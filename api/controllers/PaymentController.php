<?php
/**
 * Payment Controller
 * Graceland Royal Academy School Management System
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Middleware.php';

class PaymentController {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    /**
     * Get All Payments (with filtering)
     */
    public function getAllPayments() {
        Middleware::requireAnyRole(['admin', 'accountant']);
        
        $pagination = Middleware::getPaginationParams();
        $search_params = Middleware::getSearchParams();
        
        try {
            $query = "SELECT p.*, s.first_name, s.last_name, s.admission_number,
                             c.name as class_name, c.level,
                             CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name
                      FROM payments p
                      JOIN students s ON p.student_id = s.id
                      JOIN classes c ON s.class_id = c.id
                      LEFT JOIN users u ON p.recorded_by = u.id";
            
            $count_query = "SELECT COUNT(*) as total FROM payments p
                           JOIN students s ON p.student_id = s.id";
            
            // Add search conditions
            $conditions = [];
            $params = [];
            
            if (!empty($search_params['search'])) {
                $conditions[] = "(s.first_name LIKE :search OR s.last_name LIKE :search OR s.admission_number LIKE :search OR p.receipt_number LIKE :search)";
                $search_param = '%' . $search_params['search'] . '%';
                $params[':search'] = $search_param;
            }
            
            // Filter by status
            if (isset($_GET['status'])) {
                $conditions[] = "p.status = :status";
                $params[':status'] = Middleware::validateEnum($_GET['status'], ['Pending', 'Verified', 'Rejected'], 'status');
            }
            
            // Filter by date range
            if (isset($_GET['date_from'])) {
                $conditions[] = "p.recorded_date >= :date_from";
                $params[':date_from'] = Middleware::validateDate($_GET['date_from']);
            }
            if (isset($_GET['date_to'])) {
                $conditions[] = "p.recorded_date <= :date_to";
                $params[':date_to'] = Middleware::validateDate($_GET['date_to']);
            }
            
            if (!empty($conditions)) {
                $query .= " WHERE " . implode(' AND ', $conditions);
                $count_query .= " WHERE " . implode(' AND ', $conditions);
            }
            
            $query .= " ORDER BY p.{$search_params['sort_by']} {$search_params['sort_order']}";
            $query .= " LIMIT :limit OFFSET :offset";
            
            $stmt = $this->conn->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->bindValue(':limit', $pagination['limit'], PDO::PARAM_INT);
            $stmt->bindValue(':offset', $pagination['offset'], PDO::PARAM_INT);
            $stmt->execute();
            
            $payments = $stmt->fetchAll();
            
            // Get total count
            $count_stmt = $this->conn->prepare($count_query);
            foreach ($params as $key => $value) {
                $count_stmt->bindValue($key, $value);
            }
            $count_stmt->execute();
            $total = $count_stmt->fetch()['total'];
            
            Response::paginated($payments, $pagination['page'], $pagination['limit'], $total);
            
        } catch (PDOException $e) {
            Response::serverError('Database error retrieving payments');
        }
    }
    
    /**
     * Get Payment by ID
     */
    public function getPaymentById($id) {
        Middleware::requireAnyRole(['admin', 'accountant']);
        
        $payment_id = Middleware::validateInteger($id, 'payment_id');
        
        try {
            $query = "SELECT p.*, s.first_name, s.last_name, s.admission_number,
                             c.name as class_name, c.level,
                             CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name,
                             CONCAT(v.first_name, ' ', v.last_name) as verified_by_name
                      FROM payments p
                      JOIN students s ON p.student_id = s.id
                      JOIN classes c ON s.class_id = c.id
                      LEFT JOIN users u ON p.recorded_by = u.id
                      LEFT JOIN users v ON p.verified_by = v.id
                      WHERE p.id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $payment_id);
            $stmt->execute();
            
            $payment = $stmt->fetch();
            
            if (!$payment) {
                Response::notFound('Payment not found');
            }
            
            Response::success($payment, 'Payment retrieved successfully');
            
        } catch (PDOException $e) {
            Response::serverError('Database error retrieving payment');
        }
    }
    
    /**
     * Create New Payment
     */
    public function createPayment() {
        Middleware::requireAnyRole(['admin', 'accountant']);
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        Middleware::validateRequired($data, ['student_id', 'amount', 'payment_type', 'payment_method']);
        
        try {
            $student_id = Middleware::validateInteger($data['student_id'], 'student_id');
            $amount = Middleware::validatePositive($data['amount'], 'amount');
            $payment_type = Middleware::validateEnum($data['payment_type'], ['School Fees', 'Examination Fees', 'Books', 'Uniform', 'Transport', 'Others'], 'payment_type');
            $payment_method = Middleware::validateEnum($data['payment_method'], ['Bank Transfer', 'Cash', 'POS', 'Online Payment', 'Cheque'], 'payment_method');
            
            $term = isset($data['term']) ? Middleware::sanitizeString($data['term']) : 'First Term';
            $academic_year = isset($data['academic_year']) ? Middleware::sanitizeString($data['academic_year']) : '2024/2025';
            $transaction_reference = isset($data['transaction_reference']) ? Middleware::sanitizeString($data['transaction_reference']) : null;
            $notes = isset($data['notes']) ? Middleware::sanitizeString($data['notes']) : null;
            
            // Check if student exists
            $student_query = "SELECT first_name, last_name FROM students WHERE id = :student_id";
            $student_stmt = $this->conn->prepare($student_query);
            $student_stmt->bindParam(':student_id', $student_id);
            $student_stmt->execute();
            
            $student = $student_stmt->fetch();
            if (!$student) {
                Response::notFound('Student not found');
            }
            
            // Generate receipt number
            $receipt_number = $this->generateReceiptNumber();
            
            // Insert payment
            $query = "INSERT INTO payments (student_id, amount, payment_type, term, academic_year, payment_method, 
                                          transaction_reference, receipt_number, recorded_by, notes, status)
                      VALUES (:student_id, :amount, :payment_type, :term, :academic_year, :payment_method,
                              :transaction_reference, :receipt_number, :recorded_by, :notes, 'Pending')";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':student_id', $student_id);
            $stmt->bindParam(':amount', $amount);
            $stmt->bindParam(':payment_type', $payment_type);
            $stmt->bindParam(':term', $term);
            $stmt->bindParam(':academic_year', $academic_year);
            $stmt->bindParam(':payment_method', $payment_method);
            $stmt->bindParam(':transaction_reference', $transaction_reference);
            $stmt->bindParam(':receipt_number', $receipt_number);
            $recorded_by = $_SESSION['user_id'] ?? 1;
            $stmt->bindParam(':recorded_by', $recorded_by);
            $stmt->bindParam(':notes', $notes);
            
            $stmt->execute();
            $payment_id = $this->conn->lastInsertId();
            
            // Update student fee balance
            $this->updateStudentFeeBalance($student_id, $amount, $term, $academic_year);
            
            // Log activity
            Middleware::logActivity(
                $_SESSION['username'] ?? 'Accountant',
                'Accountant',
                'CREATE_PAYMENT',
                "Payment: $receipt_number",
                'Success',
                "Payment of $amount recorded for {$student['first_name']} {$student['last_name']}",
                $_SESSION['user_id'] ?? null
            );
            
            Response::created(['id' => $payment_id, 'receipt_number' => $receipt_number], 'Payment recorded successfully');
            
        } catch (PDOException $e) {
            Response::serverError('Database error recording payment');
        }
    }
    
    /**
     * Verify Payment
     */
    public function verifyPayment($id) {
        Middleware::requireAnyRole(['admin', 'accountant']);
        
        $payment_id = Middleware::validateInteger($id, 'payment_id');
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            // Check if payment exists and is pending
            $check_query = "SELECT * FROM payments WHERE id = :id AND status = 'Pending'";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->bindParam(':id', $payment_id);
            $check_stmt->execute();
            
            $payment = $check_stmt->fetch();
            if (!$payment) {
                Response::notFound('Payment not found or already processed');
            }
            
            $action = Middleware::validateEnum($data['action'], ['verify', 'reject'], 'action');
            
            if ($action === 'verify') {
                $status = 'Verified';
                $message = 'Payment verified successfully';
            } else {
                $status = 'Rejected';
                $rejection_reason = isset($data['rejection_reason']) ? Middleware::sanitizeString($data['rejection_reason']) : 'Payment rejected';
                $message = 'Payment rejected';
                
                // Update fee balance to reverse the payment
                $this->reverseStudentFeeBalance($payment['student_id'], $payment['amount'], $payment['term'], $payment['academic_year']);
            }
            
            // Update payment status
            $update_query = "UPDATE payments SET status = :status, verified_by = :verified_by, verified_date = NOW() 
                            WHERE id = :id";
            
            $update_stmt = $this->conn->prepare($update_query);
            $update_stmt->bindParam(':status', $status);
            $verified_by = $_SESSION['user_id'] ?? 1;
            $update_stmt->bindParam(':verified_by', $verified_by);
            $update_stmt->bindParam(':id', $payment_id);
            $update_stmt->execute();
            
            // Add rejection reason if rejected
            if ($action === 'reject') {
                $notes_query = "UPDATE payments SET notes = CONCAT(IFNULL(notes, ''), '\nRejection: ', :rejection_reason) WHERE id = :id";
                $notes_stmt = $this->conn->prepare($notes_query);
                $notes_stmt->bindParam(':rejection_reason', $rejection_reason);
                $notes_stmt->bindParam(':id', $payment_id);
                $notes_stmt->execute();
            }
            
            // Log activity
            Middleware::logActivity(
                $_SESSION['username'] ?? 'Accountant',
                'Accountant',
                strtoupper($action) . '_PAYMENT',
                "Payment ID: $payment_id",
                'Success',
                "Payment $action" . ($action === 'reject' ? ": $rejection_reason" : ""),
                $_SESSION['user_id'] ?? null
            );
            
            Response::success(null, $message);
            
        } catch (PDOException $e) {
            Response::serverError('Database error updating payment');
        }
    }
    
    /**
     * Get Student Payment History
     */
    public function getStudentPaymentHistory($student_id) {
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
        }
        
        try {
            $query = "SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name
                      FROM payments p
                      LEFT JOIN users u ON p.recorded_by = u.id
                      WHERE p.student_id = :student_id
                      ORDER BY p.recorded_date DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':student_id', $student_id);
            $stmt->execute();
            
            $payments = $stmt->fetchAll();
            
            // Get current fee balance
            $balance_query = "SELECT * FROM student_fee_balances 
                              WHERE student_id = :student_id 
                              ORDER BY academic_year DESC, term DESC LIMIT 1";
            $balance_stmt = $this->conn->prepare($balance_query);
            $balance_stmt->bindParam(':student_id', $student_id);
            $balance_stmt->execute();
            $current_balance = $balance_stmt->fetch();
            
            $result_data = [
                'payments' => $payments,
                'current_balance' => $current_balance
            ];
            
            Response::success($result_data, 'Student payment history retrieved successfully');
            
        } catch (PDOException $e) {
            Response::serverError('Database error retrieving payment history');
        }
    }
    
    /**
     * Get Student Fee Balance
     */
    public function getStudentFeeBalance($student_id) {
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
        }
        
        try {
            $term = isset($_GET['term']) ? Middleware::sanitizeString($_GET['term']) : 'First Term';
            $academic_year = isset($_GET['academic_year']) ? Middleware::sanitizeString($_GET['academic_year']) : '2024/2025';
            
            $query = "SELECT sfb.*, fs.*
                      FROM student_fee_balances sfb
                      JOIN fee_structures fs ON sfb.class_id = fs.class_id AND sfb.term = fs.term AND sfb.academic_year = fs.academic_year
                      WHERE sfb.student_id = :student_id AND sfb.term = :term AND sfb.academic_year = :academic_year";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':student_id', $student_id);
            $stmt->bindParam(':term', $term);
            $stmt->bindParam(':academic_year', $academic_year);
            $stmt->execute();
            
            $fee_balance = $stmt->fetch();
            
            if (!$fee_balance) {
                Response::notFound('Fee balance not found for specified term and year');
            }
            
            Response::success($fee_balance, 'Fee balance retrieved successfully');
            
        } catch (PDOException $e) {
            Response::serverError('Database error retrieving fee balance');
        }
    }
    
    /**
     * Get Payment Reports
     */
    public function getPaymentReports() {
        Middleware::requireAnyRole(['admin', 'accountant']);
        
        try {
            $date_from = isset($_GET['date_from']) ? Middleware::validateDate($_GET['date_from']) : date('Y-m-01');
            $date_to = isset($_GET['date_to']) ? Middleware::validateDate($_GET['date_to']) : date('Y-m-d');
            
            // Summary statistics
            $summary_query = "SELECT 
                                COUNT(*) as total_transactions,
                                COALESCE(SUM(CASE WHEN status = 'Verified' THEN amount ELSE 0 END), 0) as total_verified,
                                COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END), 0) as total_pending,
                                COALESCE(SUM(CASE WHEN status = 'Rejected' THEN amount ELSE 0 END), 0) as total_rejected,
                                COUNT(CASE WHEN payment_method = 'Bank Transfer' THEN 1 END) as bank_transfers,
                                COUNT(CASE WHEN payment_method = 'Cash' THEN 1 END) as cash_payments,
                                COUNT(CASE WHEN payment_method = 'POS' THEN 1 END) as pos_payments
                              FROM payments 
                              WHERE recorded_date BETWEEN :date_from AND :date_to";
            
            $summary_stmt = $this->conn->prepare($summary_query);
            $summary_stmt->bindParam(':date_from', $date_from);
            $summary_stmt->bindParam(':date_to', $date_to);
            $summary_stmt->execute();
            $summary = $summary_stmt->fetch();
            
            // Daily breakdown
            $daily_query = "SELECT DATE(recorded_date) as date, 
                              COUNT(*) as transactions,
                              COALESCE(SUM(amount), 0) as total_amount
                            FROM payments 
                            WHERE recorded_date BETWEEN :date_from AND :date_to
                            GROUP BY DATE(recorded_date)
                            ORDER BY date";
            
            $daily_stmt = $this->conn->prepare($daily_query);
            $daily_stmt->bindParam(':date_from', $date_from);
            $daily_stmt->bindParam(':date_to', $date_to);
            $daily_stmt->execute();
            $daily_breakdown = $daily_stmt->fetchAll();
            
            // Payment type breakdown
            $type_query = "SELECT payment_type, 
                             COUNT(*) as count,
                             COALESCE(SUM(amount), 0) as total
                           FROM payments 
                           WHERE recorded_date BETWEEN :date_from AND :date_to AND status = 'Verified'
                           GROUP BY payment_type
                           ORDER BY total DESC";
            
            $type_stmt = $this->conn->prepare($type_query);
            $type_stmt->bindParam(':date_from', $date_from);
            $type_stmt->bindParam(':date_to', $date_to);
            $type_stmt->execute();
            $type_breakdown = $type_stmt->fetchAll();
            
            $report_data = [
                'summary' => $summary,
                'daily_breakdown' => $daily_breakdown,
                'type_breakdown' => $type_breakdown,
                'period' => [
                    'date_from' => $date_from,
                    'date_to' => $date_to
                ]
            ];
            
            Response::success($report_data, 'Payment reports retrieved successfully');
            
        } catch (PDOException $e) {
            Response::serverError('Database error generating payment reports');
        }
    }
    
    /**
     * Generate Receipt Number
     */
    private function generateReceiptNumber() {
        try {
            $prefix = 'GRA';
            $date = date('Ymd');
            
            // Get count for today
            $count_query = "SELECT COUNT(*) as count FROM payments WHERE DATE(recorded_date) = CURDATE()";
            $count_stmt = $this->conn->prepare($count_query);
            $count_stmt->execute();
            $count = $count_stmt->fetch()['count'] + 1;
            
            return $prefix . $date . str_pad($count, 4, '0', STR_PAD_LEFT);
        } catch (PDOException $e) {
            return $prefix . date('Ymd') . '0001';
        }
    }
    
    /**
     * Update Student Fee Balance
     */
    private function updateStudentFeeBalance($student_id, $amount, $term, $academic_year) {
        try {
            // Check if fee balance record exists
            $check_query = "SELECT id, total_paid FROM student_fee_balances 
                           WHERE student_id = :student_id AND term = :term AND academic_year = :academic_year";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->bindParam(':student_id', $student_id);
            $check_stmt->bindParam(':term', $term);
            $check_stmt->bindParam(':academic_year', $academic_year);
            $check_stmt->execute();
            
            $balance_record = $check_stmt->fetch();
            
            if ($balance_record) {
                // Update existing record
                $new_total_paid = $balance_record['total_paid'] + $amount;
                $update_query = "UPDATE student_fee_balances 
                                SET total_paid = :total_paid, 
                                    status = CASE 
                                        WHEN total_fee_required <= :total_paid THEN 'Paid'
                                        WHEN :total_paid > 0 THEN 'Partial'
                                        ELSE 'Unpaid'
                                    END,
                                    last_payment_date = NOW()
                                WHERE id = :id";
                
                $update_stmt = $this->conn->prepare($update_query);
                $update_stmt->bindParam(':total_paid', $new_total_paid);
                $update_stmt->bindParam(':id', $balance_record['id']);
                $update_stmt->execute();
            }
        } catch (PDOException $e) {
            error_log("Error updating fee balance: " . $e->getMessage());
        }
    }
    
    /**
     * Reverse Student Fee Balance (for rejected payments)
     */
    private function reverseStudentFeeBalance($student_id, $amount, $term, $academic_year) {
        try {
            // Check if fee balance record exists
            $check_query = "SELECT id, total_paid FROM student_fee_balances 
                           WHERE student_id = :student_id AND term = :term AND academic_year = :academic_year";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->bindParam(':student_id', $student_id);
            $check_stmt->bindParam(':term', $term);
            $check_stmt->bindParam(':academic_year', $academic_year);
            $check_stmt->execute();
            
            $balance_record = $check_stmt->fetch();
            
            if ($balance_record && $balance_record['total_paid'] >= $amount) {
                // Update existing record
                $new_total_paid = $balance_record['total_paid'] - $amount;
                $update_query = "UPDATE student_fee_balances 
                                SET total_paid = :total_paid, 
                                    status = CASE 
                                        WHEN total_fee_required <= :total_paid THEN 'Paid'
                                        WHEN :total_paid > 0 THEN 'Partial'
                                        ELSE 'Unpaid'
                                    END
                                WHERE id = :id";
                
                $update_stmt = $this->conn->prepare($update_query);
                $update_stmt->bindParam(':total_paid', $new_total_paid);
                $update_stmt->bindParam(':id', $balance_record['id']);
                $update_stmt->execute();
            }
        } catch (PDOException $e) {
            error_log("Error reversing fee balance: " . $e->getMessage());
        }
    }
}
?>

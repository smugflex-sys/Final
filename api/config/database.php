<?php
/**
 * Database Configuration
 * Graceland Royal Academy School Management System
 */

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $charset = 'utf8mb4';
    
    public $conn;
    
    public function __construct() {
        // Use environment variables if available, otherwise use defaults
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->db_name = $_ENV['DB_NAME'] ?? 'graceland_academy';
        $this->username = $_ENV['DB_USER'] ?? 'root';
        $this->password = $_ENV['DB_PASS'] ?? '';
    }
    
    public function getConnection() {
        $this->conn = null;
        
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $this->conn = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
}

/**
 * Configuration Settings
 */
class Config {
    // Database Settings
    public static function get($key, $default = null) {
        return $_ENV[$key] ?? $default;
    }
    
    // JWT Settings
    const JWT_ALGORITHM = 'HS256';
    
    public static function getJwtSecret() {
        return self::get('JWT_SECRET', 'your-secret-key-change-in-production');
    }
    
    public static function getJwtExpiry() {
        return (int)self::get('JWT_EXPIRY', '86400'); // 24 hours
    }
    
    // File Upload Settings
    public static function getUploadPath() {
        return self::get('UPLOAD_PATH', '../uploads/');
    }
    
    const MAX_FILE_SIZE = 5242880; // 5MB
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
    
    // Pagination
    const DEFAULT_PAGE_SIZE = 20;
    const MAX_PAGE_SIZE = 100;
    
    // School Settings
    public static function getSchoolName() {
        return self::get('SCHOOL_NAME', 'Graceland Royal Academy');
    }
    
    public static function getSchoolEmail() {
        return self::get('SCHOOL_EMAIL', 'info@gracelandacademy.com');
    }
    
    public static function getSchoolPhone() {
        return self::get('SCHOOL_PHONE', '+234-800-000-0000');
    }
    
    public static function getSchoolAddress() {
        return self::get('SCHOOL_ADDRESS', '123 Education Street, Lagos, Nigeria');
    }
    
    // CORS Headers
    public static function getAllowedOrigins() {
        $origins = self::get('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173');
        return array_map('trim', explode(',', $origins));
    }
    
    // API Version
    const API_VERSION = '1.0.0';
    
    // Application Environment
    public static function isDebugMode() {
        return self::get('APP_DEBUG', 'false') === 'true';
    }
    
    public static function getAppEnv() {
        return self::get('APP_ENV', 'development');
    }
    
    // Timezone
    public static function getTimezone() {
        return self::get('APP_TIMEZONE', 'Africa/Lagos');
    }
}
?>

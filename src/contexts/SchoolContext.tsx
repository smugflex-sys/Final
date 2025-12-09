/**
 * School Context
 * Graceland Royal Academy School Management System
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { setAuthToken, setCurrentUser } from '../config/api';
import { saveToLocalStorage, loadFromLocalStorage, type StorageData } from '../utils/storageManager';
import sqlDatabase from '../services/sqlDatabase';

// ==================== INTERFACES ====================

export interface Student {
  id: number;
  firstName: string; // changed from first_name
  lastName: string; // changed from last_name
  otherName?: string; // changed from other_name
  admissionNumber: string; // changed from admission_number
  class_id: number; // matches database
  level: string;
  parent_id: number | null; // matches database
  date_of_birth: string; // matches database
  gender: 'Male' | 'Female';
  photo_url?: string; // matches database
  passport_photo?: string; // base64 encoded - matches database
  status: 'Active' | 'Inactive' | 'Graduated' | 'Transferred';
  academic_year: string; // matches database
  admission_date?: string; // matches database
  created_at: string; // matches database
  updated_at: string; // matches database
  // Computed fields (from JOINs)
  className?: string; // from classes table
  classCategory?: string; // from classes table
  parentName?: string; // from parents table
}

export interface Teacher {
  id: number;
  firstName: string; // changed from first_name
  lastName: string; // changed from last_name
  otherName?: string; // changed from other_name
  employeeId: string; // changed from employee_id
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | null; // matches database
  qualification: string;
  specialization: string; // JSON string from database
  status: 'Active' | 'Inactive';
  is_class_teacher: boolean; // matches database
  department_id: number | null; // matches database
  signature?: string; // base64 encoded - matches database
  created_at: string; // matches database
  updated_at: string; // matches database
  // Computed fields
  department_name?: string; // from departments table
}

export interface Parent {
  id: number;
  first_name: string; // matches database
  last_name: string; // matches database
  email: string;
  phone: string;
  alternate_phone?: string; // matches database
  address?: string; // matches database
  occupation?: string; // matches database
  status: 'Active' | 'Inactive';
  created_at: string; // matches database
  updated_at: string; // matches database
  // Computed fields
  student_ids?: number[]; // from parent_student_links table
  children_count?: number; // computed from parent_student_links
  // Computed display fields (for frontend convenience)
  firstName?: string; // computed from first_name
  lastName?: string; // computed from last_name
}

export interface Class {
  id: number;
  name: string; // matches database
  level: string; // matches database
  section?: string; // matches database
  category: 'Primary' | 'Secondary'; // matches database
  capacity: number; // matches database
  currentStudents: number; // mapped from current_students
  classTeacherId: number | null; // mapped from class_teacher_id
  classTeacher?: string; // mapped from class_teacher
  academicYear: string; // mapped from academic_year
  status: 'Active' | 'Inactive'; // matches database
  createdAt: string; // mapped from created_at
  updatedAt: string; // mapped from updated_at
  // Computed fields
  class_teacher_name?: string; // from teachers table
  enrolled_students?: number; // computed from students table
}

export interface Subject {
  id: number;
  name: string; // matches database
  code: string; // matches database
  category: 'Creche' | 'Nursery' | 'Primary' | 'JSS' | 'SS' | 'General'; // matches database
  department?: string; // matches database
  description?: string; // matches database
  is_core: boolean; // matches database
  status: 'Active' | 'Inactive'; // matches database
  created_at: string; // matches database
  updated_at: string; // matches database
}

export interface SubjectAssignment {
  id: number;
  subject_id: number; // matches database
  class_id: number; // matches database
  teacher_id: number; // matches database
  academic_year: string; // matches database
  term: 'First Term' | 'Second Term' | 'Third Term'; // matches database
  status: 'Active' | 'Inactive'; // matches database
  created_at: string; // matches database
  updated_at: string; // matches database
  // Computed fields
  subject_name?: string; // from subjects table
  class_name?: string; // from classes table
  teacher_name?: string; // from teachers table
}

export interface SubjectRegistration {
  id: number;
  subject_id: number; // matches database
  class_id: number; // matches database
  academic_year: string; // matches database
  term: 'First Term' | 'Second Term' | 'Third Term'; // matches database
  is_compulsory: boolean; // matches database
  status: 'Active' | 'Inactive'; // matches database
  created_at: string; // matches database
  updated_at: string; // matches database
  // Computed fields
  subject_name?: string; // from subjects table
  subject_code?: string; // from subjects table
  subject_category?: string; // from subjects table
  class_name?: string; // from classes table
  class_level?: string; // from classes table
}

export interface Score {
  id: number;
  student_id: number; // matches database
  subject_assignment_id: number; // matches database
  ca1: number; // matches database
  ca2: number; // matches database
  exam: number; // matches database
  total: number; // matches database (generated column)
  grade?: string; // matches database
  remark?: string; // matches database
  class_average?: number; // matches database
  class_min?: number; // matches database
  class_max?: number; // matches database
  entered_by: number; // matches database
  entered_date: string; // matches database
  status: 'Draft' | 'Submitted' | 'Rejected'; // matches database
  rejection_reason?: string; // matches database
  rejected_by?: number; // matches database (class teacher id)
  rejected_date?: string; // matches database
  academic_year?: string; // matches database
  term?: 'First Term' | 'Second Term' | 'Third Term'; // matches database
  // Computed fields
  subject_name?: string; // from subject_assignments + subjects
  class_name?: string; // from subject_assignments + classes
  student_name?: string; // from students
}

export interface AffectiveDomain {
  id: number;
  student_id: number;
  class_id: number;
  term: string;
  academic_year: string;
  attentiveness: number;
  attentiveness_remark: string;
  honesty: number;
  honesty_remark: string;
  punctuality: number;
  punctuality_remark: string;
  neatness: number;
  neatness_remark: string;
  obedience: number;
  obedience_remark: string;
  sense_of_responsibility: number;
  sense_of_responsibility_remark: string;
  entered_by: number;
  entered_date: string;
}

export interface PsychomotorDomain {
  id: number;
  student_id: number;
  class_id: number;
  term: string;
  academic_year: string;
  attention_to_direction: number;
  attention_to_direction_remark: string;
  considerate_of_others: number;
  considerate_of_others_remark: string;
  handwriting: number;
  handwriting_remark: string;
  sports: number;
  sports_remark: string;
  handwork: number;
  handwork_remark: string;
  drawing: number;
  drawing_remark: string;
  music: number;
  music_remark: string;
  verbal_fluency: number;
  verbal_fluency_remark: string;
  works_well_independently: number;
  works_well_independently_remark: string;
  entered_by: number;
  entered_date: string;
}

export interface CompiledResult {
  id: number;
  student_id: number;
  class_id: number;
  term: string;
  academic_year: string;
  scores: Score[];
  affective: AffectiveDomain | null;
  psychomotor: PsychomotorDomain | null;
  total_score: number;
  average_score: number;
  class_average: number;
  position: number;
  total_students: number;
  times_present: number;
  times_absent: number;
  total_attendance_days: number;
  term_begin: string;
  term_end: string;
  next_term_begin: string;
  class_teacher_name: string;
  class_teacher_comment: string;
  principal_name: string;
  principal_comment: string;
  principal_signature: string;
  compiled_by: number;
  compiled_date: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  approved_by: number | null;
  approved_date: string | null;
  rejection_reason: string | null;
}

export interface FeeStructure {
  id: number;
  class_id: number;
  class_name: string;
  level: string;
  term: string;
  academic_year: string;
  tuition_fee: number;
  development_levy: number;
  sports_fee: number;
  exam_fee: number;
  books_fee: number;
  uniform_fee: number;
  transport_fee: number;
  total_fee: number;
}

export interface StudentFeeBalance {
  id: number;
  student_id: number;
  class_id: number;
  term: string;
  academic_year: string;
  total_fee_required: number;
  total_paid: number;
  balance: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
}

export interface Payment {
  id: number;
  student_id: number;
  student_name: string;
  amount: number;
  payment_type: string;
  term: string;
  academic_year: string;
  payment_method: string;
  reference: string;
  recorded_by: number;
  recorded_date: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  receipt_number: string;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'teacher' | 'accountant' | 'parent';
  linked_id: number; // links to teacher/parent/accountant id - matches database
  email: string;
  status: 'Active' | 'Inactive';
  last_login: string | null; // matches database
  created_at: string; // matches database
  updated_at: string; // matches database
  token?: string; // JWT token for API authentication (runtime only)
}

export interface LoginResponse {
  id: string;
  username: string;
  role: string;
  linked_id: number;
  email: string;
  first_name: string;
  last_name: string;
  token: string;
}

export interface Accountant {
  id: number;
  firstName: string; // changed from first_name
  lastName: string; // changed from last_name
  employeeId: string; // changed from employee_id
  email: string;
  phone: string;
  department?: string;
  status: 'Active' | 'Inactive';
  created_at: string; // matches database
  updated_at: string; // matches database
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetAudience: 'all' | 'teachers' | 'parents' | 'students' | 'accountants';
  sentBy: number; // admin user id
  sentDate: string;
  isRead: boolean;
  readBy: number[]; // user ids who have read this
}

export interface ActivityLog {
  id: number;
  actor: string;
  actor_role: 'Admin' | 'Teacher' | 'Accountant' | 'Parent' | 'System';
  action: string;
  target: string;
  timestamp: string;
  ip_address: string;
  status: 'Success' | 'Failed';
  details?: string;
  user_id?: number;
}

export interface Attendance {
  id: number;
  student_id: number;
  class_id: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  marked_by: number;
  marked_date: string;
  term: string;
  academic_year: string;
  remarks?: string;
}

export interface ExamTimetable {
  id: number;
  class_id: number;
  class_name?: string;
  subject_id: number;
  subject_name?: string;
  exam_type: 'CA1' | 'CA2' | 'Exam' | 'Practical';
  exam_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  venue?: string;
  supervisor_id?: number;
  term: string;
  academic_year: string;
  instructions?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ClassTimetable {
  id: number;
  class_id: number;
  class_name: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number;
  start_time: string;
  end_time: string;
  subject_id: number;
  subject_name: string;
  teacher_id: number;
  teacher_name: string;
  venue: string;
  term: string;
  academic_year: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  head_of_department: string;
  head_of_department_id: number | null;
  description: string;
  teacher_count: number;
  status: 'Active' | 'Inactive';
}

export interface Scholarship {
  id: number;
  name: string;
  type: 'Percentage' | 'Fixed Amount';
  value: number;
  description: string;
  eligibility_criteria: string;
  beneficiaries: number;
  total_budget: number;
  status: 'Active' | 'Inactive';
  academic_year: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  class_id: number;
  class_name: string;
  subject_id: number;
  subject_name: string;
  teacher_id: number;
  teacher_name: string;
  due_date: string;
  total_marks: number;
  assigned_date: string;
  term: string;
  academic_year: string;
  status: 'Active' | 'Completed' | 'Overdue';
  attachment_url?: string;
}

export interface SchoolSettings {
  school_name: string;
  school_motto: string;
  school_logo_url?: string;
  principal_name: string;
  principal_signature?: string;
  head_teacher_name?: string;
  head_teacher_signature?: string;
  principal_comment?: string;
  head_teacher_comment?: string;
  resumption_date?: string;
  school_address?: string;
  school_phone?: string;
  school_email?: string;
}

export interface BankAccountSettings {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  payment_methods: {
    bank_transfer: boolean;
    online_payment: boolean;
    cash: boolean;
  };
  updated_by: number;
  updated_date: string;
}

// ==================== CONTEXT ====================

interface SchoolContextType {
  // Data
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  accountants: Accountant[];
  classes: Class[];
  subjects: Subject[];
  subjectAssignments: SubjectAssignment[];
  subjectRegistrations: SubjectRegistration[];
  scores: Score[];
  affectiveDomains: AffectiveDomain[];
  psychomotorDomains: PsychomotorDomain[];
  compiledResults: CompiledResult[];
  payments: Payment[];
  users: User[];
  currentUser: User | null;
  feeStructures: FeeStructure[];
  studentFeeBalances: StudentFeeBalance[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  attendances: Attendance[];
  examTimetables: ExamTimetable[];
  classTimetables: ClassTimetable[];
  departments: Department[];
  scholarships: Scholarship[];
  assignments: Assignment[];
  parentStudentLinks: any[];

  // Settings
  currentTerm: string;
  currentAcademicYear: string;
  schoolSettings: SchoolSettings;
  bankAccountSettings: BankAccountSettings | null;
  
  // System Settings Methods
  loadCurrentTermAndYear: () => Promise<void>;
  loadSchoolSettings: () => Promise<void>;
  getAllAcademicYears: () => Promise<string[]>;
  getCompiledResultsByYearAndTerm: (academicYear: string, term: string) => Promise<CompiledResult[]>;
  updateCurrentTerm: (term: string) => Promise<void>;
  updateCurrentAcademicYear: (year: string) => Promise<void>;
  updateSchoolSettings: (settings: Partial<SchoolSettings>) => Promise<void>;
  updateBankAccountSettings: (settings: Omit<BankAccountSettings, 'id' | 'updated_date'>) => void;
  getBankAccountSettings: () => BankAccountSettings | null;
  updateAttendanceRequirements: (requirements: Record<string, number>) => Promise<void>;
  getAttendanceRequirements: () => Record<string, number>;
  loadAttendanceRequirements: () => Promise<void>;

  // Student Methods
  addStudent: (student: Omit<Student, 'id'>) => Promise<number>;
  updateStudent: (id: number, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
  deleteBulkStudents: (studentIds: number[]) => Promise<any>;
  getStudentsByClass: (classId: number) => Student[];
  refreshStudents: () => Promise<void>;
  promoteStudent: (studentId: number, newClassId: number, newAcademicYear: string) => void;
  promoteMultipleStudents: (studentIds: number[], classMapping: { [studentId: number]: number }, newAcademicYear: string) => void;

  // Teacher Methods
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Promise<number>;
  updateTeacher: (id: number, teacher: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: number) => Promise<void>;
  getTeacherAssignments: (teacherId: number) => SubjectAssignment[];
  getTeacherClasses: (teacherId: number) => Array<{
    classId: number;
    className: string;
    classLevel: string;
    studentCount: number;
    subjects: Array<{
      subjectId: number;
      subjectName: string;
      subjectCode: string;
    }>;
  }>;
  updateTeacherStatus: (id: number, status: string) => Promise<void>;
  getTeacherClassTeacherAssignments: (teacherId: number) => number[];
  validateClassTeacherAssignment: (teacherId: number, newClassId: number) => { valid: boolean; message: string };
  getTeacherStudents: (teacherId: number, classId: number) => Student[];
  getTeacherResponsibilities: (teacherId: number) => {
    isClassTeacher: boolean;
    assignedClassesCount: number;
    totalStudentsCount: number;
    subjectsCount: number;
    canEnterScores: boolean;
    canCompileResults: boolean;
    canViewResults: boolean;
    canManageAttendance: boolean;
    canManageAffectivePsychomotor: boolean;
    canManageTimetable: boolean;
    canMessageParents: boolean;
    departments: string[];
    classTeacherClassesCount: number;
    subjectAssignedClassesCount: number;
    classTeacherClassIds: number[];
    subjectAssignedClassIds: number[];
  };

  // Parent Methods
  addParent: (parent: Omit<Parent, 'id'>) => Promise<number>;
  updateParent: (id: number, parent: Partial<Parent>) => Promise<void>;
  deleteParent: (id: number) => Promise<void>;
  getParentStudents: (parentId: number) => Student[];
  getParentChildren: (parentId: number) => Array<{
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    admissionNumber: string;
    classId: number;
    className: string;
    classLevel: string;
    gender: string;
    photoUrl?: string;
    status: string;
    academicYear: string;
    currentTerm: string;
    subjects: Array<{
      subjectId: number;
      subjectName: string;
      subjectCode: string;
      isCompulsory: boolean;
      teacherId?: number;
      teacherName: string;
    }>;
    recentScores: Score[];
    averageScore: number;
    feeBalance: number;
    totalFees: number;
    feeStatus: string;
    attendanceRecords: Attendance[];
    attendanceRate: number;
    recentActivities: Array<{
      type: string;
      title: string;
      description: string;
      date: string;
      icon: string;
    }>;
  }>;
  getStudentSubjects: (studentId: number) => Array<{
    subjectId: number;
    subjectName: string;
    subjectCode: string;
    isCompulsory: boolean;
    teacherId?: number;
    teacherName: string;
  }>;
  getStudentRecentScores: (studentId: number) => Score[];
  getStudentRecentActivities: (studentId: number) => Array<{
    type: string;
    title: string;
    description: string;
    date: string;
    icon: string;
  }>;
  linkStudentToParent: (parentId: number, studentId: number, relationship?: 'Father' | 'Mother' | 'Guardian') => Promise<boolean>;
  linkParentToStudent: (parentId: number, studentId: number) => Promise<void>;
  unlinkStudentFromParent: (parentId: number, studentId: number) => Promise<boolean>;
  getParentPermissions: (parentId: number) => Array<{
    module: string;
    permissions: string[];
  }>;

  // Accountant Methods
  addAccountant: (accountant: Omit<Accountant, 'id'>) => Promise<number>;
  updateAccountant: (id: number, accountant: Partial<Accountant>) => Promise<void>;
  deleteAccountant: (id: number) => Promise<void>;

  // Class Methods
  addClass: (classData: Omit<Class, 'id'>) => Promise<number>;
  updateClass: (id: number, classData: Partial<Class>) => Promise<void>;
  deleteClass: (id: number) => Promise<void>;
  getClassesByLevel: (level: string) => Class[];
  getClassStudents: (classId: number) => Student[];
  getClassTeacher: (classId: number) => Teacher | null;
  getClassSubjects: (classId: number) => Subject[];
  updateClassTeacher: (classId: number, teacherId: number) => Promise<void>;
  updateClassStudentCount: (classId: number) => Promise<void>;

  // Subject Methods
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<number>;
  updateSubject: (id: number, subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: number) => Promise<void>;
  getSubjectsByCategory: (category: string) => Subject[];
  getSubjectsByLevel: (level: string) => Subject[];

  // Subject Registration Methods
  registerSubjectForClass: (classId: number, subjectId: number, academicYear: string, term: string, isCompulsory?: boolean) => Promise<boolean>;
  removeSubjectRegistration: (classId: number, subjectId: number, academicYear: string, term: string) => Promise<boolean>;
  getRegisteredSubjects: (classId: number, academicYear: string, term: string) => Subject[];
  getSubjectRegistrations: (academicYear: string, term: string) => SubjectRegistration[];

  // Subject Assignment Methods
  assignSubjectToTeacher: (teacherId: number, subjectId: number, classId: number, academicYear: string, term: string) => Promise<boolean>;
  removeSubjectAssignment: (teacherId: number, subjectId: number, classId: number, academicYear: string, term: string) => Promise<boolean>;
  getSubjectAssignments: (academicYear: string, term: string) => SubjectAssignment[];
  getTeacherSubjectAssignments: (teacherId: number, academicYear: string, term: string) => SubjectAssignment[];
  getClassSubjectAssignments: (classId: number, academicYear: string, term: string) => SubjectAssignment[];
  getUnassignedSubjects: (classId: number, academicYear: string, term: string) => Subject[];
  getAvailableTeachers: (academicYear: string, term: string, subjectId: number, classId: number) => Teacher[];

  // Score Methods
  addScore: (score: Omit<Score, 'id'>) => Promise<number>;
  updateScore: (id: number, score: Partial<Score>) => Promise<void>;
  deleteScore: (id: number) => Promise<void>;
  createBatchScores: (batchScores: Omit<Score, 'id'>[]) => Promise<boolean>;
  getScoresByStudent: (studentId: number) => Score[];
  getScoresByAssignment: (subjectAssignmentId: number) => Score[];
  getScoresByClass: (classId: number, academicYear: string, term: string) => Score[];
  rejectScore: (scoreId: number, rejectionReason: string, rejectedBy: number) => Promise<void>;
  approveScore: (scoreId: number, approvedBy: number) => Promise<void>;
  getPendingScores: (classId?: number) => Score[];

  // Result Methods
  addCompiledResult: (result: Omit<CompiledResult, 'id'>) => Promise<number>;
  updateCompiledResult: (id: number, result: Partial<CompiledResult>) => Promise<void>;
  deleteCompiledResult: (id: number) => Promise<void>;
  getCompiledResults: (academicYear: string, term: string) => CompiledResult[];
  getResultsByClass: (classId: number, academicYear: string, term: string) => CompiledResult[];
  getResultsByStudent: (studentId: number, academicYear: string, term: string) => CompiledResult[];
  approveCompiledResult: (id: number) => Promise<void>;
  publishCompiledResult: (id: number) => Promise<void>;

  // Attendance Methods
  addAttendance: (attendance: Omit<Attendance, 'id'>) => Promise<number>;
  updateAttendance: (id: number, attendance: Partial<Attendance>) => Promise<void>;
  deleteAttendance: (id: number) => Promise<void>;
  getAttendanceByStudent: (studentId: number, academicYear: string, term: string) => Attendance[];
  getAttendancesByStudent: (studentId: number) => Attendance[];
  getAttendanceByClass: (classId: number, date: string) => Attendance[];
  getAttendancesByClass: (classId: number) => Attendance[];
  getAttendancesByDate: (date: string) => Attendance[];
  getAttendanceSummary: (classId: number, academicYear: string, term: string) => Array<{
    studentId: number;
    studentName: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendanceRate: number;
  }>;
  createBatchAttendance: (attendanceRecords: Omit<Attendance, 'id'>[]) => Promise<boolean>;

  // Payment Methods
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: number, payment: Partial<Payment>) => void;
  verifyPayment: (id: number) => void;
  getPaymentsByStudent: (studentId: number) => Payment[];

  // User Management Methods
  login: (username: string, password: string, role: string) => Promise<User | null>;
  setCurrentUser: (user: User | null) => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  createUser: (userData: any) => Promise<User | null>;
  updateUser: (id: number, userData: any) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  updateUserStatus: (id: number, status: string) => Promise<boolean>;
  resetUserPassword: (id: number) => Promise<string>;
  getUserPermissions: (userId: number) => Promise<string[]>;
  createUserAPI: (userData: any) => Promise<User | null>;
  updateUserAPI: (id: number, userData: any) => Promise<boolean>;
  deleteUserAPI: (id: number) => Promise<boolean>;
  updateUserStatusAPI: (id: number, status: string) => Promise<boolean>;
  resetUserPasswordAPI: (id: number, newPassword?: string) => Promise<string>;
  getUserPermissionsAPI: (userId: number) => Promise<string[]>;
  checkUserPermissionAPI: (role: string, permission: string) => Promise<boolean>;
  getPendingApprovals: () => any[];

  // Fee Management Methods
  addFeeStructure: (feeStructure: Omit<FeeStructure, 'id'>) => Promise<number>;
  updateFeeStructure: (id: number, feeStructure: Partial<FeeStructure>) => Promise<void>;
  deleteFeeStructure: (id: number) => Promise<void>;
  getFeeStructures: (classId: number, academicYear: string) => FeeStructure[];
  getStudentFeeBalance: (studentId: number) => StudentFeeBalance | null;
  updateStudentFeeBalance: (studentId: number, balance: Partial<StudentFeeBalance>) => Promise<void>;

  // Notification Methods
  addNotification: (notification: Omit<Notification, 'id'>) => Promise<number>;
  markNotificationAsRead: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  getUnreadNotifications: () => Notification[];
  getAllNotifications: () => Notification[];

  // Activity Log Methods
  addActivityLog: (log: ActivityLog) => Promise<number>;
  getActivityLogs: (userId?: number, action?: string) => ActivityLog[];

  // Timetable Methods
  addExamTimetable: (timetable: Omit<ExamTimetable, 'id'>) => Promise<number>;
  updateExamTimetable: (id: number, timetable: Partial<ExamTimetable>) => Promise<void>;
  deleteExamTimetable: (id: number) => Promise<void>;
  getExamTimetables: (classId: number, academicYear: string, term: string) => ExamTimetable[];
  getExamTimetablesByClass: (classId: number) => ExamTimetable[];
  getExamTimetablesBySubject: (subjectId: number) => ExamTimetable[];
  getExamTimetablesByDate: (date: string) => ExamTimetable[];

  addClassTimetable: (timetable: Omit<ClassTimetable, 'id'>) => Promise<number>;
  updateClassTimetable: (id: number, timetable: Partial<ClassTimetable>) => Promise<void>;
  deleteClassTimetable: (id: number) => Promise<void>;
  getClassTimetables: (classId: number, academicYear: string, term: string) => ClassTimetable[];
  getClassTimetablesByClass: (classId: number) => ClassTimetable[];
  getClassTimetablesBySubject: (subjectId: number) => ClassTimetable[];
  getClassTimetablesByDay: (day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday') => ClassTimetable[];

  // Department Methods
  addDepartment: (department: Omit<Department, 'id'>) => Promise<number>;
  updateDepartment: (id: number, department: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: number) => Promise<void>;
  getDepartments: () => Department[];

  // Scholarship Methods
  addScholarship: (scholarship: Omit<Scholarship, 'id'>) => Promise<number>;
  updateScholarship: (id: number, scholarship: Partial<Scholarship>) => Promise<void>;
  deleteScholarship: (id: number) => Promise<void>;
  getScholarships: () => Scholarship[];
  getStudentScholarships: (studentId: number) => Scholarship[];

  // Assignment Methods
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: number, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: number) => void;

  // Data Loading Methods
  loadUsersFromAPI: () => Promise<boolean>;
  loadTeachersFromAPI: () => Promise<boolean>;
  loadParentsFromAPI: () => Promise<boolean>;
  loadParentStudentLinksFromAPI: () => Promise<boolean>;
  loadAccountantsFromAPI: () => Promise<boolean>;
  loadStudentsFromAPI: () => Promise<boolean>;
  loadClassesFromAPI: () => Promise<boolean>;
  loadSubjectsFromAPI: () => Promise<boolean>;
  loadSubjectRegistrationsFromAPI: () => Promise<boolean>;
  loadSubjectAssignmentsFromAPI: () => Promise<boolean>;
  loadAllDataFromAPI: () => Promise<void>;
  loadFeeStructuresFromAPI: () => Promise<boolean>;
  loadStudentFeeBalancesFromAPI: () => Promise<boolean>;
  loadNotificationsFromAPI: () => Promise<boolean>;
  loadAttendancesFromAPI: () => Promise<boolean>;
  loadScoresFromAPI: () => Promise<boolean>;
  loadCompiledResultsFromAPI: () => Promise<boolean>;
  loadAffectiveDomainsFromAPI: () => Promise<boolean>;
  loadPsychomotorDomainsFromAPI: () => Promise<boolean>;
  loadExamTimetablesFromAPI: () => Promise<boolean>;
  loadClassTimetablesFromAPI: () => Promise<boolean>;
  loadDepartmentsFromAPI: () => Promise<boolean>;
  loadScholarshipsFromAPI: () => Promise<boolean>;
  loadAssignmentsFromAPI: () => Promise<boolean>;

  // Payment API Methods
  createPaymentAPI: (payment: any) => Promise<any>;
  loadPaymentsFromAPI: () => Promise<boolean>;
  createFeeStructureAPI: (feeStructure: any) => Promise<any>;
  getFeeStructuresAPI: () => Promise<any>;
  getPaymentsAPI: () => Promise<any>;
  updatePaymentStatusAPI: (paymentId: number, status: string) => Promise<any>;
  getFeeBalancesAPI: () => Promise<any>;
  createBatchPaymentsAPI: (payments: any[]) => Promise<any>;

  // Subject Registration API Methods
  registerSubjectForClassAPI: (classId: number, subjectId: number, academicYear: string, term: string, isCompulsory?: boolean) => Promise<boolean>;
  removeSubjectRegistrationAPI: (classId: number, subjectId: number, academicYear: string, term: string) => Promise<boolean>;
  getSubjectRegistrationsAPI: (classId?: number, academicYear?: string, term?: string) => Promise<any>;
  getRegisteredSubjectsAPI: (classId: number, academicYear: string, term: string) => Promise<any>;
  getActiveAcademicYearAPI: () => Promise<string>;
  getActiveTermAPI: () => Promise<string>;

  // Subject Assignment API Methods
  getSubjectAssignmentsAPI: (academicYear: string, term: string) => Promise<any>;
  assignSubjectToTeacherAPI: (teacherId: number, subjectId: number, classId: number, academicYear: string, term: string) => Promise<boolean>;
  removeSubjectAssignmentAPI: (teacherId: number, subjectId: number, classId: number, academicYear: string, term: string) => Promise<boolean>;
  getUnassignedSubjectsAPI: (classId: number, academicYear: string, term: string) => Promise<any>;
  getAvailableTeachersAPI: (academicYear: string, term: string, subjectId: number, classId: number) => Promise<Teacher[]>;

  // Teacher API Methods
  createTeacherAPI: (teacherData: any) => Promise<any>;
  updateTeacherAPI: (id: number, teacherData: any) => Promise<boolean>;
  deleteTeacherAPI: (id: number) => Promise<boolean>;
  updateTeacherStatusAPI: (id: number, status: string) => Promise<boolean>;

  // Parent API Methods
  createParentAPI: (parentData: any) => Promise<any>;
  updateParentAPI: (id: number, parentData: any) => Promise<boolean>;
  deleteParentAPI: (id: number) => Promise<boolean>;
  updateParentStatusAPI: (id: number, status: string) => Promise<boolean>;

  // Accountant API Methods
  createAccountantAPI: (accountantData: any) => Promise<any>;
  updateAccountantAPI: (id: number, accountantData: any) => Promise<boolean>;
  deleteAccountantAPI: (id: number) => Promise<boolean>;
  updateAccountantStatusAPI: (id: number, status: string) => Promise<boolean>;

  // Affective and Psychomotor API Methods
  addAffectiveDomain: (affectiveData: any) => Promise<any>;
  createAffectiveDomain: (affectiveData: any) => Promise<any>;
  updateAffectiveDomain: (id: number, affectiveData: any) => Promise<any>;
  deleteAffectiveDomain: (id: number) => Promise<any>;
  addPsychomotorDomain: (psychomotorData: any) => Promise<any>;
  createPsychomotorDomain: (psychomotorData: any) => Promise<any>;
  updatePsychomotorDomain: (id: number, psychomotorData: any) => Promise<any>;
  deletePsychomotorDomain: (id: number) => Promise<any>;

  // Real-time Sync Methods
  refreshAllData: () => Promise<void>;
  refreshTeacherData: (teacherId: number) => Promise<void>;
  refreshClassData: (classId: number) => Promise<void>;
  
  // Permission checking methods
  hasPermission: (permission: string) => Promise<boolean>;
  canViewStudents: () => Promise<boolean>;
  canManageScores: () => Promise<boolean>;
  canViewResults: () => Promise<boolean>;
  canManageClasses: () => Promise<boolean>;
  canManageSubjects: () => Promise<boolean>;
  
  // Real-time event listeners
  subscribeToDataUpdates: (callback: () => void) => () => void;
};

// ==================== CONTEXT PROVIDER ====================

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function useSchool() {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within SchoolProvider');
  }
  return context;
}

// ==================== PROVIDER ====================

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [currentTerm, setCurrentTerm] = useState('');
  const [currentAcademicYear, setCurrentAcademicYear] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    school_name: '',
    school_motto: '',
    principal_name: '',
    head_teacher_name: '',
    principal_comment: '',
    head_teacher_comment: '',
    resumption_date: ''
  });

  const [bankAccountSettings, setBankAccountSettings] = useState<BankAccountSettings | null>(null);

  // Initialize empty data arrays - All data created through the system
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [subjectRegistrations, setSubjectRegistrations] = useState<SubjectRegistration[]>([]);
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignment[]>([]);

  const [scores, setScores] = useState<Score[]>([]);
  const [affectiveDomains, setAffectiveDomains] = useState<AffectiveDomain[]>([]);
  const [psychomotorDomains, setPsychomotorDomains] = useState<PsychomotorDomain[]>([]);
  const [compiledResults, setCompiledResults] = useState<CompiledResult[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [studentFeeBalances, setStudentFeeBalances] = useState<StudentFeeBalance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [attendanceRequirements, setAttendanceRequirements] = useState<Record<string, number>>({});

  // Initialize with empty arrays - all data loaded from database
  const [users, setUsers] = useState<User[]>([]);
  const [examTimetables, setExamTimetables] = useState<ExamTimetable[]>([]);
  const [classTimetables, setClassTimetables] = useState<ClassTimetable[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [parentStudentLinksData, setParentStudentLinksData] = useState<any[]>([]);

  // ==================== API IMPLEMENTATIONS ====================

  // User API Methods
  const loadUsersFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM users ORDER BY created_at DESC');
      if (result && result.data) {
        setUsers(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading users:', error);
      return false;
    }
  };

  const loadActivityLogsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery(`
        SELECT 
          id,
          actor,
          actor_role as actorRole,
          action,
          target,
          ip_address as ipAddress,
          status,
          details,
          user_id as userId,
          created_at as timestamp
        FROM activity_logs 
        ORDER BY created_at DESC
        LIMIT 1000
      `);
      if (result && result.data) {
        setActivityLogs(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading activity logs:', error);
      return false;
    }
  };

  const loadTeachersFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery(`
        SELECT 
          id, 
          first_name as firstName, 
          last_name as lastName, 
          other_name as otherName,
          employee_id as employeeId, 
          email, 
          phone, 
          gender, 
          qualification, 
          specialization, 
          status, 
          is_class_teacher as isClassTeacher, 
          department_id as departmentId,
          created_at as createdAt,
          updated_at as updatedAt
        FROM teachers 
        ORDER BY created_at DESC
      `);
      if (result && result.data) {
        setTeachers(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading teachers:', error);
      return false;
    }
  };

  const loadParentsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM parents ORDER BY created_at DESC');
      if (result && result.data) {
        // Add computed firstName/lastName fields for frontend compatibility
        const parentsWithComputed = result.data.map((parent: any) => ({
          ...parent,
          firstName: parent.first_name,
          lastName: parent.last_name
        }));
        setParents(parentsWithComputed);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading parents:', error);
      return false;
    }
  };

  const loadParentStudentLinksFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM parent_student_links ORDER BY created_at DESC');
      if (result && result.data) {
        setParentStudentLinksData(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading parent student links:', error);
      return false;
    }
  };

  const loadAccountantsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM accountants ORDER BY created_at DESC');
      if (result && result.data) {
        // Transform snake_case to camelCase for frontend compatibility
        const transformedData = result.data.map((accountant: any) => ({
          id: accountant.id,
          firstName: accountant.first_name,
          lastName: accountant.last_name,
          employeeId: accountant.employee_id,
          email: accountant.email,
          phone: accountant.phone,
          department: accountant.department,
          status: accountant.status,
          created_at: accountant.created_at,
          updated_at: accountant.updated_at
        }));
        setAccountants(transformedData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading accountants:', error);
      return false;
    }
  };

  const loadStudentsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery(`
        SELECT 
          s.id, 
          s.first_name as firstName,
          s.last_name as lastName,
          s.other_name as otherName,
          s.admission_number as admissionNumber,
          s.class_id,
          s.level,
          s.parent_id,
          s.date_of_birth as dateOfBirth,
          s.gender,
          s.photo_url as photoUrl,
          s.passport_photo as passportPhoto,
          s.status,
          s.academic_year as academicYear,
          s.admission_date as admissionDate,
          s.created_at as createdAt,
          s.updated_at as updatedAt,
          c.name as className,
          c.category as classCategory
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        ORDER BY s.first_name ASC
      `);
      if (result && result.data) {
        console.log('Loaded students from database:', result.data);
        setStudents(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading students:', error);
      return false;
    }
  };

  const loadClassesFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery(`
        SELECT 
          c.id, 
          c.name, 
          c.level, 
          c.section, 
          c.category, 
          c.capacity, 
          c.current_students as currentStudents, 
          c.class_teacher_id as classTeacherId, 
          CONCAT(t.first_name, ' ', t.last_name) as classTeacher,
          c.academic_year as academicYear, 
          c.status,
          c.created_at as createdAt,
          c.updated_at as updatedAt
        FROM classes c
        LEFT JOIN teachers t ON c.class_teacher_id = t.id
        ORDER BY c.created_at DESC
      `);
      if (result && result.data) {
        setClasses(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading classes:', error);
      return false;
    }
  };

  const loadSubjectsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery(`
        SELECT 
          id, 
          name, 
          code, 
          category, 
          department, 
          description, 
          is_core as isCore, 
          status,
          created_at as createdAt,
          updated_at as updatedAt
        FROM subjects 
        ORDER BY created_at DESC
      `);
      if (result && result.data) {
        setSubjects(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading subjects:', error);
      return false;
    }
  };

  const loadSubjectRegistrationsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM subject_registrations ORDER BY created_at DESC');
      if (result && result.data) {
        setSubjectRegistrations(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading subject registrations:', error);
      return false;
    }
  };

  const loadSubjectAssignmentsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery(`
        SELECT 
          sa.id,
          sa.subject_id,
          sa.class_id,
          sa.teacher_id,
          sa.academic_year,
          sa.term,
          sa.status,
          sa.created_at,
          sa.updated_at,
          s.name as subject_name,
          s.code as subject_code,
          c.name as class_name,
          c.level as class_level,
          CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
          t.first_name as teacher_first_name,
          t.last_name as teacher_last_name
        FROM subject_assignments sa
        JOIN subjects s ON sa.subject_id = s.id
        JOIN classes c ON sa.class_id = c.id
        JOIN teachers t ON sa.teacher_id = t.id
        ORDER BY sa.created_at DESC
      `);
      if (result && result.data) {
        console.log('Loaded subject assignments from database:', result.data);
        setSubjectAssignments(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading subject assignments:', error);
      return false;
    }
  };

  // Student API Methods
  const createStudentAPI = async (studentData: any): Promise<boolean> => {
    try {
      const result = await sqlDatabase.createStudent(studentData);
      if (result && result.id) {
        await loadStudentsFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating student:', error);
      return false;
    }
  };

  const updateStudentAPI = async (id: number, studentData: any): Promise<boolean> => {
    try {
      const result = await sqlDatabase.updateRecord('students', id, studentData);
      if (result) {
        await loadStudentsFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating student:', error);
      return false;
    }
  };

  const deleteStudentAPI = async (id: number): Promise<boolean> => {
    try {
      const result = await sqlDatabase.deleteRecord('students', id);
      if (result) {
        await loadStudentsFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting student:', error);
      return false;
    }
  };

  // Teacher API Methods
  const createTeacherAPI = async (teacherData: any): Promise<boolean> => {
    try {
      const result = await sqlDatabase.createTeacher(teacherData);
      if (result && result.id) {
        await loadTeachersFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating teacher:', error);
      return false;
    }
  };

  const updateTeacherAPI = async (id: number, teacherData: any): Promise<boolean> => {
    try {
      const result = await sqlDatabase.updateRecord('teachers', id, teacherData);
      if (result) {
        await loadTeachersFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating teacher:', error);
      return false;
    }
  };

  const deleteTeacherAPI = async (id: number): Promise<boolean> => {
    try {
      const result = await sqlDatabase.deleteRecord('teachers', id);
      if (result) {
        await loadTeachersFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting teacher:', error);
      return false;
    }
  };

  // Parent API Methods
  const createParentAPI = async (parentData: any): Promise<boolean> => {
    try {
      const result = await sqlDatabase.createParent(parentData);
      if (result && result.id) {
        await loadParentsFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating parent:', error);
      return false;
    }
  };

  const updateParentAPI = async (id: number, parentData: any): Promise<boolean> => {
    try {
      const result = await sqlDatabase.updateRecord('parents', id, parentData);
      if (result) {
        await loadParentsFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating parent:', error);
      return false;
    }
  };

  const deleteParentAPI = async (id: number): Promise<boolean> => {
    try {
      const result = await sqlDatabase.deleteRecord('parents', id);
      if (result) {
        await loadParentsFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting parent:', error);
      return false;
    }
  };

  // Accountant API Methods
  const createAccountantAPI = async (accountantData: any): Promise<boolean> => {
    try {
      const result = await sqlDatabase.createAccountant(accountantData);
      if (result && result.id) {
        await loadAccountantsFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating accountant:', error);
      return false;
    }
  };

  const updateAccountantAPI = async (id: number, accountantData: any): Promise<boolean> => {
    try {
      const result = await sqlDatabase.updateRecord('accountants', id, accountantData);
      if (result) {
        await loadAccountantsFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating accountant:', error);
      return false;
    }
  };

  const deleteAccountantAPI = async (id: number): Promise<boolean> => {
    try {
      const result = await sqlDatabase.deleteRecord('accountants', id);
      if (result) {
        await loadAccountantsFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting accountant:', error);
      return false;
    }
  };

  // Class API Methods
  const createClassAPI = async (classData: any): Promise<boolean> => {
    try {
      const result = await sqlDatabase.createClass(classData);
      if (result && result.id) {
        await loadClassesFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating class:', error);
      return false;
    }
  };

  const updateClassAPI = async (id: number, classData: any): Promise<boolean> => {
    try {
      const result = await sqlDatabase.updateRecord('classes', id, classData);
      if (result) {
        await loadClassesFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating class:', error);
      return false;
    }
  };

  const deleteClassAPI = async (id: number): Promise<boolean> => {
    try {
      const result = await sqlDatabase.deleteRecord('classes', id);
      if (result) {
        await loadClassesFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting class:', error);
      return false;
    }
  };

  // Subject API Methods
  const createSubjectAPI = async (subjectData: any): Promise<boolean> => {
    try {
      const result = await sqlDatabase.createSubject(subjectData);
      if (result && result.id) {
        await loadSubjectsFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating subject:', error);
      return false;
    }
  };

  const updateSubjectAPI = async (id: number, subjectData: any): Promise<boolean> => {
    try {
      const result = await sqlDatabase.updateRecord('subjects', id, subjectData);
      if (result) {
        await loadSubjectsFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating subject:', error);
      return false;
    }
  };

  const deleteSubjectAPI = async (id: number): Promise<boolean> => {
    try {
      const result = await sqlDatabase.deleteRecord('subjects', id);
      if (result) {
        await loadSubjectsFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting subject:', error);
      return false;
    }
  };

  // Subject Registration API Methods
  const registerSubjectForClassAPI = async (classId: number, subjectId: number, academicYear: string, term: string, isCompulsory: boolean = true): Promise<boolean> => {
    try {
      const result = await sqlDatabase.registerSubjectForClass(subjectId, classId, academicYear, term, isCompulsory);
      if (result && result.id) {
        await loadSubjectsFromAPI(); // This will also refresh subject registrations
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error registering subject for class:', error);
      return false;
    }
  };

  const removeSubjectRegistrationAPI = async (classId: number, subjectId: number, academicYear: string, term: string): Promise<boolean> => {
    try {
      const result = await sqlDatabase.removeSubjectRegistration(subjectId, classId, academicYear, term);
      if (result) {
        await loadSubjectsFromAPI(); // This will also refresh subject registrations
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing subject registration:', error);
      return false;
    }
  };

  const getSubjectRegistrationsAPI = async (classId?: number, academicYear?: string, term?: string) => {
    try {
      let query = 'SELECT sr.*, s.name as subject_name, s.code as subject_code, c.name as class_name, c.level as class_level FROM subject_registrations sr JOIN subjects s ON sr.subject_id = s.id JOIN classes c ON sr.class_id = c.id';
      const params: any[] = [];
      
      if (classId || academicYear || term) {
        query += ' WHERE';
        const conditions: string[] = [];
        
        if (classId) {
          conditions.push(' sr.class_id = ?');
          params.push(classId);
        }
        if (academicYear) {
          conditions.push(' sr.academic_year = ?');
          params.push(academicYear);
        }
        if (term) {
          conditions.push(' sr.term = ?');
          params.push(term);
        }
        
        query += conditions.join(' AND');
      }
      
      query += ' ORDER BY sr.academic_year, sr.term, c.name, s.name';
      
      const result = await sqlDatabase.executeQuery(query, params);
      return result?.data || [];
    } catch (error) {
      console.error('Error getting subject registrations:', error);
      return [];
    }
  };

  // Load data from API when user is logged in
  useEffect(() => {
    if (currentUser && currentUser.token) {
      // Load all data after login
      const loadData = async () => {
        await loadUsersFromAPI();
        await loadTeachersFromAPI();
        await loadParentsFromAPI();
        await loadParentStudentLinksFromAPI();
        await loadAccountantsFromAPI();
        await loadStudentsFromAPI();
        await loadClassesFromAPI();
        await loadSubjectsFromAPI();
        await loadSubjectRegistrationsFromAPI();
        await loadSubjectAssignmentsFromAPI();
        await loadPaymentsFromAPI();
        await loadFeeStructuresFromAPI();
        await loadStudentFeeBalancesFromAPI();
        await loadNotificationsFromAPI();
      };
      loadData();
    }
  }, [currentUser]);

  // Load initial data on app start (for login page and general use)
  useEffect(() => {
    // Load system settings first
    loadCurrentTermAndYear();
    loadSchoolSettings();
    loadAttendanceRequirements();
    // Load users immediately for login functionality
    loadUsersFromAPI();
    // Load activity logs for system monitoring
    loadActivityLogsFromAPI();
    // Load basic data for admin pages to work even without login
    loadStudentsFromAPI();
    loadClassesFromAPI();
    // Load subjects without authentication requirement
    loadSubjectsFromAPI().catch((err: any) => {
      console.log('Subjects loading failed during init (may need authentication):', err);
    });
    // Note: Subject assignments and registrations require authentication
    // They will be loaded after user login in the useEffect above
    // Load teachers for dashboard responsibilities
    loadTeachersFromAPI();
    // Load parents for student linking
    loadParentsFromAPI();
    // Load parent-student links for parent dashboard
    loadParentStudentLinksFromAPI();
    // Load accountants for user management
    loadAccountantsFromAPI();
  }, []);

  // Auto-save disabled - using API only

  // ==================== API FUNCTIONS ====================

  const login = async (username: string, password: string, role: string): Promise<User | null> => {
    try {
      console.log('Login attempt:', { username, role });
      
      const user = await sqlDatabase.authenticateUser(username, password, role);
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('token', user.token || '');
        
        // Reload all data after successful login since they require authentication
        console.log('Login successful, reloading all data...');
        await loadUsersFromAPI();
        await loadTeachersFromAPI();
        await loadParentsFromAPI();
        await loadAccountantsFromAPI();
        await loadStudentsFromAPI();
        await loadClassesFromAPI();
        await loadSubjectsFromAPI();
        await loadSubjectRegistrationsFromAPI();
        await loadSubjectAssignmentsFromAPI();
        await loadPaymentsFromAPI();
        await loadFeeStructuresFromAPI();
        await loadStudentFeeBalancesFromAPI();
        
        toast.success(`Welcome back, ${user.firstName || user.username}!`);
        return user;
      }
      
      return null;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return null;
    }
  };

  // Helper function to calculate grade
  const calculateGrade = (total: number): string => {
    if (total >= 80) return 'A';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    if (total >= 50) return 'D';
    if (total >= 40) return 'E';
    return 'F';
  };

  // Helper function to get remark
  const getRemark = (grade: string): string => {
    const remarks: { [key: string]: string } = {
      A: 'Excellent',
      B: 'Very Good',
      C: 'Good',
      D: 'Fair',
      E: 'Pass',
      F: 'Fail',
    };
    return remarks[grade] || 'N/A';
  };

  // ==================== IMPLEMENTATION ====================

  // Student Methods
  const addStudent = async (student: Omit<Student, 'id'>) => {
    // The admission number is now generated by the backend service.
    // This function simply passes the data to the API.
    const success = await createStudentAPI(student);
    if (success) {
      // Refresh students list from API to get the real data
      await loadStudentsFromAPI();
      // Find the newly added student to return its ID
      const students = await sqlDatabase.executeQuery(`
        SELECT 
          s.id, 
          s.first_name as firstName,
          s.last_name as lastName,
          s.other_name as otherName,
          s.admission_number as admissionNumber,
          s.class_id,
          s.level,
          s.parent_id,
          s.date_of_birth as dateOfBirth,
          s.gender,
          s.photo_url as photoUrl,
          s.passport_photo as passportPhoto,
          s.status,
          s.academic_year as academicYear,
          s.admission_date as admissionDate,
          s.created_at as createdAt,
          s.updated_at as updatedAt,
          c.name as className,
          c.category as classCategory
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        ORDER BY s.created_at DESC LIMIT 1
      `);
      return students.data && students.data[0] ? students.data[0].id : -1;
    } else {
      // If API creation failed, ensure the state is consistent
      await loadStudentsFromAPI();
      return -1; // Return -1 to indicate failure
    }
  };

  const updateStudent = async (id: number, student: Partial<Student>) => {
    // Update local state immediately for instant feedback
    setStudents(prevStudents => 
      prevStudents.map(s => s.id === id ? { ...s, ...student } : s)
    );
    
    const updatedStudent = await updateStudentAPI(id, student);
    if (updatedStudent) {
      // Refresh students list from API to ensure consistency
      await loadStudentsFromAPI();
    } else {
      // If API update failed, revert local state
      await loadStudentsFromAPI();
    }
  };

  const deleteStudent = async (id: number) => {
    try {
      // Force immediate state update by filtering locally first
      setStudents(prevStudents => {
        const filtered = prevStudents.filter(student => student.id !== id);
        return filtered;
      });
      
      // Then call the API to delete from database
      const success = await deleteStudentAPI(id);
      
      if (success) {
        // Refresh from database to ensure consistency
        await loadStudentsFromAPI();
        
        // Also refresh parents list as parent references might be updated
        await loadParentsFromAPI();
        
        // Force a re-render by updating timestamp
        setStudents(prevStudents => [...prevStudents]);
      } else {
        // If API deletion failed, reload from database to restore correct state
        await loadStudentsFromAPI();
      }
    } catch (error) {
      // Reload from database to ensure correct state
      await loadStudentsFromAPI();
      throw error;
    }
  };

  const deleteBulkStudents = async (studentIds: number[]) => {
    try {
      if (!studentIds || studentIds.length === 0) {
        throw new Error('No student IDs provided for bulk deletion');
      }

      // Force immediate state update by filtering locally first
      setStudents(prevStudents => {
        const filtered = prevStudents.filter(student => !studentIds.includes(student.id));
        return filtered;
      });
      
      // Then call the API to delete from database
      const result = await sqlDatabase.deleteBulkStudents(studentIds);
      
      if (result && result.success) {
        // Refresh from database to ensure consistency
        await loadStudentsFromAPI();
        
        // Also refresh parents list as parent references might be updated
        await loadParentsFromAPI();
        
        // Force a re-render by updating timestamp
        setStudents(prevStudents => [...prevStudents]);
        
        return result;
      } else {
        // If API deletion failed, reload from database to restore correct state
        await loadStudentsFromAPI();
        throw new Error('Bulk deletion failed');
      }
    } catch (error) {
      // Reload from database to ensure correct state
      await loadStudentsFromAPI();
      throw error;
    }
  };

  const getStudentsByClass = (classId: number) => {
    return (students || []).filter(s => s.class_id === classId);
  };

  // Manual refresh function for students
  const refreshStudents = async () => {
    await loadStudentsFromAPI();
  };

  // Teacher Methods
  const addTeacher = async (teacher: Omit<Teacher, 'id'>): Promise<number> => {
    // Auto-generate employee ID if not provided
    let employeeId = teacher.employeeId;
    if (!employeeId || employeeId === '') {
      const year = new Date().getFullYear();
      const teacherCount = (teachers || []).length + 1;
      employeeId = `GRA-TCH-${year}-${String(teacherCount).padStart(3, '0')}`;
    }
    
    const newTeacher = await createTeacherAPI({ ...teacher, employeeId });
    if (newTeacher) {
      // Refresh teachers list from API
      await loadTeachersFromAPI();
      // Find the newly added teacher to return its ID
      const teachers = await sqlDatabase.executeQuery('SELECT * FROM teachers ORDER BY created_at DESC LIMIT 1');
      return teachers.data && teachers.data[0] ? teachers.data[0].id : -1;
    }
    return -1; // Return -1 to indicate failure
  };

  const updateTeacher = async (id: number, teacher: Partial<Teacher>) => {
    const updatedTeacher = await updateTeacherAPI(id, teacher);
    if (updatedTeacher) {
      // Refresh teachers list from API
      await loadTeachersFromAPI();
    }
  };

  const deleteTeacher = async (id: number) => {
    const success = await deleteTeacherAPI(id);
    if (success) {
      // Refresh teachers list from API
      await loadTeachersFromAPI();
      // Also refresh classes and subject assignments as they might be updated
      await loadClassesFromAPI();
    }
  };

  // Enhanced Teacher Assignment System
  const getTeacherAssignments = (teacherId: number): SubjectAssignment[] => {
    return (subjectAssignments || []).filter(a => 
      a.teacher_id === teacherId && 
      a.term === currentTerm && 
      a.academic_year === currentAcademicYear
    );
  };

  // Get teacher's classes with subjects and student counts
  const getTeacherClasses = (teacherId: number): any[] => {
    // Get teacher's subject assignments
    const assignments = getTeacherAssignments(teacherId);
    
    // Get classes where teacher is assigned as class teacher
    const classTeacherClasses = classes.filter((c: any) => c.classTeacherId === teacherId);
    
    // Group subject assignments by class
    const classGroups = assignments.reduce((groups: any, assignment: any) => {
      const classId = assignment.class_id;
      if (!groups[classId]) {
        groups[classId] = {
          classId,
          className: classes.find(c => c.id === classId)?.name || 'Unknown',
          classLevel: classes.find(c => c.id === classId)?.level || 'Unknown',
          subjects: []
        };
      }
      
      groups[classId].subjects.push({
        subjectId: assignment.subject_id,
        subjectName: subjects.find(s => s.id === assignment.subject_id)?.name || 'Unknown',
        subjectCode: subjects.find(s => s.id === assignment.subject_id)?.code || 'Unknown',
        assignmentId: assignment.id
      });
      
      return groups;
    }, {});
    
    // Add class teacher classes (even if no subject assignments)
    classTeacherClasses.forEach((classTeacherClass: any) => {
      if (!classGroups[classTeacherClass.id]) {
        classGroups[classTeacherClass.id] = {
          classId: classTeacherClass.id,
          className: classTeacherClass.name || 'Unknown',
          classLevel: classTeacherClass.level || 'Unknown',
          subjects: []
        };
      }
    });
    
    // Convert to array and add student counts
    return Object.values(classGroups).map((classGroup: any) => ({
      ...classGroup,
      studentCount: students.filter(s => s.class_id === classGroup.classId).length
    }));
  };

// Get teacher's students for a specific class
  const getTeacherResponsibilities = (teacherId: number): any => {
  try {
    // Get teacher's subject assignments
    const assignments = getTeacherAssignments(teacherId);
    
    // Get classes where teacher is assigned as class teacher
    const classTeacherClasses = classes.filter((c: any) => c.classTeacherId === teacherId);
    
    // Get unique classes from subject assignments
    const subjectAssignedClasses = assignments.reduce((unique: any[], assignment: any) => {
      if (!unique.find(c => c.classId === assignment.class_id)) {
        unique.push({
          classId: assignment.class_id,
          className: classes.find(c => c.id === assignment.class_id)?.name || 'Unknown',
          classLevel: classes.find(c => c.id === assignment.class_id)?.level || 'Unknown'
        });
      }
      return unique;
    }, []);

    // Combine both types of class assignments (avoid duplicates)
    const allAssignedClasses = [...subjectAssignedClasses];
    
    // Add class teacher classes to the list (if not already included)
    classTeacherClasses.forEach((classTeacherClass: any) => {
      if (!allAssignedClasses.find(c => c.classId === classTeacherClass.id)) {
        allAssignedClasses.push({
          classId: classTeacherClass.id,
          className: classTeacherClass.name || 'Unknown',
          classLevel: classTeacherClass.level || 'Unknown'
        });
      }
    });

    // Calculate total students from all assigned classes
    const totalStudentsCount = allAssignedClasses.reduce((total: number, classInfo: any) => {
      const classStudents = students.filter(s => s.class_id === classInfo.classId);
      return total + classStudents.length;
    }, 0);

    return {
      isClassTeacher: classTeacherClasses.length > 0,
      assignedClassesCount: allAssignedClasses.length,
      totalStudentsCount,
      subjectsCount: assignments.length,
      canEnterScores: true, // All teachers can enter scores for their assigned subjects
      canCompileResults: classTeacherClasses.length > 0, // Only class teachers can compile results
      canViewResults: true, // All teachers can view results
      canManageAttendance: classTeacherClasses.length > 0, // Only class teachers can mark attendance
      canManageAffectivePsychomotor: classTeacherClasses.length > 0, // Only class teachers can manage affective/psychomotor
      canManageTimetable: classTeacherClasses.length > 0, // Only class teachers can manage exam timetable
      canMessageParents: classTeacherClasses.length > 0, // Only class teachers can message parents
      departments: ['Academic'],
      classTeacherClassesCount: classTeacherClasses.length,
      subjectAssignedClassesCount: subjectAssignedClasses.length,
      classTeacherClassIds: classTeacherClasses.map(c => c.id), // IDs of classes where teacher is class teacher
      subjectAssignedClassIds: subjectAssignedClasses.map(c => c.classId) // IDs of classes where teacher has subjects
    };
  } catch (error) {
    console.error('Error getting teacher responsibilities:', error);
    return {
      isClassTeacher: false,
      assignedClassesCount: 0,
      totalStudentsCount: 0,
      subjectsCount: 0,
      canEnterScores: false,
      canCompileResults: false,
      canViewResults: false,
      canManageAttendance: false,
      canManageAffectivePsychomotor: false,
      canManageTimetable: false,
      canMessageParents: false,
      departments: [],
      classTeacherClassesCount: 0,
      subjectAssignedClassesCount: 0,
      classTeacherClassIds: [],
      subjectAssignedClassIds: []
    };
  }
};  

  // Parent Methods
  const addParent = async (parent: Omit<Parent, 'id'>): Promise<number> => {
    const success = await createParentAPI(parent);
    if (success) {
      await loadParentsFromAPI();
      // Find the newly added parent to return its ID
      const parents = await sqlDatabase.executeQuery('SELECT * FROM parents ORDER BY created_at DESC LIMIT 1');
      return parents.data && parents.data[0] ? parents.data[0].id : -1;
    } else {
      return -1;
    }
  };

  const updateParent = async (id: number, parent: Partial<Parent>) => {
    const success = await updateParentAPI(id, parent);
    if (success) {
      await loadParentsFromAPI();
    }
  };

  const deleteParent = async (id: number) => {
    const success = await deleteParentAPI(id);
    if (success) {
      await loadParentsFromAPI();
    }
  };

  const getParentStudents = (parentId: number): Student[] => {
    return students.filter(student => student.parent_id === parentId);
  };

  // Accountant Methods
  const addAccountant = async (accountant: Omit<Accountant, 'id'>): Promise<number> => {
    const success = await createAccountantAPI(accountant);
    if (success) {
      await loadAccountantsFromAPI();
      // Find the newly added accountant to return its ID
      const accountants = await sqlDatabase.executeQuery('SELECT * FROM accountants ORDER BY created_at DESC LIMIT 1');
      return accountants.data && accountants.data[0] ? accountants.data[0].id : -1;
    } else {
      return -1;
    }
  };

  const updateAccountant = async (id: number, accountant: Partial<Accountant>) => {
    const success = await updateAccountantAPI(id, accountant);
    if (success) {
      await loadAccountantsFromAPI();
    }
  };

  const deleteAccountant = async (id: number) => {
    const success = await deleteAccountantAPI(id);
    if (success) {
      await loadAccountantsFromAPI();
    }
  };

  const updateAccountantStatus = async (id: number, status: string): Promise<void> => {
    await updateAccountantAPI(id, { status });
  };

  // Class Methods
  const addClass = async (newClass: Omit<Class, 'id'>): Promise<number> => {
    const success = await createClassAPI(newClass);
    if (success) {
      await loadClassesFromAPI();
      // Find the newly added class to return its ID
      const classes = await sqlDatabase.executeQuery('SELECT * FROM classes ORDER BY created_at DESC LIMIT 1');
      return classes.data && classes.data[0] ? classes.data[0].id : -1;
    } else {
      return -1;
    }
  };

  const updateClass = async (id: number, classData: Partial<Class>): Promise<void> => {
    const success = await updateClassAPI(id, classData);
    if (success) {
      await loadClassesFromAPI();
    }
  };

  const deleteClass = async (id: number): Promise<void> => {
    const success = await deleteClassAPI(id);
    if (success) {
      await loadClassesFromAPI();
    }
  };

  const updateSubject = async (id: number, subject: Partial<Subject>) => {
    const success = await updateSubjectAPI(id, subject);
    if (success) {
      await loadSubjectsFromAPI();
    }
  };

  const addSubject = async (subject: Omit<Subject, 'id'>): Promise<number> => {
    const success = await createSubjectAPI(subject);
    if (success) {
      await loadSubjectsFromAPI();
      // Find the newly added subject to return its ID
      const subjects = await sqlDatabase.executeQuery('SELECT * FROM subjects ORDER BY created_at DESC LIMIT 1');
      return subjects.data && subjects.data[0] ? subjects.data[0].id : -1;
    } else {
      return -1;
    }
  };

  const deleteSubject = async (id: number) => {
    const success = await deleteSubjectAPI(id);
    if (success) {
      await loadSubjectsFromAPI();
    }
  };

  const getPendingApprovals = () => {
    return compiledResults.filter(result => result.status === 'Submitted');
  };

  // System Settings Methods
  const loadCurrentTermAndYear = async () => {
    try {
      const termResult = await sqlDatabase.executeQuery(
        "SELECT setting_value FROM school_settings WHERE setting_key = 'current_term'"
      );
      const yearResult = await sqlDatabase.executeQuery(
        "SELECT setting_value FROM school_settings WHERE setting_key = 'current_academic_year'"
      );
      
      // Extract data from result objects
      const termData = termResult?.data || termResult;
      const yearData = yearResult?.data || yearResult;
      
      if (termData && termData.length > 0) {
        setCurrentTerm(termData[0].setting_value);
      }
      if (yearData && yearData.length > 0) {
        setCurrentAcademicYear(yearData[0].setting_value);
      }
    } catch (error) {
      console.error('Error loading current term and year:', error);
    }
  };

  const loadSchoolSettings = async () => {
    try {
      const result = await sqlDatabase.executeQuery(
        "SELECT setting_key, setting_value FROM school_settings"
      );
      
      console.log('School settings query result:', result);
      
      const newSettings: Partial<SchoolSettings> = {};
      // Extract the data array from the result object
      const settings = result?.data || result;
      
      if (Array.isArray(settings)) {
        settings.forEach((setting: any) => {
          newSettings[setting.setting_key as keyof SchoolSettings] = setting.setting_value;
        });
      } else {
        console.warn('School settings query did not return an array:', typeof settings, settings);
      }
      
      setSchoolSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Error loading school settings:', error);
    }
  };

  const getAllAcademicYears = async (): Promise<string[]> => {
    try {
      const result = await sqlDatabase.executeQuery(
        "SELECT DISTINCT academic_year FROM compiled_results ORDER BY academic_year DESC"
      );
      // Handle database response format: {success: true, data: [...]}
      let dataArray = [];
      if (result && typeof result === 'object') {
        if (Array.isArray(result)) {
          dataArray = result;
        } else if (Array.isArray(result.data)) {
          dataArray = result.data;
        }
      }
      
      const years = dataArray.map((row: any) => row.academic_year);
      // Always include current academic year as fallback
      if (currentAcademicYear && !years.includes(currentAcademicYear)) {
        years.push(currentAcademicYear);
      }
      return years;
    } catch (error) {
      console.error('Error getting academic years:', error);
      // Return current academic year as fallback
      return currentAcademicYear ? [currentAcademicYear] : [];
    }
  };

  const getCompiledResultsByYearAndTerm = async (academicYear: string, term: string): Promise<CompiledResult[]> => {
    try {
      const result = await sqlDatabase.executeQuery(
        "SELECT * FROM compiled_results WHERE academic_year = ? AND term = ? ORDER BY student_id",
        [academicYear, term]
      );
      // Handle database response format: {success: true, data: [...]}
      if (result && typeof result === 'object') {
        if (Array.isArray(result)) {
          return result;
        } else if (Array.isArray(result.data)) {
          return result.data;
        }
      }
      return [];
    } catch (error) {
      console.error('Error getting compiled results by year and term:', error);
      return [];
    }
  };

  const updateCurrentTerm = async (term: string) => {
    setCurrentTerm(term);
    // Update database using INSERT ON DUPLICATE KEY UPDATE
    try {
      await sqlDatabase.executeQuery(
        "INSERT INTO school_settings (setting_key, setting_value) VALUES ('current_term', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
        [term, term]
      );
    } catch (error) {
      console.error('Error updating current term in database:', error);
    }
  };

  const updateAttendanceRequirements = async (requirements: Record<string, number>) => {
    setAttendanceRequirements(requirements);
    // Save to database
    try {
      // Save each term's requirement
      for (const [term, days] of Object.entries(requirements)) {
        await sqlDatabase.executeQuery(`
          INSERT INTO school_settings (setting_key, setting_value, updated_date) 
          VALUES (?, ?, NOW())
          ON DUPLICATE KEY UPDATE setting_value = ?, updated_date = NOW()
        `, [`attendance_${term.toLowerCase().replace(' ', '_')}`, days.toString(), days.toString()]);
      }
    } catch (error) {
      console.error('Error updating attendance requirements in database:', error);
    }
  };

  const getAttendanceRequirements = () => {
    return attendanceRequirements;
  };

  const loadAttendanceRequirements = async () => {
    try {
      const terms = ['first_term', 'second_term', 'third_term'];
      const requirements: Record<string, number> = {};
      
      for (const term of terms) {
        const result = await sqlDatabase.executeQuery(
          "SELECT setting_value FROM school_settings WHERE setting_key = ?",
          [`attendance_${term}`]
        );
        
        if (result.length > 0) {
          const termName = term.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          requirements[termName] = parseInt(result[0].setting_value) || 0;
        }
      }
      
      setAttendanceRequirements(requirements);
    } catch (error) {
      console.error('Error loading attendance requirements from database:', error);
      setAttendanceRequirements({});
    }
  };

  const updateCurrentAcademicYear = async (year: string) => {
    setCurrentAcademicYear(year);
    // Update database using INSERT ON DUPLICATE KEY UPDATE
    try {
      await sqlDatabase.executeQuery(
        "INSERT INTO school_settings (setting_key, setting_value) VALUES ('current_academic_year', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
        [year, year]
      );
    } catch (error) {
      console.error('Error updating academic year in database:', error);
    }
  };

  const getTeacherClassTeacherAssignments = (teacherId: number): number[] => {
    return (classes || []).filter(c => c.classTeacherId === teacherId).map(c => c.id);
  };

  const validateClassTeacherAssignment = (teacherId: number, newClassId: number): { valid: boolean; message: string } => {
    const currentAssignments = getTeacherClassTeacherAssignments(teacherId);
    
    // Check if already assigned to this class
    if (currentAssignments.includes(newClassId)) {
      return { valid: false, message: 'Teacher is already class teacher for this class' };
    }
    
    // Check if limit of 3 classes will be exceeded
    if (currentAssignments.length >= 3) {
      return { 
        valid: false, 
        message: 'Teacher cannot be class teacher for more than 3 classes. Current assignments: ' + currentAssignments.length 
      };
    }
    
    return { valid: true, message: 'Valid assignment' };
  };

  const updateSchoolSettings = async (settings: Partial<SchoolSettings>) => {
    setSchoolSettings({ ...schoolSettings, ...settings });
    // Also update database
    try {
      const settingEntries = Object.entries(settings);
      for (const [key, value] of settingEntries) {
        if (value !== undefined) {
          await sqlDatabase.executeQuery(
            `UPDATE school_settings SET setting_value = ?, updated_date = NOW() WHERE setting_key = ?`,
            [value, key]
          );
        }
      }
    } catch (error) {
      console.error('Error updating school settings in database:', error);
    }
  };

  // Bank Account Settings Methods
  const updateBankAccountSettings = (settings: Omit<BankAccountSettings, 'id' | 'updated_date'>) => {
    const newSettings: BankAccountSettings = {
      ...settings,
      id: 1,
      updated_date: new Date().toISOString(),
    };
    setBankAccountSettings(newSettings);
    
    if (currentUser) {
      // Convert role from lowercase to capitalized format for ActivityLog
      const getCapitalizedRole = (role: string): 'Admin' | 'Teacher' | 'Accountant' | 'Parent' | 'System' => {
        const roleMap: { [key: string]: 'Admin' | 'Teacher' | 'Accountant' | 'Parent' | 'System' } = {
          'admin': 'Admin',
          'teacher': 'Teacher',
          'accountant': 'Accountant',
          'parent': 'Parent'
        };
        return roleMap[role] || 'System';
      };
      
      addActivityLog({
        id: 0, // Will be generated by database
        actor: currentUser.username,
        actor_role: getCapitalizedRole(currentUser.role),
        action: 'update_bank_account',
        target: settings.bank_name,
        ip_address: '127.0.0.1',
        status: 'Success',
        timestamp: new Date().toISOString(),
        details: `Updated bank account to ${settings.account_number}`,
      });
    }
  };

  const getBankAccountSettings = () => {
    return bankAccountSettings;
  };

  // Activity Log Methods
  const addActivityLog = async (log: ActivityLog): Promise<number> => {
    try {
      // Create a copy without id and timestamp for database insertion
      const { id, timestamp, ...logData } = log;
      
      // Save to database first
      const result = await sqlDatabase.insertRecord('activity_logs', logData);

      if (result && result.insertId) {
        // Reload activity logs from database to get the latest
        await loadActivityLogsFromAPI();
        return result.insertId;
      }
      return 0;
    } catch (error) {
      console.error('Error adding activity log:', error);
      // Fallback to memory-only storage
      const newId = activityLogs.length > 0 ? Math.max(...activityLogs.map((l: ActivityLog) => l.id)) + 1 : 1;
      const newLog: ActivityLog = {
        ...log,
        id: newId,
        timestamp: new Date().toISOString(),
      };
      setActivityLogs([newLog, ...activityLogs]);
      return newId;
    }
  };

  const getActivityLogs = (userId?: number, action?: string): ActivityLog[] => {
    let filtered = activityLogs;
    
    // If current user is a teacher, filter logs to show only their assigned responsibilities
    if (currentUser?.role === 'teacher' && currentUser.linked_id) {
      const currentTeacher = teachers.find(t => t.id === currentUser.linked_id);
      if (currentTeacher) {
        const teacherAssignments = getTeacherAssignments(currentTeacher.id);
        const assignedClassIds = teacherAssignments.map(a => a.class_id);
        
        // Filter logs related to teacher's assigned classes and students
        filtered = filtered.filter((log: ActivityLog) => {
          // Show logs where the teacher is the actor
          if (log.actor === currentUser.username) return true;
          
          // Show logs related to students in teacher's assigned classes
          const targetStudentId = log.user_id;
          if (targetStudentId) {
            const targetStudent = students.find(s => s.id === targetStudentId);
            if (targetStudent && assignedClassIds.includes(targetStudent.class_id)) {
              return true;
            }
          }
          
          // Show logs related to teacher's assigned classes
          if (log.target && log.target.includes('Class')) {
            return true; // Class-related logs are relevant
          }
          
          return false;
        });
      }
    } else if (userId) {
      // For other roles, filter by specific user if requested
      filtered = filtered.filter((log: ActivityLog) => log.actor === currentUser?.username);
    }
    
    if (action && action !== 'all') {
      filtered = filtered.filter((log: ActivityLog) => log.action === action);
    }
    
    return filtered;
  };

  const createUserAPI = async (userData: any): Promise<User | null> => {
    try {
      const user = await sqlDatabase.createUser(userData);
      if (user) {
        await loadUsersFromAPI();
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  };

  const updateUserAPI = async (id: number, userData: any): Promise<boolean> => {
    try {
      const result = await sqlDatabase.updateRecord('users', id, userData);
      if (result) {
        await loadUsersFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  const deleteUserAPI = async (id: number): Promise<boolean> => {
    try {
      const result = await sqlDatabase.deleteRecord('users', id);
      if (result) {
        await loadUsersFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };

  const updateUserStatusAPI = async (id: number, status: string): Promise<boolean> => {
    try {
      const result = await sqlDatabase.updateRecord('users', id, { status });
      if (result) {
        await loadUsersFromAPI();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  };

  const resetUserPassword = async (id: number): Promise<string> => {
    try {
      // Generate a temporary password
      const tempPassword = 'Temp' + Math.random().toString(36).slice(-8);
      const result = await sqlDatabase.updateRecord('users', id, { password_hash: tempPassword });
      if (result) {
        await loadUsersFromAPI();
        return tempPassword;
      }
      throw new Error('Failed to reset password');
    } catch (error) {
      console.error('Error resetting user password:', error);
      throw new Error('Failed to reset password');
    }
  };

  const resetUserPasswordAPI = async (id: number, newPassword?: string): Promise<string> => {
    try {
      // Use provided password or generate a temporary password
      const password = newPassword || 'Temp' + Math.random().toString(36).slice(-8);
      const result = await sqlDatabase.updateRecord('users', id, { password_hash: password });
      if (result) {
        await loadUsersFromAPI();
        return password;
      }
      throw new Error('Failed to reset password');
    } catch (error) {
      console.error('Error resetting user password:', error);
      throw new Error('Failed to reset password');
    }
  };

  const getUserPermissionsAPI = async (userId: number): Promise<string[]> => {
    try {
      // For now, return all permissions for the user's role
      const user = users.find(u => u.id === userId);
      if (!user) return [];
      
      const allPermissions = [
        'create_users', 'read_users', 'update_users', 'delete_users',
        'create_students', 'read_students', 'update_students', 'delete_students',
        'create_teachers', 'read_teachers', 'update_teachers', 'delete_teachers',
        'create_parents', 'read_parents', 'update_parents', 'delete_parents',
        'manage_classes', 'manage_subjects', 'manage_fees', 'view_reports'
      ];
      
      return user.role === 'admin' ? allPermissions : 
             user.role === 'teacher' ? ['read_students', 'update_students', 'manage_classes', 'manage_subjects'] :
             user.role === 'accountant' ? ['read_students', 'manage_fees', 'view_reports'] :
             ['read_students'];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  };

  const checkUserPermissionAPI = async (role: string, permission: string): Promise<boolean> => {
    try {
      // For now, return true for all permissions
      // In production, this would check against the database
      const allPermissions = [
        'create_users', 'read_users', 'update_users', 'delete_users',
        'create_students', 'read_students', 'update_students', 'delete_students',
        'create_teachers', 'read_teachers', 'update_teachers', 'delete_teachers',
        'create_parents', 'read_parents', 'update_parents', 'delete_parents',
        'manage_classes', 'manage_subjects', 'manage_fees', 'view_reports'
      ];
      
      return role === 'admin' ? true : 
             role === 'teacher' ? allPermissions.includes(permission) :
             role === 'accountant' ? ['read_students', 'manage_fees', 'view_reports'].includes(permission) :
             ['read_students'].includes(permission);
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  };

  // Helper function to update class student count
  const compileResult = async (resultData: any): Promise<number> => {
    try {
      // Direct database insertion using the generic query method
      const query = `
        INSERT INTO compiled_results (
          student_id, class_id, term, academic_year, total_score, average_score, 
          class_average, position, total_students, times_present, times_absent, 
          total_attendance_days, term_begin, term_end, next_term_begin,
          class_teacher_name, class_teacher_comment, principal_name, principal_comment,
          principal_signature, compiled_by, compiled_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        resultData.student_id,
        resultData.class_id,
        resultData.term,
        resultData.academic_year,
        resultData.total_score,
        resultData.average_score,
        resultData.class_average || 0,
        resultData.position,
        resultData.total_students,
        resultData.times_present || 0,
        resultData.times_absent || 0,
        resultData.total_attendance_days || 0,
        resultData.term_begin || null,
        resultData.term_end || null,
        resultData.next_term_begin || null,
        resultData.class_teacher_name,
        resultData.class_teacher_comment,
        resultData.principal_name || '',
        resultData.principal_comment,
        resultData.principal_signature || '',
        resultData.compiled_by || 1, // Use fallback user ID 1 if compiled_by is null/invalid
        resultData.compiled_date,
        resultData.status
      ];
      
      const result = await sqlDatabase.executeQuery(query, params);
      
      if (result && result.insertId) {
        // Update local state with database-generated ID
        const newResult = { ...resultData, id: result.insertId };
        setCompiledResults([...compiledResults, newResult]);
        return result.insertId;
      } else {
        throw new Error('No insert ID returned from database');
      }
    } catch (error) {
      console.error('Error saving compiled result to database:', error);
      // Don't fallback to local storage - throw the error so it can be handled properly
      throw error;
    }
  };

  const updateCompiledResult = async (id: number, resultData: any): Promise<void> => {
    try {
      // Update database
      await sqlDatabase.updateRecord('compiled_results', id, resultData);
      
      // Update local state
      setCompiledResults(compiledResults.map((r: any) => (r.id === id ? { ...r, ...resultData } : r)));
    } catch (error) {
      console.error('Error updating compiled result:', error);
      throw error;
    }
  };

  const deleteCompiledResult = async (id: number): Promise<void> => {
    setCompiledResults(compiledResults.filter((r: any) => r.id !== id));
  };

  const submitResult = async (id: number): Promise<void> => {
    try {
      // Update compiled result status to 'Submitted' in database using generic update
      await sqlDatabase.updateRecord('compiled_results', id, { status: 'Submitted' });
      
      // Update local state
      setCompiledResults(compiledResults.map((r: any) => (r.id === id ? { ...r, status: 'Submitted' } : r)));
      
      // Also update individual scores status to 'Submitted'
      const result = compiledResults.find((r: any) => r.id === id);
      if (result) {
        // Get all scores for this student and update their status
        const studentScores = scores.filter((s: Score) => s.student_id === result.student_id);
        for (const score of studentScores) {
          if (score.status === 'Draft') {
            await sqlDatabase.updateRecord('scores', score.id, { status: 'Submitted' });
          }
        }
        // Reload scores to get updated status
        await loadScoresFromAPI();
      }
    } catch (error) {
      console.error('Error submitting result to database:', error);
      throw error;
    }
  };

  const approveResult = async (id: number): Promise<void> => {
    try {
      // Update compiled result status to 'Approved' in database
      await sqlDatabase.updateCompiledResult(id, { status: 'Approved' });
      
      // Update local state
      setCompiledResults(compiledResults.map((r: any) => (r.id === id ? { ...r, status: 'Approved' } : r)));
    } catch (error) {
      console.error('Error approving result in database:', error);
      throw error;
    }
  };

  const rejectResult = async (id: number, reason: string = ''): Promise<void> => {
    try {
      // Get the compiled result details
      const result = compiledResults.find((r: any) => r.id === id);
      if (!result) {
        throw new Error('Result not found');
      }

      // Update compiled result status to 'Rejected' in database
      await sqlDatabase.updateCompiledResult(id, { 
        status: 'Rejected',
        rejectionReason: reason
      });
      
      // Update local state
      setCompiledResults(compiledResults.map((r: any) => (r.id === id ? { ...r, status: 'Rejected', rejectionReason: reason } : r)));

      // Find and reject all subject scores for this student, class, and term
      const studentScores = scores.filter((s: any) => 
        s.student_id === result.student_id &&
        s.term === result.term &&
        s.academic_year === result.academic_year &&
        s.status === 'Approved' // Only reject approved scores, not submitted ones
      );

      // Update all related scores to 'Rejected' status
      for (const score of studentScores) {
        await sqlDatabase.updateRecord('scores', score.id, { 
          status: 'Rejected',
          rejectionReason: `Admin rejected compiled result: ${reason}`,
          rejectedBy: currentUser?.id || null,
          rejectedDate: new Date().toISOString()
        });
        
        // Update local state
        setScores(scores.map((s: any) => 
          s.id === score.id 
            ? { ...s, status: 'Rejected', rejectionReason: `Admin rejected compiled result: ${reason}` }
            : s
        ));
      }

      // Send notification to class teacher
      const student = students.find((s: any) => s.id === result.student_id);
      const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
      
      const classTeacher = teachers.find((t: any) => t.id === result.compiled_by);
      if (classTeacher) {
        await addNotification({
          title: "Compiled Result Rejected - Action Required",
          message: `Admin has rejected the compiled result for ${studentName}. You can now edit attendance, comments, psychomotor skills, and reject subject scores for correction.`,
          type: "warning",
          targetAudience: "teachers",
          sentBy: currentUser?.id || 0,
          sentDate: new Date().toISOString(),
          isRead: false,
          readBy: []
        });
      }

    } catch (error) {
      console.error('Error rejecting result in database:', error);
      throw error;
    }
  };

  const getResultsByClass = (classId: number) => {
    return compiledResults.filter((r: any) => r.class_id === classId);
  };

  // Payment Functions
  const addPayment = async (payment: Omit<Payment, 'id'>): Promise<void> => {
    const newId = payments.length > 0 ? Math.max(...payments.map((p: Payment) => p.id)) + 1 : 1;
    const newPayment = { ...payment, id: newId };
    setPayments([...payments, newPayment]);
  };

  const updatePayment = async (id: number, payment: Partial<Payment>): Promise<void> => {
    setPayments(payments.map((p: Payment) => (p.id === id ? { ...p, ...payment } : p)));
  };

  const verifyPayment = async (id: number): Promise<void> => {
    setPayments(payments.map((p: Payment) => (p.id === id ? { ...p, status: 'Verified' } : p)));
  };

  const getPaymentsByStudent = (studentId: number) => {
    return payments.filter((p: Payment) => p.student_id === studentId);
  };

  // Fee Functions
  const addFeeStructure = async (feeStructure: any): Promise<number> => {
    const newId = feeStructures.length > 0 ? Math.max(...feeStructures.map((f: any) => f.id)) + 1 : 1;
    const newFeeStructure = { ...feeStructure, id: newId };
    setFeeStructures([...feeStructures, newFeeStructure]);
    return newId;
  };

  const updateFeeStructure = async (id: number, feeStructure: any): Promise<void> => {
    setFeeStructures(feeStructures.map((f: any) => (f.id === id ? { ...f, ...feeStructure } : f)));
  };

  const getFeeStructureByClass = (classId: number) => {
    return feeStructures.filter((f: any) => f.class_id === classId);
  };

  const getStudentFeeBalance = (studentId: number): StudentFeeBalance | null => {
    const balance = studentFeeBalances.find((b: StudentFeeBalance) => b.student_id === studentId);
    return balance || null;
  };

  const updateStudentFeeBalance = async (studentId: number, balance: Partial<StudentFeeBalance>): Promise<void> => {
    setStudentFeeBalances(studentFeeBalances.map((b: StudentFeeBalance) => 
      (b.student_id === studentId ? { ...b, ...balance } : b)
    ));
  };

  // Parent-Student Link
  const linkParentToStudent = async (parentId: number, studentId: number): Promise<void> => {
    try {
      // Insert into parent_student_links table
      await sqlDatabase.createParentStudentLink(parentId, studentId, 'Parent', true);
      
      // Also update the student's parent_id field
      await sqlDatabase.updateRecord('students', studentId, { parent_id: parentId });
      
      // Reload data to reflect changes
      await loadStudentsFromAPI();
      await loadParentsFromAPI();
      await loadParentStudentLinksFromAPI();
      
      console.log(`Successfully linked parent ${parentId} to student ${studentId}`);
    } catch (error) {
      console.error('Error linking parent to student:', error);
      throw error;
    }
  };

  // Subject Registration
  const registerSubjectForClass = async (classId: number, subjectId: number, academicYear: string, term: string, isCompulsory?: boolean): Promise<boolean> => {
    try {
      console.log(`Registering subject ${subjectId} for class ${classId}`);
      const success = await registerSubjectForClassAPI(classId, subjectId, academicYear, term, isCompulsory);
      if (success) {
        await loadSubjectRegistrationsFromAPI();
      }
      return success;
    } catch (error) {
      console.error('Error registering subject for class:', error);
      return false;
    }
  };

  // Helper function to update class student count
  const updateClassStudentCount = async (classId: number): Promise<void> => {
    try {
      const studentCount = students.filter(s => s.class_id === classId).length;
      await sqlDatabase.updateRecord('classes', classId, { current_students: studentCount });
      await loadClassesFromAPI();
    } catch (error) {
      console.error('Error updating class student count:', error);
    }
  };

  // Promotion Methods
  const promoteStudent = (studentId: number, newClassId: number, newAcademicYear: string) => {
    const student = students.find(s => s.id === studentId);
    const newClass = classes.find(c => c.id === newClassId);
    
    if (!student || !newClass) return;
    
    setStudents(students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          class_id: newClassId,
          class_name: newClass.name,
          level: newClass.level,
          academic_year: newAcademicYear,
        };
      }
      return s;
    }));
    
    // Update class student counts
    updateClassStudentCount(student.class_id);
    updateClassStudentCount(newClassId);
    
    // Log the promotion activity
    if (currentUser) {
      addActivityLog({
        id: 0, // Will be generated by database
        actor: currentUser.username,
        actor_role: 'Admin',
        action: 'Promote Student',
        target: `${student.firstName} ${student.lastName} → ${newClass.name}`,
        ip_address: 'System',
        status: 'Success',
        timestamp: new Date().toISOString(),
        details: `Promoted from ${student.className} to ${newClass.name} for ${newAcademicYear}`,
      });
    }
  };

  const promoteMultipleStudents = (studentIds: number[], classMapping: { [studentId: number]: number }, newAcademicYear: string) => {
    studentIds.forEach(studentId => {
      const newClassId = classMapping[studentId];
      if (newClassId) {
        promoteStudent(studentId, newClassId, newAcademicYear);
      }
    });
  };

  // Attendance Methods
  const addAttendance = async (attendance: Omit<Attendance, 'id'>): Promise<number> => {
    const newId = attendances.length > 0 ? Math.max(...attendances.map((a: Attendance) => a.id)) + 1 : 1;
    const newAttendance = { ...attendance, id: newId };
    setAttendances([...attendances, newAttendance]);
    return newId;
  };

  const updateAttendance = async (id: number, attendance: Partial<Attendance>): Promise<void> => {
    setAttendances(attendances.map((a: Attendance) => (a.id === id ? { ...a, ...attendance } : a)));
  };

  const deleteAttendance = async (id: number): Promise<void> => {
    setAttendances(attendances.filter((a: Attendance) => a.id !== id));
  };

  const getAttendancesByStudent = (studentId: number) => {
    return attendances.filter(a => a.student_id === studentId);
  };

  const getAttendancesByClass = (classId: number) => {
    return attendances.filter(a => a.class_id === classId);
  };

  const getAttendancesByDate = (date: string) => {
    return attendances.filter(a => a.date === date);
  };

  // Missing Functions
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      // This would typically call an API to update the password
      // For now, just return true for demo purposes
      console.log(`Changing password from ${oldPassword} to ${newPassword}`);
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id'>): Promise<number> => {
    try {
      // Convert to snake_case for database
      const notificationData = {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        target_audience: notification.targetAudience,
        sent_by: notification.sentBy,
        sent_date: notification.sentDate,
        is_read: notification.isRead ? 1 : 0,
        read_by: JSON.stringify(notification.readBy || [])
      };

      // Insert into database
      const insertId = await sqlDatabase.insertRecord('notifications', notificationData);
      
      // Create notification object for local state
      const newNotification = { 
        ...notification, 
        id: insertId 
      };
      
      // Update local state
      setNotifications(prev => [...prev, newNotification]);
      
      return insertId;
    } catch (error) {
      console.error('Error adding notification to database:', error);
      // Fallback to local state only
      const newId = notifications.length > 0 ? Math.max(...notifications.map((n: Notification) => n.id)) + 1 : 1;
      const newNotification = { ...notification, id: newId };
      setNotifications([...notifications, newNotification]);
      return newId;
    }
  };

  const markNotificationAsRead = async (id: number): Promise<void> => {
    setNotifications(notifications.map((n: Notification) => 
      (n.id === id ? { ...n, isRead: true } : n)
    ));
  };

  const getUnreadNotifications = (): Notification[] => {
    return notifications.filter((n: Notification) => !n.isRead);
  };

  const getAllNotifications = (): Notification[] => {
    return notifications;
  };

  const deleteNotification = async (id: number): Promise<void> => {
    setNotifications(notifications.filter((n: Notification) => n.id !== id));
  };

  const getClassTeacher = (classId: number): Teacher | null => {
    const classData = classes.find((c: Class) => c.id === classId);
    if (classData && classData.classTeacherId) {
      return teachers.find((t: Teacher) => t.id === classData.classTeacherId) || null;
    }
    return null;
  };

  const getClassSubjects = (classId: number): Subject[] => {
    const subjectIds = subjectRegistrations
      .filter((sr: SubjectRegistration) => sr.class_id === classId && sr.status === 'Active')
      .map((sr: SubjectRegistration) => sr.subject_id);
    
    return subjects.filter((s: Subject) => subjectIds.includes(s.id));
  };

  // Additional missing functions
  const getTeacherStudents = (teacherId: number, classId: number): Student[] => {
    return students.filter(s => s.class_id === classId);
  };

  const getParentChildren = (parentId: number): any[] => {
  // Get children from parent_student_links table
  const parentStudentLinks = parentStudentLinksData.filter(link => link.parent_id === parentId);
  
  return parentStudentLinks.map(link => {
    const student = students.find(s => s.id === link.student_id);
    if (!student) return null;
    
    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      classId: student.class_id,
      className: classes.find(c => c.id === student.class_id)?.name || 'Unknown',
      classLevel: classes.find(c => c.id === student.class_id)?.level || 'Unknown',
      gender: student.gender,
      photoUrl: student.photo_url,
      dateOfBirth: student.date_of_birth,
      address: '', // Not available in Student interface
      parentContact: '', // Not available in Student interface  
      enrollmentDate: student.academic_year || '', // Using academic_year as fallback
      status: student.status,
      recentActivities: [],
      feeBalance: 0, // Will be calculated from fee balances
      totalFees: 0 // Will be calculated from fee structures
    };
  }).filter(child => child !== null);
};

  const getStudentSubjects = (studentId: number): any[] => {
    const student = students.find(s => s.id === studentId);
    if (!student) return [];
    
    const subjectIds = subjectRegistrations
      .filter((sr: SubjectRegistration) => sr.class_id === student.class_id && sr.status === 'Active')
      .map((sr: SubjectRegistration) => sr.subject_id);
    
    return subjects.filter((s: Subject) => subjectIds.includes(s.id)).map(subject => {
      const assignment = subjectAssignments.find(sa => 
        sa.subject_id === subject.id && 
        sa.class_id === student.class_id
      );
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code,
        isCompulsory: subject.is_core || false,
        teacherId: assignment?.teacher_id,
        teacherName: assignment ? `${teachers.find(t => t.id === assignment.teacher_id)?.firstName || ''} ${teachers.find(t => t.id === assignment.teacher_id)?.lastName || ''}`.trim() || 'Unknown' : 'Not Assigned'
      };
    });
  };

  const getStudentRecentScores = (studentId: number) => {
    return scores.filter(s => s.student_id === studentId).slice(-10);
  };

  const linkStudentToParent = async (parentId: number, studentId: number, relationship: "Father" | "Mother" | "Guardian" = "Guardian"): Promise<boolean> => {
    try {
      console.log(`Linking student ${studentId} to parent ${parentId} with relationship: ${relationship}`);
      
      // Create real database link
      const result = await sqlDatabase.createParentStudentLink(parentId, studentId, relationship, true);
      
      if (result) {
        // Update student's parent_id for backward compatibility
        await sqlDatabase.updateRecord('students', studentId, { parent_id: parentId });
        
        // Refresh data to reflect changes
        await loadStudentsFromAPI();
        await loadParentsFromAPI();
        await loadParentStudentLinksFromAPI();
        
        console.log('Student linked to parent successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error linking student to parent:', error);
      return false;
    }
  };

  const unlinkStudentFromParent = async (parentId: number, studentId: number): Promise<boolean> => {
    try {
      console.log(`Unlinking student ${studentId} from parent ${parentId}`);
      
      // Delete from parent_student_links table
      const result = await sqlDatabase.executeQuery(
        'DELETE FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
        [parentId, studentId]
      );
      
      if (result && result.success) {
        // Update student's parent_id to null
        await sqlDatabase.updateRecord('students', studentId, { parent_id: null });
        
        // Refresh data to reflect changes
        await loadStudentsFromAPI();
        await loadParentsFromAPI();
        await loadParentStudentLinksFromAPI();
        
        console.log('Student unlinked from parent successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unlinking student from parent:', error);
      return false;
    }
  };

  const getParentPermissions = (parentId: number): { module: string; permissions: string[] }[] => {
    return [
      { module: 'children', permissions: ['view_children', 'view_results'] },
      { module: 'payments', permissions: ['view_payments', 'make_payments'] },
      { module: 'reports', permissions: ['view_reports'] }
    ];
  };

  // Missing API Functions
  const getActiveAcademicYearAPI = async (): Promise<string> => {
    return '2025/2026';
  };

  const getActiveTermAPI = async (): Promise<string> => {
    return 'First Term';
  };

  const getRegisteredSubjectsAPI = async (classId: number): Promise<Subject[]> => {
    return getClassSubjects(classId);
  };

  const getSubjectAssignmentsAPI = async (): Promise<any[]> => {
    return subjectAssignments;
  };

  const assignSubjectToTeacherAPI = async (teacherId: number, subjectId: number, classId: number, academicYear: string, term: string): Promise<boolean> => {
    try {
      // Check if assignment already exists for this teacher
      const existingAssignment = subjectAssignments.find(assignment => 
        assignment.subject_id === subjectId &&
        assignment.class_id === classId &&
        assignment.teacher_id === teacherId &&
        assignment.academic_year === academicYear &&
        assignment.term === term
      );
      
      if (existingAssignment) {
        return false; // Already exists for this teacher
      }
      
      // Check if subject is already assigned to another teacher in the same class
      const existingSubjectAssignment = subjectAssignments.find(assignment => 
        assignment.subject_id === subjectId &&
        assignment.class_id === classId &&
        assignment.academic_year === academicYear &&
        assignment.term === term &&
        assignment.status === 'Active'
      );
      
      if (existingSubjectAssignment) {
        console.warn(`Subject ${subjectId} is already assigned to teacher ${existingSubjectAssignment.teacher_id} in class ${classId}`);
        return false; // Subject already assigned to another teacher in this class
      }
      
      const assignmentData = {
        subject_id: subjectId,
        class_id: classId,
        teacher_id: teacherId,
        academic_year: academicYear,
        term: term,
        status: 'Active'
      };
      
      const result = await sqlDatabase.createBatchSubjectAssignments([assignmentData]);
      
      if (result && result.length > 0) {
        await loadSubjectAssignmentsFromAPI();
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  const removeSubjectAssignmentAPI = async (teacherId: number, subjectId: number, classId: number, academicYear: string, term: string): Promise<boolean> => {
    try {
      // Find the assignment ID based on the criteria
      const query = `
        SELECT id FROM subject_assignments 
        WHERE teacher_id = ? AND subject_id = ? AND class_id = ? AND academic_year = ? AND term = ?
      `;
      const result = await sqlDatabase.executeQuery(query, [teacherId, subjectId, classId, academicYear, term]);
      
      if (result && result.data && result.data.length > 0) {
        const assignmentId = result.data[0].id;
        const deleteResult = await sqlDatabase.deleteRecord('subject_assignments', assignmentId);
        if (deleteResult) {
          await loadSubjectAssignmentsFromAPI();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error removing subject assignment:', error);
      return false;
    }
  };

  const getUnassignedSubjectsAPI = async (classId: number): Promise<Subject[]> => {
    const assignedSubjectIds = subjectAssignments
      .filter(sa => sa.class_id === classId)
      .map(sa => sa.subject_id);
    
    return subjects.filter(s => !assignedSubjectIds.includes(s.id));
  };

  const getAvailableTeachersAPI = async (): Promise<Teacher[]> => {
    return teachers.filter(t => t.status === 'Active');
  };

  const loadScoresFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM scores ORDER BY student_id, subject_assignment_id');
      if (result && result.data) {
        console.log('Database scores loaded:', {
          totalScores: result.data.length,
          scores: result.data.map((s: any) => ({
            id: s.id,
            student_id: s.student_id,
            subject_assignment_id: s.subject_assignment_id,
            term: s.term,
            academic_year: s.academic_year,
            status: s.status,
            ca1: s.ca1,
            ca2: s.ca2,
            exam: s.exam,
            total: s.total
          }))
        });
        setScores(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading scores:', error);
      return false;
    }
  };

  const createPaymentAPI = async (payment: Omit<Payment, 'id'>): Promise<boolean> => {
    try {
      const result = await sqlDatabase.createPayment(payment);
      return !!result;
    } catch (error) {
      console.error('Error creating payment:', error);
      return false;
    }
  };

  const loadPaymentsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM payments ORDER BY recorded_date DESC');
      if (result && result.data) {
        // Transform snake_case to camelCase for frontend compatibility
        const transformedData = result.data.map((payment: any) => ({
          id: payment.id,
          student_id: payment.student_id,
          student_name: payment.student_name,
          amount: payment.amount,
          payment_type: payment.payment_type,
          term: payment.term,
          academic_year: payment.academic_year,
          payment_method: payment.payment_method,
          reference: payment.transaction_reference,
          recorded_by: payment.recorded_by,
          recorded_date: payment.recorded_date,
          status: payment.status,
          receipt_number: payment.receipt_number,
          verified_by: payment.verified_by,
          verified_date: payment.verified_date,
          notes: payment.notes
        }));
        setPayments(transformedData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading payments:', error);
      return false;
    }
  };

  const loadAffectiveDomainsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM affective_domains ORDER BY student_id, academic_year, term');
      if (result && result.data) {
        setAffectiveDomains(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading affective domains:', error);
      return false;
    }
  };

  const loadPsychomotorDomainsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM psychomotor_domains ORDER BY student_id, academic_year, term');
      if (result && result.data) {
        setPsychomotorDomains(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading psychomotor domains:', error);
      return false;
    }
  };

  const loadCompiledResultsFromAPI = async (): Promise<boolean> => {
    try {
      if (!sqlDatabase) {
        console.error('SQL Database service is not available');
        return false;
      }
      const result = await sqlDatabase.executeQuery('SELECT * FROM compiled_results ORDER BY student_id, class_id');
      if (result && result.data) {
        setCompiledResults(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading compiled results:', error);
      return false;
    }
  };

  const createFeeStructureAPI = async (feeStructure: any): Promise<boolean> => {
    try {
      await sqlDatabase.insertRecord('fee_structures', feeStructure);
      await loadFeeStructuresFromAPI();
      return true;
    } catch (error) {
      console.error('Error creating fee structure:', error);
      return false;
    }
  };

  const getFeeStructuresAPI = async (): Promise<any> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM fee_structures ORDER BY class_id, academic_year, term');
      return result?.data || [];
    } catch (error) {
      console.error('Error getting fee structures:', error);
      return [];
    }
  };

  const getPaymentsAPI = async (): Promise<any> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM payments ORDER BY payment_date DESC');
      return result?.data || [];
    } catch (error) {
      console.error('Error getting payments:', error);
      return [];
    }
  };

  const updatePaymentStatusAPI = async (paymentId: number, status: string): Promise<any> => {
    try {
      await sqlDatabase.updateRecord('payments', paymentId, { status });
      await loadPaymentsFromAPI();
      return { success: true };
    } catch (error) {
      console.error('Error updating payment status:', error);
      return { success: false, error };
    }
  };

  const getFeeBalancesAPI = async (): Promise<any> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM student_fee_balances ORDER BY student_id');
      return result?.data || [];
    } catch (error) {
      console.error('Error getting fee balances:', error);
      return [];
    }
  };

  const createBatchPaymentsAPI = async (payments: any[]): Promise<any> => {
    try {
      for (const payment of payments) {
        await sqlDatabase.insertRecord('payments', payment);
      }
      await loadPaymentsFromAPI();
      return { success: true, count: payments.length };
    } catch (error) {
      console.error('Error creating batch payments:', error);
      return { success: false, error };
    }
  };

  const loadFeeStructuresFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM fee_structures ORDER BY class_id, academic_year, term');
      if (result && result.data) {
        setFeeStructures(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading fee structures:', error);
      return false;
    }
  };

  const loadStudentFeeBalancesFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM student_fee_balances ORDER BY student_id');
      if (result && result.data) {
        setStudentFeeBalances(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading student fee balances:', error);
      return false;
    }
  };

  const loadNotificationsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM notifications ORDER BY sent_date DESC');
      if (result && result.data) {
        setNotifications(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading notifications:', error);
      return false;
    }
  };

  const loadAttendancesFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM attendance ORDER BY date DESC, class_id');
      if (result && result.data) {
        setAttendances(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading attendances:', error);
      return false;
    }
  };

  const loadExamTimetablesFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.getExamTimetables();
      setExamTimetables(result);
      return true;
    } catch (error) {
      console.error('Error loading exam timetables:', error);
      return false;
    }
  };

  const loadClassTimetablesFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM class_timetables ORDER BY day_of_week, start_time');
      if (result && result.data) {
        setClassTimetables(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading class timetables:', error);
      return false;
    }
  };

  const loadDepartmentsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM departments ORDER BY name');
      if (result && result.data) {
        setDepartments(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading departments:', error);
      return false;
    }
  };

  const loadScholarshipsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM scholarships ORDER BY academic_year, student_id');
      if (result && result.data) {
        setScholarships(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading scholarships:', error);
      return false;
    }
  };

  const loadAssignmentsFromAPI = async (): Promise<boolean> => {
    try {
      const result = await sqlDatabase.executeQuery('SELECT * FROM assignments ORDER BY assigned_date DESC');
      if (result && result.data) {
        setAssignments(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading assignments:', error);
      return false;
    }
  };

  const getFeeStructures = (classId: number, academicYear: string): FeeStructure[] => {
    return feeStructures.filter(fs => fs.class_id === classId && fs.academic_year === academicYear);
  };

  // Missing Status API Functions
  const updateTeacherStatusAPI = async (id: number, status: string): Promise<boolean> => {
    try {
      const result = await sqlDatabase.updateTeacher(id, { status });
      return !!result;
    } catch (error) {
      console.error('Error updating teacher status:', error);
      return false;
    }
  };

  const updateParentStatusAPI = async (id: number, status: string): Promise<boolean> => {
    try {
      const result = await sqlDatabase.updateParent(id, { status });
      return !!result;
    } catch (error) {
      console.error('Error updating parent status:', error);
      return false;
    }
  };

  const updateAccountantStatusAPI = async (id: number, status: string): Promise<boolean> => {
    try {
      const result = await sqlDatabase.updateAccountant(id, { status });
      return !!result;
    } catch (error) {
      console.error('Error updating accountant status:', error);
      return false;
    }
  };

  // Exam Timetable Methods
  const addExamTimetable = async (timetable: Omit<ExamTimetable, 'id'>): Promise<number> => {
    try {
      const timetableData = {
        ...timetable,
        createdBy: currentUser?.id || null,
        academicYear: currentAcademicYear,
        term: currentTerm
      };
      const result = await sqlDatabase.createExamTimetable(timetableData);
      await loadExamTimetablesFromAPI();
      return result.id;
    } catch (error) {
      console.error('Error adding exam timetable:', error);
      throw error;
    }
  };

  const updateExamTimetable = async (id: number, timetable: Partial<ExamTimetable>): Promise<void> => {
    try {
      await sqlDatabase.updateExamTimetable(id, timetable);
      await loadExamTimetablesFromAPI();
    } catch (error) {
      console.error('Error updating exam timetable:', error);
      throw error;
    }
  };

  const deleteExamTimetable = async (id: number): Promise<void> => {
    try {
      await sqlDatabase.deleteExamTimetable(id);
      await loadExamTimetablesFromAPI();
    } catch (error) {
      console.error('Error deleting exam timetable:', error);
      throw error;
    }
  };

  const getExamTimetablesByClass = (classId: number) => {
    return examTimetables.filter((t: ExamTimetable) => t.class_id === classId);
  };

  const getExamTimetablesBySubject = (subjectId: number) => {
    return examTimetables.filter((t: ExamTimetable) => t.subject_id === subjectId);
  };

  const getExamTimetablesByDate = (date: string) => {
    return examTimetables.filter((t: ExamTimetable) => t.exam_date === date);
  };

  const getExamTimetables = (classId: number, academicYear: string, term: string) => {
    return examTimetables.filter((t: ExamTimetable) => 
      t.class_id === classId && t.academic_year === academicYear && t.term === term
    );
  };

  // Class Timetable Methods
  const addClassTimetable = async (timetable: Omit<ClassTimetable, 'id'>): Promise<number> => {
    const newId = classTimetables.length > 0 ? Math.max(...classTimetables.map((t: ClassTimetable) => t.id)) + 1 : 1;
    const newTimetable = { ...timetable, id: newId };
    setClassTimetables([...classTimetables, newTimetable]);
    return newId;
  };

  const updateClassTimetable = async (id: number, timetable: Partial<ClassTimetable>): Promise<void> => {
    setClassTimetables(classTimetables.map((t: ClassTimetable) => (t.id === id ? { ...t, ...timetable } : t)));
  };

  const deleteClassTimetable = async (id: number): Promise<void> => {
    setClassTimetables(classTimetables.filter((t: ClassTimetable) => t.id !== id));
  };

  const getClassTimetablesByClass = (classId: number) => {
    return classTimetables.filter((t: ClassTimetable) => t.class_id === classId);
  };

  const getClassTimetablesBySubject = (subjectId: number) => {
    return classTimetables.filter((t: ClassTimetable) => t.subject_id === subjectId);
  };

  const getClassTimetablesByDay = (dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday') => {
    return classTimetables.filter((t: ClassTimetable) => t.day_of_week === dayOfWeek);
  };

  const getClassTimetables = (classId: number, academicYear: string, term: string) => {
    return classTimetables.filter((t: ClassTimetable) => 
      t.class_id === classId && t.academic_year === academicYear && t.term === term
    );
  };

  // Department Methods
  const addDepartment = async (department: Omit<Department, 'id'>): Promise<number> => {
    const newId = departments.length > 0 ? Math.max(...departments.map((d: Department) => d.id)) + 1 : 1;
    const newDepartment = { ...department, id: newId };
    setDepartments([...departments, newDepartment]);
    return newId;
  };

  const updateDepartment = async (id: number, department: Partial<Department>): Promise<void> => {
    setDepartments(departments.map((d: Department) => (d.id === id ? { ...d, ...department } : d)));
  };

  const deleteDepartment = async (id: number): Promise<void> => {
    setDepartments(departments.filter((d: Department) => d.id !== id));
  };

  // Scholarship Methods
  const addScholarship = async (scholarship: Omit<Scholarship, 'id'>): Promise<number> => {
    const newId = scholarships.length > 0 ? Math.max(...scholarships.map((s: Scholarship) => s.id)) + 1 : 1;
    const newScholarship = { ...scholarship, id: newId };
    setScholarships([...scholarships, newScholarship]);
    return newId;
  };

  const updateScholarship = async (id: number, scholarship: Partial<Scholarship>): Promise<void> => {
    setScholarships(scholarships.map((s: Scholarship) => (s.id === id ? { ...s, ...scholarship } : s)));
  };

  const deleteScholarship = async (id: number): Promise<void> => {
    setScholarships(scholarships.filter((s: Scholarship) => s.id !== id));
  };

  // Assignment Methods
  const addAssignment = async (assignment: Omit<Assignment, 'id'>): Promise<number> => {
    const newId = assignments.length > 0 ? Math.max(...assignments.map((a: Assignment) => a.id)) + 1 : 1;
    const newAssignment = { ...assignment, id: newId };
    setAssignments([...assignments, newAssignment]);
    return newId;
  };

  const updateAssignment = async (id: number, assignment: Partial<Assignment>): Promise<void> => {
    setAssignments(assignments.map((a: Assignment) => (a.id === id ? { ...a, ...assignment } : a)));
  };

  const deleteAssignment = async (id: number): Promise<void> => {
    setAssignments(assignments.filter((a: Assignment) => a.id !== id));
  };

  // Score Methods
  const checkAndUpdateClassCompletionStatus = async (classId: number): Promise<void> => {
    try {
      // Get all registered subjects for this class in current term/academic year
      const registeredSubjects = subjectRegistrations.filter(sr => 
        sr.class_id === classId && 
        sr.term === currentTerm && 
        sr.academic_year === currentAcademicYear &&
        sr.status === 'Active'
      );

      // Get all students in this class
      const classStudents = students.filter(s => s.class_id === classId);

      // Check each student's compiled results
      for (const student of classStudents) {
        const compiledResult = compiledResults.find(cr => 
          cr.student_id === student.id && 
          cr.class_id === classId && 
          cr.term === currentTerm && 
          cr.academic_year === currentAcademicYear
        );

        if (compiledResult) {
          // Count how many registered subjects have scores
          const subjectsWithScores = compiledResult.scores.length;
          const totalRegisteredSubjects = registeredSubjects.length;

          // Update status based on completion
          let newStatus = compiledResult.status;
          if (subjectsWithScores === totalRegisteredSubjects && totalRegisteredSubjects > 0) {
            newStatus = 'Submitted'; // All subjects submitted
          } else if (subjectsWithScores > 0) {
            newStatus = 'Draft'; // Some subjects submitted
          }

          if (newStatus !== compiledResult.status) {
            // Update the compiled result status
            const updatedResult = { ...compiledResult, status: newStatus };
            setCompiledResults(compiledResults.map(cr => cr.id === compiledResult.id ? updatedResult : cr));

            // Show notification for status change
            if (newStatus === 'Submitted') {
              toast.success(`All subjects submitted for ${student.firstName} ${student.lastName}! Result is ready for review.`);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error checking class completion status:', error);
    }
  };

  const updateCompiledResultWithNewScore = async (studentId: number, newScore: Score): Promise<void> => {
    try {
      // Find the student's class and current term/academic year
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      // Find the subject assignment to get subject details
      const subjectAssignment = subjectAssignments.find(sa => sa.id === newScore.subject_assignment_id);
      if (!subjectAssignment) return;

      // Find or create compiled result for this student
      let compiledResult = compiledResults.find(cr => 
        cr.student_id === studentId && 
        cr.class_id === student.class_id && 
        cr.term === currentTerm && 
        cr.academic_year === currentAcademicYear
      );

      if (!compiledResult) {
        // Create new compiled result if it doesn't exist
        const newId = compiledResults.length > 0 ? Math.max(...compiledResults.map(cr => cr.id)) + 1 : 1;
        compiledResult = {
          id: newId,
          student_id: studentId,
          class_id: student.class_id,
          term: currentTerm,
          academic_year: currentAcademicYear,
          scores: [newScore],
          affective: null,
          psychomotor: null,
          total_score: newScore.total || 0,
          average_score: newScore.total || 0,
          position: 0,
          class_average: 0,
          total_students: 0,
          times_present: 0,
          times_absent: 0,
          total_attendance_days: 0,
          term_begin: '',
          term_end: '',
          next_term_begin: '',
          class_teacher_name: '',
          class_teacher_comment: '',
          principal_name: '',
          principal_comment: '',
          principal_signature: '',
          compiled_by: currentUser?.id || 0,
          compiled_date: new Date().toISOString(),
          approved_by: null,
          approved_date: null,
          rejection_reason: null,
          status: 'Draft'
        };
        setCompiledResults([...compiledResults, compiledResult]);
      } else {
        // Update existing compiled result
        if (compiledResult) {
          const existingScoreIndex = compiledResult.scores.findIndex(s => s.subject_assignment_id === newScore.subject_assignment_id);
          
          if (existingScoreIndex >= 0) {
            // Update existing score
            compiledResult.scores[existingScoreIndex] = newScore;
          } else {
            // Add new score
            compiledResult.scores.push(newScore);
          }

          // Recalculate totals
          const totalScore = compiledResult.scores.reduce((sum, score) => sum + (score.total || 0), 0);
          const averageScore = compiledResult.scores.length > 0 ? totalScore / compiledResult.scores.length : 0;

          // Update the compiled result
          const updatedResult = {
            ...compiledResult,
            scores: compiledResult?.scores,
            total_score: totalScore,
            average_score: averageScore
          };

          setCompiledResults(compiledResults.map(cr => cr.id === compiledResult?.id ? updatedResult : cr));
        }
      }

      // Check if all subjects for this class have been submitted
      await checkAndUpdateClassCompletionStatus(student.class_id);

      // Show success notification
      const subject = subjects.find(s => s.id === subjectAssignment.subject_id);
      toast.success(`Score for ${subject?.name || 'Subject'} updated in compiled results for ${student.firstName} ${student.lastName}`);

    } catch (error) {
      console.error('Error updating compiled result with new score:', error);
      toast.error('Failed to update compiled results');
    }
  };

  const addScore = async (score: Omit<Score, 'id'>): Promise<number> => {
    // Validate that the subject is registered for this class in current term
    const subjectAssignment = subjectAssignments.find(sa => sa.id === score.subject_assignment_id);
    if (!subjectAssignment) {
      throw new Error('Subject assignment not found');
    }

    const student = students.find(s => s.id === score.student_id);
    if (!student) {
      throw new Error('Student not found');
    }

    // Check if this subject is registered for the student's class
    // Note: Temporarily disabled to allow score submission
    // TODO: Ensure subjects are properly registered in subject_registrations table
    /*
    const isRegistered = subjectRegistrations.some(sr =>
      sr.subject_id === subjectAssignment.subject_id &&
      sr.class_id === student.class_id &&
      sr.term === currentTerm &&
      sr.academic_year === currentAcademicYear &&
      sr.status === 'Active'
    );

    if (!isRegistered) {
      throw new Error('This subject is not registered for this class in the current term');
    }
    */

    // Check if the current user is the assigned teacher for this subject
    if (currentUser && currentUser.role === 'teacher') {
      const isAssignedTeacher = subjectAssignments.some(sa =>
        sa.id === score.subject_assignment_id &&
        sa.teacher_id === currentUser.linked_id
      );

      if (!isAssignedTeacher) {
        throw new Error('Only the assigned teacher can submit scores for this subject');
      }
    }

    // Save to database using direct SQL query
    try {
      const result = await sqlDatabase.insertRecord('scores', {
        student_id: score.student_id,
        subject_assignment_id: score.subject_assignment_id,
        ca1: score.ca1 || 0,
        ca2: score.ca2 || 0,
        exam: score.exam || 0,
        total: score.total || 0,
        grade: score.grade || '',
        remark: score.remark || '',
        class_average: score.class_average || 0,
        class_min: score.class_min || 0,
        class_max: score.class_max || 0,
        entered_by: currentUser?.id || 0,
        entered_date: new Date().toISOString(),
        status: score.status || 'Draft',
        academic_year: currentAcademicYear,
        term: currentTerm
      });
      
      if (result) {
        // Reload scores from database to get the new data
        await loadScoresFromAPI();
        
        // Automatically update compiled result for this student
        await updateCompiledResultWithNewScore(score.student_id, { ...score, id: result });
        
        return result;
      } else {
        throw new Error('Failed to insert score record');
      }
    } catch (error) {
      console.error('Error adding score:', error);
      throw error;
    }
  };

  const updateScore = async (id: number, score: Partial<Score>): Promise<void> => {
    // Find existing score to get subject assignment and student
    const existingScore = scores.find(s => s.id === id);
    if (!existingScore) {
      throw new Error('Score not found');
    }

    // Check if the current user is the assigned teacher for this subject
    if (currentUser && currentUser.role === 'teacher') {
      const subjectAssignment = subjectAssignments.find(sa => sa.id === existingScore.subject_assignment_id);
      if (!subjectAssignment || subjectAssignment.teacher_id !== currentUser.linked_id) {
        throw new Error('Only the assigned teacher can update scores for this subject');
      }
    }

    // Update in database using direct SQL query
    try {
      const updateData: any = {};
      if (score.ca1 !== undefined) updateData.ca1 = score.ca1;
      if (score.ca2 !== undefined) updateData.ca2 = score.ca2;
      if (score.exam !== undefined) updateData.exam = score.exam;
      if (score.total !== undefined) updateData.total = score.total;
      if (score.grade !== undefined) updateData.grade = score.grade;
      if (score.remark !== undefined) updateData.remark = score.remark;
      if (score.class_average !== undefined) updateData.class_average = score.class_average;
      if (score.class_min !== undefined) updateData.class_min = score.class_min;
      if (score.class_max !== undefined) updateData.class_max = score.class_max;
      if (score.status !== undefined) updateData.status = score.status;

      const result = await sqlDatabase.updateRecord('scores', id, updateData);
      
      if (result) {
        // Reload scores from database to get the updated data
        await loadScoresFromAPI();
        
        // Update compiled result for this student
        await updateCompiledResultWithNewScore(existingScore.student_id, { ...existingScore, ...score });
      } else {
        throw new Error('Failed to update score record');
      }
    } catch (error) {
      console.error('Error updating score:', error);
      throw error;
    }
  };

  const deleteScore = async (id: number): Promise<void> => {
    setScores(scores.filter((s: Score) => s.id !== id));
  };

  const createBatchScores = async (batchScores: Omit<Score, 'id'>[]): Promise<boolean> => {
    try {
      const newScores = batchScores.map((score, index) => ({
        ...score,
        id: scores.length > 0 ? Math.max(...scores.map((s: Score) => s.id)) + index + 1 : index + 1
      }));

      setScores([...scores, ...newScores]);

      // Update compiled results for each student
      const studentIds = [...new Set(batchScores.map(s => s.student_id))];
      for (const studentId of studentIds) {
        const studentScores = newScores.filter(s => s.student_id === studentId);
        for (const score of studentScores) {
          await updateCompiledResultWithNewScore(studentId, score);
        }
      }

      toast.success(`${batchScores.length} scores submitted and updated in compiled results`);
      return true;
    } catch (error) {
      console.error('Error creating batch scores:', error);
      toast.error('Failed to submit batch scores');
      return false;
    }
  };

  const getScoresByAssignment = (subjectAssignmentId: number) => {
    return scores.filter(s => s.subject_assignment_id === subjectAssignmentId);
  };

  const getScoresByStudent = (studentId: number) => {
    return scores.filter(s => s.student_id === studentId);
  };

  const getScoresByClass = (classId: number, academicYear: string, term: string) => {
    return scores.filter(s => {
      const assignment = subjectAssignments.find(sa => sa.id === s.subject_assignment_id);
      return assignment && assignment.class_id === classId && s.academic_year === academicYear && s.term === term;
    });
  };

  // Score rejection function for class teachers
  const rejectScore = async (scoreId: number, rejectionReason: string, rejectedBy: number): Promise<void> => {
    try {
      // Update database with rejection info (after migration)
      await sqlDatabase.updateRecord('scores', scoreId, {
        status: 'Rejected',
        rejection_reason: rejectionReason,
        rejected_by: rejectedBy,
        rejected_date: new Date().toISOString()
      });

      // Update local state
      setScores((scores: any[]) => scores.map((s: any) => 
        s.id === scoreId 
          ? { ...s, status: 'Rejected', rejectionReason, rejectedBy, rejectedDate: new Date().toISOString() }
          : s
      ));

      toast.success('Score rejected and notification sent to subject teacher');
    } catch (error) {
      console.error('Error rejecting score:', error);
      toast.error('Failed to reject score');
      throw error;
    }
  };

  // Score approval function for class teachers
  const approveScore = async (scoreId: number, approvedBy: number): Promise<void> => {
    try {
      await sqlDatabase.updateRecord('scores', scoreId, {
        status: 'Submitted',
        rejection_reason: null,
        rejected_by: null,
        rejected_date: null
      });

      // Update local state
      setScores((scores: any[]) => scores.map((s: any) => 
        s.id === scoreId 
          ? { ...s, status: 'Submitted', rejectionReason: undefined, rejectedBy: undefined, rejectedDate: undefined }
          : s
      ));

      toast.success('Score approved');
    } catch (error) {
      console.error('Error approving score:', error);
      toast.error('Failed to approve score');
      throw error;
    }
  };

  // Get pending scores for class teacher review
  const getPendingScores = (classId?: number) => {
    const pendingScores = scores.filter((s: any) => s.status === 'Submitted');
    
    if (classId) {
      return pendingScores.filter((s: any) => {
        const assignment = subjectAssignments.find((sa: any) => sa.id === s.subject_assignment_id);
        return assignment && assignment.class_id === classId;
      });
    }
    
    return pendingScores;
  };

  // Wrapper functions for missing non-API methods
  const updateTeacherStatus = async (id: number, status: string): Promise<void> => {
    await updateTeacherStatusAPI(id, status);
  };

  const getStudentRecentActivities = (studentId: number) => {
    // Return recent activities for a student (placeholder implementation)
    return [];
  };

  const getClassesByLevel = (level: string) => {
    return classes.filter(c => c.level === level);
  };

  const getClassStudents = (classId: number) => {
    return students.filter(s => s.class_id === classId);
  };

  const updateClassTeacher = async (classId: number, teacherId: number): Promise<void> => {
    // Placeholder implementation
    console.log(`Updating class ${classId} teacher to ${teacherId}`);
  };

  const getSubjectsByCategory = (category: string) => {
    return subjects.filter(s => s.category === category);
  };

  const getSubjectsByLevel = (level: string) => {
    return subjects.filter(s => s.department === level || s.category === level);
  };

  const getRegisteredSubjects = (classId: number, academicYear: string, term: string) => {
    const registrations = subjectRegistrations.filter(sr => 
      sr.class_id === classId && 
      sr.academic_year === academicYear && 
      sr.term === term
    );
    
    // Return the actual Subject objects
    return registrations.map(sr => {
      const subject = subjects.find(s => s.id === sr.subject_id);
      return subject || null;
    }).filter(Boolean) as Subject[];
  };

  // Add missing wrapper functions
  const getSubjectRegistrations = (academicYear: string, term: string) => {
    return subjectRegistrations.filter(sr => 
      sr.academic_year === academicYear && 
      sr.term === term
    );
  };

  const assignSubjectToTeacher = async (teacherId: number, subjectId: number, classId: number, academicYear: string, term: string): Promise<boolean> => {
    return await assignSubjectToTeacherAPI(teacherId, subjectId, classId, academicYear, term);
  };

  const removeSubjectAssignment = async (teacherId: number, subjectId: number, classId: number, academicYear: string, term: string): Promise<boolean> => {
    return await removeSubjectAssignmentAPI(teacherId, subjectId, classId, academicYear, term);
  };

  const getSubjectAssignments = (academicYear: string, term: string) => {
    return subjectAssignments.filter(sa => 
      sa.academic_year === academicYear && 
      sa.term === term
    );
  };

  const getTeacherSubjectAssignments = (teacherId: number, academicYear: string, term: string) => {
    return subjectAssignments.filter(sa => 
      sa.teacher_id === teacherId &&
      sa.academic_year === academicYear && 
      sa.term === term
    );
  };

  const getClassSubjectAssignments = (classId: number, academicYear: string, term: string) => {
    return subjectAssignments.filter(sa => 
      sa.class_id === classId &&
      sa.academic_year === academicYear && 
      sa.term === term
    );
  };

  const getUnassignedSubjects = (classId: number, academicYear: string, term: string) => {
    const assignedSubjectIds = subjectAssignments
      .filter(sa => sa.class_id === classId && sa.academic_year === academicYear && sa.term === term)
      .map(sa => sa.subject_id);
    
    return subjects.filter(s => !assignedSubjectIds.includes(s.id));
  };

  const getAvailableTeachers = (academicYear: string, term: string, subjectId: number, classId: number) => {
    // Return all teachers for now - could be enhanced with availability logic
    return teachers;
  };

  // Add missing score and result methods

  const getCompiledResults = (academicYear: string, term: string) => {
    return compiledResults.filter(r => 
      r.academic_year === academicYear && 
      r.term === term
    );
  };

  const getResultsByStudent = (studentId: number) => {
    return compiledResults.filter(r => r.student_id === studentId);
  };

  // Add missing attendance and approval methods
  const getAttendanceByStudent = (studentId: number) => {
    return [];
  };

  const getAttendanceByClass = (classId: number) => {
    return [];
  };

  // Add missing methods
  const getAttendanceSummary = (classId: number, academicYear: string, term: string) => {
    return [];
  };

  const createBatchAttendance = async (attendanceRecords: Omit<Attendance, 'id'>[]): Promise<boolean> => {
    try {
      for (const record of attendanceRecords) {
        await sqlDatabase.createAttendance(record);
      }
      return true;
    } catch (error) {
      console.error('Error creating batch attendance:', error);
      return false;
    }
  };

  const deleteUser = async (id: number): Promise<boolean> => {
    return await deleteUserAPI(id);
  };

  const deleteFeeStructure = async (id: number): Promise<void> => {
    try {
      await sqlDatabase.deleteRecord('fee_structures', id);
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      throw error;
    }
  };

  const getDepartments = () => {
    return [];
  };

  const getScholarships = () => {
    return [];
  };

  const getStudentScholarships = (studentId: number) => {
    return [];
  };

  const createUser = async (userData: any): Promise<User | null> => {
    return await createUserAPI(userData);
  };

  const updateUser = async (id: number, userData: any): Promise<boolean> => {
    return await updateUserAPI(id, userData);
  };

  const approveCompiledResult = async (resultId: number): Promise<void> => {
    // Implementation would go here
  };

  const publishCompiledResult = async (resultId: number): Promise<void> => {
    // Implementation would go here
  };

  const value: SchoolContextType = {
    // Data
    students,
    teachers,
    parents,
    accountants,
    classes,
    subjects,
    subjectRegistrations,
    subjectAssignments,
    scores,
    affectiveDomains,
    psychomotorDomains,
    compiledResults,
    payments,
    users,
    currentUser,
    feeStructures,
    studentFeeBalances,
    notifications,
    activityLogs,
    attendances,
    examTimetables,
    classTimetables,
    departments,
    scholarships,
    assignments,
    parentStudentLinks: parentStudentLinksData,

    // Settings
    currentTerm,
    currentAcademicYear,
    schoolSettings,
    bankAccountSettings,

    // Methods
    addStudent,
    updateStudent,
    deleteStudent,
    deleteBulkStudents,
    getStudentsByClass,
    refreshStudents,
    addTeacher,
    updateTeacher,
    updateTeacherStatus,
    deleteTeacher,
    getTeacherAssignments,
    getTeacherClasses,
    getClassesByLevel,
    getClassStudents,
    getStudentRecentActivities,
    addParent,
    updateParent,
    deleteParent,
    getParentStudents,
    addAccountant,
    updateAccountant,
    deleteAccountant,
    addClass,
    updateClass,
    updateClassTeacher,
    deleteClass,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectsByCategory,
    getSubjectsByLevel,
    getRegisteredSubjects,
    getSubjectRegistrations,
    assignSubjectToTeacher,
    removeSubjectAssignment,
    getSubjectAssignments,
    getTeacherSubjectAssignments,
    getClassSubjectAssignments,
    getUnassignedSubjects,
    getAvailableTeachers,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    registerSubjectForClass,
    removeSubjectRegistration: removeSubjectRegistrationAPI,
    addScore,
    updateScore,
    deleteScore,
    createBatchScores,
    getScoresByAssignment,
    getScoresByStudent,
    getScoresByClass,
    rejectScore,
    approveScore,
    getPendingScores,
    updateCompiledResult,
    deleteCompiledResult,
    getResultsByClass,
    getCompiledResults,
    getResultsByStudent,
    getAttendanceByStudent,
    getAttendanceByClass,
    approveCompiledResult,
    publishCompiledResult,
    addPayment,
    updatePayment,
    verifyPayment,
    getPaymentsByStudent,
    addFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
    getFeeStructures,
    getStudentFeeBalance,
    updateStudentFeeBalance,
    createUserAPI,
    updateUserAPI,
    deleteUserAPI,
    setCurrentUser,
    login,
    changePassword,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    getUnreadNotifications,
    getAllNotifications,
    getClassTeacher,
    getClassSubjects,
    updateClassStudentCount,
    loadCurrentTermAndYear,
    loadSchoolSettings,
    getAllAcademicYears,
    getCompiledResultsByYearAndTerm,
    updateCurrentTerm,
    updateCurrentAcademicYear,
    updateSchoolSettings,
    updateBankAccountSettings,
    getBankAccountSettings,
    validateClassTeacherAssignment,
    addActivityLog,
    getActivityLogs,
    promoteStudent,
    promoteMultipleStudents,
    addCompiledResult: compileResult, // Implementation for interface

    // Attendance Methods
    addAttendance,
    updateAttendance,
    deleteAttendance,
    getAttendancesByStudent,
    getAttendancesByClass,
    getAttendancesByDate,

    // Exam Timetable Methods
    addExamTimetable,
    updateExamTimetable,
    deleteExamTimetable,
    getExamTimetables,
    getExamTimetablesByClass,
    getExamTimetablesBySubject,
    getExamTimetablesByDate,

    // Class Timetable Methods
    addClassTimetable,
    updateClassTimetable,
    deleteClassTimetable,
    getClassTimetables,
    getClassTimetablesByClass,
    getClassTimetablesBySubject,
    getClassTimetablesByDay,

    // Department Methods
    addDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartments,

    // Scholarship Methods
    addScholarship,
    updateScholarship,
    deleteScholarship,
    getScholarships,
    getStudentScholarships,

    // Enhanced Teacher Assignment Methods
    getTeacherStudents,
    getTeacherResponsibilities,
    
    // Enhanced Parent-Child Linking Methods
    getParentChildren,
    getStudentSubjects,
    getStudentRecentScores,
    linkStudentToParent,
    linkParentToStudent,
    unlinkStudentFromParent,
    getParentPermissions,

    // API Integration Methods
    loadStudentsFromAPI,
    loadTeachersFromAPI,
    loadClassesFromAPI,
    loadSubjectsFromAPI,
    loadSubjectRegistrationsFromAPI,
    loadSubjectAssignmentsFromAPI,
    loadParentsFromAPI,
    loadParentStudentLinksFromAPI,
    loadAccountantsFromAPI,
    loadUsersFromAPI,
    loadScoresFromAPI,
    loadAffectiveDomainsFromAPI,
    loadPsychomotorDomainsFromAPI,
    loadFeeStructuresFromAPI,
    loadStudentFeeBalancesFromAPI,
    loadNotificationsFromAPI,
    loadAttendancesFromAPI,
    loadExamTimetablesFromAPI,
    loadClassTimetablesFromAPI,
    loadDepartmentsFromAPI,
    loadScholarshipsFromAPI,
    loadAssignmentsFromAPI,
    // Real-time Sync Methods
    refreshAllData: async () => {
      await Promise.all([
        loadUsersFromAPI(),
        loadTeachersFromAPI(),
        loadParentsFromAPI(),
        loadParentStudentLinksFromAPI(),
        loadAccountantsFromAPI(),
        loadStudentsFromAPI(),
        loadClassesFromAPI(),
        loadSubjectsFromAPI(),
        loadSubjectRegistrationsFromAPI(),
        loadSubjectAssignmentsFromAPI(),
        loadPaymentsFromAPI(),
        loadFeeStructuresFromAPI(),
        loadStudentFeeBalancesFromAPI(),
        loadNotificationsFromAPI(),
        loadAttendancesFromAPI(),
        loadScoresFromAPI(),
        loadAffectiveDomainsFromAPI(),
        loadPsychomotorDomainsFromAPI(),
        loadCompiledResultsFromAPI(),
        loadExamTimetablesFromAPI(),
        loadClassTimetablesFromAPI(),
        loadDepartmentsFromAPI(),
        loadScholarshipsFromAPI(),
        loadAssignmentsFromAPI(),
      ]);
    },
    
    // Teacher-specific refresh methods
    refreshTeacherData: async (teacherId: number) => {
      await Promise.all([
        loadStudentsFromAPI(),
        loadClassesFromAPI(),
        loadSubjectsFromAPI(),
        loadSubjectAssignmentsFromAPI(),
        loadScoresFromAPI(),
        loadAffectiveDomainsFromAPI(),
        loadPsychomotorDomainsFromAPI(),
        loadCompiledResultsFromAPI(),
      ]);
    },
    
    // Class-specific refresh
    refreshClassData: async (classId: number) => {
      await Promise.all([
        loadStudentsFromAPI(),
        loadScoresFromAPI(),
        loadAffectiveDomainsFromAPI(),
        loadPsychomotorDomainsFromAPI(),
        loadCompiledResultsFromAPI(),
      ]);
    },
    
    // Permission checking methods
    hasPermission: async (permission: string): Promise<boolean> => {
      if (!currentUser) return false;
      try {
        return await sqlDatabase.checkUserPermission(currentUser.role, permission);
      } catch (error) {
        console.error('Error checking permission:', error);
        return false;
      }
    },
    
    canViewStudents: async (): Promise<boolean> => {
      return await sqlDatabase.checkUserPermission('teacher', 'read_students');
    },
    
    canManageScores: async (): Promise<boolean> => {
      return await sqlDatabase.checkUserPermission('teacher', 'manage_assignments');
    },
    
    canViewResults: async (): Promise<boolean> => {
      return await sqlDatabase.checkUserPermission('teacher', 'view_student_reports');
    },
    
    canManageClasses: async (): Promise<boolean> => {
      return await sqlDatabase.checkUserPermission('teacher', 'manage_classes');
    },
    
    canManageSubjects: async (): Promise<boolean> => {
      return await sqlDatabase.checkUserPermission('teacher', 'manage_subjects');
    },
    
    // Real-time event listeners
    subscribeToDataUpdates: (callback: () => void) => {
      const interval = setInterval(async () => {
        try {
          await loadScoresFromAPI();
          callback();
        } catch (error) {
          console.error('Error in real-time sync:', error);
        }
      }, 30000);
      
      return () => clearInterval(interval);
    },
    
    loadAllDataFromAPI: async () => {
      await loadUsersFromAPI();
      await loadTeachersFromAPI();
      await loadParentsFromAPI();
      await loadParentStudentLinksFromAPI();
      await loadAccountantsFromAPI();
      await loadStudentsFromAPI();
      await loadClassesFromAPI();
      await loadSubjectsFromAPI();
      await loadSubjectRegistrationsFromAPI();
      await loadSubjectAssignmentsFromAPI();
      await loadPaymentsFromAPI();
      await loadFeeStructuresFromAPI();
      await loadStudentFeeBalancesFromAPI();
    },
    
    // User Management Methods
    deleteUser,
    createUser,
    updateUser,
    updateUserStatus: updateUserStatusAPI,
    updateUserStatusAPI,
    resetUserPassword: resetUserPassword,
    resetUserPasswordAPI,
    getUserPermissions: getUserPermissionsAPI,
    getUserPermissionsAPI,
    
    // Attendance Methods
    getAttendanceSummary,
    createBatchAttendance,
    
    // Teacher API Methods
    createTeacherAPI,
    updateTeacherAPI,
    deleteTeacherAPI,
    
    // Parent API Methods
    createParentAPI,
    updateParentAPI,
    deleteParentAPI,
    
    // Accountant API Methods
    createAccountantAPI,
    updateAccountantAPI,
    deleteAccountantAPI,
    
    // Status Management API Methods
    updateTeacherStatusAPI,
    updateParentStatusAPI,
    updateAccountantStatusAPI,
    
    // Subject Registration API Methods
    getActiveAcademicYearAPI,
    getActiveTermAPI,
    getRegisteredSubjectsAPI,
    registerSubjectForClassAPI,
    removeSubjectRegistrationAPI,
    getSubjectRegistrationsAPI,
    getSubjectAssignmentsAPI,
    assignSubjectToTeacherAPI,
    removeSubjectAssignmentAPI,
    getUnassignedSubjectsAPI,
    getAvailableTeachersAPI,
    
    // Payment API Methods
    createPaymentAPI,
    loadPaymentsFromAPI,
    createFeeStructureAPI,
    getFeeStructuresAPI,
    getPaymentsAPI,
    updatePaymentStatusAPI,
    getFeeBalancesAPI,
    createBatchPaymentsAPI,

    // Affective and Psychomotor API Methods
    addAffectiveDomain: async (affectiveData: any) => {
      try {
        const result = await sqlDatabase.createAffectiveDomain(affectiveData);
        toast.success('Affective domain assessment saved');
        return result;
      } catch (error: any) {
        console.error('Error saving affective domain:', error);
        
        // Check if it's a duplicate entry error
        const errorMessage = error.message || '';
        if (errorMessage.includes('Database operation failed') && errorMessage.includes('Integrity constraint violation') && errorMessage.includes('unique_affective')) {
          try {
            // Find existing record and update it
            const existing = affectiveDomains.find(a =>
              a.student_id === affectiveData.student_id &&
              a.class_id === affectiveData.class_id &&
              a.term === affectiveData.term &&
              a.academic_year === affectiveData.academic_year
            );
            
            if (existing) {
              const result = await sqlDatabase.updateAffectiveDomain(existing.id, affectiveData);
              toast.success('Affective domain assessment updated');
              return result;
            }
          } catch (updateError) {
            console.error('Error updating existing affective domain:', updateError);
            toast.error('Failed to update affective domain assessment');
            throw updateError;
          }
        } else {
          toast.error('Failed to save affective domain assessment');
          throw error;
        }
      }
    },

    updateAffectiveDomain: async (id: number, affectiveData: any) => {
      try {
        const result = await sqlDatabase.updateAffectiveDomain(id, affectiveData);
        toast.success('Affective domain assessment updated');
        return result;
      } catch (error) {
        console.error('Error updating affective domain:', error);
        toast.error('Failed to update affective domain assessment');
        throw error;
      }
    },

    addPsychomotorDomain: async (psychomotorData: any) => {
      try {
        const result = await sqlDatabase.createPsychomotorDomain(psychomotorData);
        toast.success('Psychomotor domain assessment saved');
        return result;
      } catch (error: any) {
        console.error('Error saving psychomotor domain:', error);
        
        // Check if it's a duplicate entry error
        const errorMessage = error.message || '';
        if (errorMessage.includes('Database operation failed') && errorMessage.includes('Integrity constraint violation') && errorMessage.includes('unique_psychomotor')) {
          try {
            // Find existing record and update it
            const existing = psychomotorDomains.find(p =>
              p.student_id === psychomotorData.student_id &&
              p.class_id === psychomotorData.class_id &&
              p.term === psychomotorData.term &&
              p.academic_year === psychomotorData.academic_year
            );
            
            if (existing) {
              const result = await sqlDatabase.updatePsychomotorDomain(existing.id, psychomotorData);
              toast.success('Psychomotor domain assessment updated');
              return result;
            }
          } catch (updateError) {
            console.error('Error updating existing psychomotor domain:', updateError);
            toast.error('Failed to update psychomotor domain assessment');
            throw updateError;
          }
        } else {
          toast.error('Failed to save psychomotor domain assessment');
          throw error;
        }
      }
    },

    updatePsychomotorDomain: async (id: number, psychomotorData: any) => {
      try {
        const result = await sqlDatabase.updatePsychomotorDomain(id, psychomotorData);
        toast.success('Psychomotor domain assessment updated');
        return result;
      } catch (error) {
        console.error('Error updating psychomotor domain:', error);
        toast.error('Failed to update psychomotor domain assessment');
        throw error;
      }
    },

    deleteAffectiveDomain: async (id: number) => {
      try {
        await sqlDatabase.deleteAffectiveDomain(id);
        toast.success('Affective domain assessment deleted');
      } catch (error) {
        console.error('Error deleting affective domain:', error);
        toast.error('Failed to delete affective domain assessment');
        throw error;
      }
    },

    deletePsychomotorDomain: async (id: number) => {
      try {
        await sqlDatabase.deletePsychomotorDomain(id);
        toast.success('Psychomotor domain assessment deleted');
      } catch (error) {
        console.error('Error deleting psychomotor domain:', error);
        toast.error('Failed to delete psychomotor domain assessment');
        throw error;
      }
    },

    // Aliases for create methods (to match interface)
    createAffectiveDomain: async (affectiveData: any) => {
      return await sqlDatabase.createAffectiveDomain(affectiveData);
    },

    createPsychomotorDomain: async (psychomotorData: any) => {
      return await sqlDatabase.createPsychomotorDomain(psychomotorData);
    },

    updateAttendanceRequirements,
    getAttendanceRequirements,
    loadAttendanceRequirements,
    getTeacherClassTeacherAssignments,

    // User Management Methods
    checkUserPermissionAPI,
    getPendingApprovals,
    loadCompiledResultsFromAPI,
  };

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
};
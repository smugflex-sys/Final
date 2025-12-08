import { useState, useRef, useMemo, lazy, Suspense } from "react";
import { Search, Edit, Trash2, Eye, UserPlus, AlertCircle, Users, BookOpen, Upload, Download, Key, Image as ImageIcon, Link2, Power, Save, X, GraduationCap, RefreshCw, CheckSquare, Square, Unlink } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { SimpleDropdown, SimpleDropdownItem, SimpleDropdownSeparator } from "../ui/simple-dropdown";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "sonner";
import { useSchool, Student } from "../../contexts/SchoolContext";
import sqlDatabase from "../../services/sqlDatabase";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { exportStudentsToCSV } from "../../utils/csvExporter";
import { importStudentsFromCSV, generateStudentTemplate } from "../../utils/csvImporter";

// Lazy load the Add Student form component
const AddStudentForm = lazy(() => import('./AddStudentFormSimple'));

interface ManageStudentsPageProps {
  onNavigateToLink?: () => void;
}

export function ManageStudentsPage({ onNavigateToLink }: ManageStudentsPageProps) {
  const { 
    students, 
    teachers, 
    parents, 
    classes, 
    subjects,
    users,
    addStudent, 
    updateStudent, 
    deleteStudent,
    deleteBulkStudents,
    getStudentsByClass,
    refreshStudents,
    currentUser,
    updateUser,
    resetUserPasswordAPI
  } = useSchool();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [linkGuardianDialogOpen, setLinkGuardianDialogOpen] = useState(false);
  const [uploadPassportDialogOpen, setUploadPassportDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false);
  const [quickImportDialogOpen, setQuickImportDialogOpen] = useState(false);
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined);
  const [importProgress, setImportProgress] = useState({ processed: 0, total: 0 });
  const [isImporting, setIsImporting] = useState(false);
  
  const passportInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    other_name: "",
    gender: "Male" as "Male" | "Female",
    date_of_birth: "",
    admission_number: "",
  });

  // Memoized filtered students for performance
  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) {
      return [];
    }
    
    return students.filter(student => {
      const matchesSearch =
        (student.firstName && student.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.lastName && student.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.admissionNumber && student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesClass = filterClass === "All" || student.className === filterClass;
      const matchesLevel = filterLevel === "All" || 
        (student.classCategory && student.classCategory === filterLevel) ||
        (student.level && student.level === filterLevel);

      return matchesSearch && matchesClass && matchesLevel;
    });
  }, [students, searchTerm, filterClass, filterLevel]);

  // Memoized statistics for performance
  const stats = useMemo(() => {
    if (!Array.isArray(students)) {
      return {
        total: 0,
        active: 0,
        primary: 0,
        secondary: 0,
      };
    }
    
    return {
      total: students.length,
      active: students.filter(s => s.status === "Active").length,
      primary: students.filter(s => 
        (s.classCategory && s.classCategory === "Primary") || 
        (s.level && s.level === "Primary")
      ).length,
      secondary: students.filter(s => 
        (s.classCategory && s.classCategory === "Secondary") || 
        (s.level && s.level === "Secondary")
      ).length,
    };
  }, [students]);

  // Get unique levels and classes
  const levels = ["All", "Primary", "Secondary"];
  const classNames = ["All", ...(Array.isArray(classes) ? Array.from(new Set(classes.map(c => c.name))) : [])];

  const getParentInfo = (studentId: number) => {
    const student = Array.isArray(students) ? students.find(s => s.id === studentId) : null;
    
    // If no student or no parent_id, return empty values
    if (!student || !student.parent_id || student.parent_id === 0) {
      return {
        name: "",
        username: "",
        phone: "",
        email: ""
      };
    }
    
    const parent = Array.isArray(parents) ? parents.find(p => p.id === student.parent_id) : null;
    if (!parent) {
      return {
        name: "",
        username: "",
        phone: "",
        email: ""
      };
    }
    
    // Only show parent info if parent has a valid phone number
    if (!parent.phone || parent.phone.trim() === "") {
      return {
        name: "",
        username: "",
        phone: "",
        email: ""
      };
    }
    
    return {
      name: `${parent.firstName} ${parent.lastName}`,
      username: parent.email?.split('@')[0] || "",
      phone: parent.phone || "",
      email: parent.email || ""
    };
  };

  const unlinkAllStudents = async () => {
    if (!confirm('Are you sure you want to unlink all students from parents? This action cannot be undone.')) {
      return;
    }

    try {
      // Update all students to set parent_id to null
      const result = await sqlDatabase.executeQuery(
        'UPDATE students SET parent_id = NULL WHERE parent_id IS NOT NULL'
      );

      if (result && result.success) {
        console.log(`Unlinked ${result.affectedRows} students from parents`);
        // Refresh students data to see the changes
        await refreshStudents();
        alert(`Successfully unlinked ${result.affectedRows} students from parents.`);
      } else {
        console.error('Failed to unlink students:', result);
        alert('Failed to unlink students. Please try again.');
      }
    } catch (error) {
      console.error('Error unlinking students:', error);
      alert('An error occurred while unlinking students. Please try again.');
    }
  };

  const getStudentUser = (studentId: number) => {
    return Array.isArray(users) ? users.find(u => u.id === studentId) : null;
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setViewDialogOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData({
      first_name: student.firstName,
      last_name: student.lastName,
      other_name: student.otherName || "",
      date_of_birth: student.date_of_birth,
      admission_number: student.admissionNumber,
      gender: student.gender
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedStudent) return;
    
    try {
      await updateStudent(selectedStudent.id, editFormData);
      toast.success(`Student ${editFormData.first_name} ${editFormData.last_name} updated successfully`);
      setEditDialogOpen(false);
      setSelectedStudent(null);
      // Force refresh to ensure real-time sync
      await refreshStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
    }
  };

  const handleDelete = async () => {
    if (selectedStudent) {
      try {
        await deleteStudent(selectedStudent.id);
        toast.success(`Student "${selectedStudent.firstName} ${selectedStudent.lastName}" deleted successfully!`);
        setDeleteDialogOpen(false);
        setSelectedStudent(null);
        // Force refresh to ensure real-time sync
        await refreshStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      }
    }
  };

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (student: Student) => {
    const newStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    const actionKey = `status-${student.id}`;
    try {
      setActionLoading(actionKey);
      await updateStudent(student.id, { status: newStatus });
      
      // Also update user account status
      const user = getStudentUser(student.id);
      if (user) {
        await updateUser(user.id, { status: newStatus });
      }
      
      toast.success(`Student ${student.firstName} ${student.lastName} ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
      
      // Force refresh to ensure real-time sync
      await refreshStudents();
    } catch (error) {
      console.error('Error toggling student status:', error);
      toast.error('Failed to update student status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLinkGuardian = () => {
    if (!selectedStudent || !selectedParentId) {
      toast.error("Please select a guardian");
      return;
    }

    updateStudent(selectedStudent.id, { parent_id: parseInt(selectedParentId) });
    toast.success("Guardian linked successfully");
    setLinkGuardianDialogOpen(false);
    setSelectedStudent(null);
  };

  // Multi-select handlers
  const handleSelectStudent = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedStudents([]);
      setIsSelectAll(false);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
      setIsSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      toast.error('No students selected for deletion');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedStudents.length} student(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const actionKey = 'bulk-delete';
      setActionLoading(actionKey);

      // Use the bulk delete method from context
      const result = await deleteBulkStudents(selectedStudents);

      toast.success(result?.summary || `${selectedStudents.length} student(s) deleted successfully`);
      setSelectedStudents([]);
      setIsSelectAll(false);
      
      // Force refresh to ensure real-time sync
      await refreshStudents();
    } catch (error) {
      console.error('Error bulk deleting students:', error);
      toast.error('Failed to delete some students');
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshStudents();
      toast.success("Student list refreshed successfully");
    } catch (error) {
      console.error('Error refreshing students:', error);
      toast.error('Failed to refresh student list');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePassportUpload = () => {
    if (!selectedStudent || !passportFile) {
      toast.error("Please select a passport photo");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const passportDataUrl = reader.result as string;
      updateStudent(selectedStudent.id, { passportPhoto: passportDataUrl } as any);
      toast.success("Passport photo uploaded successfully");
      setUploadPassportDialogOpen(false);
      setPassportFile(null);
      setSelectedStudent(null);
    };
    reader.readAsDataURL(passportFile);
  };

  const handleResetPassword = async () => {
    if (!selectedStudent) return;
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const user = getStudentUser(selectedStudent.id);
    if (user) {
      await resetUserPasswordAPI(user.id);
      toast.success(`Password reset successfully for ${selectedStudent.firstName} ${selectedStudent.lastName}`);
    } else {
      toast.error("User account not found");
    }

    setNewPassword("");
    setConfirmPassword("");
    setResetPasswordDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleQuickImportGRAStudents = () => {
    const graStudents = [
      { admission_number: "GRA/25199", last_name: "COLLINS", first_name: "CORREEN", other_name: "SETH", parentName: "MANU SETH COLLINS", parentUsername: "sethcollins1@gra", phone: "8064489992", email: "collinsjuliet2012@gmail.com", username: "correen1@gra", gender: "FEMALE", class_name: "JASPER (G K )" },
      { admission_number: "GRA/25203", last_name: "KALLA", first_name: "TENICHA", other_name: "YELLE", parentName: "USMAN YELLE", parentUsername: "yelle1@gra", phone: "8133925121", email: "twinkyells@gmail.com", username: "tenicha1@gra", gender: "FEMALE", class_name: "JASPER (G K )" },
      { admission_number: "GRA/25204", last_name: "ADAMS", first_name: "DARIUS", other_name: "MSHELIA", parentName: "AYUBA MSHELIA ADAMS", parentUsername: "msheliaadams1@gra", phone: "7036261062", email: "adamsvictoria703@gmail.com", username: "darius1@gra", gender: "MALE", class_name: "JASPER (G K )" },
      { admission_number: "GRA/25205", last_name: "BITRUS", first_name: "HANNAH", other_name: "", parentName: "BITRUS YAKUBU", parentUsername: "yakubu2@gra", phone: "8038675206", email: "bitrusyakubu35@gmail.com", username: "hannah1@gra", gender: "FEMALE", class_name: "JASPER (G K )" },
      { admission_number: "GRA/25207", last_name: "FABIAN", first_name: "TESTIMONY", other_name: "IFECHUKWU", parentName: "CHINWEUBA FABIAN", parentUsername: "fabian1@gra", phone: "7061229572", email: "ezeifeoluchukwugrace@gmail.com", username: "testimony1@gra", gender: "FEMALE", class_name: "JASPER (G K )" },
      { admission_number: "GRA/25208", last_name: "HARUNA", first_name: "AMINA", other_name: "", parentName: "BARDE HARUNA", parentUsername: "haruna1@gra", phone: "8135659098", email: "harunabarde1111@gmail.com", username: "amina1@gra", gender: "FEMALE", class_name: "JASPER (G K )" },
      { admission_number: "GRA/25210", last_name: "KEFAS", first_name: "MARY", other_name: "", parentName: "JESSE KEFAS", parentUsername: "kefas1@gra", phone: "7030602036", email: "jessekefas08081981@gmail.com", username: "mary1@gra", gender: "FEMALE", class_name: "JASPER (G K )" },
      { admission_number: "GRA/25213", last_name: "CROMWELL", first_name: "ASHER", other_name: "", parentName: "CROWELL BATURE", parentUsername: "bature1@gra", phone: "7069539064", email: "ruthjoshuam@gmail.com", username: "asher1@gra", gender: "MALE", class_name: "JASPER (G K )" },
      { admission_number: "GRA/25461", last_name: "AARON", first_name: "ANNABELLE", other_name: "ALEYIRO", parentName: "AMOS AARON", parentUsername: "aaron1@gra", phone: "9063333784", email: "e12@gmail.com", username: "annabelle1@gra", gender: "FEMALE", class_name: "JASPER (G K )" },
      { admission_number: "GRA/25462", last_name: "MICHAEL", first_name: "AUDREY", other_name: "", parentName: "MICHEAL OTEIKWU", parentUsername: "oteikwu1@gra", phone: "8033628676", email: "r@gmail.com", username: "audrey2@gra", gender: "FEMALE", class_name: "JASPER (G K )" },
      { admission_number: "GRA/25463", last_name: "BARNABAS", first_name: "BARUCH", other_name: "IBRAHIM", parentName: "BARNABAS IBRAHIM", parentUsername: "ibrahim1@gra", phone: "8060820119", email: "d3@gmail.com", username: "baruch1@gra", gender: "MALE", class_name: "JASPER (G K )" },
    ];

    const studentsText = graStudents.map(s => 
      `${s.admission_number} - ${s.first_name} ${s.last_name}${s.other_name ? ' ' + s.other_name : ''} - ${s.username} - Parent: ${s.parentName} (${s.parentUsername})`
    ).join('\n');
    
    navigator.clipboard.writeText(studentsText).then(() => {
      toast.success(`${graStudents.length} GRA students list copied to clipboard!`);
    });
    
    setQuickImportDialogOpen(false);
  };

  const handleExportCSV = async () => {
    try {
      await exportStudentsToCSV();
      toast.success("Students exported to CSV successfully from database");
    } catch (error) {
      toast.error("Failed to export students from database");
      }
  };

  const exportCSVTemplate = () => {
    const template = generateStudentTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("CSV template downloaded - Admission numbers will be auto-generated if left empty");
  };

  const handleCSVImport = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file");
      return;
    }

    setIsImporting(true);
    setImportProgress({ processed: 0, total: 0 });

    try {
      const result = await importStudentsFromCSV(
        csvFile, 
        selectedClassId,
        (processed, total) => {
          setImportProgress({ processed, total });
        }
      );
      
      if (result.errors.length > 0) {
        toast.error(`Import completed with ${result.errors.length} errors`);
        }
      
      if (result.imported.length > 0) {
        toast.success(`${result.imported.length} students imported successfully to database`);
        setCSVFile(null);
        if (csvInputRef.current) {
          csvInputRef.current.value = '';
        }
        setBulkImportDialogOpen(false);
        setSelectedClassId(undefined);
        
        // Refresh students data from database
        window.location.reload();
      } else {
        toast.error("No valid students found in CSV file");
      }
    } catch (error) {
      toast.error("Failed to import CSV file to database");
      } finally {
      setIsImporting(false);
      setImportProgress({ processed: 0, total: 0 });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0A2540] mb-2">Manage Students</h1>
          <p className="text-gray-600">View, edit, and manage all registered students</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setAddStudentDialogOpen(true)}
            className="bg-[#10B981] hover:bg-[#059669] text-white rounded-xl"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="rounded-xl border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => setBulkImportDialogOpen(true)}
            className="bg-[#10B981] hover:bg-[#059669] text-white rounded-xl"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import CSV
          </Button>
          <Button
            onClick={() => setQuickImportDialogOpen(true)}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl"
          >
            <Users className="w-4 h-4 mr-2" />
            Import GRA Students
          </Button>
          <Button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="rounded-xl border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white"
          >
            {isRefreshing ? (
              <div className="w-4 h-4 animate-spin rounded-full border border-gray-300 border-t-green-600 mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Students</p>
                <p className="text-[#0A2540]">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active</p>
                <p className="text-[#0A2540]">{stats.active}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Primary</p>
                <p className="text-[#0A2540]">{stats.primary}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Secondary</p>
                <p className="text-[#0A2540]">{stats.secondary}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <BookOpen className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={unlinkAllStudents}
          variant="destructive"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Unlink className="w-4 h-4" />
          Unlink All Students from Parents
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-[#0A2540]/10">
        <CardContent className="p-6">
          {/* Primary Filters */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#0A2540] mb-3 flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Primary Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or admission number..."
                  className="pl-10 rounded-xl border-[#0A2540]/20"
                />
              </div>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="rounded-xl border-[#0A2540]/20">
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level === "All" ? "All Levels" : level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Secondary Filters */}
          <div>
            <h3 className="text-sm font-semibold text-[#0A2540] mb-3 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Secondary Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="rounded-xl border-[#0A2540]/20">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classNames.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className === "All" ? "All Classes" : className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <span className="bg-gray-100 px-3 py-2 rounded-lg">
                  {filteredStudents.length} of {students.length} students
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border-[#0A2540]/10 rounded-xl bg-white shadow-clinical">
        <CardHeader className="border-b border-[#0A2540]/10 bg-[#0A2540]/5 flex flex-row items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <h3 className="text-[#0A2540]">Students ({filteredStudents.length})</h3>
            {selectedStudents.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedStudents.length} selected
                </span>
                <Button
                  onClick={handleBulkDelete}
                  disabled={actionLoading === 'bulk-delete'}
                  variant="destructive"
                  size="sm"
                  className="rounded-lg"
                >
                  {actionLoading === 'bulk-delete' ? (
                    <div className="w-4 h-4 animate-spin rounded-full border border-gray-300 border-t-white mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full min-w-[1000px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-[#0A2540] font-medium w-12">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center justify-center w-full"
                    >
                      {isSelectAll ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="text-[#0A2540] font-medium">Student Reg</TableHead>
                  <TableHead className="text-[#0A2540] font-medium">Last Name</TableHead>
                  <TableHead className="text-[#0A2540] font-medium">First Name</TableHead>
                  <TableHead className="text-[#0A2540] font-medium">Other Name</TableHead>
                  <TableHead className="text-[#0A2540] font-medium">Parent/Guardian</TableHead>
                  <TableHead className="text-[#0A2540] font-medium">Phone Number</TableHead>
                  <TableHead className="text-[#0A2540] font-medium">Class</TableHead>
                  <TableHead className="text-[#0A2540] font-medium">Gender</TableHead>
                  <TableHead className="text-[#0A2540] font-medium text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow className="bg-white">
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-12 h-12 text-gray-300" />
                        <p>No students found</p>
                        <div className="text-sm text-gray-400">
                          <p>Total students: {students.length}</p>
                          <p>Search term: "{searchTerm}"</p>
                          <p>Filter class: {filterClass}</p>
                          <p>Filter level: {filterLevel}</p>
                        </div>
                        <Button
                          onClick={() => toast.info("Navigate to Add Student page")}
                          className="mt-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add First Student
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => {
                    const parentInfo = getParentInfo(student.id);
                    const studentUser = getStudentUser(student.id);
                    return (
                      <TableRow key={student.id} className="bg-white border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                        <TableCell className="w-12">
                          <button
                            onClick={() => handleSelectStudent(student.id)}
                            className="flex items-center justify-center w-full"
                          >
                            {selectedStudents.includes(student.id) ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-xl font-mono text-xs">
                            {student.admissionNumber}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#1F2937]">{student.lastName}</TableCell>
                        <TableCell className="text-[#1F2937]">{student.firstName}</TableCell>
                        <TableCell className="text-[#6B7280] text-sm">{student.otherName || "-"}</TableCell>
                        <TableCell className="text-[#6B7280] text-sm">{parentInfo.name}</TableCell>
                        <TableCell className="text-[#6B7280] text-sm">{parentInfo.phone}</TableCell>
                        <TableCell className="text-[#6B7280] text-sm">{student.className}</TableCell>
                        <TableCell className="text-[#6B7280] text-sm">{student.gender}</TableCell>
                        <TableCell>
                          <SimpleDropdown
                            trigger={
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-lg hover:bg-[#F3F4F6] hover:border-[#D1D5DB] border border-transparent transition-all duration-200"
                              >
                                <Power className="h-4 w-4 text-[#6B7280]" />
                              </Button>
                            }
                          >
                            <SimpleDropdownItem onClick={() => handleView(student)}>
                              <Eye className="h-3 w-3" />
                              View
                            </SimpleDropdownItem>
                            <SimpleDropdownItem onClick={() => handleEdit(student)}>
                              <Edit className="h-3 w-3" />
                              Edit
                            </SimpleDropdownItem>
                            <SimpleDropdownSeparator />
                            <SimpleDropdownItem onClick={() => {
                              setSelectedStudent(student);
                              setLinkGuardianDialogOpen(true);
                            }}>
                              <Link2 className="h-3 w-3" />
                              Link Guardian
                            </SimpleDropdownItem>
                            <SimpleDropdownItem onClick={() => {
                              setSelectedStudent(student);
                              setUploadPassportDialogOpen(true);
                            }}>
                              <ImageIcon className="h-3 w-3" />
                              Photo
                            </SimpleDropdownItem>
                            <SimpleDropdownItem onClick={() => {
                              setSelectedStudent(student);
                              setResetPasswordDialogOpen(true);
                            }}>
                              <Key className="h-3 w-3" />
                              Reset Password
                            </SimpleDropdownItem>
                            <SimpleDropdownSeparator />
                            <SimpleDropdownItem 
                              onClick={() => handleToggleStatus(student)}
                              disabled={actionLoading === `status-${student.id}`}
                            >
                              {actionLoading === `status-${student.id}` ? (
                                <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-blue-600" />
                              ) : (
                                <Power className="h-3 w-3" />
                              )}
                              {actionLoading === `status-${student.id}` ? 'Updating...' : (student.status === 'Active' ? 'Deactivate' : 'Activate')}
                            </SimpleDropdownItem>
                            <SimpleDropdownSeparator />
                            <SimpleDropdownItem 
                              onClick={() => openDeleteDialog(student)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </SimpleDropdownItem>
                          </SimpleDropdown>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Student Dialog */}
      {selectedStudent && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-[#0A2540]">Student Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Admission Number</p>
                  <p className="text-[#0A2540]">{selectedStudent.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    className={`rounded-xl ${
                      selectedStudent.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedStudent.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">First Name</p>
                  <p className="text-[#0A2540]">{selectedStudent.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Name</p>
                  <p className="text-[#0A2540]">{selectedStudent.lastName}</p>
                </div>
              </div>
              {selectedStudent.otherName && (
                <div>
                  <p className="text-sm text-gray-600">Other Name</p>
                  <p className="text-[#0A2540]">{selectedStudent.otherName}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="text-[#0A2540]">{selectedStudent.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="text-[#0A2540]">{selectedStudent.date_of_birth}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="text-[#0A2540]">{selectedStudent.className}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Level</p>
                  <p className="text-[#0A2540]">{selectedStudent.level}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Parent/Guardian</p>
                <p className="text-[#0A2540]">{getParentInfo(selectedStudent.id).name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Academic Year</p>
                <p className="text-[#0A2540]">{selectedStudent.academic_year}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl rounded-xl bg-white border border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">Edit Student</DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              Update student information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#1F2937]">First Name</Label>
                <Input
                  value={editFormData.first_name}
                  onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                  className="rounded-xl border-[#E5E7EB] bg-white text-[#1F2937]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#1F2937]">Last Name</Label>
                <Input
                  value={editFormData.last_name}
                  onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                  className="rounded-xl border-[#E5E7EB] bg-white text-[#1F2937]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#1F2937]">Other Name</Label>
                <Input
                  value={editFormData.other_name}
                  onChange={(e) => setEditFormData({ ...editFormData, other_name: e.target.value })}
                  className="rounded-xl border-[#E5E7EB] bg-white text-[#1F2937]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#1F2937]">Gender</Label>
                <Select value={editFormData.gender} onValueChange={(value: "Male" | "Female") => setEditFormData({ ...editFormData, gender: value })}>
                  <SelectTrigger className="rounded-xl border-[#E5E7EB]">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#1F2937]">Date of Birth</Label>
                <Input
                  type="date"
                  value={editFormData.date_of_birth}
                  onChange={(e) => setEditFormData({ ...editFormData, date_of_birth: e.target.value })}
                  className="rounded-xl border-[#E5E7EB] bg-white text-[#1F2937]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#1F2937]">Admission Number</Label>
                <Input
                  value={editFormData.admission_number}
                  onChange={(e) => setEditFormData({ ...editFormData, admission_number: e.target.value })}
                  className="rounded-xl border-[#E5E7EB] bg-white text-[#1F2937]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setEditDialogOpen(false)}
              variant="outline"
              className="rounded-xl border-[#E5E7EB] text-[#1F2937]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Guardian Dialog */}
      <Dialog open={linkGuardianDialogOpen} onOpenChange={setLinkGuardianDialogOpen}>
        <DialogContent className="max-w-md rounded-xl bg-white border border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">Link Guardian</DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              {selectedStudent && `Link guardian for ${selectedStudent.firstName} ${selectedStudent.lastName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#1F2937]">Select Guardian</Label>
              <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                <SelectTrigger className="rounded-xl border-[#E5E7EB]">
                  <SelectValue placeholder="Choose a guardian" />
                </SelectTrigger>
                <SelectContent>
                  {parents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id.toString()}>
                      {parent.firstName} {parent.lastName} - {parent.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setLinkGuardianDialogOpen(false);
                setSelectedParentId("");
              }}
              variant="outline"
              className="rounded-xl border-[#E5E7EB] text-[#1F2937]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLinkGuardian}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl"
            >
              Link Guardian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Passport Dialog */}
      <Dialog open={uploadPassportDialogOpen} onOpenChange={setUploadPassportDialogOpen}>
        <DialogContent className="max-w-md rounded-xl bg-white border border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">Upload Passport Photo</DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              {selectedStudent && `Upload passport photo for ${selectedStudent.firstName} ${selectedStudent.lastName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#1F2937]">Select Photo</Label>
              <div className="flex items-center gap-3">
                <Input
                  ref={passportInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                  className="rounded-xl border-[#E5E7EB] bg-white text-[#1F2937]"
                />
              </div>
              {passportFile && (
                <p className="text-sm text-[#6B7280]">Selected: {passportFile.name}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setUploadPassportDialogOpen(false);
                setPassportFile(null);
              }}
              variant="outline"
              className="rounded-xl border-[#E5E7EB] text-[#1F2937]"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePassportUpload}
              className="bg-[#06B6D4] hover:bg-[#0891B2] text-white rounded-xl"
            >
              Upload Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent className="max-w-md rounded-xl bg-white border border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">Reset Password</DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              {selectedStudent && `Reset password for ${selectedStudent.firstName} ${selectedStudent.lastName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#1F2937]">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="rounded-xl border-[#E5E7EB] bg-white text-[#1F2937]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1F2937]">Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="rounded-xl border-[#E5E7EB] bg-white text-[#1F2937]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setResetPasswordDialogOpen(false);
                setNewPassword("");
                setConfirmPassword("");
              }}
              variant="outline"
              className="rounded-xl border-[#E5E7EB] text-[#1F2937]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl"
            >
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import CSV Dialog */}
      <Dialog open={bulkImportDialogOpen} onOpenChange={setBulkImportDialogOpen}>
        <DialogContent className="max-w-2xl rounded-xl bg-white border border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">Bulk Import Students</DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              Import multiple students from a CSV file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="border-blue-200 bg-blue-50 rounded-xl">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Enhanced CSV Format:</strong> Student Reg (Optional - auto-generated if empty), Last Name, First Name, Other Name, Gender, Date of Birth, Parent Name, Parent Phone, Parent Email, Parent Username, Student Username, Student Email, Academic Year
              </AlertDescription>
            </Alert>
            <Alert className="border-green-200 bg-green-50 rounded-xl">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong>Automatic Admission Numbers:</strong> Leave the admission number column empty in your CSV and the system will automatically generate unique admission numbers in the format GRA/YYYY/####.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label className="text-[#1F2937]">Select Target Class (Optional)</Label>
              <Select
                value={selectedClassId?.toString() || "csv"}
                onValueChange={(value: string) => setSelectedClassId(value === "csv" ? undefined : parseInt(value))}
              >
                <SelectTrigger className="rounded-xl border-[#E5E7EB] bg-white text-[#1F2937]">
                  <SelectValue placeholder="Use Class from CSV" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">Use Class from CSV</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name} ({cls.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClassId && (
                <p className="text-sm text-[#6B7280]">
                  All students will be imported to: {classes.find(c => c.id === selectedClassId)?.name}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#1F2937]">Select CSV File</Label>
              <Input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => setCSVFile(e.target.files?.[0] || null)}
                className="rounded-xl border-[#E5E7EB] bg-white text-[#1F2937]"
                disabled={isImporting}
              />
              {csvFile && (
                <p className="text-sm text-[#6B7280]">Selected: {csvFile.name}</p>
              )}
            </div>

            {isImporting && (
              <div className="space-y-2">
                <Label className="text-[#1F2937]">Import Progress</Label>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(importProgress.processed / importProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-[#6B7280]">
                  Processing: {importProgress.processed} / {importProgress.total} students
                </p>
              </div>
            )}

            <Button
              onClick={exportCSVTemplate}
              variant="outline"
              className="w-full rounded-xl border-[#E5E7EB] text-[#1F2937]"
              disabled={isImporting}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Enhanced CSV Template
            </Button>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setBulkImportDialogOpen(false);
                setCSVFile(null);
              }}
              variant="outline"
              className="rounded-xl border-[#E5E7EB] text-[#1F2937]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCSVImport}
              className="bg-[#10B981] hover:bg-[#059669] text-white rounded-xl"
              disabled={isImporting || !csvFile}
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importing to Database...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Students to Database
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Import GRA Students Dialog */}
      <Dialog open={quickImportDialogOpen} onOpenChange={setQuickImportDialogOpen}>
        <DialogContent className="max-w-3xl rounded-xl bg-white border border-[#E5E7EB] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">Import GRA JASPER (G K) Students</DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              Quick import of 11 students from JASPER (G K) class
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="border-green-200 bg-green-50 rounded-xl">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                This will prepare the data for 11 students. You'll still need to register them individually through the Add Student page to create their accounts.
              </AlertDescription>
            </Alert>
            
            <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB] max-h-64 overflow-y-auto">
              <p className="text-[#1F2937] mb-2">Student List Preview:</p>
              <ul className="text-sm text-[#6B7280] space-y-1">
                <li>1. GRA/25199 - COLLINS CORREEN SETH (Parent: MANU SETH COLLINS)</li>
                <li>2. GRA/25203 - KALLA TENICHA YELLE (Parent: USMAN YELLE)</li>
                <li>3. GRA/25204 - ADAMS DARIUS MSHELIA (Parent: AYUBA MSHELIA ADAMS)</li>
                <li>4. GRA/25205 - BITRUS HANNAH (Parent: BITRUS YAKUBU)</li>
                <li>5. GRA/25207 - FABIAN TESTIMONY IFECHUKWU (Parent: CHINWEUBA FABIAN)</li>
                <li>6. GRA/25208 - HARUNA AMINA (Parent: BARDE HARUNA)</li>
                <li>7. GRA/25210 - KEFAS MARY (Parent: JESSE KEFAS)</li>
                <li>8. GRA/25213 - CROMWELL ASHER (Parent: CROWELL BATURE)</li>
                <li>9. GRA/25461 - AARON ANNABELLE ALEYIRO (Parent: AMOS AARON)</li>
                <li>10. GRA/25462 - MICHAEL AUDREY (Parent: MICHEAL OTEIKWU)</li>
                <li>11. GRA/25463 - BARNABAS BARUCH IBRAHIM (Parent: BARNABAS IBRAHIM)</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setQuickImportDialogOpen(false)}
              variant="outline"
              className="rounded-xl border-[#E5E7EB] text-[#1F2937]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleQuickImportGRAStudents}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl"
            >
              <Users className="w-4 h-4 mr-2" />
              Copy Student List to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedStudent?.firstName} {selectedStudent?.lastName}"?
              This will remove all their records including scores, attendance, and payments. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Student Dialog */}
      <Dialog open={addStudentDialogOpen} onOpenChange={setAddStudentDialogOpen}>
        <DialogContent className="rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#0A2540]">Register New Student</DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a new student to the school management system
            </DialogDescription>
          </DialogHeader>

          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading Add Student form...</div>
            </div>
          }>
            <AddStudentForm 
              onClose={() => setAddStudentDialogOpen(false)}
              onSuccess={() => setAddStudentDialogOpen(false)}
            />
          </Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
}

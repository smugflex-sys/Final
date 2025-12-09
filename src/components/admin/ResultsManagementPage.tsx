import { useState, useMemo, useRef, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  FileText, 
  Users, 
  Calendar,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  Trash2,
  ArrowLeft,
  BarChart3,
  Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { StudentResultCard } from "../shared/StudentResultCard";
import { ResultSheetViewerButton } from "./ResultSheetViewer";
import { useSchool } from "../../contexts/SchoolContext";
import { toast } from "sonner";

type ViewMode = "management" | "viewAll" | "viewSheets";

export function ResultsManagementPage() {
  const {
    currentUser,
    students,
    classes,
    compiledResults,
    updateCompiledResult,
    deleteCompiledResult,
    currentTerm,
    currentAcademicYear,
    parents,
    teachers,
    loadCompiledResultsFromAPI,
    addNotification,
    getAllAcademicYears,
    getCompiledResultsByYearAndTerm,
  } = useSchool();
  
  // Bulk selection state
  const [selectedResults, setSelectedResults] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkComment, setBulkComment] = useState("");
  const [bulkRejectionReason, setBulkRejectionReason] = useState("");
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  // const { broadcast } = useNotificationService();

  const [viewMode, setViewMode] = useState<ViewMode>("management");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [selectedTerm, setSelectedTerm] = useState<string>(currentTerm);
  const [selectedYear, setSelectedYear] = useState<string>(currentAcademicYear);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState<number | null>(null);
  const [principalComment, setPrincipalComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const resultSheetRef = useRef<HTMLDivElement>(null);

  // Load data on component mount
  useEffect(() => {
    loadCompiledResultsFromAPI();
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      const years = await getAllAcademicYears();
      setAcademicYears(years);
    } catch (error) {
      console.error('Error loading academic years:', error);
    }
  };

  useEffect(() => {
    if (selectedYear && selectedTerm) {
      loadResultsForYearAndTerm();
    }
  }, [selectedYear, selectedTerm]);

  const loadResultsForYearAndTerm = async () => {
    if (selectedYear === currentAcademicYear && selectedTerm === currentTerm) {
      // Load current session results normally
      loadCompiledResultsFromAPI();
    } else {
      // Load historical results
      try {
        const results = await getCompiledResultsByYearAndTerm(selectedYear, selectedTerm);
        // Update the compiledResults in context temporarily
        // This is a simple approach - in production you might want a separate state
        console.log('Loaded historical results:', results);
      } catch (error) {
        console.error('Error loading historical results:', error);
      }
    }
  };

  // Filter results based on active tab (must be called before early returns)
  const filteredResults = useMemo(() => {
    let results = compiledResults.filter(
      (r: any) =>
        r.term === selectedTerm &&
        r.academic_year === selectedYear &&
        (selectedClassId === "all" || r.class_id === Number(selectedClassId))
    );

    // Filter by status based on tab
    if (activeTab === "pending") {
      results = results.filter((r: any) => r.status === "Submitted");
    } else if (activeTab === "approved") {
      results = results.filter((r: any) => r.status === "Approved");
    } else if (activeTab === "rejected") {
      results = results.filter((r: any) => r.status === "Rejected");
    } else if (activeTab === "all") {
      // Show all results EXCEPT rejected ones
      results = results.filter((r: any) => r.status !== "Rejected");
    }

    // Search filter
    if (searchQuery) {
      results = results.filter((r: any) => {
        const student = students.find((s: any) => s.id === r.student_id);
        if (!student) return false;
        const query = searchQuery.toLowerCase();
        return (
          (student.firstName && student.firstName.toLowerCase().includes(query)) ||
          (student.lastName && student.lastName.toLowerCase().includes(query)) ||
          (student.admissionNumber && student.admissionNumber.toLowerCase().includes(query))
        );
      });
    }

    return results;
  }, [compiledResults, selectedTerm, selectedYear, selectedClassId, activeTab, searchQuery, students]);

  // Get students with results
  const studentsWithResults = useMemo(() => {
    return filteredResults
      .map((result: any) => {
        const student = students.find((s: any) => s.id === result.student_id);
        return student ? { ...student, result } : null;
      })
      .filter(Boolean);
  }, [filteredResults, students]);

  // Get selected result
  const selectedResultData = useMemo(() => {
    if (!selectedResult) return null;
    return compiledResults.find((r: any) => r.id === selectedResult);
  }, [selectedResult, compiledResults]);

  const selectedStudent = useMemo(() => {
    if (!selectedResultData) return null;
    return students.find((s: any) => s.id === selectedResultData.student_id);
  }, [selectedResultData, students]);

  // If viewing other pages, render them (after all hooks have been called)
  if (viewMode === "viewAll") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setViewMode("management")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Management
          </Button>
          <h1 className="text-[#0A2540]">View All Results</h1>
        </div>
        <ViewAllResultsPage onBack={() => setViewMode("management")} />
      </div>
    );
  }

  if (viewMode === "viewSheets") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setViewMode("management")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Management
          </Button>
          <h1 className="text-[#0A2540]">View Result Sheets</h1>
        </div>
        <ViewResultSheetsPage onBack={() => setViewMode("management")} />
      </div>
    );
  }

  // Handle approve
  const handleApprove = (resultId: number) => {
    const result = compiledResults.find((r: any) => r.id === resultId);
    if (!result) return;

    if (!principalComment.trim()) {
      toast.error("Please enter a principal comment");
      return;
    }

    updateCompiledResult(resultId, {
      status: "Approved",
      approved_by: currentUser?.id || null,
      approved_date: new Date().toISOString(),
      principal_comment: principalComment,
      principal_signature: "", // Can add signature upload later
    });

    // Notify parent and teacher
    const student = students.find((s: any) => s.id === result.student_id);
    if (student) {
      // Broadcast real-time notification
      // broadcast({
      //   id: Date.now(),
      //   title: "Result Approved ✓",
      //   message: `${student.firstName} ${student.lastName}'s result for ${result.term} has been approved.`,
      //   type: "success",
      //   targetAudience: "all" as const,
      //   sentDate: new Date().toISOString(),
      // });

      // Send specific notification to parent if available
      if (student.parent_id) {
        const parent = parents.find((p: any) => p.id === student.parent_id);
        if (parent) {
          // broadcast({
          //   id: Date.now() + 1,
          //   title: "Your Child's Result is Ready!",
          //   message: `${student.firstName} ${student.lastName}'s result for ${result.term} ${result.academic_year} has been approved. Click to view.`,
          //   type: "success" as const,
          //   targetAudience: "parents" as const,
          //   sentDate: new Date().toISOString(),
          // });
        }
      }

      // Notify class teacher
      const classInfo = classes.find((c: any) => c.id === result.class_id);
      if (classInfo?.classTeacherId) {
        const classTeacher = teachers.find((t: any) => t.id === classInfo.classTeacherId);
        if (classTeacher) {
          // broadcast({
          //   id: Date.now() + 2,
          //   title: "Result Approved",
          //   message: `Result for ${student.firstName} ${student.lastName} (${classInfo.name}) has been approved.`,
          //   type: "info" as const,
          //   targetAudience: "teachers" as const,
          //   sentDate: new Date().toISOString(),
          // });
        }
      }
    }

    toast.success("Result approved successfully!");
    setPrincipalComment("");
    setSelectedResult(null);
  };

  // Handle reject
  const handleReject = async (resultId: number) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    updateCompiledResult(resultId, {
      status: "Rejected",
      rejection_reason: rejectionReason,
    });

    const result = compiledResults.find((r) => r.id === resultId);
    const student = students.find((s) => s.id === result?.student_id);
    
    if (student && result) {
      const notificationData = {
        title: "Result Rejected ⚠",
        message: `${student.firstName} ${student.lastName}'s result for ${result.term} has been rejected. Reason: ${rejectionReason}`,
        type: "warning" as const,
        targetAudience: "all" as const,
        sentBy: currentUser!.id,
      };
      
      // Create real database notification
      await addNotification({
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        targetAudience: notificationData.targetAudience,
        sentBy: notificationData.sentBy,
        sentDate: new Date().toISOString(),
        isRead: false,
        readBy: []
      });

      // Notify class teacher specifically
      const classInfo = classes.find((c: any) => c.id === result.class_id);
      if (classInfo?.classTeacherId) {
        const classTeacher = teachers.find((t: any) => t.id === classInfo.classTeacherId);
        if (classTeacher) {
          const teacherNotification = {
            title: "Result Rejected - Action Required",
            message: `Result for ${student.firstName} ${student.lastName} (${classInfo.name}) was rejected. Reason: ${rejectionReason}. Please review and resubmit.`,
            type: "warning" as const,
            targetAudience: "teachers" as const,
            sentBy: currentUser!.id,
          };
          // Create real database notification for teacher
          await addNotification({
            title: teacherNotification.title,
            message: teacherNotification.message,
            type: teacherNotification.type,
            targetAudience: teacherNotification.targetAudience,
            sentBy: teacherNotification.sentBy,
            sentDate: new Date().toISOString(),
            isRead: false,
            readBy: []
          });
          
          toast.info(`Notification sent to ${classTeacher.firstName} ${classTeacher.lastName}`);
        }
      }
    }

    toast.warning("Result rejected");
    setRejectionReason("");
    setSelectedResult(null);
  };

  // Handle delete
  const handleDelete = (resultId: number) => {
    if (window.confirm("Are you sure you want to delete this result? This action cannot be undone.")) {
      deleteCompiledResult(resultId);
      toast.success("Result deleted successfully");
      setSelectedResult(null);
    }
  };

  // Handle print
  const handlePrint = () => {
    if (resultSheetRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write("<html><head><title>Result Sheet</title>");
        printWindow.document.write("<style>@media print { body { margin: 0; } }</style>");
        printWindow.document.write("</head><body>");
        printWindow.document.write(resultSheetRef.current.innerHTML);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          toast.success("Result sheet printed successfully");
        }, 250);
      }
    }
  };

  // Handle download
  const handleDownload = () => {
    handlePrint();
    toast.info("Use your browser's 'Save as PDF' option in the print dialog");
  };

  // Bulk selection handlers
  const handleSelectResult = (resultId: number) => {
    setSelectedResults(prev => 
      prev.includes(resultId) 
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  const handleSelectAll = () => {
    if (selectedResults.length === filteredResults.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(filteredResults.map(r => r.id));
    }
  };

  // Bulk approve function
  const handleBulkApprove = () => {
    if (!bulkComment.trim()) {
      toast.error("Please provide a comment for bulk approval");
      return;
    }

    selectedResults.forEach(resultId => {
      updateCompiledResult(resultId, {
        status: "Approved",
        principal_comment: bulkComment,
        approved_by: currentUser?.id,
        approved_date: new Date().toISOString(),
      });
    });

    toast.success(`Approved ${selectedResults.length} results successfully!`);
    setSelectedResults([]);
    setBulkComment("");
    setShowBulkApproveDialog(false);
  };

  // Bulk reject function
  const handleBulkReject = async () => {
    if (!bulkRejectionReason.trim()) {
      toast.error("Please provide a reason for bulk rejection");
      return;
    }

    for (const resultId of selectedResults) {
      const result = compiledResults.find((r) => r.id === resultId);
      const student = students.find((s) => s.id === result?.student_id);
      
      updateCompiledResult(resultId, {
        status: "Rejected",
        rejection_reason: bulkRejectionReason,
      });

      // Notify class teacher for correction
      if (student && result) {
        const classInfo = classes.find((c: any) => c.id === result.class_id);
        if (classInfo?.classTeacherId) {
          const classTeacher = teachers.find((t: any) => t.id === classInfo.classTeacherId);
          if (classTeacher) {
            // Create notification for teacher
            const teacherNotification = {
              title: "Result Rejected - Action Required",
              message: `Result for ${student.firstName} ${student.lastName} (${classInfo.name}) was rejected. Reason: ${bulkRejectionReason}. Please review and resubmit.`,
              type: "warning" as const,
              targetAudience: "teachers" as const,
              sentBy: currentUser!.id,
              sentDate: new Date().toISOString(),
            };
            
            // Create real database notification
            await addNotification({
              title: teacherNotification.title,
              message: teacherNotification.message,
              type: teacherNotification.type,
              targetAudience: teacherNotification.targetAudience,
              sentBy: teacherNotification.sentBy,
              sentDate: teacherNotification.sentDate,
              isRead: false,
              readBy: []
            });
            
            toast.info(`Notification sent to ${classTeacher.firstName} ${classTeacher.lastName}`);
          }
        }
      }
    }

    toast.warning(`Rejected ${selectedResults.length} results! Teachers notified for corrections.`);
    setSelectedResults([]);
    setBulkRejectionReason("");
    setShowBulkRejectDialog(false);
  };

  // Get results for current class (bulk operations)
  const classResults = useMemo(() => {
    if (!selectedClassId || selectedClassId === "all") return filteredResults;
    return filteredResults.filter(r => r.class_id === parseInt(selectedClassId));
  }, [filteredResults, selectedClassId]);

  return (
    <div className="p-4 space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Results Management</h1>
          <p className="text-sm text-gray-500 mt-1">Approve and manage student results</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("viewAll")}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            All Results
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("viewSheets")}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <FileText className="w-4 h-4 mr-1" />
            Sheets
          </Button>
        </div>
      </div>

      {/* Compact Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-9 rounded-lg border-gray-200 text-sm">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="h-9 rounded-lg border-gray-200 text-sm">
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">First</SelectItem>
                  <SelectItem value="Second Term">Second</SelectItem>
                  <SelectItem value="Third Term">Third</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="h-9 rounded-lg border-gray-200 text-sm">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  placeholder="Student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-9 rounded-lg border-gray-200 text-sm"
                />
              </div>
            </div>
            <div className="flex items-end">
              {/* Session Indicator */}
              {selectedYear !== currentAcademicYear || selectedTerm !== currentTerm ? (
                <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                  <Calendar className="w-3 h-3" />
                  <span>Historical</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md">
                  <Calendar className="w-3 h-3" />
                  <span>Current</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-50 rounded-lg p-1 h-9">
          <TabsTrigger value="pending" className="rounded-md text-xs data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800">
            Pending ({compiledResults.filter(r => r.status === "Submitted" && r.term === selectedTerm && r.academic_year === selectedYear).length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-md text-xs data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
            Approved ({compiledResults.filter(r => r.status === "Approved" && r.term === selectedTerm && r.academic_year === selectedYear).length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-md text-xs data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
            Rejected ({compiledResults.filter(r => r.status === "Rejected" && r.term === selectedTerm && r.academic_year === selectedYear).length})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-md text-xs data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
            All ({compiledResults.filter(r => r.status !== "Rejected" && r.term === selectedTerm && r.academic_year === selectedYear).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {/* Compact Bulk Actions */}
          {activeTab === "pending" && filteredResults.length > 0 && (
            <Card className="border-gray-200 shadow-sm mb-3">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedResults.length === filteredResults.length && filteredResults.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">
                      {selectedResults.length} of {filteredResults.length} selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setShowBulkApproveDialog(true)}
                      disabled={selectedResults.length === 0}
                      className="bg-green-600 hover:bg-green-700 text-white h-8"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve ({selectedResults.length})
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowBulkRejectDialog(true)}
                      disabled={selectedResults.length === 0}
                      variant="destructive"
                      className="h-8"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject ({selectedResults.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compact Results List */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <CardTitle className="text-sm font-medium text-gray-700">
                {activeTab === "pending" && "Pending Approval"}
                {activeTab === "approved" && "Approved Results"}
                {activeTab === "rejected" && "Rejected Results"}
                {activeTab === "all" && "All Results"}
                <span className="ml-2 text-xs text-gray-500">({filteredResults.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {studentsWithResults.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No results found</p>
                  <p className="text-xs text-gray-400">
                    {activeTab === "pending" && "No results pending approval"}
                    {activeTab === "approved" && "No approved results"}
                    {activeTab === "rejected" && "No rejected results"}
                    {activeTab === "all" && "No results available"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {studentsWithResults.map((studentData) => (
                    <div
                      key={studentData!.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {activeTab === "pending" && (
                            <input
                              type="checkbox"
                              checked={selectedResults.includes(studentData!.result.id)}
                              onChange={() => handleSelectResult(studentData!.result.id)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300"
                            />
                          )}
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
                            {studentData!.firstName[0]}
                            {studentData!.lastName[0]}
                          </div>

                          <div>
                            <p className="text-base font-semibold text-gray-800 leading-tight">
                              {studentData!.firstName} {studentData!.lastName}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                              {studentData!.admissionNumber} • {studentData!.className}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium">Average</p>
                            <p className="text-lg font-bold text-gray-800">
                              {studentData!.result.average_score}%
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium">Position</p>
                            <Badge className="bg-green-50 text-green-700 border-green-200 rounded-lg text-xs font-medium px-2 py-1">
                              {studentData!.result.position}/{studentData!.result.total_students}
                            </Badge>
                          </div>

                          <div>
                            <Badge
                              className={`rounded-lg text-xs font-medium px-2 py-1 ${
                                studentData!.result.status === "Submitted"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : studentData!.result.status === "Approved"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {studentData!.result.status}
                            </Badge>
                          </div>

                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl"
                                  onClick={() => setSelectedResult(studentData!.result.id)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Review Result - {studentData!.firstName} {studentData!.lastName}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Review and approve or reject student results
                                  </DialogDescription>
                                </DialogHeader>

                              <div className="space-y-6">
                                {/* Result Card */}
                                <StudentResultCard
                                  result={studentData!.result}
                                  currentUser={currentUser}
                                  showActions={false}
                                />

                                {/* Action Buttons */}
                                {studentData!.result.status === "Submitted" && (
                                  <div className="border-t pt-4">
                                    <h3 className="text-[#0A2540] font-medium mb-4">Principal's Review</h3>
                                    
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-[#0A2540] mb-2 block">
                                          Principal's Comment *
                                        </Label>
                                        <Textarea
                                          value={principalComment}
                                          onChange={(e) => setPrincipalComment(e.target.value)}
                                          placeholder="Enter your comment for this student..."
                                          className="min-h-24 rounded-xl border-[#0A2540]/20"
                                        />
                                      </div>

                                      <div className="flex gap-3">
                                        <Button
                                          onClick={() => handleApprove(studentData!.result.id)}
                                          className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Approve Result
                                        </Button>

                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              className="flex-1 rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                                            >
                                              <XCircle className="w-4 h-4 mr-2" />
                                              Reject Result
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Reject Result</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <div>
                                                <Label>Reason for Rejection *</Label>
                                                <Textarea
                                                  value={rejectionReason}
                                                  onChange={(e) => setRejectionReason(e.target.value)}
                                                  placeholder="Please provide a detailed reason..."
                                                  className="min-h-24 mt-2"
                                                />
                                              </div>
                                              <Button
                                                onClick={() => handleReject(studentData!.result.id)}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                              >
                                                Confirm Rejection
                                              </Button>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Print/Download Actions */}
                                <div className="flex gap-3 border-t pt-4">
                                  <Button
                                    onClick={handlePrint}
                                    variant="outline"
                                    className="rounded-xl flex-1"
                                  >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print
                                  </Button>
                                  <Button
                                    onClick={handleDownload}
                                    className="bg-[#10B981] hover:bg-[#059669] text-white rounded-xl flex-1"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                  </Button>
                                  {studentData!.result.status !== "Approved" && (
                                    <Button
                                      onClick={() => handleDelete(studentData!.result.id)}
                                      variant="outline"
                                      className="rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                            
                            <ResultSheetViewerButton
                              studentId={studentData!.id}
                              classId={studentData!.result.class_id}
                              term={selectedTerm}
                              academicYear={selectedYear}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bulk Approve Dialog */}
      <Dialog open={showBulkApproveDialog} onOpenChange={setShowBulkApproveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Bulk Approve Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You are about to approve {selectedResults.length} result(s). This action cannot be undone.
            </p>
            <div>
              <Label className="text-sm font-medium">Principal's Comment</Label>
              <Textarea
                value={bulkComment}
                onChange={(e) => setBulkComment(e.target.value)}
                placeholder="Enter comment for all approved results..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleBulkApprove}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve {selectedResults.length} Results
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBulkApproveDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Reject Dialog */}
      <Dialog open={showBulkRejectDialog} onOpenChange={setShowBulkRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Bulk Reject Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You are about to reject {selectedResults.length} result(s). This action cannot be undone.
            </p>
            <div>
              <Label className="text-sm font-medium">Rejection Reason</Label>
              <Textarea
                value={bulkRejectionReason}
                onChange={(e) => setBulkRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleBulkReject}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject {selectedResults.length} Results
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBulkRejectDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Placeholder components for missing pages
function ViewAllResultsPage({ onBack }: { onBack?: () => void }) {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button onClick={onBack || (() => {})} variant="outline" className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Management
        </Button>
        <h2 className="text-2xl font-bold">All Results</h2>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">View all results functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ViewResultSheetsPage({ onBack }: { onBack?: () => void }) {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button onClick={onBack || (() => {})} variant="outline" className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Management
        </Button>
        <h2 className="text-2xl font-bold">Result Sheets</h2>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">View result sheets functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

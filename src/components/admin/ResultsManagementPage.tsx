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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState<number | null>(null);
  const [principalComment, setPrincipalComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const resultSheetRef = useRef<HTMLDivElement>(null);

  // Load data on component mount
  useEffect(() => {
    loadCompiledResultsFromAPI();
  }, []);

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
    <div className="p-6 space-y-6">
      {/* Header with View Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0A2540] mb-2">Results Management</h1>
          <p className="text-gray-600">
            Approve, view, and manage student results
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setViewMode("viewAll")}
            className="rounded-xl border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View All Results
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode("viewSheets")}
            className="rounded-xl border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Result Sheets
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-[#0A2540]/10">
        <CardHeader className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label className="text-[#0A2540] mb-2 block">Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="h-12 rounded-xl border-[#0A2540]/20">
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
              <Label className="text-[#0A2540] mb-2 block">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="h-12 rounded-xl border-[#0A2540]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">First Term</SelectItem>
                  <SelectItem value="Second Term">Second Term</SelectItem>
                  <SelectItem value="Third Term">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#0A2540] mb-2 block">Academic Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-12 rounded-xl border-[#0A2540]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#0A2540] mb-2 block">Search Student</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name or Admission No"
                  className="h-12 pl-10 rounded-xl border-[#0A2540]/20"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-xl p-1">
          <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-900">
            Pending Approval ({compiledResults.filter(r => r.status === "Submitted" && r.term === selectedTerm && r.academic_year === selectedYear).length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg data-[state=active]:bg-green-100 data-[state=active]:text-green-900">
            Approved ({compiledResults.filter(r => r.status === "Approved" && r.term === selectedTerm && r.academic_year === selectedYear).length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg data-[state=active]:bg-red-100 data-[state=active]:text-red-900">
            Rejected ({compiledResults.filter(r => r.status === "Rejected" && r.term === selectedTerm && r.academic_year === selectedYear).length})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
            All ({compiledResults.filter(r => r.term === selectedTerm && r.academic_year === selectedYear).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Bulk Actions */}
          {activeTab === "pending" && filteredResults.length > 0 && (
            <Card className="border-[#0A2540]/10 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedResults.length === filteredResults.length && filteredResults.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      Select All ({filteredResults.length} results)
                    </span>
                    {selectedResults.length > 0 && (
                      <span className="text-sm font-medium text-blue-600">
                        {selectedResults.length} selected
                      </span>
                    )}
                  </div>
                  
                  {selectedResults.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBulkApproveDialog(true)}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Selected ({selectedResults.length})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBulkRejectDialog(true)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Selected ({selectedResults.length})
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results List */}
          <Card className="border-[#0A2540]/10">
            <CardHeader className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-t-xl">
              <CardTitle>
                {activeTab === "pending" && "Pending Approval"}
                {activeTab === "approved" && "Approved Results"}
                {activeTab === "rejected" && "Rejected Results"}
                {activeTab === "all" && "All Results"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {studentsWithResults.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No results found</p>
                  <p className="text-gray-500 text-sm">
                    {activeTab === "pending" && "No results pending approval"}
                    {activeTab === "approved" && "No approved results"}
                    {activeTab === "rejected" && "No rejected results"}
                    {activeTab === "all" && "No results available"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentsWithResults.map((studentData) => (
                    <div
                      key={studentData!.id}
                      className="p-4 border border-[#0A2540]/10 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {activeTab === "pending" && (
                            <input
                              type="checkbox"
                              checked={selectedResults.includes(studentData!.result.id)}
                              onChange={() => handleSelectResult(studentData!.result.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                          )}
                          <div className="w-12 h-12 rounded-full bg-[#3B82F6] text-white flex items-center justify-center font-bold">
                            {studentData!.firstName[0]}
                            {studentData!.lastName[0]}
                          </div>

                          <div>
                            <p className="text-[#0A2540] font-medium">
                              {studentData!.firstName} {studentData!.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {studentData!.admissionNumber} • {studentData!.className}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Average</p>
                            <p className="text-[#0A2540] font-bold text-lg">
                              {studentData!.result.average_score}%
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-600">Position</p>
                            <Badge className="bg-green-100 text-green-800 border-green-300 rounded-xl">
                              {studentData!.result.position}/{studentData!.result.total_students}
                            </Badge>
                          </div>

                          <div>
                            <Badge
                              className={`rounded-xl ${
                                studentData!.result.status === "Submitted"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                  : studentData!.result.status === "Approved"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-red-100 text-red-800 border-red-300"
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
                                  <DialogTitle description="Review and approve or reject student results">
                                    Review Result - {studentData!.firstName} {studentData!.lastName}
                                  </DialogTitle>
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

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AlertCircle, CheckCircle, XCircle, Eye, Filter } from "lucide-react";
import { useSchool } from "../../contexts/SchoolContext";
import { useNotificationService } from "../../contexts/NotificationService";
import { toast } from "sonner";

interface ScoreWithDetails {
  id: number;
  student_id: number;
  student_name: string;
  subject_assignment_id: number;
  subject_name: string;
  class_id: number;
  class_name: string;
  teacher_name: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade?: string;
  remark?: string;
  entered_by: number;
  entered_date: string;
  status: 'Draft' | 'Submitted' | 'Rejected';
  rejection_reason?: string;
  rejected_by?: number;
  rejected_date?: string;
  academic_year?: string;
  term?: string;
}

export function ScoreApprovalPage() {
  const { 
    currentUser, 
    teachers, 
    classes, 
    subjects, 
    subjectAssignments,
    students,
    scores,
    getPendingScores,
    rejectScore,
    approveScore,
    getTeacherClasses,
    currentAcademicYear,
    currentTerm,
    addNotification
  } = useSchool();

  const { broadcast } = useNotificationService();

  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("submitted");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedScore, setSelectedScore] = useState<ScoreWithDetails | null>(null);

  // Get current teacher data
  const currentTeacher = currentUser ? teachers.find(t => t.id === currentUser.linked_id) : null;
  const teacherClasses = currentTeacher ? getTeacherClasses(currentTeacher.id) : [];

  // Enhanced scores with details
  const scoresWithDetails: ScoreWithDetails[] = scores.map(score => {
    const assignment = subjectAssignments.find(sa => sa.id === score.subject_assignment_id);
    const student = students.find(s => s.id === score.student_id);
    const subject = assignment ? subjects.find(sub => sub.id === assignment.subject_id) : null;
    const classInfo = assignment ? classes.find(c => c.id === assignment.class_id) : null;
    const teacher = assignment ? teachers.find(t => t.id === assignment.teacher_id) : null;

    return {
      ...score,
      student_name: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
      subject_name: subject ? subject.name : 'Unknown Subject',
      class_name: classInfo ? classInfo.name : 'Unknown Class',
      teacher_name: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher',
      class_id: assignment?.class_id || 0,
      academic_year: score.academic_year || currentAcademicYear,
      term: score.term || currentTerm
    };
  });

  // Filter scores based on teacher's classes and selected filters
  const filteredScores = scoresWithDetails.filter(score => {
    // Only show scores from classes where current teacher is class teacher
    const isClassTeacher = teacherClasses.some(tc => tc.classId === score.class_id);
    
    if (!isClassTeacher) return false;

    // Apply filters
    if (selectedClass !== "all" && score.class_id !== parseInt(selectedClass)) return false;
    if (selectedSubject !== "all" && score.subject_assignment_id !== parseInt(selectedSubject)) return false;
    if (selectedStatus === "submitted" && score.status !== "Submitted") return false;
    if (selectedStatus === "rejected" && score.status !== "Rejected") return false;
    if (selectedStatus === "all" && !["Submitted", "Rejected"].includes(score.status)) return false;

    return true;
  });

  // Get unique subjects for filter
  const uniqueSubjects = Array.from(new Set(
    filteredScores.map(score => ({
      id: score.subject_assignment_id,
      name: score.subject_name
    }))
  ));

  const handleRejectScore = async () => {
    if (!selectedScore || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await rejectScore(selectedScore.id, rejectionReason, currentUser!.id);

      // Send notification to subject teacher
      const subjectAssignment = subjectAssignments.find(sa => sa.id === selectedScore.subject_assignment_id);
      if (subjectAssignment) {
        const subjectTeacher = teachers.find(t => t.id === subjectAssignment.teacher_id);
        if (subjectTeacher) {
          await addNotification({
            title: "Score Rejected - Correction Required",
            message: `Your score for ${selectedScore.student_name} in ${selectedScore.subject_name} (${selectedScore.class_name}) was rejected. Reason: ${rejectionReason}. Please review and resubmit.`,
            type: "warning",
            targetAudience: "teachers",
            sentBy: currentUser!.id,
            sentDate: new Date().toISOString(),
            isRead: false,
            readBy: []
          });

          // Real-time notification
          broadcast({
            id: Date.now(),
            title: "Score Rejected - Correction Required",
            message: `Score for ${selectedScore.student_name} in ${selectedScore.subject_name} was rejected. Please review and resubmit.`,
            type: "warning",
            targetAudience: "teachers",
            sentDate: new Date().toISOString(),
          });
        }
      }

      toast.success(`Score rejected and ${selectedScore.teacher_name} notified`);
      setRejectionReason("");
      setShowRejectDialog(false);
      setSelectedScore(null);
    } catch (error) {
      toast.error("Failed to reject score");
    }
  };

  const handleApproveScore = async (score: ScoreWithDetails) => {
    try {
      await approveScore(score.id, currentUser!.id);
      
      // Send notification to subject teacher
      const subjectAssignment = subjectAssignments.find(sa => sa.id === score.subject_assignment_id);
      if (subjectAssignment) {
        const subjectTeacher = teachers.find(t => t.id === subjectAssignment.teacher_id);
        if (subjectTeacher) {
          await addNotification({
            title: "Score Approved",
            message: `Your score for ${score.student_name} in ${score.subject_name} (${score.class_name}) has been approved.`,
            type: "success",
            targetAudience: "teachers",
            sentBy: currentUser!.id,
            sentDate: new Date().toISOString(),
            isRead: false,
            readBy: []
          });

          // Real-time notification
          broadcast({
            id: Date.now(),
            title: "Score Approved",
            message: `Score for ${score.student_name} in ${score.subject_name} has been approved.`,
            type: "success",
            targetAudience: "teachers",
            sentDate: new Date().toISOString(),
          });
        }
      }
      
      toast.success("Score approved successfully");
    } catch (error) {
      toast.error("Failed to approve score");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Submitted":
        return <Badge className="bg-blue-100 text-blue-800">Pending Review</Badge>;
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
    }
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return "text-gray-600";
    switch (grade) {
      case "A": return "text-green-600 font-bold";
      case "B": return "text-blue-600 font-bold";
      case "C": return "text-yellow-600 font-bold";
      case "D": return "text-orange-600 font-bold";
      case "F": return "text-red-600 font-bold";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Score Approval</h1>
          <p className="text-gray-600">Review and approve/reject scores submitted by subject teachers</p>
        </div>
        <div className="text-sm text-gray-500">
          {currentTeacher && `Class Teacher: ${currentTeacher.firstName} ${currentTeacher.lastName}`}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {teacherClasses.map(cls => (
                    <SelectItem key={cls.classId} value={cls.classId.toString()}>
                      {cls.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Pending Review</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {filteredScores.length} scores found
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scores List */}
      <div className="space-y-4">
        {filteredScores.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Scores Found</h3>
              <p className="text-gray-600">No scores match the current filters or no scores have been submitted for review.</p>
            </CardContent>
          </Card>
        ) : (
          filteredScores.map(score => (
            <Card key={score.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{score.student_name}</h3>
                        <p className="text-sm text-gray-600">{score.class_name}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{score.subject_name}</p>
                        <p className="text-xs text-gray-500">by {score.teacher_name}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{score.total}</p>
                        <p className={`text-sm ${getGradeColor(score.grade)}`}>{score.grade || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(score.status)}
                        <p className="text-xs text-gray-500 mt-1">
                          {score.entered_date && new Date(score.entered_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600">CA 1</p>
                        <p className="font-semibold">{score.ca1}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600">CA 2</p>
                        <p className="font-semibold">{score.ca2}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600">Exam</p>
                        <p className="font-semibold">{score.exam}</p>
                      </div>
                    </div>

                    {/* Rejection Details */}
                    {score.status === "Rejected" && score.rejection_reason && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                        </div>
                        <p className="text-sm text-red-700">{score.rejection_reason}</p>
                        {score.rejected_date && (
                          <p className="text-xs text-red-600 mt-1">
                            Rejected on {new Date(score.rejected_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Remark */}
                    {score.remark && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                        <p className="text-sm font-medium text-blue-800 mb-1">Teacher's Remark:</p>
                        <p className="text-sm text-blue-700">{score.remark}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {score.status === "Submitted" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveScore(score)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedScore(score);
                            setShowRejectDialog(true);
                          }}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Reject Score</DialogTitle>
          </DialogHeader>
          {selectedScore && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium">{selectedScore.student_name}</p>
                <p className="text-sm text-gray-600">{selectedScore.subject_name} - {selectedScore.class_name}</p>
                <p className="text-sm font-bold">Score: {selectedScore.total}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Rejection Reason</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this score is being rejected..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleRejectScore}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Score
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectionReason("");
                    setSelectedScore(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { LayoutDashboard, Edit, FileText, Bell, BookOpen, Users, FileSpreadsheet, Lock, LogOut, Calendar, Clock, MessageSquare, CheckCircle } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScoreEntryPage } from "./teacher/ScoreEntryPage";
import { CompileResultsPage } from "./teacher/CompileResultsPage";
import { ClassListPage } from "./teacher/ClassListPage";
import { MarkAttendancePage } from "./teacher/MarkAttendancePage";
import { MessageParentsPage } from "./teacher/MessageParentsPage";
import { ScoreApprovalPage } from "./teacher/ScoreApprovalPage";
import { ViewExamTimetablePage } from "./shared/ViewExamTimetablePage";
import { ChangePasswordPage } from "./ChangePasswordPage";
import { NotificationsPage } from "./NotificationsPage";
import { useSchool } from "../contexts/SchoolContext";
import { useNotificationListener } from "../contexts/NotificationService";

interface TeacherDashboardProps {
  onLogout: () => void;
}

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const { currentUser, teachers, getTeacherAssignments, getTeacherClasses, getTeacherResponsibilities, getUnreadNotifications, getActivityLogs } = useSchool();
  const [activeItem, setActiveItem] = useState("dashboard");
  
  // Real-time notification listener for teachers
  useNotificationListener(currentUser?.role, currentUser?.id);

  // Get current teacher data
  const currentTeacher = currentUser ? teachers.find(t => t.id === currentUser.linked_id) : null;
  const teacherId = currentTeacher?.id;
  const responsibilities = teacherId ? getTeacherResponsibilities(teacherId) : {
    isClassTeacher: false,
    assignedClassesCount: 0,
    totalStudentsCount: 0,
    subjectsCount: 0,
    classTeacherClassesCount: 0,
    canEnterScores: false,
    canCompileResults: false,
    canViewResults: false,
    canManageAttendance: false,
    departments: []
  };
  
  const teacherClasses = teacherId ? getTeacherClasses(teacherId) : [];
  const isClassTeacher = responsibilities.isClassTeacher;
  const teacherName = currentTeacher ? `${currentTeacher.firstName} ${currentTeacher.lastName}` : 'Teacher';
  
  // Get unread notifications count
  const unreadNotifications = getUnreadNotifications();

  const sidebarItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", id: "dashboard" },
    { icon: <Users className="w-5 h-5" />, label: "Class List", id: "class-list" },
    { icon: <Edit className="w-5 h-5" />, label: "Enter Scores", id: "enter-scores" },
    { icon: <FileSpreadsheet className="w-5 h-5" />, label: "Compile Results", id: "compile-results", classTeacherOnly: true },
    { icon: <CheckCircle className="w-5 h-5" />, label: "Approve Scores", id: "approve-scores", classTeacherOnly: true },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Message Parents", id: "message-parents" },
    { icon: <Bell className="w-5 h-5" />, label: "Notifications", id: "notifications" },
    { icon: <Lock className="w-5 h-5" />, label: "Change Password", id: "change-password" },
    { icon: <Calendar className="w-5 h-5" />, label: "Exam Timetable", id: "exam-timetable" },
    { icon: <Clock className="w-5 h-5" />, label: "Mark Attendance", id: "mark-attendance" },
    { icon: <LogOut className="w-5 h-5" />, label: "Logout", id: "logout" },
  ].filter(item => !item.classTeacherOnly || isClassTeacher);

  const handleItemClick = (id: string) => {
    if (id === "logout") {
      onLogout();
    } else {
      setActiveItem(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <DashboardSidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
      />

      <div className="lg:pl-64">
        <DashboardTopBar
          userName={teacherName}
          userRole={isClassTeacher ? "Class Teacher" : "Subject Teacher"}
          notificationCount={unreadNotifications.length}
          onLogout={onLogout}
        />

        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {activeItem === "dashboard" && (
            <div className="space-y-6">
              <div className="mb-6">
                <h1 className="text-[#1F2937] mb-2">Teacher Dashboard</h1>
                <p className="text-[#6B7280]">
                  {isClassTeacher 
                    ? 'Welcome, Class Teacher. Manage your class and student assessments.'
                    : 'Welcome, Subject Teacher. Enter scores for your assigned subjects.'
                  }
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="rounded-lg bg-white border border-[#E5E7EB] shadow-clinical">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[#6B7280] text-sm">Classes Assigned</p>
                      <BookOpen className="w-5 h-5 text-[#3B82F6]" />
                    </div>
                    <p className="text-[#1F2937] mb-1 font-semibold">{responsibilities.assignedClassesCount}</p>
                    <p className="text-xs text-[#6B7280]">Total classes</p>
                  </CardContent>
                </Card>

                <Card className="rounded-lg bg-white border border-[#E5E7EB] shadow-clinical">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[#6B7280] text-sm">Total Students</p>
                      <Users className="w-5 h-5 text-[#3B82F6]" />
                    </div>
                    <p className="text-[#1F2937] mb-1 font-semibold">{responsibilities.totalStudentsCount}</p>
                    <p className="text-xs text-[#6B7280]">Across all classes</p>
                  </CardContent>
                </Card>

                <Card className="rounded-lg bg-white border border-[#E5E7EB] shadow-clinical">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[#6B7280] text-sm">Class Teacher Role</p>
                      <Users className="w-5 h-5 text-[#10B981]" />
                    </div>
                    <p className="text-[#1F2937] mb-1 font-semibold">{responsibilities.classTeacherClassesCount}</p>
                    <p className="text-xs text-[#6B7280]">Classes managed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Stats Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[#6B7280] text-sm">Subject Assignments</p>
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-[#1F2937] mb-1 font-semibold">{responsibilities.subjectsCount}</p>
                    <p className="text-xs text-[#6B7280]">Subjects teaching</p>
                  </CardContent>
                </Card>

                <Card className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[#6B7280] text-sm">Class Teacher Status</p>
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-[#1F2937] mb-1 font-semibold">{responsibilities.isClassTeacher ? 'Active' : 'Not Assigned'}</p>
                    <p className="text-xs text-[#6B7280]">
                      {responsibilities.isClassTeacher ? 'Managing classes' : 'No class teacher role'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-lg bg-white border border-[#E5E7EB] shadow-clinical">
                <CardHeader className="p-5 border-b border-[#E5E7EB]">
                  <h3 className="text-[#1F2937]">Your Classes & Subjects</h3>
                </CardHeader>
                <CardContent className="space-y-3 p-5 pt-5">
                  {teacherClasses.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
                      <p className="text-[#6B7280]">No class assignments yet</p>
                    </div>
                  ) : (
                    teacherClasses.map((classInfo) => (
                      <div key={classInfo.classId} className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-[#1F2937] font-medium">{classInfo.className}</p>
                            <p className="text-[#6B7280] text-sm">{classInfo.classLevel} • {classInfo.studentCount} students</p>
                          </div>
                          <Badge className="bg-[#3B82F6] text-white border-0 text-xs">
                            {classInfo.subjects.length} subjects
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-[#6B7280] mb-2">Assigned Subjects:</p>
                          <div className="flex flex-wrap gap-1">
                            {classInfo.subjects.map((subject) => (
                              <Badge key={subject.subjectId} className="bg-gray-100 text-gray-800 border-0 text-xs">
                                {subject.subjectName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            onClick={() => setActiveItem("class-list")}
                            variant="outline"
                            size="sm"
                            className="rounded-lg border-[#E5E7EB] text-[#6B7280]"
                          >
                            <Users className="w-4 h-4 mr-1" />
                            View Students
                          </Button>
                          {classInfo.subjects.length > 0 && (
                            <Button 
                              onClick={() => setActiveItem("enter-scores")}
                              size="sm"
                              className="bg-[#3B82F6] text-white hover:bg-[#2563EB] rounded-lg"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Enter Scores
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeItem === "class-list" && <ClassListPage />}
          {activeItem === "enter-scores" && <ScoreEntryPage />}
          {activeItem === "compile-results" && <CompileResultsPage />}
          {activeItem === "approve-scores" && <ScoreApprovalPage />}
          {activeItem === "message-parents" && <MessageParentsPage />}
          {activeItem === "notifications" && <NotificationsPage />}
          {activeItem === "change-password" && <ChangePasswordPage />}
          {activeItem === "mark-attendance" && <MarkAttendancePage />}
          {activeItem === "exam-timetable" && <ViewExamTimetablePage userRole="teacher" />}
          
          {!["dashboard", "class-list", "enter-scores", "compile-results", "approve-scores", "message-parents", "notifications", "change-password", "mark-attendance", "exam-timetable"].includes(activeItem) && (
            <div className="space-y-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <Card className="rounded-lg bg-white border border-[#E5E7EB] shadow-clinical max-w-md w-full">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center mx-auto mb-4 text-white">
                      {sidebarItems.find(item => item.id === activeItem)?.icon}
                    </div>
                    <h3 className="text-[#1F2937] mb-3">
                      {sidebarItems.find(item => item.id === activeItem)?.label}
                    </h3>
                    <p className="text-[#6B7280]">
                      This section contains the functionality for {sidebarItems.find(item => item.id === activeItem)?.label.toLowerCase()}.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
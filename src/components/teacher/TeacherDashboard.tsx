import { useState } from "react";
import { 
  Users, FileText, ClipboardCheck, Calendar, BookOpen, TrendingUp, 
  Award, AlertCircle, PenTool, BarChart3, MessageSquare
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { useSchool } from "../../contexts/SchoolContext";

interface TeacherDashboardProps {
  onNavigate: (page: string) => void;
}

export function TeacherDashboard({ onNavigate }: TeacherDashboardProps) {
  const { students, classes, subjectAssignments, currentUser, getTeacherAssignments, getTeacherClasses } = useSchool();

  // Get teacher's actual ID from linkedId (links to teachers table)
  const teacherId = currentUser?.linked_id || 0;
  
  // Use the proper functions to get teacher's assigned classes and subjects
  const teacherAssignments = getTeacherAssignments(teacherId);
  const teacherClassesData = getTeacherClasses(teacherId);
  const teacherClasses = teacherClassesData.map(tc => tc.classId);
  const teacherSubjects = Array.from(new Set(teacherAssignments.map(ta => ta.subject_id)));
  
  // Get classes where teacher is the class teacher
  const classTeacherClasses = classes.filter(c => c.classTeacherId === teacherId);
  
  // Get students in teacher's class teacher classes only
  const myStudents = students.filter(s => classTeacherClasses.some(c => c.id === s.class_id));

  // Debug logging to track data flow
  console.log('Teacher Dashboard Debug:', {
    currentUser,
    teacherId,
    subjectAssignmentsCount: subjectAssignments?.length || 0,
    teacherAssignmentsCount: teacherAssignments?.length || 0,
    teacherClassesDataCount: teacherClassesData?.length || 0,
    classTeacherClassesCount: classTeacherClasses?.length || 0,
    myStudentsCount: myStudents?.length || 0
  });

  const actionCards = [
    {
      title: "View Students",
      description: "View students in your classes",
      icon: Users,
      color: "from-[#3B82F6] to-[#2563EB]",
      bgColor: "bg-gradient-to-br from-[#3B82F6] to-[#2563EB]",
      iconBg: "bg-white/20",
      page: "class-list",
      count: myStudents.length,
      label: "Students"
    },
    {
      title: "Assessment Score",
      description: "View and manage assessment scores",
      icon: BarChart3,
      color: "from-[#EF4444] to-[#DC2626]",
      bgColor: "bg-gradient-to-br from-[#EF4444] to-[#DC2626]",
      iconBg: "bg-white/20",
      page: "score-entry",
      count: teacherSubjects.length,
      label: "Subjects"
    },
    {
      title: "Enter Assessment Score",
      description: "Enter scores for continuous assessment and exams",
      icon: PenTool,
      color: "from-[#06B6D4] to-[#0891B2]",
      bgColor: "bg-gradient-to-br from-[#06B6D4] to-[#0891B2]",
      iconBg: "bg-white/20",
      page: "score-entry",
      count: teacherAssignments.length,
      label: "Assignments"
    },
    {
      title: "Class Attendance",
      description: "Mark and manage student attendance",
      icon: Calendar,
      color: "from-[#8B5CF6] to-[#7C3AED]",
      bgColor: "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]",
      iconBg: "bg-white/20",
      page: "attendance",
      count: teacherClasses.length,
      label: "Classes"
    },
    {
      title: "Psychomotor/Affective",
      description: "Assess behavioral and skills development",
      icon: Award,
      color: "from-[#10B981] to-[#059669]",
      bgColor: "bg-gradient-to-br from-[#10B981] to-[#059669]",
      iconBg: "bg-white/20",
      page: "psychomotor",
      count: myStudents.length,
      label: "Students"
    },
    {
      title: "Exam Timetable",
      description: "View examination schedules",
      icon: Calendar,
      color: "from-[#0EA5E9] to-[#0284C7]",
      bgColor: "bg-gradient-to-br from-[#0EA5E9] to-[#0284C7]",
      iconBg: "bg-white/20",
      page: "exam-timetable",
      count: classTeacherClasses.length,
      label: "Classes"
    },
    {
      title: "Result Management",
      description: "Compile and publish student results",
      icon: FileText,
      color: "from-[#F59E0B] to-[#D97706]",
      bgColor: "bg-gradient-to-br from-[#F59E0B] to-[#D97706]",
      iconBg: "bg-white/20",
      page: "results",
      count: 0,
      label: "Pending"
    },
    {
      title: "Student Promotion",
      description: "Recommend students for promotion",
      icon: TrendingUp,
      color: "from-[#EC4899] to-[#DB2777]",
      bgColor: "bg-gradient-to-br from-[#EC4899] to-[#DB2777]",
      iconBg: "bg-white/20",
      page: "promotion",
      count: 0,
      label: "Eligible"
    },
    {
      title: "Class Teacher Duties",
      description: "Manage your assigned class as class teacher",
      icon: ClipboardCheck,
      color: "from-[#F97316] to-[#EA580C]",
      bgColor: "bg-gradient-to-br from-[#F97316] to-[#EA580C]",
      iconBg: "bg-white/20",
      page: "class-teacher",
      count: classTeacherClasses.length,
      label: "Classes"
    },
    {
      title: "Cumulative Result",
      description: "View comprehensive student performance",
      icon: BookOpen,
      color: "from-[#6366F1] to-[#4F46E5]",
      bgColor: "bg-gradient-to-br from-[#6366F1] to-[#4F46E5]",
      iconBg: "bg-white/20",
      page: "cumulative",
      count: myStudents.length,
      label: "Records"
    },
    {
      title: "Message Parents",
      description: "Send messages and updates to parents/guardians",
      icon: MessageSquare,
      color: "from-[#14B8A6] to-[#0D9488]",
      bgColor: "bg-gradient-to-br from-[#14B8A6] to-[#0D9488]",
      iconBg: "bg-white/20",
      page: "message-parents",
      count: myStudents.length,
      label: "Students"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#0A2540] mb-2">Home</h1>
        <p className="text-gray-600">Welcome back, Teacher!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#0A2540]/10 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">My Students</p>
                <p className="text-[#0A2540]">{myStudents.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">My Classes</p>
                <p className="text-[#0A2540]">{teacherClasses.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Subjects</p>
                <p className="text-[#0A2540]">{teacherSubjects.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Assignments</p>
                <p className="text-[#0A2540]">{teacherAssignments.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <ClipboardCheck className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teacher's Assigned Classes and Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Classes */}
        <Card className="border-[#0A2540]/10 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-[#0A2540]">My Assigned Classes</h3>
            </div>
            
            {teacherClassesData.length > 0 ? (
              <div className="space-y-3">
                {teacherClassesData.map((classInfo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <div>
                      <p className="font-medium text-[#1F2937]">{classInfo.className}</p>
                      <p className="text-sm text-[#6B7280]">{classInfo.classLevel} • {classInfo.studentCount} students</p>
                    </div>
                    <div className="bg-purple-100 px-3 py-1 rounded-full">
                      <span className="text-purple-700 text-sm font-medium">{classInfo.subjects.length} subjects</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No classes assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Teacher Responsibilities */}
        <Card className="border-[#0A2540]/10 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <ClipboardCheck className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-[#0A2540]">Class Teacher Responsibilities</h3>
            </div>
            
            {classTeacherClasses.length > 0 ? (
              <div className="space-y-3">
                {classTeacherClasses.map((cls, index) => (
                  <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-[#1F2937]">{cls.name}</p>
                      <div className="bg-orange-100 px-3 py-1 rounded-full">
                        <span className="text-orange-700 text-sm font-medium">Class Teacher</span>
                      </div>
                    </div>
                    <p className="text-sm text-[#6B7280] mb-2">{cls.level} • {cls.category}</p>
                    <div className="space-y-1">
                      <p className="text-xs text-[#4B5563]">• Manage student results and compilation</p>
                      <p className="text-xs text-[#4B5563]">• Track attendance and behavior</p>
                      <p className="text-xs text-[#4B5563]">• Generate final report cards</p>
                      <p className="text-xs text-[#4B5563]">• Submit results to admin for approval</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No class teacher assignments</p>
                <p className="text-xs text-gray-400 mt-1">Contact administrator to be assigned as class teacher</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assigned Subjects */}
      <Card className="border-[#0A2540]/10 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-[#0A2540]">My Subjects</h3>
          </div>
          
          {teacherAssignments.length > 0 ? (
            <div className="space-y-3">
              {teacherAssignments.map((assignment, index) => {
                const className = classes.find(c => c.id === assignment.class_id)?.name || 'Unknown Class';
                const subjectName = assignment.subject_name || 'Unknown Subject';
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div>
                      <p className="font-medium text-[#1F2937]">{subjectName}</p>
                      <p className="text-sm text-[#6B7280]">{className}</p>
                    </div>
                    <div className="bg-green-100 px-3 py-1 rounded-full">
                      <span className="text-green-700 text-sm font-medium">{assignment.term}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No subjects assigned yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actionCards.map((card, index) => (
          <Card
            key={index}
            className={`${card.bgColor} border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 rounded-2xl overflow-hidden`}
            onClick={() => onNavigate(card.page)}
          >
            <CardContent className="p-8 relative">
              {/* Background pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <card.icon className="w-full h-full" />
              </div>

              {/* Content */}
              <div className="relative z-10 space-y-4">
                <div className={`${card.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center`}>
                  <card.icon className="w-8 h-8 text-white" />
                </div>

                <div>
                  <h3 className="text-white mb-2">{card.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{card.description}</p>
                </div>

                {card.count !== undefined && (
                  <div className="flex items-center gap-2 pt-2 border-t border-white/20">
                    <div className="bg-white/20 px-3 py-1 rounded-full">
                      <span className="text-white">{card.count}</span>
                    </div>
                    <span className="text-white/80 text-sm">{card.label}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity / Notifications */}
      <Card className="border-[#0A2540]/10 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-[#0A2540]">Important Reminders</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-[#1F2937]">Third Term Assessment - 2023/2024</p>
                <p className="text-sm text-[#6B7280]">Enter continuous assessment scores and exam marks for all your classes</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-[#1F2937]">Attendance Records</p>
                <p className="text-sm text-[#6B7280]">Keep daily attendance records up to date for accurate reporting</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-[#1F2937]">Psychomotor Assessment</p>
                <p className="text-sm text-[#6B7280]">Complete behavioral and skills assessment for all students</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

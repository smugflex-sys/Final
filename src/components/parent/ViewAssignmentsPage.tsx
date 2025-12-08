import { useState } from "react";
import { BookOpen, Calendar, FileText, Download, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useSchool } from "../../contexts/SchoolContext";

export function ViewAssignmentsPage() {
  const { currentUser, students, parents } = useSchool();
  
  // Get children of current parent
  const parent = parents.find(p => p.id === currentUser?.linkedId);
  const children = parent ? students.filter(s => parent.studentIds.includes(s.id)) : [];
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || 0);

  // Mock assignments data
  const assignments = [
    {
      id: 1,
      subject: "Mathematics",
      title: "Solve Quadratic Equations",
      description: "Complete exercises 1-20 from textbook page 45",
      dueDate: "2024-12-10",
      status: "Pending",
      submittedDate: null,
      grade: null,
      teacher: "Mr. John Doe"
    },
    {
      id: 2,
      subject: "English Language",
      title: "Essay Writing - My Holiday",
      description: "Write a 500-word essay about your holiday experience",
      dueDate: "2024-12-08",
      status: "Submitted",
      submittedDate: "2024-12-07",
      grade: "A",
      teacher: "Mrs. Sarah Johnson"
    },
    {
      id: 3,
      subject: "Physics",
      title: "Lab Report - Pendulum Experiment",
      description: "Submit detailed lab report with observations and conclusions",
      dueDate: "2024-12-05",
      status: "Graded",
      submittedDate: "2024-12-04",
      grade: "B+",
      teacher: "Dr. Ahmed Hassan"
    },
  ];

  const pendingAssignments = assignments.filter(a => a.status === "Pending");
  const submittedAssignments = assignments.filter(a => a.status === "Submitted");
  const gradedAssignments = assignments.filter(a => a.status === "Graded");

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-[#1F2937] mb-2">Assignments & Homework</h1>
        <p className="text-[#6B7280]">View your child's assignments and submission status</p>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
          <CardContent className="p-4">
            <div className="flex gap-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedChildId === child.id
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                >
                  {child.firstName} {child.lastName}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Total Assignments</p>
                <p className="text-2xl font-semibold text-[#1F2937] mt-1">{assignments.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-[#3B82F6]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Pending</p>
                <p className="text-2xl font-semibold text-[#F59E0B] mt-1">{pendingAssignments.length}</p>
              </div>
              <Clock className="w-8 h-8 text-[#F59E0B]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Submitted</p>
                <p className="text-2xl font-semibold text-[#3B82F6] mt-1">{submittedAssignments.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-[#3B82F6]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Graded</p>
                <p className="text-2xl font-semibold text-[#10B981] mt-1">{gradedAssignments.length}</p>
              </div>
              <FileText className="w-8 h-8 text-[#10B981]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Tabs */}
      <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
        <Tabs defaultValue="all" className="w-full">
          <CardHeader className="border-b border-[#E5E7EB] p-0">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger value="all" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#3B82F6]">
                All Assignments
              </TabsTrigger>
              <TabsTrigger value="pending" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#3B82F6]">
                Pending ({pendingAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="submitted" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#3B82F6]">
                Submitted ({submittedAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="graded" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#3B82F6]">
                Graded ({gradedAssignments.length})
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-6">
            <TabsContent value="all" className="mt-0 space-y-4">
              {assignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </TabsContent>

            <TabsContent value="pending" className="mt-0 space-y-4">
              {pendingAssignments.length === 0 ? (
                <p className="text-center py-8 text-[#6B7280]">No pending assignments</p>
              ) : (
                pendingAssignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))
              )}
            </TabsContent>

            <TabsContent value="submitted" className="mt-0 space-y-4">
              {submittedAssignments.length === 0 ? (
                <p className="text-center py-8 text-[#6B7280]">No submitted assignments</p>
              ) : (
                submittedAssignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))
              )}
            </TabsContent>

            <TabsContent value="graded" className="mt-0 space-y-4">
              {gradedAssignments.length === 0 ? (
                <p className="text-center py-8 text-[#6B7280]">No graded assignments yet</p>
              ) : (
                gradedAssignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

function AssignmentCard({ assignment }: { assignment: any }) {
  return (
    <Card className="rounded-lg border border-[#E5E7EB] hover:border-[#3B82F6] transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[#3B82F6] border-[#3B82F6]">
                {assignment.subject}
              </Badge>
              <Badge
                className={
                  assignment.status === 'Pending' ? 'bg-[#F59E0B]' :
                  assignment.status === 'Submitted' ? 'bg-[#3B82F6]' :
                  'bg-[#10B981]'
                }
              >
                {assignment.status}
              </Badge>
              {assignment.grade && (
                <Badge className="bg-[#10B981]">Grade: {assignment.grade}</Badge>
              )}
            </div>
            <h3 className="font-semibold text-[#1F2937] mb-1">{assignment.title}</h3>
            <p className="text-sm text-[#6B7280] mb-3">{assignment.description}</p>
            <div className="flex items-center gap-4 text-sm text-[#6B7280]">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Due: {assignment.dueDate}</span>
              </div>
              {assignment.submittedDate && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span>Submitted: {assignment.submittedDate}</span>
                </div>
              )}
              <div className="text-[#6B7280]">Teacher: {assignment.teacher}</div>
            </div>
          </div>
          {assignment.status === 'Graded' && (
            <Download className="w-5 h-5 text-[#6B7280] cursor-pointer hover:text-[#3B82F6]" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

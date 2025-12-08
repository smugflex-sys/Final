import { useMemo } from "react";
import { User, Phone, Mail, Calendar, GraduationCap, MapPin, Heart, FileText, CreditCard, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useSchool } from "../../contexts/SchoolContext";

interface ChildData {
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
  dateOfBirth: string;
  address: string;
  parentContact: string;
  enrollmentDate: string;
  status: string;
  recentActivities: any[];
  feeBalance: number;
  totalFees: number;
}

interface MyChildrenPageProps {
  onNavigateToResults?: () => void;
  onNavigateToFees?: () => void;
}

export function MyChildrenPage({ onNavigateToResults, onNavigateToFees }: MyChildrenPageProps) {
  const { currentUser, parents, students, classes, compiledResults, payments, currentTerm, currentAcademicYear, getParentChildren } = useSchool();

  // Get current parent
  const currentParent = currentUser ? parents.find(p => p.id === currentUser.linked_id) : null;

  // Get parent's linked children using the enhanced system
  const myChildren = useMemo(() => {
    if (!currentParent) {
      return [];
    }
    
    // Use the real parent-student linking system
    const childrenData = getParentChildren(currentParent.id) as any[];
    
    return childrenData.map(child => {
      // Get latest result for current term
      const latestResult = compiledResults.find(r => 
        r.student_id === child.id &&
        r.term === currentTerm &&
        r.academic_year === currentAcademicYear &&
        r.status === 'Approved'
      );

      // Get payment balance
      const studentPayments = payments.filter(p => p.student_id === child.id);
      const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalFee = 150000; // This should come from fee structure
      const balance = totalFee - totalPaid;

      return {
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        fullName: child.fullName,
        admissionNumber: child.admissionNumber,
        className: child.className,
        level: child.classLevel,
        gender: child.gender,
        dateOfBirth: child.dateOfBirth,
        photoUrl: child.photoUrl,
        status: child.status || 'Active',
        classTeacher: classes.find(c => c.id === child.classId)?.classTeacher || 'Not Assigned',
        hasResult: latestResult !== undefined,
        averageScore: latestResult?.average_score || 0,
        position: latestResult?.position || 0,
        totalStudents: latestResult?.total_students || 0,
        feeBalance: balance,
        totalFee,
        paymentStatus: balance > 0 ? 'Pending' : 'Paid'
      };
    });
  }, [currentParent, getParentChildren, compiledResults, payments, currentTerm, currentAcademicYear, classes]);

  if (!currentParent) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-800">Unable to load parent information</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[#0A2540] mb-2">My Children</h1>
        <p className="text-gray-600">View and manage information for your linked children</p>
      </div>

      {/* Parent Info */}
      <Card className="border-[#0A2540]/10">
        <CardHeader className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Parent/Guardian Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-[#0A2540] font-medium">{currentParent.firstName} {currentParent.lastName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-[#0A2540] font-medium">{currentParent.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-[#0A2540] font-medium">{currentParent.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children Count */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Children</p>
                <p className="text-[#0A2540] text-2xl font-bold">{myChildren.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Students</p>
                <p className="text-[#0A2540] text-2xl font-bold">
                  {myChildren.filter(c => c.status === 'Active').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Current Term</p>
                <p className="text-[#0A2540] font-medium">{currentTerm}</p>
                <p className="text-gray-600 text-sm">{currentAcademicYear}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children List */}
      {myChildren.length === 0 ? (
        <Card className="border-[#0A2540]/10">
          <CardContent className="p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-[#0A2540] text-lg mb-2">No Children Linked</h3>
            <p className="text-gray-600">
              You don't have any children linked to your account yet.
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Please contact the school administration to link your children to your parent portal.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {myChildren.map((child) => (
            <Card key={child.id} className="border-[#0A2540]/10 hover:shadow-lg transition-all">
              <CardHeader className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-4 border-white">
                      {child.photoUrl ? (
                        <img src={child.photoUrl} alt={child.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-white text-[#10B981] text-xl">
                          {child.firstName[0]}{child.lastName[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="text-white mb-1">{child.fullName}</CardTitle>
                      <p className="text-white/90 text-sm">{child.admissionNumber}</p>
                    </div>
                  </div>

                  <Badge 
                    className={`rounded-xl ${
                      child.status === 'Active' 
                        ? 'bg-white text-[#10B981]' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {child.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Class</p>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <p className="text-[#0A2540] font-medium">{child.className}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Level</p>
                    <Badge variant="outline" className="rounded-xl">
                      {child.level}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Gender</p>
                    <p className="text-[#0A2540] font-medium">{child.gender}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <p className="text-[#0A2540] font-medium">
                        {new Date(child.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Class Teacher */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Class Teacher</p>
                  <p className="text-[#0A2540] font-medium">{child.classTeacher}</p>
                </div>

                {/* Academic Performance */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-blue-900">Latest Result ({currentTerm})</p>
                      {child.hasResult && (
                        <Badge className="bg-green-100 text-green-800 border-green-300 rounded-xl">
                          Available
                        </Badge>
                      )}
                    </div>
                    {child.hasResult ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-blue-900">Average Score:</span>
                          <span className="text-blue-900 font-bold">{child.averageScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-900">Position:</span>
                          <span className="text-blue-900 font-bold">
                            {child.position}/{child.totalStudents}
                          </span>
                        </div>
                        <Button
                          onClick={onNavigateToResults}
                          size="sm"
                          className="w-full mt-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Full Result
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-blue-800 text-sm">No result available yet</p>
                        <p className="text-blue-700 text-xs mt-1">Result pending approval</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-green-900">Fee Status</p>
                      <Badge 
                        className={`rounded-xl ${
                          child.paymentStatus === 'Paid' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        }`}
                      >
                        {child.paymentStatus}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-green-900">Total Fee:</span>
                        <span className="text-green-900 font-bold">₦{child.totalFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-900">Balance:</span>
                        <span className={`font-bold ${child.feeBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₦{child.feeBalance.toLocaleString()}
                        </span>
                      </div>
                      {child.feeBalance > 0 && (
                        <Button
                          onClick={onNavigateToFees}
                          size="sm"
                          className="w-full mt-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Fees
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={onNavigateToResults}
                    variant="outline"
                    className="rounded-xl border-[#0A2540]/20"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                  <Button
                    onClick={onNavigateToFees}
                    variant="outline"
                    className="rounded-xl border-[#0A2540]/20"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Fee History
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-[#0A2540]/20"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    View Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

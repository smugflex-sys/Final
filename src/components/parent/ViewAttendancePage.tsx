import { useState } from 'react';
import { useSchool } from '../../contexts/SchoolContext';
import { Card } from '../ui/card';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, TrendingUp, Users } from 'lucide-react';

export function ViewAttendancePage() {
  const {
    currentUser,
    parents,
    students,
    getAttendancesByStudent,
    currentTerm,
    currentAcademicYear,
  } = useSchool();

  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  // Get parent and their children
  const currentParent = parents.find(p => p.id === currentUser?.linkedId);
  const parentChildren = currentParent && currentParent.studentIds 
    ? students.filter(s => currentParent.studentIds.includes(s.id)) 
    : [];

  // Get selected student's attendance
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentAttendances = selectedStudentId
    ? getAttendancesByStudent(selectedStudentId).filter(
        a => a.term === currentTerm && a.academicYear === currentAcademicYear
      )
    : [];

  // Calculate statistics for selected student
  const presentCount = studentAttendances.filter(a => a.status === 'Present').length;
  const absentCount = studentAttendances.filter(a => a.status === 'Absent').length;
  const lateCount = studentAttendances.filter(a => a.status === 'Late').length;
  const excusedCount = studentAttendances.filter(a => a.status === 'Excused').length;
  const totalDays = studentAttendances.length;
  const attendanceRate = totalDays > 0 ? ((presentCount + lateCount) / totalDays * 100).toFixed(1) : 0;

  // Group attendance by month
  const attendanceByMonth = studentAttendances.reduce((acc, attendance) => {
    const month = attendance.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(attendance);
    return acc;
  }, {} as { [month: string]: typeof studentAttendances });

  const getStatusIcon = (status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    switch (status) {
      case 'Present':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'Absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Late':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Excused':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Absent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Late':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Excused':
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">View Attendance</h1>
        <p className="text-slate-600">Monitor your child's attendance records</p>
      </div>

      {/* Child Selection */}
      <Card className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-slate-700">Select Child</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Choose a child...</option>
              {parentChildren.map(child => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName} - {child.className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-slate-700">View Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'summary' | 'detailed')}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="summary">Summary View</option>
              <option value="detailed">Detailed View</option>
            </select>
          </div>
        </div>

        {selectedStudent && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-slate-900">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <p className="text-slate-600 text-sm">
                  {selectedStudent.className} • {selectedStudent.admissionNumber}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Statistics Cards */}
      {selectedStudentId > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-600 text-sm mb-1">Total Days</p>
            <p className="text-2xl text-slate-900">{totalDays}</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-green-700 text-sm">Present</p>
            </div>
            <p className="text-2xl text-green-900">{presentCount}</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-700 text-sm">Absent</p>
            </div>
            <p className="text-2xl text-red-900">{absentCount}</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              <p className="text-yellow-700 text-sm">Late</p>
            </div>
            <p className="text-2xl text-yellow-900">{lateCount}</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <p className="text-blue-700 text-sm">Excused</p>
            </div>
            <p className="text-2xl text-blue-900">{excusedCount}</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <p className="text-purple-700 text-sm">Rate</p>
            </div>
            <p className="text-2xl text-purple-900">{attendanceRate}%</p>
          </Card>
        </div>
      )}

      {/* Attendance Performance Indicator */}
      {selectedStudentId > 0 && totalDays > 0 && (
        <Card className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-800 mb-4">Attendance Performance</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-700">Attendance Rate</span>
                <span className="text-slate-900">{attendanceRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    Number(attendanceRate) >= 90
                      ? 'bg-green-600'
                      : Number(attendanceRate) >= 75
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${attendanceRate}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 rounded-lg border ${
              Number(attendanceRate) >= 90
                ? 'bg-green-50 border-green-200'
                : Number(attendanceRate) >= 75
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }">
              <p className={`${
                Number(attendanceRate) >= 90
                  ? 'text-green-800'
                  : Number(attendanceRate) >= 75
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                {Number(attendanceRate) >= 90
                  ? '✓ Excellent attendance! Keep up the great work.'
                  : Number(attendanceRate) >= 75
                  ? '⚠ Good attendance, but there is room for improvement.'
                  : '⚠ Attendance needs improvement. Please ensure regular school attendance.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Attendance Records */}
      {selectedStudentId > 0 && viewMode === 'detailed' && (
        <Card className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-800 mb-4">Detailed Attendance Records</h3>
          
          {Object.keys(attendanceByMonth).length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No attendance records found for this term</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(attendanceByMonth)
                .sort()
                .reverse()
                .map(month => {
                  const monthName = new Date(month + '-01').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  });
                  const monthRecords = attendanceByMonth[month];

                  return (
                    <div key={month}>
                      <h4 className="text-slate-700 mb-3">{monthName}</h4>
                      <div className="space-y-2">
                        {monthRecords
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .map(record => (
                            <div
                              key={record.id}
                              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                {getStatusIcon(record.status)}
                                <div>
                                  <p className="text-slate-900">
                                    {new Date(record.date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </p>
                                  {record.remarks && (
                                    <p className="text-slate-600 text-sm mt-1">
                                      Remarks: {record.remarks}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`px-4 py-2 rounded-lg border ${getStatusColor(
                                  record.status
                                )}`}
                              >
                                {record.status}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>
      )}

      {/* Summary View */}
      {selectedStudentId > 0 && viewMode === 'summary' && totalDays > 0 && (
        <Card className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-800 mb-4">Attendance Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <div>
              <h4 className="text-slate-700 mb-3">Status Breakdown</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-900">Present</span>
                  </div>
                  <span className="text-green-900">{presentCount} days</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-900">Absent</span>
                  </div>
                  <span className="text-red-900">{absentCount} days</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-900">Late</span>
                  </div>
                  <span className="text-yellow-900">{lateCount} days</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-900">Excused</span>
                  </div>
                  <span className="text-blue-900">{excusedCount} days</span>
                </div>
              </div>
            </div>

            {/* Recent Absences */}
            <div>
              <h4 className="text-slate-700 mb-3">Recent Absences</h4>
              <div className="space-y-2">
                {studentAttendances
                  .filter(a => a.status === 'Absent')
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 5)
                  .map(record => (
                    <div
                      key={record.id}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-red-900 text-sm">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      {record.remarks && (
                        <p className="text-red-700 text-xs mt-1">{record.remarks}</p>
                      )}
                    </div>
                  ))}
                {absentCount === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No absences recorded!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {selectedStudentId === 0 && (
        <Card className="p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 mb-2">No Child Selected</h3>
          <p className="text-slate-600">Please select a child to view their attendance records</p>
        </Card>
      )}

      {selectedStudentId > 0 && totalDays === 0 && (
        <Card className="p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 mb-2">No Attendance Records</h3>
          <p className="text-slate-600">
            No attendance has been recorded for this student in the current term
          </p>
        </Card>
      )}
    </div>
  );
}

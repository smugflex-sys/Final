import { useState } from 'react';
import { useSchool } from '../../contexts/SchoolContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function MarkAttendancePage() {
  const {
    currentUser,
    teachers,
    classes,
    students,
    getStudentsByClass,
    addAttendance,
    getAttendancesByDate,
    getTeacherAssignments,
    currentTerm,
    currentAcademicYear,
  } = useSchool();

  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentAttendance, setStudentAttendance] = useState<{
    [studentId: number]: 'Present' | 'Absent' | 'Late' | 'Excused';
  }>({});
  const [remarks, setRemarks] = useState<{ [studentId: number]: string }>({});

  // Get current teacher's classes based on class teacher assignment only
  const currentTeacher = teachers.find(t => t.id === currentUser?.linked_id);
  const teacherClasses = classes.filter((c: any) => c.classTeacherId === currentTeacher?.id);

  const classStudents = selectedClassId ? getStudentsByClass(selectedClassId) : [];

  // Check if attendance already marked for this date
  const existingAttendance = getAttendancesByDate(attendanceDate);
  const isAlreadyMarked = existingAttendance.some(
    a => a.class_id === selectedClassId && a.date === attendanceDate
  );

  const handleStatusChange = (studentId: number, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setStudentAttendance({ ...studentAttendance, [studentId]: status });
  };

  const handleRemarkChange = (studentId: number, remark: string) => {
    setRemarks({ ...remarks, [studentId]: remark });
  };

  const handleMarkAll = (status: 'Present' | 'Absent') => {
    const newAttendance: { [studentId: number]: 'Present' | 'Absent' | 'Late' | 'Excused' } = {};
    classStudents.forEach(student => {
      newAttendance[student.id] = status;
    });
    setStudentAttendance(newAttendance);
    toast.success(`Marked all students as ${status}`);
  };

  const handleSubmit = () => {
    if (!selectedClassId) {
      toast.error('Please select a class');
      return;
    }

    if (classStudents.length === 0) {
      toast.error('No students in selected class');
      return;
    }

    // Check if all students have attendance marked
    const unmarkedStudents = classStudents.filter(s => !studentAttendance[s.id]);
    if (unmarkedStudents.length > 0) {
      toast.error(`Please mark attendance for all students (${unmarkedStudents.length} remaining)`);
      return;
    }

    // Save attendance for each student
    classStudents.forEach(student => {
      addAttendance({
        student_id: student.id,
        class_id: selectedClassId,
        date: attendanceDate,
        status: studentAttendance[student.id],
        marked_by: currentUser?.linked_id || 0,
        marked_date: new Date().toISOString(),
        term: currentTerm,
        academicYear: currentAcademicYear,
        remarks: remarks[student.id] || '',
      });
    });

    toast.success('Attendance marked successfully!');
    
    // Reset form
    setStudentAttendance({});
    setRemarks({});
  };

  const getStatusColor = (status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    switch (status) {
      case 'Present': return 'text-green-600 bg-green-50';
      case 'Absent': return 'text-red-600 bg-red-50';
      case 'Late': return 'text-yellow-600 bg-yellow-50';
      case 'Excused': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    switch (status) {
      case 'Present': return <CheckCircle2 className="w-4 h-4" />;
      case 'Absent': return <XCircle className="w-4 h-4" />;
      case 'Late': return <Clock className="w-4 h-4" />;
      case 'Excused': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const markedCount = Object.keys(studentAttendance || {}).length;
  const presentCount = Object.values(studentAttendance || {}).filter(s => s === 'Present').length;
  const absentCount = Object.values(studentAttendance || {}).filter(s => s === 'Absent').length;
  const lateCount = Object.values(studentAttendance || {}).filter(s => s === 'Late').length;
  const excusedCount = Object.values(studentAttendance || {}).filter(s => s === 'Excused').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">Mark Attendance</h1>
        <p className="text-slate-600">Record student attendance for your class</p>
      </div>

      {/* Selection Section */}
      <Card className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-slate-700">Select Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(Number(e.target.value));
                setStudentAttendance({});
                setRemarks({});
              }}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Choose a class...</option>
              {teacherClasses.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.currentStudents} Students
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-slate-700">Attendance Date</label>
            <div className="relative">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        {isAlreadyMarked && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-yellow-800">
                Attendance has already been marked for this class on {attendanceDate}. 
                Submitting again will create duplicate records.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      {selectedClassId > 0 && classStudents.length > 0 && (
        <Card className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div>
              <h3 className="text-slate-800 mb-1">Quick Actions</h3>
              <p className="text-slate-600 text-sm">Mark all students at once</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => handleMarkAll('Present')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark All Present
              </Button>
              <Button
                onClick={() => handleMarkAll('Absent')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Mark All Absent
              </Button>
            </div>
          </div>

          {/* Progress Stats */}
          {markedCount > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl text-slate-900">{markedCount}/{classStudents.length}</p>
                <p className="text-slate-600 text-sm">Marked</p>
              </div>
              <div className="text-center">
                <p className="text-2xl text-green-600">{presentCount}</p>
                <p className="text-slate-600 text-sm">Present</p>
              </div>
              <div className="text-center">
                <p className="text-2xl text-red-600">{absentCount}</p>
                <p className="text-slate-600 text-sm">Absent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl text-yellow-600">{lateCount}</p>
                <p className="text-slate-600 text-sm">Late</p>
              </div>
              <div className="text-center">
                <p className="text-2xl text-blue-600">{excusedCount}</p>
                <p className="text-slate-600 text-sm">Excused</p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Student List */}
      {selectedClassId > 0 && classStudents.length > 0 && (
        <Card className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-800 mb-4">Students - {classStudents.length} Total</h3>
          
          <div className="space-y-3">
            {classStudents.map(student => {
              const status = studentAttendance[student.id];
              
              return (
                <div
                  key={student.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Student Info */}
                    <div className="flex-1">
                      <h4 className="text-slate-900">
                        {student.firstName} {student.lastName}
                      </h4>
                      <p className="text-slate-600 text-sm">
                        {student.admissionNumber} • {student.gender}
                      </p>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(student.id, 'Present')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                          status === 'Present'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Present
                      </button>
                      
                      <button
                        onClick={() => handleStatusChange(student.id, 'Absent')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                          status === 'Absent'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        Absent
                      </button>
                      
                      <button
                        onClick={() => handleStatusChange(student.id, 'Late')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                          status === 'Late'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        Late
                      </button>
                      
                      <button
                        onClick={() => handleStatusChange(student.id, 'Excused')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                          status === 'Excused'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        Excused
                      </button>
                    </div>
                  </div>

                  {/* Remarks (only show if status is Absent, Late, or Excused) */}
                  {status && status !== 'Present' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder={`Add remarks for ${status.toLowerCase()} status...`}
                        value={remarks[student.id] || ''}
                        onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              onClick={() => {
                setStudentAttendance({});
                setRemarks({});
              }}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Clear All
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={markedCount !== classStudents.length}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Attendance
            </Button>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {selectedClassId === 0 && (
        <Card className="p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 mb-2">No Class Selected</h3>
          <p className="text-slate-600">Please select a class to begin marking attendance</p>
        </Card>
      )}

      {selectedClassId > 0 && classStudents.length === 0 && (
        <Card className="p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 mb-2">No Students Found</h3>
          <p className="text-slate-600">This class has no students enrolled</p>
        </Card>
      )}
    </div>
  );
}

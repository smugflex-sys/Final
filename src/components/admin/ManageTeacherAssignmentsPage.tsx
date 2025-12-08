import { useState, useEffect } from 'react';
import { useSchool } from '../../contexts/SchoolContext';
import { Plus, Search, Edit, Trash2, BookOpen, Users, X, Check, AlertCircle, Award, Clock, Activity, UserCheck, Calendar, Filter, ChevronDown, ChevronUp, Grid3x3, List, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';

export function ManageTeacherAssignmentsPage() {
  const {
    teachers,
    classes,
    subjects,
    subjectAssignments,
    assignSubjectToTeacherAPI,
    removeSubjectAssignmentAPI,
    currentAcademicYear,
    currentTerm,
    updateClass,
    updateTeacher,
    getTeacherAssignments,
    loadSubjectAssignmentsFromAPI,
    loadTeachersFromAPI,
    loadClassesFromAPI,
    validateClassTeacherAssignment,
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('All');
  const [filterClass, setFilterClass] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isClassTeacherDialogOpen, setIsClassTeacherDialogOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedAssignments, setSelectedAssignments] = useState<{ subject_id: number; class_id: number }[]>([]);
  const [selectedClassForTeacher, setSelectedClassForTeacher] = useState<string>('');
  const [activityLogs, setActivityLogs] = useState<Array<{
    id: string;
    action: string;
    teacherName: string;
    details: string;
    timestamp: Date;
    type: 'assignment' | 'class_teacher' | 'removal';
  }>>([]);

  const [isLoading, setIsLoading] = useState(false);

  // Statistics
  const stats = {
    totalAssignments: subjectAssignments ? subjectAssignments.filter(a => a.status === 'Active').length : 0,
    uniqueTeachers: subjectAssignments ? new Set(subjectAssignments.map(a => a.teacher_id)).size : 0,
    uniqueSubjects: subjectAssignments ? new Set(subjectAssignments.map(a => a.subject_id)).size : 0,
    uniqueClasses: subjectAssignments ? new Set(subjectAssignments.map(a => a.class_id)).size : 0,
    classTeachersWithAssignments: classes ? classes.filter(c => c.classTeacherId).length : 0,
  };

  // Filter assignments
  const filteredAssignments = subjectAssignments ? subjectAssignments.filter(assignment => {
    const matchesSearch = searchQuery === '' || 
      assignment.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.subject_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.class_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTeacher = filterTeacher === 'All' || assignment.teacher_id === parseInt(filterTeacher);
    const matchesClass = filterClass === 'All' || assignment.class_id === parseInt(filterClass);
    
    return matchesSearch && matchesTeacher && matchesClass && assignment.status === 'Active';
  }) : [];

  // Add activity log
  const addActivityLog = (action: string, teacherName: string, details: string, type: 'assignment' | 'class_teacher' | 'removal') => {
    const newLog = {
      id: Date.now().toString(),
      action,
      teacherName,
      details,
      timestamp: new Date(),
      type
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep only last 10 logs
  };

  // Handle assignment dialog
  const handleOpenAssignDialog = () => {
    setSelectedAssignments([]);
    setSelectedTeacherId(null);
    setIsAssignDialogOpen(true);
  };

  const handleAddAssignment = (subject_id: number, class_id: number) => {
    const exists = selectedAssignments.some((a) => a.subject_id === subject_id && a.class_id === class_id);

    if (exists) {
      setSelectedAssignments(selectedAssignments.filter((a) => !(a.subject_id === subject_id && a.class_id === class_id)));
    } else {
      setSelectedAssignments([...selectedAssignments, { subject_id, class_id }]);
    }
  };

  const handleSaveAssignments = async () => {
    if (!selectedTeacherId || selectedAssignments.length === 0) {
      toast.error('Please select a teacher and at least one assignment');
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      let failureCount = 0;

      for (const assignment of selectedAssignments) {
        // Check if assignment already exists
        const exists = subjectAssignments?.some(
          (a) =>
            a.teacher_id === selectedTeacherId &&
            a.subject_id === assignment.subject_id &&
            a.class_id === assignment.class_id &&
            a.term === currentTerm &&
            a.academic_year === currentAcademicYear
        );

        if (!exists) {
          const success = await assignSubjectToTeacherAPI(
            selectedTeacherId,
            assignment.subject_id,
            assignment.class_id,
            currentAcademicYear,
            currentTerm
          );

          if (success) {
            successCount++;
            const teacher = teachers?.find(t => t.id === selectedTeacherId);
            const subject = subjects?.find(s => s.id === assignment.subject_id);
            const cls = classes?.find(c => c.id === assignment.class_id);
            
            addActivityLog(
              'Subject Assigned',
              `${teacher?.firstName} ${teacher?.lastName}`,
              `${subject?.name} assigned to ${cls?.name}`,
              'assignment'
            );
          } else {
            failureCount++;
          }
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} assignments created successfully`);
        setSelectedAssignments([]);
        setSelectedTeacherId(null);
        setIsAssignDialogOpen(false);
      }
      
      if (failureCount > 0) {
        toast.error(`${failureCount} assignments failed - some may already exist`);
      }
    } catch (error) {
      toast.error('An error occurred while saving assignments');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle class teacher dialog
  const handleOpenClassTeacherDialog = () => {
    setSelectedTeacherId(null);
    setSelectedClassForTeacher('');
    setIsClassTeacherDialogOpen(true);
  };

  const handleAssignClassTeacher = async () => {
    if (!selectedTeacherId || !selectedClassForTeacher) {
      toast.error('Please select both teacher and class');
      return;
    }

    const teacher = teachers?.find(t => t.id === selectedTeacherId);
    const cls = classes?.find(c => c.id === parseInt(selectedClassForTeacher));

    if (!teacher || !cls) return;

    // Check if class already has a class teacher
    if (cls.classTeacherId && cls.classTeacherId !== selectedTeacherId) {
      const currentTeacher = teachers?.find(t => t.id === cls.classTeacherId);
      toast.error(`${cls.name} already has a class teacher: ${currentTeacher?.firstName} ${currentTeacher?.lastName}`);
      return;
    }

    try {
      // Update class to set class teacher
      await updateClass(parseInt(selectedClassForTeacher), {
        classTeacherId: selectedTeacherId,
        classTeacher: `${teacher.firstName} ${teacher.lastName}`,
      });

      // Update teacher to mark as class teacher
      await updateTeacher(selectedTeacherId, {
        is_class_teacher: true,
      });

      toast.success(`${teacher.firstName} ${teacher.lastName} assigned as class teacher of ${cls.name}`);
      
      // Add activity log
      addActivityLog(
        'Class Teacher Assigned',
        `${teacher.firstName} ${teacher.lastName}`,
        `Assigned as class teacher to ${cls.name}`,
        'class_teacher'
      );

      setSelectedTeacherId(null);
      setSelectedClassForTeacher('');
      setIsClassTeacherDialogOpen(false);
    } catch (error) {
      toast.error('An error occurred while assigning class teacher');
    }
  };

  const handleRemoveClassTeacher = async (classId: number) => {
    const cls = classes?.find(c => c.id === classId);
    if (!cls || !cls.classTeacherId) return;

    const teacherId = cls.classTeacherId;

    try {
      // Update class to remove class teacher
      await updateClass(classId, {
        classTeacherId: null,
        classTeacher: '',
      });

      // Check if teacher still has other class teacher assignments
      const remainingClasses = classes?.filter(c => 
        c.classTeacherId === teacherId && c.id !== classId
      );

      if (remainingClasses && remainingClasses.length === 0) {
        // Update teacher to remove class teacher status
        await updateTeacher(teacherId, {
          is_class_teacher: false,
        });
      }

      toast.success(`Class teacher removed from ${cls.name}`);
      
      // Add activity log
      addActivityLog(
        'Class Teacher Removed',
        cls.classTeacher || 'Unknown Teacher',
        `Removed as class teacher from ${cls.name}`,
        'class_teacher'
      );
    } catch (error) {
      toast.error('An error occurred while removing class teacher');
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadSubjectAssignmentsFromAPI(),
          loadTeachersFromAPI(),
          loadClassesFromAPI(),
        ]);
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                Teacher Assignments
              </h1>
              <p className="text-gray-600 mt-1">Manage subject assignments and class teacher roles</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleOpenAssignDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
              </Button>
              <Button
                onClick={handleOpenClassTeacherDialog}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 transition-all duration-200 px-6"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Class Teachers
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Modern Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Assignments</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAssignments}</p>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    Active this term
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Teachers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.uniqueTeachers}</p>
                  <p className="text-xs text-purple-600 mt-2 flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    With assignments
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Subjects Covered</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.uniqueSubjects}</p>
                  <p className="text-xs text-orange-600 mt-2 flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    Across curriculum
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Classes Served</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.uniqueClasses}</p>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    All levels
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Filters and Search */}
        <Card className="bg-white border-0 shadow-lg rounded-2xl mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by teacher, subject, or class..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                  <SelectTrigger className="w-48 h-12 rounded-xl border-gray-200">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <SelectValue placeholder="All Teachers" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Teachers</SelectItem>
                    {teachers?.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterClass} onValueChange={setFilterClass}>
                  <SelectTrigger className="w-48 h-12 rounded-xl border-gray-200">
                    <div className="flex items-center gap-2">
                      <Grid3x3 className="w-4 h-4 text-gray-400" />
                      <SelectValue placeholder="All Classes" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Classes</SelectItem>
                    {classes?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex bg-gray-100 rounded-xl p-1">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className={`rounded-lg ${viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        {viewMode === 'table' ? (
          /* Modern Table View */
          <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Subject Assignments
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                  {currentTerm} - {currentAcademicYear}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="text-gray-700 font-semibold">Teacher</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Subject</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Class</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Term</TableHead>
                      <TableHead className="text-gray-700 font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.length === 0 ? (
                      <TableRow className="hover:bg-gray-50">
                        <TableCell colSpan={5} className="text-center py-16">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                              <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">No assignments found</p>
                              <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                            </div>
                            <Button
                              onClick={handleOpenAssignDialog}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create First Assignment
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssignments.map((assignment) => (
                        <TableRow key={assignment.id} className="hover:bg-gray-50 border-b border-gray-100">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {assignment.teacher_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{assignment.teacher_name}</p>
                                <p className="text-sm text-gray-500">ID: {assignment.teacher_id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <BookOpen className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{assignment.subject_name}</p>
                                <p className="text-sm text-gray-500">ID: {assignment.subject_id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Users className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{assignment.class_name}</p>
                                <p className="text-sm text-gray-500">ID: {assignment.class_id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="bg-gray-50">
                              {assignment.term}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Handle remove assignment
                                removeSubjectAssignmentAPI(
                                  assignment.teacher_id,
                                  assignment.subject_id,
                                  assignment.class_id,
                                  assignment.academic_year,
                                  assignment.term
                                ).then(() => {
                                  toast.success('Assignment removed successfully');
                                  loadSubjectAssignmentsFromAPI();
                                });
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Modern Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.length === 0 ? (
              <div className="col-span-full">
                <Card className="bg-white border-0 shadow-lg rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium text-lg mb-2">No assignments found</p>
                    <p className="text-gray-500 text-sm mb-6">Try adjusting your search or filters</p>
                    <Button
                      onClick={handleOpenAssignDialog}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Assignment
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {assignment.teacher_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{assignment.teacher_name}</p>
                          <p className="text-sm text-gray-500">Teacher ID: {assignment.teacher_id}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          removeSubjectAssignmentAPI(
                            assignment.teacher_id,
                            assignment.subject_id,
                            assignment.class_id,
                            assignment.academic_year,
                            assignment.term
                          ).then(() => {
                            toast.success('Assignment removed successfully');
                            loadSubjectAssignmentsFromAPI();
                          });
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <BookOpen className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-gray-900">{assignment.subject_name}</p>
                          <p className="text-sm text-gray-500">ID: {assignment.subject_id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{assignment.class_name}</p>
                          <p className="text-sm text-gray-500">ID: {assignment.class_id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-gray-50">
                          {assignment.term}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {assignment.academic_year}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Create Subject Assignments</DialogTitle>
              <DialogDescription>
                Assign subjects to teachers for specific classes
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              {/* Teacher Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Select Teacher</Label>
                <Select value={selectedTeacherId?.toString() || ''} onValueChange={(value: string) => setSelectedTeacherId(parseInt(value))}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Choose a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject-Class Matrix */}
              {selectedTeacherId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-4 block">Select Assignments</Label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200">
                      <div className="col-span-5 p-3 font-semibold text-gray-700">Subject</div>
                      <div className="col-span-7 p-3 font-semibold text-gray-700">Classes</div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {subjects?.map((subject) => (
                        <div key={subject.id} className="border-b border-gray-100">
                          <div className="grid grid-cols-12">
                            <div className="col-span-5 p-3 border-r border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-orange-100 rounded">
                                  <BookOpen className="w-3 h-3 text-orange-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{subject.name}</p>
                                  <p className="text-xs text-gray-500">{subject.code}</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-span-7 p-3">
                              <div className="flex flex-wrap gap-2">
                                {classes?.map((cls) => {
                                  const isSelected = selectedAssignments.some(
                                    (a) => a.subject_id === subject.id && a.class_id === cls.id
                                  );
                                  return (
                                    <div
                                      key={cls.id}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-lg border cursor-pointer transition-colors ${
                                        isSelected
                                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                                          : 'bg-white border-gray-200 hover:bg-gray-50'
                                      }`}
                                      onClick={() => handleAddAssignment(subject.id, cls.id)}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        className="w-3 h-3"
                                        readOnly
                                      />
                                      <span className="text-xs font-medium">{cls.name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Assignments Summary */}
              {selectedAssignments.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    {selectedAssignments.length} assignment{selectedAssignments.length > 1 ? 's' : ''} selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAssignments.map((assignment, index) => {
                      const subject = subjects?.find(s => s.id === assignment.subject_id);
                      const cls = classes?.find(c => c.id === assignment.class_id);
                      return (
                        <Badge key={index} className="bg-blue-100 text-blue-800">
                          {subject?.name} → {cls?.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsAssignDialogOpen(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAssignments}
                disabled={!selectedTeacherId || selectedAssignments.length === 0 || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {isLoading ? 'Saving...' : `Save ${selectedAssignments.length} Assignment${selectedAssignments.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Class Teacher Dialog */}
        <Dialog open={isClassTeacherDialogOpen} onOpenChange={setIsClassTeacherDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Assign Class Teacher</DialogTitle>
              <DialogDescription>
                Assign a teacher as the class teacher for a specific class
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Select Teacher</Label>
                <Select value={selectedTeacherId?.toString() || ''} onValueChange={(value: string) => setSelectedTeacherId(parseInt(value))}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Choose a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Select Class</Label>
                <Select value={selectedClassForTeacher} onValueChange={setSelectedClassForTeacher}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsClassTeacherDialogOpen(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignClassTeacher}
                disabled={!selectedTeacherId || !selectedClassForTeacher}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                Assign Class Teacher
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

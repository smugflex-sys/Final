import { useState } from "react";
import { Search, Link as LinkIcon, Unlink, Users, UserCheck, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useSchool } from "../../contexts/SchoolContext";

export function LinkStudentParentPage() {
  const { students, parents, linkStudentToParent, unlinkStudentFromParent, classes, parentStudentLinks } = useSchool();
  const [studentSearch, setStudentSearch] = useState("");
  const [parentSearch, setParentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [relationship, setRelationship] = useState<'Father' | 'Mother' | 'Guardian'>('Guardian');
  const [notifyParent, setNotifyParent] = useState(true);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [unlinkData, setUnlinkData] = useState<{ parentId: number; studentId: number; studentName: string } | null>(null);

  // Transform real data for display
  const studentsData = Array.isArray(students) ? students.map(s => {
    const cls = Array.isArray(classes) ? classes.find(c => c.id === s.class_id) : null;
    const parent = Array.isArray(parents) ? parents.find(p => p.id === s.parent_id) : null;
    return {
      id: s.id,
      name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown Student',
      admissionNo: s.admissionNumber,
      class: s.className || cls?.name || 'N/A',
      photo: s.photo_url || null,
      hasParent: s.parent_id !== null,
      parentName: parent ? `${parent.firstName || ''} ${parent.lastName || ''}`.trim() : null
    };
  }) : [];

  const parentsData = Array.isArray(parents) ? parents.map(p => {
    // Get linked children from parent_student_links table (more accurate)
    const linkedChildren = Array.isArray(parentStudentLinks) 
      ? parentStudentLinks
          .filter(link => link.parent_id === p.id)
          .map(link => {
            const student = Array.isArray(students) ? students.find(s => s.id === link.student_id) : null;
            return student ? {
              id: student.id,
              name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
              admissionNo: student.admissionNumber,
              class: student.className,
              relationship: link.relationship
            } : null;
          })
          .filter(child => child !== null)
      : [];

    return {
      id: p.id,
      name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown Parent',
      email: p.email || 'N/A',
      phone: p.phone || 'N/A',
      linkedChildren,
      linkedCount: linkedChildren.length
    };
  }) : [];

  const filteredStudents = Array.isArray(studentsData) ? studentsData.filter(s => 
    (s.name && s.name.toLowerCase().includes(studentSearch.toLowerCase())) ||
    (s.admissionNo && s.admissionNo.toLowerCase().includes(studentSearch.toLowerCase())) ||
    (s.class && s.class.toLowerCase().includes(studentSearch.toLowerCase()))
  ) : [];

  const filteredParents = Array.isArray(parentsData) ? parentsData.filter(p => 
    (p.name && p.name.toLowerCase().includes(parentSearch.toLowerCase())) ||
    (p.email && p.email.toLowerCase().includes(parentSearch.toLowerCase())) ||
    (p.phone && p.phone.toLowerCase().includes(parentSearch.toLowerCase()))
  ) : [];

  const handleLinkStudentParent = async () => {
    if (!selectedStudent || !selectedParent) {
      toast.error("Please select both a student and a parent");
      return;
    }

    try {
      const success = await linkStudentToParent(selectedParent.id, selectedStudent.id, relationship);
      
      if (success) {
        const notifyMsg = notifyParent ? " — Parent will be notified" : "";
        toast.success(`${selectedStudent.name} linked to ${selectedParent.name} as ${relationship}${notifyMsg}`, {
          duration: 4000,
        });
        
        setSelectedStudent(null);
        setSelectedParent(null);
      } else {
        toast.error("Failed to link student to parent");
      }
    } catch (error) {
      toast.error("An error occurred while linking");
    }
  };

  const handleUnlinkChild = (parentId: number, studentId: number, studentName: string) => {
    setUnlinkData({ parentId, studentId, studentName });
    setShowUnlinkDialog(true);
  };

  const confirmUnlink = async () => {
    if (!unlinkData) return;

    const { parentId, studentId } = unlinkData;
    
    try {
      const success = await unlinkStudentFromParent(parentId, studentId);
      
      if (success) {
        toast.success(`${unlinkData.studentName} unlinked successfully`);
        setShowUnlinkDialog(false);
        setUnlinkData(null);
        
        // Clear selections if they were involved in the unlink
        if (selectedParent?.id === parentId) {
          setSelectedParent(null);
        }
        if (selectedStudent?.id === studentId) {
          setSelectedStudent(null);
        }
      } else {
        toast.error("Failed to unlink student");
      }
    } catch (error) {
      toast.error("An error occurred while unlinking");
    }
  };

  // Statistics
  const stats = {
    totalStudents: Array.isArray(students) ? students.length : 0,
    linkedStudents: Array.isArray(students) ? students.filter((s: any) => s.parent_id !== null).length : 0,
    unlinkedStudents: Array.isArray(students) ? students.filter((s: any) => s.parent_id === null).length : 0,
    totalParents: Array.isArray(parents) ? parents.length : 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#0A2540] mb-2">Link Student to Parent</h1>
        <p className="text-gray-600">Connect students with their parents/guardians for portal access</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Students</p>
                <p className="text-[#0A2540]">{stats.totalStudents}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Linked</p>
                <p className="text-[#0A2540]">{stats.linkedStudents}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Unlinked</p>
                <p className="text-[#0A2540]">{stats.unlinkedStudents}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0A2540]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Parents</p>
                <p className="text-[#0A2540]">{stats.totalParents}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Linking Interface */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Student Selection */}
        <Card className="border-[#0A2540]/10">
          <CardHeader className="p-5 bg-[#3B82F6] rounded-t-xl">
            <h3 className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select Student
            </h3>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by name, admission no, or class..."
                className="pl-10 rounded-xl border-[#0A2540]/20"
              />
            </div>

            {/* Selected Student */}
            {selectedStudent && (
              <div className="p-4 bg-green-50 border-2 border-green-500 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-green-500">
                      <AvatarFallback className="bg-green-500 text-white">
                        {selectedStudent.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[#0A2540] text-sm">{selectedStudent.name}</p>
                      <p className="text-xs text-gray-600">{selectedStudent.admissionNo}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedStudent(null)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full hover:bg-red-50"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="rounded-xl">{selectedStudent.class}</Badge>
                  {selectedStudent.hasParent && (
                    <Badge className="bg-yellow-100 text-yellow-800 rounded-xl">Already Linked</Badge>
                  )}
                </div>
              </div>
            )}

            {/* Student List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No students found</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full p-3 rounded-xl transition-all text-left ${
                      selectedStudent?.id === student.id
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-gray-50 border border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-500 text-white text-sm">
                          {student.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-[#0A2540] text-sm">{student.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-600">{student.admissionNo}</p>
                          <span className="text-gray-400">•</span>
                          <p className="text-xs text-gray-600">{student.class}</p>
                        </div>
                        {student.hasParent && (
                          <p className="text-xs text-green-600 mt-1">
                            Linked to: {student.parentName}
                          </p>
                        )}
                      </div>
                      {student.hasParent && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Parent Selection */}
        <Card className="border-[#0A2540]/10">
          <CardHeader className="p-5 bg-[#10B981] rounded-t-xl">
            <h3 className="text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Select Parent
            </h3>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={parentSearch}
                onChange={(e) => setParentSearch(e.target.value)}
                placeholder="Search by name, phone, or email..."
                className="pl-10 rounded-xl border-[#0A2540]/20"
              />
            </div>

            {/* Selected Parent */}
            {selectedParent && (
              <div className="p-4 bg-green-50 border-2 border-green-500 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-green-500">
                      <AvatarFallback className="bg-green-500 text-white">
                        {selectedParent.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[#0A2540] text-sm">{selectedParent.name}</p>
                      <p className="text-xs text-gray-600">{selectedParent.phone}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedParent(null)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full hover:bg-red-50"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-2">{selectedParent.email}</p>
                <Badge variant="outline" className="rounded-xl">
                  {selectedParent.linkedChildren.length} child(ren) linked
                </Badge>
              </div>
            )}

            {/* Parent List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredParents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No parents found</p>
                </div>
              ) : (
                filteredParents.map((parent) => (
                  <div key={parent.id}>
                    <button
                      onClick={() => setSelectedParent(parent)}
                      className={`w-full p-3 rounded-xl transition-all text-left ${
                        selectedParent?.id === parent.id
                          ? 'bg-green-50 border-2 border-green-500'
                          : 'bg-gray-50 border border-gray-200 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-green-500 text-white text-sm">
                            {parent.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-[#0A2540] text-sm">{parent.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{parent.phone}</p>
                        </div>
                        <Badge variant="outline" className="rounded-xl text-xs">
                          {parent.linkedChildren.length}
                        </Badge>
                      </div>
                    </button>

                    {/* Linked Children (when parent is selected) */}
                    {selectedParent?.id === parent.id && parent.linkedChildren.length > 0 && (
                      <div className="ml-4 mt-2 space-y-2">
                        <p className="text-xs text-gray-600">Currently linked children:</p>
                        {parent.linkedChildren.map((child) => (
                          <div 
                            key={child.id}
                            className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-[#0A2540] text-xs">{child.name}</p>
                              <p className="text-xs text-gray-600">{child.admissionNo} • {child.class}</p>
                              <p className="text-xs text-blue-600">{child.relationship}</p>
                            </div>
                            <Button
                              onClick={() => handleUnlinkChild(parent.id, child.id, child.name)}
                              size="sm"
                              className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs"
                            >
                              <Unlink className="w-3 h-3 mr-1" />
                              Unlink
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Link Action */}
      <Card className="border-[#0A2540]/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <Label className="text-[#0A2540]">Relationship</Label>
                  <Select value={relationship} onValueChange={(value: 'Father' | 'Mother' | 'Guardian') => setRelationship(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <Label className="text-[#0A2540]">Notify Parent of Link</Label>
                  <p className="text-sm text-gray-600">Send in-app notification</p>
                </div>
                <Switch 
                  checked={notifyParent} 
                  onCheckedChange={setNotifyParent}
                />
              </div>
            </div>

            <Button
              onClick={handleLinkStudentParent}
              disabled={!selectedStudent || !selectedParent}
              className="h-12 px-8 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl shadow-md disabled:opacity-50"
            >
              <LinkIcon className="w-5 h-5 mr-2" />
              Link Selected
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A2540]">Unlink Child?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink <strong>{unlinkData?.studentName}</strong>? 
              The parent will lose access to this child's information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnlink}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              Unlink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

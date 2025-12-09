import { useState, useEffect, useRef } from "react";
import { Save, Upload, UserPlus, RefreshCw, Calendar, User, School, Image } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { useSchool } from "../../contexts/SchoolContext";

export function SystemSettingsPage() {
  const {
    students,
    classes,
    teachers,
    currentUser,
    currentAcademicYear,
    currentTerm,
    updateCurrentTerm,
    updateCurrentAcademicYear,
    getAttendanceRequirements,
    updateAttendanceRequirements,
    loadAttendanceRequirements,
    schoolSettings,
    updateSchoolSettings,
    loadSchoolSettings,
    createUserAPI,
    resetUserPasswordAPI,
    users,
    changePassword
  } = useSchool();

  const [sessionData, setSessionData] = useState({
    currentSession: currentAcademicYear,
    currentTerm: currentTerm,
  });

  const [attendanceData, setAttendanceData] = useState(getAttendanceRequirements());

  const [signatureData, setSignatureData] = useState({
    principal_name: schoolSettings.principal_name || '',
    principal_comment: schoolSettings.principal_comment || '',
    head_teacher_name: schoolSettings.head_teacher_name || '',
    head_teacher_comment: schoolSettings.head_teacher_comment || '',
    resumption_date: schoolSettings.resumption_date || ''
  });

  const [principalSignatureFile, setPrincipalSignatureFile] = useState<File | null>(null);
  const [headTeacherSignatureFile, setHeadTeacherSignatureFile] = useState<File | null>(null);
  const [principalSignaturePreview, setPrincipalSignaturePreview] = useState<string>('');
  const [headTeacherSignaturePreview, setHeadTeacherSignaturePreview] = useState<string>('');

  const principalSignatureRef = useRef<HTMLInputElement>(null);
  const headTeacherSignatureRef = useRef<HTMLInputElement>(null);

  const [brandingData, setBrandingData] = useState({
    schoolName: schoolSettings.school_name,
    schoolMotto: schoolSettings.school_motto,
    principalName: schoolSettings.principal_name,
  });

  // Update local state when context changes
  useEffect(() => {
    setSessionData({
      currentSession: currentAcademicYear,
      currentTerm: currentTerm,
    });
  }, [currentAcademicYear, currentTerm]);

  // Refresh attendance requirements from database when component loads
  useEffect(() => {
    loadAttendanceRequirements();
  }, [loadAttendanceRequirements]);

  // Update local state when attendance requirements change
  useEffect(() => {
    setAttendanceData(getAttendanceRequirements());
  }, [getAttendanceRequirements]);

  // Update branding when school settings change
  useEffect(() => {
    setBrandingData({
      schoolName: schoolSettings.school_name,
      schoolMotto: schoolSettings.school_motto,
      principalName: schoolSettings.principal_name,
    });
  }, [schoolSettings]);

  // Update signature data when school settings change
  useEffect(() => {
    setSignatureData({
      principal_name: schoolSettings.principal_name || '',
      principal_comment: schoolSettings.principal_comment || '',
      head_teacher_name: schoolSettings.head_teacher_name || '',
      head_teacher_comment: schoolSettings.head_teacher_comment || '',
      resumption_date: schoolSettings.resumption_date || ''
    });
    
    // Set signature previews from school settings
    setPrincipalSignaturePreview(schoolSettings.principal_signature || '');
    setHeadTeacherSignaturePreview(schoolSettings.head_teacher_signature || '');
  }, [schoolSettings]);

  // Refresh school settings when component mounts
  useEffect(() => {
    // Refresh settings from database to ensure latest data
    loadSchoolSettings();
    loadAttendanceRequirements();
  }, []);

  const [adminData, setAdminData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [passwordResetData, setPasswordResetData] = useState({
    username: "",
    newPassword: "",
  });

  const handleUpdateSession = async () => {
    await updateCurrentAcademicYear(sessionData.currentSession);
    await updateCurrentTerm(sessionData.currentTerm);
    toast.success(`Academic session and term updated to ${sessionData.currentSession} - ${sessionData.currentTerm}`);
  };

  const handleSaveBranding = async () => {
    await updateSchoolSettings({
      school_name: brandingData.schoolName,
      school_motto: brandingData.schoolMotto,
      principal_name: brandingData.principalName,
    });
    toast.success("School branding updated successfully!");
  };

  const handleSaveAttendance = async () => {
    await updateAttendanceRequirements(attendanceData);
    toast.success("Attendance requirements updated successfully!");
  };

  const handleSaveSignature = async () => {
    await updateSchoolSettings({
      principal_name: signatureData.principal_name,
      head_teacher_name: signatureData.head_teacher_name,
      principal_comment: signatureData.principal_comment,
      head_teacher_comment: signatureData.head_teacher_comment,
      resumption_date: signatureData.resumption_date,
      principal_signature: principalSignaturePreview,
      head_teacher_signature: headTeacherSignaturePreview
    });
    toast.success("Signature settings updated successfully!");
  };

  const handlePrincipalSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setPrincipalSignatureFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPrincipalSignaturePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  const handleHeadTeacherSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setHeadTeacherSignatureFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setHeadTeacherSignaturePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if username already exists
    const existingUser = users.find((u: any) => u.username === adminData.username);
    if (existingUser) {
      toast.error("Username already exists. Please choose a different username.");
      return;
    }

    // Create new admin user
    await createUserAPI({
      username: adminData.username,
      password: adminData.password,
      role: 'admin',
      linkedId: 0, // Admin has no linked profile
      email: adminData.email,
      status: 'Active',
    });

    toast.success("New admin account created successfully!");
    setAdminData({ username: "", email: "", password: "" });
  };

  const handleResetPassword = async () => {
    if (!passwordResetData.username || !passwordResetData.newPassword) {
      toast.error("Please enter both username and new password");
      return;
    }

    const user = users.find((u: any) => u.username === passwordResetData.username);
    if (!user) {
      toast.error("User not found");
      return;
    }

    // Use resetUserPasswordAPI for admin password reset
    const success = await resetUserPasswordAPI(user.id, passwordResetData.newPassword);
    
    if (success) {
      toast.success(`Password reset successful for ${passwordResetData.username}!`);
      setPasswordResetData({ username: "", newPassword: "" });
    } else {
      toast.error("Password reset failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-white mb-2">System Settings</h1>
        <p className="text-[#C0C8D3]">Configure school system settings and administration</p>
      </div>

      {/* School Logo & Branding */}
      <Card className="rounded-xl bg-[#132C4A] border border-white/10 shadow-lg max-w-4xl">
        <CardHeader className="p-5 border-b border-white/10">
          <h3 className="text-white">School Branding</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[#1E90FF] to-[#00BFFF] flex items-center justify-center border-4 border-white/10">
                <span className="text-white text-center px-4">School Logo</span>
              </div>
              <div className="flex-1">
                <p className="text-white mb-3">Upload School Logo</p>
                <Button className="bg-[#1E90FF] hover:bg-[#00BFFF] text-white rounded-xl shadow-md hover:scale-105 transition-all">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <p className="text-xs text-[#C0C8D3] mt-2">Recommended: 512x512px, PNG or JPG</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">School Name</Label>
              <Input
                value={brandingData.schoolName}
                onChange={(e) => setBrandingData({ ...brandingData, schoolName: e.target.value })}
                className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">School Motto</Label>
              <Input
                value={brandingData.schoolMotto}
                onChange={(e) => setBrandingData({ ...brandingData, schoolMotto: e.target.value })}
                className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Principal Name</Label>
              <Input
                value={brandingData.principalName}
                onChange={(e) => setBrandingData({ ...brandingData, principalName: e.target.value })}
                className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
              />
            </div>

            <Button onClick={handleSaveBranding} className="bg-[#28A745] hover:bg-[#28A745]/90 text-white rounded-xl shadow-md hover:scale-105 transition-all">
              <Save className="w-4 h-4 mr-2" />
              Save Branding
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Academic Session & Term */}
      <Card className="rounded-xl bg-[#132C4A] border border-white/10 shadow-lg max-w-4xl">
        <CardHeader className="p-5 border-b border-white/10">
          <h3 className="text-white">Academic Session & Term</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Current Academic Session</Label>
                <Select value={sessionData.currentSession} onValueChange={(value: string) => setSessionData({ ...sessionData, currentSession: value })}>
                  <SelectTrigger className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F243E] border-white/10">
                    <SelectItem value="2023/2024" className="text-white hover:bg-[#1E90FF]">2023/2024</SelectItem>
                    <SelectItem value="2024/2025" className="text-white hover:bg-[#1E90FF]">2024/2025</SelectItem>
                    <SelectItem value="2025/2026" className="text-white hover:bg-[#1E90FF]">2025/2026</SelectItem>
                    <SelectItem value="2026/2027" className="text-white hover:bg-[#1E90FF]">2026/2027</SelectItem>
                    <SelectItem value="2027/2028" className="text-white hover:bg-[#1E90FF]">2027/2028</SelectItem>
                    <SelectItem value="2028/2029" className="text-white hover:bg-[#1E90FF]">2028/2029</SelectItem>
                    <SelectItem value="2029/2030" className="text-white hover:bg-[#1E90FF]">2029/2030</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Current Term</Label>
                <Select value={sessionData.currentTerm} onValueChange={(value: string) => setSessionData({ ...sessionData, currentTerm: value })}>
                  <SelectTrigger className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F243E] border-white/10">
                    <SelectItem value="First Term" className="text-white hover:bg-[#1E90FF]">First Term</SelectItem>
                    <SelectItem value="Second Term" className="text-white hover:bg-[#1E90FF]">Second Term</SelectItem>
                    <SelectItem value="Third Term" className="text-white hover:bg-[#1E90FF]">Third Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 bg-[#1E90FF]/10 border border-[#1E90FF] rounded-xl">
              <p className="text-[#C0C8D3]">
                <strong className="text-white">Note:</strong> Changing the session or term will affect all result entries and fee structures. Please ensure all current term results are finalized before updating.
              </p>
            </div>

            <Button onClick={handleUpdateSession} className="bg-[#1E90FF] hover:bg-[#00BFFF] text-white rounded-xl shadow-md hover:scale-105 transition-all">
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Session & Term
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Requirements */}
      <Card className="rounded-xl bg-[#132C4A] border border-white/10 shadow-lg max-w-4xl">
        <CardHeader className="p-5 border-b border-white/10">
          <h3 className="text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Attendance Requirements
          </h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white">First Term Required Days</Label>
                <Input
                  type="number"
                  min="1"
                  max="200"
                  value={attendanceData['First Term'] || ''}
                  onChange={(e) => setAttendanceData({ ...attendanceData, 'First Term': parseInt(e.target.value) || 0 })}
                  className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
                  placeholder="Enter required days"
                />
                <p className="text-xs text-[#C0C8D3]">Total days student must be present</p>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Second Term Required Days</Label>
                <Input
                  type="number"
                  min="1"
                  max="200"
                  value={attendanceData['Second Term'] || ''}
                  onChange={(e) => setAttendanceData({ ...attendanceData, 'Second Term': parseInt(e.target.value) || 0 })}
                  className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
                  placeholder="Enter required days"
                />
                <p className="text-xs text-[#C0C8D3]">Total days student must be present</p>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Third Term Required Days</Label>
                <Input
                  type="number"
                  min="1"
                  max="200"
                  value={attendanceData['Third Term'] || ''}
                  onChange={(e) => setAttendanceData({ ...attendanceData, 'Third Term': parseInt(e.target.value) || 0 })}
                  className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
                  placeholder="Enter required days"
                />
                <p className="text-xs text-[#C0C8D3]">Total days student must be present</p>
              </div>
            </div>

            <div className="p-4 bg-[#28A745]/10 border border-[#28A745] rounded-xl">
              <p className="text-[#C0C8D3]">
                <strong className="text-white">Note:</strong> These requirements are used to calculate attendance ratios in student reports. The system calculates attendance percentage as (days present / required days) × 100.
              </p>
            </div>

            <Button onClick={handleSaveAttendance} className="bg-[#28A745] hover:bg-[#28A745]/90 text-white rounded-xl shadow-md hover:scale-105 transition-all">
              <Save className="w-4 h-4 mr-2" />
              Save Attendance Requirements
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signature Settings */}
      <Card className="rounded-xl bg-[#132C4A] border border-white/10 shadow-lg max-w-4xl">
        <CardHeader className="p-5 border-b border-white/10">
          <h3 className="text-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            Signature Settings
          </h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Principal Name</Label>
                <Input
                  value={signatureData.principal_name}
                  onChange={(e) => setSignatureData({ ...signatureData, principal_name: e.target.value })}
                  className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Head Teacher Name</Label>
                <Input
                  value={signatureData.head_teacher_name}
                  onChange={(e) => setSignatureData({ ...signatureData, head_teacher_name: e.target.value })}
                  className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-white">Principal Signature</Label>
                <div className="space-y-3">
                  <input
                    ref={principalSignatureRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePrincipalSignatureUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => principalSignatureRef.current?.click()}
                    className="w-full bg-[#1E90FF] hover:bg-[#00BFFF] text-white rounded-xl border border-white/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Principal Signature
                  </Button>
                  {principalSignaturePreview && (
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <img 
                        src={principalSignaturePreview} 
                        alt="Principal Signature" 
                        className="max-h-20 mx-auto"
                      />
                      <p className="text-xs text-[#C0C8D3] mt-2 text-center">
                        {principalSignatureFile?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-white">Head Teacher Signature</Label>
                <div className="space-y-3">
                  <input
                    ref={headTeacherSignatureRef}
                    type="file"
                    accept="image/*"
                    onChange={handleHeadTeacherSignatureUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => headTeacherSignatureRef.current?.click()}
                    className="w-full bg-[#1E90FF] hover:bg-[#00BFFF] text-white rounded-xl border border-white/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Head Teacher Signature
                  </Button>
                  {headTeacherSignaturePreview && (
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <img 
                        src={headTeacherSignaturePreview} 
                        alt="Head Teacher Signature" 
                        className="max-h-20 mx-auto"
                      />
                      <p className="text-xs text-[#C0C8D3] mt-2 text-center">
                        {headTeacherSignatureFile?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Principal Default Comment</Label>
                <textarea
                  value={signatureData.principal_comment}
                  onChange={(e) => setSignatureData({ ...signatureData, principal_comment: e.target.value })}
                  className="w-full h-20 rounded-xl border border-white/10 bg-[#0F243E] text-white p-3 resize-none"
                  placeholder="Default comment for principal approval"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Head Teacher Default Comment</Label>
                <textarea
                  value={signatureData.head_teacher_comment}
                  onChange={(e) => setSignatureData({ ...signatureData, head_teacher_comment: e.target.value })}
                  className="w-full h-20 rounded-xl border border-white/10 bg-[#0F243E] text-white p-3 resize-none"
                  placeholder="Default comment for head teacher approval"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Next Term Resumption Date</Label>
              <Input
                type="date"
                value={signatureData.resumption_date}
                onChange={(e) => setSignatureData({ ...signatureData, resumption_date: e.target.value })}
                className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
              />
            </div>

            <div className="p-4 bg-[#1E90FF]/10 border border-[#1E90FF] rounded-xl">
              <p className="text-[#C0C8D3]">
                <strong className="text-white">Note:</strong> Upload signature images for report cards. Supported formats: PNG, JPG, JPEG. Signatures will appear on student result cards when printed or exported.
              </p>
            </div>

            <Button onClick={handleSaveSignature} className="bg-[#1E90FF] hover:bg-[#00BFFF] text-white rounded-xl shadow-md hover:scale-105 transition-all">
              <Save className="w-4 h-4 mr-2" />
              Save Signature Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Admin Account */}
      <Card className="rounded-xl bg-[#132C4A] border border-white/10 shadow-lg max-w-4xl">
        <CardHeader className="p-5 border-b border-white/10">
          <h3 className="text-white">Administrator Management</h3>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleCreateAdmin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">New Admin Username</Label>
                <Input
                  required
                  value={adminData.username}
                  onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                  placeholder="Enter username"
                  className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Admin Email</Label>
                <Input
                  required
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  placeholder="admin@gracelandgombe.edu"
                  className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Initial Password</Label>
                <Input
                  required
                  type="password"
                  value={adminData.password}
                  onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                  placeholder="Enter secure password"
                  className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
                />
              </div>
            </div>

            <Button type="submit" className="bg-[#28A745] hover:bg-[#28A745]/90 text-white rounded-xl shadow-md hover:scale-105 transition-all">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Admin Account
            </Button>
          </form>

          <Separator className="my-6 bg-white/10" />

          <div className="space-y-4">
            <h4 className="text-white">Password Management</h4>
            <p className="text-[#C0C8D3]">Reset password for existing users (Admin, Teacher, Accountant, Parent)</p>
            
            <div className="grid md:grid-cols-2 gap-3">
              <Input
                placeholder="Enter username"
                value={passwordResetData.username}
                onChange={(e) => setPasswordResetData({ ...passwordResetData, username: e.target.value })}
                className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
              />
              <Input
                type="password"
                placeholder="Enter new password"
                value={passwordResetData.newPassword}
                onChange={(e) => setPasswordResetData({ ...passwordResetData, newPassword: e.target.value })}
                className="h-12 rounded-xl border border-white/10 bg-[#0F243E] text-white"
              />
            </div>
            <Button onClick={handleResetPassword} className="bg-[#FFC107] hover:bg-[#FFC107]/90 text-[#0A2540] rounded-xl shadow-md hover:scale-105 transition-all whitespace-nowrap px-6">
              Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="rounded-xl bg-[#132C4A] border border-white/10 shadow-lg max-w-4xl">
        <CardHeader className="p-5 border-b border-white/10">
          <h3 className="text-white">System Information</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#0F243E] rounded-xl border border-white/5">
              <p className="text-[#C0C8D3] mb-1">System Version</p>
              <p className="text-white">v1.0.0</p>
            </div>
            <div className="p-4 bg-[#0F243E] rounded-xl border border-white/5">
              <p className="text-[#C0C8D3] mb-1">Last Backup</p>
              <p className="text-white">2024-01-15 10:30 AM</p>
            </div>
            <div className="p-4 bg-[#0F243E] rounded-xl border border-white/5">
              <p className="text-[#C0C8D3] mb-1">Total Users</p>
              <p className="text-white">{users.length}</p>
            </div>
            <div className="p-4 bg-[#0F243E] rounded-xl border border-white/5">
              <p className="text-[#C0C8D3] mb-1">System Status</p>
              <p className="text-[#28A745]">Operational</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

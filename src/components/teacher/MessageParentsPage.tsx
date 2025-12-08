import { useState } from "react";
import { Send, MessageSquare, Users, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useSchool } from "../../contexts/SchoolContext";
import { toast } from "sonner";

export function MessageParentsPage() {
  const { students, parents, currentUser, classes, teachers, getTeacherAssignments } = useSchool();
  
  // Get current teacher's classes based on class teacher assignment only
  const currentTeacher = teachers.find(t => t.id === currentUser?.linked_id);
  const teacherClasses = classes.filter((c: any) => c.classTeacherId === currentTeacher?.id);
  const teacherStudents = students.filter(s => teacherClasses.some(c => c.id === s.class_id));
  const [messageData, setMessageData] = useState({
    recipientType: "single",
    studentId: "",
    classId: "",
    subject: "",
    message: ""
  });

  const [sentMessages, setSentMessages] = useState<any[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMessage = {
      id: sentMessages.length + 1,
      ...messageData,
      timestamp: new Date().toLocaleString(),
      status: "Sent"
    };

    setSentMessages([newMessage, ...sentMessages]);
    toast.success("Message sent successfully!");
    setMessageData({ recipientType: "single", studentId: "", classId: "", subject: "", message: "" });
  };

  const getRecipientCount = () => {
    if (messageData.recipientType === "single") {
      return messageData.studentId ? 1 : 0;
    } else if (messageData.recipientType === "class") {
      return teacherStudents.filter(s => s.class_id === Number(messageData.classId)).length;
    }
    return teacherStudents.length;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-[#1F2937] mb-2">Message Parents</h1>
        <p className="text-[#6B7280]">Send messages and updates to parents/guardians</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Form */}
        <div className="lg:col-span-2">
          <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
            <CardHeader className="border-b border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <h2 className="font-semibold text-[#1F2937]">Compose Message</h2>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="recipientType">Send To *</Label>
                  <Select
                    value={messageData.recipientType}
                    onValueChange={(value: "single" | "class" | "all") => setMessageData({ ...messageData, recipientType: value })}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Student Parent</SelectItem>
                      <SelectItem value="class">All Parents in Class</SelectItem>
                      <SelectItem value="all">All Parents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {messageData.recipientType === "single" && (
                  <div>
                    <Label htmlFor="student">Select Student *</Label>
                    <Select
                      value={messageData.studentId}
                      onValueChange={(value: string) => setMessageData({ ...messageData, studentId: value })}
                      required
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Choose student" />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherStudents.map((student) => {
                          const studentClass = classes.find(c => c.id === student.class_id);
                          return (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.firstName} {student.lastName} - {studentClass?.name || 'Unknown Class'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {messageData.recipientType === "class" && (
                  <div>
                    <Label htmlFor="class">Select Class *</Label>
                    <Select
                      value={messageData.classId}
                      onValueChange={(value: string) => setMessageData({ ...messageData, classId: value })}
                      required
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Choose class" />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherClasses.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={messageData.subject}
                    onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                    placeholder="Message subject"
                    className="rounded-lg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={messageData.message}
                    onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                    placeholder="Type your message here..."
                    className="rounded-lg min-h-[200px]"
                    required
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#6B7280]" />
                    <span className="text-sm text-[#6B7280]">
                      {getRecipientCount()} recipient(s)
                    </span>
                  </div>
                  <Button type="submit" className="rounded-lg bg-[#3B82F6] hover:bg-[#2563EB]">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sent Messages */}
        <div>
          <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
            <CardHeader className="border-b border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <h2 className="font-semibold text-[#1F2937]">Sent Messages</h2>
            </CardHeader>
            <CardContent className="p-4 max-h-[600px] overflow-y-auto">
              {sentMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
                  <p className="text-sm text-[#6B7280]">No messages sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentMessages.map((msg) => (
                    <div key={msg.id} className="p-3 border border-[#E5E7EB] rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[#1F2937] truncate">{msg.subject}</p>
                          <p className="text-xs text-[#6B7280]">{msg.timestamp}</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#6B7280] line-clamp-2">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

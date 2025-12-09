import { useState } from "react";
import { Send, MessageSquare, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useSchool } from "../../contexts/SchoolContext";
import { toast } from "sonner";

export function MessageTeacherPage() {
  const { currentUser, students, parents, teachers, accountants, addNotification } = useSchool();
  const [messageData, setMessageData] = useState({
    childId: "",
    recipientType: "admin", // admin, accountant
    subject: "",
    message: ""
  });

  const parent = parents.find(p => p.id === currentUser?.linked_id);
  const children = parent && parent.student_ids ? students.filter(s => parent.student_ids!.includes(s.id)) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const recipientText = messageData.recipientType === "accountant" ? "Accountant" : "School Administration";
      const targetAudience = messageData.recipientType === "accountant" ? "accountants" : "admin";
      
      // Create notification for the appropriate recipient
      await addNotification({
        title: `Parent Message: ${messageData.subject}`,
        message: `From: ${parent?.firstName} ${parent?.lastName}\nChild: ${children.find(c => c.id === parseInt(messageData.childId))?.firstName} ${children.find(c => c.id === parseInt(messageData.childId))?.lastName}\nTo: ${recipientText}\n\n${messageData.message}`,
        type: 'message' as any,
        targetAudience: targetAudience as any,
        sentBy: currentUser?.id || 0,
        sentDate: new Date().toISOString(),
        isRead: false,
        readBy: []
      });

      toast.success(`Message sent to ${recipientText} successfully!`);
      setMessageData({ childId: "", recipientType: "admin", subject: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-[#1F2937] mb-2">Message School</h1>
        <p className="text-[#6B7280]">Send messages to the school administration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
            <CardHeader className="border-b border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <h2 className="font-semibold text-[#1F2937]">Compose Message</h2>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="child">Regarding Child *</Label>
                  <Select
                    value={messageData.childId}
                    onValueChange={(value: string) => setMessageData({ ...messageData, childId: value })}
                    required
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select child" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id.toString()}>
                          {child.firstName} {child.lastName} - {child.className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recipient">Send To *</Label>
                  <Select
                    value={messageData.recipientType}
                    onValueChange={(value: string) => setMessageData({ ...messageData, recipientType: value })}
                    required
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">School Administration</SelectItem>
                      <SelectItem value="accountant">Accountant (Fee Related)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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

                <Button type="submit" className="w-full rounded-lg bg-[#3B82F6] hover:bg-[#2563EB]">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message to School
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
            <CardHeader className="border-b border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <h2 className="font-semibold text-[#1F2937]">Quick Tips</h2>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-sm text-[#6B7280]">
              <div className="flex gap-3">
                <MessageSquare className="w-5 h-5 flex-shrink-0 text-[#3B82F6]" />
                <p>Teachers typically respond within 24-48 hours</p>
              </div>
              <div className="flex gap-3">
                <User className="w-5 h-5 flex-shrink-0 text-[#3B82F6]" />
                <p>For urgent matters, contact the school office directly</p>
              </div>
              <div className="flex gap-3">
                <Send className="w-5 h-5 flex-shrink-0 text-[#3B82F6]" />
                <p>Be specific about your concerns or questions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

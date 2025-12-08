import { useState } from "react";
import { Calendar, Clock, BookOpen, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { useSchool } from "../../contexts/SchoolContext";

export function ViewTimetablePage() {
  const { currentUser, students, parents, classes } = useSchool();
  
  const parent = parents.find(p => p.id === currentUser?.linkedId);
  const currentParent = parent;
  const children = currentParent && currentParent.studentIds ? students.filter((s) => currentParent.studentIds.includes(s.id)) : [];
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || 0);

  const selectedChild = children.find(c => c.id === selectedChildId);
  const childClass = selectedChild ? classes.find(c => c.id === selectedChild.classId) : null;

  // Mock timetable data
  const timetable = {
    Monday: [
      { time: "08:00 - 08:45", subject: "Mathematics", teacher: "Mr. John Doe", room: "Room 101" },
      { time: "08:45 - 09:30", subject: "English Language", teacher: "Mrs. Sarah Johnson", room: "Room 102" },
      { time: "09:30 - 10:15", subject: "Physics", teacher: "Dr. Ahmed Hassan", room: "Lab 1" },
      { time: "10:15 - 10:30", subject: "Break", teacher: "-", room: "-" },
      { time: "10:30 - 11:15", subject: "Chemistry", teacher: "Mrs. Fatima Musa", room: "Lab 2" },
      { time: "11:15 - 12:00", subject: "Biology", teacher: "Dr. Ibrahim Yusuf", room: "Lab 3" },
    ],
    Tuesday: [
      { time: "08:00 - 08:45", subject: "Geography", teacher: "Mr. Abdullahi Ahmed", room: "Room 103" },
      { time: "08:45 - 09:30", subject: "Mathematics", teacher: "Mr. John Doe", room: "Room 101" },
      { time: "09:30 - 10:15", subject: "English Language", teacher: "Mrs. Sarah Johnson", room: "Room 102" },
      { time: "10:15 - 10:30", subject: "Break", teacher: "-", room: "-" },
      { time: "10:30 - 11:15", subject: "Economics", teacher: "Mr. Daniel Okon", room: "Room 104" },
      { time: "11:15 - 12:00", subject: "Physical Education", teacher: "Coach Mike", room: "Field" },
    ],
    Wednesday: [
      { time: "08:00 - 08:45", subject: "Chemistry", teacher: "Mrs. Fatima Musa", room: "Lab 2" },
      { time: "08:45 - 09:30", subject: "Physics", teacher: "Dr. Ahmed Hassan", room: "Lab 1" },
      { time: "09:30 - 10:15", subject: "Mathematics", teacher: "Mr. John Doe", room: "Room 101" },
      { time: "10:15 - 10:30", subject: "Break", teacher: "-", room: "-" },
      { time: "10:30 - 11:15", subject: "Computer Science", teacher: "Mr. Tech Guru", room: "Computer Lab" },
      { time: "11:15 - 12:00", subject: "Hausa Language", teacher: "Mal. Sani Ibrahim", room: "Room 105" },
    ],
    Thursday: [
      { time: "08:00 - 08:45", subject: "English Language", teacher: "Mrs. Sarah Johnson", room: "Room 102" },
      { time: "08:45 - 09:30", subject: "Biology", teacher: "Dr. Ibrahim Yusuf", room: "Lab 3" },
      { time: "09:30 - 10:15", subject: "Geography", teacher: "Mr. Abdullahi Ahmed", room: "Room 103" },
      { time: "10:15 - 10:30", subject: "Break", teacher: "-", room: "-" },
      { time: "10:30 - 11:15", subject: "Mathematics", teacher: "Mr. John Doe", room: "Room 101" },
      { time: "11:15 - 12:00", subject: "Islamic Studies", teacher: "Sheikh Ahmad", room: "Room 106" },
    ],
    Friday: [
      { time: "08:00 - 08:45", subject: "Mathematics", teacher: "Mr. John Doe", room: "Room 101" },
      { time: "08:45 - 09:30", subject: "Physics", teacher: "Dr. Ahmed Hassan", room: "Lab 1" },
      { time: "09:30 - 10:15", subject: "English Language", teacher: "Mrs. Sarah Johnson", room: "Room 102" },
      { time: "10:15 - 10:30", subject: "Break", teacher: "-", room: "-" },
      { time: "10:30 - 11:15", subject: "Civic Education", teacher: "Mr. Peter Okoro", room: "Room 107" },
      { time: "11:15 - 12:00", subject: "Club Activities", teacher: "Various", room: "Various" },
    ],
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-[#1F2937] mb-2">Class Timetable</h1>
        <p className="text-[#6B7280]">View your child's weekly class schedule</p>
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

      {/* Class Info */}
      <Card className="rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] border-0 text-white shadow-clinical">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Class Timetable</p>
              <h2 className="text-2xl font-semibold">{childClass?.name || 'Not Assigned'}</h2>
              <p className="text-white/90 mt-1">
                {selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : ''}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-white/80" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Timetable */}
      <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
        <CardHeader className="border-b border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <h2 className="font-semibold text-[#1F2937]">Weekly Schedule</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {days.map((day) => (
              <div key={day}>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E7EB]">
                  <Calendar className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="font-semibold text-[#1F2937]">{day}</h3>
                </div>
                <div className="space-y-2">
                  {timetable[day as keyof typeof timetable].map((period, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        period.subject === "Break"
                          ? 'bg-[#FEF2F2] border border-[#FECACA]'
                          : 'bg-[#F9FAFB] border border-[#E5E7EB]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Clock className="w-4 h-4 text-[#6B7280]" />
                          <span className="text-sm font-medium text-[#1F2937]">{period.time}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-4 h-4 text-[#3B82F6]" />
                            <p className="font-semibold text-[#1F2937]">{period.subject}</p>
                          </div>
                          {period.teacher !== "-" && (
                            <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{period.teacher}</span>
                              </div>
                              <span>•</span>
                              <span>{period.room}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
        <CardContent className="p-4">
          <p className="text-sm text-[#1F2937]">
            <span className="font-semibold">Note:</span> Timetable may be subject to change. Please check regularly for updates.
            Contact your class teacher for any clarifications.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Calendar, Save, Plus, Edit } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useSchool } from "../../contexts/SchoolContext";
import { toast } from "sonner";

export function TermSettingsPage() {
  const { currentAcademicYear, currentTerm, updateCurrentTerm, updateCurrentAcademicYear } = useSchool();
  const [settings, setSettings] = useState({
    academicYear: currentAcademicYear || "2025/2026",
    currentTerm: currentTerm || "First Term",
    termStartDate: "2025-09-01",
    termEndDate: "2025-12-15",
    nextTermStarts: "2026-01-10",
    schoolResumptionDate: "2025-09-01",
    midTermBreakStart: "2025-10-25",
    midTermBreakEnd: "2025-11-01"
  });

  const handleSave = async () => {
    await updateCurrentAcademicYear(settings.academicYear);
    await updateCurrentTerm(settings.currentTerm);
    toast.success("Term settings updated successfully!");
  };

  const termOptions = ["First Term", "Second Term", "Third Term"];
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-[#1F2937] mb-2">Term & Session Settings</h1>
        <p className="text-[#6B7280]">Configure academic year, term dates and school calendar</p>
      </div>

      {/* Current Session Info */}
      <Card className="rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] border-0 text-white shadow-clinical">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Current Academic Session</p>
              <h2 className="text-2xl font-semibold">{settings.academicYear}</h2>
              <p className="text-white/90">{settings.currentTerm}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Year Settings */}
        <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
          <CardHeader className="border-b border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <h2 className="font-semibold text-[#1F2937]">Academic Year Settings</h2>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                value={settings.academicYear}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                placeholder="2025/2026"
                className="rounded-lg"
              />
              <p className="text-xs text-[#6B7280] mt-1">Format: YYYY/YYYY</p>
            </div>

            <div>
              <Label htmlFor="currentTerm">Current Term</Label>
              <Select
                value={settings.currentTerm}
                onValueChange={(value: string) => setSettings({ ...settings, currentTerm: value })}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {termOptions.map((term) => (
                    <SelectItem key={term} value={term}>{term}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} className="w-full rounded-lg bg-[#3B82F6] hover:bg-[#2563EB]">
              <Save className="w-4 h-4 mr-2" />
              Update Academic Year
            </Button>
          </CardContent>
        </Card>

        {/* Term Dates */}
        <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
          <CardHeader className="border-b border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <h2 className="font-semibold text-[#1F2937]">Term Dates</h2>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="termStart">Term Start Date</Label>
              <Input
                id="termStart"
                type="date"
                value={settings.termStartDate}
                onChange={(e) => setSettings({ ...settings, termStartDate: e.target.value })}
                className="rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="termEnd">Term End Date</Label>
              <Input
                id="termEnd"
                type="date"
                value={settings.termEndDate}
                onChange={(e) => setSettings({ ...settings, termEndDate: e.target.value })}
                className="rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="nextTerm">Next Term Starts</Label>
              <Input
                id="nextTerm"
                type="date"
                value={settings.nextTermStarts}
                onChange={(e) => setSettings({ ...settings, nextTermStarts: e.target.value })}
                className="rounded-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Break Periods */}
        <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
          <CardHeader className="border-b border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <h2 className="font-semibold text-[#1F2937]">Break Periods</h2>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="midTermStart">Mid-Term Break Start</Label>
              <Input
                id="midTermStart"
                type="date"
                value={settings.midTermBreakStart}
                onChange={(e) => setSettings({ ...settings, midTermBreakStart: e.target.value })}
                className="rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="midTermEnd">Mid-Term Break End</Label>
              <Input
                id="midTermEnd"
                type="date"
                value={settings.midTermBreakEnd}
                onChange={(e) => setSettings({ ...settings, midTermBreakEnd: e.target.value })}
                className="rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="resumption">School Resumption Date</Label>
              <Input
                id="resumption"
                type="date"
                value={settings.schoolResumptionDate}
                onChange={(e) => setSettings({ ...settings, schoolResumptionDate: e.target.value })}
                className="rounded-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Term Summary */}
        <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-clinical">
          <CardHeader className="border-b border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <h2 className="font-semibold text-[#1F2937]">Term Summary</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-[#F9FAFB] rounded-lg">
                <p className="text-sm text-[#6B7280]">Academic Year</p>
                <p className="font-semibold text-[#1F2937]">{settings.academicYear}</p>
              </div>
              <div className="p-4 bg-[#F9FAFB] rounded-lg">
                <p className="text-sm text-[#6B7280]">Current Term</p>
                <p className="font-semibold text-[#1F2937]">{settings.currentTerm}</p>
              </div>
              <div className="p-4 bg-[#F9FAFB] rounded-lg">
                <p className="text-sm text-[#6B7280]">Term Duration</p>
                <p className="font-semibold text-[#1F2937]">
                  {settings.termStartDate} to {settings.termEndDate}
                </p>
              </div>
              <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
                <p className="text-sm text-[#3B82F6]">Next Term Begins</p>
                <p className="font-semibold text-[#1F2937]">{settings.nextTermStarts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

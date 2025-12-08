import { useState, useMemo, useRef } from 'react';
import { useSchool } from '../../contexts/SchoolContext';
import { FileText, Printer, Download, AlertCircle, Eye, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { StudentResultSheet } from '../StudentResultSheet';
import { toast } from 'sonner';

export function ViewResultsPage() {
  const {
    currentUser,
    students,
    parents,
    compiledResults,
    currentTerm,
    currentAcademicYear,
  } = useSchool();

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState(currentTerm);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(currentAcademicYear);

  const resultSheetRef = useRef<HTMLDivElement>(null);

  // Handle print using native browser print with enhanced styling
  const handlePrint = () => {
    if (resultSheetRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Get the result sheet content
        const resultSheetContent = resultSheetRef.current.innerHTML;
        
        // Create comprehensive print styles
        const printStyles = `
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            
            @media print {
              body {
                margin: 0;
                font-family: Arial, sans-serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .bg-white {
                background: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .text-green-600 {
                color: #16a34a !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .border-b-2 {
                border-bottom: 2px solid #16a34a !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .border-gray-800 {
                border: 1px solid #1f2937 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .border-r {
                border-right: 1px solid #1f2937 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .bg-gray-100 {
                background: #f3f4f6 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .font-bold {
                font-weight: bold !important;
              }
              
              .text-center {
                text-align: center !important;
              }
              
              table {
                border-collapse: collapse !important;
                width: 100% !important;
              }
              
              td, th {
                padding: 4px !important;
                font-size: 10px !important;
                vertical-align: top !important;
              }
              
              .grid {
                display: block !important;
              }
              
              .col-span-2, .col-span-5, .col-span-12 {
                display: block !important;
                width: 100% !important;
              }
              
              .w-24, .w-20 {
                width: 96px !important;
                height: 112px !important;
                margin: 0 auto 8px !important;
                display: block !important;
              }
              
              .mb-6 {
                margin-bottom: 1rem !important;
              }
              
              .mb-2 {
                margin-bottom: 0.5rem !important;
              }
              
              .mb-1 {
                margin-bottom: 0.25rem !important;
              }
              
              .py-1 {
                padding: 2px 0 !important;
              }
              
              .p-1 {
                padding: 4px !important;
              }
              
              .p-2 {
                padding: 8px !important;
              }
              
              .text-sm {
                font-size: 12px !important;
              }
              
              .text-xs {
                font-size: 10px !important;
              }
              
              .text-2xl {
                font-size: 24px !important;
              }
              
              .gap-4 {
                margin-bottom: 1rem !important;
              }
              
              /* Ensure images don't break */
              img {
                max-width: 100% !important;
                height: auto !important;
                page-break-inside: avoid;
              }
              
              /* Avoid page breaks in important sections */
              .border {
                page-break-inside: avoid;
              }
              
              table {
                page-break-inside: auto;
              }
              
              tr {
                page-break-inside: avoid;
              }
              
              /* Footer styling */
              .text-gray-500 {
                color: #6b7280 !important;
              }
              
              .italic {
                font-style: italic !important;
              }
            }
          </style>
        `;
        
        // Write the complete HTML with enhanced styling
        printWindow.document.write('<html><head><title>Result Sheet - Graceland Royal Academy</title>');
        printWindow.document.write(printStyles);
        printWindow.document.write('</head><body>');
        printWindow.document.write(resultSheetContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load before printing
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          toast.success("Result sheet printed successfully with original design preserved");
        }, 500);
      }
    }
  };

  // Handle download (print to PDF)
  const handleDownload = () => {
    handlePrint();
    toast.info("Use your browser's 'Save as PDF' option in the print dialog");
  };

  // Get current parent
  const currentParent = currentUser ? parents.find((p) => p.id === currentUser.linked_id) : null;

  // Get parent's children - REAL DATA ONLY
  const parentStudents = useMemo(() => {
    if (!currentParent) return [];
    return currentParent?.student_ids ? students.filter((s) => currentParent.student_ids.includes(s.id)) : [];
  }, [currentParent, students]);

  // Get approved results for selected student
  const studentResults = useMemo(() => {
    if (!selectedStudentId) return [];
    return compiledResults.filter(
      (r) =>
        r.student_id === selectedStudentId &&
        r.term === selectedTerm &&
        r.academic_year === selectedAcademicYear &&
        r.status === 'Approved' // Only show approved results to parents
    );
  }, [selectedStudentId, selectedTerm, selectedAcademicYear, compiledResults]);

  const selectedStudent = parentStudents.find((s) => s.id === selectedStudentId);

  if (!currentParent) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-800">Unable to load parent information</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#0A2540] mb-2">View Results</h1>
        <p className="text-gray-600">
          View approved academic results for your children
        </p>
      </div>

      {/* Selection Filters */}
      <Card className="border-[#0A2540]/10">
        <CardHeader className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-t-xl">
          <CardTitle>Select Student & Term</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-[#0A2540] mb-2 block">Select Child</Label>
              <Select
                value={selectedStudentId?.toString() || ""}
                onValueChange={(value: string) => setSelectedStudentId(Number(value))}
              >
                <SelectTrigger className="h-12 rounded-xl border-[#0A2540]/20">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {parentStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.first_name} {student.last_name} - {student.class_name || 'N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#0A2540] mb-2 block">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="h-12 rounded-xl border-[#0A2540]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">First Term</SelectItem>
                  <SelectItem value="Second Term">Second Term</SelectItem>
                  <SelectItem value="Third Term">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#0A2540] mb-2 block">Academic Year</Label>
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger className="h-12 rounded-xl border-[#0A2540]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Children Linked */}
      {parentStudents.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-[#0A2540] text-lg mb-2">No Children Linked</h3>
            <p className="text-gray-600">
              You don't have any children linked to your account yet.
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Please contact the school administration to link your children.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Student Selected */}
      {parentStudents.length > 0 && !selectedStudentId && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-[#0A2540] text-lg mb-2">Select a Child</h3>
            <p className="text-gray-600">
              Please select one of your children from the dropdown above to view their results.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Results Available */}
      {selectedStudentId && studentResults.length === 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-[#0A2540] text-lg mb-2">No Results Available</h3>
            <p className="text-gray-600 mb-2">
              No approved results found for {selectedStudent?.first_name} {selectedStudent?.last_name}
            </p>
            <p className="text-gray-600 text-sm">
              for {selectedTerm} {selectedAcademicYear}
            </p>
            <p className="text-gray-500 text-sm mt-3">
              Results may still be pending approval by the administration.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results Available */}
      {selectedStudentId && studentResults.length > 0 && (
        <div className="space-y-6">
          {studentResults.map((result) => (
            <Card key={result.id} className="border-[#0A2540]/10">
              <CardHeader className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="mb-1">
                      {selectedStudent?.first_name} {selectedStudent?.last_name}
                    </CardTitle>
                    <p className="text-sm opacity-90">
                      {selectedStudent?.class_name || 'N/A'} • {selectedTerm} {selectedAcademicYear}
                    </p>
                  </div>
                  <Badge className="bg-white text-[#10B981] rounded-xl px-4">
                    Approved
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Quick Summary */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-900 mb-1">Total Score</p>
                    <p className="text-2xl text-blue-900 font-bold">
                      {result.total_score}
                    </p>
                    <p className="text-sm text-blue-700">
                      {result.class_average}%
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Result Sheet
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Result Sheet - {selectedStudent?.first_name}{" "}
                          {selectedStudent?.last_name}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <StudentResultSheet
                          ref={resultSheetRef}
                          studentId={selectedStudentId}
                          term={selectedTerm}
                          academicYear={selectedAcademicYear}
                        />

                        <div className="flex gap-3 justify-end border-t pt-4">
                          <Button
                            onClick={handlePrint}
                            variant="outline"
                            className="rounded-xl"
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                          </Button>
                          <Button
                            onClick={handleDownload}
                            className="bg-[#10B981] hover:bg-[#059669] text-white rounded-xl"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>

                  <Button
                    onClick={handleDownload}
                    className="bg-[#10B981] hover:bg-[#059669] text-white rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                {/* Preview of Result Table */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="text-[#0A2540] font-medium mb-3">Subject Performance</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {result.scores.slice(0, 6).map((score, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#0A2540]">
                            {score.subject_name}
                          </span>
                          <Badge
                            className={`rounded-xl ${
                              score.grade === "A"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : score.grade === "B"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : score.grade === "C"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : score.grade === "D"
                                ? "bg-orange-100 text-orange-800 border-orange-300"
                                : "bg-red-100 text-red-800 border-red-300"
                            }`}
                          >
                            {score.total} ({score.grade})
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  {result.scores.length > 6 && (
                    <p className="text-sm text-gray-600 mt-3 text-center">
                      ... and {result.scores.length - 6} more subjects
                    </p>
                  )}
                </div>

                {/* Class Teacher Comment */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    Class Teacher's Comment:
                  </p>
                  <p className="text-blue-900">{result.class_teacher_comment}</p>
                  <p className="text-sm text-blue-800 mt-2">
                    - {result.class_teacher_name}
                  </p>
                </div>

                {/* Principal Comment */}
                {result.principalComment && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <p className="text-sm text-purple-900 font-medium mb-2">
                      Principal's Comment:
                    </p>
                    <p className="text-purple-900">{result.principal_comment}</p>
                    <p className="text-sm text-purple-800 mt-2">
                      - {result.principal_name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
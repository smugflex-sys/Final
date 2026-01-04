import { useState, useEffect } from "react";
import { useSchool } from "../../contexts/SchoolContext";
import { StudentResultCard } from "./StudentResultCard";

interface FullPageResultViewProps {
  studentId: number;
  resultId: number;
  onClose: () => void;
}

export function FullPageResultView({ studentId, resultId, onClose }: FullPageResultViewProps) {
  const { students, classes, compiledResults } = useSchool();
  const [student, setStudent] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [studentClass, setStudentClass] = useState<any>(null);

  useEffect(() => {
    // Find student, result, and class data
    const foundStudent = students.find(s => s.id === studentId);
    const foundResult = compiledResults.find(cr => cr.id === resultId);
    const foundClass = classes.find(c => c.id === foundResult?.class_id);

    setStudent(foundStudent);
    setResult(foundResult);
    setStudentClass(foundClass);
  }, [studentId, resultId, students, compiledResults, classes]);

  if (!student || !result) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading result...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media screen {
          body {
            margin: 0;
            padding: 0;
            overflow-x: auto;
            background: #f3f4f6;
          }
          
          .full-page-container {
            min-height: 100vh;
            padding: 2rem 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-only {
            display: none !important;
          }
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            overflow: visible !important;
          }
          
          .full-page-container {
            background: white !important;
            padding: 0 !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-only {
            display: block !important;
          }
          
          .full-page-container {
            background: white !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .bg-white.shadow-2xl.mx-auto {
            box-shadow: none !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100">
        {/* Main Content - Full Page A4 Container */}
        <div className="full-page-container py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* A4 Size Container */}
            <div className="bg-white shadow-2xl mx-auto overflow-auto" style={{ 
              width: '210mm',
              minHeight: '297mm',
              maxWidth: '100%',
              aspectRatio: '210/297',
              overflow: 'visible'
            }}>
              {/* Scale container for proper A4 display */}
              <div className="transform-gpu" style={{ 
                transform: 'scale(1)',
                transformOrigin: 'top center',
                width: '100%',
                height: '100%',
                overflow: 'visible'
              }}>
                <StudentResultCard
                  student={student}
                  studentClass={studentClass}
                  result={result}
                  showActions={false}
                  currentUser={{ role: 'admin' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

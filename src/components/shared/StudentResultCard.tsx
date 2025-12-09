import { useState, useEffect } from "react";
import {
  Download,
  Printer,
  FileText,
  User,
  Calendar,
  Award,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useSchool } from "../../contexts/SchoolContext";
import { StudentResultCardProps } from './types/resultCard';
import schoolLogo from '../../assets/images/school-logo.jpg';

export function StudentResultCard({
  student: propStudent,
  studentClass: propStudentClass,
  result,
  detailedScores: propDetailedScores,
  showActions = false,
  onDownload,
  onPrint,
  onApprovePrint,
  currentUser
}: StudentResultCardProps) {
  const { schoolSettings } = useSchool();
  const { students, classes, teachers, scores, subjectAssignments, subjects, loadScoresFromAPI, loadSubjectAssignmentsFromAPI, loadSubjectsFromAPI } = useSchool();
  const [showDetails, setShowDetails] = useState(false);
  const [detailedScoresData, setDetailedScoresData] = useState<any[]>([]);

  // Load detailed scores when component mounts or result changes
  useEffect(() => {
    if (result && result.student_id) {
      loadDetailedScores();
    }
  }, [result, scores]);

  const loadDetailedScores = async () => {
    if (!result || !result.student_id) return;

    try {
      // Ensure all necessary data is loaded
      await Promise.all([
        scores.length === 0 && loadScoresFromAPI(),
        subjectAssignments.length === 0 && loadSubjectAssignmentsFromAPI(),
        subjects.length === 0 && loadSubjectsFromAPI()
      ]);

      // Filter scores for this student, class, term, and academic year
      let studentScores = scores.filter(score => 
        score.student_id === result.student_id &&
        score.academic_year === result.academic_year &&
        score.term === result.term
      );

      // Enhance scores with subject information and calculate class statistics
      studentScores = studentScores.map(score => {
        const subjectAssignment = subjectAssignments.find(sa => sa.id === score.subject_assignment_id);
        const subject = subjectAssignment ? subjects.find(s => s.id === subjectAssignment.subject_id) : null;
        const teacher = subjectAssignment ? teachers.find(t => t.id === subjectAssignment.teacher_id) : null;

        // Calculate class statistics for this subject
        const classScores = scores.filter(s => {
          const assignment = subjectAssignments.find(sa => sa.id === s.subject_assignment_id);
          return assignment && 
                 assignment.subject_id === subjectAssignment?.subject_id &&
                 s.academic_year === result.academic_year &&
                 s.term === result.term &&
                 s.total > 0;
        });

        const validScores = classScores.map(cs => cs.total || 0);
        const classAverage = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
        const classMinimum = validScores.length > 0 ? Math.min(...validScores) : 0;
        const classMaximum = validScores.length > 0 ? Math.max(...validScores) : 0;

        return {
          ...score,
          subject_name: subject ? subject.name : score.subject_name || 'Unknown Subject',
          subject_teacher: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Not Assigned',
          class_average: parseFloat(classAverage.toFixed(2)),
          class_minimum: classMinimum,
          class_maximum: classMaximum
        };
      }).sort((a, b) => a.subject_name.localeCompare(b.subject_name));

      // If we have detailedScores in props, use them, otherwise use result.scores or filtered scores
      if (propDetailedScores && propDetailedScores.length > 0) {
        setDetailedScoresData(propDetailedScores);
      } else if (result.scores && result.scores.length > 0) {
        // Enhance result scores with subject information too
        const enhancedResultScores = result.scores.map((score: any) => {
          const subjectAssignment = subjectAssignments.find(sa => sa.id === score.subject_assignment_id);
          const subject = subjectAssignment ? subjects.find(s => s.id === subjectAssignment.subject_id) : null;
          const teacher = subjectAssignment ? teachers.find(t => t.id === subjectAssignment.teacher_id) : null;

          // Calculate class statistics for this subject
          const classScores = scores.filter(s => {
            const assignment = subjectAssignments.find(sa => sa.id === s.subject_assignment_id);
            return assignment && 
                   assignment.subject_id === subjectAssignment?.subject_id &&
                   s.academic_year === result.academic_year &&
                   s.term === result.term &&
                   s.total > 0;
          });

          const validScores = classScores.map(cs => cs.total || 0);
          const classAverage = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
          const classMinimum = validScores.length > 0 ? Math.min(...validScores) : 0;
          const classMaximum = validScores.length > 0 ? Math.max(...validScores) : 0;
          
          return {
            ...score,
            subject_name: subject ? subject.name : score.subject_name || 'Unknown Subject',
            subject_teacher: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Not Assigned',
            class_average: parseFloat(classAverage.toFixed(2)),
            class_minimum: classMinimum,
            class_maximum: classMaximum
          };
        }).sort((a, b) => a.subject_name.localeCompare(b.subject_name));
        setDetailedScoresData(enhancedResultScores);
      } else {
        setDetailedScoresData(studentScores);
      }
    } catch (error) {
      console.error('Error loading detailed scores:', error);
      setDetailedScoresData([]);
    }
  };

  // Use props or find from context if not provided
  const studentData = propStudent || students.find(s => s.id === result.student_id);
  const studentClassData = propStudentClass || classes.find(c => c.id === result.class_id);

  // Get class teacher name
  const getClassTeacherName = () => {
    // The class teacher name is already loaded in the class data as 'classTeacher'
    if (studentClassData?.classTeacher) {
      return studentClassData.classTeacher;
    }
    
    // Fallback: If class_teacher_id exists, find the teacher
    if (studentClassData?.classTeacherId) {
      const classTeacher = teachers.find((t: any) => t.id === studentClassData.classTeacherId);
      if (classTeacher) {
        return `${classTeacher.firstName} ${classTeacher.lastName}`;
      }
    }
    
    return 'CLASS TEACHER';
  };

  // Calculate grade based on score - matching your design scale
  const getGrade = (score: number) => {
    if (score >= 80) return { grade: 'A', remark: 'Excellent' };
    if (score >= 70) return { grade: 'B', remark: 'Very Good' };
    if (score >= 60) return { grade: 'C', remark: 'Good' };
    if (score >= 50) return { grade: 'D', remark: 'Satisfactory' };
    if (score >= 45) return { grade: 'E', remark: 'Fair' };
    return { grade: 'F', remark: 'Fail' };
  };

  // Get affective domain remark
  const getAffectiveRemark = (score: number) => {
    if (score === 5) return 'Excellent';
    if (score === 4) return 'Very Good';
    if (score === 3) return 'Good';
    if (score === 2) return 'Fair';
    return 'Poor';
  };

  // Check if user can download/print (admin only or approved for parents)
  const canDownloadPrint = currentUser?.role === 'admin' || result.print_approved;

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
            orientation: portrait;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
            font-size: 10pt;
            line-height: 1.2;
            width: 100%;
            height: 100vh;
            overflow: hidden;
          }
          
          .print-container {
            width: 100%;
            max-width: 190mm;
            height: 277mm;
            margin: 0 auto;
            box-sizing: border-box;
            overflow: hidden;
            page-break-after: always;
            page-break-inside: avoid;
            padding: 5mm;
            background: white;
          }
          
          .print-header {
            page-break-after: auto;
            page-break-inside: avoid;
          }
          
          .print-table {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .print-section {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .print-affective-psychomotor {
            page-break-inside: avoid;
            display: flex !important;
            gap: 2mm !important;
          }
          
          .print-watermark {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            opacity: 0.1 !important;
            z-index: 0 !important;
            pointer-events: none !important;
          }
          
          .print-content {
            position: relative !important;
            z-index: 1 !important;
          }
          
          table {
            border-collapse: collapse !important;
            page-break-inside: avoid !important;
          }
          
          tr {
            page-break-inside: avoid !important;
          }
          
          td, th {
            page-break-inside: avoid !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-only {
            display: block !important;
          }
          
          @media screen {
            .print-only {
              display: none !important;
            }
          }
        }
      `}</style>
      
      <div className="print-container bg-white" style={{ 
        fontFamily: '"Times New Roman", serif',
        width: '210mm',
        height: '297mm',
        margin: '0 auto',
        padding: '8mm',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        overflow: 'hidden',
        position: 'relative',
        border: '3px double #333'
      }}>
      {/* Watermark */}
      <div className="print-watermark" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '120mm',
        height: '120mm',
        backgroundImage: `url(${schoolLogo})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.08,
        zIndex: 0
      }} />
      
      <div className="print-content" style={{ position: 'relative', zIndex: 1 }}>
      {/* School Header */}
      <div className="print-header" style={{ textAlign: 'center', marginBottom: '2mm' }}>
        <div style={{ marginBottom: '0.5mm' }}>
          <img src={schoolLogo} alt="School Logo" style={{ width: '12mm', height: '12mm', display: 'block', margin: '0 auto' }} />
        </div>
        <h1 style={{ fontSize: '11pt', fontWeight: 'bold', margin: '0.5mm 0', textTransform: 'uppercase' }}>{schoolSettings.school_name || 'GRACELAND ROYAL ACADEMY'}</h1>
        <p style={{ fontSize: '6pt', margin: '0.3mm 0', fontStyle: 'italic' }}>{schoolSettings.school_address || 'BEHIND HAKIMI PALACE OPPOSITE NNPC DEPOT TUNFUFE, GOMBE'}</p>
        <p style={{ fontSize: '6pt', margin: '0.3mm 0' }}>{schoolSettings.school_email || 'gracelandroyalacademy09@gmail.com'}</p>
      </div>

      <hr className="border border-black" />

      {/* Student Information Section with Photo */}
      <div className="print-section" style={{ marginBottom: '2mm', display: 'flex', gap: '0mm' }}>
        <div style={{ width: '75%' }}>
          <table className="w-full border-collapse border border-black" style={{ 
          fontSize: '6pt', 
          height: '22mm',
          pageBreakInside: 'avoid'
        }}>
            <tbody>
              <tr>
                <td className="border border-black" style={{ padding: '0.8mm', fontWeight: 'bold', fontSize: '6pt' }}>NAME:</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontSize: '6pt' }}>{studentData ? `${studentData.firstName} ${studentData.lastName}`.toUpperCase() : 'STUDENT NAME'}</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontWeight: 'bold', fontSize: '6pt' }}>SESSION:</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontSize: '6pt' }}>{result.academic_year || '2024/2025'}</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontWeight: 'bold', fontSize: '6pt' }}>NO. IN CLASS:</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontSize: '6pt' }}>{result.position || '___'}</td>
              </tr>
              <tr>
                <td className="border border-black" style={{ padding: '0.8mm', fontWeight: 'bold', fontSize: '6pt' }}>ADM NO:</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontSize: '6pt' }}>{studentData?.admissionNumber || 'GRA/XXXXX'}</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontWeight: 'bold', fontSize: '6pt' }}>TERM:</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontSize: '6pt' }}>{result.term || 'THIRD TERM'}</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontWeight: 'bold', fontSize: '6pt' }}>TERM END:</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontSize: '6pt' }}>{result.term_end || '25-JUL-2025'}</td>
              </tr>
              <tr>
                <td className="border border-black" style={{ padding: '0.8mm', fontWeight: 'bold', fontSize: '6pt' }}>GENDER:</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontSize: '6pt' }}>{studentData?.gender || 'MALE'}</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontWeight: 'bold', fontSize: '6pt' }}>CLASS:</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontSize: '6pt' }}>{studentClassData?.name || 'CLASS NAME'}</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontWeight: 'bold', fontSize: '6pt' }}>NEXT TERM:</td>
                <td className="border border-black" style={{ padding: '0.8mm', fontSize: '6pt' }}>{schoolSettings?.resumption_date || '_________________'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ width: '25%' }}>
          <div className="border border-black" style={{ height: '22mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {studentData?.photo_url ? (
              <img src={studentData.photo_url} alt="Student Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '7pt', color: '#666' }}>No Photo</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Title */}
      <div style={{ textAlign: 'center', marginBottom: '1mm' }}>
        <h2 style={{ fontSize: '10pt', fontWeight: 'bold', textDecoration: 'underline', margin: '0.5mm 0', textTransform: 'uppercase' }}>
          {result.term || 'THIRD TERM'} RESULT SHEET
        </h2>
      </div>

      {/* Result Table */}
      <table className="print-table w-full border-collapse border border-black" style={{ 
        fontSize: '6pt', 
        marginBottom: '1mm',
        pageBreakInside: 'avoid',
        pageBreakAfter: 'auto'
      }}>
        <thead>
          <tr>
            <th className="border border-black" style={{ padding: '0.5mm', width: '3%', fontWeight: 'bold', fontSize: '5pt' }}>SN</th>
            <th className="border border-black" style={{ padding: '0.5mm', width: '16%', fontWeight: 'bold', fontSize: '5pt' }}>SUBJECT</th>
            <th className="border border-black" style={{ padding: '0.5mm', width: '6%', fontWeight: 'bold', fontSize: '5pt' }}>1st CA</th>
            <th className="border border-black" style={{ padding: '0.5mm', width: '6%', fontWeight: 'bold', fontSize: '5pt' }}>2nd CA</th>
            <th className="border border-black" style={{ padding: '0.5mm', width: '6%', fontWeight: 'bold', fontSize: '5pt' }}>Exams</th>
            <th className="border border-black" style={{ padding: '0.5mm', width: '6%', fontWeight: 'bold', fontSize: '5pt' }}>Total</th>
            <th className="border border-black" style={{ padding: '0.5mm', width: '7%', fontWeight: 'bold', fontSize: '5pt' }}>Avg</th>
            <th className="border border-black" style={{ padding: '0.5mm', width: '5%', fontWeight: 'bold', fontSize: '5pt' }}>Grd</th>
            <th className="border border-black" style={{ padding: '0.5mm', width: '8%', fontWeight: 'bold', fontSize: '5pt' }}>Remark</th>
            <th className="border border-black" style={{ padding: '0.5mm', width: '6%', fontWeight: 'bold', fontSize: '5pt' }}>Min</th>
            <th className="border border-black" style={{ padding: '0.5mm', width: '6%', fontWeight: 'bold', fontSize: '5pt' }}>Max</th>
                      </tr>
        </thead>
        <tbody>
          {detailedScoresData && detailedScoresData.length > 0 ? (
            detailedScoresData.map((score: any, index: number) => {
              const gradeInfo = getGrade(score.total || 0);
              return (
                <tr key={index}>
                  <td className="border border-black text-center" style={{ padding: '0.5mm', textAlign: 'center', fontSize: '6pt' }}>{index + 1}</td>
                  <td className="border border-black" style={{ padding: '0.5mm', fontSize: '6pt' }}>{score.subject_name || 'Subject'}</td>
                  <td className="border border-black text-center" style={{ padding: '0.5mm', textAlign: 'center', fontSize: '6pt' }}>{score.ca1 || 0}</td>
                  <td className="border border-black text-center" style={{ padding: '0.5mm', textAlign: 'center', fontSize: '6pt' }}>{score.ca2 || 0}</td>
                  <td className="border border-black text-center" style={{ padding: '0.5mm', textAlign: 'center', fontSize: '6pt' }}>{score.exam || 0}</td>
                  <td className="border border-black text-center font-bold" style={{ padding: '0.5mm', textAlign: 'center', fontWeight: 'bold', fontSize: '6pt' }}>{score.total || 0}</td>
                  <td className="border border-black text-center" style={{ padding: '0.5mm', textAlign: 'center', fontSize: '6pt' }}>{score.class_average || '0.0'}</td>
                  <td className="border border-black text-center font-bold" style={{ padding: '0.5mm', textAlign: 'center', fontWeight: 'bold', fontSize: '6pt' }}>{gradeInfo.grade}</td>
                  <td className="border border-black text-center" style={{ padding: '0.5mm', textAlign: 'center', fontSize: '5pt' }}>{gradeInfo.remark}</td>
                  <td className="border border-black text-center" style={{ padding: '0.5mm', textAlign: 'center', fontSize: '6pt' }}>{score.class_minimum || '0'}</td>
                  <td className="border border-black text-center" style={{ padding: '0.5mm', textAlign: 'center', fontSize: '6pt' }}>{score.class_maximum || '0'}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={12} className="border border-black p-2 text-center text-gray-500" style={{ padding: '2mm', fontSize: '8pt' }}>
                No scores available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Score Summary */}
      <table className="print-table w-full border-collapse border border-black" style={{ 
        marginTop: '1mm', 
        fontSize: '7pt',
        pageBreakInside: 'avoid'
      }}>
        <tbody>
          <tr>
            <td className="border border-black p-1" style={{ padding: '1mm', width: '25%', fontSize: '6pt' }}><b>TOTAL:</b> {result.total_score || '0.00'}</td>
            <td className="border border-black p-1" style={{ padding: '1mm', width: '25%', fontSize: '6pt' }}><b>AVG:</b> {result.average_score || '0.00'}</td>
            <td className="border border-black p-1" style={{ padding: '1mm', width: '25%', fontSize: '6pt' }}><b>CLASS AVG:</b> {result.class_average || '0.00'}</td>
            <td className="border border-black p-1" style={{ padding: '1mm', width: '25%', fontSize: '6pt' }}><b>POS:</b> {result.position ? `${result.position}${result.position === 1 ? 'st' : result.position === 2 ? 'nd' : result.position === 3 ? 'rd' : 'th'}` : '___'}</td>
          </tr>
        </tbody>
      </table>

      {/* Signature Section */}
      <div className="print-section" style={{ marginTop: '3mm', marginBottom: '2mm' }}>
        <div className="border border-black p-1" style={{ padding: '1mm', fontSize: '7pt' }}>
          <p style={{ margin: '0.5mm 0', fontSize: '6pt' }}>
            <b>CLASS TEACHER:</b> {getClassTeacherName()}
          </p>
          <p style={{ margin: '0.5mm 0', fontSize: '6pt' }}>
            <b>COMMENT:</b> {
              // Class teacher comment should come from the compiled results or assessment
              result?.class_teacher_comment || result?.comment || 'Good performance. Keep up the effort.'
            }
          </p>
          <p style={{ margin: '0.5mm 0', fontSize: '6pt' }}>
            <b>{studentClassData?.category === 'Primary' ? 'HEAD TEACHER:' : 'PRINCIPAL:'}</b> 
            {studentClassData?.category === 'Primary' 
              ? ` ${schoolSettings?.head_teacher_name || '_________________'}`
              : ` ${schoolSettings?.principal_name || '_________________'}`
            }
          </p>
          <div style={{ margin: '0.5mm 0', fontSize: '6pt', display: 'flex', alignItems: 'center' }}>
            <b style={{ marginRight: '2mm' }}>SIGNATURE:</b>
            {studentClassData?.category === 'Primary' 
              ? (schoolSettings?.head_teacher_signature ? (
                  <img src={schoolSettings.head_teacher_signature} alt="Head Teacher Signature" style={{ height: '8mm', maxHeight: '8mm' }} />
                ) : (
                  <span>______________________</span>
                ))
              : (schoolSettings?.principal_signature ? (
                  <img src={schoolSettings.principal_signature} alt="Principal Signature" style={{ height: '8mm', maxHeight: '8mm' }} />
                ) : (
                  <span>______________________</span>
                ))
            }
          </div>
        </div>
      </div>

      {/* Affective and Psychomotor Domains */}
      <div className="print-affective-psychomotor flex gap-1" style={{ 
        padding: '1mm',
        pageBreakInside: 'avoid'
      }}>
        {/* Affective Areas */}
        <div className="flex-1">
          <div className="text-center mb-1">
            <h3 className="font-bold underline" style={{ fontSize: '7pt', marginBottom: '0.5mm' }}>AFFECTIVE</h3>
          </div>
          <table className="print-table w-full border-collapse border border-black" style={{ 
            fontSize: '5pt',
            pageBreakInside: 'avoid'
          }}>
            <thead>
              <tr>
                <th className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>QUALITY</th>
                <th className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>SCORE</th>
                <th className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>REMARK</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>ATTENTIVE</td>
                <td className="border border-black text-center" style={{ padding: '0.5mm', fontSize: '4pt' }}>{result.affective?.attentiveness || '4'}</td>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>{getAffectiveRemark(result.affective?.attentiveness || 4)}</td>
              </tr>
              <tr>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>HONESTY</td>
                <td className="border border-black text-center" style={{ padding: '0.5mm', fontSize: '4pt' }}>{result.affective?.honesty || '3'}</td>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>{getAffectiveRemark(result.affective?.honesty || 3)}</td>
              </tr>
              <tr>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>NEATNESS</td>
                <td className="border border-black text-center" style={{ padding: '0.5mm', fontSize: '4pt' }}>{result.affective?.neatness || '4'}</td>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>{getAffectiveRemark(result.affective?.neatness || 4)}</td>
              </tr>
              <tr>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>OBEDIENT</td>
                <td className="border border-black text-center" style={{ padding: '0.5mm', fontSize: '4pt' }}>{result.affective?.obedience || '2'}</td>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>{getAffectiveRemark(result.affective?.obedience || 2)}</td>
              </tr>
              <tr>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>RESPONSIBLE</td>
                <td className="border border-black text-center" style={{ padding: '0.5mm', fontSize: '4pt' }}>{result.affective?.responsibility || '3'}</td>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>{getAffectiveRemark(result.affective?.responsibility || 3)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Psychomotor Skills */}
        <div className="flex-1">
          <div className="text-center mb-1">
            <h3 className="font-bold underline" style={{ fontSize: '7pt', marginBottom: '0.5mm' }}>PSYCHOMOTOR</h3>
          </div>
          <table className="print-table w-full border-collapse border border-black" style={{ 
            fontSize: '5pt',
            pageBreakInside: 'avoid'
          }}>
            <thead>
              <tr>
                <th className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>SKILL</th>
                <th className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>SCORE</th>
                <th className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>REMARK</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>ATTENTION</td>
                <td className="border border-black text-center" style={{ padding: '0.5mm', fontSize: '4pt' }}>{result.psychomotor?.attention_direction || '4'}</td>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>{getAffectiveRemark(result.psychomotor?.attention_direction || 4)}</td>
              </tr>
              <tr>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>CONSIDERATE</td>
                <td className="border border-black text-center" style={{ padding: '0.5mm', fontSize: '4pt' }}>{result.psychomotor?.considerate_others || '2'}</td>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>{getAffectiveRemark(result.psychomotor?.considerate_others || 2)}</td>
              </tr>
              <tr>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>HANDWRITING</td>
                <td className="border border-black text-center" style={{ padding: '0.5mm', fontSize: '4pt' }}>{result.psychomotor?.handwriting || '4'}</td>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>{getAffectiveRemark(result.psychomotor?.handwriting || 4)}</td>
              </tr>
              <tr>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>SPORTS</td>
                <td className="border border-black text-center" style={{ padding: '0.5mm', fontSize: '4pt' }}>{result.psychomotor?.sports || '3'}</td>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>{getAffectiveRemark(result.psychomotor?.sports || 3)}</td>
              </tr>
              <tr>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>VERBAL</td>
                <td className="border border-black text-center" style={{ padding: '0.5mm', fontSize: '4pt' }}>{result.psychomotor?.verbal_fluency || '4'}</td>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>{getAffectiveRemark(result.psychomotor?.verbal_fluency || 4)}</td>
              </tr>
              <tr>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>INDEPENDENT</td>
                <td className="border border-black text-center" style={{ padding: '0.5mm', fontSize: '4pt' }}>{result.psychomotor?.independent_work || '5'}</td>
                <td className="border border-black" style={{ padding: '0.5mm', fontSize: '4pt' }}>{getAffectiveRemark(result.psychomotor?.independent_work || 5)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Status and Actions */}
      {showActions && (
        <div className="p-4 bg-white border-t no-print">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className={
                result.status === 'Approved' ? 'bg-green-100 text-green-800' :
                result.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                result.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }>
                {result.status || 'Draft'}
              </Badge>
              {!result.print_approved && currentUser?.role === 'admin' && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Print Not Approved
                </Badge>
              )}
              {result.print_approved && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Print Approved
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2 no-print">
              {currentUser?.role === 'admin' && (
                <>
                  {!result.print_approved && onApprovePrint && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onApprovePrint?.(result.id)}
                      className="text-purple-600 border-purple-600 hover:bg-purple-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Print
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload?.(result.id)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPrint?.(result.id)}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
    </>
  );
}

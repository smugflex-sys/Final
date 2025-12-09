import { useState, useEffect } from "react";
import { useSchool } from "../../contexts/SchoolContext";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User, Calendar, Award, TrendingUp } from "lucide-react";

interface ProfessionalResultSheetProps {
  studentId: number;
  term: string;
  academicYear: string;
  classId: number;
  onPrint?: () => void;
  onDownload?: () => void;
}

interface SubjectScore {
  subject_name: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
  class_average: number;
  class_minimum: number;
  class_maximum: number;
  subject_teacher: string;
}

interface AffectiveDomain {
  attentiveness: number;
  honesty: number;
  punctuality: number;
  neatness: number;
  attentiveness_remark?: string;
  honesty_remark?: string;
  punctuality_remark?: string;
  neatness_remark?: string;
}

interface PsychomotorDomain {
  sports: number;
  handwork: number;
  drawing: number;
  music: number;
  sports_remark?: string;
  handwork_remark?: string;
  drawing_remark?: string;
  music_remark?: string;
}

export function ProfessionalResultSheet({
  studentId,
  term,
  academicYear,
  classId,
  onPrint,
  onDownload
}: ProfessionalResultSheetProps) {
  const { 
    students, 
    classes, 
    subjects, 
    teachers, 
    currentUser, 
    schoolSettings,
    compiledResults,
    scores,
    subjectAssignments,
    affectiveDomains,
    psychomotorDomains,
    loadScoresFromAPI,
    loadSubjectAssignmentsFromAPI,
    loadSubjectsFromAPI,
    loadAffectiveDomainsFromAPI,
    loadPsychomotorDomainsFromAPI
  } = useSchool();
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState<any>(null);
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  const [affectiveDomain, setAffectiveDomain] = useState<AffectiveDomain | null>(null);
  const [psychomotorDomain, setPsychomotorDomain] = useState<PsychomotorDomain | null>(null);

  // Get grade based on score
  const getGrade = (score: number): { grade: string; remark: string } => {
    if (score >= 80) return { grade: 'A', remark: 'Excellent' };
    if (score >= 70) return { grade: 'B', remark: 'Very Good' };
    if (score >= 60) return { grade: 'C', remark: 'Good' };
    if (score >= 50) return { grade: 'D', remark: 'Fair' };
    if (score >= 45) return { grade: 'E', remark: 'Poor' };
    return { grade: 'F', remark: 'Very Poor' };
  };

  // Load result data
  useEffect(() => {
    const loadResultData = async () => {
      try {
        setLoading(true);

        // Ensure all necessary data is loaded
        await Promise.all([
          scores.length === 0 && loadScoresFromAPI(),
          subjectAssignments.length === 0 && loadSubjectAssignmentsFromAPI(),
          subjects.length === 0 && loadSubjectsFromAPI(),
          affectiveDomains.length === 0 && loadAffectiveDomainsFromAPI(),
          psychomotorDomains.length === 0 && loadPsychomotorDomainsFromAPI()
        ]);

        // Get student information
        const student = students.find(s => s.id === studentId);
        const studentClass = classes.find(c => c.id === classId);

        if (!student || !studentClass) {
          setLoading(false);
          return;
        }

        // Find compiled result from context
        const compiledResult = compiledResults.find(cr => 
          cr.student_id === studentId && 
          cr.class_id === classId && 
          cr.term === term && 
          cr.academic_year === academicYear
        );

        if (compiledResult) {
          setResultData(compiledResult);

          // Process subject scores from context
          const studentScores = scores.filter(score => 
            score.student_id === studentId &&
            score.academic_year === academicYear &&
            score.term === term
          );

          // Enhance scores with subject information and class statistics
          const enhancedScores = studentScores.map(score => {
            const subjectAssignment = subjectAssignments.find(sa => sa.id === score.subject_assignment_id);
            const subject = subjectAssignment ? subjects.find(s => s.id === subjectAssignment.subject_id) : null;
            const teacher = subjectAssignment ? teachers.find(t => t.id === subjectAssignment.teacher_id) : null;

            // Calculate class statistics for this subject
            const classScores = scores.filter(s => {
              const assignment = subjectAssignments.find(sa => sa.id === s.subject_assignment_id);
              return assignment && 
                     assignment.subject_id === subjectAssignment?.subject_id &&
                     s.academic_year === academicYear &&
                     s.term === term &&
                     s.total > 0;
            });

            const validScores = classScores.map(cs => cs.total || 0);
            const classAverage = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
            const classMinimum = validScores.length > 0 ? Math.min(...validScores) : 0;
            const classMaximum = validScores.length > 0 ? Math.max(...validScores) : 0;

            const gradeInfo = getGrade(score.total || 0);

            return {
              subject_name: subject ? subject.name : 'Unknown Subject',
              ca1: score.ca1 || 0,
              ca2: score.ca2 || 0,
              exam: score.exam || 0,
              total: score.total || 0,
              grade: gradeInfo.grade,
              remark: gradeInfo.remark,
              class_average: parseFloat(classAverage.toFixed(2)),
              class_minimum: classMinimum,
              class_maximum: classMaximum,
              subject_teacher: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Not Assigned'
            };
          }).sort((a, b) => a.subject_name.localeCompare(b.subject_name));

          setSubjectScores(enhancedScores);

          // Find affective domain for this student
          const studentAffective = affectiveDomains.find(ad => 
            ad.student_id === studentId && 
            ad.class_id === classId && 
            ad.term === term && 
            ad.academic_year === academicYear
          );

          if (studentAffective) {
            setAffectiveDomain({
              attentiveness: studentAffective.attentiveness || 0,
              honesty: studentAffective.honesty || 0,
              punctuality: studentAffective.punctuality || 0,
              neatness: studentAffective.neatness || 0,
              attentiveness_remark: studentAffective.attentiveness_remark || '',
              honesty_remark: studentAffective.honesty_remark || '',
              punctuality_remark: studentAffective.punctuality_remark || '',
              neatness_remark: studentAffective.neatness_remark || ''
            });
          }

          // Find psychomotor domain for this student
          const studentPsychomotor = psychomotorDomains.find(pd => 
            pd.student_id === studentId && 
            pd.class_id === classId && 
            pd.term === term && 
            pd.academic_year === academicYear
          );

          if (studentPsychomotor) {
            setPsychomotorDomain({
              sports: studentPsychomotor.sports || 0,
              handwork: studentPsychomotor.handwork || 0,
              drawing: studentPsychomotor.drawing || 0,
              music: studentPsychomotor.music || 0,
              sports_remark: studentPsychomotor.sports_remark || '',
              handwork_remark: studentPsychomotor.handwork_remark || '',
              drawing_remark: studentPsychomotor.drawing_remark || '',
              music_remark: studentPsychomotor.music_remark || ''
            });
          }
        } else {
          // No compiled result found
          setResultData(null);
          setSubjectScores([]);
          setAffectiveDomain(null);
          setPsychomotorDomain(null);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading result data:', error);
        setLoading(false);
      }
    };

    if (studentId && classId && term && academicYear) {
      loadResultData();
    }
  }, [studentId, classId, term, academicYear, students, classes, compiledResults, scores, subjectAssignments, subjects, teachers, affectiveDomains, psychomotorDomains, loadScoresFromAPI, loadSubjectAssignmentsFromAPI, loadSubjectsFromAPI, loadAffectiveDomainsFromAPI, loadPsychomotorDomainsFromAPI]);

  const student = students.find(s => s.id === studentId);
  const studentClass = classes.find(c => c.id === classId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading result sheet...</p>
        </div>
      </div>
    );
  }

  if (!resultData || !student || !studentClass) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">No result data found for this student.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white max-w-4xl mx-auto shadow-lg" id="result-sheet">
      {/* School Header */}
      <div className="text-center border-b-4 border-blue-800 py-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">{schoolSettings.school_name || 'GRACELAND ACADEMY'}</h1>
        <p className="text-gray-600 mb-1">{schoolSettings.school_address || 'P.O. Box 1234, Your City, Country'}</p>
        <p className="text-gray-600 mb-1">Tel: {schoolSettings.school_phone || '+123-456-7890'} | Email: {schoolSettings.school_email || 'info@graceland.edu.ng'}</p>
        <p className="text-gray-600 italic">{schoolSettings.school_motto || 'Excellence in Education'}</p>
        <p className="text-gray-600">Website: www.graceland.edu.ng</p>
        
        <div className="mt-4 pt-4 border-t border-gray-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">END OF TERM RESULT SHEET</h2>
          <p className="text-lg text-gray-700">{term} - {academicYear}</p>
        </div>
      </div>

      {/* Student Biodata Section */}
      <div className="border-b-2 border-gray-300 p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Photo */}
          <div className="col-span-2">
            <div className="w-20 h-20 bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
              <Avatar className="w-full h-full">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                  {student.firstName[0]}{student.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          {/* Student Details */}
          <div className="col-span-5">
            <div className="space-y-1">
              <p><span className="font-semibold">Name:</span> {student.firstName} {student.lastName}</p>
              <p><span className="font-semibold">Admission No:</span> {student.admissionNumber}</p>
              <p><span className="font-semibold">Class:</span> {studentClass.name}</p>
              <p><span className="font-semibold">Sex:</span> {student.gender || 'N/A'}</p>
            </div>
          </div>
          
          {/* Term/Session Details */}
          <div className="col-span-5">
            <div className="space-y-1">
              <p><span className="font-semibold">Term:</span> {term}</p>
              <p><span className="font-semibold">Session:</span> {academicYear}</p>
              <p><span className="font-semibold">No. in Class:</span> {resultData.total_students || 0}</p>
              <p><span className="font-semibold">Position:</span> {resultData.position || 0} / {resultData.total_students || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Scores Table */}
      <div className="p-4">
        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-2 py-1 text-left text-sm font-bold">SUBJECTS</th>
              <th className="border border-black px-2 py-1 text-center text-sm font-bold">1ST CA</th>
              <th className="border border-black px-2 py-1 text-center text-sm font-bold">2ND CA</th>
              <th className="border border-black px-2 py-1 text-center text-sm font-bold">EXAMS</th>
              <th className="border border-black px-2 py-1 text-center text-sm font-bold">TOTAL</th>
              <th className="border border-black px-2 py-1 text-center text-sm font-bold">CLASS AVG</th>
              <th className="border border-black px-2 py-1 text-center text-sm font-bold">GRADE</th>
              <th className="border border-black px-2 py-1 text-center text-sm font-bold">REMARK</th>
              <th className="border border-black px-2 py-1 text-center text-sm font-bold">CLASS MIN</th>
              <th className="border border-black px-2 py-1 text-center text-sm font-bold">CLASS MAX</th>
              <th className="border border-black px-2 py-1 text-center text-sm font-bold">SUBJECT TEACHER</th>
            </tr>
          </thead>
          <tbody>
            {subjectScores.map((score, index) => (
              <tr key={index} className="text-sm">
                <td className="border border-black px-2 py-1 font-medium">{score.subject_name}</td>
                <td className="border border-black px-2 py-1 text-center">{score.ca1}</td>
                <td className="border border-black px-2 py-1 text-center">{score.ca2}</td>
                <td className="border border-black px-2 py-1 text-center">{score.exam}</td>
                <td className="border border-black px-2 py-1 text-center font-bold">{score.total}</td>
                <td className="border border-black px-2 py-1 text-center">{score.class_average.toFixed(1)}</td>
                <td className="border border-black px-2 py-1 text-center font-bold">{score.grade}</td>
                <td className="border border-black px-2 py-1 text-center">{score.remark}</td>
                <td className="border border-black px-2 py-1 text-center">{score.class_minimum}</td>
                <td className="border border-black px-2 py-1 text-center">{score.class_maximum}</td>
                <td className="border border-black px-2 py-1 text-center text-xs">{score.subject_teacher}</td>
              </tr>
            ))}
            
            {/* Summary Row */}
            <tr className="bg-gray-100 font-bold">
              <td className="border border-black px-2 py-1">TOTAL SCORE</td>
              <td className="border border-black px-2 py-1 text-center">
                {subjectScores.reduce((sum, s) => sum + s.ca1, 0)}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {subjectScores.reduce((sum, s) => sum + s.ca2, 0)}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {subjectScores.reduce((sum, s) => sum + s.exam, 0)}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {resultData.total_score || 0}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {(subjectScores.reduce((sum, s) => sum + s.class_average, 0) / subjectScores.length).toFixed(1)}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {getGrade(resultData.average_score || 0).grade}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {getGrade(resultData.average_score || 0).remark}
              </td>
              <td className="border border-black px-2 py-1 text-center" colSpan={2}></td>
              <td className="border border-black px-2 py-1 text-center"></td>
            </tr>
            
            {/* Student Average Row */}
            <tr className="bg-gray-50">
              <td className="border border-black px-2 py-1 font-bold">STUDENT AVERAGE</td>
              <td className="border border-black px-2 py-1 text-center" colSpan={3}></td>
              <td className="border border-black px-2 py-1 text-center font-bold">
                {(resultData.total_score || 0) / subjectScores.length}
              </td>
              <td className="border border-black px-2 py-1 text-center font-bold">
                {resultData.class_average || 0}
              </td>
              <td className="border border-black px-2 py-1 text-center" colSpan={5}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comments Section */}
      <div className="border-b-2 border-gray-300 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold text-center mb-2">CLASS TEACHER'S COMMENT</h3>
            <div className="border border-gray-400 p-2 h-20">
              <p className="text-sm">{resultData.class_teacher_comment || 'No comment provided'}</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-center mb-2">PRINCIPAL'S COMMENT</h3>
            <div className="border border-gray-400 p-2 h-20">
              <p className="text-sm">{schoolSettings?.principal_comment || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Affective Areas Table */}
      <div className="border-b-2 border-gray-300 p-4">
        <h3 className="font-bold text-center mb-3">AFFECTIVE AREAS</h3>
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-4 py-1 text-left text-sm font-bold">AREAS</th>
              <th className="border border-black px-4 py-1 text-center text-sm font-bold">RATING (1-5)</th>
              <th className="border border-black px-4 py-1 text-left text-sm font-bold">COMMENTS</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr>
              <td className="border border-black px-4 py-1">Attentiveness</td>
              <td className="border border-black px-4 py-1 text-center">{affectiveDomain?.attentiveness || '-'}</td>
              <td className="border border-black px-4 py-1">{affectiveDomain?.attentiveness_remark || ''}</td>
            </tr>
            <tr>
              <td className="border border-black px-4 py-1">Honesty</td>
              <td className="border border-black px-4 py-1 text-center">{affectiveDomain?.honesty || '-'}</td>
              <td className="border border-black px-4 py-1">{affectiveDomain?.honesty_remark || ''}</td>
            </tr>
            <tr>
              <td className="border border-black px-4 py-1">Punctuality</td>
              <td className="border border-black px-4 py-1 text-center">{affectiveDomain?.punctuality || '-'}</td>
              <td className="border border-black px-4 py-1">{affectiveDomain?.punctuality_remark || ''}</td>
            </tr>
            <tr>
              <td className="border border-black px-4 py-1">Neatness</td>
              <td className="border border-black px-4 py-1 text-center">{affectiveDomain?.neatness || '-'}</td>
              <td className="border border-black px-4 py-1">{affectiveDomain?.neatness_remark || ''}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Psychomotor Skills Table */}
      <div className="border-b-2 border-gray-300 p-4">
        <h3 className="font-bold text-center mb-3">PSYCHOMOTOR SKILLS</h3>
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-4 py-1 text-left text-sm font-bold">SKILLS</th>
              <th className="border border-black px-4 py-1 text-center text-sm font-bold">RATING (1-5)</th>
              <th className="border border-black px-4 py-1 text-left text-sm font-bold">COMMENTS</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr>
              <td className="border border-black px-4 py-1">Sports</td>
              <td className="border border-black px-4 py-1 text-center">{psychomotorDomain?.sports || '-'}</td>
              <td className="border border-black px-4 py-1">{psychomotorDomain?.sports_remark || ''}</td>
            </tr>
            <tr>
              <td className="border border-black px-4 py-1">Handwork</td>
              <td className="border border-black px-4 py-1 text-center">{psychomotorDomain?.handwork || '-'}</td>
              <td className="border border-black px-4 py-1">{psychomotorDomain?.handwork_remark || ''}</td>
            </tr>
            <tr>
              <td className="border border-black px-4 py-1">Drawing</td>
              <td className="border border-black px-4 py-1 text-center">{psychomotorDomain?.drawing || '-'}</td>
              <td className="border border-black px-4 py-1">{psychomotorDomain?.drawing_remark || ''}</td>
            </tr>
            <tr>
              <td className="border border-black px-4 py-1">Music</td>
              <td className="border border-black px-4 py-1 text-center">{psychomotorDomain?.music || '-'}</td>
              <td className="border border-black px-4 py-1">{psychomotorDomain?.music_remark || ''}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Attendance Summary */}
      <div className="border-b-2 border-gray-300 p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="font-bold">Times Present</p>
            <p className="text-2xl font-bold text-green-600">{resultData.times_present || 0}</p>
          </div>
          <div>
            <p className="font-bold">Times Absent</p>
            <p className="text-2xl font-bold text-red-600">{resultData.times_absent || 0}</p>
          </div>
          <div>
            <p className="font-bold">Times Late</p>
            <p className="text-2xl font-bold text-yellow-600">{resultData.times_late || 0}</p>
          </div>
          <div>
            <p className="font-bold">Total Days</p>
            <p className="text-2xl font-bold text-blue-600">{resultData.total_attendance_days || 0}</p>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="border-b-2 border-gray-400 mb-2 pb-8">
              <p className="text-sm text-gray-600">Class Teacher's Signature</p>
            </div>
            <p className="text-sm font-semibold">{resultData.class_teacher_name || '_________________'}</p>
            <p className="text-xs text-gray-500">Date: _______________</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-gray-400 mb-2 pb-8">
              <p className="text-sm text-gray-600">Principal's Signature</p>
              {schoolSettings?.principal_signature && (
                <img src={schoolSettings.principal_signature} alt="Principal Signature" className="max-h-12 mx-auto" />
              )}
            </div>
            <p className="text-sm font-semibold">{schoolSettings?.principal_name || '_________________'}</p>
            <p className="text-xs text-gray-500">Date: _______________</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-gray-400 mb-2 pb-8">
              <p className="text-sm text-gray-600">Next Term Begins</p>
            </div>
            <p className="text-sm font-semibold">{resultData.next_term_begin || '_________________'}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t-2 border-gray-300 flex justify-center space-x-4">
        <Button onClick={onPrint} className="bg-green-600 hover:bg-green-700 text-white">
          Print Result Sheet
        </Button>
        <Button onClick={onDownload} className="bg-blue-600 hover:bg-blue-700 text-white">
          Download PDF
        </Button>
      </div>
    </div>
  );
}

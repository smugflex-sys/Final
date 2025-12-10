import { forwardRef } from "react";
import { useSchool } from "../contexts/SchoolContext";

interface StudentResultSheetProps {
  studentId: number;
  term: string;
  academicYear: string;
  className?: string;
}

export const StudentResultSheet = forwardRef<HTMLDivElement, StudentResultSheetProps>(
  ({ studentId, term, academicYear, className = "" }, ref) => {
    const {
      students,
      classes,
      scores,
      affectiveDomains,
      psychomotorDomains,
      compiledResults,
      subjectAssignments,
      schoolSettings,
      subjectRegistrations,
      teachers,
    } = useSchool();

    // Get student
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;

    // Get compiled result
    const compiledResult = compiledResults.find(
      (r) =>
        r.student_id === studentId &&
        r.term === term &&
        r.academic_year === academicYear &&
        r.status === "Approved"
    );

    if (!compiledResult) {
      return (
        <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
          <p className="text-gray-600">No approved result available for this term</p>
        </div>
      );
    }

    // Get class info
    const studentClass = classes.find((c) => c.id === student.class_id);

    // Get all registered subjects for this student's class and term
    const registeredSubjects = subjectRegistrations.filter(
      (sr: any) => sr.class_id === student.class_id &&
            sr.term === term &&
            sr.academic_year === academicYear &&
            sr.status === 'Active'
    );

    // Get all scores for this student and term, but only include registered subjects
    const allStudentScores = compiledResult.scores || [];
    const studentScores = allStudentScores.filter(score => 
      registeredSubjects.some((rs: any) => 
        subjectAssignments.some(sa => 
          sa.id === score.subject_assignment_id && 
          sa.subject_id === rs.subject_id
        )
      )
    );

    // Get affective and psychomotor domains for this student
    const affectiveDomain = affectiveDomains.find(ad => 
      ad.student_id === studentId && 
      ad.term === term && 
      ad.academic_year === academicYear
    );
    const psychomotorDomain = psychomotorDomains.find(pd => 
      pd.student_id === studentId && 
      pd.term === term && 
      pd.academic_year === academicYear
    );
    const totalScore = studentScores.reduce((sum, s) => sum + s.total, 0);
    const studentAverage = (studentScores || []).length > 0
      ? Math.round((totalScore / (studentScores || []).length) * 100) / 100
      : 0;

    // Get affective and psychomotor
    const affective = compiledResult.affective;
    const psychomotor = compiledResult.psychomotor;

    // Format dates
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const getRatingRemark = (value: number): string => {
      if (value === 5) return "Excellent";
      if (value === 4) return "Very Good";
      if (value === 3) return "Good";
      if (value === 2) return "Fair";
      if (value === 1) return "Poor";
      return "";
    };

    // Calculate next term dates
    const getNextTermBegin = () => {
      if (term === "First Term") return "15-SEP-2025";
      if (term === "Second Term") return "08-JAN-2026";
      if (term === "Third Term") return "15-APR-2026";
      return "";
    };

    return (
      <div ref={ref} className={`bg-white p-8 ${className}`} style={{ fontFamily: "Arial, sans-serif" }}>
        {/* Header Section */}
        <div className="text-center mb-6 border-b-2 border-green-600 pb-4">
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
          </div>
          <h1 className="text-green-600 font-bold text-2xl mb-1">
            {schoolSettings?.school_name || 'GRACELAND ROYAL ACADEMY'}
          </h1>
          <p className="text-sm text-gray-700 mb-1">
            {schoolSettings?.school_address || 'BEHIND HAKIM PALACE OPPOSITE NNPC DEPOT TUNFURE, GOMBE'}
          </p>
          <p className="text-sm text-gray-600">
            {schoolSettings?.school_email || 'gracelandroyalacademy05@gmail.com'}
          </p>
        </div>

        {/* Student Info Section */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* Student Photo */}
          <div className="col-span-2">
            <div className="w-24 h-28 border-2 border-gray-300 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
              {student.photo_url ? (
                <img
                  src={student.photo_url}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl text-gray-400">👤</span>
              )}
            </div>
          </div>

          {/* Student Details - Left Column */}
          <div className="col-span-5">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 font-medium">NAME:</td>
                  <td className="py-1 font-bold">
                    {student.firstName.toUpperCase()} {student.lastName.toUpperCase()}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">ADM NO:</td>
                  <td className="py-1">{student.admissionNumber}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">GENDER:</td>
                  <td className="py-1">{student.gender.toUpperCase()}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">AGE:</td>
                  <td className="py-1">{student.date_of_birth ? new Date().getFullYear() - new Date(student.date_of_birth).getFullYear() : 'N/A'}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">DOB:</td>
                  <td className="py-1">{formatDate(student.date_of_birth)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Student Details - Right Column */}
          <div className="col-span-5">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 font-medium">SESSION:</td>
                  <td className="py-1">{academicYear}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">TERM:</td>
                  <td className="py-1 uppercase">{term}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">CLASS:</td>
                  <td className="py-1">{studentClass?.name || student.className}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">NO. OF TIMES PRESENT:</td>
                  <td className="py-1">
                    Attendance: {compiledResult.times_present || 0}/{compiledResult.total_attendance_days || 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="col-span-12 text-right text-sm">
            <span className="font-medium">NO. IN CLASS:</span>{" "}
            <span className="font-bold">{compiledResult.total_students}</span>
            <br />
            <span className="font-medium">TERM END:</span>{" "}
            <span>{formatDate(compiledResult.term_end) || "25-JUL-2025"}</span>
            <br />
            <span className="font-medium">NEXT TERM BEGIN:</span>{" "}
            <span>{compiledResult.next_term_begin || getNextTermBegin()}</span>
          </div>
        </div>

        {/* Result Table Header */}
        <div className="text-center mb-2">
          <h2 className="font-bold text-sm uppercase">{term} Result Sheet</h2>
        </div>

        {/* Main Result Table */}
        <div className="mb-6 border border-gray-800">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-800">
                <th className="border-r border-gray-800 p-1 text-left" style={{ width: "3%" }}>
                  S/N
                </th>
                <th className="border-r border-gray-800 p-1 text-left" style={{ width: "15%" }}>
                  SUBJECT
                </th>
                <th className="border-r border-gray-800 p-1 text-center" style={{ width: "5%" }}>
                  1st CA
                  <br />
                  <span className="font-normal">20</span>
                </th>
                <th className="border-r border-gray-800 p-1 text-center" style={{ width: "5%" }}>
                  2nd CA
                  <br />
                  <span className="font-normal">20</span>
                </th>
                <th className="border-r border-gray-800 p-1 text-center" style={{ width: "5%" }}>
                  Exams
                  <br />
                  <span className="font-normal">60</span>
                </th>
                <th className="border-r border-gray-800 p-1 text-center" style={{ width: "6%" }}>
                  TOTAL
                  <br />
                  <span className="font-normal">100</span>
                </th>
                <th className="border-r border-gray-800 p-1 text-center" style={{ width: "6%" }}>
                  CLASS AVG
                  <br />
                  <span className="font-normal">100%</span>
                </th>
                <th className="border-r border-gray-800 p-1 text-center" style={{ width: "5%" }}>
                  GRADE
                </th>
                <th className="border-r border-gray-800 p-1 text-center" style={{ width: "10%" }}>
                  REMARK
                </th>
                <th className="border-r border-gray-800 p-1 text-center" style={{ width: "6%" }}>
                  CLASS MIN
                  <br />
                  <span className="font-normal">0</span>
                </th>
                <th className="border-r border-gray-800 p-1 text-center" style={{ width: "6%" }}>
                  CLASS MAX
                  <br />
                  <span className="font-normal">100</span>
                </th>
                <th className="border-gray-800 p-1 text-center" style={{ width: "18%" }}>
                  SUBJECT
                  <br />
                  TEACHERS
                </th>
              </tr>
            </thead>
            <tbody>
              {studentScores.map((score, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="border-r border-gray-800 p-1 text-center">{index + 1}</td>
                  <td className="border-r border-gray-800 p-1 font-medium">
                    {score.subject_name?.toUpperCase() || 'UNKNOWN'}
                  </td>
                  <td className="border-r border-gray-800 p-1 text-center">{score.ca1}</td>
                  <td className="border-r border-gray-800 p-1 text-center">{score.ca2}</td>
                  <td className="border-r border-gray-800 p-1 text-center">{score.exam}</td>
                  <td className="border-r border-gray-800 p-1 text-center font-bold">
                    {score.total}
                  </td>
                  <td className="border-r border-gray-800 p-1 text-center">
                    {score.class_average}
                  </td>
                  <td className="border-r border-gray-800 p-1 text-center font-bold">
                    {score.grade}
                  </td>
                  <td className="border-r border-gray-800 p-1 text-center">{score.remark}</td>
                  <td className="border-r border-gray-800 p-1 text-center">
                    {score.class_min}
                  </td>
                  <td className="border-r border-gray-800 p-1 text-center">
                    {score.class_max}
                  </td>
                  <td className="border-gray-800 p-1 text-center">
                    {score.entered_by ? (() => {
                      const teacher = teachers.find(t => t.id === score.entered_by);
                      return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';
                    })() : 'N/A'}
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-gray-100 font-bold border-b border-gray-800">
                <td colSpan={5} className="border-r border-gray-800 p-1">
                  TOTAL SCORE: <span className="ml-2">{totalScore.toFixed(1)}</span>
                </td>
                <td colSpan={2} className="border-r border-gray-800 p-1">
                  STUDENT AVERAGE: <span className="ml-2">{studentAverage}</span>
                </td>
                <td colSpan={3} className="border-r border-gray-800 p-1">
                  CLASS AVERAGE: <span className="ml-2">{compiledResult.class_average.toFixed(1)}</span>
                </td>
                <td colSpan={2} className="border-gray-800 p-1">
                  STUDENT POSITION:{" "}
                  <span className="ml-2">
                    {compiledResult.position}
                    {compiledResult.position === 1
                      ? "st"
                      : compiledResult.position === 2
                      ? "nd"
                      : compiledResult.position === 3
                      ? "rd"
                      : "th"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Comments Section */}
        <div className="mb-6 border border-gray-800">
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="border-r border-gray-800 p-2 font-bold bg-gray-100" style={{ width: "20%" }}>
                  CLASS TEACHER
                </td>
                <td className="p-2 font-medium">{compiledResult.class_teacher_name}</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="border-r border-gray-800 p-2 font-bold bg-gray-100">
                  CLASS TEACHER'S COMMENT
                </td>
                <td className="p-2">{compiledResult.class_teacher_comment}</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="border-r border-gray-800 p-2 font-bold bg-gray-100">
                  PRINCIPAL
                </td>
                <td className="p-2 font-medium">{compiledResult.principal_name || "PRINCIPAL"}</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="border-r border-gray-800 p-2 font-bold bg-gray-100">
                  PRINCIPAL'S COMMENT
                </td>
                <td className="p-2">{compiledResult.principal_comment || "Keep up the good work."}</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="border-r border-gray-800 p-2 font-bold bg-gray-100">
                  PRINCIPAL'S SIGNATURE
                </td>
                <td className="p-2">
                  {compiledResult.principal_signature ? (
                    <img
                      src={compiledResult.principal_signature}
                      alt="Signature"
                      className="h-8"
                    />
                  ) : (
                    <div className="h-8 flex items-center">
                      <span className="text-gray-400 italic">_________________</span>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Affective and Psychomotor Section */}
        <div className="grid grid-cols-2 gap-4">
          {/* Affective Areas */}
          <div className="border border-gray-800">
            <div className="bg-gray-100 border-b border-gray-800 p-2 text-center font-bold text-xs">
              AFFECTIVE AREAS
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-50">
                  <th className="border-r border-gray-800 p-1 text-left">
                    PERSONAL & SOCIAL QUALITIES
                  </th>
                  <th className="border-r border-gray-800 p-1 text-center" style={{ width: "15%" }}>
                    SCORES
                  </th>
                  <th className="p-1 text-center" style={{ width: "25%" }}>
                    REMARK
                  </th>
                </tr>
              </thead>
              <tbody>
                {affective && (
                  <>
                    <tr className="border-b border-gray-800">
                      <td className="border-r border-gray-800 p-1">ATTENTIVENESS</td>
                      <td className="border-r border-gray-800 p-1 text-center">
                        {affective.attentiveness}
                      </td>
                      <td className="p-1 text-center">
                        {getRatingRemark(affective.attentiveness)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="border-r border-gray-800 p-1">HONESTY</td>
                      <td className="border-r border-gray-800 p-1 text-center">
                        {affective.honesty}
                      </td>
                      <td className="p-1 text-center">{getRatingRemark(affective.honesty)}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="border-r border-gray-800 p-1">NEATNESS</td>
                      <td className="border-r border-gray-800 p-1 text-center">
                        {affective.neatness}
                      </td>
                      <td className="p-1 text-center">{getRatingRemark(affective.neatness)}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="border-r border-gray-800 p-1">OBEDIENCE</td>
                      <td className="border-r border-gray-800 p-1 text-center">
                        {affective.obedience}
                      </td>
                      <td className="p-1 text-center">{getRatingRemark(affective.obedience)}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="border-r border-gray-800 p-1">SENSE OF RESPONSIBILITY</td>
                      <td className="border-r border-gray-800 p-1 text-center">
                        {affective.sense_of_responsibility}
                      </td>
                      <td className="p-1 text-center">
                        {getRatingRemark(affective.sense_of_responsibility)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Psychomotor Skills */}
          <div className="border border-gray-800">
            <div className="bg-gray-100 border-b border-gray-800 p-2 text-center font-bold text-xs">
              PSYCHOMOTOR SKILLS
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-50">
                  <th className="border-r border-gray-800 p-1 text-left">
                    PERSONAL & SOCIAL QUALITIES
                  </th>
                  <th className="border-r border-gray-800 p-1 text-center" style={{ width: "15%" }}>
                    SCORES
                  </th>
                  <th className="p-1 text-center" style={{ width: "25%" }}>
                    REMARK
                  </th>
                </tr>
              </thead>
              <tbody>
                {psychomotor && (
                  <>
                    <tr className="border-b border-gray-800">
                      <td className="border-r border-gray-800 p-1">ATTENTION TO DIRECTION</td>
                      <td className="border-r border-gray-800 p-1 text-center">
                        {psychomotor.attention_to_direction}
                      </td>
                      <td className="p-1 text-center">
                        {getRatingRemark(psychomotor.attention_to_direction)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="border-r border-gray-800 p-1">CONSIDERATE OF OTHERS</td>
                      <td className="border-r border-gray-800 p-1 text-center">
                        {psychomotor.considerate_of_others}
                      </td>
                      <td className="p-1 text-center">
                        {getRatingRemark(psychomotor.considerate_of_others)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="border-r border-gray-800 p-1">HANDWRITING</td>
                      <td className="border-r border-gray-800 p-1 text-center">
                        {psychomotor.handwriting}
                      </td>
                      <td className="p-1 text-center">
                        {getRatingRemark(psychomotor.handwriting)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="border-r border-gray-800 p-1">SPORTS</td>
                      <td className="border-r border-gray-800 p-1 text-center">
                        {psychomotor.sports}
                      </td>
                      <td className="p-1 text-center">{getRatingRemark(psychomotor.sports)}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="border-r border-gray-800 p-1">VERBAL FLUENCY</td>
                      <td className="border-r border-gray-800 p-1 text-center">
                        {psychomotor.verbal_fluency}
                      </td>
                      <td className="p-1 text-center">
                        {getRatingRemark(psychomotor.verbal_fluency)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="border-r border-gray-800 p-1">WORKS WELL INDEPENDENTLY</td>
                      <td className="border-r border-gray-800 p-1 text-center">
                        {psychomotor.works_well_independently}
                      </td>
                      <td className="p-1 text-center">
                        {getRatingRemark(psychomotor.works_well_independently)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer/Watermark */}
        <div className="text-center text-xs text-gray-500 mt-4">
          <p className="italic">{schoolSettings?.school_motto || 'Wisdom & Illumination'}</p>
        </div>
      </div>
    );
  }
);

StudentResultSheet.displayName = "StudentResultSheet";

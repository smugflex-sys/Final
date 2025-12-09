 import { useState, useMemo, useCallback, useEffect } from "react";
import { FileText, Send, Eye, Download, AlertCircle, CheckCircle, Edit, BookOpen, Users, ChevronLeft, Award, RefreshCw, ArrowLeft, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
import { useSchool } from "../../contexts/SchoolContext";
import { toast } from "sonner";

// Auto-comment generation system
const commentTemplates = {
  excellent: [
    "Outstanding performance! Shows exceptional understanding and mastery of all subjects.",
    "Brilliant academic achievement. Maintains excellent standards across all areas.",
    "Exceptional student who demonstrates outstanding intellectual capacity and diligence.",
    "Remarkable performance! A true academic star with exemplary conduct.",
    "Outstanding achievement! Consistently exceeds expectations in all subjects.",
    "Exceptional work! Demonstrates superior analytical thinking and problem-solving skills.",
    "Brilliant results! Shows remarkable dedication to academic excellence.",
    "Outstanding scholar! Maintains highest standards in all academic pursuits.",
    "Exceptional performance! A model student with outstanding intellectual abilities.",
    "Brilliant achievement! Demonstrates exceptional mastery of course material."
  ],
  veryGood: [
    "Very good performance. Shows strong understanding and consistent effort.",
    "Commendable academic achievement with room for further improvement.",
    "Impressive performance! Demonstrates strong analytical skills and dedication.",
    "Very good result! Shows promise and potential for continued excellence.",
    "Strong academic performance with consistent effort and good understanding.",
    "Excellent work! Displays solid grasp of concepts and good analytical abilities.",
    "Commendable results! Shows strong academic capabilities and dedication.",
    "Very good achievement! Demonstrates consistent effort and understanding.",
    "Strong performance! Shows good command of subject matter and analytical skills.",
    "Impressive work! Displays academic potential and consistent dedication."
  ],
  good: [
    "Good performance. Shows satisfactory understanding and steady progress.",
    "Satisfactory academic achievement with areas for improvement.",
    "Good effort shown. Consistent progress noted throughout the term.",
    "Decent performance! With more effort, could achieve much higher results.",
    "Fair performance showing understanding of core concepts.",
    "Good work! Demonstrates adequate understanding and room for growth.",
    "Satisfactory results! Shows steady progress and basic comprehension.",
    "Decent achievement! Could benefit from additional study and practice.",
    "Fair performance! Shows understanding of fundamental concepts.",
    "Good effort! Demonstrates potential for improvement with dedicated work."
  ],
  average: [
    "Average performance. Needs to put in more effort to improve.",
    "Satisfactory but needs improvement in several areas.",
    "Fair performance. Could benefit from additional study and practice.",
    "Average result. More dedication needed for better performance.",
    "Moderate performance showing need for increased effort.",
    "Fair work! Requires more dedication and consistent study habits.",
    "Average results! Needs to focus more on academic responsibilities.",
    "Satisfactory performance! Could improve with better study methods.",
    "Moderate achievement! Requires increased effort and attention.",
    "Fair work! Needs to develop better study habits and consistency."
  ],
  belowAverage: [
    "Below average performance. Requires significant improvement and attention.",
    "Needs considerable improvement in academic performance and attitude.",
    "Poor performance. Must show more commitment to studies.",
    "Below expected standards. Immediate improvement required.",
    "Unsatisfactory performance requiring urgent attention and support.",
    "Weak performance! Needs serious attention to academic responsibilities.",
    "Below average results! Requires immediate intervention and support.",
    "Poor work! Must demonstrate greater commitment to learning.",
    "Unsatisfactory achievement! Needs comprehensive academic support.",
    "Weak performance! Requires urgent attention to study habits."
  ],
  poor: [
    "Poor performance. Requires immediate intervention and support.",
    "Very poor academic result. Needs serious attention to studies.",
    "Unsatisfactory performance in all aspects. Major improvement needed.",
    "Extremely poor result. Requires comprehensive academic support.",
    "Failing performance. Must seek help and show dramatic improvement.",
    "Very weak performance! Needs immediate academic intervention.",
    "Extremely poor results! Requires comprehensive support and guidance.",
    "Failing work! Must demonstrate complete commitment to improvement.",
    "Very poor achievement! Needs urgent and sustained academic support.",
    "Extremely weak performance! Requires immediate intervention and dedication."
  ]
};

const positionComments = {
  top: [
    "Outstanding class position! Shows exceptional academic ability.",
    "Excellent class ranking! Among the best performers in class.",
    "Brilliant class position! Demonstrates superior academic excellence.",
    "Exceptional ranking! A true academic leader in the class.",
    "Outstanding achievement! Maintains highest academic standards.",
    "Excellent class standing! Shows remarkable intellectual capabilities.",
    "Top position! Demonstrates exceptional mastery of all subjects.",
    "Brilliant ranking! An exemplary student with outstanding abilities."
  ],
  upper: [
    "Good class position. Shows strong academic performance.",
    "Commendable class ranking. Above average performance.",
    "Strong class position! Demonstrates solid academic abilities.",
    "Good ranking! Shows consistent effort and understanding.",
    "Commendable standing! Above average academic achievement.",
    "Strong performance! Well-positioned among high achievers.",
    "Good class ranking! Displays solid academic capabilities.",
    "Commendable position! Shows promise for continued excellence."
  ],
  middle: [
    "Average class position. Room for improvement in ranking.",
    "Fair class position. Could work towards higher ranking.",
    "Moderate class standing. Needs more effort to improve position.",
    "Average ranking! Potential for better academic performance.",
    "Fair position! Could benefit from increased dedication.",
    "Middle ranking! Room for improvement with consistent effort.",
    "Average standing! Needs focus to achieve higher position.",
    "Moderate position! Can improve with better study habits."
  ],
  lower: [
    "Below average class position. Needs significant improvement.",
    "Poor class ranking. Must work harder to improve position.",
    "Low class position. Requires immediate attention to studies.",
    "Weak ranking! Needs substantial improvement in performance.",
    "Poor standing! Must demonstrate greater academic commitment.",
    "Low position! Requires urgent intervention and support.",
    "Weak ranking! Needs comprehensive academic improvement.",
    "Poor position! Must show dramatic improvement in studies."
  ]
};

const constructiveFeedback = {
  excellent: [
    "Continue maintaining excellent standards. Consider advanced studies.",
    "Outstanding work! Explore leadership roles and academic competitions.",
    "Exceptional performance! Consider mentoring other students.",
    "Brilliant achievement! Pursue advanced academic challenges.",
    "Excellent results! Consider participating in academic enrichment programs."
  ],
  veryGood: [
    "Strong performance! With extra effort, could reach excellence.",
    "Very good work! Focus on weak areas to achieve outstanding results.",
    "Commendable achievement! Additional practice could lead to excellence.",
    "Strong results! Target specific areas for improvement.",
    "Very good performance! Consistent effort will lead to top ranking."
  ],
  good: [
    "Good effort! Increase study time for better results.",
    "Satisfactory work! Focus on understanding concepts deeply.",
    "Good performance! Develop better study habits and consistency.",
    "Decent achievement! Seek help in challenging subjects.",
    "Fair work! More dedication will lead to significant improvement."
  ],
  average: [
    "Needs improvement! Develop consistent study routine.",
    "Fair performance! Seek additional help from teachers.",
    "Average work! Focus on fundamentals and practice regularly.",
    "Satisfactory results! Increase study time and concentration.",
    "Moderate achievement! Join study groups and seek tutoring."
  ],
  belowAverage: [
    "Requires immediate attention! Seek help from teachers and tutors.",
    "Poor performance! Develop basic study skills and habits.",
    "Below average work! Attend extra classes and seek counseling.",
    "Weak achievement! Requires comprehensive academic support.",
    "Unsatisfactory results! Must change study approach completely."
  ],
  poor: [
    "Critical situation! Requires intensive academic intervention.",
    "Very poor work! Must seek comprehensive support immediately.",
    "Failing performance! Requires one-on-one tutoring and counseling.",
    "Extremely weak results! Must consider academic probation.",
    "Critical achievement! Requires complete academic rehabilitation."
  ]
};

function generateAutoComment(averageScore: number, position: number, totalStudents: number): string {
  let comments: string[] = [];
  
  // Academic performance comment based on average score
  let academicComment = "";
  let performanceLevel = "";
  
  if (averageScore >= 80) {
    academicComment = commentTemplates.excellent[Math.floor(Math.random() * commentTemplates.excellent.length)];
    performanceLevel = "excellent";
  } else if (averageScore >= 70) {
    academicComment = commentTemplates.veryGood[Math.floor(Math.random() * commentTemplates.veryGood.length)];
    performanceLevel = "veryGood";
  } else if (averageScore >= 60) {
    academicComment = commentTemplates.good[Math.floor(Math.random() * commentTemplates.good.length)];
    performanceLevel = "good";
  } else if (averageScore >= 50) {
    academicComment = commentTemplates.average[Math.floor(Math.random() * commentTemplates.average.length)];
    performanceLevel = "average";
  } else if (averageScore >= 40) {
    academicComment = commentTemplates.belowAverage[Math.floor(Math.random() * commentTemplates.belowAverage.length)];
    performanceLevel = "belowAverage";
  } else {
    academicComment = commentTemplates.poor[Math.floor(Math.random() * commentTemplates.poor.length)];
    performanceLevel = "poor";
  }
  
  comments.push(academicComment);
  
  // Position comment
  const positionPercentage = (position / totalStudents) * 100;
  let positionComment = "";
  let positionLevel = "";
  
  if (positionPercentage <= 10) {
    positionComment = positionComments.top[Math.floor(Math.random() * positionComments.top.length)];
    positionLevel = "top";
  } else if (positionPercentage <= 30) {
    positionComment = positionComments.upper[Math.floor(Math.random() * positionComments.upper.length)];
    positionLevel = "upper";
  } else if (positionPercentage <= 70) {
    positionComment = positionComments.middle[Math.floor(Math.random() * positionComments.middle.length)];
    positionLevel = "middle";
  } else {
    positionComment = positionComments.lower[Math.floor(Math.random() * positionComments.lower.length)];
    positionLevel = "lower";
  }
  
  if (positionComment) {
    comments.push(positionComment);
  }
  
  // Constructive feedback based on performance level
  const feedbackOptions = constructiveFeedback[performanceLevel as keyof typeof constructiveFeedback];
  if (feedbackOptions && feedbackOptions.length > 0) {
    const feedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
    comments.push(feedback);
  }
  
  return comments.join(" ");
}

function generateMultipleCommentOptions(averageScore: number, position: number, totalStudents: number): string[] {
  const options: string[] = [];
  
  // Generate 5 different comment options
  for (let i = 0; i < 5; i++) {
    options.push(generateAutoComment(averageScore, position, totalStudents));
  }
  
  // Ensure all options are unique
  const uniqueOptions = [...new Set(options)];
  
  // If we don't have enough unique options, add some variations
  while (uniqueOptions.length < 3) {
    uniqueOptions.push(generateAutoComment(averageScore, position, totalStudents));
  }
  
  return uniqueOptions.slice(0, 5);
}

function generatePrincipalComment(averageScore: number): string {
  if (averageScore >= 80) {
    return "Exceptional performance! Keep up the excellent work. You are a role model for others.";
  } else if (averageScore >= 70) {
    return "Very good performance! Continue to work hard and aim for excellence.";
  } else if (averageScore >= 60) {
    return "Good performance! There is room for improvement. Stay focused and dedicated.";
  } else if (averageScore >= 50) {
    return "Fair performance. More effort and dedication needed for better results.";
  } else {
    return "Poor performance. Requires immediate attention and significant improvement.";
  }
}

function calculateGrade(averageScore: number): string {
  if (averageScore >= 80) return 'A';
  if (averageScore >= 70) return 'B';
  if (averageScore >= 60) return 'C';
  if (averageScore >= 50) return 'D';
  if (averageScore >= 40) return 'E';
  return 'F';
}

function calculatePositions(studentsData: { studentId: number; averageScore: number }[]): Map<number, { position: number; totalStudents: number }> {
  const sortedStudents = studentsData.sort((a, b) => b.averageScore - a.averageScore);
  const positions = new Map<number, { position: number; totalStudents: number }>();
  
  sortedStudents.forEach((student, index) => {
    positions.set(student.studentId, {
      position: index + 1,
      totalStudents: sortedStudents.length
    });
  });
  
  return positions;
}

export function CompileResultsPage() {
  const {
    currentUser,
    teachers,
    students,
    classes,
    scores,
    affectiveDomains,
    psychomotorDomains,
    compiledResults,
    addCompiledResult,
    updateCompiledResult,
    currentTerm,
    currentAcademicYear,
    subjectAssignments,
    subjectRegistrations,
    attendances,
    loadScoresFromAPI,
    loadAffectiveDomainsFromAPI,
    loadPsychomotorDomainsFromAPI,
    loadAttendancesFromAPI,
    loadCompiledResultsFromAPI,
    refreshClassData,
    canViewResults,
    canManageScores,
    updateAffectiveDomain,
    updatePsychomotorDomain,
    createAffectiveDomain,
    createPsychomotorDomain,
    getAttendanceByStudent,
    getAttendanceRequirements,
    addNotification
  } = useSchool();

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [classTeacherComment, setClassTeacherComment] = useState<string>("");
  const [useAutoComment, setUseAutoComment] = useState<boolean>(false);
  const [showCommentOptions, setShowCommentOptions] = useState<boolean>(false);
  const [commentOptions, setCommentOptions] = useState<string[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [resultsGenerated, setResultsGenerated] = useState<boolean>(false);
  const [studentAttendanceInput, setStudentAttendanceInput] = useState<Record<number, number>>({});
    
  // Affective and Psychomotor form states
  const [affectiveData, setAffectiveData] = useState({
    attentiveness: 3,
    honesty: 3,
    punctuality: 3,
    neatness: 3,
    attentiveness_remark: '',
    honesty_remark: '',
    punctuality_remark: '',
    neatness_remark: ''
  });
  
  const [psychomotorData, setPsychomotorData] = useState({
    sports: 3,
    handwork: 3,
    drawing: 3,
    music: 3,
    sports_remark: '',
    handwork_remark: '',
    drawing_remark: '',
    music_remark: ''
  });

  // Handle affective domain save
  const handleSaveAffective = async () => {
    if (!selectedStudent) {
      toast.error('No student selected');
      return;
    }

    try {
      const affectivePayload = {
        student_id: selectedStudent.id,
        class_id: Number(selectedClassId),
        term: currentTerm,
        academic_year: currentAcademicYear,
        ...affectiveData,
        entered_by: currentUser?.id
      };
      
      const existingId = studentResultData?.affective?.id;
      if (existingId) {
        await updateAffectiveDomain(existingId, affectivePayload);
      } else {
        // Create new affective domain record
        await createAffectiveDomain(affectivePayload);
      }
      
      toast.success('Affective domain assessment saved');
    } catch (error) {
      toast.error('Failed to save affective domain assessment');
    }
  };

  // Handle psychomotor domain save
  const handleSavePsychomotor = async () => {
    if (!selectedStudent) {
      toast.error('No student selected');
      return;
    }

    try {
      const psychomotorPayload = {
        student_id: selectedStudent.id,
        class_id: Number(selectedClassId),
        term: currentTerm,
        academic_year: currentAcademicYear,
        ...psychomotorData,
        entered_by: currentUser?.id
      };
      
      const existingId = studentResultData?.psychomotor?.id;
      if (existingId) {
        await updatePsychomotorDomain(existingId, psychomotorPayload);
      } else {
        // Create new psychomotor domain record
        await createPsychomotorDomain(psychomotorPayload);
      }
      
      toast.success('Psychomotor domain assessment saved');
    } catch (error) {
      toast.error('Failed to save psychomotor domain assessment');
    }
  };

  // Refresh data function with optimized class-specific refresh
  const refreshData = useCallback(async () => {
    try {
      // Always load scores to get the latest submitted scores
      await loadScoresFromAPI();
      
      // Load attendance data
      await loadAttendancesFromAPI();
      
      // Load compiled results to get latest rejection status
      await loadCompiledResultsFromAPI();
      
      if (selectedClassId) {
        await refreshClassData(Number(selectedClassId));
      }
      
      setLastRefresh(new Date());
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  }, [selectedClassId, refreshClassData, loadScoresFromAPI, loadAttendancesFromAPI, loadCompiledResultsFromAPI]);

  // Auto-refresh compiled results to check for admin rejections
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await loadCompiledResultsFromAPI();
      } catch (error) {
        console.error('Error auto-refreshing compiled results:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [loadCompiledResultsFromAPI]);

  // Refresh when window gains focus (in case admin rejected in another tab)
  useEffect(() => {
    const handleFocus = async () => {
      try {
        await loadCompiledResultsFromAPI();
      } catch (error) {
        console.error('Error refreshing on focus:', error);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadCompiledResultsFromAPI]);

  // Manual refresh function for testing
  const handleManualRefresh = async () => {
    try {
      toast.info('Refreshing data...');
      await loadCompiledResultsFromAPI();
      await loadScoresFromAPI();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  };

  
  // Generate Results function
  const handleGenerateResults = async () => {
    try {
      // First refresh scores to get latest data
      await loadScoresFromAPI();
      
      // Force recalculation of positions and averages
      setResultsGenerated(true);
      toast.success("Results generated successfully! Positions and averages calculated.");
    } catch (error) {
      console.error('Error generating results:', error);
      toast.error('Failed to generate results. Please try again.');
    }
  };

  // Auto-refresh when component mounts (only once per class change)
  useEffect(() => {
    if (selectedClassId) {
      refreshData();
    }
  }, [selectedClassId]); // Only run when class changes

  // Periodic score refresh to ensure latest data
  useEffect(() => {
    if (!selectedClassId) return;

    const interval = setInterval(async () => {
      try {
        await loadScoresFromAPI();
        console.log('Scores refreshed automatically');
      } catch (error) {
        console.error('Auto refresh scores failed:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [selectedClassId, loadScoresFromAPI]);

  // Check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (currentUser?.role === 'teacher') {
        const hasResultsPermission = await canViewResults();
        const hasScoresPermission = await canManageScores();
        
        if (!hasResultsPermission) {
          toast.error('You do not have permission to view results');
          return;
        }
        
        if (!hasScoresPermission) {
          toast.error('You do not have permission to manage scores');
          return;
        }
      }
    };
    
    checkPermissions();
  }, [currentUser, canViewResults, canManageScores]);

  // Get current teacher
  const currentTeacher = currentUser ? teachers.find(t => t.id === currentUser.linked_id) : null;
  // Check if teacher has class teacher assignments
  const hasClassTeacherAssignments = useMemo(() => {
    if (!currentTeacher) return false;
    return classes.some((c: any) => c.classTeacherId === currentTeacher.id && c.status === 'Active');
  }, [currentTeacher, classes]);

  // Only show classes where teacher is the class teacher
  const classTeacherClasses = useMemo(() => {
    if (!currentTeacher) {
      return [];
    }
    
    return classes.filter((c: any) => c.classTeacherId === currentTeacher.id && c.status === 'Active');
  }, [currentTeacher, classes]);

  // Get students in selected class
  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students
      .filter(s => s.class_id === Number(selectedClassId) && s.status === 'Active')
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [selectedClassId, students]);

  // Get all registered subjects for the class (these are the subjects that should appear in results)
  const classSubjects = useMemo(() => {
    if (!selectedClassId) return [];
    
    // Get subject assignments directly for this class, term, and academic year
    const subjectAssignmentsForClass = subjectAssignments.filter(
      sa => sa.class_id === Number(selectedClassId) &&
            sa.term === currentTerm &&
            sa.academic_year === currentAcademicYear &&
            sa.status === 'Active'
    );
    
    return subjectAssignmentsForClass;
  }, [selectedClassId, subjectAssignments, currentTerm, currentAcademicYear]);

  // Get selected student details
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return classStudents.find(s => s.id === selectedStudentId);
  }, [selectedStudentId, classStudents]);

  // Calculate attendance data for selected student
  const studentAttendance = useMemo(() => {
    if (!selectedStudent || !selectedClassId) return null;
    
    // First check if there's an existing compiled result with attendance data
    const existingResult = compiledResults.find(cr => 
      cr.student_id === selectedStudent.id &&
      cr.class_id === Number(selectedClassId) &&
      cr.term === currentTerm &&
      cr.academic_year === currentAcademicYear
    );
    
    if (existingResult) {
      // Use attendance data from compiled result
      const requiredDays = existingResult.total_attendance_days || getAttendanceRequirements()[currentTerm] || 60;
      const attendedDays = existingResult.times_present || 0;
      
      return {
        requiredDays,
        attendedDays,
        attendanceRate: requiredDays > 0 ? (attendedDays / requiredDays) * 100 : 0,
        ratio: `${attendedDays}/${requiredDays}`,
        timesAbsent: existingResult.times_absent || 0
      };
    }
    
    // Fallback to input-based calculation for new results
    const attendanceRequirements = getAttendanceRequirements();
    const requiredDays = attendanceRequirements[currentTerm] || 60;
    const attendedDays = studentAttendanceInput[selectedStudent.id] || 0;
    
    return {
      requiredDays,
      attendedDays,
      attendanceRate: requiredDays > 0 ? (attendedDays / requiredDays) * 100 : 0,
      ratio: `${attendedDays}/${requiredDays}`,
      timesAbsent: 0
    };
  }, [selectedStudent, selectedClassId, currentTerm, currentAcademicYear, compiledResults, studentAttendanceInput, getAttendanceRequirements]);

  // Reset affective and psychomotor data when student changes
  useEffect(() => {
    if (selectedStudent && selectedClassId) {
      // Load existing affective data
      const existingAffective = affectiveDomains.find(
        ad => ad.student_id === selectedStudent.id && 
             ad.class_id === Number(selectedClassId) &&
             ad.term === currentTerm &&
             ad.academic_year === currentAcademicYear
      );
      
      if (existingAffective) {
        setAffectiveData({
          attentiveness: existingAffective.attentiveness || 3,
          honesty: existingAffective.honesty || 3,
          punctuality: existingAffective.punctuality || 3,
          neatness: existingAffective.neatness || 3,
          attentiveness_remark: existingAffective.attentiveness_remark || '',
          honesty_remark: existingAffective.honesty_remark || '',
          punctuality_remark: existingAffective.punctuality_remark || '',
          neatness_remark: existingAffective.neatness_remark || ''
        });
      } else {
        // Reset to defaults
        setAffectiveData({
          attentiveness: 3,
          honesty: 3,
          punctuality: 3,
          neatness: 3,
          attentiveness_remark: '',
          honesty_remark: '',
          punctuality_remark: '',
          neatness_remark: ''
        });
      }
      
      // Load existing psychomotor data
      const existingPsychomotor = psychomotorDomains.find(
        pd => pd.student_id === selectedStudent.id && 
             pd.class_id === Number(selectedClassId) &&
             pd.term === currentTerm &&
             pd.academic_year === currentAcademicYear
      );
      
      if (existingPsychomotor) {
        setPsychomotorData({
          sports: existingPsychomotor.sports || 3,
          handwork: existingPsychomotor.handwork || 3,
          drawing: existingPsychomotor.drawing || 3,
          music: existingPsychomotor.music || 3,
          sports_remark: existingPsychomotor.sports_remark || '',
          handwork_remark: existingPsychomotor.handwork_remark || '',
          drawing_remark: existingPsychomotor.drawing_remark || '',
          music_remark: existingPsychomotor.music_remark || ''
        });
      } else {
        // Reset to defaults
        setPsychomotorData({
          sports: 3,
          handwork: 3,
          drawing: 3,
          music: 3,
          sports_remark: '',
          handwork_remark: '',
          drawing_remark: '',
          music_remark: ''
        });
      }
      
      // Load existing attendance data from compiled result
      const existingResult = compiledResults.find(cr => 
        cr.student_id === selectedStudent.id &&
        cr.class_id === Number(selectedClassId) &&
        cr.term === currentTerm &&
        cr.academic_year === currentAcademicYear
      );
      
      if (existingResult) {
        setStudentAttendanceInput(prev => ({
          ...prev,
          [selectedStudent.id]: existingResult.times_present || 0
        }));
      }
    }
  }, [selectedStudent?.id, selectedClassId, affectiveDomains, psychomotorDomains, compiledResults, currentTerm, currentAcademicYear]);

  // Calculate all students' completion status and positions
  const studentsCompletion = useMemo(() => {
    if (!classStudents.length) {
      return [];
    }

    
    const studentsData = classStudents.map(student => {
      // Get all scores for this student
      const studentScores = scores.filter(s => s.student_id === student.id);
      
      // IMPORTANT: Only use scores that match this class's subject assignments
      // This prevents mixing scores from other classes
      const relevantScores = studentScores.filter(s => 
        s.status === 'Submitted' && 
        classSubjects.some((cs: any) => cs && Number(cs.id) === Number(s.subject_assignment_id))
      );
      
      // Debug: Show matching info for first student only to avoid spam
      if (student.id === classStudents[0]?.id) {
        console.log(`=== DEBUG for ${student.firstName} ${student.lastName} ===`);
        console.log('Class Subjects:', classSubjects.map(cs => ({ id: cs.id, subject_name: cs.subject_name })));
        console.log('Student Scores:', studentScores.map(s => ({ 
          id: s.id, 
          subject_assignment_id: s.subject_assignment_id, 
          total: s.total, 
          status: s.status 
        })));
        console.log('Relevant Scores (matching class):', relevantScores.map(s => ({ 
          id: s.id, 
          subject_assignment_id: s.subject_assignment_id, 
          total: s.total 
        })));
      }

      const affective = affectiveDomains.find(a => 
        a.student_id === student.id &&
        a.class_id === Number(selectedClassId) &&
        a.term === currentTerm
      );

      const psychomotor = psychomotorDomains.find(p => 
        p.student_id === student.id &&
        p.class_id === Number(selectedClassId) &&
        p.term === currentTerm
      );

      const existingResult = compiledResults.find(r =>
        r.student_id === student.id &&
        r.class_id === Number(selectedClassId) &&
        r.term === currentTerm
      );

      // Count completed subjects from relevant scores
      const completedSubjects = relevantScores.length;
      const totalSubjects = classSubjects.length > 0 ? classSubjects.length : relevantScores.length;
      const hasAffective = affective !== undefined;
      const hasPsychomotor = psychomotor !== undefined;
      const isSubmitted = existingResult?.status === 'Submitted' || existingResult?.status === 'Approved';
      const isRejected = existingResult?.status === 'Rejected';

      // Calculate total score from relevant scores
      const totalScore = relevantScores.reduce((sum, s) => {
        const scoreTotal = Number(s.total) || 0;
        return sum + scoreTotal;
      }, 0);
      
      // Debug: Show calculation for first student
      if (student.id === classStudents[0]?.id) {
        console.log(`SCORE DEBUG for ${student.firstName}:`, {
          relevantScoresCount: relevantScores.length,
          relevantScores: relevantScores.map(s => ({ id: s.id, total: s.total, type: typeof s.total })),
          calculatedTotal: totalScore
        });
      }
      
      // Calculate average score from relevant scores
      const averageScore = relevantScores.length > 0 
        ? Math.round((totalScore / relevantScores.length) * 100) / 100 
        : 0;

      
      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        completedSubjects,
        totalSubjects,
        hasAffective,
        hasPsychomotor,
        isSubmitted,
        averageScore,
        totalScore,
        isComplete: completedSubjects === totalSubjects && hasAffective && hasPsychomotor,
        studentScores: relevantScores
      };
    });

    // Calculate positions based on total scores (highest to lowest)
    // Include ALL students, even those with 0 scores
    const studentsWithScores = studentsData
      .sort((a, b) => Number(b.totalScore) - Number(a.totalScore)); // Sort by highest total first

    // Assign positions
    let currentPosition = 1;
    const positionedStudents = studentsWithScores.map((student, index) => {
      if (index > 0 && Number(student.totalScore) < Number(studentsWithScores[index - 1].totalScore)) {
        currentPosition = index + 1;
      }
      const positionedStudent = {
        ...student,
        position: currentPosition,
        totalStudents: studentsWithScores.length
      };
      return positionedStudent;
    });

    const finalResult = positionedStudents;
    
    return finalResult;
  }, [classStudents, scores, classSubjects, affectiveDomains, psychomotorDomains, compiledResults, selectedClassId, currentTerm, resultsGenerated]);

  // Get student's result data
  const studentResultData = useMemo(() => {
    if (!selectedStudent) return null;
    
    // Get all scores for this student (less restrictive filtering)
    const studentScores = scores.filter(s => s.student_id === selectedStudent.id);
    
    // Filter for relevant scores that match current class subjects
    const relevantScores = studentScores.filter(s => 
      s.status === 'Submitted' &&
      classSubjects.some((cs: any) => cs && Number(cs.id) === Number(s.subject_assignment_id))
    );

    const affective = affectiveDomains.find(a => 
      a.student_id === selectedStudent.id &&
      a.class_id === Number(selectedClassId) &&
      a.academic_year === currentAcademicYear
    );

    const psychomotor = psychomotorDomains.find(p => 
      p.student_id === selectedStudent.id &&
      p.class_id === Number(selectedClassId) &&
      p.academic_year === currentAcademicYear
    );

    const existingResult = compiledResults.find(
      cr => cr.student_id === selectedStudent.id &&
           cr.class_id === Number(selectedClassId) &&
           cr.term === currentTerm &&
           cr.academic_year === currentAcademicYear
    );

    const isSubmitted = existingResult?.status === 'Submitted' || existingResult?.status === 'Approved';
    const isRejected = existingResult?.status === 'Rejected';

    // Debug logging
    console.log('Student Result Debug:', {
      studentId: selectedStudent?.id,
      existingResult,
      isSubmitted,
      isRejected,
      status: existingResult?.status
    });

    // Calculate totals using same logic as studentsCompletion
    const totalScoreRaw = relevantScores.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const totalScore = totalScoreRaw > 0 ? parseFloat(totalScoreRaw.toPrecision(3)) : 0;
    const averageScore = relevantScores.length > 0 
      ? Math.round((totalScore / relevantScores.length) * 100) / 100 
      : 0;

    // Get student's position from studentsCompletion (now calculated by total score)
    const studentCompletionData = studentsCompletion.find(s => s.studentId === selectedStudent.id);
    const position = studentCompletionData?.position || 0;
    const totalStudents = studentCompletionData?.totalStudents || 0;

    // Check completion
    const isComplete = 
      relevantScores.length === (classSubjects || []).length &&
      relevantScores.every(s => s.status === 'Submitted') &&
      affective !== undefined &&
      psychomotor !== undefined;

    return {
      student: selectedStudent,
      scores: relevantScores, // Use relevant scores
      affective: affective,
      psychomotor: psychomotor,
      totalScore,
      averageScore,
      position,
      totalStudents,
      subjectsCompleted: relevantScores.filter(s => s.status === 'Submitted').length,
      totalSubjects: (classSubjects || []).length,
      isComplete,
      existingResult,
      isSubmitted,
      isRejected
    };
  }, [selectedStudent, scores, classSubjects, affectiveDomains, psychomotorDomains, compiledResults, selectedClassId, currentTerm, currentAcademicYear, studentsCompletion]);

  // Calculate class statistics
  const classStatistics = useMemo(() => {
    const validStudents = studentsCompletion.filter(s => s.averageScore > 0);
    const scores = validStudents.map(s => s.averageScore);
    
    if (scores.length === 0) {
      return {
        classAverage: 0,
        highestScore: 0,
        lowestScore: 0,
        totalStudents: 0
      };
    }

    return {
      classAverage: Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      totalStudents: validStudents.length
    };
  }, [studentsCompletion]);

  // Submit result for selected student
  const handleSubmitResult = () => {
    if (!selectedStudent || !studentResultData || !currentTeacher) {
      toast.error('Missing required data');
      return;
    }

    const selectedClass = classes.find(c => c.id === Number(selectedClassId));
    if (!selectedClass || selectedClass.classTeacherId !== currentTeacher.id) {
      toast.error('You can only compile results for your assigned class');
      return;
    }

    if (!studentResultData.isComplete) {
      toast.error("Cannot submit incomplete result. Ensure all scores and assessments are entered.");
      return;
    }

    // Get student's position from calculated data
    const studentCompletionData = studentsCompletion.find(s => s.studentId === selectedStudent.id);
    const position = studentCompletionData?.position || 0;
    const totalStudents = studentCompletionData?.totalStudents || 0;

    // Generate auto-comment if enabled, or use manual comment
    let finalComment = classTeacherComment;
    if (useAutoComment && !finalComment.trim()) {
      // If auto-comment is enabled but no comment selected, generate one
      finalComment = generateAutoComment(studentResultData.averageScore, position, totalStudents);
    }

    if (!finalComment.trim()) {
      toast.error("Please enter a class teacher comment or enable auto-comment");
      return;
    }

    const resultData = {
      student_id: selectedStudent.id,
      class_id: Number(selectedClassId),
      term: currentTerm,
      academic_year: currentAcademicYear,
      scores: studentResultData.scores,
      affective: studentResultData.affective || null,
      psychomotor: studentResultData.psychomotor || null,
      total_score: studentResultData.totalScore,
      average_score: studentResultData.averageScore,
      class_average: classStatistics.classAverage,
      position: position,
      total_students: totalStudents,
      times_present: studentAttendance?.attendedDays || 0,
      times_absent: studentAttendance?.timesAbsent || 0,
      total_attendance_days: studentAttendance?.requiredDays || getAttendanceRequirements()[currentTerm] || 60,
      term_begin: '',
      term_end: '',
      next_term_begin: '',
      class_teacher_name: `${currentTeacher.firstName} ${currentTeacher.lastName}`,
      class_teacher_comment: finalComment,
      principal_name: '',
      principal_comment: generatePrincipalComment(studentResultData.averageScore),
      principal_signature: '',
      compiled_by: 1, // Use admin user ID (1) to satisfy foreign key constraint
      compiled_date: new Date().toISOString(),
      status: 'Submitted' as const,
      approved_by: null,
      approved_date: null,
      rejection_reason: null
    };

    if (studentResultData.existingResult) {
      updateCompiledResult(studentResultData.existingResult.id, resultData);
      toast.success(`Result updated for ${selectedStudent.firstName} ${selectedStudent.lastName}`);
    } else {
      addCompiledResult(resultData);
      toast.success(`Result submitted for ${selectedStudent.firstName} ${selectedStudent.lastName}`);
    }

    // Clear and go back to list
    setClassTeacherComment("");
    setSelectedStudentId(null);
    setUseAutoComment(false);
  };

  // Submit all complete results
  const handleSubmitAllResults = () => {
    if (!selectedClassId || !currentTeacher) {
      toast.error("Please select a class");
      return;
    }

    // Check if current teacher is the class teacher for this class
    const selectedClass = classes.find(c => c.id === Number(selectedClassId));
    if (!selectedClass || selectedClass.classTeacherId !== currentTeacher.id) {
      toast.error("Only the class teacher can compile results for this class");
      return;
    }

    const completeStudents = studentsCompletion.filter(s => s.isComplete && !s.isSubmitted);
    
    if (completeStudents.length === 0) {
      toast.error("No complete results to submit");
      return;
    }

    let submittedCount = 0;

    completeStudents.forEach((studentComp) => {
      const student = classStudents.find(s => s.id === studentComp.studentId);
      if (!student) return;

      const studentScores = scores.filter(s => 
        s.student_id === student.id &&
        classSubjects.some((cs: any) => cs && cs.id === s.subject_assignment_id)
      );

      const affective = affectiveDomains.find(a => 
        a.student_id === student.id &&
        a.class_id === Number(selectedClassId) &&
        a.term === currentTerm
      );

      const psychomotor = psychomotorDomains.find(p => 
        p.student_id === student.id &&
        p.class_id === Number(selectedClassId) &&
        p.term === currentTerm
      );

      const totalScore = studentScores.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
      const averageScore = Math.round((totalScore / (studentScores || []).length) * 100) / 100;

      // Calculate class average
      const allAverages = studentsCompletion
        .filter(s => s.averageScore > 0)
        .map(s => s.averageScore);
      const classAverage = Math.round(((allAverages || []).reduce((sum, a) => sum + a, 0) / (allAverages || []).length) * 100) / 100;

      // Calculate position
      const sortedStudents = [...allAverages].sort((a, b) => b - a);
      const position = sortedStudents.indexOf(averageScore) + 1;

      let autoComment = '';
      if (averageScore >= 70) {
        autoComment = 'Excellent performance! Keep up the outstanding work.';
      } else if (averageScore >= 60) {
        autoComment = 'Very good performance. Continue to work hard.';
      } else if (averageScore >= 50) {
        autoComment = 'Good effort. There is room for improvement.';
      } else if (averageScore >= 40) {
        autoComment = 'Fair performance. More effort is needed.';
      } else {
        autoComment = 'Needs serious improvement. Please put in more effort.';
      }

      const compiledData = {
        student_id: student.id,
        class_id: Number(selectedClassId),
        term: currentTerm,
        academic_year: currentAcademicYear,
        scores: studentScores,
        affective: affective || null,
        psychomotor: psychomotor || null,
        total_score: totalScore,
        average_score: averageScore,
        class_average: classAverage,
        position: position,
        total_students: classStudents.length,
        times_present: studentAttendanceInput[student.id] || 0,
        times_absent: 0, // Will be calculated as required - present
        total_attendance_days: getAttendanceRequirements()[currentTerm] || 60,
        term_begin: '',
        term_end: '',
        next_term_begin: '',
        class_teacher_name: `${currentTeacher.firstName} ${currentTeacher.lastName}`,
        class_teacher_comment: autoComment,
        principal_name: 'Dr. Ibrahim Musa',
        principal_comment: '',
        principal_signature: '',
        compiled_by: 1, // Use admin user ID (1) to satisfy foreign key constraint
        compiled_date: new Date().toISOString(),
        status: 'Submitted' as const,
        approved_by: null,
        approved_date: null,
        rejection_reason: null
      };

      addCompiledResult(compiledData);
      submittedCount++;
    });

    // Notify admin
    toast.success(`Successfully submitted ${submittedCount} results for approval`);

    toast.success(`${submittedCount} results submitted to admin for approval!`);
  };

  // Restrict access to teachers with class assignments
  if (!hasClassTeacherAssignments) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Restricted</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Only class teachers can compile results. You must be assigned as a class teacher to access this page.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Contact the administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header - Compact */}
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-[#0A2540] text-lg mb-1">Compile Results</h1>
          <p className="text-gray-600 text-sm">
            {selectedStudentId 
              ? "Review and compile student result" 
              : "Select a class to view students and compile their results"}
          </p>
          {lastRefresh && (
            <p className="text-xs text-gray-500 mt-1">
              Last refreshed: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 border-[#0A2540]/20 h-8"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
          <Button
            onClick={handleGenerateResults}
            size="sm"
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-lg flex items-center gap-1 h-8"
          >
            <Award className="h-3 w-3" />
            Generate
          </Button>
        </div>
      </div>

      {/* Class Selection - Compact */}
      {!selectedStudentId && (
        <Card className="border-[#0A2540]/10 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-t-xl px-4 py-3">
            <CardTitle className="text-base">Select Class</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-[#0A2540] mb-1 block text-sm">Class</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="h-9 rounded-lg border-[#0A2540]/20">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classTeacherClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#0A2540] mb-1 block text-sm">Term & Year</Label>
                <div className="h-9 flex items-center px-3 rounded-lg border border-[#0A2540]/20 bg-gray-50">
                  <p className="text-[#0A2540] text-sm">{currentTerm} {currentAcademicYear}</p>
                </div>
              </div>
            </div>

            {selectedClassId && classSubjects.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900">
                  <strong>{classSubjects.length} subjects</strong> assigned to this class for {currentTerm} {currentAcademicYear}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student List - Compact */}
      {!selectedStudentId && selectedClassId && (
        <Card className="border-[#0A2540]/10 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-t-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Students List</h2>
                <p className="text-blue-100 text-sm">
                  {classStudents.length} students in class
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitAllResults}
                  disabled={(studentsCompletion || []).filter(s => s.isComplete && !s.isSubmitted).length === 0}
                  className="bg-white text-[#10B981] hover:bg-gray-100 rounded-lg h-8 text-sm"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Submit All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            {classStudents.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No students in this class</p>
              </div>
            ) : (
              <div className="space-y-1">
                {classStudents.map((student) => {
                  const completion = studentsCompletion.find(s => s.studentId === student.id);
                  // Don't hide students without completion data - show them with default values

                  return (
                    <div
                      key={student.id}
                      className="p-2 border border-[#0A2540]/10 rounded hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8 border border-[#3B82F6]">
                            {student.photo_url ? (
                              <img 
                                src={student.photo_url} 
                                alt={`${student.firstName} ${student.lastName}`}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <AvatarFallback className="bg-[#3B82F6] text-white text-xs">
                              {student.firstName[0]}{student.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <p className="text-[#0A2540] font-medium text-sm">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-gray-600">{student.admissionNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Scores Progress */}
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Scores</p>
                            <div className="flex items-center gap-1">
                              <Badge 
                                variant={completion?.completedSubjects === completion?.totalSubjects ? "default" : "outline"}
                                className={`rounded text-xs ${
                                  completion?.completedSubjects === completion?.totalSubjects 
                                    ? 'bg-green-100 text-green-800 border-green-300' 
                                    : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                }`}
                              >
                                {completion?.completedSubjects || 0}/{completion?.totalSubjects || 0}
                              </Badge>
                            </div>
                          </div>

                          {/* Affective */}
                          <div className="text-center">
                            <CheckCircle className={`w-3 h-3 ${completion?.hasAffective ? 'text-green-600' : 'text-gray-300'}`} />
                          </div>

                          {/* Psychomotor */}
                          <div className="text-center">
                            <CheckCircle className={`w-3 h-3 ${completion?.hasPsychomotor ? 'text-green-600' : 'text-gray-300'}`} />
                          </div>

                          {/* Status */}
                          <div className="text-center">
                            {completion?.isSubmitted ? (
                              <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                                <CheckCircle className="w-2 h-2 mr-1" />
                                Sub
                              </Badge>
                            ) : completion?.isComplete ? (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                                Ready
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-300 text-xs">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Student Detail View */}
      {selectedStudentId && selectedStudent && studentResultData && (
        <div className="space-y-4">
          {/* Back Button - Compact */}
          <Button
            onClick={() => {
              setSelectedStudentId(null);
              setClassTeacherComment("");
            }}
            variant="outline"
            size="sm"
            className="rounded-lg border-[#0A2540]/20 h-8"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back
          </Button>

          {/* Student Info Card - Compact */}
          <Card className="border-[#0A2540]/10 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-t-xl px-4 py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Avatar className="w-8 h-8 border border-white">
                  {selectedStudent.photo_url ? (
                    <img 
                      src={selectedStudent.photo_url} 
                      alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <AvatarFallback className="bg-white text-[#3B82F6] text-xs">
                    {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-base">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                  <p className="text-xs font-normal opacity-90">{selectedStudent.admissionNumber}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Class</p>
                  <p className="text-[#0A2540] font-medium text-sm">{selectedStudent.className}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Gender</p>
                  <p className="text-[#0A2540] font-medium text-sm">{selectedStudent.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Term</p>
                  <p className="text-[#0A2540] font-medium text-sm">{currentTerm}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Year</p>
                  <p className="text-[#0A2540] font-medium text-sm">{currentAcademicYear}</p>
                </div>
              </div>

              {/* Summary Stats - Compact */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-900">Subjects</p>
                  <p className="text-sm text-blue-900 font-bold">
                    {studentResultData.subjectsCompleted}/{studentResultData.totalSubjects}
                  </p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-900">Total</p>
                  <p className="text-sm text-purple-900 font-bold">{studentResultData.totalScore}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-900">Average</p>
                  <p className="text-sm text-green-900 font-bold">{studentResultData.averageScore}%</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-xs text-orange-900">Position</p>
                  <p className="text-sm text-orange-900 font-bold">
                    {studentResultData.position > 0 ? `${studentResultData.position}/${studentResultData.totalStudents}` : 'N/A'}
                  </p>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-xs text-indigo-900">Attendance</p>
                  <p className="text-sm text-indigo-900 font-bold">
                    {studentAttendance?.ratio || '0/0'}
                  </p>
                  <p className="text-xs text-indigo-700">
                    {studentAttendance?.attendanceRate.toFixed(1) || '0'}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rejection Notice */}
          {studentResultData?.isRejected && (
            <Card className="border-red-200 bg-red-50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Result Rejected</h3>
                    <p className="text-xs text-red-700 mb-2">
                      This result was rejected by the administrator. Please review and make necessary corrections before resubmitting.
                    </p>
                    {studentResultData?.existingResult?.rejection_reason && (
                      <div className="bg-red-100 border border-red-200 rounded p-2">
                        <p className="text-xs font-medium text-red-800">Rejection Reason:</p>
                        <p className="text-xs text-red-700">{studentResultData.existingResult.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subject Scores - Compact */}
          <Card className="border-[#0A2540]/10 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-t-xl px-4 py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="w-4 h-4" />
                Subject Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {classSubjects.length === 0 ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No subjects assigned to this class</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {classSubjects.map((subject: any) => {
                    const score = studentResultData.scores.find(s => s.subject_assignment_id === subject.id);
                    return (
                      <div key={subject.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#0A2540]">{subject.subject_name || 'Unknown Subject'}</p>
                            <p className="text-xs text-gray-600">{subject.subject_code || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-600">CA1</p>
                            <p className="text-sm font-medium">{score?.ca1 || 0}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">CA2</p>
                            <p className="text-sm font-medium">{score?.ca2 || 0}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Exam</p>
                            <p className="text-sm font-medium">{score?.exam || 0}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Total</p>
                            <p className="text-sm font-bold text-green-600">{score?.total || 0}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Input - One Time Entry */}
          <Card className="border-[#0A2540]/10 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white px-4 py-3 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4" />
                Attendance Record
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-[#0A2540]">Days Present</Label>
                    <p className="text-xs text-gray-600">
                      Required: {studentAttendance?.requiredDays || 60} days for {currentTerm}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max={studentAttendance?.requiredDays || 60}
                      value={studentAttendanceInput[selectedStudent?.id || 0] || 0}
                      onChange={(e) => setStudentAttendanceInput(prev => ({
                        ...prev,
                        [selectedStudent?.id || 0]: parseInt(e.target.value) || 0
                      }))}
                      className="w-20 text-center rounded-lg"
                      disabled={studentResultData?.isSubmitted && !studentResultData?.isRejected}
                    />
                    <span className="text-sm text-gray-600">days</span>
                  </div>
                </div>
                
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-800">Attendance Ratio:</span>
                    <span className="text-lg font-bold text-indigo-900">
                      {studentAttendance?.ratio || '0/60'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-indigo-700">Attendance Rate:</span>
                    <span className="text-sm font-semibold text-indigo-800">
                      {studentAttendance?.attendanceRate.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                </div>
                
                {studentResultData?.isSubmitted && !studentResultData?.isRejected && (
                  <p className="text-xs text-gray-600 mt-1">
                    Attendance cannot be modified after result submission.
                  </p>
                )}
                
                {studentResultData?.isRejected && (
                  <p className="text-xs text-orange-600 mt-1">
                    Result was rejected. You can edit and resubmit.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          
          {/* Affective & Psychomotor Forms */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Affective Domain Form - Compact Design */}
            <Card className="border-[#0A2540]/10 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white px-4 py-3 rounded-t-xl">
                <CardTitle className="text-base">Affective Domain</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'attentiveness', label: 'Attentiveness' },
                    { key: 'honesty', label: 'Honesty' },
                    { key: 'punctuality', label: 'Punctuality' },
                    { key: 'neatness', label: 'Neatness' }
                  ].map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs font-medium text-gray-700">{field.label}</Label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setAffectiveData(prev => ({ ...prev, [field.key]: rating }))}
                            className={`w-6 h-6 rounded-full border-2 text-xs font-semibold transition-all ${
                              affectiveData[field.key as keyof typeof affectiveData] === rating
                                ? 'bg-purple-600 border-purple-600 text-white'
                                : 'bg-white border-gray-300 text-gray-600 hover:border-purple-400'
                            }`}
                            disabled={studentResultData?.isSubmitted && !studentResultData?.isRejected}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                      <Textarea
                        value={affectiveData[`${field.key}_remark` as keyof typeof affectiveData] as string}
                        onChange={(e) => setAffectiveData(prev => ({ ...prev, [`${field.key}_remark`]: e.target.value }))}
                        placeholder={`${field.label} remarks...`}
                        className="min-h-[40px] text-xs resize-none"
                        disabled={studentResultData?.isSubmitted && !studentResultData?.isRejected}
                      />
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={handleSaveAffective}
                  disabled={studentResultData?.isSubmitted && !studentResultData?.isRejected}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white h-8 text-sm"
                >
                  Save Affective Assessment
                </Button>
              </CardContent>
            </Card>

            {/* Psychomotor Domain Form - Compact Design */}
            <Card className="border-[#0A2540]/10 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-[#EC4899] to-[#DB2777] text-white px-4 py-3 rounded-t-xl">
                <CardTitle className="text-base">Psychomotor Domain</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'sports', label: 'Sports' },
                    { key: 'handwork', label: 'Handwork' },
                    { key: 'drawing', label: 'Drawing' },
                    { key: 'music', label: 'Music' }
                  ].map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs font-medium text-gray-700">{field.label}</Label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setPsychomotorData(prev => ({ ...prev, [field.key]: rating }))}
                            className={`w-6 h-6 rounded-full border-2 text-xs font-semibold transition-all ${
                              psychomotorData[field.key as keyof typeof psychomotorData] === rating
                                ? 'bg-pink-600 border-pink-600 text-white'
                                : 'bg-white border-gray-300 text-gray-600 hover:border-pink-400'
                            }`}
                            disabled={studentResultData?.isSubmitted && !studentResultData?.isRejected}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                      <Textarea
                        value={psychomotorData[`${field.key}_remark` as keyof typeof psychomotorData] as string}
                        onChange={(e) => setPsychomotorData(prev => ({ ...prev, [`${field.key}_remark`]: e.target.value }))}
                        placeholder={`${field.label} remarks...`}
                        className="min-h-[40px] text-xs resize-none"
                        disabled={studentResultData?.isSubmitted && !studentResultData?.isRejected}
                      />
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={handleSavePsychomotor}
                  disabled={studentResultData?.isSubmitted && !studentResultData?.isRejected}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white h-8 text-sm"
                >
                  Save Psychomotor Assessment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Class Teacher Comment - Compact */}
          <Card className="border-[#0A2540]/10 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-4 py-3 rounded-t-xl">
              <CardTitle className="text-base">Class Teacher Comment</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Auto-comment toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-comment"
                  checked={useAutoComment}
                  onChange={(e) => setUseAutoComment(e.target.checked)}
                  disabled={studentResultData?.isSubmitted && !studentResultData?.isRejected}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <Label htmlFor="auto-comment" className="text-sm text-gray-700">
                  Use auto-generated comment
                </Label>
              </div>

              {/* Comment options */}
              {useAutoComment && showCommentOptions && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Select a comment:</p>
                  <div className="space-y-1">
                    {generateMultipleCommentOptions(
                      studentResultData?.averageScore || 0,
                      studentsCompletion.find(s => s.studentId === selectedStudent.id)?.position || 0,
                      studentsCompletion.find(s => s.studentId === selectedStudent.id)?.totalStudents || 0
                    ).map((comment: string, index: number) => (
                      <div
                        key={index}
                        onClick={() => {
                          setClassTeacherComment(comment);
                          setShowCommentOptions(false);
                        }}
                        className="p-2 bg-white border border-gray-200 rounded cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-colors"
                      >
                        <p className="text-sm text-gray-700">{comment}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setShowCommentOptions(false)}
                    variant="outline"
                    size="sm"
                    className="mt-2 h-6 text-xs"
                  >
                    Close
                  </Button>
                </div>
              )}

              {/* Generate more options */}
              {useAutoComment && !showCommentOptions && (
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => setShowCommentOptions(true)}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Generate Options
                  </Button>
                  <span className="text-xs text-gray-500">
                    Click to select auto-comment
                  </span>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Position and performance summary - Compact */}
          {selectedStudent && (
            <div className="mb-4">
              {/* Status Indicator */}
              {studentResultData?.existingResult && (
            <Alert className={`mb-4 ${
              studentResultData.existingResult.status === 'Rejected' 
                ? 'bg-red-50 border-red-200' 
                : studentResultData.existingResult.status === 'Approved'
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              {studentResultData.existingResult.status === 'Rejected' && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Result Rejected by Admin</strong>
                    {studentResultData.existingResult.rejection_reason && (
                      <p className="text-sm mt-1">Reason: {studentResultData.existingResult.rejection_reason}</p>
                    )}
                    <p className="text-sm mt-2">You can now edit and resubmit this result.</p>
                  </AlertDescription>
                </>
              )}
              {studentResultData.existingResult.status === 'Approved' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Result Approved</strong> - This result has been approved and published.
                  </AlertDescription>
                </>
              )}
              {studentResultData.existingResult.status === 'Submitted' && (
                <>
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Result Pending Approval</strong> - This result is waiting for admin approval.
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}
          
          {/* Position and performance summary - Compact */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {studentsCompletion.find(s => s.studentId === selectedStudent.id)?.position || 0}
                    </p>
                    <p className="text-xs text-gray-600">Position</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">
                      {studentsCompletion.find(s => s.studentId === selectedStudent.id)?.totalStudents || 0}
                    </p>
                    <p className="text-xs text-gray-600">Total Students</p>
                  </div>
                </div>
            </div>
          )}

          {/* Class Teacher Comment - Compact */}
          <Card className="border-[#0A2540]/10 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-4 py-3 rounded-t-xl">
              <CardTitle className="text-base">Class Teacher Comment</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Auto-comment toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-comment"
                  checked={useAutoComment}
                  onChange={(e) => setUseAutoComment(e.target.checked)}
                  disabled={studentResultData?.isSubmitted && !studentResultData?.isRejected}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <Label htmlFor="auto-comment" className="text-sm text-gray-700">
                  Use auto-generated comment
                </Label>
              </div>

              {/* Generate more options */}
              {useAutoComment && !showCommentOptions && (
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => setShowCommentOptions(true)}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Generate Options
                  </Button>
                  <span className="text-xs text-gray-500">
                    Click to select auto-comment
                  </span>
                </div>
              )}

              {/* Auto-comment preview - Compact */}
              {useAutoComment && selectedStudent && studentResultData && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-semibold text-green-800 mb-1">Preview:</p>
                  <p className="text-xs text-green-700">
                    {generateAutoComment(
                      studentResultData.averageScore,
                      studentsCompletion.find(s => s.studentId === selectedStudent.id)?.position || 0,
                      studentsCompletion.find(s => s.studentId === selectedStudent.id)?.totalStudents || 0
                    )}
                  </p>
                </div>
              )}

              {/* Comment options */}
              {useAutoComment && showCommentOptions && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Select a comment:</p>
                  <div className="space-y-1">
                    {generateMultipleCommentOptions(
                      studentResultData?.averageScore || 0,
                      studentsCompletion.find(s => s.studentId === selectedStudent.id)?.position || 0,
                      studentsCompletion.find(s => s.studentId === selectedStudent.id)?.totalStudents || 0
                    ).map((comment: string, index: number) => (
                      <div
                        key={index}
                        onClick={() => {
                          setClassTeacherComment(comment);
                          setShowCommentOptions(false);
                        }}
                        className="p-2 bg-white border border-gray-200 rounded cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-colors"
                      >
                        <p className="text-sm text-gray-700">{comment}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setShowCommentOptions(false)}
                    variant="outline"
                    size="sm"
                    className="mt-2 h-6 text-xs"
                  >
                    Close
                  </Button>
                </div>
              )}

              <Textarea
                value={useAutoComment 
                  ? classTeacherComment || ""
                  : classTeacherComment || studentResultData?.existingResult?.class_teacher_comment || ""
                }
                onChange={(e) => !useAutoComment && setClassTeacherComment(e.target.value)}
                placeholder="Enter your comment for this student..."
                className="min-h-20 rounded-lg border-[#0A2540]/20 text-sm"
                disabled={useAutoComment || studentResultData?.existingResult?.status === 'Submitted' || studentResultData?.existingResult?.status === 'Approved'}
              />
              {studentResultData?.existingResult?.status === 'Submitted' && (
                <p className="text-xs text-gray-600 mt-1">
                  This result has been submitted and cannot be edited.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Submit Button - Compact */}
          <Card className="border-[#0A2540]/10 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#0A2540] font-medium text-sm mb-1">Ready to Submit?</p>
                  <p className="text-xs text-gray-600">
                    {studentResultData?.isComplete 
                      ? "All requirements met. Submit for approval." 
                      : "Complete all requirements before submitting."}
                  </p>
                </div>

                <Button
                  onClick={handleSubmitResult}
                  disabled={!studentResultData?.isComplete || (!useAutoComment && !classTeacherComment.trim()) || (useAutoComment && !classTeacherComment.trim() && !showCommentOptions) || (studentResultData?.isSubmitted && !studentResultData?.isRejected)}
                  className="bg-[#10B981] hover:bg-[#059669] text-white rounded-lg px-6 h-8 text-sm"
                >
                  <Send className="w-3 h-3 mr-1" />
                  {studentResultData?.isSubmitted && !studentResultData?.isRejected
                    ? 'Submitted'
                    : studentResultData?.isRejected
                    ? 'Resubmit'
                    : 'Submit'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

          </div>
  );
}

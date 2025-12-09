import { useState, useMemo, useEffect, useCallback } from "react";
import { 
  Upload, 
  Download, 
  Send,
  CheckSquare,
  CheckCircle,
  Edit3,
  Save,
  AlertCircle,
  RefreshCw,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { useSchool } from "../../contexts/SchoolContext";
import { toast } from 'sonner';

export function ScoreEntryPage() {
  const {
    currentUser,
    teachers,
    students,
    classes,
    getTeacherAssignments,
    scores,
    addScore,
    updateScore,
    approveScore,
    loadScoresFromAPI,
    currentTerm,
    currentAcademicYear,
    subjectAssignments,
    addNotification
  } = useSchool();

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [scoresData, setScoresData] = useState<Record<number, { ca1: string; ca2: string; exam: string }>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('');
  const [lastSavedData, setLastSavedData] = useState<Record<number, { ca1: string; ca2: string; exam: string }>>({});
  const [selectedTerm, setSelectedTerm] = useState<string>(currentTerm);
  const [selectedYear, setSelectedYear] = useState<string>(currentAcademicYear);

  // Get current teacher
  const currentTeacher = currentUser ? teachers.find(t => t.id === currentUser.linked_id) : null;
  const teacherAssignments = currentTeacher ? getTeacherAssignments(currentTeacher.id) : [];

    
  // For Score Entry, we only want classes where teacher has subject assignments
  // NOT classes where teacher is class teacher

  // Get unique classes from subject assignments ONLY
  const assignedClasses = useMemo(() => {
    const classMap = new Map();
    
    // Only add classes from subject assignments (not class teacher assignments)
    teacherAssignments.forEach(assignment => {
      if (!classMap.has(assignment.class_id)) {
        classMap.set(assignment.class_id, {
          id: assignment.class_id,
          name: assignment.class_name || 'Unknown Class'
        });
      }
    });
    
    const result = Array.from(classMap.values());
    console.log(`Assigned classes for teacher ${currentTeacher?.id}:`, result);
    return result;
  }, [teacherAssignments, currentTeacher]);

  // Get subjects for selected class
  const availableSubjects = useMemo(() => {
    if (!selectedClassId) return [];
    
    // Filter assignments for selected class and create unique subjects list
    const subjectsForClass = teacherAssignments.filter(a => a.class_id === Number(selectedClassId));
    
    if (subjectsForClass.length === 0) {
      console.warn(`No subject assignments found for teacher ${currentTeacher?.id} in class ${selectedClassId}`);
      return [];
    }
    
    // Create unique subjects map to avoid duplicates
    const uniqueSubjects = new Map();
    subjectsForClass.forEach(assignment => {
      const subjectKey = assignment.subject_id;
      if (!uniqueSubjects.has(subjectKey)) {
        uniqueSubjects.set(subjectKey, {
          id: assignment.id,
          subject_id: assignment.subject_id,
          subject_name: assignment.subject_name || 'Unknown Subject'
        });
      }
    });
    
    const result = Array.from(uniqueSubjects.values());
    console.log(`Available subjects for class ${selectedClassId}:`, result);
    return result;
  }, [selectedClassId, teacherAssignments, currentTeacher]);

  // Get students for selected class
  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students
      .filter(s => s.class_id === Number(selectedClassId) && s.status === 'Active')
      .sort((a, b) => {
        const firstNameA = (a.firstName || '').toLowerCase();
        const firstNameB = (b.firstName || '').toLowerCase();
        if (firstNameA !== firstNameB) {
          return firstNameA.localeCompare(firstNameB);
        }
        // If first names are the same, sort by last name
        const lastNameA = (a.lastName || '').toLowerCase();
        const lastNameB = (b.lastName || '').toLowerCase();
        return lastNameA.localeCompare(lastNameB);
      });
  }, [selectedClassId, students]);

  // Filter existing scores based on current selection
  const existingScores = useMemo(() => {
    if (!selectedSubjectId || !selectedClassId || !teacherAssignments.length) return [];
    
    const assignment = teacherAssignments.find(
      a => a.subject_id === Number(selectedSubjectId) && a.class_id === Number(selectedClassId)
    );
    
    if (!assignment) return [];
    
    const filteredScores = scores.filter(s => 
      s.subject_assignment_id === assignment.id &&
      s.term === selectedTerm &&
      s.academic_year === selectedYear
    );
    
    // Show all scores
    return filteredScores.map(score => ({
      ...score,
      student: students.find(s => s.id === score.student_id)
    }));
  }, [selectedSubjectId, selectedClassId, teacherAssignments, scores, selectedTerm, selectedYear]);

  // Auto-enable edit mode when there are rejected scores
  useEffect(() => {
    const hasRejectedScores = existingScores.some(s => s.status === 'Rejected');
    if (hasRejectedScores && !isEditMode) {
      setIsEditMode(true);
      toast.info("Edit mode enabled. Some scores were rejected and need correction.");
    }
    
    // Load rejected scores into form for editing
    if (hasRejectedScores) {
      const loadedScores: Record<number, { ca1: string; ca2: string; exam: string }> = {};
      existingScores.forEach((score: any) => {
        if (score.status === 'Rejected') {
          loadedScores[score.student_id] = {
            ca1: score.ca1.toString(),
            ca2: score.ca2.toString(),
            exam: score.exam.toString()
          };
        }
      });
      setScoresData(prev => ({ ...prev, ...loadedScores }));
    }
  }, [existingScores, isEditMode]);

  // Auto-save functionality
  const autoSaveScores = useCallback(async () => {
    if (!selectedClassId || !selectedSubjectId || !currentTeacher) {
      return;
    }

    // Check if data has changed since last save
    const dataChanged = JSON.stringify(scoresData) !== JSON.stringify(lastSavedData);
    if (!dataChanged) {
      return;
    }

    const assignment = teacherAssignments.find(
      a => a.subject_id === Number(selectedSubjectId) && a.class_id === Number(selectedClassId)
    );

    if (!assignment) {
      return;
    }

    // Only save non-empty scores as drafts
    const draftScores: Record<number, { ca1: string; ca2: string; exam: string }> = {};
    let hasValidScores = false;

    Object.entries(scoresData).forEach(([studentId, data]) => {
      if (data.ca1 || data.ca2 || data.exam) {
        draftScores[Number(studentId)] = data;
        hasValidScores = true;
      }
    });

    if (!hasValidScores) {
      return;
    }

    try {
      setAutoSaveStatus('Saving...');
      
      // Save each score as draft
      const savePromises: Promise<number | void>[] = [];
      
      Object.entries(draftScores).forEach(([studentId, data]: [string, any]) => {
        const studentIdNum = Number(studentId);
        const existingScore = existingScores.find((s: any) => s.student_id === studentIdNum);
        
        // Only save if it's a new score or existing draft
        if (!existingScore || existingScore.status === 'Draft') {
          const totalScore = parseFloat(calculateScore(data.ca1, data.ca2, data.exam).total) || 0;
          const grade = getGrade(totalScore);
          const remark = getRemark(totalScore);
          
          const scoreData = {
            student_id: studentIdNum,
            subject_assignment_id: assignment.id,
            subject_name: assignment.subject_name,
            ca1: parseFloat(data.ca1) || 0,
            ca2: parseFloat(data.ca2) || 0,
            exam: parseFloat(data.exam) || 0,
            total: totalScore,
            class_average: 0, // Will be calculated on submission
            class_min: 0, // Will be calculated on submission
            class_max: 0, // Will be calculated on submission
            grade,
            remark,
            subject_teacher: currentTeacher ? `${currentTeacher.firstName} ${currentTeacher.lastName}` : 'Unknown',
            entered_by: currentUser?.id || 0,
            entered_date: new Date().toISOString(),
            term: selectedTerm as 'First Term' | 'Second Term' | 'Third Term',
            academic_year: selectedYear,
            status: 'Draft' as const
          };

          if (existingScore) {
            savePromises.push(updateScore(existingScore.id, scoreData));
          } else {
            savePromises.push(addScore(scoreData));
          }
        }
      });

      await Promise.all(savePromises);
      setLastSavedData({ ...scoresData });
      setAutoSaveStatus('All changes saved');
      
      // Clear status after 2 seconds
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (error) {
      setAutoSaveStatus('Auto-save failed');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    }
  }, [scoresData, lastSavedData, selectedClassId, selectedSubjectId, selectedTerm, selectedYear, currentTeacher, teacherAssignments, existingScores, viewMode, currentUser]);

  // Auto-save on data change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      autoSaveScores();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [autoSaveScores]);

  // Get class and subject details
  const selectedClass = classes.find(c => c.id === Number(selectedClassId));
  const selectedAssignment = teacherAssignments.find(
    a => a.subject_id === Number(selectedSubjectId) && a.class_id === Number(selectedClassId)
  );

  // Calculate statistics
  const statistics = useMemo(() => {
    const totals = classStudents.map(student => {
      const data = scoresData[student.id];
      if (!data || !data.ca1 || !data.ca2 || !data.exam) return 0;
      return (parseFloat(data.ca1) || 0) + (parseFloat(data.ca2) || 0) + (parseFloat(data.exam) || 0);
    }).filter(t => t > 0);

    // Find student with highest score
    const highestScorer = classStudents.reduce((highest, student) => {
      const studentTotal = (parseFloat(scoresData[student.id]?.ca1) || 0) + 
                          (parseFloat(scoresData[student.id]?.ca2) || 0) + 
                          (parseFloat(scoresData[student.id]?.exam) || 0);
      const highestTotal = highest ? ((parseFloat(scoresData[highest.id]?.ca1) || 0) + 
                                   (parseFloat(scoresData[highest.id]?.ca2) || 0) + 
                                   (parseFloat(scoresData[highest.id]?.exam) || 0)) : 0;
      return studentTotal > highestTotal ? student : highest;
    }, null as typeof classStudents[0] | null);

    if (totals.length === 0) {
      return { average: 0, max: 0, min: 0, highestScorer: null };
    }

    return {
      average: (totals || []).length > 0 ? (totals.reduce((sum, t) => sum + t, 0) / (totals || []).length).toFixed(2) : '0.00',
      max: Math.max(...totals).toFixed(2),
      min: Math.min(...totals).toFixed(2),
      highestScorer
    };
  }, [scoresData, classStudents]);

  // Check if locked - only lock if results have been submitted and not in edit mode
  const isLocked = useMemo(() => {
    if (isEditMode) return false; // Allow editing in edit mode
    
    // Check if there are any submitted scores for this assignment, term, and year
    const submittedScores = existingScores.filter(s => s.status === 'Submitted');
    return submittedScores.length > 0;
  }, [existingScores, isEditMode]);

  // Check if there are any submitted scores to show status
  const hasSubmittedScores = useMemo(() => {
    return existingScores.some(s => s.status === 'Submitted');
  }, [existingScores]);

  // Initialize scores data when component loads or selection changes
  useEffect(() => {
    const initialData: Record<number, { ca1: string; ca2: string; exam: string }> = {};
    classStudents.forEach(student => {
      const existingScore = existingScores.find(s => s.student_id === student.id);
      initialData[student.id] = {
        ca1: existingScore?.ca1?.toString() || "",
        ca2: existingScore?.ca2?.toString() || "",
        exam: existingScore?.exam?.toString() || ""
      };
    });
    setScoresData(initialData);
    // Reset edit mode when selection changes
    setIsEditMode(false);
  }, [selectedClassId, selectedSubjectId, selectedTerm, selectedYear]);

  // Load existing scores when they change (but don't overwrite user input)
  useEffect(() => {
    if (existingScores.length > 0) {
      setScoresData(prev => {
        const updated = { ...prev };
        existingScores.forEach(score => {
          // Always load existing scores, regardless of current values
          updated[score.student_id] = {
            ca1: score.ca1?.toString() || "",
            ca2: score.ca2?.toString() || "",
            exam: score.exam?.toString() || ""
          };
        });
        console.log('Updated scoresData:', updated);
        return updated;
      });
    }
  }, [existingScores]); // Trigger when existingScores array changes

  // Debug: Force reload scores when component mounts
  useEffect(() => {
    console.log('ScoreEntryPage mounted, reloading scores from database...');
    // This will trigger the existingScores to update
    const reloadScores = async () => {
      try {
        await loadScoresFromAPI();
      } catch (error) {
        console.error('Failed to reload scores:', error);
      }
    };
    reloadScores();
  }, []); // Only run once on mount

  // Handle score input change
  const handleScoreChange = (studentId: number, field: 'ca1' | 'ca2' | 'exam', value: string) => {
    // Validate input
    const numValue = parseFloat(value);
    const maxValue = field === 'exam' ? 60 : 20;
    
    if (value && (isNaN(numValue) || numValue < 0 || numValue > maxValue)) {
      toast.error(`${field.toUpperCase()} must be between 0 and ${maxValue}`);
      return;
    }

    setScoresData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  
  // Calculate score
  const calculateScore = (ca1: string, ca2: string, exam: string) => {
    const ca1Num = parseFloat(ca1) || 0;
    const ca2Num = parseFloat(ca2) || 0;
    const examNum = parseFloat(exam) || 0;
    return {
      total: (ca1Num + ca2Num + examNum).toFixed(2)
    };
  };

  // Get grade based on total score
  const getGrade = (total: string | number) => {
    const score = parseFloat(total.toString()) || 0;
    if (score >= 70) return 'A';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    if (score >= 30) return 'E';
    return 'F';
  };

  // Get remark based on total score
  const getRemark = (total: string | number) => {
    const score = parseFloat(total.toString()) || 0;
    if (score >= 70) return 'Excellent';
    if (score >= 60) return 'Very Good';
    if (score >= 50) return 'Good';
    if (score >= 40) return 'Pass';
    if (score >= 30) return 'Fair';
    return 'Fail';
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      // Entering edit mode - show a message
      toast.info("Edit mode enabled. You can now modify submitted scores.");
    }
  };

  // Submit scores (Process Result)
  const handleSubmit = async () => {
    if (!selectedClassId || !selectedSubjectId || !currentTeacher) {
      toast.error("Please select class and subject");
      return;
    }

    // Check if at least some scores are entered
    const hasAnyScores = classStudents.some(student => {
      const data = scoresData[student.id];
      return data && (data.ca1 || data.ca2 || data.exam);
    });

    if (!hasAnyScores) {
      toast.error("Please enter scores for at least one student");
      return;
    }

    const assignment = teacherAssignments.find(
      a => a.subject_id === Number(selectedSubjectId) && a.class_id === Number(selectedClassId)
    );

    if (!assignment) {
      toast.error("Assignment not found");
      return;
    }

    // Calculate class statistics
    const participatingStudents = classStudents.filter(student => {
      const data = scoresData[student.id];
      return data && (data.ca1 || data.ca2 || data.exam);
    });

    if (participatingStudents.length === 0) {
      toast.error("Please enter scores for at least one student");
      return;
    }

    const allTotals = participatingStudents.map(student => {
      const data = scoresData[student.id];
      if (!data) return 0;
      return parseFloat(calculateScore(data.ca1, data.ca2, data.exam).total) || 0;
    });

    const classMax = Math.max(...allTotals);
    const classMin = Math.min(...allTotals);
    const classAverage = allTotals.reduce((sum, t) => sum + t, 0) / allTotals.length;

    // Save all scores
    let savedCount = 0;
    const savePromises: Promise<number | void>[] = [];
    
    classStudents.forEach((student) => {
      const data = scoresData[student.id];
      
      // Skip if no scores entered
      if (!data || (!data.ca1 && !data.ca2 && !data.exam)) return;
      
      const totalScore = parseFloat(calculateScore(data.ca1, data.ca2, data.exam).total) || 0;
      const grade = getGrade(totalScore);
      const remark = getRemark(totalScore);
      
      const existingScore = existingScores.find(s => s.student_id === student.id);

      const scoreData = {
        student_id: student.id,
        subject_assignment_id: assignment.id,
        subject_name: assignment.subject_name,
        ca1: parseFloat(data.ca1) || 0,
        ca2: parseFloat(data.ca2) || 0,
        exam: parseFloat(data.exam) || 0,
        total: totalScore,
        class_average: Math.round(classAverage * 100) / 100,
        class_min: classMin,
        class_max: classMax,
        grade,
        remark,
        subject_teacher: currentTeacher ? `${currentTeacher.firstName} ${currentTeacher.lastName}` : 'Unknown',
        entered_by: currentUser?.id || 0,
        entered_date: new Date().toISOString(),
        term: selectedTerm as 'First Term' | 'Second Term' | 'Third Term',
        academic_year: selectedYear,
        status: isEditMode ? 'Submitted' : 'Submitted' as const
      };

      if (existingScore) {
        savePromises.push(updateScore(existingScore.id, scoreData));
      } else {
        savePromises.push(addScore(scoreData));
      }
      savedCount++;
    });

    // Wait for all scores to be saved to database
    try {
      console.log('Attempting to save', savedCount, 'scores...');
      const results = await Promise.all(savePromises);
      console.log('All scores saved successfully:', results);
      
      if (isEditMode) {
        toast.success(`Scores updated successfully! ${savedCount} student(s) updated.`);
        setIsEditMode(false); // Exit edit mode after successful update
      } else {
        toast.success(`Scores submitted successfully! ${savedCount} student(s) recorded.`);
      }

      // Create notification for class teacher
      console.log('Creating notification for class teacher...');
      const classInfo = classes.find(c => c.id === Number(selectedClassId));
      if (classInfo?.classTeacherId) {
        const classTeacher = teachers.find(t => t.id === classInfo.classTeacherId);
        if (classTeacher) {
          console.log('Found class teacher:', classTeacher.firstName, classTeacher.lastName);
          
          // Create notification for class teacher to review submitted scores
          await addNotification({
            title: `Scores Submitted for Review - ${assignment.subject_name}`,
            message: `${currentTeacher.firstName} ${currentTeacher.lastName} has submitted scores for ${selectedClass?.name} - ${assignment.subject_name}. Please review and approve or reject.`,
            type: "info",
            targetAudience: "teachers",
            sentBy: currentUser?.id || 0,
            sentDate: new Date().toISOString(),
            isRead: false,
            readBy: []
          });
          
          toast.success(`Scores submitted! ${classTeacher.firstName} ${classTeacher.lastName} notified for review.`);
        } else {
          toast.success(`Scores submitted! ${savedCount} student(s) recorded.`);
        }
      } else {
        toast.success(`Scores submitted! ${savedCount} student(s) recorded.`);
      }
    } catch (error: unknown) {
      console.error('Error saving scores:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save scores: ${errorMessage}`);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    let csv = `S/No,Reg ID,Student Name,1st CA[20],2nd CA[20],Exams[60],Total [100]\n`;
    
    classStudents.forEach((student, index) => {
      const data = scoresData[student.id] || { ca1: '', ca2: '', exam: '' };
      const total = data.ca1 && data.ca2 && data.exam ? calculateScore(data.ca1, data.ca2, data.exam).total : 0;
      csv += `${index + 1},${student.admissionNumber},"${student.firstName} ${student.lastName}",${data.ca1},${data.ca2},${data.exam},${total}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedAssignment?.class_name || '-'} - ${selectedAssignment?.subject_name || '-'}_${currentTerm}_${currentAcademicYear}.csv`;
    a.click();
    
    toast.success("Excel file exported successfully!");
  };

  // Resubmit rejected scores
  const handleResubmit = async () => {
    if (!selectedClassId || !selectedSubjectId || !currentTeacher) {
      toast.error("Please select class and subject");
      return;
    }

    const assignment = teacherAssignments.find(
      a => a.subject_id === Number(selectedSubjectId) && a.class_id === Number(selectedClassId)
    );

    if (!assignment) {
      toast.error("Assignment not found");
      return;
    }

    // Get only the rejected scores that have been modified
    const rejectedScores = existingScores.filter(s => s.status === 'Rejected');
    const modifiedRejectedScores = rejectedScores.filter(score => {
      const data = scoresData[score.student_id];
      if (!data) return false;
      
      const originalTotal = score.total;
      const newTotal = parseFloat(calculateScore(data.ca1, data.ca2, data.exam).total) || 0;
      
      // Check if any score values have changed
      return (
        (data.ca1 && parseFloat(data.ca1) !== score.ca1) ||
        (data.ca2 && parseFloat(data.ca2) !== score.ca2) ||
        (data.exam && parseFloat(data.exam) !== score.exam) ||
        newTotal !== originalTotal
      );
    });

    if (modifiedRejectedScores.length === 0) {
      toast.error("Please make corrections to at least one rejected score");
      return;
    }

    // Calculate class statistics for modified scores
    const allTotals = modifiedRejectedScores.map(score => {
      const data = scoresData[score.student_id];
      if (!data) return 0;
      return parseFloat(calculateScore(data.ca1, data.ca2, data.exam).total) || 0;
    });

    const classMax = Math.max(...allTotals);
    const classMin = Math.min(...allTotals);
    const classAverage = allTotals.reduce((sum, t) => sum + t, 0) / allTotals.length;

    // Update the rejected scores
    let resubmittedCount = 0;
    const updatePromises: Promise<void>[] = [];

    for (const score of modifiedRejectedScores) {
      const data = scoresData[score.student_id];
      if (!data) continue;

      const totalScore = parseFloat(calculateScore(data.ca1, data.ca2, data.exam).total) || 0;
      const grade = getGrade(totalScore);
      const remark = getRemark(totalScore);

      const scoreData = {
        ...score,
        ca1: parseFloat(data.ca1) || 0,
        ca2: parseFloat(data.ca2) || 0,
        exam: parseFloat(data.exam) || 0,
        total: totalScore,
        class_average: Math.round(classAverage * 100) / 100,
        class_min: classMin,
        class_max: classMax,
        grade,
        remark,
        entered_date: new Date().toISOString(),
        status: 'Submitted' as const,
        rejection_reason: undefined,
        rejected_by: undefined,
        rejected_date: undefined
      };

      updatePromises.push(updateScore(score.id, scoreData));
      resubmittedCount++;
    }

    try {
      console.log('Attempting to resubmit', resubmittedCount, 'rejected scores...');
      await Promise.all(updatePromises);
      console.log('All rejected scores resubmitted successfully');
      
      toast.success(`Rejected scores resubmitted successfully! ${resubmittedCount} score(s) corrected and sent for review.`);
      
      // Clear the scores data for resubmitted scores
      const newScoresData = { ...scoresData };
      modifiedRejectedScores.forEach(score => {
        delete newScoresData[score.student_id];
      });
      setScoresData(newScoresData);
      
      // Switch back to normal mode after resubmission
      setIsEditMode(false);
    } catch (error: unknown) {
      console.error('Error resubmitting scores:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to resubmit scores: ${errorMessage}`);
    }
  };

  // Import from Excel
  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("Invalid Excel/CSV file");
        return;
      }

      // Skip header
      const dataLines = lines.slice(1);
      let importedCount = 0;
      let errorCount = 0;

      dataLines.forEach(line => {
        // Handle CSV with quoted strings
        const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
        if (parts.length < 7) return;

        const [sno, regId, name, ca1, ca2, exam, total] = parts.map(p => p.replace(/^"|"$/g, '').trim());
        
        // Find student by registration number
        const student = classStudents.find(s => s.admissionNumber === regId);
        if (!student) {
          errorCount++;
          return;
        }

        // Validate scores
        const c1 = parseFloat(ca1);
        const c2 = parseFloat(ca2);
        const ex = parseFloat(exam);

        if ((ca1 && (isNaN(c1) || c1 < 0 || c1 > 20)) ||
            (ca2 && (isNaN(c2) || c2 < 0 || c2 > 20)) ||
            (exam && (isNaN(ex) || ex < 0 || ex > 60))) {
          errorCount++;
          return;
        }

        setScoresData(prev => ({
          ...prev,
          [student.id]: {
            ca1: ca1 || '',
            ca2: ca2 || '',
            exam: exam || ''
          }
        }));
        importedCount++;
      });

      if (importedCount > 0) {
        toast.success(`Imported ${importedCount} student scores`);
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} entries had errors and were skipped`);
      }
    };

    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] p-6">
      {/* Header Section */}
      <div className="mb-6">
        {/* Edit Mode Indicator */}
        {isEditMode && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <Edit3 className="w-4 h-4 mr-2 text-amber-600" />
              <span className="text-amber-800 font-medium">Edit Mode Enabled</span>
              <span className="ml-2 text-amber-600 text-sm">- You can modify submitted scores</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[#2563EB] mb-1">✏️ STUDENTS ASSESSMENT SCORE</h2>
            <p className="text-[#6B7280]">
              {currentTerm.toUpperCase()} - {currentAcademicYear}
            </p>
          </div>
          
                    
          <div className="flex gap-3">
            <Button
              onClick={handleExportExcel}
              className="bg-[#06B6D4] hover:bg-[#0891B2] text-white rounded-lg"
              disabled={!selectedClassId || !selectedSubjectId}
            >
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
            
            <div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleImportExcel}
                className="hidden"
                disabled={!selectedClassId || !selectedSubjectId}
                id="excel-upload-input"
              />
              <Button
                type="button"
                className="bg-[#10B981] hover:bg-[#059669] text-white rounded-lg"
                disabled={!selectedClassId || !selectedSubjectId}
                onClick={() => document.getElementById('excel-upload-input')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Excel File
              </Button>
            </div>

                      </div>
        </div>
      </div>

      {/* Selection Section */}
      <Card className="mb-6 rounded-xl bg-white border border-[#E5E7EB]">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label className="text-[#1F2937] mb-2 block">Select Class</Label>
              <Select value={selectedClassId} onValueChange={(value: string) => {
                setSelectedClassId(value);
                setSelectedSubjectId("");
              }}>
                <SelectTrigger className="rounded-lg border-[#E5E7EB]">
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {assignedClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#1F2937] mb-2 block">Select Subject</Label>
              <Select 
                value={selectedSubjectId} 
                onValueChange={setSelectedSubjectId}
                disabled={!selectedClassId}
              >
                <SelectTrigger className="rounded-lg border-[#E5E7EB]">
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.subject_id.toString()}>
                      {subject.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#1F2937] mb-2 block">Select Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="rounded-lg border-[#E5E7EB]">
                  <SelectValue placeholder="Choose term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">First Term</SelectItem>
                  <SelectItem value="Second Term">Second Term</SelectItem>
                  <SelectItem value="Third Term">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#1F2937] mb-2 block">Academic Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="rounded-lg border-[#E5E7EB]">
                  <SelectValue placeholder="Choose year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023/2024">2023/2024</SelectItem>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                  <SelectItem value="2026/2027">2026/2027</SelectItem>
                  <SelectItem value="2027/2028">2027/2028</SelectItem>
                  <SelectItem value="2028/2029">2028/2029</SelectItem>
                  <SelectItem value="2029/2030">2029/2030</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {selectedClassId && selectedSubjectId && classStudents.length > 0 ? (
        <Card className="rounded-xl bg-white border border-[#E5E7EB] shadow-lg">
          <CardHeader className="border-b border-[#E5E7EB] bg-white p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">GRA</span>
                </div>
                <h1 className="text-[#1F2937] mb-1">Graceland Royal Academy</h1>
                <p className="text-[#6B7280] text-sm">Student's Assessment Score - {selectedTerm.toUpperCase()} - {selectedYear}</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-[#F9FAFB] p-4 rounded-lg">
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Class Name</p>
                <p className="text-sm text-[#1F2937]">{selectedClass?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Subject</p>
                <p className="text-sm text-[#1F2937]">{selectedAssignment?.subject_name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Average Score</p>
                <p className="text-sm text-[#1F2937]">{statistics.average}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Max:</p>
                <p className="text-sm text-[#1F2937]">{statistics.max}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Min:</p>
                <p className="text-sm text-[#1F2937]">{statistics.min}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Highest Scorer</p>
                <p className="text-sm text-[#1F2937] font-semibold text-green-600">
                  {statistics.highestScorer ? 
                    `${statistics.highestScorer.firstName} ${statistics.highestScorer.lastName}` : 
                    '-'
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#6B7280] mb-1">Teacher</p>
                <p className="text-sm text-[#1F2937]">{currentTeacher ? `${currentTeacher.firstName || ''} ${currentTeacher.lastName || ''}`.toUpperCase() : 'TEACHER'}</p>
              </div>
            </div>

            {/* Auto-save Status */}
            {autoSaveStatus && (
              <div className="mt-4 flex items-center justify-center">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  autoSaveStatus === 'All changes saved' 
                    ? 'bg-green-100 text-green-700' 
                    : autoSaveStatus === 'Saving...'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  <Clock className="w-4 h-4" />
                  {autoSaveStatus}
                </div>
              </div>
            )}

            {/* Freeze Status Indicator */}
            {hasSubmittedScores && (
              <div className="mt-4 flex items-center justify-center">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                  Scores are frozen - submitted for review
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {/* Rejected Scores Alert */}
            {existingScores.some(s => s.status === 'Rejected') && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Rejected Scores Found
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>You have {existingScores.filter(s => s.status === 'Rejected').length} rejected score(s) that need correction. Make the necessary changes and click "Resubmit Corrected Scores".</p>
                      {existingScores.filter(s => s.status === 'Rejected').map(score => (
                        <div key={score.id} className="mt-2 p-2 bg-white rounded border border-red-200">
                          <p className="font-medium">{students.find(s => s.id === score.student_id)?.firstName} {students.find(s => s.id === score.student_id)?.lastName}</p>
                          {score.rejection_reason && (
                            <p className="text-xs text-gray-600 mt-1">Reason: {score.rejection_reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No Rejected Scores Message */}
            {viewMode === 'rejected' && existingScores.length === 0 && selectedClassId && selectedSubjectId && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 m-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      No Rejected Scores
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Great! All your scores for this class and subject have been approved.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <th className="text-left p-3 text-sm text-[#1F2937]">S/No.</th>
                    <th className="text-left p-3 text-sm text-[#1F2937]">Reg ID</th>
                    <th className="text-left p-3 text-sm text-[#1F2937]">Student Name</th>
                    <th className="text-center p-3 text-sm text-[#1F2937]">1st CA[20]</th>
                    <th className="text-center p-3 text-sm text-[#1F2937]">2nd CA[20]</th>
                    <th className="text-center p-3 text-sm text-[#1F2937]">Exams[60]</th>
                    <th className="text-center p-3 text-sm text-[#1F2937]">Total [100]</th>
                    <th className="text-center p-3 text-sm text-[#1F2937]">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((student, index) => {
                    const data = scoresData[student.id] || { ca1: '', ca2: '', exam: '' };
                    const { total } = calculateScore(data.ca1, data.ca2, data.exam);
                    const hasScore = data.ca1 || data.ca2 || data.exam;
                    
                    // Check if this specific student's score is submitted (and not in edit mode)
                    const studentScore = existingScores.find(s => s.student_id === student.id);
                    const isStudentLocked = studentScore?.status === 'Submitted' && !isEditMode;

                    return (
                      <tr key={student.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                        <td className="p-3 text-sm text-[#6B7280]">{index + 1}</td>
                        <td className="p-3 text-sm text-[#1F2937]">{student.admissionNumber}</td>
                        <td className="p-3 text-sm text-[#2563EB]">
                          {student.firstName} {student.lastName} {student.otherName || ''}
                        </td>
                        <td className="p-2 text-center">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={data.ca1}
                            onChange={(e) => handleScoreChange(student.id, 'ca1', e.target.value)}
                            className="w-20 mx-auto text-center rounded-lg border-[#E5E7EB] text-sm"
                            disabled={isStudentLocked}
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={data.ca2}
                            onChange={(e) => handleScoreChange(student.id, 'ca2', e.target.value)}
                            className="w-20 mx-auto text-center rounded-lg border-[#E5E7EB] text-sm"
                            disabled={isStudentLocked}
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Input
                            type="number"
                            min="0"
                            max="60"
                            value={data.exam}
                            onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                            className="w-20 mx-auto text-center rounded-lg border-[#E5E7EB] text-sm"
                            disabled={isStudentLocked}
                            placeholder="0"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-sm ${hasScore ? 'text-[#1F2937]' : 'text-[#9CA3AF]'}`}>
                            {hasScore ? total : '0'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-sm font-bold ${
                            parseFloat(total) >= 70 ? 'text-green-600' : 
                            parseFloat(total) >= 60 ? 'text-blue-600' : 
                            parseFloat(total) >= 50 ? 'text-yellow-600' : 
                            parseFloat(total) >= 40 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {getGrade(total)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5E7EB] bg-[#F9FAFB]">
              <Button
                variant="outline"
                className="rounded-lg border-[#E5E7EB] text-[#6B7280]"
                onClick={() => {
                  // Reset form
                  setScoresData({});
                  setIsEditMode(false);
                }}
              >
                Cancel
              </Button>
              
              {existingScores.some(s => s.status === 'Rejected') ? (
                <Button
                  onClick={handleResubmit}
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                  disabled={isLocked}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resubmit Corrected Scores
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg"
                  disabled={isLocked}
                >
                  {isEditMode ? <Save className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {isEditMode ? 'Update Scores' : 'Submit'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-xl bg-white border border-[#E5E7EB]">
          <CardContent className="p-12 text-center">
            <p className="text-[#6B7280] mb-2">Please select a class and subject to begin</p>
            <p className="text-sm text-[#9CA3AF]">Your assigned classes and subjects will appear in the dropdowns above</p>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-sm text-[#6B7280]">Graceland Royal Academy</p>
        <p className="text-xs text-[#9CA3AF] mt-1">Techvibes International Limited © - 2025</p>
      </div>
    </div>
  );
}

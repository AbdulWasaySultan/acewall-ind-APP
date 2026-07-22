export interface Assessment {
  assessmentId: string;
  assessmentTitle: string;
  category: string;
  maxPoints: number;
  studentPoints: number;
  isDiscussion: boolean;
}

export interface StandardGradeBlock {
  finalGrade?: number;
  grade?: number;
  points: number;
  remarks: string;
}

export interface Quarter {
  quarterId: string;
  quarterTitle: string;
  grade?: number;
  gpa?: number;
  letterGrade?: string;
  standardGrade?: StandardGradeBlock;
  assessments: Assessment[];
}

export interface Semester {
  semesterId: string;
  semesterTitle: string;
  grade?: number;
  letterGrade?: string;
  standardGrade?: StandardGradeBlock;
  quarters: Quarter[];
}

export interface Student {
  studentId: string;
  studentName: string;
  gradingSystem: "normalGrading" | "StandardGrading";
  courseType: "semester-based" | "chapter-based";
  gpa?: number;
  finalGrade?: number;
  letterGrade?: string;
  standardGrade?: StandardGradeBlock;
  semesters?: Semester[];
  chapters?: Assessment[];
}

export interface GradebookData {
  gradebook: Student[];
  gradingSystem: "normalGrading" | "StandardGrading";
  courseType: "semester-based" | "chapter-based";
}

export interface GradeScaleItem {
  _id: string;
  grade: string;
  min: number;
  max: number;
}

export interface GPAItem {
  _id: string;
  gpa: number;
  minPercentage: number;
  maxPercentage: number;
}

export interface SBLItem {
  _id?: string;
  points: number;
  minPercentage: number;
  maxPercentage: number;
  remarks: string;
}

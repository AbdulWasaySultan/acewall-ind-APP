export interface Assessment {
  assessmentId: string;
  assessmentTitle: string;
  category: string;
  maxPoints: number;
  studentPoints: number;
  isDiscussion: boolean;
}

export interface Quarter {
  quarterId: string;
  quarterTitle: string;
grade: number;
  gpa: number;
  letterGrade: string;
  assessments: Assessment[];
}

export interface Semester {
  semesterId: string;
  semesterTitle: string;
  quarters: Quarter[];
}

export interface Student {
  studentId: string;
  studentName: string;
  gpa: number;
  finalGrade: number;
  letterGrade: string;
  semesters: Semester[];
  assessments: Assessment[];
  hasSemesterStructure: boolean;
}

export interface GradebookData {
  courseId: string;
  total: number;
  page: number;
  limit: number;
  gradebook: Student[];
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
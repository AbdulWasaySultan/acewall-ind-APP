import { axiosInstance } from "@/lib/AxiosInstance";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart2, ChevronDown, ChevronRight } from "lucide-react";
import BackButton from "@/CustomComponent/BackButton";
import { Button } from "@/components/ui/button";

const StudentCourseGrades = () => {
  const { studentId, courseId } = useParams();
  const [gradeData, setGradeData] = useState(null);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [expandedSemesters, setExpandedSemesters] = useState(new Set());
  const [expandedQuarters, setExpandedQuarters] = useState(new Set());
  const [expandedChapters, setExpandedChapters] = useState(false);

  const toggleSubjectExpand = (courseId) => {
    setExpandedSubjectId(expandedSubjectId === courseId ? null : courseId);
  };

  const toggleSemesterExpand = (semesterId) => {
    const newExpanded = new Set(expandedSemesters);
    newExpanded.has(semesterId)
      ? newExpanded.delete(semesterId)
      : newExpanded.add(semesterId);
    setExpandedSemesters(newExpanded);
  };

  const toggleQuarterExpand = (quarterId) => {
    const newExpanded = new Set(expandedQuarters);
    newExpanded.has(quarterId)
      ? newExpanded.delete(quarterId)
      : newExpanded.add(quarterId);
    setExpandedQuarters(newExpanded);
  };

  const toggleChapters = () => {
    setExpandedChapters(!expandedChapters);
  };

  useEffect(() => {
    const fetchStudentGradeforCourse = async () => {
      try {
        const res = await axiosInstance.get(
          `gradebook/getGradebooksOfStudentCourseFormatted/${studentId}/${courseId}`
        );
        setGradeData(res.data);
      } catch (err) {
        console.log("Error fetching grades:", err);
      }
    };
    fetchStudentGradeforCourse();
  }, [studentId, courseId]);

  if (!gradeData) {
    return <div className="p-4">Loading...</div>;
  }

  // Grading system detection
  const hasSemesters = gradeData?.semesters && gradeData.semesters.length > 0;
  const hasDirectAssessments =
    gradeData?.courseType?.toLowerCase() === "chapter-based";
  const isNormalGrading =
    !gradeData?.standardGrade && !gradeData?.directAssessments?.standardGrade;

  console.log(isNormalGrading);

  // Helper functions to extract grades
  const getGradeInfo = (obj) => {
    if (!obj)
      return {
        percentage: "--",
        grade: "--",
        gpa: "--",
        points: "--",
        remarks: "--",
      };

    if (isNormalGrading) {
      return {
        percentage: obj.grade?.toFixed(2) || "--",
        grade: obj.letterGrade || "--",
        gpa: obj.gpa?.toString() || "--",
        isNormal: true,
      };
    } else {
      const stdGrade = obj.standardGrade || obj;
      return {
        percentage:
          stdGrade?.finalGrade?.toFixed(2) ||
          stdGrade?.grade?.toFixed(2) ||
          "--",
        points: stdGrade?.points?.toString() || "--",
        remarks: stdGrade?.remarks || "--",
        isNormal: false,
      };
    }
  };

  const finalGrade = getGradeInfo(gradeData);

  const getGradeColor = (grade) => {
    if (!grade || grade === "--") return "bg-gray-100 text-gray-800";
    const firstLetter = grade.charAt(0).toUpperCase();
    switch (firstLetter) {
      case "A":
        return "bg-green-100 text-green-800";
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C":
        return "bg-yellow-100 text-yellow-800";
      case "D":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getPercentageColor = (percentage) => {
    const num = parseFloat(percentage);
    if (isNaN(num)) return "bg-gray-100 text-gray-800";
    if (num >= 90) return "bg-green-100 text-green-800";
    if (num >= 80) return "bg-blue-100 text-blue-800";
    if (num >= 70) return "bg-yellow-100 text-yellow-800";
    if (num >= 60) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div>
      <BackButton className="mb-10" />

      {/* Course Header */}
      <div className="mb-6 p-4 bg-white shadow-md rounded-2xl transition duration-300 hover:shadow-lg">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="font-extrabold text-2xl text-gray-800 mb-2">
              {gradeData?.course?.courseTitle}
            </h2>
            <Link to={`/teacher/analytics/${courseId}/${studentId}`}>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <BarChart2 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <div className="flex gap-2 mb-2">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {hasSemesters ? "Semester-based" : "Direct Assessments"}
              </span>
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                {isNormalGrading ? "Normal Grading" : "Standard Grading"}
              </span>
            </div>
          </div>

          {gradeData?.course?.thumbnail?.url && (
            <div className="overflow-hidden rounded-lg ml-4">
              <img
                src={gradeData.course.thumbnail.url}
                alt="Course Thumbnail"
                className="w-[150px] h-[100px] object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}
        </div>

        {gradeData?.course?.courseDescription && (
          <p className="text-gray-600 mt-4 text-base leading-relaxed">
            {gradeData.course.courseDescription}
          </p>
        )}

        {/* Grade Summary Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
              Final Grade
            </p>
            <p className="text-2xl font-bold text-blue-900">
              {finalGrade.percentage}
              {isNormalGrading ? "%" : ""}
            </p>
          </div>

          {isNormalGrading ? (
            <>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                  Letter Grade
                </p>
                <p
                  className={`text-2xl font-bold px-2 py-1 rounded text-center ${getGradeColor(
                    finalGrade.grade
                  )}`}
                >
                  {finalGrade.grade}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                  GPA
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {finalGrade.gpa}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                  Points Earned
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {finalGrade.points} pts
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
                  Remarks
                </p>
                <p
                  className="text-lg font-semibold text-amber-900 truncate"
                  title={finalGrade.remarks}
                >
                  {finalGrade.remarks}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grades Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Percentage</TableHead>
              {isNormalGrading ? (
                <>
                  <TableHead>Letter Grade</TableHead>
                  <TableHead>GPA</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Points</TableHead>
                  <TableHead>Remarks</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="text-xs md:text-sm">
              <TableCell
                className="cursor-pointer hover:text-blue-600 flex items-center gap-2 font-medium"
                onClick={() => toggleSubjectExpand(courseId)}
              >
                {expandedSubjectId === courseId ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <span>{gradeData?.courseName}</span>
              </TableCell>
              <TableCell className="font-semibold">
                {finalGrade.percentage}
                {isNormalGrading ? "%" : ""}
              </TableCell>
              {isNormalGrading ? (
                <>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(
                        finalGrade.grade
                      )}`}
                    >
                      {finalGrade.grade}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {finalGrade.gpa}
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="font-semibold">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {finalGrade.points} pts
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {finalGrade.remarks}
                  </TableCell>
                </>
              )}
            </TableRow>

            {expandedSubjectId === courseId && (
              <TableRow className="bg-muted/50">
                <TableCell colSpan={4} className="p-0">
                  <div className="p-4 space-y-6">
                    {/* Direct Assessments */}
                    {hasDirectAssessments && (
                      <DirectAssessmentSection
                        data={gradeData.chapters}
                        isExpanded={expandedChapters}
                        onToggle={toggleChapters}
                        isNormalGrading={isNormalGrading}
                        getGradeInfo={getGradeInfo}
                      />
                    )}

                    {/* Semester-based Course */}
                    {hasSemesters &&
                      gradeData.semesters.map((semester) => (
                        <SemesterSection
                          key={semester.semesterId}
                          semester={semester}
                          isNormalGrading={isNormalGrading}
                          expandedSemesters={expandedSemesters}
                          expandedQuarters={expandedQuarters}
                          toggleSemesterExpand={toggleSemesterExpand}
                          toggleQuarterExpand={toggleQuarterExpand}
                          getGradeInfo={getGradeInfo}
                        />
                      ))}

                    {/* No assessments message */}
                    {!hasSemesters && !hasDirectAssessments && (
                      <div className="text-center py-6 text-gray-500">
                        No assessments found for this course.
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Direct Assessments Section Component
const DirectAssessmentSection = ({
  data,
  isExpanded,
  onToggle,
  isNormalGrading,
  getGradeInfo,
}) => {
  const gradeInfo = getGradeInfo(data);

  return (
    <div className="space-y-4">
      <div
        className="flex items-center gap-2 cursor-pointer hover:text-blue-600 font-medium text-lg"
        onClick={onToggle}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
        <span>Course Assessments</span>
      </div>

      {isExpanded && (
        <div className="ml-6">
          <AssessmentTable title="Assessments" items={data} />
        </div>
      )}
    </div>
  );
};

// Semester Section Component
const SemesterSection = ({
  semester,
  isNormalGrading,
  expandedSemesters,
  expandedQuarters,
  toggleSemesterExpand,
  toggleQuarterExpand,
  getGradeInfo,
}) => {
  const isExpanded = expandedSemesters.has(semester.semesterId);
  const gradeInfo = getGradeInfo(semester);

  return (
    <div key={semester.semesterId} className="space-y-4">
      <div
        className="flex items-center gap-2 cursor-pointer hover:text-blue-600 font-medium text-lg"
        onClick={() => toggleSemesterExpand(semester.semesterId)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
        <span>{semester.semesterTitle}</span>
      </div>

      {isExpanded && (
        <div className="ml-6 space-y-4">
          {semester.quarters?.map((quarter) => (
            <QuarterSection
              key={quarter.quarterId}
              quarter={quarter}
              isNormalGrading={isNormalGrading}
              expandedQuarters={expandedQuarters}
              toggleQuarterExpand={toggleQuarterExpand}
              getGradeInfo={getGradeInfo}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Quarter Section Component
const QuarterSection = ({
  quarter,
  isNormalGrading,
  expandedQuarters,
  toggleQuarterExpand,
  getGradeInfo,
}) => {
  const isExpanded = expandedQuarters.has(quarter.quarterId);
  const gradeInfo = getGradeInfo(quarter);

  return (
    <div key={quarter.quarterId} className="space-y-2">
      <div
        className="flex items-center gap-2 cursor-pointer hover:text-blue-600 font-medium"
        onClick={() => toggleQuarterExpand(quarter.quarterId)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
        <span>{quarter.quarterTitle}</span>
      </div>

      {isExpanded && (
        <div className="ml-6">
          <AssessmentTable
            title="Assessments"
            items={quarter.assessments || []}
          />
        </div>
      )}
    </div>
  );
};

// Assessment Table Component
const AssessmentTable = ({ title, items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic mb-4">
        No {title.toLowerCase()} available
      </div>
    );
  }

  return (
    <div className="space-y-2 mb-6">
      <h4 className="font-medium text-sm text-gray-700">{title}</h4>
      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs">Assessment</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Score</TableHead>
              <TableHead className="text-xs">Max Points</TableHead>
              <TableHead className="text-xs">Percentage</TableHead>
              <TableHead className="text-xs">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const percentage =
                item.maxPoints > 0
                  ? ((item.studentPoints / item.maxPoints) * 100).toFixed(1)
                  : 0;
              return (
                <TableRow
                  key={`${item.assessmentId}-${index}`}
                  className="text-xs hover:bg-gray-50"
                >
                  <TableCell className="font-medium">
                    {item.assessmentTitle}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.studentPoints}/{item.maxPoints}
                  </TableCell>
                  <TableCell>{item.maxPoints}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPercentageColor(
                        percentage
                      )}`}
                    >
                      {percentage}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.isDiscussion
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.isDiscussion ? "Discussion" : "Assessment"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const getPercentageColor = (percentage) => {
  const num = parseFloat(percentage);
  if (isNaN(num)) return "bg-gray-100 text-gray-800";
  if (num >= 90) return "bg-green-100 text-green-800";
  if (num >= 80) return "bg-blue-100 text-blue-800";
  if (num >= 70) return "bg-yellow-100 text-yellow-800";
  if (num >= 60) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};

export default StudentCourseGrades;

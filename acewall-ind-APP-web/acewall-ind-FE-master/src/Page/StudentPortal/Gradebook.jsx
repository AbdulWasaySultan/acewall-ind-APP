"use client";

import React, { useState, useEffect } from "react";

import {
  ChevronDown,
  ChevronRight,
  Loader,
  Download,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Link } from "react-router-dom";

// AssessmentTable component (Helper)
const AssessmentTable = ({ assessments = [], parentTitle = "Assessments" }) => {
  if (!assessments || assessments.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic p-4" role="status">
        No assessments available
      </div>
    );
  }

  return (
    // Added role="region" and aria-label for accessibility
    <div
      className="border rounded-lg overflow-hidden mt-2"
      role="region"
      aria-label={`${parentTitle} Details`}
    >
      <Table>
        {/* Added caption for screen reader users */}
        <caption className="sr-only">
          Detailed results for {parentTitle}
        </caption>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {/* Added scope="col" for proper table header semantics */}
            <TableHead scope="col" className="text-xs">
              Assessment
            </TableHead>
            <TableHead scope="col" className="text-xs">
              Category
            </TableHead>
            <TableHead scope="col" className="text-xs">
              Score
            </TableHead>
            <TableHead scope="col" className="text-xs">
              Max Points
            </TableHead>
            <TableHead scope="col" className="text-xs">
              Percentage
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((assessment, index) => {
            const percentage =
              assessment.maxPoints > 0
                ? (
                    (assessment.studentPoints / assessment.maxPoints) *
                    100
                  ).toFixed(1)
                : "0.0";

            // Unique ID for manual check status announcement
            const statusId = `manual-check-status-${assessment._id || index}`;

            return (
              <TableRow key={assessment._id || index} className={`text-xs`}>
                {/* Added scope="row" for the primary item in the row */}
                <TableCell scope="row" className="font-medium">
                  {assessment.assessmentTitle}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {assessment.category}
                  </Badge>
                </TableCell>
                <TableCell>{assessment.studentPoints}</TableCell>
                <TableCell>{assessment.maxPoints}</TableCell>
                <TableCell>
                  <span
                    className={`font-medium ${
                      Number.parseFloat(percentage) >= 90
                        ? "text-green-600"
                        : Number.parseFloat(percentage) >= 80
                        ? "text-blue-600"
                        : Number.parseFloat(percentage) >= 70
                        ? "text-yellow-600"
                        : Number.parseFloat(percentage) >= 60
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}
                  >
                    {percentage}%
                  </span>
                  {/* Added aria-describedby to link status text to the cell content */}
                  {assessment.isGraded === false && (
                    <span
                      id={statusId}
                      className={`text-xs text-gray-500 ml-2 ${
                        assessment.isGraded === false && "text-yellow-500"
                      } `}
                      role="status" // Helps screen readers announce this status
                      aria-live="polite"
                    >
                      (Manual check is required by teacher)
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

// Helper function for letter grade color (no changes needed)
const getLetterGradeColor = (letterGrade) => {
  if (["A", "A-", "A+"].includes(letterGrade)) {
    return "bg-green-100 text-green-800";
  } else if (["B", "B-", "B+"].includes(letterGrade)) {
    return "bg-blue-100 text-blue-800";
  } else if (["C", "C-", "C+"].includes(letterGrade)) {
    return "bg-yellow-100 text-yellow-800";
  } else if (["D", "D-", "D+"].includes(letterGrade)) {
    return "bg-orange-100 text-orange-800";
  } else {
    return "bg-red-100 text-red-800";
  }
};

// Main Gradebook Component
export default function Gradebook() {
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [expandedSemester, setExpandedSemester] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [coursesPerPage] = useState(5); // matches API default

  // Fetch grade data from API
  const fetchGradeData = async (page = 1) => {
    setLoading(true);
    try {
      // Note: The original implementation calls the API without a page parameter,
      // but uses pagination state (currentPage, totalPages). I'll assume the API
      // is returning all data and the pagination state is coming from the response.
      // If the API supported page parameter, the fetch would need to be updated.
      const res = await axiosInstance.get(
        `gradebook/getStudentGradebooksFormatted`
      );
      console.log(res, "gradebook data");

      // Safety check for expected structure
      if (res.data && res.data.courses) {
        setGradeData(res.data);
        // Assuming API returns pagination data (even if not used in endpoint path)
        setCurrentPage(res.data.currentPage || 1);
        setTotalPages(res.data.totalPages || 1);
        setTotalCourses(res.data.totalCourses || res.data.courses.length);
      } else {
        setGradeData({ courses: [] });
      }
    } catch (err) {
      console.error(err);
      setError(
        err.message || "An unknown error occurred while fetching grades."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradeData(currentPage);
  }, [currentPage]);

  const toggleCourseExpand = (courseId) => {
    // Announce the action for screen readers
    const isExpanded = expandedCourseId === courseId;
    // Visually toggle, then announce
    setExpandedCourseId(isExpanded ? null : courseId);
    setExpandedSemester(null); // Reset semester expansion when course changes
  };

  const toggleSemesterExpand = (semesterId) => {
    setExpandedSemester(expandedSemester === semesterId ? null : semesterId);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setExpandedCourseId(null); // Reset expanded states when changing pages
      setExpandedSemester(null);
    }
  };

  const handlePreviousPage = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    handlePageChange(currentPage + 1);
  };

  // --- Start of JSX ---

  if (loading) {
    return (
      <div
        className="justify-center items-center flex h-screen"
        role="status"
        aria-live="polite"
      >
        <Loader className="animate-spin h-8 w-8" aria-hidden="true" />
        <span className="sr-only">Loading student grade report...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <h1 className="text-2xl font-bold">Student Grade Report</h1>
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertDescription>Error loading grade data: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!gradeData || gradeData.courses?.length === 0) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <h1 className="text-2xl font-bold">Student Grade Report</h1>
        <Alert role="status" aria-live="polite">
          <AlertDescription>No grade data available.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header (H1) */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" id="grade-report-title">
          Student Grade Report
        </h1>
        {/* Optional: Download Button (Re-commented out logic for download PDF) */}
        {/* <Button variant="outline" size="sm" onClick={downloadPDF} aria-label="Download grade report as PDF">
          <Download className="h-4 w-4 mr-2" aria-hidden="true" />
          Download PDF
        </Button> */}
      </div>

      {/* Courses Table (Main Grid/Section) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle id="course-details-title">Course Details</CardTitle>
            <div
              className="text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-md border"
            role="region"
            aria-labelledby="course-details-title"
          >
            <Table>
              <caption className="sr-only">
                Summary of grades for all enrolled courses
              </caption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Course</TableHead>
                  <TableHead scope="col">Structure</TableHead>
                  <TableHead scope="col">Total Percentage</TableHead>
                  <TableHead scope="col">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradeData.courses.map((course) => {
                  const isCourseExpanded = expandedCourseId === course.courseId;
                  const structureSummary =
                    course.semesters?.length > 0
                      ? `${course.semesters.length} semester${
                          course.semesters.length !== 1 ? "s" : ""
                        }`
                      : course.courseItems?.length > 0
                      ? `${course.courseItems.length} item${
                          course.courseItems.length !== 1 ? "s" : ""
                        }`
                      : "No data";

                  return (
                    // Grouping the row and the details row semantically is tricky in HTML table structure.
                    // ARIA attributes are critical here.
                    <React.Fragment key={course.courseId}>
                      <TableRow
                        aria-expanded={isCourseExpanded}
                        aria-controls={`details-${course.courseId}`}
                      >
                        <TableCell scope="row" className="font-medium">
                          {course.courseName}
                        </TableCell>
                        <TableCell>{structureSummary}</TableCell>
                        <TableCell>{course?.coursePercentage}%</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* Correct React Router Link using 'to' instead of 'href' */}
                            <Link to={`/student/analytics/${course.courseId}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                aria-label={`View performance analytics for ${course.courseName}`}
                              >
                                <BarChart2 className="h-4 w-4" />
                                Analytics
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleCourseExpand(course.courseId)
                              }
                              className="flex items-center gap-2"
                              aria-expanded={isCourseExpanded}
                              aria-controls={`details-${course.courseId}`}
                              aria-label={`${
                                isCourseExpanded ? "Hide" : "Show"
                              } details for ${course.courseName}`}
                            >
                              {isCourseExpanded ? (
                                <ChevronDown
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ChevronRight
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              )}
                              {isCourseExpanded ? "Hide" : "Show"} Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Details Row */}
                      {isCourseExpanded && (
                        <TableRow id={`details-${course.courseId}`}>
                          <TableCell colSpan={5} className="p-0">
                            <div className="bg-muted/30 p-4 space-y-4">
                              {/* Case 1: Course has semester/quarter structure */}
                              {course.semesters &&
                                course.semesters.length > 0 && (
                                  <div
                                    role="region"
                                    aria-label={`Semesters for ${course.courseName}`}
                                  >
                                    {course.semesters.map((semester) => {
                                      const isSemesterExpanded =
                                        expandedSemester ===
                                        semester.semesterId;
                                      return (
                                        <div
                                          key={semester.semesterId}
                                          className="space-y-3 w-[100%] border-b pb-3 mb-3 last:border-b-0 last:pb-0"
                                        >
                                          <div className="flex items-center justify-between">
                                            {/* Use H3 for tertiary heading */}
                                            <h3
                                              className="text-lg font-semibold text-gray-800"
                                              id={`semester-title-${semester.semesterId}`}
                                            >
                                              {semester.semesterTitle}
                                            </h3>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                toggleSemesterExpand(
                                                  semester.semesterId
                                                )
                                              }
                                              className="flex items-center gap-2"
                                              aria-expanded={isSemesterExpanded}
                                              aria-controls={`semester-content-${semester.semesterId}`}
                                              aria-label={`${
                                                isSemesterExpanded
                                                  ? "Hide"
                                                  : "Show"
                                              } quarters for ${
                                                semester.semesterTitle
                                              }`}
                                            >
                                              {isSemesterExpanded ? (
                                                <ChevronDown
                                                  className="h-4 w-4"
                                                  aria-hidden="true"
                                                />
                                              ) : (
                                                <ChevronRight
                                                  className="h-4 w-4"
                                                  aria-hidden="true"
                                                />
                                              )}
                                              {semester.quarters.length} Quarter
                                              {semester.quarters.length !== 1
                                                ? "s"
                                                : ""}
                                            </Button>
                                          </div>

                                          {isSemesterExpanded && (
                                            <div
                                              id={`semester-content-${semester.semesterId}`}
                                              className="space-y-4"
                                              role="region"
                                              aria-labelledby={`semester-title-${semester.semesterId}`}
                                            >
                                              {semester.quarters.map(
                                                (quarter, qIndex) => (
                                                  <Card
                                                    key={quarter.quarterId}
                                                    className="bg-white"
                                                    role="group"
                                                    aria-label={`${quarter.quarterTitle} Quarter Details`}
                                                  >
                                                    <CardHeader className="pb-3">
                                                      <div className="flex items-center justify-between">
                                                        <CardTitle className="text-base">
                                                          {quarter.quarterTitle}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-4">
                                                          <div className="text-sm">
                                                            <span className="font-medium">
                                                              Grade:{" "}
                                                            </span>
                                                            <span className="text-green-600 font-bold">
                                                              {quarter.grade}%
                                                            </span>
                                                          </div>

                                                          {course.gradingSystem ===
                                                          "normalGrading" ? (
                                                            <section
                                                              className="flex items-center gap-4"
                                                              aria-label="GPA and Letter Grade"
                                                            >
                                                              <div className="text-sm">
                                                                <span className="font-medium">
                                                                  GPA:{" "}
                                                                </span>
                                                                <span className="text-blue-600 font-bold">
                                                                  {quarter.gpa}
                                                                </span>
                                                              </div>
                                                              <Badge
                                                                className={`${getLetterGradeColor(
                                                                  quarter.letterGrade
                                                                )}`}
                                                              >
                                                                {
                                                                  quarter.letterGrade
                                                                }
                                                              </Badge>
                                                            </section>
                                                          ) : (
                                                            <section
                                                              className="flex items-center gap-4"
                                                              aria-label="Standard Grade"
                                                            >
                                                              {/* Standard Grade Section */}
                                                              <div className="text-sm">
                                                                <span className="font-medium">
                                                                  Points:{" "}
                                                                </span>
                                                                <span className="text-blue-600 font-bold">
                                                                  {quarter
                                                                    .standardGrade
                                                                    ?.points ||
                                                                    "Pending"}
                                                                </span>
                                                              </div>
                                                              <div className="text-sm">
                                                                <span className="font-medium">
                                                                  Remark:{" "}
                                                                </span>
                                                                <span className="text-blue-600 font-bold">
                                                                  {quarter
                                                                    .standardGrade
                                                                    ?.remarks ||
                                                                    "Pending"}
                                                                </span>
                                                              </div>
                                                            </section>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                      <AssessmentTable
                                                        assessments={
                                                          quarter.assessments
                                                        }
                                                        parentTitle={`${quarter.quarterTitle} Assessments`}
                                                      />
                                                    </CardContent>
                                                  </Card>
                                                )
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                              {/* Case 2: Course has direct assessments (no semester/quarter) */}
                              {course.courseItems &&
                                course.courseItems.length > 0 && (
                                  <div
                                    className="space-y-3 w-[100%]"
                                    role="region"
                                    aria-label={`Direct assessments for ${course.courseName}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                        {course.gradingSystem ===
                                        "normalGrading" ? (
                                          <div className="text-sm">
                                            <span className="font-medium">
                                              Letter Grade:{" "}
                                            </span>
                                            <span className="text-blue-600 font-bold">
                                              {course.letterGrade}
                                            </span>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="text-sm">
                                              <span className="font-medium">
                                                Remarks:{" "}
                                              </span>
                                              <span className="text-blue-600 font-bold">
                                                {course.standardGrade
                                                  ?.remarks || "N/A"}
                                              </span>
                                            </div>

                                            <div className="text-sm">
                                              <span className="font-medium">
                                                Points:{" "}
                                              </span>
                                              <span className="text-blue-600 font-bold">
                                                {course.standardGrade?.points ??
                                                  "—"}
                                              </span>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <Card className="bg-white">
                                      <CardContent className="pt-6">
                                        <AssessmentTable
                                          assessments={course.courseItems}
                                          parentTitle={`${course.courseName} Assessments`}
                                        />
                                      </CardContent>
                                    </Card>
                                  </div>
                                )}

                              {/* Case 3: No assessments available */}
                              {(!course.semesters ||
                                course.semesters.length === 0) &&
                                (!course.courseItems ||
                                  course.courseItems.length === 0) && (
                                  <div
                                    className="text-center py-8 text-gray-500"
                                    role="status"
                                  >
                                    No assessments available for this course
                                  </div>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Handle the case where the gradeData loads but courses array is empty (redundant given previous check, but kept for logic) */}
                {gradeData.courses.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8"
                      role="status"
                    >
                      You haven't performed any assessment
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card>
          <CardContent
            className="pt-6"
            role="navigation"
            aria-label="Course Pagination"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground" aria-live="polite">
                Showing {(currentPage - 1) * coursesPerPage + 1} to{" "}
                {Math.min(currentPage * coursesPerPage, totalCourses)} of{" "}
                {totalCourses} courses
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  aria-label="Go to previous page of courses"
                >
                  Previous
                </Button>

                {/* Pagination Page Buttons */}
                <div
                  className="flex items-center gap-1"
                  role="group"
                  aria-label="Page selection"
                >
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    // Logic to show a maximum of 5 pages centered around the current page
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                        aria-current={
                          currentPage === pageNum ? "page" : undefined
                        }
                        aria-label={`Go to page ${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  aria-label="Go to next page of courses"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader,
  Pen,
  Play,
  Users,
  ChartBarStacked,
  LibraryBig,
  Calendar,
  DollarSign,
  Eye,
  BookOpen,
  Settings,
  Archive,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Tag,
  Video,
} from "lucide-react";


import { axiosInstance } from "@/lib/AxiosInstance";
import CommentSection from "@/CustomComponent/Student/CommentSection";
import { FinalCourseAssessmentCard } from "@/CustomComponent/CreateCourse/FinalCourseAssessmentCard";
import { toast } from "sonner";
import AssessmentCategoryDialog from "@/CustomComponent/teacher/AssessmentCategoryDialog";
import RatingSection from "@/CustomComponent/teacher/RatingSection";
import { format } from "date-fns";
import { CourseContext } from "@/Context/CoursesProvider";
import ArchiveDialog from "@/CustomComponent/teacher/ArchivedModal";
import { ApplyReverificationDialog } from "@/CustomComponent/ApplyReverificationDialog";
import { GlobalContext } from "@/Context/GlobalProvider";


export default function TeacherCourseDetails() {
  const { id } = useParams();
  const { checkAuth } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { setQuarters } = useContext(CourseContext);

  const [Prevthumbnail, setPrevThumbnail] = useState(null);
  const [newthumbnail, setNewThumbnail] = useState(null);
  const [loadingThumbnail, setLoadingThumbnail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [semesterbased, setSemesterBased] = useState();
  const [enrollmentsId, setEnrollmentsId] = useState(null);

  const findEnrollment = async () => {
    try {
      const res = await axiosInstance.post(`enrollment/enrollmentforTeacher`, {
        teacherId: course.createdby,
        courseId: course._id,
      });
      setEnrollmentsId(res.data.enrollment._id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (course && course.createdby) {
      findEnrollment();
    }
  }, [course]);

  const handleToggleGrading = async () => {
    try {
      const res = await axiosInstance.put(`course/course/${id}/toggle-grading`);
      toast.success(res.data.message);
      setCourse((prev) => ({
        ...prev,
        gradingSystem: res.data.gradingSystem,
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to toggle grading system",
      );
    }
  };

  const handlePreview = async () => {
    try {
      await axiosInstance.post("auth/previewSignIn");
      await checkAuth();
      navigate(`/student/mycourses/${enrollmentsId}`);
    } catch (error) {
      console.error("Preview signin failed:", error);
    }
  };

  const handleDeleteAssessment = (assessmentID) => {
    setLoading(true);
    axiosInstance
      .delete(`/assessment/delete/${assessmentID}`)
      .then((res) => {
        setLoading(false);
        toast.success(res.data.message);
        fetchCourseDetail();
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.response?.data?.message || "Error deleting assessment");
      });
  };

  const fetchCourseDetail = async () => {
    setLoading(true);
    setError(null);
    setCourse(null);
    try {
      const res = await axiosInstance.get(`course/details/${id}`);
      setCourse(res.data.course);
      setQuarters(res.data.course.quarter);
      setSemesterBased(res.data.course.semesterbased === true);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to fetch course details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPrevThumbnail(reader.result);
    reader.readAsDataURL(file);
    setNewThumbnail(file);
  };

  const confirmChange = async () => {
    setLoadingThumbnail(true);
    try {
      const res = await axiosInstance.put(
        `course/thumbnail/${id}`,
        { thumbnail: newthumbnail },
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toast.success(res.data.message || "Thumbnail updated!");
      fetchCourseDetail();
      setPrevThumbnail(null);
      setNewThumbnail(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingThumbnail(false);
    }
  };

  if (loading)
    return (
      <div
        className="flex justify-center items-center h-screen w-full"
        role="status"
        aria-busy="true"
      >
        <Loader className="animate-spin w-8 h-8 text-blue-500" aria-hidden="true" />
        <span className="sr-only">Loading course details...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen w-full p-6">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Course</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchCourseDetail} className="bg-blue-500 hover:bg-blue-600">
            Try Again
          </Button>
        </div>
      </div>
    );

  if (!course)
    return (
      <div
        className="flex justify-center items-center h-screen w-full"
        role="alert"
        aria-busy="true"
      >
        <Loader className="animate-spin w-8 h-8 text-blue-500" aria-hidden="true" />
        <span className="sr-only">Loading course details...</span>
      </div>
    );

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl" id="main-content">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Course Management
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <VerificationBadge
              status={course.isVerified}
              course={course}
              fetchCourseDetail={fetchCourseDetail}
            />
            {course.isAppliedReverified?.status && (
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold"
                role="status"
              >
                <CheckCircle
                  className="w-4 h-4 text-blue-600"
                  aria-hidden="true"
                />
                <span>Reverification request pending admin review.</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Archive Warning */}
      {(!course.published || course.isVerified === "rejected") && (
        <section
          className="bg-red-50 border-l-4 border-red-600 rounded-r-lg p-4 mb-6"
          role="alert"
          aria-labelledby="archive-warning-title"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              className="w-5 h-5 text-red-600"
              aria-hidden="true"
            />
            <p id="archive-warning-title" className="text-red-800 font-bold">
              Archived: This course is not visible to students.
            </p>
          </div>
        </section>
      )}

      <div className="space-y-8">
        {/* Main Course Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Thumbnail */}
          <section
            className="lg:col-span-4"
            aria-label="Course Thumbnail Management"
          >
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <img
                  src={
                    Prevthumbnail ||
                    course.thumbnail?.url ||
                    "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80"
                  }
                  alt={`Current thumbnail for ${course.courseTitle}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  {Prevthumbnail ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-600 flex-1"
                        onClick={confirmChange}
                        disabled={loadingThumbnail}
                        aria-label="Confirm new thumbnail"
                      >
                        {loadingThumbnail ? (
                          <Loader className="animate-spin w-4 h-4" />
                        ) : (
                          "Confirm"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setPrevThumbnail(null);
                          setNewThumbnail(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        className="hidden"
                        id="thumbnail-upload"
                        onChange={handleThumbnailChange}
                        accept="image/jpeg,image/png,image/jpg"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          document.getElementById("thumbnail-upload").click()
                        }
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-green-600 outline-none"
                        role="button"
                        aria-label="Upload new course thumbnail"
                      >
                        <Pen className="h-4 w-4" aria-hidden="true" />
                        <span className="text-sm font-medium">
                          Edit Thumbnail
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Middle Column - Course Details */}
          <section className="lg:col-span-8" aria-label="Course Summary">
            <Card className="shadow-sm h-full">
              <CardContent className="p-6">
                <div className="flex justify-between text-xs text-muted-foreground mb-4">
                  <time
                    className="flex items-center gap-1"
                    dateTime={course.createdAt}
                  >
                    <Calendar className="w-3 h-3" aria-hidden="true" />
                    Created: {formatDate(course.createdAt)}
                  </time>
                  <time
                    className="flex items-center gap-1"
                    dateTime={course.updatedAt}
                  >
                    <Calendar className="w-3 h-3" aria-hidden="true" />
                    Updated: {formatDate(course.updatedAt)}
                  </time>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900 uppercase">
                    {course.courseTitle || "Untitled Course"}
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {course.courseDescription || "No description available."}
                  </p>

                  {(course.paymentType === "FREE" || course.price) && (
                    <div
                      className="flex items-center gap-2 mt-3"
                      aria-label={
                        course.paymentType === "FREE"
                          ? "Price: Free"
                          : `Price: ${course.price}`
                      }
                    >
                      <DollarSign
                        className="w-5 h-5 text-green-700"
                        aria-hidden="true"
                      />
                      <span className="text-xl font-bold text-green-700">
                        {course.paymentType === "FREE" ? "Free" : course.price}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Management Actions */}
        <section aria-label="Course Management Controls">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" aria-hidden="true" />
                Management Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <nav
                className="flex flex-wrap gap-3"
                aria-label="Management navigation"
              >
                <AssessmentCategoryDialog courseId={id} />
                <Button
                  variant="outline"
                  onClick={() => navigate(`/teacher/courses/gradescale/${id}`)}
                >
                  GradeScale
                </Button>
                {semesterbased && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/teacher/courses/semester/${id}`)}
                  >
                    Semesters & Quarters
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate(`/teacher/courses/gpa/${id}`)}
                >
                  GPA
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/teacher/courses/Sbl/${id}`)}
                >
                  Standard GradeScale
                </Button>

                {course.paymentType !== "FREE" && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/teacher/courses/coupon/${id}`)}
                  >
                    <Tag />
                    Coupons
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-blue-200 hover:bg-blue-50 text-blue-700 font-semibold shadow-sm"
                  onClick={() => navigate(`/teacher/schedule/${id}`)}
                >
                  <Video className="w-4 h-4" />
                  Schedule Meeting
                </Button>
              </nav>


            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section aria-label="Quick Actions">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="w-5 h-5" aria-hidden="true" />
                Review & Edit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handlePreview}
                >
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  Student View
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => navigate(`/teacher/gradebook/${id}`)}
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  Gradebook
                </Button>
                <Button
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800"
                  onClick={() => navigate(`/teacher/courses/edit/${id}`)}
                >
                  <Pen className="w-4 h-4" aria-hidden="true" />
                  Edit Info
                </Button>
                <Button
                  className="bg-purple-700 hover:bg-purple-800 text-white"
                  onClick={handleToggleGrading}
                >
                  <ChartBarStacked
                    className="w-4 h-4 mr-2"
                    aria-hidden="true"
                  />
                  {course.gradingSystem === "normalGrading"
                    ? "Switch to Standard Grading"
                    : "Switch to Normal Grading"}
                </Button>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => {
                    console.log("COURSE ID:", id);
                    navigate(`/teacher/courses/course-stats/${id}`);
                  }}
                >
                  <BarChart3 className="w-4 h-4 mr-2" aria-hidden="true" />
                  Course Stats
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats Grid */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
          aria-label="Course Statistics"
        >
          <StatCard
            icon={
              <ChartBarStacked
                className="h-5 w-5 text-purple-600"
                aria-hidden="true"
              />
            }
            value={course.category?.title?.toUpperCase() || "N/A"}
            label="Category"
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={
              <LibraryBig
                className="h-5 w-5 text-green-600"
                aria-hidden="true"
              />
            }
            value={course.semester?.length || 0}
            label="Semesters"
            bgColor="bg-green-50"
          />
          <StatCard
            icon={
              <Users className="h-5 w-5 text-orange-600" aria-hidden="true" />
            }
            value={course.enrollments?.length || 0}
            label="Enrolled Students"
            bgColor="bg-orange-50"
          />
        </section>

        {/* Semesters Section */}
        <section aria-labelledby="curriculum-title">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle
                id="curriculum-title"
                className="text-xl flex items-center gap-2"
              >
                <LibraryBig className="w-6 h-6" aria-hidden="true" />
                {semesterbased ? "Course Semesters" : "Course Chapters"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {semesterbased ? (
                <div className="grid gap-4" role="list">
                  {course?.semester?.map((semester, index) => (
                    <Link
                      key={semester._id}
                      to={`/teacher/courses/${id}/semester/${semester._id}`}
                      className="block border-2 border-transparent rounded-lg hover:border-green-600 focus:ring-2 focus:ring-green-600 outline-none transition-all"
                      role="listitem"
                      aria-label={`Go to Semester ${index + 1}: ${semester.title
                        }`}
                    >
                      <div className="border border-gray-200 p-4 rounded-lg bg-white">
                        <h3 className="font-bold text-lg text-gray-900">
                          Semester {index + 1}: {semester.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" aria-hidden="true" />
                          {format(
                            new Date(semester.startDate),
                            "MMM do, yyyy",
                          )}{" "}
                          - {format(new Date(semester.endDate), "MMM do, yyyy")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  to={`/teacher/courses/${id}/chapters?semesterbased=false`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-green-600 outline-none"
                  aria-label="View Course Chapters"
                >
                  <h3 className="font-bold text-lg text-gray-900 underline">
                    Manage All Chapters
                  </h3>
                </Link>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Final Assessment Cards */}
        {Array.isArray(course.CourseAssessments) &&
          course.CourseAssessments.length > 0 && (
            <section aria-label="Final Course Assessments">
              <h2 className="text-xl font-bold mb-4">
                Course Final Assessments
              </h2>
              {course.CourseAssessments.map((assessment) => (
                <FinalCourseAssessmentCard
                  key={assessment._id}
                  assessment={assessment}
                  handleDeleteAssessment={handleDeleteAssessment}
                />
              ))}
            </section>
          )}

        <RatingSection courseId={id} />
        <CommentSection id={id} />

        {/* Archive Dialog */}
        <footer className="flex justify-end pt-6 border-t border-gray-200">
          <ArchiveDialog
            course={course}
            fetchCourseDetail={fetchCourseDetail}
          />
        </footer>
      </div>
    </main>
  );
}

function StatCard({ icon, value, label, bgColor }) {
  return (
    <Card
      className={`border-0 shadow-sm ${bgColor} focus-within:ring-2 focus-within:ring-green-600 outline-none`}
      tabIndex={0}
      role="group"
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white shadow-sm" aria-hidden="true">
            {icon}
          </div>
          <div>
            <div className="font-bold text-xl text-gray-900">{value}</div>
            <div className="text-sm text-gray-700 font-medium">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VerificationBadge({ status, course, fetchCourseDetail }) {
  if (!status) return null;

  const config = {
    pending: {
      color: "bg-amber-50 text-amber-900 border-amber-300",
      message: "Pending admin review",
      iconColor: "text-amber-600",
    },
    approved: {
      color: "bg-green-50 text-green-900 border-green-300",
      message: "Verified and approved",
      iconColor: "text-green-700",
    },
    rejected: {
      color: "bg-red-50 text-red-900 border-red-300",
      message: "Verification rejected",
      iconColor: "text-red-700",
    },
  };

  const { color, message, iconColor } = config[status] || config.pending;

  return (
    <div className="flex items-center gap-4 flex-wrap" role="status">
      <div
        className={`flex items-center gap-4 p-3 rounded-lg border shadow-sm bg-white`}
      >
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${color}`}
        >
          <CheckCircle className={`w-4 h-4 ${iconColor}`} aria-hidden="true" />
          <span>{status.toUpperCase()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">{message}</span>
          {status === "rejected" && course.remarks && (
            <span className="text-xs text-red-700 font-bold mt-1">
              Reason: {course.remarks}
            </span>
          )}
        </div>
      </div>
      {status === "rejected" && !course.isAppliedReverified?.status && (
        <ApplyReverificationDialog
          courseID={course._id}
          fetchCourseDetail={fetchCourseDetail}
        />
      )}
    </div>
  );
}

function formatDate(dateString) {
  return dateString
    ? new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "N/A";
}

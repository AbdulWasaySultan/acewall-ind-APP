import { useState, useEffect, useContext, useCallback } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader, LibraryBig, Info, Undo2 } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import RatingSection from "@/CustomComponent/Student/RatingSection";
import CommentSection from "@/CustomComponent/Student/CommentSection";
import BackButton from "@/CustomComponent/BackButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import avatar from "@/assets/avatar.png";
import { format } from "date-fns";
import { CourseContext } from "@/Context/CoursesProvider";
import { GlobalContext } from "@/Context/GlobalProvider";
import CourseSubscriptionDetail from "@/CustomComponent/Student/Course/coursepurchaseDetails";
import { CourseShareDropdown } from "@/CustomComponent/CourseShareDropdown";

export default function CourseOverview() {
  const { id } = useParams();
  const [enrollment, setEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState({
    status: false,
    message: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const { user, checkAuth } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { setQuarters } = useContext(CourseContext);
  const [open, setOpen] = useState(false);

  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [submittingTranscript, setSubmittingTranscript] = useState(false);
  const [transcriptData, setTranscriptData] = useState({
    fullName: user?.firstName + " " + user?.lastName || "",
    email: user?.email || "",
    phone: "",
    institutionName: "",
    deliveryMethod: "email",
    additionalNotes: "",
  });
  const [searchParams] = useSearchParams();

  const courseId = searchParams.get("courseId");

  const handlePreviewSignOut = () => {
    checkAuth();
    navigate("/teacher/courses");
  };

  const getCourseDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/enrollment/studentCourseDetails/v2/${id}/${courseId}`,
      );
      setEnrollment(res.data.enrolledCourse);
      const courseData = res.data.enrolledCourse.courseDetails;
      setCourse(courseData);
      setQuarters(courseData.quarter);

      try {
        const progressRes = await axiosInstance.get(
          `/course/${courseData._id}/course-progress`,
        );
        setProgress(progressRes.data.progress);
      } catch (pErr) {
        console.error("Error fetching progress:", pErr);
      }
    } catch (err) {
      console.error(err);
      setError({
        status: true,
        message:
          err.response?.data.message ||
          err.message ||
          "An error occurred while fetching course details.",
      });
    } finally {
      setLoading(false);
    }
  }, [id, setQuarters]);

  useEffect(() => {
    getCourseDetails();
  }, [id, setQuarters, getCourseDetails]);

  // Logic to determine trial days left (kept for logic reference, but commented out if unused)
  /*
  const daysLeft = enrollment?.trial?.endDate
    ? differenceInDays(new Date(enrollment.trial.endDate), new Date())
    : 0;

  const isTrialActive =
    enrollment?.status === "TRIAL" && enrollment?.trial?.status;
  */

  const handleUnenroll = async () => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/enrollment/unenroll/${course?._id}`);
      setShowModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Unenrollment failed:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin" />
      </main>
    );
  }

  if (error.status) {
    return (
      <main className="min-h-screen">
        <Alert className="w-96">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
        <Button
          className="mt-4 bg-[var(--color-acewall-green)] hover:bg-emerald-600 text-white"
          onClick={() => navigate("/student/mycourses")}
        >
          <Undo2 className="mr-2 h-4 w-4" />
          Back
        </Button>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex gap-4 items-center">
        <div className="mb-4">
          <BackButton />
        </div>
        {/* Teacher Preview Button */}
        {user?.role === "teacherAsStudent" && (
          <Button
            className="mb-4 bg-[#10B981] hover:bg-[#10B981] text-white transition-colors duration-300"
            onClick={handlePreviewSignOut}
            aria-label="View course as teacher"
          >
            View As Teacher
          </Button>
        )}
      </div>

      {/* Completion Banner */}
      {progress?.isCompleted && (
        <Alert className="bg-green-50 border-green-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 font-bold ml-2">
            🎉 Congratulations! You have completed this course.
          </AlertTitle>
          <AlertDescription className="text-green-700 ml-2">
            <div className="flex flex-wrap gap-4 mt-4">
              {progress?.completionPercentage <
              (course?.passingPercentage || 80) ? (
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-amber-700">
                    Your score: {progress?.completionPercentage?.toFixed(1)}%
                  </p>
                  <p className="text-sm text-amber-600">
                    Please score above or equal to{" "}
                    {course?.passingPercentage || 80}% to unlock your
                    certificate and transcript.
                  </p>
                </div>
              ) : (
                <>
                  {course?.offersCertificate && (
                    <Button
                      onClick={handleGenerateCertificate}
                      className="bg-green-600 hover:bg-green-700 text-white shadow-md transition-all active:scale-95"
                    >
                      Get Certificate
                    </Button>
                  )}
                  {course?.offersTranscript && (
                    <Button
                      onClick={() => setShowTranscriptModal(true)}
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50 shadow-sm"
                    >
                      Request Transcript
                    </Button>
                  )}
                </>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Benefits Banner (Not Completed) */}
      {!progress?.isCompleted &&
        (course?.offersCertificate || course?.offersTranscript) && (
          <Alert className="bg-blue-50 border-blue-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <Info className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-blue-800 font-semibold ml-2">
              Course Completion Benefits
            </AlertTitle>
            <AlertDescription className="text-blue-700 ml-2">
              <div className="flex flex-wrap gap-4 mt-4">
                {course?.offersCertificate && (
                  <div className="group relative">
                    <Button
                      disabled
                      variant="secondary"
                      className="bg-gray-200 text-gray-500 cursor-not-allowed opacity-70"
                    >
                      Get Certificate
                    </Button>
                    <span className="absolute -bottom-8 left-0 w-max text-[10px] bg-slate-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Complete final assessment to unlock
                    </span>
                  </div>
                )}
                {course?.offersTranscript && (
                  <div className="group relative">
                    <Button
                      disabled
                      variant="secondary"
                      className="bg-gray-200 text-gray-500 cursor-not-allowed opacity-70"
                    >
                      Get Transcript
                    </Button>
                    <span className="absolute -bottom-8 left-0 w-max text-[10px] bg-slate-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Complete final assessment to unlock
                    </span>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

      {/* 2. ENROLLMENT STATUS & COURSE HEADER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Course Information */}
        <div className="lg:col-span-2 space-y-6">
          <section
            className="relative overflow-hidden rounded-xl bg-slate-900 text-white p-8 min-h-[300px] flex items-end"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8)), url(${course.thumbnail?.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {course.courseTitle}
              </h1>
              <p className="text-gray-200 max-w-2xl line-clamp-3">
                {course.courseDescription}
              </p>
            </div>
          </section>

          <div className="flex items-center gap-10 mt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-gray-900 text-sm font-semibold mb-1">
                Topic
              </h3>
              <Badge className="bg-blue-100 text-blue-800 text-sm border-none">
                {course?.category?.title}
              </Badge>
            </div>
          </div>

          {/* Instructor Info */}
          <div className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border">
                <AvatarImage
                  src={course?.createdby?.profileImg?.url || avatar}
                />
                <AvatarFallback>
                  {course?.createdby?.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-gray-900">
                  {course?.createdby?.firstName} {course?.createdby?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {course?.createdby?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/student/messages")}
              >
                Message
              </Button>
              <CourseShareDropdown
                courseId={course?._id}
                courseTitle={course?.courseTitle}
              />
            </div>
          </div>
        </div>

        {/* Right: SUBSCRIPTION CARD (The component we built) */}
        <aside className="lg:col-span-1 sticky top-10">
          <CourseSubscriptionDetail
            enrollment={enrollment}
            open={open}
            setOpen={setOpen}
            getCourseDetails={getCourseDetails}
          />
        </aside>
      </div>

      {/* 3. COURSE CONTENT SECTIONS */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <LibraryBig className="h-5 w-5 text-green-600" />
          Course Curriculum
        </h2>

        {course.semesterbased ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course?.semester?.map((semester) => (
              <Link
                key={semester._id}
                to={`/student/mycourses/${course._id}/semester/${semester._id}`}
              >
                <Card className="hover:border-green-500 transition-colors cursor-pointer group">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base group-hover:text-green-600 transition-colors">
                      {semester.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(semester.startDate), "MMM d")} -{" "}
                      {format(new Date(semester.endDate), "MMM d, yyyy")}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Link
            to={`/student/mycourses/${id}/chapters?semesterbased=false&courseId=${course._id}`}
          >
            <Card className="hover:bg-slate-50 transition-colors border-dashed border-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">View All Chapters</CardTitle>
                <Button
                  variant="ghost"
                  className="text-white bg-[#10B981] hover:bg-[#10B981]"
                >
                  Open Curriculum
                </Button>
              </CardHeader>
            </Card>
          </Link>
        )}
      </section>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mt-12 bg-white z-10"
      >
        <TabsList
          className="flex flex-wrap justify-center gap-4 w-full sm:gap-10 bg-white p-1 shadow-inner"
          role="tablist"
        >
          {["Overview", "Reviews"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab.toLowerCase()}
              className="px-3 py-2 text-base font-medium capitalize transition-all duration-300 text-gray-700 hover:text-blue-600 hover:bg-gray-50 data-[state=active]:bg-gray-100 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              role="tab"
              aria-selected={activeTab === tab.toLowerCase()}
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent
          value="overview"
          className="py-8 space-y-10"
          role="tabpanel"
        >
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              What You&apos;ll Learn
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {course?.teachingPoints?.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle
                    className="w-5 h-5 text-blue-500 mt-1"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {course?.requirements.map((req, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle
                    className="w-5 h-5 text-blue-500 mt-1"
                    aria-hidden="true"
                  />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-8 border-t">
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setShowModal(true)}
            >
              Unenroll from Course
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="pt-6">
          <RatingSection id={id} course={course} />
          <CommentSection id={course._id} />
        </TabsContent>
      </Tabs>

      {/* Unenrollment Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This will remove your access to the course. To confirm, type{" "}
              <strong>unenroll</strong> below.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Type 'unenroll'"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={
                confirmationText.toLowerCase() !== "unenroll" || loading
              }
              onClick={handleUnenroll}
            >
              Confirm Unenrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transcript Request Modal */}
      <Dialog open={showTranscriptModal} onOpenChange={setShowTranscriptModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Transcript</DialogTitle>
            <DialogDescription>
              Fill out the details below to request your course transcript.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="fullName"
                className="text-right text-sm font-medium"
              >
                Full Name
              </label>
              <Input
                id="fullName"
                value={transcriptData.fullName}
                onChange={(e) =>
                  setTranscriptData({
                    ...transcriptData,
                    fullName: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={transcriptData.email}
                onChange={(e) =>
                  setTranscriptData({
                    ...transcriptData,
                    email: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phone" className="text-right text-sm font-medium">
                Phone
              </label>
              <Input
                id="phone"
                value={transcriptData.phone}
                onChange={(e) =>
                  setTranscriptData({
                    ...transcriptData,
                    phone: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="institution"
                className="text-right text-sm font-medium"
              >
                Institution
              </label>
              <Input
                id="institution"
                placeholder="University or Company name"
                value={transcriptData.institutionName}
                onChange={(e) =>
                  setTranscriptData({
                    ...transcriptData,
                    institutionName: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="method"
                className="text-right text-sm font-medium"
              >
                Delivery
              </label>
              <div className="col-span-3">
                <Select
                  value={transcriptData.deliveryMethod}
                  onValueChange={(val) =>
                    setTranscriptData({
                      ...transcriptData,
                      deliveryMethod: val,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email (Digital)</SelectItem>
                    <SelectItem value="mail">Postal Mail (Physical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="notes" className="text-right text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Any special instructions?"
                value={transcriptData.additionalNotes}
                onChange={(e) =>
                  setTranscriptData({
                    ...transcriptData,
                    additionalNotes: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTranscriptModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleTranscriptSubmit}
              disabled={submittingTranscript || !transcriptData.institutionName}
            >
              {submittingTranscript ? "Sending..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );

  async function handleGenerateCertificate() {
    try {
      const res = await axiosInstance.post(
        `/course/${course._id}/generate-certificate`,
        {},
        {
          responseType: "blob",
        },
      );
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${course.courseTitle}_Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Certificate generation failed:", err);
      toast.error("Failed to generate certificate.");
    }
  }

  async function handleTranscriptSubmit() {
    setSubmittingTranscript(true);
    try {
      await axiosInstance.post(
        `/course/${course._id}/request-transcript`,
        transcriptData,
      );
      toast.success("Transcript request sent successfully!");
      setShowTranscriptModal(false);
      setTranscriptData({
        ...transcriptData,
        institutionName: "",
        additionalNotes: "",
      });
    } catch (err) {
      console.error("Transcript request failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to send transcript request.",
      );
    } finally {
      setSubmittingTranscript(false);
    }
  }
}

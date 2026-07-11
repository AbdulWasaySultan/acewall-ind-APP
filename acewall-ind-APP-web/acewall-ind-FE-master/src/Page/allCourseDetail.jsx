import * as React from "react";
import { reateContext, useContext, useEffect, useState } from "react"; // Note: 'reateContext' seems like a typo, should be 'createContext'
import { useParams, useSearchParams } from "react-router-dom";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"; // Radix Avatar used
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"; // Radix Tabs used
import { CheckCircle2, ChevronDown, Loader, PlayCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion"; // Radix Accordion used
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible"; // Radix Collapsible used
import PurchaseConfirmationModal from "@/CustomComponent/Student/ConfirmationModal";
import { toast } from "sonner";
import avatar from "@/assets/avatar.png";
import { GlobalContext } from "../Context/GlobalProvider";
import TeacherProfileModal from "@/CustomComponent/Student/Teacherprofilemodal";
import RatingSection from "@/CustomComponent/Student/RatingSection";

// Helper function for keyboard activation
const handleKeyPress = (e, callback) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    callback();
  }
};

// AllCoursesDetail Component
const AllCoursesDetail = () => {
  const { user } = useContext(GlobalContext);
  const studentID = user?._id;
  const { id  } = useParams(); // Grab the actual course ID from the URL
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const instructor = courseDetails?.createdby || {};
  const instructorName =
    `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() ||
    "Instructor";

  const [isEnrolled, setIsEnrolled] = useState(false);

    const [searchParams] = useSearchParams();
  const refCode = searchParams.get("refCode") || "";

  useEffect(() => {
    const getCourseDetails = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/course/get/${id}`);
        setCourseDetails(res.data.course);
      } catch (err) {
        console.error("Error fetching course details:", err);
        setCourseDetails(null);
      } finally {
        setLoading(false);
      }
    };

    getCourseDetails();
  }, [id]);

  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const res = await axiosInstance.get(
          `/enrollment/isEnrolled/${courseDetails?._id}`,
        );
        setIsEnrolled(res?.data?.enrolled);
      } catch (err) {
        console.error("Error checking enrollment:", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseDetails?._id) {
      checkEnrollment();
    }
  }, [courseDetails?._id]);

  // --- JSX Rendering ---

  if (loading)
    return (
      <div
        className="flex justify-center items-center py-10"
        role="status"
        aria-live="polite"
      >
        <section className="flex justify-center items-center h-full w-full">
          <Loader className="animate-spin h-8 w-8" aria-hidden="true" />
          <span className="sr-only">Loading course details...</span>
        </section>
      </div>
    );

  if (!courseDetails)
    return (
      <div className="p-6 text-red-500" role="alert">
        Course not found.
      </div>
    );

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen"
      role="main"
      aria-labelledby="course-main-title"
    >
      <div className="grid lg:grid-cols-3 w-full gap-2 ">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 w-full">
          <div className="px-2 overflow-hidden mb-6">
            <div className="p-2">
              <h1 className="text-3xl font-bold mb-2" id="course-main-title">
                {courseDetails.courseTitle}
              </h1>
              <p className="text-gray-600 text-sm mb-4">
                {courseDetails.courseDescription}
              </p>

              {/* Instructor/Author Info */}
              <div
                className="flex items-center gap-4 mb-4"
                role="region"
                aria-label="Course Instructor"
              >
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 rounded-full">
                    <AvatarImage
                      src={courseDetails?.createdby?.profileImg?.url || avatar}
                      alt={`${instructorName}'s profile picture`}
                      className="h-10 w-10 object-cover rounded-full"
                    />
                    <AvatarFallback>IN</AvatarFallback>
                  </Avatar>

                  <div className="ml-2">
                    <div className="text-sm font-medium">{instructorName}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Thumbnail/Video Placeholder */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative h-60 w-full mx-auto">
                <img
                  src={courseDetails.thumbnail.url || "/default-thumbnail.jpg"}
                  alt={`Preview image for the course ${courseDetails.courseTitle}`}
                  className="w-full rounded-md shadow-md h-full object-cover"
                />
              </div>

              {/* Tabs Section */}
              <Tabs
                defaultValue="overview"
                className="w-full px-2 py-5"
                aria-label="Course details tabs"
              >
                {/* Tabs List */}
                <TabsList
                  className="grid grid-cols-4 bg-transparent border-b border-gray-200 border w-full text-green-600"
                  aria-label="Course Content Categories"
                >
                  {["Overview", "Curriculum", "Instructor", "Reviews"].map(
                    (tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab.toLowerCase()}
                        className="data-[state=active]:border-b-3 data-[state=active]:border-green-500 rounded-none focus:outline-none focus:ring-2 focus:ring-green-500"
                        aria-controls={`tab-panel-${tab.toLowerCase()}`}
                      >
                        {tab}
                      </TabsTrigger>
                    ),
                  )}
                </TabsList>

                {/* Tab Content: Overview */}
                <TabsContent
                  value="overview"
                  className="p-2"
                  id="tab-panel-overview"
                  role="tabpanel"
                >
                  <h2 className="text-lg font-bold mb-4">Description</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {courseDetails.courseDescription}
                  </p>

                  <h2
                    className="text-lg font-bold mt-8 mb-4"
                    id="learn-heading"
                  >
                    What you will learn in this course
                  </h2>
                  <div
                    className="grid md:grid-cols-2 gap-4"
                    role="list"
                    aria-labelledby="learn-heading"
                  >
                    {Array.isArray(courseDetails?.teachingPoints) &&
                      courseDetails.teachingPoints.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2"
                          role="listitem"
                        >
                          <CheckCircle2
                            size={20}
                            className="text-green-500 mt-0.5"
                            aria-hidden="true"
                          />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                  </div>

                  <h2
                    className="text-lg font-bold mt-8 mb-4"
                    id="requirements-heading"
                  >
                    Course requirements
                  </h2>
                  <div
                    className="grid md:grid-cols-2 gap-4"
                    role="list"
                    aria-labelledby="requirements-heading"
                  >
                    {Array.isArray(courseDetails?.requirements) &&
                      courseDetails.requirements.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2"
                          role="listitem"
                        >
                          <CheckCircle2
                            size={20}
                            className="text-green-500 mt-0.5"
                            aria-hidden="true"
                          />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                {/* Tab Content: Curriculum */}
                <TabsContent
                  value="curriculum"
                  className="p-6"
                  id="tab-panel-curriculum"
                  role="tabpanel"
                >
                  <h2 className="sr-only">Course Curriculum</h2>
                  <Accordion
                    type="multiple"
                    className="w-full"
                    aria-label="Course Chapters and Lessons"
                  >
                    {Array.isArray(courseDetails?.chapters) &&
                    courseDetails.chapters.length > 0 ? (
                      courseDetails.chapters.map((chapter, index) => {
                        const chapterId = `chapter-${index}`;
                        return (
                          <AccordionItem key={index} value={chapterId}>
                            {/* Accordion Trigger (Chapter Title) */}
                            <AccordionTrigger
                              className="py-4 text-sm font-semibold flex justify-between items-center w-full text-left group focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                              aria-label={`Toggle contents for chapter ${index + 1}: ${chapter.title}`}
                              onKeyDown={(e) =>
                                handleKeyPress(e, () => {
                                  // Radix handles state change, just ensure focusable/clickable
                                })
                              }
                            >
                              <span>{chapter.title}</span>
                              <ChevronDown
                                className="h-5 w-5 text-gray-500 transition-transform duration-300 group-data-[state=open]:rotate-180"
                                aria-hidden="true"
                              />
                            </AccordionTrigger>

                            {/* Accordion Content (Lessons & Assessments) */}
                            <AccordionContent
                              role="region"
                              aria-labelledby={chapterId}
                            >
                              <div className="my-2 flex flex-col gap-2">
                                <span className="font-bold">Description</span>
                                <span
                                  className="text-sm text-gray-700"
                                  dangerouslySetInnerHTML={{
                                    __html: chapter.description,
                                  }}
                                  role="definition"
                                ></span>
                              </div>

                              {/* Lessons List */}
                              <div
                                className="space-y-4 pl-6"
                                role="list"
                                aria-label="Lessons in this chapter"
                              >
                                {Array.isArray(chapter.lessons) &&
                                chapter.lessons.length > 0 ? (
                                  chapter.lessons.map((lesson, i) => {
                                    const lessonId = `lesson-${index}-${i}`;
                                    return (
                                      <Collapsible key={i}>
                                        {/* Collapsible Trigger (Lesson Title) */}
                                        <CollapsibleTrigger
                                          className="w-full flex items-center justify-between text-left group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                          aria-controls={lessonId}
                                          aria-label={`Toggle details for lesson: ${lesson.title}`}
                                          onKeyDown={(e) =>
                                            handleKeyPress(e, () => {
                                              // Radix handles state change
                                            })
                                          }
                                        >
                                          <div className="flex items-center gap-2">
                                            <ChevronDown
                                              className="h-4 w-4 text-gray-500 transition-transform duration-300 group-data-[state=open]:rotate-180"
                                              aria-hidden="true"
                                            />
                                            <span className="text-sm font-medium text-gray-800">
                                              {lesson.title}
                                            </span>
                                          </div>
                                        </CollapsibleTrigger>

                                        {/* Collapsible Content (Lesson Details) */}
                                        <CollapsibleContent
                                          id={lessonId}
                                          role="region"
                                          aria-labelledby={lessonId}
                                        >
                                          <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-4 shadow-inner space-y-3">
                                            <span className="font-bold">
                                              Description
                                            </span>
                                            {lesson.description && (
                                              <p
                                                className="text-sm text-gray-700 leading-relaxed"
                                                dangerouslySetInnerHTML={{
                                                  __html: lesson.description,
                                                }}
                                                role="definition"
                                              />
                                            )}

                                            {/* Restricted Access Items */}
                                            {lesson.youtubeLinks && (
                                              // Use a visually styled button or link for content preview, but disabled if restricted
                                              <Button
                                                variant="ghost"
                                                className="text-sm text-gray-400 font-medium cursor-not-allowed p-0 h-auto"
                                                disabled
                                                aria-label="Video Access Restricted: Watch Video"
                                              >
                                                <PlayCircle
                                                  size={16}
                                                  className="mr-1"
                                                  aria-hidden="true"
                                                />{" "}
                                                Watch Video
                                              </Button>
                                            )}

                                            {Array.isArray(lesson.pdfFiles) &&
                                              lesson.pdfFiles.length > 0 && (
                                                <div className="text-sm text-gray-400 space-y-1">
                                                  {lesson.pdfFiles.map(
                                                    (pdf, idx) => (
                                                      <div key={idx}>
                                                        <Button
                                                          variant="ghost"
                                                          className="text-sm text-gray-400 hover:underline cursor-not-allowed p-0 h-auto"
                                                          disabled
                                                          aria-label={`PDF Access Restricted: View PDF ${idx + 1}`}
                                                        >
                                                          📄 View PDF {idx + 1}
                                                        </Button>
                                                      </div>
                                                    ),
                                                  )}
                                                </div>
                                              )}
                                          </div>
                                        </CollapsibleContent>
                                      </Collapsible>
                                    );
                                  })
                                ) : (
                                  <div
                                    className="text-sm text-gray-500"
                                    role="status"
                                  >
                                    No lessons available
                                  </div>
                                )}
                              </div>

                              {/* Assessment List */}
                              {Array.isArray(chapter.Assessment) &&
                                chapter.Assessment.length > 0 && (
                                  <div
                                    className="mt-6 border-t pt-4 space-y-2 pl-6"
                                    role="list"
                                    aria-label="Assessments in this chapter"
                                  >
                                    <div className="text-sm font-medium text-gray-700">
                                      Assessment
                                    </div>
                                    {chapter.Assessment.map((assess, j) => (
                                      <div
                                        key={j}
                                        className="text-sm text-gray-600"
                                        role="listitem"
                                        aria-label={`${assess.title}: ${assess.description}`}
                                      >
                                        {assess.title} —{" "}
                                        <span className="italic">
                                          {assess.description}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-500" role="status">
                        No chapters available
                      </div>
                    )}
                  </Accordion>
                </TabsContent>

                {/* Tab Content: Instructor */}
                <TabsContent
                  value="instructor"
                  className="p-6"
                  id="tab-panel-instructor"
                  role="tabpanel"
                >
                  <h2 className="sr-only">Instructor Details</h2>
                  <div
                    className="flex flex-col sm:flex-row items-start gap-6"
                    role="region"
                    aria-label="Instructor profile information"
                  >
                    <Avatar className="h-15 w-15 shadow-md ring-green-500 ring-3 rounded-full">
                      <AvatarImage
                        src={instructor?.profileImg?.url || avatar}
                        alt={`${instructorName}'s profile picture`}
                        className="h-15 w-15 object-cover rounded-full"
                      />
                      <AvatarFallback className="h-20 w-20 flex items-center justify-center rounded-full bg-gray-200 text-lg font-semibold">
                        {instructor.firstName?.charAt(0)}
                        {instructor.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3
                        className="text-xl font-semibold text-gray-900 cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                        onClick={() => setIsModalOpen(true)}
                        tabIndex={0}
                        onKeyDown={(e) =>
                          handleKeyPress(e, () => setIsModalOpen(true))
                        }
                        aria-label={`View full profile for instructor ${instructorName}`}
                      >
                        {instructorName}
                      </h3>
                      {/* Bio placeholder removed as it was commented out */}
                    </div>
                  </div>

                  <TeacherProfileModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    instructor={instructor}
                    avatar={avatar}
                    // Assuming TeacherProfileModal handles its own accessibility (role="dialog", etc.)
                  />
                </TabsContent>

                {/* Tab Content: Reviews */}
                <TabsContent
                  value="reviews"
                  className="p-6"
                  id="tab-panel-reviews"
                  role="tabpanel"
                >
                  <h2 className="sr-only">Course Reviews</h2>
                  <RatingSection courseId={courseDetails._id} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside
          className="md:col-span-1"
          role="complementary"
          aria-label="Course Enrollment and Inclusions"
        >
          <div className="border border-gray-200 rounded-xl p-6 sticky top-24 shadow-sm hover:shadow-lg transition-shadow duration-300 w-full">
            <div
              className="text-2xl mb-4 font-semibold text-gray-800"
              aria-label={`Course price: $${courseDetails.price}`}
            >
              <p> ${courseDetails.price} </p>
              <p className="text-sm text-gray-500">
                {courseDetails.paymentType === "SUBSCRIPTION"
                  ? "Per month"
                  : courseDetails.paymentType === "ONETIME"
                    ? "One-time"
                    : "Free Course"}
              </p>
            </div>

            <div className="flex flex-col gap-6 mb-6">
              <PurchaseConfirmationModal
                courseID={courseDetails._id}
                coursePrice={courseDetails.price ? courseDetails.price : 0}
                studentID={studentID}
                courseName={courseDetails.courseTitle}
                teacherID={courseDetails.createdby._id}
                isEnrolled={isEnrolled}
                paymentType={courseDetails.paymentType}
                referralCode={refCode}
                // Assuming PurchaseConfirmationModal handles its own button and dialog accessibility
              />
            </div>

            <div
              className="space-y-4"
              role="list"
              aria-label="What this course includes"
            >
              <h3 className="text-sm font-semibold text-gray-800">
                This course includes:
              </h3>

              {/* Inclusion List */}
              <div
                className="flex items-start gap-2 text-gray-700"
                role="listitem"
              >
                <PlayCircle size={18} className="mt-0.5" aria-hidden="true" />
                <span className="text-sm">
                  {courseDetails.videoHours} hours on-demand video
                </span>
              </div>
              <div
                className="flex items-start gap-2 text-gray-700"
                role="listitem"
              >
                <CheckCircle2 size={18} className="mt-0.5" aria-hidden="true" />
                <span className="text-sm">Full lifetime access</span>
              </div>
              <div
                className="flex items-start gap-2 text-gray-700"
                role="listitem"
              >
                <CheckCircle2 size={18} className="mt-0.5" aria-hidden="true" />
                <span className="text-sm">Access on mobile and web</span>
              </div>

              {courseDetails?.chapters.length > 0 && (
                <div
                  className="flex items-start gap-2 text-gray-700"
                  role="listitem"
                >
                  <CheckCircle2
                    size={18}
                    className="mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-sm">
                    Include {courseDetails?.chapters.length}{" "}
                    {courseDetails.chapters.length > 1 ? "chapters" : "chapter"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AllCoursesDetail;

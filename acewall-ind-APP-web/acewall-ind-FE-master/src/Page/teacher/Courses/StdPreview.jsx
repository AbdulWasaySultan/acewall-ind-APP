import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import {
  CheckCircle2,
  ChevronDown,
  Loader,
  PlayCircle,
  Star,
  StarHalf,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import PurchaseConfirmationModal from "@/CustomComponent/Student/ConfirmationModal";
import { toast } from "sonner";
import avatar from "@/assets/avatar.png";
import RatingSection from "@/CustomComponent/teacher/RatingSection";
import BackButton from "@/CustomComponent/BackButton";
import TeacherProfileModal from "@/CustomComponent/Student/Teacherprofilemodal";
// AllCoursesDetail Component
const StdPreview = () => {
  const { id } = useParams(); // Grab the actual course ID from the URL
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const instructor = courseDetails?.createdby || {};
  useEffect(() => {
    const getCourseDetails = async () => {
      setLoading(true);
      await axiosInstance
        .get(`/course/get/${id}`)
        .then((res) => {
          setCourseDetails(res.data.course);
          console.log("course details", res.data);

          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setCourseDetails(null);
          setLoading(false);
        });
    };

    getCourseDetails();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center py-10">
        <section className="flex justify-center items-center h-full w-full">
          <Loader className="animate-spin " />
        </section>
      </div>
    );
  if (!courseDetails)
    return <div className="p-6 text-red-500">Course not found.</div>;

  return (<>
    <div className="mb-10">
      <BackButton className="shadow-sm" />
    </div>
    <div className="flex flex-col lg:flex-row min-h-screen">

      <div className="grid lg:grid-cols-3 w-full  gap-2 ">
        <div className="lg:col-span-2 w-full ">
          <div className="  px-2  overflow-hidden mb-6">
            <div className="p-2">
              <h1 className="text-3xl font-bold mb-2">
                {courseDetails.courseTitle}
              </h1>
              <p className="text-gray-600 text-sm mb-4">
                {courseDetails.courseDescription}
              </p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 rounded-full">
                    <AvatarImage
                      src={courseDetails?.createdby?.profileImg?.url || avatar}
                      alt="Instructor"
                      className="h-10 w-10 object-cover rounded-full"
                    />
                    <AvatarFallback>IN</AvatarFallback>
                  </Avatar>

                  <div className="ml-2">
                    <div className="text-sm font-medium">
                      {courseDetails.createdby.firstName}{" "}
                      {courseDetails.createdby.middleName}{" "}
                      {courseDetails.createdby.lastName}
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <div className="flex  flex-col items-center justify-center ">
              <div className="relative h-60 w-100 mx-auto">
                <img
                  src={courseDetails.thumbnail.url || "/default-thumbnail.jpg"}
                  alt="Course preview"
                  className="w-full rounded-md shadow-md h-full object-cover"
                />
              </div>

              <Tabs defaultValue="overview" className="w-full px-2 py-5">
                <TabsList className="grid grid-cols-4 bg-transparent border-b border-gray-200 border w-full text-green-600">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:border-b-3   data-[state=active]:border-green-500 rounded-none"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="curriculum"
                    className="data-[state=active]:border-b-3   data-[state=active]:border-green-500 rounded-none"
                  >
                    Curriculum
                  </TabsTrigger>
                  <TabsTrigger
                    value="instructor"
                    className="data-[state=active]:border-b-3   data-[state=active]:border-green-500 rounded-none"
                  >
                    Instructor
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:border-b-3   data-[state=active]:border-green-500 rounded-none"
                  >
                    Reviews
                  </TabsTrigger>
                </TabsList>

                {/* overview */}
                <TabsContent value="overview" className="p-2">
                  <h2 className="text-lg font-bold mb-4">Description</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {courseDetails.courseDescription}
                  </p>

                  <h2 className="text-lg font-bold mt-8 mb-4">
                    What you will learn in this course
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Array.isArray(courseDetails?.teachingPoints) &&
                      courseDetails.teachingPoints.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2
                            size={20}
                            className="text-green-500 mt-0.5 "
                          />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                  </div>

                  <h2 className="text-lg font-bold mt-8 mb-4">
                    Course requirements{" "}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Array.isArray(courseDetails?.requirements) &&
                      courseDetails.requirements.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2
                            size={20}
                            className="text-green-500 mt-0.5"
                          />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                {/* curriculam */}
                <TabsContent value="curriculum" className="p-6">
                  <Accordion type="curriculum" collapsible className="w-full">
                    {Array.isArray(courseDetails?.chapters) &&
                      courseDetails.chapters.length > 0 ? (
                      courseDetails.chapters.map((chapter, index) => (
                        <AccordionItem key={index} value={`chapter-${index}`}>
                          <AccordionTrigger className="py-4 text-sm font-semibold flex justify-between items-center group">
                            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                            <span>{chapter.title}</span>
                          </AccordionTrigger>

                          <AccordionContent>
                            <div className="my-2 flex flex-col gap-2">
                              <span className="font-bold">Description</span>
                              <span className="text-sm text-gray-700">
                                {chapter.description}
                              </span>
                            </div>
                            <div className="space-y-4 pl-6">
                              {Array.isArray(chapter.lessons) &&
                                chapter.lessons.length > 0 ? (
                                chapter.lessons.map((lesson, i) => (
                                  <Collapsible key={i}>
                                    <CollapsibleTrigger className="w-full flex items-center justify-between text-left group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                                      <div className="flex items-center gap-2">
                                        <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                        <span className="text-sm font-medium text-gray-800">
                                          {lesson.title}
                                        </span>
                                      </div>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-4 shadow-inner space-y-3">
                                      <span className="font-bold">
                                        Description
                                      </span>
                                      {lesson.description && (
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                          {" "}
                                          <div dangerouslySetInnerHTML={{ __html: lesson.description }} />
                                        </p>
                                      )}

                                      {lesson.youtubeLinks && (
                                        <span
                                          className="inline-block text-sm text-gray-400 font-medium cursor-not-allowed"
                                          title="Access restricted"
                                        >
                                          ▶ Watch Video
                                        </span>
                                      )}

                                      {Array.isArray(lesson.pdfFiles) &&
                                        lesson.pdfFiles.length > 0 && (
                                          <div className="text-sm text-gray-400 space-y-1 cursor-not-allowed">
                                            {lesson.pdfFiles.map((pdf, idx) => (
                                              <div key={idx}>
                                                <span
                                                  className="text-gray-400 hover:underline"
                                                  title="Access restricted"
                                                >
                                                  📄 View PDF {idx + 1}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                    </CollapsibleContent>
                                  </Collapsible>
                                ))
                              ) : (
                                <div className="text-sm text-gray-500">
                                  No lessons available
                                </div>
                              )}
                            </div>

                            {Array.isArray(chapter.Assessment) &&
                              chapter.Assessment.length > 0 && (
                                <div className="mt-6 border-t pt-4 space-y-2 pl-6">
                                  <div className="text-sm font-medium text-gray-700">
                                    Assessment
                                  </div>
                                  {chapter.Assessment.map((assess, j) => (
                                    <div
                                      key={j}
                                      className="text-sm text-gray-600"
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
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">
                        No chapters available
                      </div>
                    )}
                  </Accordion>
                </TabsContent>

                {/* instructor */}
                <TabsContent value="instructor" className="p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <Avatar className="h-15 w-15 shadow-md ring-green-500 ring-3 rounded-full">
                      <AvatarImage
                        src={instructor?.profileImg?.url || avatar}
                        alt="Instructor"
                        className="h-15 w-15 object-cover rounded-full"
                      />
                      <AvatarFallback className="h-20 w-20 flex items-center justify-center rounded-full bg-gray-200 text-lg font-semibold">
                        {instructor.firstName?.charAt(0)}
                        {instructor.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3
                        className="text-xl font-semibold text-gray-900 cursor-pointer hover:underline"
                        onClick={() => setIsModalOpen(true)}
                      >
                        {instructor.firstName}{" "}
                        {instructor.middleName}{" "}
                        {instructor.lastName}
                      </h3>
                      {/* <p className="text-gray-700 text-sm mt-4 leading-relaxed">
                        {instructor.Bio || "No bio provided."}
                      </p> */}
                    </div>
                  </div>

                  <TeacherProfileModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    instructor={instructor}
                    avatar={avatar}
                  />
                </TabsContent>




                {/* reviews */}
                <TabsContent value="reviews" className="p-6">
                  <RatingSection courseId={courseDetails._id} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="md:col-span-1">
          <div className="border border-gray-200 rounded-xl p-6 sticky top-24 shadow-sm hover:shadow-lg transition-shadow duration-300 w-full">
            <div className="text-2xl mb-4 font-semibold text-gray-800">
              ${courseDetails.price}
            </div>

            <div className="flex flex-col gap-6 mb-6 opacity-50 pointer-events-none">
              <PurchaseConfirmationModal
                courseID={courseDetails._id}
              />
            </div>

            <div className="space-y-4">
              <div className="text-sm font-semibold text-gray-800">
                This course includes:
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <PlayCircle size={18} className="mt-0.5" />
                <span className="text-sm">
                  {courseDetails.videoHours} hours on-demand video
                </span>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 size={18} className="mt-0.5" />
                <span className="text-sm">Full lifetime access</span>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 size={18} className="mt-0.5" />
                <span className="text-sm">Access on mobile and web</span>
              </div>

              {courseDetails?.chapters.length > 0 && (
                <div className="flex items-start gap-2 text-gray-700">
                  <CheckCircle2 size={18} className="mt-0.5" />
                  <span className="text-sm">
                    Include {courseDetails?.chapters.length}{" "}
                    {courseDetails.chapters.length > 1 ? "chapters" : "chapter"}
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
};

export default StdPreview;
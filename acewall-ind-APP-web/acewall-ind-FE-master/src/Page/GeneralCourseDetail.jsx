import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { CheckCircle2, ChevronDown, Loader, PlayCircle, Star, StarHalf } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import avatar from "@/assets/avatar.png";


const GeneralCourseDetail = () => {
  const { id } = useParams(); // Grab the actual course ID from the URL
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCourseDetails = async () => {
      try {
        console.log("Fetching course with ID:", id); // Verify the ID
        const response = await axiosInstance.get(`/course/get/${id}`);

        console.log("API Response:", response.data); // Check the response format

        if (response.data?.course) {
          setCourseDetails(response.data.course);
        } else {
          console.error("No course found in response");
          setCourseDetails(null);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setCourseDetails(null);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (id) getCourseDetails();
    }, 2000);

    return () => clearTimeout(timer);
  }, [id]);

  console.log("Course Details State:", courseDetails); // Debug the state value

  if (loading)
    return (
      <div className="flex justify-center items-center py-10">
        <section className="flex justify-center items-center h-full w-full">
          <Loader className="animate-spin " />
        </section>
      </div>
    ); if (!courseDetails) return <div className="p-6 text-red-500">Course not found.</div>;

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 overflow-auto">
        <div className="  ">
          <div className="grid lg:grid-cols-3 gap-2 p-2">
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 p-8 overflow-hidden mb-6">
                <div className="p-6">
                  <h1 className="text-3xl font-bold mb-2">
                    {courseDetails.basics.courseTitle}
                  </h1>
                  <p className="text-gray-600 text-sm mb-4">{courseDetails.basics.courseDescription}</p>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          className=" rounded-full"
                          src={courseDetails.createdby.profileImg.url || avatar}
                          alt="Instructor"
                        />
                        <AvatarFallback>IN</AvatarFallback>
                      </Avatar>
                      <div className="ml-2">
                        <div className="text-sm font-medium">
                          {courseDetails.createdby.firstName} {courseDetails.createdby.middleName} {courseDetails.createdby.lastName}
                        </div>

                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(4)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className="text-yellow-400 fill-yellow-400"
                        />
                      ))}
                      <StarHalf
                        size={16}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {courseDetails.rating}
                    </span>
                    <span className="text-sm text-gray-500">
                      (1,234 ratings)
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative    aspect-video h-90">
                    <img
                      src={courseDetails.basics.thumbnail || '/default-thumbnail.jpg'}  // Fallback to default if thumbnail is not available
                      alt="Course preview"
                      className="w-full  shadow-md h-full object-cover"
                    />

                  </div>

                  <Tabs defaultValue="overview" className="w-full p-5">
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
                    <TabsContent value="overview" className="p-6">
                      <h2 className="text-lg font-bold mb-4">Description</h2>
                      <p className="text-gray-600 text-sm mb-4">{courseDetails.basics.courseDescription}</p>

                      <h2 className="text-lg font-bold mt-8 mb-4">
                        What you will learn in this course
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Array.isArray(courseDetails?.basics.teachingPoints) &&
                          courseDetails.basics.teachingPoints.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle2 size={20} className="text-green-500 mt-0.5 " />
                              <span className="text-sm">{item.value}</span>
                            </div>
                          ))}
                      </div>


                      <h2 className="text-lg font-bold mt-8 mb-4">
                        Course requirements                    </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Array.isArray(courseDetails?.basics.requirements) &&
                          courseDetails.basics.requirements.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle2 size={20} className="text-green-500 mt-0.5" />
                              <span className="text-sm">{item.value}</span>
                            </div>
                          ))}
                      </div>



                    </TabsContent>

                    {/* curriculam */}
                    <TabsContent value="curriculum" className="p-6">
                      <Accordion type="curriculum" collapsible className="w-full">
                        {Array.isArray(courseDetails?.chapters) && courseDetails.chapters.length > 0 ? (
                          courseDetails.chapters.map((chapter, index) => (
                            <AccordionItem key={index} value={`chapter-${index}`}>
                              <AccordionTrigger className="py-4 text-sm font-semibold flex justify-between items-center group">
                                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                <span>{chapter.title}</span>
                              </AccordionTrigger>

                              <AccordionContent>
                                <div className="space-y-4 pl-6">
                                  {Array.isArray(chapter.lessons) && chapter.lessons.length > 0 ? (
                                    chapter.lessons.map((lesson, i) => (
                                      <Collapsible key={i}>
                                        <CollapsibleTrigger className="w-full flex items-center justify-between text-left group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                                          <div className="flex items-center gap-2">
                                            <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                            <span className="text-sm font-medium text-gray-800">{lesson.title}</span>
                                          </div>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-4 shadow-inner space-y-3">
                                          <span className="font-bold  ">Description</span>
                                          {lesson.description && (
                                            <p className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: lesson.description }} />
                                          )}

                                          {lesson.youtubeLinks && (
                                            <span
                                              className="inline-block text-sm text-gray-400 font-medium cursor-not-allowed"
                                              title="Access restricted"
                                            >
                                              ▶ Watch Video
                                            </span>
                                          )}

                                          {Array.isArray(lesson.pdfFiles) && lesson.pdfFiles.length > 0 && (
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
                                    <div className="text-sm text-gray-500">No lessons available</div>
                                  )}
                                </div>

                                {Array.isArray(chapter.Assessment) && chapter.Assessment.length > 0 && (
                                  <div className="mt-6 border-t pt-4 space-y-2 pl-6">
                                    <div className="text-sm font-medium text-gray-700">Assessment</div>
                                    {chapter.Assessment.map((assess, j) => (
                                      <div key={j} className="text-sm text-gray-600">
                                        {assess.title} — <span className="italic">{assess.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No chapters available</div>
                        )}
                      </Accordion>
                    </TabsContent>

                    {/* instructor */}
                    <TabsContent value="instructor" className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-20 w-20 shadow-md ring-green-500 ring-3 rounded-full">
                          <AvatarImage
                            src={courseDetails.createdby.profileImg.url || avatar}
                            alt="Instructor"
                            className="object-cover rounded-full"
                          />
                          <AvatarFallback className="text-lg font-semibold">
                            {courseDetails.createdby.firstName?.charAt(0)}
                            {courseDetails.createdby.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-bold">
                            {courseDetails.createdby.firstName} {courseDetails.createdby.middleName} {courseDetails.createdby.lastName}
                          </h3>

                          <div className="flex items-center gap-2 mt-2">
                            <Star
                              size={16}
                              className="text-yellow-400 fill-yellow-400"
                            />
                            {/* <span className="text-sm font-medium">
                              {courseDetails.createdby.rating} Instructor Rating
                            </span> */}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {/* <User size={16} className="text-gray-500" /> */}
                            {/* <span className="text-sm text-gray-500">
                              {courseDetails.instructor.students} Students
                            </span> */}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <PlayCircle size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-500">
                              5 Courses
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-4">
                            {courseDetails.createdby.bio}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* reviews */}
                    <TabsContent value="reviews" className="p-6">
                      <div className="flex flex-col gap-8">
                        <div className="">
                          <div className="text-center">
                            <div className="text-4xl font-bold">
                              {courseDetails.rating}
                            </div>
                            <div className="flex justify-center my-2">
                              {[...Array(4)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className="text-yellow-400 fill-yellow-400"
                                />
                              ))}
                              <StarHalf
                                size={16}
                                className="text-yellow-400 fill-yellow-400"
                              />
                            </div>

                            <div className="text-sm text-gray-500">
                              Course Rating
                            </div>
                          </div>
                        </div>

                        <div className="md:w-2/3">
                          <h3 className="text-lg font-bold mb-4">
                            Students Feedback
                          </h3>
                          <div className="space-y-6">
                            {Array.isArray(courseDetails.reviews) && courseDetails.reviews.length > 0 ? (
                              courseDetails.reviews.map((review, index) => (
                                <div key={index} className="border-b border-gray-200 pb-6">
                                  <div className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage
                                        src={`/placeholder.svg?height=40&width=40&text=S${index}`}
                                        alt="Student"
                                      />
                                      <AvatarFallback>S{index}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">
                                        {review.student}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        {/* {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                ))} */}
                                      </div>
                                      <p className="text-sm mt-2">
                                        {review.comment}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p>No reviews available</p>
                            )}
                          </div>

                        </div>
                      </div>
                    </TabsContent>

                  </Tabs>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-20 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col gap-6 mb-6">
                  <div className="text-2xl text-green-600 font-extrabold flex items-center justify-between`">
                    <span>Price:</span>
                    {courseDetails.basics?.price ? (
                      courseDetails.basics.price.discounted !== undefined ? (
                        <span>${courseDetails.price.discounted}</span>
                      ) : (
                        <span>${courseDetails.basics.price}</span>
                      )
                    ) : (
                      <span className="text-gray-500 text-lg">Price not available</span>
                    )}
                  </div>
                  <Button className="w-full text-white text-sm py-2 bg-green-600 hover:bg-green-600 rounded-xl transition-colors duration-300">
                    Add to cart
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-800">
                    This course includes:
                  </div>
                  <div className="flex items-start gap-2 text-gray-700">
                    <PlayCircle size={18} className="mt-0.5" />
                    <span className="text-sm">{courseDetails.videoHours} hours on-demand video</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-700">
                    <CheckCircle2 size={18} className="mt-0.5" />
                    <span className="text-sm">Full lifetime access</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-700">
                    <CheckCircle2 size={18} className="mt-0.5" />
                    <span className="text-sm">Access on mobile and web</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-700">
                    <CheckCircle2 size={18} className="mt-0.5" />
                    <span className="text-sm">Include {courseDetails.chapters ? `${courseDetails.chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0)} Lessons ` : "No lessons included"}</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-700">
                    <CheckCircle2 size={18} className="mt-0.5" />
                    <span className="text-sm">Include
                      {courseDetails.level}  {
                        Array.isArray(courseDetails.chapters)
                          ? `${courseDetails.chapters.reduce((total, chapter) => {
                            return total + (Array.isArray(chapter.Assessment) ? chapter.Assessment.length : 0);
                          }, 0)} Assessments`
                          : "No Assessments available"
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
          {/* <div className="bg-white border border-gray-200 rounded-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Related Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(courseDetails.relatedCourses) &&
                courseDetails.relatedCourses.map((relatedCourse, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-md overflow-hidden"
                  >
                    <div className="relative aspect-video">
                      <img
                        src={
                          "https://plus.unsplash.com/premium_photo-1722111091429-dd3dc55979d3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8"
                        }
                        alt={`Related course ${index}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm">{relatedCourse.title}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className="text-yellow-400 fill-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs">(234)</span>
                      </div>
                    </div>
                  </div>
                ))}

            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default GeneralCourseDetail;

import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    CheckCircle,
    Star,
    Users,
    BookOpen,
    Clock,
    Send,
    Loader,
    BookOpenCheck,
    LibraryBig,
    Calendar,
} from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import RatingStars from "@/CustomComponent/RatingStars";
import CommentSection from "@/CustomComponent/Student/CommentSection";
import RatingSection from "@/CustomComponent/Student/RatingSection";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import avatar from "@/assets/avatar.png";
import { format } from "date-fns";
import { CourseContext } from "@/Context/CoursesProvider";
import BackButton from "@/CustomComponent/BackButton";

export default function stdPreview2() {
    const { id } = useParams(); // <-- This gives you the courseId
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [semesterbased, setSemesterBased] = useState();

    const [showModal, setShowModal] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");

    const Navigate = useNavigate();
    const { quarters, setQuarters } = useContext(CourseContext);

    const fetchCourse = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/course/getstdprew/${id}`);
            console.log(res.data, "res of stdpre"); // ✅ Log response
            setCourse(res.data.course);
            setSemesterBased(res.data.course.semesterbased); // ✅ IMPORTANT
        } catch (err) {
            console.error("Error fetching course:", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (id) fetchCourse();
    }, [id]);

    const handleConversation = async () => {
        await axiosInstance
            .post("conversation/create", {
                memberId: course?.createdby._id,
            })
            .then((res) => {
                console.log(res);
                Navigate("/student/messages");
            })
            .catch((err) => {
                console.log(err);
            });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader className="animate-spin" />
            </div>
        );
    }

    if (!course) {
        return <div className="p-6 text-center">Course not found.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <BackButton className="mb-10" />

            {/* Course Header */}
            <div
                className="space-y-6 bg-cover bg-center bg-no-repeat px-6 py-10 rounded-lg"
                style={{
                    backgroundImage: `url(${course.thumbnail?.url})`,
                }}
            >
                <div className="bg-[#ffffffa0] backdrop-filter backdrop-blur-xs bg-backdrop-blur-md p-6 rounded-lg space-y-6">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
                        {course.courseTitle}
                    </h1>

                    <p className="text-gray-900 font-medium leading-relaxed">
                        {course.courseDescription}
                    </p>

                    <div className="flex items-center gap-10 mt-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-gray-900 text-sm font-semibold mb-1">
                                Topic
                            </h3>
                            <Badge className="bg-green-100 text-green-800 text-sm border-none">
                                {course?.category?.title}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instructor Info */}
            <section className="flex items-center justify-between">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
                    <Avatar className="h-15 w-15 rounded-full bg-cover bg-center">
                        <AvatarImage
                            src={course?.createdby?.profileImg?.url || avatar}
                            alt={`${course.createdby.firstName} ${course.createdby.lastName}`}
                            className="h-full w-full bg-cover bg-center rounded-full"
                        />
                        <AvatarFallback>
                            {course.createdby.firstName.charAt(0)}
                            {course.createdby.lastName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-gray-800">
                            {course.createdby.firstName} {course.createdby.middleName}{" "}
                            {course.createdby.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{course.createdby.email}</p>
                    </div>
                </div>
                <div>
                    <Button className="bg-green-500" disabled>
                        Message
                    </Button>
                </div>
            </section>
            <section className="mt-10">
                {/* Conditional Semester/Chapter Rendering */}
                {semesterbased === true ? (
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <LibraryBig className="w-6 h-6" />
                                Course Semesters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {course?.semester?.length > 0 ? (
                                <div className="grid gap-4">
                                    {course.semester.map((semester, index) => (
                                        <Link
                                            key={semester._id}
                                            to={`/teacher/courses/${id}/semesterStdPre/${semester._id}?semesterbased=true`}
                                            className="block"
                                        >
                                            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
                                                <h3 className="font-semibold text-lg text-gray-900">
                                                    Semester {index + 1}: {semester.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(
                                                        new Date(semester.startDate),
                                                        "MMMM do, yyyy"
                                                    )}{" "}
                                                    -{" "}
                                                    {format(new Date(semester.endDate), "MMMM do, yyyy")}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <LibraryBig className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">No semesters found</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Create your first semester to get started
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <LibraryBig className="w-6 h-6" />
                                Course Chapters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <Link
                                    to={`/teacher/courses/${id}/quarterStdPre?semesterbased=false`}
                                    className="block"
                                >
                                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            Chapters
                                        </h3>
                                    </div>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </section>
            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full mt-12 bg-white z-10"
            >
                {/* Tab List */}
                <TabsList className="flex flex-wrap justify-center gap-4 w-full sm:gap-10 bg-white p-1 shadow-inner">
                    {["Overview", "Reviews"].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab.toLowerCase()}
                            className="px-3 py-2 text-base font-medium capitalize transition-all duration-300  
        text-gray-700 hover:text-green-600 hover:bg-gray-50 
        data-[state=active]:bg-gray-100 data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
                        >
                            {tab}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview" className="py-8 space-y-10">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">What You'll Learn</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {course?.teachingPoints?.map((point, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
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
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                                    <span>{req}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                    {/* unenroll section start  */}
                    <section>
                        <Button className="bg-green-500" disabled>
                            Unenroll
                        </Button>
                    </section>
                </TabsContent>

                {/* Reviews */}
                <TabsContent value="reviews" className="py-8 space-y-8">
                    <RatingSection id={id} course={course} disabled />
                    <CommentSection id={course._id} disabled />
                </TabsContent>
            </Tabs>
        </div>
    );
}
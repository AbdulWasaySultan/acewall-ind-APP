import React, { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Video, Calendar, User, BookOpen } from "lucide-react";
import MeetingToast from "./MeetingToast";

const CoursesWithMeetings = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [latestMeeting, setLatestMeeting] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Trying /zoom/with-meetings first as it relates to zoom meetings
                const res = await axiosInstance.get("/course/with-meetings");
                if (res.data.success) {
                    setCourses(res.data.courses);
                    console.log(res.data.courses);
                } else {
                    setCourses([]);
                }
            } catch (err) {
                console.error("Error fetching courses with meetings:", err);
                setError("Failed to load courses.");
            } finally {
                setLoading(false);
            }
        };

        const fetchUpcomingMeeting = async () => {
            try {
                // Endpoint to get the nearest upcoming meeting across all courses
                const res = await axiosInstance.get("/zoom/upcoming");
                if (res.data.success && res.data.meeting) {
                    setLatestMeeting(res.data.meeting);
                }
            } catch (err) {
                console.error("Error fetching upcoming meeting:", err);
            }
        };

        fetchCourses();
        fetchUpcomingMeeting();
    }, []);

    const handleJoin = async (meetingId) => {
        try {
            const res = await axiosInstance.get(`/zoom/join/${meetingId}`);
            if (res.data.url) {
                window.open(res.data.url, "_blank");
            } else {
                alert("Failed to retrieve Zoom URL.");
            }
        } catch (err) {
            console.error("Error joining meeting", err);
            alert("Could not join the meeting.");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Upcoming Meeting Toast Notification */}
            {latestMeeting && (
                <MeetingToast
                    meeting={latestMeeting}
                    onClose={() => setLatestMeeting(null)}
                    onJoin={handleJoin}
                />
            )}

            <div className="flex flex-col gap-2 border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Live Classes
                </h1>
                <p className="text-gray-500">
                    Courses that have scheduled Zoom meetings.
                </p>
            </div>

            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-gray-50/50">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                        <Video className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No active meetings found</h3>
                    <p className="mt-2 text-gray-500 max-w-sm">
                        There are currently no courses with scheduled meetings. Please check back later.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {courses.map((course) => (
                        <Card
                            key={course._id}
                            className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-none shadow-md group cursor-pointer"
                            onClick={() => navigate(`/student/mycourses/live-list/${course._id}`)}
                        >
                            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail.url}
                                        alt={course.courseTitle}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-200">
                                        <BookOpen className="h-16 w-16" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[var(--color-acewall-green)] shadow-sm backdrop-blur-sm">
                                    {course.category?.title || "Course"}
                                </div>
                            </div>

                            <CardHeader className="flex-1 p-4 pb-2">
                                <CardTitle className="line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-[var(--color-acewall-green)] transition-colors">
                                    {course.courseTitle}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                    <User className="h-4 w-4" />
                                    <span className="truncate">
                                        {course.createdby?.firstName} {course.createdby?.lastName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                    <Video className="h-4 w-4" />
                                    <span className="font-medium">
                                        {course.meetingCount || 0} Scheduled Meetings
                                    </span>
                                </div>
                            </CardHeader>

                            <CardFooter className="p-4 pt-2">
                                <Button
                                    className="w-full bg-[var(--color-acewall-green)] hover:bg-emerald-700 text-white shadow-emerald-200 shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/student/mycourses/live-list/${course._id}`);
                                    }}
                                >
                                    <Video className="mr-2 h-4 w-4" />
                                    View Meetings
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoursesWithMeetings;

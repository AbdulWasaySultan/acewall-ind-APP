import React, { useState, useEffect, useRef } from 'react';
import { axiosInstance } from '@/lib/AxiosInstance';
import { Video, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CoursesWithMeetings = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch courses with meetings
                const coursesRes = await axiosInstance.get('/course/with-meetings');
                const coursesData = coursesRes.data.courses || coursesRes.data.data || (Array.isArray(coursesRes.data) ? coursesRes.data : []);
                setCourses(coursesData);
            } catch (error) {
                console.error("Error fetching meetings data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container mx-auto p-6 min-h-[80vh]">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="bg-red-100 p-2 rounded-lg text-red-600">
                        <Video size={32} />
                    </span>
                    Live Classes Hub
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                    Find and join your scheduled Zoom sessions
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-gray-700">No scheduled classes found</h3>
                    <p className="text-gray-500">Check back later or contact your instructor.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <Card key={course._id} className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-red-500">
                            <CardHeader className="pb-3">
                                <div className="text-xs uppercase tracking-wider font-semibold text-red-600 mb-2">
                                    {course.category?.title || 'Course'}
                                </div>
                                <CardTitle className="line-clamp-2 text-xl">
                                    {course.courseTitle}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    <Video size={16} className="text-red-500" />
                                    <span className="font-medium">
                                        {course.meetingCount || 0} Scheduled Sessions
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full bg-gray-900 hover:bg-black group">
                                    <Link to={`/student/mycourses/live-list/${course._id}`}>
                                        View Schedule
                                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
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

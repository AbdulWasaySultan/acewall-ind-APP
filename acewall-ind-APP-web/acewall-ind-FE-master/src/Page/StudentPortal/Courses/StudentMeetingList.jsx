import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Loader2,
    Calendar,
    Clock,
    Video,
    PlayCircle,
    ArrowLeft,
    ChevronRight
} from "lucide-react";
import { format, isValid } from "date-fns";
import BackButton from "@/CustomComponent/BackButton";

const StudentMeetingList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [meetingRes, courseRes] = await Promise.all([
                    axiosInstance.get(`/zoom/course/${id}`),
                    axiosInstance.get(`/course/get/${id}`)
                ]);
                setMeetings(meetingRes.data);
                setCourse(courseRes.data.course);
            } catch (err) {
                console.error("Error fetching data", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleJoin = async (meetingId) => {
        try {
            const res = await axiosInstance.get(`/zoom/join/${meetingId}`);
            if (res.data.url) {
                window.open(res.data.url, '_blank');
            } else {
                alert("Failed to get meeting URL");
            }
        } catch (err) {
            console.error("Error joining meeting", err);
            alert("Could not join meeting. It may not have started yet.");
        }
    };

    const renderDateTime = (dateString) => {
        const dateObj = new Date(dateString);
        if (!isValid(dateObj)) return <span className="text-red-500">Invalid Date</span>;
        return (
            <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 font-semibold text-gray-900">
                    <Calendar size={16} className="text-green-600" /> {format(dateObj, "PPPP")}
                </span>
                <span className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock size={16} /> {format(dateObj, "p")} ({format(dateObj, "z")})
                </span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-8">
            <div className="flex items-center gap-4">
                <BackButton />
                <div>
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium mb-1">
                        <Link to="/student/meetings" className="hover:underline">Meetings</Link>
                        <ChevronRight size={14} />
                        <span className="truncate max-w-[200px]">{course?.courseTitle}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Course Meetings</h1>
                </div>
            </div>

            {meetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 p-16 text-center bg-white">
                    <div className="rounded-2xl bg-green-50 p-4 mb-4">
                        <Video className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No meetings scheduled</h3>
                    <p className="mt-2 text-gray-500 max-w-xs">
                        The instructor hasn't scheduled any live sessions for this course yet.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {meetings.map((m) => (
                        <Card key={m._id} className={`overflow-hidden border-none shadow-md transition-all ${m.status === 'active' ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}>
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row items-stretch">
                                    <div className={`w-2 shrink-0 ${m.status === 'active' ? 'bg-green-500' : m.status === 'ended' ? 'bg-gray-300' : 'bg-blue-500'}`} />

                                    <div className="flex-1 p-6">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-bold text-gray-900">{m.topic}</h3>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${m.status === 'active' ? 'bg-green-100 text-green-700' :
                                                                m.status === 'ended' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'
                                                            }`}>
                                                            {m.status || "Scheduled"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {renderDateTime(m.scheduledAt)}

                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="bg-gray-100 px-3 py-1 rounded-full">{m.duration} Minutes Session</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                {m.status === 'ended' ? (
                                                    <Button disabled className="bg-gray-100 text-gray-400 border-none">
                                                        Session Ended
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleJoin(m._id)}
                                                        className={`w-full md:w-auto px-8 h-12 font-bold shadow-lg transition-transform hover:scale-105 ${m.status === 'active'
                                                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                                                            }`}
                                                    >
                                                        <PlayCircle className="mr-2" size={20} />
                                                        {m.status === 'active' ? 'Join Now' : 'Join Session'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentMeetingList;

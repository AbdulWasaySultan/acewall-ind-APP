import React, { useContext, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";

const StdPagesView = () => {
    const { user } = useContext(GlobalContext);
    const studentId = user?._id;

    const [pages, setPages] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("all");
    const [selectedPost, setSelectedPost] = useState(null);

    const fetchPages = async (courseId = "all") => {
        try {
            let url = `/pages/studentpages?studentId=${studentId}`;
            if (courseId !== "all") {   
                url += `&courseId=${courseId}`;
            }
            const res = await axiosInstance.get(url);
            setPages(res.data.pages || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch pages");
            setPages([]);
        }
    };

    const fetchStudentCourses = async () => {
        try {
            const res = await axiosInstance.get("/enrollment/studentCourses");
            const enrolledCourses = res.data.enrolledCourses.map(e => e.course);
            setAllCourses(enrolledCourses || []);
        } catch (err) {
            toast.error("Failed to fetch enrolled courses");
        }
    };

    useEffect(() => {
        if (studentId) {
            fetchStudentCourses();
            fetchPages();
        }
    }, [studentId]);

    const handleCourseFilter = (value) => {
        setSelectedCourseId(value);
        fetchPages(value);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">Your Course Pages</h1>
            </div>

            {/* Filter Dropdown */}
            <div className="max-w-xs">
                <Select value={selectedCourseId} onValueChange={handleCourseFilter}>
                    <SelectTrigger>
                        <SelectValue>
                            {selectedCourseId === "all"
                                ? "All Courses"
                                : allCourses.find(c => c._id === selectedCourseId)?.courseTitle || "Select Course"}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {allCourses.map((course) => (
                            <SelectItem key={course._id} value={course._id}>
                                {course.courseTitle}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Page Cards */}
            {pages.length === 0 ? (
                <p className="text-sm text-gray-500 mt-4">No pages found for your selected course.</p>
            ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pages.map((post) => (
                        <div
                            key={post._id}
                            id={`page-${post._id}`}
                            className="bg-white border rounded-lg shadow-sm p-4 space-y-4 hover:shadow-md cursor-pointer"
                            onClick={() => setSelectedPost(post)}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold truncate max-w-[80%]">{post.title}</h3>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">{post.description}</p>
                            {post.image?.url && (
                                <img
                                    src={post.image.url}
                                    alt="Post visual"
                                    className="w-full h-48 object-cover rounded-md border"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for detailed post view */}
            {selectedPost && (
                <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
                    <DialogContent className=" !max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl">{selectedPost?.title}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            {selectedPost.image?.url && (
                                <img
                                    src={selectedPost.image.url}
                                    alt="Page visual"
                                    className="w-full object-contain rounded-md border max-h-[70vh]"
                                />
                            )}

                            <p className="text-sm text-gray-700 whitespace-pre-line">
                                {selectedPost?.description}
                            </p>

                            {selectedPost.files?.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Attachments:</h4>
                                    <ul className="list-disc pl-5 text-sm text-blue-600">
                                        {selectedPost.files.map((file, idx) => (
                                            <li key={idx}>
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline"
                                                >
                                                    {file.filename}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default StdPagesView;

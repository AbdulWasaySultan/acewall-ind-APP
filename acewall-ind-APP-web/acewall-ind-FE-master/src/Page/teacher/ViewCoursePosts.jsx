import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Trash2, Users } from "lucide-react";
import Pages from "@/CustomComponent/teacher/Pages";
import { GlobalContext } from "@/Context/GlobalProvider";
import { useParams, useSearchParams } from "react-router-dom";

const ViewCoursePostsPage = () => {
  const { user } = useContext(GlobalContext);
  const teacherId = user?._id;
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("all");

  const [searchParams] = useSearchParams();
  const chapterId = searchParams.get("chapter");

  const { courseId, type, typeId } = useParams();

  const fetchPages = async () => {
    try {
      const res = await axiosInstance.get(
        `/pages/${courseId}/${type}/${typeId}`
      );

      console.log(res, "res");
      setPosts(res.data.pages || []);
    } catch (err) {
      console.log(err.response?.data?.message || "Failed to fetch pages");
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDeletePage = async (pageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this page?"
    );
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/pages/deletepage/${pageId}`);
      toast.success("Page deleted successfully");
      fetchPages(selectedCourseId);
    } catch (err) {
      toast.error("Failed to delete page");
    }
  };

  const handleCourseFilter = (value) => {
    setSelectedCourseId(value);
    fetchPages(value);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Pages for {type}</h1>
        <Pages
          onCreated={() => fetchPages(selectedCourseId)}
          courseId={courseId}
          type={type}
          typeId={typeId}
        />
      </div>

      {/* Page Cards */}
      {posts.length === 0 ? (
        <p className="text-sm text-gray-500 mt-4">
          No pages found for this teacher or course.
        </p>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              id={`page-${post._id}`}
              className="bg-white border rounded-lg shadow-sm p-4 space-y-4 hover:shadow-md cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold truncate max-w-[80%]">
                  {post.title}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePage(post._id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">
                {post.description}
              </p>
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
        <Dialog
          open={!!selectedPost}
          onOpenChange={() => setSelectedPost(null)}
        >
          <DialogContent className=" !max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedPost?.title}
              </DialogTitle>
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

export default ViewCoursePostsPage;

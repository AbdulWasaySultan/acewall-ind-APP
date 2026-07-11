import React, { useState, useEffect, useContext, useRef } from "react";
import { PlusCircle, Coffee, User, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import PostCard from "@/CustomComponent/teacher/Socials/PostCard";
import CreatePostModal from "@/CustomComponent/teacher/Socials/CreatePostModal";
import { GlobalContext } from "@/Context/GlobalProvider";
import { axiosInstance } from "@/lib/AxiosInstance";

const SocialMain = ({ posts: externalPosts, setPosts: setExternalPosts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localPosts, setLocalPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const { user } = useContext(GlobalContext);

  const posts = externalPosts || localPosts;
  const setPosts = setExternalPosts || setLocalPosts;
  const postRefs = useRef({});
  const previousPostCount = useRef(0);

  // ✅ 1. Fetch courses for the dropdown (Teachers & Students)
  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user?._id) return;
      try {
        const res = await axiosInstance.get("/enrollment/my-courses");
        setEnrolledCourses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Error fetching courses:", err);
        setEnrolledCourses([]);
      }
    };
    fetchMyCourses();
  }, [user?._id]);

  // ✅ 2. Fetch posts with filtering logic
  const fetchPosts = async (pageNum = 1, courseFilter = selectedCourse) => {
    try {
      setLoading(true);
      let url = `/posts/getPosts?page=${pageNum}&limit=10`;

      // Append course filter if not 'all'
      if (courseFilter !== "all") {
        url += `&courseId=${courseFilter}`;
      }

      const response = await axiosInstance.get(url);
      const fetched = response.data?.posts || [];

      const normalized = fetched.map((post) => ({
        ...post,
        author: {
          firstName: post?.author?.firstName || "Deleted",
          middleName: post?.author?.middleName || "",
          lastName: post?.author?.lastName || "User",
          profileImg:
            post?.author?.profileImg?.url || "https://via.placeholder.com/150",
        },
      }));

      if (pageNum === 1) {
        setPosts(normalized);
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const uniqueNew = normalized.filter((p) => !existingIds.has(p._id));
          return [...prev, ...uniqueNew];
        });
      }
      setHasMore(fetched.length === 10);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 3. Reset feed when course filter changes
  useEffect(() => {
    setPage(1);
    fetchPosts(1, selectedCourse);
  }, [selectedCourse]);

  // ✅ 4. Load more for infinite scroll
  useEffect(() => {
    if (page > 1) fetchPosts(page, selectedCourse);
  }, [page]);

  // ✅ 5. Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
          document.documentElement.offsetHeight &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  // ✅ 6. Handle refresh after new post
  const handleCreatePost = async () => {
    setIsModalOpen(false);
    setPage(1);
    await fetchPosts(1, selectedCourse);
  };

  return (
    <div className="min-h-screen bg-blue-300">
      {/* 🔝 Sticky Navbar */}
      <div className="bg-blue-600 text-white rounded-lg shadow-sm sticky top-0 z-40 flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center gap-3">
          <Coffee className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-wide hidden sm:block">
            Spill The Tea
          </h1>

         
          {/* 🔍 Filter Dropdown */}
          <div className="flex items-center bg-white text-blue-700 rounded-full px-3 ml-4 border border-blue-200 shadow-sm min-w-[140px]">
            <Filter className="w-3.5 h-3.5 mr-2 opacity-70" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-transparent text-xs font-bold py-1.5 outline-none cursor-pointer w-full appearance-none"
              style={{ WebkitAppearance: "none" }} // Removes default arrow for cleaner look
            >
              <option value="all" className="bg-white text-gray-800">
                🌍 All Posts
              </option>
              {enrolledCourses.length > 0 && (
                <optgroup
                  label="My Courses"
                  className="text-gray-400 font-normal"
                >
                  {enrolledCourses.map((course) => (
                    <option
                      key={course._id}
                      value={course._id}
                      className="bg-white text-gray-800"
                    >
                      📚 {course.courseTitle}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`socialprofile/${user?._id}`}>
            <button className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium transition hover:bg-gray-100 shadow-sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2 rounded-full font-bold transition hover:bg-gray-100 shadow-sm"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* 🧾 Posts Feed */}
      <div className="max-w-3xl mx-auto mt-6 space-y-4 px-2 sm:px-4 pb-10">
        {posts.length > 0
          ? posts.map((post) => (
              <div
                key={post._id}
                ref={(el) => (postRefs.current[post._id] = el)}
              >
                <PostCard post={post} setPosts={setPosts} />
              </div>
            ))
          : !loading && (
              <div className="text-center text-white bg-black/10 p-10 rounded-xl font-medium">
                No tea spilled here yet...
              </div>
            )}

        {loading && (
          <div className="text-center text-white font-medium py-6 animate-pulse">
            Loading posts...
          </div>
        )}
      </div>

      {/* ✏️ Create Post Modal */}
      {isModalOpen && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreatePost}
          enrolledCourses={enrolledCourses}
        />
      )}
    </div>
  );
};

export default SocialMain;

import React, { useState, useEffect, useContext } from "react";
import { PlusCircle, Coffee, User } from "lucide-react";
import { Link } from "react-router-dom";
import { GlobalContext } from "@/Context/GlobalProvider";
import { axiosInstance } from "@/lib/AxiosInstance";
import PostCard from "@/CustomComponent/Socials/PostCard";
import CreatePostModal from "@/CustomComponent/Socials/CreatePostModal";

const SocialMain = ({ posts: externalPosts, setPosts: setExternalPosts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localPosts, setLocalPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(GlobalContext);

  // Use external state if provided, otherwise use local state
  const posts = externalPosts || localPosts;
  const setPosts = setExternalPosts || setLocalPosts;

  // ✅ Fetch all posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/posts/getPosts?page=1&limit=10`);
      const fetched = response.data?.posts || [];
      console.log(response,"data");
      

      // ✅ Normalize data
      const normalized = fetched.map((post) => ({
        _id: post._id,
        text: post.text || "",
        color: post.color || "#ffffff",
        assets: Array.isArray(post.assets) ? post.assets : [],
        author: {
          firstName: post?.author?.firstName || "Unknown",
          middleName: post?.author?.middleName || "",
          lastName: post?.author?.lastName || "",
          // Use aria-label on the image later if it's purely decorative, or alt text if possible
          profileImg:
            post?.author?.profileImg?.url ||
            "https://i.pravatar.cc/100?img=10",
        },
        createdAt: post.createdAt || new Date().toISOString(),
        likes: post.likes || [],
        comments: post.comments || [],
        liked: false,
      }));

      setPosts(normalized);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if no external posts are provided (i.e., component manages its own state)
    if (!externalPosts) {
      fetchPosts();
    }
  }, [externalPosts]); // Dependency handles initial fetch when component mounts

  // ✅ After post creation, refresh posts
  const handleCreatePost = async () => {
    setIsModalOpen(false);
    await fetchPosts();
  };

  return (
    <div className="min-h-screen bg-blue-200">
      {/* 🔝 Navbar - Main page header and navigation */}
      <div 
        className="bg-blue-600 text-white rounded-lg shadow-sm sticky top-0 flex items-center justify-between px-6 py-3 border-b"
        role="navigation"
        aria-label="Social Network Navigation and Actions"
      >
        <div className="flex items-center gap-3">
          {/* Main title (H1) for the page content area */}
          <Coffee className="w-6 h-6" aria-hidden="true" />
          <h1 className="text-xl font-bold tracking-wide">Spill The Tea</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* 👤 Profile Link */}
          <Link 
            to={`socialprofile/${user._id}`}
            aria-label="View your social profile"
          >
            <button className="flex items-center gap-2 bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-full transition text-sm font-medium">
              <User className="w-4 h-4" aria-hidden="true" />
              <span>Profile</span>
            </button>
          </Link>

          {/* ➕ Create Post Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-blue-600 px-5 py-2 rounded-full transition"
            aria-label="Create a new post"
          >
            <PlusCircle className="w-5 h-5" aria-hidden="true" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* 🧾 Posts Feed */}
      <div 
        className="max-w-3xl mx-auto pt-8 space-y-4 px-2 sm:px-4 pb-10 bg-white"
        role="feed"
        aria-label="Social media posts feed"
      >
        {loading ? (
          // Loading state uses role="status" and aria-live="polite"
          <div className="text-center text-gray-500 py-6" role="status" aria-live="polite">
            Loading posts...
          </div>
        ) : posts.length > 0 ? (
          // List of posts (PostCard is assumed to be accessible)
          posts.map((post) => (
            <PostCard 
              key={post._id} 
              post={post} 
              setPosts={setPosts} 
              // Optional: Add a title or aria-label if PostCard is a complex card, not just a list item
            />
          ))
        ) : (
          // Empty state uses role="status" and aria-live="polite"
          <div className="text-center text-gray-500 py-6" role="status" aria-live="polite">
            No posts found. Be the first to start !
          </div>
        )}
      </div>

      {/* ✏️ Create Post Modal */}
      {isModalOpen && (
        // Modal component should handle its own accessibility (e.g., role="dialog", aria-modal, focus trapping)
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreatePost}
          aria-label="Create New Post Dialog"
        />
      )}
    </div>
  );
};

export default SocialMain;
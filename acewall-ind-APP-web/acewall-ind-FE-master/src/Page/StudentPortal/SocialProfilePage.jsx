import React, { useContext, useEffect, useState } from "react";
import { ArrowLeft, Grid, Loader } from "lucide-react"; // Import Loader for better accessibility
import { useNavigate, useParams } from "react-router-dom";
import { GlobalContext } from "@/Context/GlobalProvider";
import { axiosInstance } from "@/lib/AxiosInstance";
import avatar from "../../assets/avatar.png";
import BackButton from "@/CustomComponent/BackButton";
import PostCard from "@/CustomComponent/Socials/PostCard";

const SocialProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  // Destructure context variables; ensuring they are used if necessary, but focusing on the component logic
  const { checkAuth, user, Authloading, UpdatedUser } =
    useContext(GlobalContext);

  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Determine whose profile we are viewing to set the correct alt text/info
  const isViewingOwnProfile = user && user._id === userId;
  const displayUser = isViewingOwnProfile ? UpdatedUser : userInfo;
  
  // Create a descriptive name for ARIA labels
  const userName = displayUser?.firstName || "Social User";

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `posts/specificUserPosts/${userId}`
      );
      const { posts } = response.data;
      
      // Update posts state
      setPosts(posts);
      
      // If we are viewing another user's profile, set their info from the posts data
      if (!isViewingOwnProfile && posts.length > 0 && posts[0].author) {
        setUserInfo(posts[0].author);
      } else if (!isViewingOwnProfile && posts.length === 0) {
          // If no posts, fetch minimal user info if not already set (e.g., if user navigated directly)
          // This assumes an endpoint exists for minimal user info, but based on the original logic, 
          // we rely on posts[0].author. If that fails, the profile will show 'Social User'.
      }

    } catch (error) {
      console.error("Error fetching user posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUserPosts();
  }, [userId, isViewingOwnProfile]); // Dependency on userId and whether it's the current user

  return (
    <div className="min-h-screen">
      {/* <h1> is implicitly handled by the layout's main structure, but we can set a main title visually: */}
      <h1 className="sr-only">Social Profile for {userName}</h1>

      {/* Back button (Assuming BackButton component is accessible) */}
      <BackButton className="mb-4" />

      {/* Profile Header (Role: region for user identification) */}
      <div 
        className="flex items-center justify-between mt-6 mb-4 w-full px-4"
        role="region"
        aria-label={`${userName}'s Profile Information`}
      >
        {/* Profile Section */}
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden">
            <img
              src={displayUser?.profileImg?.url || avatar}
              // Essential: Descriptive alt text for the profile image
              alt={`${userName}'s profile picture`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            {/* H2 for the user's name (subheading under the implicitly titled page) */}
            <h2 className="text-lg font-semibold text-gray-800">
              {displayUser?.firstName || ""} {displayUser?.lastName || "Social User"}
            </h2>
            <p className="text-gray-500 text-sm">{displayUser?.email || ""}</p>
          </div>
        </div>

        {/* Post Count (Role: status to announce dynamic data) */}
        <p className="text-gray-500 text-sm whitespace-nowrap" role="status" aria-live="polite">
          {posts.length} Posts
        </p>
      </div>

      {/* Main Content (Posts Feed) */}
      <section className="bg-blue-200" role="feed" aria-label={`${userName}'s Social Posts`}>
        <div className="max-w-3xl mx-auto pt-8 space-y-4 px-2 sm:px-4 pb-10 bg-white">
          {/* Posts */}
          {loading ? (
            // Loading State: Use role="status" and visually hidden text
            <div className="text-center text-gray-500 mt-10 py-6" role="status" aria-live="polite">
                <Loader className="w-6 h-6 animate-spin mx-auto" aria-hidden="true" />
                <span className="sr-only">Loading posts...</span>
            </div>
          ) : posts.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-4 px-2 sm:px-4 pb-10">
              {posts.map((post) => (
                <PostCard 
                    key={post._id} 
                    post={post} 
                    setPosts={setPosts} 
                    // Assuming PostCard handles its own internal accessibility
                />
              ))}
            </div>
          ) : (
            // Empty State: Use role="status" and visually hidden text
            <div className="flex flex-col items-center justify-center mt-16 text-gray-500" role="status" aria-live="polite">
              <Grid className="w-10 h-10 mb-2" aria-hidden="true" />
              <p>No posts yet.</p>
              <span className="sr-only">{userName} has not posted yet.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SocialProfilePage;
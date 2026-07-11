import React, { useContext, useEffect, useState } from "react";
import { ArrowLeft, Grid } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalContext } from "@/Context/GlobalProvider";
import { axiosInstance } from "@/lib/AxiosInstance";
import avatar from "../../assets/avatar.png";
import BackButton from "@/CustomComponent/BackButton";
import PostCard from "@/CustomComponent/Socials/PostCard";

const SocialProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { checkAuth, user, Authloading, setAuthLoading, UpdatedUser } =
    useContext(GlobalContext);


  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`posts/specificUserPosts/${userId}`);
      const { posts } = response.data;
      setPosts(posts);
      if (posts.length > 0 && posts[0].author) {
        setUserInfo(posts[0].author);
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
  }, [userId]);

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <BackButton className="mb-4" />
      {/* <div className="bg-green-600 text-white sticky top-0 flex items-center justify-between px-6 py-3 border-b  rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-wide">User Profile</h1>
        </div>
      </div> */}

      {/* Profile Header */}
      {/* Profile Header */}
      <div className="flex items-center justify-between mt-6 mb-4 w-full px-4">
        {/* Profile Section */}
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden">
            <img
              src={UpdatedUser?.profileImg?.url || avatar}
              alt={UpdatedUser?.firstName || "User Avatar"}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {UpdatedUser?.firstName || ""} {UpdatedUser?.lastName || ""}
            </h2>
            <p className="text-gray-500 text-sm">{UpdatedUser?.email || ""}</p>
          </div>
        </div>

        {/* Post Count */}
        <p className="text-gray-500 text-sm whitespace-nowrap">
          {posts.length} Posts
        </p>
      </div>



      {/* Posts */}
      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading posts...</p>
      ) : posts.length > 0 ? (
        <div className="max-w-3xl mx-auto space-y-4 px-2 sm:px-4 pb-10">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} setPosts={setPosts} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-16 text-gray-500">
          <Grid className="w-10 h-10 mb-2" />
          <p>No posts yet.</p>
        </div>
      )}
    </div>
  );
};

export default SocialProfilePage;
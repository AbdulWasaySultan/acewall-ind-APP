import React, { useState } from "react";
import PostReactions from "./PostReactions";
import PostComments from "./PostComments";
import { axiosInstance } from "@/lib/AxiosInstance";
import DeleteConfirmDialog from "./DeletePostModal";
import { GraduationCap, Video as VideoIcon } from "lucide-react";
import avatar from "../../assets/avatar.png";

const PostCard = ({ post, setPosts }) => {
  const [showComments, setShowComments] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const location = window.location.pathname;

  const TEXT_LIMIT = 200;

  // Author details fallback
  const author = post?.author || {};
  const authorName = `${author.firstName || "User"} ${author.lastName || ""}`.trim();
  const profilePic = author?.profileImg?.url || avatar;

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const text = stripHtml(post?.text || "");

  return (
    <article className="bg-white rounded-xl shadow-sm p-4 mb-4 hover:shadow-md transition-shadow">
      {/* 🟢 Header */}
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img 
            src={profilePic} 
            className="w-10 h-10 rounded-full object-cover border border-gray-100" 
            alt="author" 
          />
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="font-bold text-gray-900 leading-none">{authorName}</h2>
              
              {/* 🎓 Course Badge (Only shows if post is course-specific) */}
              {post.postType === "course" && (
                <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-blue-100">
                  <GraduationCap className="w-3 h-3" /> 
                  {post.course?.courseCode || post.course?.courseTitle || "Class"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Delete option only on profile page */}
        {location.includes("/socialprofile/") && (
          <DeleteConfirmDialog onDelete={async () => {
            try {
              await axiosInstance.delete(`/posts/deletePost/${post._id}`);
              setPosts(prev => prev.filter(p => p._id !== post._id));
            } catch (err) {
              alert("Failed to delete post");
            }
          }} />
        )}
      </header>

      {/* 🟢 Post Content */}
      <div className="text-gray-800 text-[14px] leading-relaxed mb-3">
        {showFullText || text.length <= TEXT_LIMIT ? text : `${text.slice(0, TEXT_LIMIT)}...`}
        {text.length > TEXT_LIMIT && (
          <button 
            onClick={() => setShowFullText(!showFullText)}
            className="text-blue-600 font-semibold ml-1 hover:underline"
          >
            {showFullText ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* 🟢 Media Gallery */}
      {post.assets && post.assets.length > 0 && (
        <div className="space-y-2 mb-3">
          {post.assets.map((asset, i) => {
            const isVideo = asset.type?.startsWith("video/") || asset.url?.match(/\.(mp4|webm|ogg)$/i);
            
            return isVideo ? (
              <div key={i} className="rounded-lg overflow-hidden bg-black max-h-[400px]">
                <video controls className="w-full max-h-[400px]">
                  <source src={asset.url} type={asset.type || "video/mp4"} />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <img 
                key={i} 
                src={asset.url} 
                className="w-full rounded-lg object-contain max-h-[500px] border border-gray-50" 
                alt="post content" 
              />
            );
          })}
        </div>
      )}

      {/* 🟢 Interaction Section */}
      <div className="border-t pt-2">
        <PostReactions 
          post={post} 
          setPosts={setPosts} 
          onToggleComments={() => setShowComments(!showComments)} 
        />
        
        {showComments && (
          <div className="mt-2 animate-in fade-in slide-in-from-top-1">
            <PostComments postId={post._id} setPosts={setPosts} />
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;
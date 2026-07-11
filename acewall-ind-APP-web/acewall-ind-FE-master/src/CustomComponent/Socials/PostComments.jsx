import React, { useContext, useEffect, useState } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const PostComments = ({ postId, setPosts }) => {
  const { user } = useContext(GlobalContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ✅ Fetch comments
  const fetchComments = async (reset = false) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/postComment/getPostComment/${postId}?page=${reset ? 1 : page}&limit=5`
      );
      const newComments = res.data.comments || [];

      setComments((prev) => (reset ? newComments : [...prev, ...newComments]));
      setHasMore(newComments.length === 5);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Reset on post change
  useEffect(() => {
    if (postId) {
      setPage(1);
      fetchComments(true);
    }
  }, [postId]);

  // 🔁 Fetch next page
  useEffect(() => {
    if (page > 1) fetchComments();
  }, [page]);

  // ✅ Handle comment submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSending(true);
      const res = await axiosInstance.post(
        `/postComment/sendComment/${postId}`,
        { text: newComment }
      );

      const comment = res.data.newComment;
      setComments((prev) => [comment, ...prev]);
      setNewComment("");

      // 🔁 Update comment count in parent post state
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, commentCount: (p.commentCount || 0) + 1 }
            : p
        )
      );
    } catch (error) {
      console.error("Error sending comment:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      {/* 💬 Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {loading && page === 1 ? (
          <p className="text-gray-500 text-sm">Loading comments...</p>
        ) : comments.length > 0 ? (
          <>
            {comments.map((comment) => {
              const author = comment.author || {};
              const profileUrl =
                author.profileImg?.url || "/default-avatar.png";

              return (
                <div
                  key={comment._id}
                  className="flex items-start gap-3 animate-fadeIn"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={profileUrl}
                      alt={`${author.firstName || "User"}'s avatar`}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = "/default-avatar.png")}
                    />
                  </div>

                  <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-[85%]">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-gray-800">
                        {author.firstName} {author.lastName}
                      </p>
                      {comment.createdAt && (
                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm mt-0.5 break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* See More */}
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="text-blue-500 text-sm hover:underline mt-2 disabled:text-gray-400"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "See more comments"}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-sm">No comments yet.</p>
        )}
      </div>

      {/* ✏️ Add Comment */}
      <form
        onSubmit={handleCommentSubmit}
        className="flex items-center gap-2 mt-3"
      >
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full border border-gray-300 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default PostComments;
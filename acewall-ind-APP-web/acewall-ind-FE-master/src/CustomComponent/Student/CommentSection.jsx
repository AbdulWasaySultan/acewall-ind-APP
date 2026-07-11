import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Send, Trash2 } from "lucide-react";
import React, { useEffect, useState, useContext } from "react";
import { toast } from "sonner";
import avatar from "../../assets/avatar.png";
import { GlobalContext } from "@/Context/GlobalProvider";

const CommentSection = ({ id }) => {
  const { user } = useContext(GlobalContext); // ✅ Access logged-in user
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments
  useEffect(() => {
    const getCourseComments = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/comment/${id}`);
        setComments(res.data.comments || []);
      } catch (error) {
        console.error(error);
        // toast.error("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getCourseComments();
    }
  }, [id]);

  // Submit a comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(`/comment/sendComment/${id}`, { text: comment });
      const newComment = response.data.comment;
      setComments((prev) => [...prev, newComment]);
      toast.success(response.data.message || "Comment posted successfully");
      setComment("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    const confirmDelete = confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/comment/${id}/comment/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Comments ({comments.length})</h3>

      {/* Add Comment Form */}
      <form onSubmit={handleCommentSubmit} className="mb-8">
        <div className="space-y-4">
          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || !comment.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-500 text-center py-6">Loading comments...</p>
        ) : comments.length > 0 ? (
          [...comments].reverse().map((comment) => (
            <div key={comment?._id} className="border-b pb-6">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={comment?.createdby?.profileImg?.url || avatar}
                    alt={comment?.createdby?.firstName}
                  />
                  <AvatarFallback>
                    {comment?.createdby?.firstName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {comment?.createdby?.firstName} {comment?.createdby?.lastName}
                      </p>
                      {comment?.createdby?.role && (
                        <span
                          className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${
                            comment.createdby.role === "admin"
                              ? "bg-red-600 text-white"
                              : comment.createdby.role === "teacher"
                              ? "bg-blue-600 text-white"
                              : "bg-green-600 text-white"
                          }`}
                        >
                          {comment.createdby.role}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(comment?.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {/* Show delete if logged-in user is the comment owner */}
                    {user?._id === comment?.createdby?._id && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-gray-700">{comment?.text}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-6">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

import { GlobalContext } from "@/Context/GlobalProvider";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Send, Trash2 } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { DiscussionGradeModel } from "./DiscussionGradeModel";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const ChatBox = ({ discussionId, discussion }) => {
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState([]);
  const [replyCounts, setReplyCounts] = useState({});
  const { user } = useContext(GlobalContext);
  const [sendingComment, setSendingComment] = useState("");
  const [sendingReply, setSendingReply] = useState("");
  const [sendingLoading, setSendingLoading] = useState(false); // for comment
  const [replyLoading, setReplyLoading] = useState({}); // for reply
  const [page, setPage] = useState(1);
  const [replyPage, setreplyPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isRepleying, setIsReplying] = useState({ status: "false", id: null });
  const [hasMoreReplies, setHasMoreReplies] = useState({});
  const [isCommented, setIsCommented] = useState(false);
  const [canComment, setCanComment] = useState(true);

  console.log(isCommented, "isCommented");
  console.log(canComment, "canComment");

  const formatDate = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const fetchReplyCount = async (commentId) => {
    try {
      const res = await axiosInstance.get(
        `/replyDiscussion/replycount/${commentId}`,
      );
      setReplyCounts((prev) => ({
        ...prev,
        [commentId]: res.data.replyCount,
      }));
    } catch (error) {
      console.error("Error fetching reply count:", error);
    }
  };

  const checkIsCommented = async () => {
    await axiosInstance
      .get(`discussionComment/isCommentedInDiscussion/${discussionId}`)
      .then((res) => {
        console.log(res);
        setIsCommented(res.data.commented);
        setCanComment(res.data.canComment);
      })
      .catch((err) => {
        console.log(err);
        // On error, default to allowing comments for safety
        setCanComment(true);
      });
  };

  const fetchComments = async (pageNum = 1, append = false) => {
    try {
      const res = await axiosInstance.get(
        `discussionComment/v2/get/${discussionId}?page=${pageNum}&limit=5`,
      );
      const data = res.data;

      setHasMore(data.discussionComments.length === 5);

      const updatedComments = append
        ? [...comments, ...data.discussionComments]
        : data.discussionComments;

      setComments(updatedComments);
      checkIsCommented();

      data.discussionComments.forEach((comment) => {
        fetchReplyCount(comment._id);
      });

      if (!append) setPage(1);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [discussionId]);

  useEffect(() => {
    checkIsCommented();
  }, []);

  const fetchReplies = async (pageNum = 1, append = false, commentId) => {
    try {
      const res = await axiosInstance.get(
        `replyDiscussion/get/${commentId}?page=${pageNum}&limit=5`,
      );
      const data = res.data;

      const sortedReplies = data.replies.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );

      setHasMoreReplies((prev) => ({
        ...prev,
        [commentId]: data.replies.length === 5,
      }));

      setReplies((prev) => ({
        ...prev,
        [commentId]:
          append && pageNum > 1
            ? [
                ...(prev[commentId] || []),
                ...sortedReplies.filter(
                  (reply) =>
                    !(prev[commentId] || []).some((r) => r._id === reply._id),
                ),
              ]
            : sortedReplies,
      }));

      if (!append) setreplyPage(1);
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchComments(nextPage, true);
    setPage(nextPage);
  };

  const handleLoadReplyMore = (commentId) => {
    const nextPage = replyPage + 1;
    fetchReplies(nextPage, true, commentId);
    setreplyPage(nextPage);
  };

  const sendComment = async () => {
    if (!sendingComment.trim()) return;
    setSendingLoading(true);
    await axiosInstance
      .post(`discussionComment/v2/sendComment/${discussionId}`, {
        text: sendingComment,
      })
      .then((res) => {
        setSendingComment("");
        fetchComments();
        checkIsCommented();
        setSendingLoading(false);
      })
      .catch((err) => {
        console.log("Error sending comment:", err);
        toast.error(err.response.data.message);
        setSendingLoading(false);
      });
  };

  const sendReply = async (commentId) => {
    if (!sendingReply.trim()) return;
    setReplyLoading((prev) => ({ ...prev, [commentId]: true }));
    try {
      await axiosInstance.post(`replyDiscussion/send/${commentId}`, {
        text: sendingReply,
      });
      setSendingReply("");
      fetchReplies(1, false, commentId);
      fetchReplyCount(commentId);
    } catch (err) {
      console.log(err);
    } finally {
      setReplyLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  return (
    <section className="w-full min-h-full p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">
        Comments
      </h2>

      <div className="h-[400px] overflow-y-auto space-y-6 pr-2">
        {comments?.length === 0 ? (
          <p className="text-center text-gray-500">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={comment?.createdby?.profileImg?.url} alt="" />
                <AvatarFallback>
                  {comment?.createdby?.firstName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col w-full space-y-2">
                <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium text-sm">
                      {comment?.createdby?.firstName}{" "}
                      {comment?.createdby?.lastName}
                    </p>

                    <div className="flex items-center gap-4">
                      <div
                        className={`${
                          comment.status === "beforeDueDate"
                            ? "text-green-600"
                            : comment.status === "afterDueDate"
                              ? "text-red-600"
                              : ""
                        }`}
                      >
                        {comment.status === "before due date" ? (
                          <Badge variant="outline" className="text-green-600">
                            Before due date
                          </Badge>
                        ) : comment.status === "after due date" ? (
                          <Badge variant="outline" className="text-red-600">
                            After due date
                          </Badge>
                        ) : (
                          <Badge variant="outline">{comment.status}</Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-800 text-sm">{comment?.text}</p>
                </div>

                <div className="text-xs flex gap-6 text-blue-600 font-medium cursor-pointer">
                  <span
                    onClick={() => {
                      setSendingReply("");
                      setIsReplying({ status: true, id: comment._id });
                    }}
                  >
                    Reply
                  </span>
                  <span onClick={() => fetchReplies(1, false, comment._id)}>
                    {replyCounts[comment._id] > 0
                      ? `Show replies (${replyCounts[comment._id]})`
                      : "No replies"}
                  </span>
                  {user?.role === "teacher" &&
                    comment.createdby.role !== "teacher" &&
                    !comment.isGraded && (
                      <div className="flex items-center gap-2">
                        <span>
                          <DiscussionGradeModel
                            checkIsCommented={checkIsCommented}
                            fetchComments={fetchComments}
                            commentId={comment?._id}
                            discussionId={discussion?._id}
                            discussionMarks={discussion?.totalMarks || 0}
                          />
                        </span>
                      </div>
                    )}

                  {comment.createdby.role !== "teacher" && (
                    <span className="text-xs flex gap-2">
                      {comment.isGraded === false ? (
                        <span className="text-gray-500">Not Graded</span>
                      ) : (
                        <>
                          <p className="text-gray-500">Obtained Marks:</p>
                          <p className="px-2 py-1 rounded-full bg-gray-100">
                            {comment.marksObtained}
                          </p>
                        </>
                      )}
                    </span>
                  )}
                </div>

                {isRepleying.status && isRepleying.id === comment._id && (
                  <div className="flex items-start gap-3 mt-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImg?.url} alt="" />
                      <AvatarFallback>
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        value={sendingReply}
                        onChange={(e) => setSendingReply(e.target.value)}
                        placeholder="Write a reply..."
                      />
                      <Button
                        variant="ghost"
                        className="text-green-600"
                        onClick={() => sendReply(comment._id)}
                        disabled={replyLoading[comment._id]}
                      >
                        {replyLoading[comment._id] ? "..." : <Send size={16} />}
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-500"
                        onClick={() =>
                          setIsReplying({ status: false, id: null })
                        }
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="ml-10 space-y-3 mt-2">
                  {(replies[comment._id] || []).map((reply) => (
                    <div
                      key={reply._id}
                      className="flex items-start gap-3 bg-white px-4 py-2 rounded-lg shadow-sm max-w-[700px]"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={reply?.createdby?.profileImg?.url}
                          alt=""
                        />
                        <AvatarFallback>
                          {reply?.createdby?.firstName?.[0]?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="text-sm flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium text-xs">
                            {reply?.createdby?.firstName}{" "}
                            {reply?.createdby?.lastName}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{reply?.text}</p>
                      </div>
                    </div>
                  ))}

                  {hasMoreReplies[comment._id] && (
                    <p
                      className="text-xs text-blue-600 cursor-pointer"
                      onClick={() => handleLoadReplyMore(comment._id)}
                    >
                      Load more replies
                    </p>
                  )}

                  {replies[comment._id]?.length > 0 && (
                    <p
                      className="text-xs text-gray-600 cursor-pointer"
                      onClick={() => {
                        setReplies((prev) => ({
                          ...prev,
                          [comment._id]: [],
                        }));
                        setHasMoreReplies((prev) => ({
                          ...prev,
                          [comment._id]: false,
                        }));
                      }}
                    >
                      Hide replies
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {hasMore && comments.length > 0 && (
          <p
            onClick={handleLoadMore}
            className="text-xs text-blue-600 text-center mt-4 cursor-pointer"
          >
            Load more comments
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 mt-6 pt-4 border-t">
        <Avatar>
          <AvatarImage src={user?.profileImg?.url} alt="" />
          <AvatarFallback>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        {!canComment ? (
          <div className="flex-1">
            {isCommented ? (
              <p className="text-sm text-gray-600">
                {discussion?.allowResubmission 
                  ? "You have reached the maximum number of comments (2) allowed for this discussion."
                  : "You have already commented on this discussion and resubmission is not allowed."}
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                You cannot comment on this discussion.
              </p>
            )}
          </div>
        ) : (
          <>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={sendingComment}
              onChange={(e) => setSendingComment(e.target.value)}
              placeholder={
                isCommented && discussion?.allowResubmission
                  ? "Update your comment (resubmission allowed)..."
                  : "Write a comment..."
              }
              disabled={sendingLoading}
            />
            <button
              onClick={sendComment}
              className="flex items-center justify-center gap-2 rounded-full bg-green-600 text-white p-2"
              disabled={sendingLoading || !sendingComment.trim()}
            >
              {sendingLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default ChatBox;

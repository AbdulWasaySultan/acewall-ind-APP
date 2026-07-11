import React, { useContext, useEffect, useRef, useState } from "react";
import { ThumbsUp, MessageSquare } from "lucide-react";
import gsap from "gsap";
import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";

const REACTION_TYPES = [
  { label: "Like", value: "like", emoji: "👍", color: "text-blue-500" },
  { label: "Love", value: "love", emoji: "❤️", color: "text-red-500" },
  { label: "Haha", value: "haha", emoji: "😂", color: "text-yellow-500" },
  { label: "Wow", value: "wow", emoji: "😮", color: "text-yellow-500" },
  { label: "Sad", value: "sad", emoji: "😢", color: "text-blue-400" },
];

const PostReactions = ({ post, setPosts, onToggleComments }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const { user } = useContext(GlobalContext);
  const likeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user?._id) return;
      try {
        const res = await axiosInstance.get(`/postlike/isPostLiked/${post._id}`);
        // Ensure we handle null/undefined reaction explicitly
        updateState(res.data.userReaction || null, res.data.totalLikes);
      } catch (error) {
        console.error("Error fetching reaction status:", error);
      }
    };
    fetchStatus();
  }, [post._id, user?._id]);

  const updateState = (reaction, count) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === post._id ? { ...p, userReaction: reaction, likes: count } : p
      )
    );
  };

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowEmojiBar(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setShowEmojiBar(false);
    }, 200);
  };

  const handleReaction = async (type) => {
    if (isLiking || !user?._id) return;
    setIsLiking(true);
    setShowEmojiBar(false);

    // Animation
    gsap.fromTo(
      likeRef.current,
      { scale: 0.8 },
      { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 }
    );

    try {
      const res = await axiosInstance.post(`/postlike/like/${post._id}`, { type });
      // res.data.userReaction will be null if the reaction was removed
      updateState(res.data.userReaction, res.data.totalLikes);
    } catch (error) {
      console.error("Error handling reaction:", error);
    } finally {
      setIsLiking(false);
    }
  };

  // Find current reaction details
  const current = REACTION_TYPES.find((r) => r.value === post.userReaction);

  /**
   * Logic for the main button:
   * 1. If user has reacted (e.g., "love"), click sends "love" to toggle it OFF.
   * 2. If user has NOT reacted, click sends "like" to toggle it ON.
   */
  const handleMainButtonClick = () => {
    const reactionToSent = post.userReaction ? post.userReaction : "like";
    handleReaction(reactionToSent);
  };

  return (
    <div className="flex items-center justify-between mt-3 text-gray-600 border-t pt-2 relative">
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Emoji Bar */}
        {showEmojiBar && (
          <div className="absolute bottom-full left-0 mb-2 flex bg-white shadow-xl border rounded-full p-2 gap-2 animate-in zoom-in slide-in-from-bottom-2 duration-150 z-50">
            {REACTION_TYPES.map((r) => (
              <button
                key={r.value}
                onClick={() => handleReaction(r.value)}
                className="text-2xl hover:scale-150 transition-transform duration-200"
                type="button"
              >
                {r.emoji}
              </button>
            ))}
            {/* Transparent Bridge */}
            <div className="absolute -bottom-2 left-0 w-full h-4 bg-transparent" />
          </div>
        )}

        <button
          onClick={handleMainButtonClick}
          className={`flex items-center gap-2 font-medium p-1 transition-colors rounded-md hover:bg-gray-50 ${
            current ? current.color : ""
          }`}
          type="button"
        >
          <span ref={likeRef}>
            {current ? current.emoji : <ThumbsUp className="w-4 h-4" />}
          </span>
          <span>
            {current ? current.label : "Like"}{" "}
            {post.likes > 0 && `(${post.likes})`}
          </span>
        </button>
      </div>

      <button
        onClick={onToggleComments}
        className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded-md transition-colors"
        type="button"
      >
        <MessageSquare className="w-4 h-4" />
        <span>{post.commentCount || 0} Comments</span>
      </button>
    </div>
  );
};

export default PostReactions;
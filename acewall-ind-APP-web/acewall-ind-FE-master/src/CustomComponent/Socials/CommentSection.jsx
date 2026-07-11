import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Send } from "lucide-react"; // Imported Send icon for a visual submit button

const CommentSection = ({ post, setPosts }) => {
  const [comment, setComment] = useState("");
  const lastCommentRef = useRef(null);
  const inputRef = useRef(null); // Ref for the input field

  // Unique ID for the comments list region
  const commentsListId = `comments-list-${post.id}`;

  const handleAddComment = () => {
    const trimmed = comment.trim();
    if (!trimmed) {
        // Optional: Focus the input again if submission fails
        if (inputRef.current) inputRef.current.focus();
        return;
    }

    // Temporary data structure for demonstration (original logic preserved)
    const newComment = {
      id: Date.now(),
      name: "You",
      text: trimmed,
      time: "Just now",
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );

    setComment("");
    
    // Optional: Focus the input again after successful submission
    if (inputRef.current) inputRef.current.focus();


    // Animate comment count bounce (Assuming an element with this ID exists in the parent PostCard)
    gsap.fromTo(
      `#comment-count-${post.id}`,
      { scale: 1 },
      { scale: 1.25, duration: 0.25, ease: "elastic.out(1,0.5)", yoyo: true, repeat: 1 }
    );

    // Animate new comment appearance
    setTimeout(() => {
      if (lastCommentRef.current) {
        // Scroll the new comment into view
        lastCommentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });

        gsap.fromTo(
          lastCommentRef.current,
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
          }
        );
      }
    }, 50); // slight delay to ensure DOM renders first
  };

  return (
    <div className="mt-3" role="region" aria-label={`Comment section for post by ${post.author?.firstName || 'Unknown User'}`}>
      
      {/* Comments List */}
      {/* Added role="log" and aria-live="polite" to announce new comments */}
      <div 
        className="flex flex-col gap-2 text-sm max-h-64 overflow-y-auto"
        id={commentsListId}
        role="log"
        aria-live="polite"
        tabIndex={0} // Allows the comment list to be focused/scrolled
      >
        {post.comments.map((c, idx) => (
          <div
            key={c.id}
            // Use ref only for the last item
            ref={idx === post.comments.length - 1 ? lastCommentRef : null}
            className="flex items-start gap-2"
          >
            <img
              src={`https://i.pravatar.cc/40?img=${(c.id % 70) + 1}`}
              // Essential: Descriptive alt text for the commenter's avatar
              alt={`${c.name} avatar`}
              className="w-6 h-6 rounded-full"
            />
            <div className="bg-gray-100 px-3 py-1.5 rounded-lg max-w-sm" role="comment">
              <p className="font-semibold text-xs">{c.name}</p>
              <p className="text-sm">{c.text}</p>
              {/* Using <time> for semantic dates */}
              <span className="text-xs text-gray-400">
                  <time dateTime={c.time}>{c.time}</time>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Box (Comment Form) */}
      <div className="mt-3 flex items-center gap-2" role="form" aria-label="Add a new comment">
        <img
          src="https://i.pravatar.cc/40?img=10"
          // Essential: Descriptive alt text for the current user's avatar
          alt="Your profile picture"
          className="w-7 h-7 rounded-full"
        />
        
        {/* Hidden Label for Input */}
        <label htmlFor={`comment-input-${post.id}`} className="sr-only">
            Write a comment
        </label>
        
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          // Use onKeyDown to allow Enter key submission
          onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          type="text"
          placeholder="Write a comment..."
          className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
          id={`comment-input-${post.id}`}
          aria-label="Write a comment"
          ref={inputRef}
        />
        
        {/* Submit Button (Visual) */}
        <button
            onClick={handleAddComment}
            disabled={!comment.trim()}
            className="p-2 rounded-full text-blue-500 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition"
            aria-label="Submit comment"
            // Announce new content added to the comment list
            aria-controls={commentsListId}
        >
            <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
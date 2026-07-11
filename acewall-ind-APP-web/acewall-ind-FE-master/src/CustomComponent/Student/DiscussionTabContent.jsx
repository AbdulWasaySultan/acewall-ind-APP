import React from "react";
import { Link } from "react-router-dom";
// import acewallshort from "../../assets/acewallshort.png"; // Unused import removed for clean code
import { DiscussionCard } from "../Card";
import { Loader } from "lucide-react"; // Import Loader for visual accessibility

const DiscussionTabContent = ({ discussions, loading }) => {
  return (
    <div role="region" aria-label="Discussions List">
      <div className="w-full flex justify-center py-6">
        {/* Loading State: Use role="status" and aria-live="polite" */}
        {loading && (
          <div role="status" aria-live="polite" className="flex items-center gap-2 text-gray-600">
            <Loader className="animate-spin h-5 w-5" aria-hidden="true" />
            <p>Loading discussions...</p>
          </div>
        )}
      </div>

      {/* Empty State: Check if not loading AND no discussions */}
      {!loading && discussions.length === 0 && (
        <div className="text-center py-10" role="status" aria-live="polite">
          <p className="text-lg text-gray-500">No discussions available.</p>
        </div>
      )}

      {/* Discussion List Grid: Use role="list" to group cards semantically */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans"
        role="list"
        aria-label="Available Discussion Rooms"
      >
        {!loading &&
          discussions.map((item) => (
            // DiscussionCard should implicitly act as role="listitem" via its wrapper Link/role="article"
            <DiscussionCard 
              key={item._id} 
              discussion={item} 
              link={`/student/discussions/${item._id}`} 
              // The parent component CourseCard/Link wraps the card and handles keyboard navigation,
              // but we ensure the DiscussionCard props are correct.
            />
          ))}
      </div>
    </div>
  );
};

export default DiscussionTabContent;
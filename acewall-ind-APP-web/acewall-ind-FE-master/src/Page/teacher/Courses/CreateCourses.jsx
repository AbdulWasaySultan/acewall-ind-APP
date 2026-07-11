import React, { useState } from "react";
import CoursesBasis from "./CoursesBasics";
import CoursesChapter from "./CourseChapters";
import TeacherGradebook from "./Gradebook";

// Main App component
const CreateCourse = () => {
  const [activeComponent, setActiveComponent] = useState("one");

  // Function to handle component switching
  const switchComponent = (componentName) => {
    setActiveComponent(componentName);
  };

  // Render the active component based on state
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "one":
        return <CoursesBasis />;
      case "two":
        return <CoursesChapter />;
      case "three":
        return <TeacherGradebook />;
      default:
        return <ComponentOne />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Multi-Component Page</h1>

      {/* Navigation buttons */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeComponent === "one" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => switchComponent("one")}
        >
          Component One
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeComponent === "two" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => switchComponent("two")}
        >
          Component Two
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeComponent === "three"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => switchComponent("three")}
        >
          Component Three
        </button>
      </div>

      {/* Component display area */}
      <div className="border rounded-lg p-4">{renderActiveComponent()}</div>
    </div>
  );
};

export default CreateCourse;

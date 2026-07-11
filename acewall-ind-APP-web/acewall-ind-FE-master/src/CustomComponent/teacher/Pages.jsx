import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Pages = ({ courseId, type, typeId }) => {
  const navigate = useNavigate();

  const handleCreatePage = () => {
    navigate(`/teacher/courses/${courseId}/createPage/${type}/${typeId}`);
  };

  return (
    <Button
      onClick={handleCreatePage}
      className="bg-green-600 text-white hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-500"
      aria-label="Create new page"
    >
      + Create Page
    </Button>
  );
};

export default Pages;
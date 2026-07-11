import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";

export function CreateDiscussionDialog({
  refresh,
  setRefresh,
  semester,
  quarter,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type");
  const typeId = searchParams.get("typeId");
  const courseId = searchParams.get("course");

  const handleCreateDiscussion = () => {
    const params = new URLSearchParams();
    if (courseId) params.append("course", courseId);
    if (type) params.append("type", type);
    if (typeId) params.append("typeId", typeId);
    if (semester) params.append("semester", semester);
    if (quarter) params.append("quarter", quarter);

    navigate(`/teacher/courses/createDiscussion?${params.toString()}`);
  };

  return (
    <Button
      onClick={handleCreateDiscussion}
      className="bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
      aria-label="Create new discussion"
    >
      Create Discussion
    </Button>
  );
}

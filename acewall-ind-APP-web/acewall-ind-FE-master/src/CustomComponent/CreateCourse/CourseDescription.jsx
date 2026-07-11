import { Label } from "@/components/ui/label";
import React from "react";
import AiContentModal from "../teacher/teacher/AiContentModal";
import { Textarea } from "@/components/ui/textarea";

const CourseDescription = ({
  watchedDescription,
  aiResponse,
  setAiResponse,
  setValue,
  errors,
  register,
}) => {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <Label htmlFor="courseDescription">Course Description *</Label>
        <AiContentModal
          command={watchedDescription}
          aiResponse={aiResponse}
          setAiResponse={setAiResponse}
          usedfor="courseDescription"
          setValue={setValue}
        />
      </div>
      <Textarea
        id="courseDescription"
        aria-required="true"
        className={`bg-gray-50 min-h-[100px] ${
          errors.courseDescription ? "border-red-500" : ""
        }`}
        maxLength={4000}
        {...register("courseDescription")}
      />
      <div className="m-3"></div>

      {errors.courseDescription && (
        <p className="text-xs text-red-600" role="alert">
          {errors.courseDescription.message}
        </p>
      )}
    </div>
  );
};

export default CourseDescription;

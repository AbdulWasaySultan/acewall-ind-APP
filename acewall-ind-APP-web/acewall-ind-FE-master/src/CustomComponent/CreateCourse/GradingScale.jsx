import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

const GradingScaleCard = ({
  scaleFields,
  updateScale,
  isEditingScale,
  setIsEditingScale,
}) => {
  const minInputRef = useRef(null);

  // Autofocus when editing starts
  useEffect(() => {
    if (isEditingScale !== null && minInputRef.current) {
      minInputRef.current.focus();
    }
  }, [isEditingScale]);

  // Validation function
  const validateGradeRange = (grade) => {
    return grade.min < grade.max;
  };

  return (
    <Card className="mb-6 border-red-800">
      <CardContent className="p-0">
        <div className="grid grid-cols-3 bg-gray-50 p-4 border-b border-gray-200 font-medium text-gray-600">
          <div>Letter Grade</div>
          <div>Percentage Range</div>
          <div></div>
        </div>

        {scaleFields.map((grade) => (
          <div
            key={grade.id}
            className="grid grid-cols-3 p-4 border-b border-gray-200 gap-4 items-center"
          >
            {/* Letter Grade */}
            <div className="text-gray-700 font-medium">{grade.letter}</div>

            {/* Percentage Range */}
            <div className="text-gray-700">
              {grade.min}% - {grade.max}%
            </div>

            {/* Empty placeholder for layout */}
            <div></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default GradingScaleCard;

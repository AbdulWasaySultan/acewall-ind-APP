import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteModal } from "@/CustomComponent/CreateCourse/DeleteModal";
import { AssessmentDialog } from "../Models/AssessmentFields";

export function AssessmentCard({ assessments, title, badgeColor, onDelete }) {
  if (!assessments || assessments.length === 0) return null;

  console.log(assessments, "assessments");

  return (
    <Card className="mt-4 bg-green-400">
      <CardHeader className="py-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Badge variant="outline" className={badgeColor}>
            {title}
          </Badge>
          <span className="text-sm text-gray-500">({assessments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 space-y-4">
        {assessments.map((assessment) => (
          <div
            key={assessment._id}
            className="border-l-4 border-blue-400 pl-4 py-2 bg-gray-50 rounded-r-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  {assessment.category.name}
                </Badge>
                <h4 className="font-medium text-gray-800">
                  {assessment.title}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <AssessmentDialog assessment={assessment} />
                <DeleteModal
                  what="Assessment"
                  deleteFunc={() => onDelete(assessment._id)}
                />
              </div>
            </div>
            {assessment.description && (
              <p className="text-sm text-gray-600">{assessment.description}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

import { BookOpen, Trash2, FileText } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function FinalCourseAssessmentCard({ assessment, handleDeleteAssessment }) {
  if (!assessment) return null;

  return (
    <Card className="mt-6">
      <CardHeader className="py-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50">
            Final {assessment?.category?.name || "Final Assessment"}
          </Badge>
        </CardTitle>

      </CardHeader>

      <CardContent className="py-2">
        <div className="pl-4 border-l-2 border-green-400">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">{assessment.title}</p>

            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-gray-500 hover:text-blue-600"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{assessment.title}</DialogTitle>
                  </DialogHeader>

                  <div className="mt-2 space-y-4">
                    {assessment.files?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">Files</h4>
                        <div className="flex flex-wrap gap-2">
                          {assessment.files.map((file, i) => (
                            <a
                              key={file._id}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <FileText className="h-4 w-4" />
                              {file.filename || `PDF ${i + 1}`}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}


                    {assessment.questions?.length > 0 && (
                      <Accordion type="multiple" className="w-full">
                        {["mcq", "qa", "truefalse"].map((type) => {
                          const group = assessment.questions.filter((q) => q.type === type);
                          if (group.length === 0) return null;

                          return (
                            <AccordionItem key={type} value={type}>
                              <AccordionTrigger className="text-left text-sm font-medium text-gray-700">
                                {type.toUpperCase()} ({group.length})
                              </AccordionTrigger>
                              <AccordionContent className="space-y-4">
                                {group.map((q, idx) => (
                                  <div
                                    key={q._id}
                                    className="border border-gray-200 rounded-lg p-4"
                                  >
                                    <p
                                      className="text-sm font-medium text-gray-800 mb-2"
                                      dangerouslySetInnerHTML={{
                                        __html: `<strong>Q${idx + 1}:</strong> ${q.question}`,
                                      }}
                                    />
                                    {type === "mcq" && (
                                      <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                                        {q.options?.map((opt, i) => (
                                          <li
                                            key={i}
                                            className={
                                              q.correctAnswer === (i + 1).toString()
                                                ? "font-semibold text-green-700"
                                                : ""
                                            }
                                          >
                                            {opt}
                                            {q.correctAnswer === (i + 1).toString() &&
                                              " (Correct)"}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                    {type === "qa" && (
                                      <div className="text-sm text-gray-700">
                                        <span className="font-semibold">Answer:</span>{" "}
                                        {q.correctAnswer}
                                      </div>
                                    )}
                                    {type === "truefalse" && (
                                      <div className="text-sm text-gray-700">
                                        <span className="font-semibold">Answer:</span>{" "}
                                        {q.correctAnswer === "true" ? "True" : "False"}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-gray-500 hover:text-red-600"
                onClick={() => handleDeleteAssessment(assessment._id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>

            </div>
          </div>

          {assessment.description && (
            <p className="text-xs text-gray-600 mt-1">{assessment.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

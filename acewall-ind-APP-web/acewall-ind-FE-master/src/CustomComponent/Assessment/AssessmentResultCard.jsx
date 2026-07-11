import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BackButton from "../BackButton";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/lib/AxiosInstance";

// Note: Ensure the parent component passes the ARRAY of submissions now
const AssessmentResultCard = ({ submissions = [], isAllowResubmission }) => {
  console.log(submissions, "submissions passed to result card");

  const navigate = useNavigate();
  // Latest submission first: sort by date descending or assume array order
  // We initialize to index 0 (the latest)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Get the currently selected submission based on index
  const currentSubmission = submissions[currentIndex];

  console.log(currentSubmission, "current submission in the result card");
  const totalSubmissions = submissions.length;

  const handleNext = () => {
    if (currentIndex < totalSubmissions - 1)
      setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!currentSubmission)
    return <div className="p-10 text-center">No submissions found.</div>;

  return (
    <div className="pb-10">
      <BackButton className="mb-6" />

      {/* Navigation Header for Multiple Submissions */}
      {totalSubmissions > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Viewing Attempt
            </span>
            <span className="text-xl font-bold">
              {totalSubmissions - currentIndex} of {totalSubmissions}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Newer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === totalSubmissions - 1}
              className="flex items-center"
            >
              Older <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto">
        <Card className="w-full border-t-4 border-t-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">Submission Results</CardTitle>
                <CardDescription>
                  Submitted on: {formatDate(currentSubmission?.createdAt)}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex space-x-2">
                  <Badge
                    variant={
                      currentSubmission?.status === "before due date"
                        ? "success"
                        : "destructive"
                    }
                  >
                    {currentSubmission?.status}
                  </Badge>
                  <Badge
                    variant={
                      currentSubmission?.graded ? "outline" : "secondary"
                    }
                  >
                    {currentSubmission?.graded ? "Graded" : "Needs Grading"}
                  </Badge>
                </div>
                {currentIndex === 0 && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    Latest Submission
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-slate-700">
                Assessment Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md border">
                <div>
                  <p className="text-sm text-muted-foreground">Assessment ID</p>
                  <p className="font-mono text-sm">
                    {currentSubmission?.assessment}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Score Achieved
                  </p>
                  <p className="font-bold text-lg text-blue-600">
                    {currentSubmission?.totalScore} points
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Late submission panalty
                  </p>
                  <p className="font-bold text-lg text-red-600">
                    {currentSubmission?.latePenaltyApplied} points
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 bg-slate-100 p-1">
                <TabsTrigger value="all">
                  All ({currentSubmission?.answers?.length})
                </TabsTrigger>
                <TabsTrigger value="manual">
                  Needs Grading (
                  {
                    currentSubmission?.answers?.filter(
                      (a) => a.requiresManualCheck,
                    ).length
                  }
                  )
                </TabsTrigger>
                <TabsTrigger value="auto">
                  Graded (
                  {
                    currentSubmission?.answers?.filter(
                      (a) => !a.requiresManualCheck,
                    ).length
                  }
                  )
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {currentSubmission?.answers?.map((answer, index) => (
                  <QuestionCard
                    key={answer._id || index}
                    answer={answer}
                    index={index}
                  />
                ))}
              </TabsContent>
              {/* Add TabsContent for manual/auto as needed, similar to "all" */}
            </Tabs>
          </CardContent>

          {isAllowResubmission && (
            <div className="flex justify-between items-center p-6 bg-slate-50 border-t">
              <p className="text-sm text-muted-foreground">
                End of submission review.
              </p>
              <Button
                className="bg-yellow-500 text-white hover:bg-yellow-600"
                onClick={() =>
                  navigate(
                    `/student/assessment/Resubmission/${currentSubmission.assessment}`,
                  )
                }
              >
                Start New Attempt
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Internal QuestionCard component stays largely the same, ensuring it uses currentSubmission data
const QuestionCard = ({ answer, index }) => {
  const questionType = answer?.question?.type || "unknown";
  const maxPoints = answer?.question?.points || 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div
          className={`w-2 ${answer?.isCorrect ? "bg-green-500" : "bg-red-500"} ${answer?.requiresManualCheck && "bg-amber-500"}`}
        />
        <div className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">
                  Question {index + 1}
                </CardTitle>
                <CardDescription className="capitalize">
                  {questionType.replace("_", " ")}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {answer?.requiresManualCheck ? (
                  <Badge
                    variant="warning"
                    className="bg-amber-100 text-amber-800"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                ) : answer?.isCorrect ? (
                  <Badge
                    variant="success"
                    className="bg-green-100 text-green-800"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Correct
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="bg-red-100 text-red-800"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Incorrect
                  </Badge>
                )}
                <Badge variant="outline">{`${answer?.pointsAwarded || 0}/${maxPoints}`}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="text-sm prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: answer?.question?.question || "",
              }}
            />
            <div className="bg-slate-50 p-3 rounded border text-sm">
              <span className="font-semibold block mb-1">Your Answer:</span>
              {questionType === "file" ? (
                answer?.file?.map((f, i) => (
                  <a
                    key={i}
                    href={f.url}
                    target="_blank"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    {f.filename}
                  </a>
                ))
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: answer?.selectedAnswer || "No answer provided",
                  }}
                />
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default AssessmentResultCard;

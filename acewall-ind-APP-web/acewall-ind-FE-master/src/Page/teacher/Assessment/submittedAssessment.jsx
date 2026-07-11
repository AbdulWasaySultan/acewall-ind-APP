"use client";

import { use, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  FileText,
} from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useParams } from "react-router-dom";
import avatar from "@/assets/avatar.png";
import { toast } from "sonner";
import BackButton from "@/CustomComponent/BackButton";

const AssessmentReview = () => {
  const { id } = useParams();
  const [manualGrades, setManualGrades] = useState({});
  const [submission, setSubmission] = useState(null);
  const [totalScore, setTotalScore] = useState(
    submission?.answers?.reduce(
      (total, answer) => total + (answer.pointsAwarded || 0),
      0,
    ),
  );
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  console.log(manualGrades, "manualGrades");

  useEffect(() => {
    const fetchSubmission = async () => {
      await axiosInstance
        .get(`/assessmentSubmission/submission/${id}`)
        .then((response) => {
          console.log(response.data);
          setSubmission(response.data.submission);
        })
        .catch((error) => {
          console.error("Error fetching submission:", error);
        });
    };
    fetchSubmission();
  }, [loading]);

  const handleGradeChange = (questionId, points, maxPoints) => {
    const newGrades = {
      ...manualGrades,
      [questionId]: {
        awardedPoints: Number(points),
        maxPoints: Number(maxPoints),
      },
    };
    setManualGrades(newGrades);

    const newTotal = submission.answers.reduce((total, answer) => {
      if (answer.requiresManualCheck) {
        return total + (newGrades[answer.questionId]?.awardedPoints || 0);
      }
      return total + (answer.pointsAwarded || 0);
    }, 0);

    setTotalScore(newTotal);
  };

  const handleSubmitGrades = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/assessmentSubmission/teacherGrading/${id}`,
        manualGrades,
      );
      console.log(response.data);

      // Optional: Notify teacher grading and email status
      toast.success("Grades submitted and student notified via email.");

      // Optional: reset UI state
      setManualGrades({});
      setError({});
      setSubmission(response.data.submission); // refresh submission with graded=true
    } catch (error) {
      console.error("Error submitting grades:", error);
      toast.error("Failed to submit grades.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <BackButton />
      <Card className="w-full">
        {/* Header */}
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Student Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                <AvatarImage
                  src={submission?.studentId?.profileImg?.url || avatar}
                  alt={`${submission?.studentId?.firstName} ${submission?.studentId?.lastName}`}
                  className="object-cover"
                />
                <AvatarFallback>
                  {submission?.studentId?.firstName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="text-lg font-semibold text-gray-800 flex gap-1">
                  <span>{submission?.studentId?.firstName}</span>
                  <span>{submission?.studentId?.lastName}</span>
                </div>
                <CardDescription>
                  {submission?.studentId?.email}
                </CardDescription>
              </div>
            </div>

            {/* Status & Date */}
            <div className="text-right space-y-1">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <Badge
                  variant={
                    submission?.status === "before due date"
                      ? "success"
                      : "destructive"
                  }
                >
                  {submission?.status}
                </Badge>
                <Badge variant={submission?.graded ? "outline" : "secondary"}>
                  {submission?.graded ? "Graded" : "Needs Grading"}
                </Badge>

                {submission?.resubmitted?.status && (
                  <Badge className="bg-yellow-300" variant="secondary">
                    Resubmitted
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm">
                Submitted on: {formatDate(submission?.createdAt)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="pt-6 space-y-6">
          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Assessment Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md">
              <div>
                <p className="text-sm text-muted-foreground">Assessment ID</p>
                <p className="font-medium">{submission?.assessment}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="font-medium">{submission?.totalScore} points</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="flex-wrap justify-start gap-2 mb-4">
              <TabsTrigger value="all">
                All Questions ({submission?.answers?.length})
              </TabsTrigger>
              <TabsTrigger value="manual">
                Needs Grading (
                {
                  submission?.answers?.filter((a) => a.requiresManualCheck)
                    .length
                }
                )
              </TabsTrigger>
              <TabsTrigger value="auto">
                Graded (
                {
                  submission?.answers?.filter((a) => !a.requiresManualCheck)
                    .length
                }
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-6">
                {submission?.answers?.map((answer, index) => (
                  <QuestionCard
                    key={answer._id || index}
                    answer={answer}
                    index={index}
                    manualGrades={manualGrades}
                    onGradeChange={handleGradeChange}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="manual">
              <div className="space-y-6">
                {submission?.answers
                  ?.filter((a) => a.requiresManualCheck)
                  .map((answer, index) => (
                    <QuestionCard
                      key={answer._id || index}
                      answer={answer}
                      index={index}
                      manualGrades={manualGrades}
                      onGradeChange={handleGradeChange}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="auto">
              <div className="space-y-6">
                {submission?.answers
                  ?.filter((a) => !a.requiresManualCheck)
                  .map((answer, index) => (
                    <QuestionCard
                      key={answer._id || index}
                      answer={answer}
                      index={index}
                      manualGrades={manualGrades}
                      onGradeChange={handleGradeChange}
                      setError={setError}
                      error={error}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col sm:flex-row justify-end items-center gap-4 border-t p-6">
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={handleSubmitGrades}
            disabled={
              submission?.answers?.filter((a) => a.requiresManualCheck)
                .length === 0
            }
          >
            {loading ? <Loader className="animate-spin" /> : "Submit Grades"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const QuestionCard = ({
  answer,
  index,
  manualGrades,
  onGradeChange,
  setError = () => {},
  error = {},
}) => {
  const questionType = answer?.questionDetails?.type || "unknown";
  const maxPoints = answer?.questionDetails?.points || 0;

  const handleError = (questionId, message) => {
    setError((prevErrors) => {
      if (!message) {
        const { [questionId]: _, ...rest } = prevErrors;
        return rest;
      }
      return {
        ...prevErrors,
        [questionId]: message,
      };
    });
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-gray-800">
              Question {index + 1}
            </CardTitle>
            <CardDescription className="capitalize text-sm text-gray-500">
              {questionType === "mcq"
                ? "Multiple Choice"
                : questionType === "truefalse"
                  ? "True/False"
                  : questionType === "qa"
                    ? "Question & Answer"
                    : questionType === "file"
                      ? "File"
                      : "Unknown"}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            {answer?.requiresManualCheck ? (
              <Badge
                variant="warning"
                className="bg-yellow-100 text-yellow-800"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                Needs Manual Grading
              </Badge>
            ) : answer?.isCorrect ? (
              <Badge variant="success" className="bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Correct
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-red-100 text-red-800">
                <XCircle className="w-4 h-4 mr-1" />
                Incorrect
              </Badge>
            )}
            <Badge variant="outline" className="text-sm">
              {`${answer?.pointsAwarded || 0}/${maxPoints} pts`}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        {answer.questionDetails?.type !== "file" ? (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">
              Question:
            </h4>
            <div
              className="p-3 rounded-md bg-gray-50 border text-sm text-gray-800"
              dangerouslySetInnerHTML={{
                __html:
                  answer?.questionDetails?.question || "<i>No question</i>",
              }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 mb-1">
              Instruction:
            </h4>
            <div
              className="p-3 rounded-md bg-gray-50 border text-sm text-gray-800"
              dangerouslySetInnerHTML={{
                __html:
                  answer?.questionDetails?.question || "<i>No instruction</i>",
              }}
            />

            <section>
              <h4 className="font-medium text-sm text-gray-700 mb-1">Files:</h4>
              <div className="p-3 rounded-md bg-gray-50 border text-sm text-gray-800 flex items-center space-x-2">
                {answer?.questionDetails?.file?.map((file, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {file.filename}
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Answer */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">
            Student's Answer:
          </h4>
          <div className="p-3 rounded-md bg-gray-50 border text-sm text-gray-800">
            {questionType === "truefalse" ? (
              <span className="font-semibold">
                {answer?.selectedAnswer === "true" ? "True" : "False"}
              </span>
            ) : questionType === "mcq" ? (
              <span className="font-semibold">
                Option: {answer?.selectedAnswer}
              </span>
            ) : questionType === "file" ? (
              <div className="flex items-center space-x-2">
                {answer?.file?.map((file, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900"
                    >
                      {file.filename}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: answer?.selectedAnswer || "<i>No answer provided</i>",
                }}
              />
            )}
          </div>
        </div>

        {/* Manual Grading */}
        {answer.requiresManualCheck && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">
              Assign Points:
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                type="number"
                min="0"
                max={maxPoints}
                value={manualGrades[answer?.questionId]?.awardedPoints || ""}
                onChange={(e) => {
                  const value = Number(e.target.value);

                  if (value > maxPoints) {
                    handleError(
                      answer?.questionId,
                      `Points cannot exceed ${maxPoints}`,
                    );
                    return;
                  } else if (value < 0) {
                    handleError(
                      answer?.questionId,
                      `Points cannot be negative`,
                    );
                    return;
                  } else {
                    handleError(answer?.questionId, null); // Clear error
                  }

                  onGradeChange(answer?.questionId, value, maxPoints);
                }}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                / {maxPoints} pts
              </span>

              {error?.[answer?.questionId] && (
                <p className="text-sm text-red-600">
                  {error[answer?.questionId]}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssessmentReview;

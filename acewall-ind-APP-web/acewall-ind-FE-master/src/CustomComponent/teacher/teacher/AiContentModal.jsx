"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, X, Loader2, Check, RotateCcw, Pencil } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { base64ToFile } from "@/utils/base64ToFile";
import { toast } from "sonner";

export default function AiContentModal({
  command,
  aiResponse,
  setAiResponse,
  usedfor,
  setValue,
  appendTeachingPoint,
  removeTeachingPoint,
  appendRequirement,
  removeRequirement,
  handleEditorChange,
  questionType,
  prevPoints,
  handleThumbnailChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [QuestionDifficulty, setQuestionDifficulty] = useState("medium");
  const [generatedImage, setGeneratedImage] = useState(null);

  const renderGeneratedContent = (content) => {
    if (!content) return null;

    // 1. Handle Thumbnail Image 🖼️
    if (usedfor === "thumbnail") {
      // If it's a File object (from AI), create a local URL.
      // If it's already a string (preview), use it.
      const imageUrl =
        content instanceof File ? URL.createObjectURL(content) : content;

      return (
        <div className="flex justify-center p-2">
          <img
            src={imageUrl}
            alt="AI Generated"
            className="max-h-60 rounded-md border border-gray-300 shadow-sm"
            onLoad={() => {
              // Clean up memory if we created an object URL
              if (content instanceof File) URL.revokeObjectURL(imageUrl);
            }}
          />
        </div>
      );
    }

    // 2. Handle Text Content 📝
    const lines =
      typeof content === "string"
        ? content
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
        : [];

    if (lines.length === 0) return null;

    const isBulletList = lines.every(
      (line) =>
        line.startsWith("-") || line.startsWith("•") || line.startsWith("*")
    );

    if (isBulletList) {
      return (
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          {lines.map((line, index) => (
            <li key={index}>{line.replace(/^[-•*]\s*/, "")}</li>
          ))}
        </ul>
      );
    }

    return (
      <div className="space-y-3">
        {lines.map((line, index) => (
          <p key={index} className="text-sm text-gray-700 leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    const splitedUsedfor = usedfor.split(".");

    let finalUsedfor =
      splitedUsedfor[0] === "questions" ? `question-${questionType}` : usedfor;

    try {
      if (usedfor === "thumbnail") {
        const response = await axiosInstance.post("aichat/generateImage", {
          prompt,
          aspectRatio: "3:2",
        });

        const file = base64ToFile(
          response.data.imageBase64,
          response.data.mimeType,
          "ai-generated-image.png"
        );

        setGeneratedImage(file);
        setShowResult(true);
      } else {
        const response = await axiosInstance.post(
          "aichat/generateContentForTeacher",
          {
            command: prompt,
            usedfor: finalUsedfor,
            difficulty: QuestionDifficulty,
          }
        );

        setGeneratedContent(response.data.content);
        setShowResult(true);
      }
    } catch (error) {
      console.error("AI generation failed", error);
      toast.error(
        error?.response?.data?.message || "Generation failed. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const parsePointsFromAI = (content) => {
    if (!content) return [];

    const newPoints = content
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.startsWith("-") || line.startsWith("•") || line.startsWith("*")
      )
      .map((line) => line.replace(/^[-•*]\s*/, ""))
      .filter(Boolean)
      .slice(0, 8); // optional limit

    const existingPoints = prevPoints.filter((p) => p.value !== "");
    const updatedexistingPoints = existingPoints.map((p) => p.value);

    return [...updatedexistingPoints, ...newPoints];
  };

  const parseMCQFromAI = (content) => {
    if (!content) return null;

    const lines = content
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const question = lines[0];

    const options = lines
      .filter((line) => /^[A-D]\./.test(line))
      .map((line) => line.replace(/^[A-D]\.\s*/, ""));

    const answerLine = lines.find((line) =>
      line.toLowerCase().startsWith("answer:")
    );

    const correctAnswer = answerLine
      ? answerLine.replace(/answer:\s*/i, "").trim()
      : null;

    return {
      question,
      options,
      correctAnswer,
    };
  };

  const parseTrueFalseFromAI = (content) => {
    if (!content) return null;

    const lines = content
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // First line is the question
    const question = lines[0];

    // Find the correct answer (True or False)
    const correctAnswer = lines.find((line) => /^true$|^false$/i.test(line));

    return {
      question,
      correctAnswer: correctAnswer
        ? correctAnswer.charAt(0).toUpperCase() +
        correctAnswer.slice(1).toLowerCase()
        : null,
    };
  };

  const insertPointsFromAI = (content) => {
    const points = parsePointsFromAI(content);

    if (!points.length) return;
    if (usedfor === "teachingPoints") {
      removeTeachingPoint();
    } else if (usedfor === "requirements") {
      removeRequirement();
    }

    // Append new ones
    points.forEach((point) => {
      if (usedfor === "teachingPoints") {
        appendTeachingPoint({ value: point });
      } else if (usedfor === "requirements") {
        appendRequirement({ value: point });
      }
    });
  };

  const handleAccept = () => {
    const splitedUsedfor = usedfor.split(".");

    if (usedfor === "teachingPoints" || usedfor === "requirements") {
      insertPointsFromAI(generatedContent);
    } else if (usedfor === "lessonDescription") {
      handleEditorChange(generatedContent);
    } else if (usedfor === "thumbnail") {
      const mockEvent = {
        target: {
          files: [generatedImage],
        },
      };
      handleThumbnailChange(mockEvent);
    } else if (questionType === "mcq") {
      const parsedMCQ = parseMCQFromAI(generatedContent);
      setValue(usedfor, parsedMCQ.question);
      setValue(`questions.${splitedUsedfor[1]}.options`, parsedMCQ.options);
      setValue(
        `questions.${splitedUsedfor[1]}.correctAnswer`,
        parsedMCQ.correctAnswer
      );
    } else if (questionType === "truefalse") {
      const parsedTF = parseTrueFalseFromAI(generatedContent);
      setValue(usedfor, parsedTF.question);
      setValue(
        `questions.${splitedUsedfor[1]}.correctAnswer`,
        parsedTF.correctAnswer.toLowerCase()
      );
    } else {
      setValue(usedfor, generatedContent);
    }

    setIsOpen(false);
    resetState();
  };

  const handleReject = () => {
    setShowResult(false);
    setGeneratedContent("");
  };

  const resetState = () => {
    setPrompt("");
    setGeneratedContent("");
    setShowResult(false);
    setIsGenerating(false);
  };

  const handleClose = (open) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  };

  const difficultyStyles = {
    easy: {
      border: "border-gray-200",
      bg: "bg-green-400",
    },
    medium: {
      border: "border-gray-200",
      bg: "bg-orange-400",
    },
    hard: {
      border: "border-gray-200",
      bg: "bg-red-400",
    },
  };

  return (
    <>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(true)}
        className="text-sm text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1 cursor-pointer select-none"
      >
        <Sparkles className="w-4 h-4" />
      </div>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-800">AI Assistant</span>
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="py-4">
            {!showResult ? (
              <div className="text-center space-y-6">
                {!isGenerating && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Start writing to make the magic happen.
                    </h3>
                    <p className="text-sm text-gray-500">
                      Suggestions will appear here.
                    </p>
                    {(questionType === "mcq" ||
                      questionType === "truefalse" ||
                      questionType === "qa") && (
                        <div className="flex justify-center gap-4 text-sm text-gray-500">
                          {["easy", "medium", "hard"].map((difficulty, id) => {
                            const styles = difficultyStyles[difficulty];

                            return (
                              <div
                                key={id}
                                onClick={() => setQuestionDifficulty(difficulty)}
                                className={`px-2 rounded-lg cursor-pointer border ${styles.border
                                  } ${QuestionDifficulty === difficulty
                                    ? `${styles.bg} text-white font-medium`
                                    : ""
                                  }`}
                              >
                                {difficulty}
                              </div>
                            );
                          })}
                        </div>
                      )}

                    <Input
                      placeholder="Describe what you want to create..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    />

                    <Button
                      onClick={handleGenerate}
                      disabled={!prompt.trim()}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </>
                )}

                {isGenerating && (
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-emerald-500" />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Generated Content */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[250px] overflow-y-auto">
                  {usedfor === "thumbnail" && generatedImage
                    ? renderGeneratedContent(generatedImage)
                    : renderGeneratedContent(generatedContent)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleReject}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={handleAccept}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Go with it
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
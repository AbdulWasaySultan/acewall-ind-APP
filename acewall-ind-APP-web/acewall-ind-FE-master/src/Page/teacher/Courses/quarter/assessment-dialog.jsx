"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Loader,
  Bell,
  Settings, // Added for the immediate reminder icon
} from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import EditAssessmentDialog from "@/CustomComponent/CreateCourse/EditAssessment";
import AssessmentReminderDialog from "./ReminderDialog";

function QuestionDisplay({ question, index }) {
  return (
    <article
      className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4"
      aria-label={`Question ${index + 1}`}
    >
      {question.type === "file" ? (
        <section>
          <div className="font-medium text-gray-800 mb-3 flex gap-2 flex-col">
            <h5 className="text-xl font-bold">Instruction:</h5>
            <p className="text-lg">{question?.question}</p>
          </div>
          {question?.files && question.files.length > 0 ? (
            <div className="text-sm text-gray-700 bg-green-50 p-3 rounded border border-green-100">
              <h6 className="sr-only">Attached Files:</h6>
              <ul className="space-y-2">
                {question.files.map((file, i) => (
                  <li key={i}>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={file.url}
                      className="flex items-center text-blue-700 hover:underline focus:ring-2 focus:ring-blue-500 rounded outline-none"
                      aria-label={`Download ${file.filename} (opens in new tab)`}
                    >
                      <FileText
                        size={20}
                        className="text-blue-500 mr-2"
                        aria-hidden="true"
                      />
                      <span>{file.filename}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No files attached</p>
          )}
        </section>
      ) : (
        <div className="flex gap-2 flex-col">
          <h5 className="text-xl font-bold">Question:</h5>
          <div
            className="text-lg font-medium text-gray-800 mb-3"
            dangerouslySetInnerHTML={{
              __html: `${question.question}`,
            }}
          />
        </div>
      )}

      {/* Logic for MCQ, QA, True/False remains same... */}
      {question.type === "mcq" && (
        <ul
          className="list-none ml-0 text-sm text-gray-700 space-y-2"
          role="list"
        >
          {question.options?.map((opt, i) => {
            const isCorrect = question.correctAnswer === opt.toString();
            return (
              <li
                key={i}
                className={`p-2 rounded border ${
                  isCorrect
                    ? "font-semibold text-green-800 bg-green-100 border-green-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <span className="mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
                {isCorrect && (
                  <Badge className="ml-2 bg-green-600 text-white">
                    Correct Answer
                  </Badge>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {(question.type === "qa" || question.type === "truefalse") && (
        <div className="text-sm text-gray-800 bg-green-100 p-3 rounded border border-green-200 mt-2">
          <span className="font-bold text-green-900">Correct Answer:</span>{" "}
          <span className="capitalize">
            {question.type === "truefalse"
              ? question.correctAnswer === "true"
                ? "True"
                : "False"
              : question.correctAnswer}
          </span>
        </div>
      )}
    </article>
  );
}

export function AssessmentPage() {
  const { assessmentid } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ States for the "Instant Reminder" push button
  const [loadingReminder, setLoadingReminder] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // ✅ Logic for sending an immediate reminder email
  const handleInstantReminder = async () => {
    if (!assessment?._id) return;
    try {
      setLoadingReminder(true);
      const res = await axiosInstance.post(
        `/assessment/${assessment._id}/send-reminder`,
      );
      setStatusMessage({
        type: "success",
        text: res.data.message || "Reminders sent!",
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to send.",
      });
    } finally {
      setLoadingReminder(false);
    }
  };

  const fetchAssessment = async () => {
    try {
      const res = await axiosInstance.get(`assessment/v2/${assessmentid}`);
      setAssessment(res.data.assessment);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [assessmentid]);

  const questionsByType =
    assessment?.questions?.reduce((groups, question) => {
      const type = question.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(question);
      return groups;
    }, {}) || {};

  if (loading)
    return (
      <Loader className="animate-spin h-10 w-10 text-green-600 mx-auto mt-20" />
    );
  if (!assessment)
    return (
      <main className="p-10 text-center text-gray-500">
        Assessment not found.
      </main>
    );

  return (
    <main className="max-w-5xl mx-auto p-6">
      {/* Toast feedback for reminder status */}
      {statusMessage && (
        <div
          className={`fixed top-5 right-5 p-4 rounded-lg shadow-xl z-50 border ${
            statusMessage.type === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <nav>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
      </nav>

      <header className="mb-6 border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <section>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-900">
              {assessment?.title}
            </h1>
            <Badge variant="secondary">{assessment?.category?.name}</Badge>
          </div>
          <time className="text-sm text-gray-500 mt-2 block">
            <strong>Due Date:</strong>{" "}
            {new Date(assessment?.dueDate?.date).toLocaleDateString(undefined, {
              dateStyle: "full",
            })}
          </time>
        </section>

        {/* ✅ Integrated Action Section */}
        <section className="flex items-center gap-3">
          <EditAssessmentDialog
            assessment={assessment}
            fetchAssessment={fetchAssessment}
          />

          {/* 1. The Instant Push Button */}
          <Button
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
            disabled={loadingReminder}
            onClick={handleInstantReminder}
          >
            {loadingReminder ? (
              <Loader className="animate-spin h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4 mr-2" />
            )}
            Remind Now
          </Button>

          {/* 2. The Scheduled Reminder Dialog (Your Component) */}
          <AssessmentReminderDialog assessmentId={assessment?._id} />

          <Button
            className={
              "bg-blue-600 text-blue-50 hover:bg-blue-500 border-blue-500"
            }
            onClick={() => navigate(`/teacher/courses/assessment/${assessment._id}/setting`)}
          >
            <Settings />
            Setting
          </Button>
        </section>
      </header>

      {/* Description and Questions Sections continue below... */}
      {assessment?.description && (
        <section className="bg-blue-50 p-5 rounded-lg mb-8 border-l-4 border-blue-500">
          <h2 className="font-bold text-blue-900 mb-1">Instructions</h2>
          <p className="text-blue-800 leading-relaxed">
            {assessment.description}
          </p>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
          Questions Breakdown
        </h2>
        <Accordion type="multiple" className="w-full space-y-3">
          {["mcq", "qa", "truefalse", "file"].map((type) => {
            const group = questionsByType[type];
            if (!group || group.length === 0) return null;
            return (
              <AccordionItem
                key={type}
                value={type}
                className="border rounded-lg bg-white shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="px-4 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-700 text-white uppercase text-[10px]">
                      {type}
                    </Badge>
                    <span className="text-sm font-semibold">
                      {group.length} items
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  {group.map((q, idx) => (
                    <QuestionDisplay
                      key={q._id || idx}
                      question={q}
                      index={idx}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>
    </main>
  );
}

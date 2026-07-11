"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Youtube, Link2, ChevronDown, ChevronUp } from "lucide-react"
import { Link } from "react-router-dom"
import EditLessonModal from "@/CustomComponent/CreateCourse/EditLesson"
import { AssessmentCard } from "./assessment-card"
import { DeleteModal } from "@/CustomComponent/CreateCourse/DeleteModal"

export function LessonCard({
  lesson,
  lessonIndex,
  courseId,
  quarterStartDate,
  quarterEndDate,
  semesterId,
  quarterId,
  onDelete,
  onDeleteAssessment,
  fetchQuarterDetail,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const lessonId = `lesson-content-${lesson._id}`;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm border-l-4 border-l-blue-400">
      <div
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors focus-within:ring-2 focus-within:ring-blue-500 outline-none"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={lessonId}
        aria-label={`Lesson ${lessonIndex + 1}: ${lesson.title}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
      >
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800" aria-hidden="true">
            Lesson {lessonIndex + 1}
          </Badge>
          <h4 className="font-semibold text-gray-800">{lesson.title}</h4>
        </div>
        
        {/* Action Buttons - stopPropagation prevents triggering the expansion toggle */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <DeleteModal 
            what="Lesson" 
            deleteFunc={() => onDelete(lesson._id)} 
            aria-label={`Delete lesson ${lesson.title}`}
          />
          <EditLessonModal 
            lesson={lesson} 
            fetchQuarterDetail={fetchQuarterDetail} 
          />
          <Link
            to={`/teacher/assessments/create/lesson/${lesson._id}/${courseId}/${quarterStartDate}/${quarterEndDate}?semester=${semesterId}&quarter=${quarterId}`}
            aria-label={`Add assessment to Lesson ${lessonIndex + 1}`}
          >
            <Button variant="outline" size="sm" className="text-green-600 bg-transparent hover:bg-green-50">
              <span aria-hidden="true">+</span> Add Assessment
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            aria-hidden="true"
            tabIndex={-1} // Icon button is redundant for keyboard users since the whole header is a button
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <CardContent 
          id={lessonId} 
          className="border-t pt-4 bg-white" 
          role="region" 
          aria-label={`Details for Lesson ${lessonIndex + 1}`}
        >
          {lesson.description && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h5 className="sr-only">Description</h5>
              <p className="text-sm text-blue-800">{lesson.description}</p>
            </div>
          )}

          <div className="space-y-4">
            <section aria-labelledby={`resources-title-${lesson._id}`}>
              <h5 id={`resources-title-${lesson._id}`} className="text-sm font-semibold text-gray-700 mb-3">
                Resources
              </h5>
              <div className="flex flex-wrap gap-2">
                {lesson.pdfFiles?.map((pdf, i) => (
                  pdf?.url && pdf?.filename && (
                    <a
                      key={i}
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      aria-label={`Download PDF: ${pdf.filename} (opens in new window)`}
                    >
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      {pdf.filename}
                    </a>
                  )
                ))}

                {lesson.youtubeLinks && (
                  <a
                    href={lesson.youtubeLinks}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                    aria-label="Watch lesson on YouTube (opens in new window)"
                  >
                    <Youtube className="h-4 w-4" aria-hidden="true" />
                    Watch on YouTube
                  </a>
                )}

                {lesson.otherLink && (
                  <a
                    href={lesson.otherLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-purple-600 hover:bg-purple-50 transition-colors shadow-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    aria-label="Visit external link (opens in new window)"
                  >
                    <Link2 className="h-4 w-4" aria-hidden="true" />
                    Visit Link
                  </a>
                )}
              </div>
            </section>

            <AssessmentCard
              assessments={lesson.lesson_assessments || []}
              title="Lesson Assessments"
              badgeColor="bg-green-50"
              onDelete={onDeleteAssessment}
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
}
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { LessonCard } from "./lesson-card"
import { AssessmentCard } from "./assessment-card"
import { DeleteModal } from "@/CustomComponent/CreateCourse/DeleteModal"
import EditChapterDialog from "@/CustomComponent/CreateCourse/EditChapter"
import LessonModal from "@/CustomComponent/CreateCourse/LessonModal"

export function ChapterCard({
  chapter,
  chapterIndex,
  courseId,
  quarterStartDate,
  quarterEndDate,
  onDeleteChapter,
  onDeleteAssessment,
  onDeleteLesson,
  fetchQuarterDetail,
}) {
  const chapterNumber = chapterIndex + 1;

  return (
    <AccordionItem 
      value={`chapter-${chapterIndex}`} 
      className="border rounded-xl overflow-hidden shadow-sm"
    >
      <AccordionTrigger 
        className="text-left text-lg font-semibold px-6 py-4 hover:bg-gray-50 transition-all focus-visible:ring-2 focus-visible:ring-orange-500 outline-none"
        aria-label={`Chapter ${chapterNumber}: ${chapter.title}`}
      >
        <div className="flex items-center gap-3">
          <Badge 
            variant="secondary" 
            className="bg-orange-100 text-orange-800"
            aria-hidden="true"
          >
            Chapter {chapterNumber}
          </Badge>
          <span className="text-gray-800">{chapter.title}</span>
        </div>
      </AccordionTrigger>

      <AccordionContent 
        className="px-6 pb-6 space-y-6 bg-white"
        role="region"
        aria-label={`Details for ${chapter.title}`}
      >
        {/* Description Section */}
        <div className="bg-orange-50 p-4 rounded-lg" tabIndex={0}>
          <h4 className="sr-only">Chapter Description</h4>
          <p className="text-sm text-orange-800 leading-relaxed">
            {chapter.description}
          </p>
        </div>

        {/* Action Toolbar */}
        <nav 
          className="flex flex-wrap items-center gap-3" 
          aria-label="Chapter actions"
        >
          <DeleteModal 
            what="chapter" 
            deleteFunc={() => onDeleteChapter(chapter._id)} 
          />
          <EditChapterDialog
            chapterId={chapter._id}
            title={chapter.title}
            description={chapter.description}
            fetchQuarterDetail={fetchQuarterDetail}
          />
          <LessonModal 
            chapterID={chapter._id} 
            fetchQuarterDetail={fetchQuarterDetail} 
          />
          <Link
            to={`/teacher/assessments/create/chapter/${chapter._id}/${courseId}/${quarterStartDate}/${quarterEndDate}?semester=${chapter.semester._id}&quarter=${chapter.quarter._id}`}
            aria-label={`Add new assessment to Chapter ${chapterNumber}`}
          >
            <Button 
              variant="outline" 
              className="text-green-600 bg-transparent border-green-600 hover:bg-green-50 focus-visible:ring-2 focus-visible:ring-green-600"
            >
              <span aria-hidden="true">+</span> Add Assessment
            </Button>
          </Link>
        </nav>

        {/* Assessments List */}
        <div className="pt-2">
          <AssessmentCard
            assessments={chapter.chapter_assessments || []}
            title="Chapter Assessments"
            badgeColor="bg-orange-50"
            onDelete={onDeleteAssessment}
          />
        </div>

        {/* Lessons List */}
        {chapter.lessons && chapter.lessons.length > 0 && (
          <section className="space-y-4" aria-labelledby={`lessons-heading-${chapter._id}`}>
            <div className="flex items-center gap-2">
              <Badge 
                id={`lessons-heading-${chapter._id}`}
                variant="outline" 
                className="bg-blue-50"
              >
                Lessons
              </Badge>
              <span className="text-sm text-gray-500">
                <span className="sr-only">Total lessons: </span>
                ({chapter.lessons.length})
              </span>
            </div>

            <div className="space-y-3" role="list">
              {chapter.lessons.map((lesson, lessonIndex) => (
                <div key={lesson._id} role="listitem">
                  <LessonCard
                    lesson={lesson}
                    lessonIndex={lessonIndex}
                    courseId={courseId}
                    quarterStartDate={quarterStartDate}
                    quarterEndDate={quarterEndDate}
                    semesterId={chapter.semester._id}
                    quarterId={chapter.quarter._id}
                    onDelete={onDeleteLesson}
                    onDeleteAssessment={onDeleteAssessment}
                    fetchQuarterDetail={fetchQuarterDetail}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}
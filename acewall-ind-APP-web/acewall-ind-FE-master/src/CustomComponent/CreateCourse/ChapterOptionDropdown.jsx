import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BadgePlus, Plus } from "lucide-react";
import LessonModal from "./LessonModal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreateDiscussionDialog } from "../createDiscussionModal";
import LessonModalUpdated from "./LessonModalUpdated";

const ChapterOptionDropdown = ({
  typeId,
  fetchChapterDetail,
  quarterId,
  semesterId,
  courseId,
  type,
  semesterbased,
  chapterId
}) => {
  const assessmentLink = semesterbased
    ? `/teacher/assessments/create/${type}/${typeId}/${courseId}?semester=${semesterId}&quarter=${quarterId}&semesterbased=${semesterbased}`
    : `/teacher/assessments/create/${type}/${typeId}/${courseId}?semesterbased=${semesterbased}`;

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="bg-green-200 hover:bg-green-300 cursor-pointer rounded-lg p-2">
            <BadgePlus className="text-green-600" size={20} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* <DropdownMenuItem> */}
          {type === "chapter" && (
            // <></>
            // <LessonModal
            //   chapterID={typeId}
            //   fetchQuarterDetail={fetchChapterDetail}
            // />

            <DropdownMenuItem>
              <Link to={`/teacher/courses/chapter/${chapterId}/createLesson`}>
                <div className="text-green-600 bg-transparent flex ">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson
                </div>
              </Link>
            </DropdownMenuItem>

            // <LessonModalUpdated
            //   chapterID={typeId}
            //   fetchQuarterDetail={fetchChapterDetail}
            // />
          )}

          {/* </DropdownMenuItem> */}
          <DropdownMenuItem>
            <Link to={assessmentLink}>
              <div className="text-green-600 bg-transparent flex ">
                <Plus className="h-4 w-4 mr-2" />
                Add Assessment
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              to={`/teacher/courses/${courseId}/posts/${type}/${typeId}`}
              className="flex cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              <p className="text-green-600">Add Page</p>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              to={`/teacher/discussions/course/${courseId}?semester=${semesterId}&&quarter=${quarterId}&&type=${type}&&typeId=${typeId}&&course=${courseId}`}
              className="text-green-600 bg-transparent flex"
            >
              <Plus className="h-4 w-4 mr-2" />
              Discussion
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChapterOptionDropdown;

import { useParams } from "react-router-dom";
import CourseGradebook from "../../CustomComponent/teacher/CourseGradebook";

export default function CourseGradebookPage() {
  const { courseId } = useParams();
  return <CourseGradebook courseId={courseId} />;
}

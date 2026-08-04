import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getUserCoursesForFilter } from "../services/course";
import CoursePickerGrid, {
  CoursePickerItem,
} from "../components/common/CoursePickerGrid";
import { getFriendlyErrorMessage } from "../utils/errorMessage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DEBOUNCE_DELAY = 800;

// Course picker for starting a new conversation — mirrors web's
// AllCoursesFilterPage.jsx used with pagefor="Students" (same shared
// component/data source as the Discussions picker, different destination).
const TeacherMessagesCoursePicker = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCourses = useCallback(async (search: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUserCoursesForFilter(search);
      setCourses(Array.isArray(res?.courses) ? res.courses : []);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, "Failed to load courses."));
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCourses(searchQuery);
    }, DEBOUNCE_DELAY);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, fetchCourses]);

  const items: CoursePickerItem[] = courses.map((course) => ({
    _id: course._id,
    title: course.courseTitle,
    subtitle: course.courseCode ? `Code: ${course.courseCode}` : undefined,
    thumbnailUrl: course.thumbnail?.url,
    badges: [
      course.published
        ? { label: "Published", color: "#166534", backgroundColor: "#DCFCE7" }
        : { label: "Unpublished", color: "#92400E", backgroundColor: "#FEF3C7" },
    ],
  }));

  return (
    <CoursePickerGrid
      headerTitle="Messages"
      headerSubtitle="Select a course to view and message its students."
      items={items}
      loading={loading}
      error={error}
      onRetry={() => fetchCourses(searchQuery)}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search courses..."
      onSelect={(item) =>
        navigation.navigate("TeacherMessagesByCourse", {
          courseId: item._id,
          courseTitle: item.title,
        })
      }
      emptyTitle="No courses found"
      emptySubtitle="Try adjusting your search."
      footerLabel="View Students"
      loadingLabel="Loading courses..."
    />
  );
};

export default TeacherMessagesCoursePicker;

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getUserCoursesForFilter } from "../services/course";
import CoursePickerGrid, {
  CoursePickerItem,
} from "../components/common/CoursePickerGrid";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DEBOUNCE_DELAY = 800;

const DiscussionsCoursePicker = () => {
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
      setError(err?.message || "Failed to load courses.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Server-side debounced search — matches web's AllCoursesFilterPage.jsx
  // (800ms), rather than firing a request on every keystroke.
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
      headerTitle="Discussions"
      headerSubtitle="Select a course to view its discussion rooms."
      items={items}
      loading={loading}
      error={error}
      onRetry={() => fetchCourses(searchQuery)}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search courses..."
      onSelect={(item) =>
        navigation.navigate("DiscussionsByCourse", {
          courseId: item._id,
          courseTitle: item.title,
        })
      }
      emptyTitle="No courses found"
      emptySubtitle="Try adjusting your search."
      footerLabel="View Discussions"
      loadingLabel="Loading courses..."
    />
  );
};

export default DiscussionsCoursePicker;

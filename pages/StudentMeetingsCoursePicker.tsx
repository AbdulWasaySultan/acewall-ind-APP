import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getCoursesWithMeetings } from "../services/course";
import CoursePickerGrid, {
  CoursePickerItem,
} from "../components/common/CoursePickerGrid";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StudentMeetingsCoursePicker = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCourses = useCallback(async () => {
    try {
      setError(null);
      const res = await getCoursesWithMeetings();
      setCourses(res?.success && Array.isArray(res.courses) ? res.courses : []);
    } catch (err: any) {
      setError("Failed to load live classes.");
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [fetchCourses])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses();
  }, [fetchCourses]);

  const filtered = useMemo(() => {
    return courses.filter(
      (course) =>
        searchQuery.trim() === "" ||
        course.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const items: CoursePickerItem[] = filtered.map((course) => {
    const teacherName = [
      course.createdby?.firstName,
      course.createdby?.lastName,
    ]
      .filter(Boolean)
      .join(" ");
    return {
      _id: course._id,
      title: course.courseTitle,
      subtitle: [
        teacherName ? `Instructor: ${teacherName}` : null,
        `${course.meetingCount || 0} Scheduled Meetings`,
      ]
        .filter(Boolean)
        .join(" · "),
      thumbnailUrl: course.thumbnail?.url,
      badges: course.category?.title
        ? [
            {
              label: course.category.title,
              color: "#166534",
              backgroundColor: "#DCFCE7",
            },
          ]
        : undefined,
    };
  });

  return (
    <CoursePickerGrid
      headerTitle="Live Classes"
      headerSubtitle="Courses that have scheduled Zoom meetings."
      items={items}
      loading={loading}
      error={error}
      onRetry={fetchCourses}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search courses..."
      onSelect={(item) =>
        navigation.navigate("StudentMeetingsByCourse", {
          courseId: item._id,
          courseTitle: item.title,
        })
      }
      emptyTitle="No active meetings found"
      emptySubtitle="There are currently no courses with scheduled meetings. Please check back later."
      footerLabel="View Meetings"
      loadingLabel="Loading live classes..."
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default StudentMeetingsCoursePicker;

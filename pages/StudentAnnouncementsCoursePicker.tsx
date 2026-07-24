import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../contexts/AuthContext";
import { getAnnouncementsByStudent } from "../services/announcement";
import CoursePickerGrid, {
  CoursePickerItem,
} from "../components/common/CoursePickerGrid";

interface DerivedCourse {
  _id: string;
  title: string;
  thumbnail?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StudentAnnouncementsCoursePicker = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<DerivedCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCourses = useCallback(async () => {
    if (!user?._id) return;
    try {
      setError(null);
      const res = await getAnnouncementsByStudent(user._id);
      const list: any[] = res?.announcements || [];

      const uniqueCoursesMap = new Map<string, DerivedCourse>();
      list.forEach((ann) => {
        const course = ann.course;
        if (course && course._id && !uniqueCoursesMap.has(course._id)) {
          uniqueCoursesMap.set(course._id, {
            _id: course._id,
            title: course.courseTitle,
            thumbnail: course.thumbnail?.url,
          });
        }
      });
      setCourses(Array.from(uniqueCoursesMap.values()));
    } catch (err: any) {
      setError(err?.message || "Failed to load your announcements.");
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?._id]);

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
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const items: CoursePickerItem[] = filtered.map((course) => ({
    _id: course._id,
    title: course.title,
    thumbnailUrl: course.thumbnail,
  }));

  return (
    <CoursePickerGrid
      headerTitle="Announcements"
      headerSubtitle="Select a course to see updates from your teachers."
      items={items}
      loading={loading}
      error={error}
      onRetry={fetchCourses}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search courses..."
      onSelect={(item) =>
        navigation.navigate("AnnouncementsByCourse", {
          courseId: item._id,
          courseTitle: item.title,
        })
      }
      emptyTitle="No Announcements"
      emptySubtitle="There are no updates for your courses right now."
      footerLabel="Check Updates →"
      loadingLabel="Fetching your courses..."
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default StudentAnnouncementsCoursePicker;

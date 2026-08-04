import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getVerifiedCourses } from "../services/course";
import CoursePickerGrid, {
  CoursePickerItem,
} from "../components/common/CoursePickerGrid";
import { DropdownFilter } from "../components/filters/DropDown";
import { getFriendlyErrorMessage } from "../utils/errorMessage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TeacherAnnouncementsCoursePicker = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // "Quick Filter" course-select — matches web's AllannouncmentCourses.jsx
  // ("All Verified Courses" + one entry per course).
  const [courseFilterOpen, setCourseFilterOpen] = useState(false);
  const [courseFilterValue, setCourseFilterValue] = useState<string | null>(
    "all"
  );

  const fetchCourses = useCallback(async () => {
    try {
      setError(null);
      const res = await getVerifiedCourses();
      setCourses(Array.isArray(res?.courses) ? res.courses : []);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, "No courses found"));
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

  const courseFilterItems = useMemo(
    () => [
      { label: "All Verified Courses", value: "all" },
      ...courses.map((course) => ({
        label: course.courseTitle,
        value: course._id,
      })),
    ],
    [courses]
  );

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        course.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourseFilter =
        !courseFilterValue ||
        courseFilterValue === "all" ||
        course._id === courseFilterValue;
      return matchesSearch && matchesCourseFilter;
    });
  }, [courses, searchQuery, courseFilterValue]);

  const items: CoursePickerItem[] = filtered.map((course) => ({
    _id: course._id,
    title: course.courseTitle,
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
  }));

  return (
    <CoursePickerGrid
      headerTitle="Course Announcements"
      headerSubtitle="Select a verified course to manage announcements."
      items={items}
      loading={loading}
      error={error}
      onRetry={fetchCourses}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search courses..."
      filterOpen={courseFilterOpen}
      extraFilter={
        <DropdownFilter
          open={courseFilterOpen}
          value={courseFilterValue}
          items={courseFilterItems}
          setOpen={setCourseFilterOpen}
          setValue={setCourseFilterValue}
          placeholder="All Verified Courses"
          zIndex={2000}
          zIndexInverse={1000}
        />
      }
      onSelect={(item) =>
        navigation.navigate("AnnouncementsByCourse", {
          courseId: item._id,
          courseTitle: item.title,
        })
      }
      emptyTitle="No courses found"
      emptySubtitle="Try resetting your filters or adjusting your search."
      footerLabel="View Announcements"
      loadingLabel="Loading verified courses..."
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default TeacherAnnouncementsCoursePicker;

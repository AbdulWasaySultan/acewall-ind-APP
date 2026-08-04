import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
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

// Course picker for "Students" — same shape as the Announcements/Messages
// pickers: a search box plus a redundant-by-design "select course" dropdown
// that filters the same grid, per explicit request.
const TeacherStudentsCoursePicker = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
      setError(getFriendlyErrorMessage(err, "Failed to load courses."));
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
      { label: "All Courses", value: "all" },
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
      headerTitle="Students"
      headerSubtitle="Select a course to view its enrolled students."
      items={items}
      loading={loading}
      error={error}
      onRetry={fetchCourses}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search courses..."
      filterOpen={courseFilterOpen}
      extraFilter={
        <View>
          <DropdownFilter
            open={courseFilterOpen}
            value={courseFilterValue}
            items={courseFilterItems}
            setOpen={setCourseFilterOpen}
            setValue={setCourseFilterValue}
            placeholder="All Courses"
            zIndex={2000}
            zIndexInverse={1000}
          />
        </View>
      }
      onSelect={(item) =>
        navigation.navigate("StudentsByCourse", {
          courseId: item._id,
          courseTitle: item.title,
        })
      }
      emptyTitle="No courses found"
      emptySubtitle="Try adjusting your search or course filter."
      footerLabel="View Students"
      loadingLabel="Loading courses..."
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default TeacherStudentsCoursePicker;

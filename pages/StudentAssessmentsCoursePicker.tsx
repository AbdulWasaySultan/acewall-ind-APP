import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getAllAssessmentForStudent } from "../services/course";
import CoursePickerGrid, {
  CoursePickerItem,
} from "../components/common/CoursePickerGrid";
import { DropdownFilter } from "../components/filters/DropDown";

interface DerivedCourse {
  _id: string;
  title: string;
  thumbnail?: string;
  semesterbased: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StudentAssessmentsCoursePicker = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<DerivedCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeValue, setTypeValue] = useState<string | null>("all");

  const fetchCourses = useCallback(async () => {
    try {
      setError(null);
      const res = await getAllAssessmentForStudent();
      const list: any[] = Array.isArray(res) ? res : res?.data || [];

      const uniqueCoursesMap = new Map<string, DerivedCourse>();
      list.forEach((item) => {
        const course = item.course;
        if (course && course._id && !uniqueCoursesMap.has(course._id)) {
          uniqueCoursesMap.set(course._id, {
            _id: course._id,
            title: course.courseTitle,
            thumbnail: course.thumbnail?.url,
            semesterbased: !!course.semesterbased,
          });
        }
      });
      setCourses(Array.from(uniqueCoursesMap.values()));
    } catch (err: any) {
      setError(err?.message || "Failed to load your assessments.");
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
    return courses.filter((course) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        !typeValue ||
        typeValue === "all" ||
        (typeValue === "semester" && course.semesterbased) ||
        (typeValue === "chapter" && !course.semesterbased);
      return matchesSearch && matchesType;
    });
  }, [courses, searchQuery, typeValue]);

  const items: CoursePickerItem[] = filtered.map((course) => ({
    _id: course._id,
    title: course.title,
    thumbnailUrl: course.thumbnail,
    badges: [
      course.semesterbased
        ? { label: "Semester based", color: "#1D4ED8", backgroundColor: "#DBEAFE" }
        : { label: "Chapter based", color: "#B45309", backgroundColor: "#FEF3C7" },
    ],
  }));

  return (
    <CoursePickerGrid
      headerTitle="My Assessments"
      headerSubtitle="Select a course to see your assessments."
      items={items}
      loading={loading}
      error={error}
      onRetry={fetchCourses}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search courses..."
      extraFilter={
        <DropdownFilter
          open={typeOpen}
          value={typeValue}
          items={[
            { label: "All Course Types", value: "all" },
            { label: "Semester Based", value: "semester" },
            { label: "Chapter Based", value: "chapter" },
          ]}
          setOpen={setTypeOpen}
          setValue={setTypeValue}
          placeholder="All Course Types"
          zIndex={2000}
        />
      }
      onSelect={(item) =>
        navigation.navigate("StudentAssessmentsByCourse", {
          courseId: item._id,
          courseTitle: item.title,
        })
      }
      emptyTitle="No courses match your filters."
      emptySubtitle="Try clearing your search or course type filter."
      footerLabel="Manage Assignments · Open ›"
      loadingLabel="Loading your assessments..."
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default StudentAssessmentsCoursePicker;

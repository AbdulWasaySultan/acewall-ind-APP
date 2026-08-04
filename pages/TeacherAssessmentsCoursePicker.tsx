import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getAllAssessmentsByTeacher } from "../services/course";
import CoursePickerGrid, {
  CoursePickerItem,
} from "../components/common/CoursePickerGrid";
import { DropdownFilter } from "../components/filters/DropDown";
import { getFriendlyErrorMessage } from "../utils/errorMessage";

interface DerivedCourse {
  _id: string;
  title: string;
  thumbnail?: string;
  isVerified?: string;
  semesterbased: boolean;
  gradingSystem?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const verificationBadge = (isVerified?: string) => {
  switch (isVerified) {
    case "approved":
      return {
        label: "Approved ✅",
        color: "#166534",
        backgroundColor: "#DCFCE7",
      };
    case "rejected":
      return {
        label: "Rejected ❌",
        color: "#991B1B",
        backgroundColor: "#FEE2E2",
      };
    default:
      return {
        label: "Pending ⏳",
        color: "#92400E",
        backgroundColor: "#FEF3C7",
      };
  }
};

const TeacherAssessmentsCoursePicker = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<DerivedCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationValue, setVerificationValue] = useState<string | null>(
    "all"
  );
  // Course structure filter — reuses the same `course.semesterbased` boolean
  // already used for the card badges (see verificationBadge/badges below).
  const [structureOpen, setStructureOpen] = useState(false);
  const [structureValue, setStructureValue] = useState<string | null>("all");

  useEffect(() => {
    if (verificationOpen) setStructureOpen(false);
  }, [verificationOpen]);
  useEffect(() => {
    if (structureOpen) setVerificationOpen(false);
  }, [structureOpen]);

  const fetchCourses = useCallback(async () => {
    try {
      setError(null);
      const res = await getAllAssessmentsByTeacher();
      const list: any[] = Array.isArray(res) ? res : res?.data || [];

      const unique: DerivedCourse[] = [];
      list.forEach((item) => {
        const course = item.course;
        if (course && course._id && !unique.some((c) => c._id === course._id)) {
          unique.push({
            _id: course._id,
            title: course.courseTitle,
            thumbnail: course.thumbnail?.url,
            isVerified: course.isVerified,
            semesterbased: !!course.semesterbased,
            gradingSystem: course.gradingSystem,
          });
        }
      });
      setCourses(unique);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, "Failed to load your assessments."));
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
      const matchesVerification =
        !verificationValue ||
        verificationValue === "all" ||
        course.isVerified === verificationValue;
      const matchesStructure =
        !structureValue ||
        structureValue === "all" ||
        (structureValue === "semester" && course.semesterbased) ||
        (structureValue === "chapter" && !course.semesterbased);
      return matchesSearch && matchesVerification && matchesStructure;
    });
  }, [courses, searchQuery, verificationValue, structureValue]);

  const items: CoursePickerItem[] = filtered.map((course) => ({
    _id: course._id,
    title: course.title,
    subtitle: course.gradingSystem
      ? `Grading: ${course.gradingSystem}`
      : undefined,
    thumbnailUrl: course.thumbnail,
    badges: [
      verificationBadge(course.isVerified),
      course.semesterbased
        ? {
            label: "Semester based",
            color: "#1D4ED8",
            backgroundColor: "#DBEAFE",
          }
        : {
            label: "Chapter based",
            color: "#1D4ED8",
            backgroundColor: "#DBEAFE",
          },
    ],
  }));

  return (
    <CoursePickerGrid
      headerTitle="Assessments"
      headerSubtitle="Select a course to manage its assessments."
      items={items}
      loading={loading}
      error={error}
      onRetry={fetchCourses}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search courses..."
      filterOpen={verificationOpen || structureOpen}
      extraFilter={
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View style={{ zIndex: verificationOpen ? 3000 : 2000 }}>
            <DropdownFilter
              open={verificationOpen}
              value={verificationValue}
              items={[
                { label: "All Verification Statuses", value: "all" },
                { label: "Approved ✅", value: "approved" },
                { label: "Pending ⏳", value: "pending" },
                { label: "Rejected ❌", value: "rejected" },
              ]}
              setOpen={setVerificationOpen}
              setValue={setVerificationValue}
              placeholder="All Verification Statuses"
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>
          <View style={{ zIndex: structureOpen ? 3000 : 2000 }}>
            <DropdownFilter
              open={structureOpen}
              value={structureValue}
              items={[
                { label: "All Structures", value: "all" },
                { label: "Semester Based", value: "semester" },
                { label: "Chapter Based", value: "chapter" },
              ]}
              setOpen={setStructureOpen}
              setValue={setStructureValue}
              placeholder="All Structures"
              zIndex={2000}
              zIndexInverse={1000}
            />
          </View>
        </View>
      }
      onSelect={(item) =>
        navigation.navigate("TeacherAssessmentsByCourse", {
          courseId: item._id,
          courseTitle: item.title,
        })
      }
      emptyTitle="No courses match those filters."
      emptySubtitle="Try resetting your search or verification filter."
      footerLabel="View Assessments →"
      loadingLabel="Gathering your assessments..."
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default TeacherAssessmentsCoursePicker;

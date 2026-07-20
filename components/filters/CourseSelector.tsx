// CourseSelector.tsx
import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

interface Course {
  _id: string;
  courseTitle: string;
}

interface CourseSelectorProps {
  courses: Course[];
  selectedCourse: string | null;
  onCourseChange: (courseId: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  onOpenChange?: (open: boolean) => void;
  listMode?: "MODAL" | "SCROLLVIEW"; // <── new prop
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  courses,
  selectedCourse,
  onCourseChange,
  placeholder = "Select a Course",
  disabled = false,
  loading = false,
  onOpenChange,
  listMode = "SCROLLVIEW",
}) => {
  const [open, setOpen] = useState(false);

  const handleSetOpen = (value: React.SetStateAction<boolean>) => {
    const newOpen = typeof value === "function" ? value(open) : value;
    setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  const courseItems = React.useMemo(() => {
    return [
      { label: "All Enrolled Courses", value: "all" },
      ...courses.map((course) => ({
        label: course.courseTitle,
        value: course._id,
      })),
    ];
  }, [courses]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Course</Text>
      <DropDownPicker
        open={open}
        value={selectedCourse}
        items={courseItems}
        setOpen={handleSetOpen}
        setValue={(callback) => {
          const newValue =
            typeof callback === "function"
              ? callback(selectedCourse)
              : callback;
          onCourseChange(newValue);
        }}
        setItems={() => { }}
        placeholder={loading ? "Loading courses..." : placeholder}
        disabled={disabled || loading || courses.length === 0}
        style={styles.dropdownPicker}
        containerStyle={styles.dropdownContainerStyle}
        dropDownContainerStyle={styles.dropdownListStyle}
        zIndex={3000}
        zIndexInverse={1000}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 200,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  dropdownPicker: {
    backgroundColor: "#fff",
    borderColor: "#10B144",
    borderRadius: 8,
  },
  dropdownContainerStyle: {
    height: 50,
  },
  dropdownListStyle: {
    borderColor: "#10B144",
  },
});

export default CourseSelector;

import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Course } from "../../services/student";

interface CourseCardProps {
  course: Course;
  onPress: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  return (
    <Pressable style={styles.courseCard} onPress={() => onPress(course)}>
      {typeof course.thumbnail?.url === "string" && course.thumbnail.url ? (
        <Image source={{ uri: course.thumbnail.url }} style={styles.courseThumbnail} />
      ) : null}
      <Text style={styles.courseCardTitle}>{course.courseTitle}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  courseCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 24,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseThumbnail: { width: 120, height: 90, borderRadius: 8, marginBottom: 8 },
  courseCardTitle: { fontSize: 20, fontWeight: "bold", marginTop: 8 },
});

export default React.memo(CourseCard);

import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Student } from "../../services/student";

interface StudentCardProps {
  student: Student;
  onViewProfile: (student: Student) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onViewProfile }) => {
  return (
    <View style={styles.studentCard}>
      <View style={styles.avatar}>
        {student.profileImg?.url ? (
          <Image source={{ uri: student.profileImg.url }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarEmoji}>👤</Text>
        )}
      </View>
      <Text style={styles.studentName}>
        {student.firstName} {student.middleName} {student.lastName}
      </Text>
      <Text style={styles.studentEmail}>{student.email}</Text>
      <View style={styles.joinedRow}>
        <Text style={styles.joinedLabel}>Joined</Text>
        <Text>
          {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"}
        </Text>
      </View>
      <Pressable style={styles.viewProfileButton} onPress={() => onViewProfile(student)}>
        <Text style={styles.viewProfileButtonText}>View Profile</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  studentCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  avatarImage: { width: 80, height: 80 },
  avatarEmoji: { fontSize: 40, color: "#666" },
  studentName: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  studentEmail: { color: "#666", marginBottom: 16 },
  joinedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  joinedLabel: { fontWeight: "bold" },
  viewProfileButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  viewProfileButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default React.memo(StudentCard);

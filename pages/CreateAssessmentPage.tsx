// screens/CreateAssessmentPage.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SimpleIcon from "../components/SimpleIcon";
import AddAssessmentForm from "../components/AddAssessmentForm";

const CreateAssessmentPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const params = route.params as any;

  const handleBack = () => {
    if (params?.navigateBack) {
      params.navigateBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <SimpleIcon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Create New Assessment</Text>
          <Text style={styles.headerSubtitle}>
            Create a new Assessment for students.
          </Text>
        </View>
      </View>

      {/* Form Component */}
      <AddAssessmentForm
        courseId={params.courseId}
        chapterId={params.chapterId}
        lessonId={params.lessonId}
        semesterId={params.semesterId}
        quarterId={params.quarterId}
        onAssessmentCreated={params.refreshAssessments}
        onCancel={handleBack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
});

export default CreateAssessmentPage;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import {
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from "react-native-image-picker";
import {
  getStudentEnrolledCourses,
  getAllCourses,
} from "../../services/course";
import { useAuth } from "../../contexts/AuthContext"; // <-- import Auth context
import SimpleIcon from "../../components/SimpleIcon";

// ── Typed icon wrapper
const Icon: React.FC<{ name: string; size: number; color: string }> = ({
  name,
  size,
  color,
}) => <MaterialIcons name={name as any} size={size} color={color} />;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type PostTarget = "public" | "course";

interface MediaFile {
  uri: string;
  type: "photo" | "video";
  name: string;
}

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    content: string;
    target: PostTarget;
    media: MediaFile[];
    courseId?: string;
  }) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: TargetToggle (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

const TARGET_OPTIONS: { key: PostTarget; label: string; icon: string }[] = [
  { key: "public", label: "Public Feed", icon: "public" },
  { key: "course", label: "Course Class", icon: "school" },
];

const TargetToggle: React.FC<{
  value: PostTarget;
  onChange: (v: PostTarget) => void;
}> = ({ value, onChange }) => (
  <View style={toggleStyles.row}>
    {TARGET_OPTIONS.map((opt) => {
      const active = value === opt.key;
      return (
        <TouchableOpacity
          key={opt.key}
          style={[toggleStyles.btn, active && toggleStyles.btnActive]}
          onPress={() => onChange(opt.key)}
        >
          <Icon name={opt.icon} size={18} color={active ? "#fff" : "#555"} />
          <Text
            style={[toggleStyles.label, active && toggleStyles.labelActive]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const toggleStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: "#f5f5f5",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  btnActive: { backgroundColor: "#10B144", borderColor: "#10B144" },
  label: { fontSize: 15, fontWeight: "700", color: "#555" },
  labelActive: { color: "#fff" },
});

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: TextEditor (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

const TextEditor: React.FC<{
  value: string;
  onChange: (t: string) => void;
}> = ({ value, onChange }) => {
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <View style={editorStyles.container}>
      <TextInput
        style={editorStyles.input}
        placeholder="Start writing..."
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChange}
        multiline
        textAlignVertical="top"
      />
      <View style={editorStyles.statusBar}>
        <Text style={editorStyles.statusText}>
          CHARS: {charCount}
          {"   "}WORDS: {wordCount}
          {"   "}POWERED BY JODIT
        </Text>
      </View>
    </View>
  );
};

const editorStyles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 4,
  },
  input: {
    minHeight: 160,
    padding: 14,
    fontSize: 15,
    color: "#0d1b2a",
    lineHeight: 22,
  },
  statusBar: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f9f9f9",
    alignItems: "flex-end",
  },
  statusText: { fontSize: 10, color: "#aaa", letterSpacing: 0.5 },
});

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: MediaGrid (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

const MediaGrid: React.FC<{
  files: MediaFile[];
  onRemove: (i: number) => void;
}> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: 12 }}
    >
      {files.map((file, index) => (
        <View key={`${file.uri}-${index}`} style={gridStyles.thumb}>
          <Image source={{ uri: file.uri }} style={gridStyles.image} />

          {file.type === "video" && (
            <View style={gridStyles.videoOverlay}>
              <Icon name="play-arrow" size={24} color="#fff" />
            </View>
          )}

          <TouchableOpacity
            style={gridStyles.removeBtn}
            onPress={() => onRemove(index)}
          >
            <Icon name="close" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const gridStyles = StyleSheet.create({
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 8,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: MediaPicker (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

const MediaPicker: React.FC<{ onAdd: (f: MediaFile) => void }> = ({
  onAdd,
}) => {
  const pick = (mediaType: "photo" | "video") => {
    launchImageLibrary(
      {
        mediaType: mediaType === "photo" ? "photo" : "video",
        quality: 0.8,
        selectionLimit: mediaType === "photo" ? 5 : 1,
      },
      (res: ImagePickerResponse) => {
        if (res.didCancel) return;
        if (res.errorCode) {
          Alert.alert("Error", res.errorMessage ?? "Failed to open library.");
          return;
        }
        res.assets?.forEach((asset: Asset) =>
          onAdd({
            uri: asset.uri!,
            type: mediaType,
            name: asset.fileName ?? `${mediaType}_${Date.now()}`,
          })
        );
      }
    );
  };

  return (
    <View style={pickerStyles.row}>
      <TouchableOpacity style={pickerStyles.btn} onPress={() => pick("photo")}>
        <Icon name="image" size={20} color="#10B144" />
        <Text style={pickerStyles.label}>Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={pickerStyles.btn} onPress={() => pick("video")}>
        <Icon name="videocam" size={20} color="#1565C0" />
        <Text style={pickerStyles.label}>Video</Text>
      </TouchableOpacity>
    </View>
  );
};

const pickerStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, marginTop: 16 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  label: { fontSize: 15, color: "#0d1b2a", fontWeight: "600" },
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: CreatePostModal
// ─────────────────────────────────────────────────────────────────────────────

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const { userRole } = useAuth(); // get current user role
  const [target, setTarget] = useState<PostTarget>("public");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaFile[]>([]);

  // ── Course selection states ──
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{
    _id: string;
    courseTitle: string;
  } | null>(null);
  const [showCourseList, setShowCourseList] = useState(false);

  // Helper to extract courses from various response shapes
  const extractCourses = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    // getStudentEnrolledCourses() returns { enrolledCourses: [{ course: {...}, ... }] } -
    // each item nests the actual course under `.course`, not a flat course object.
    if (data.enrolledCourses && Array.isArray(data.enrolledCourses)) {
      return data.enrolledCourses
        .filter((enrollment: any) => enrollment.course)
        .map((enrollment: any) => ({
          _id: enrollment.course._id,
          courseTitle: enrollment.course.courseTitle,
        }));
    }
    if (data.courses && Array.isArray(data.courses)) return data.courses;
    if (data.data && data.data.courses && Array.isArray(data.data.courses))
      return data.data.courses;
    return [];
  };

  // Fetch courses when target becomes 'course'
  useEffect(() => {
    if (target === "course" && courses.length === 0 && !loadingCourses) {
      setLoadingCourses(true);

      // Use the same endpoint as web: /enrollment/my-courses -> getStudentEnrolledCourses
      const fetchFn = async () => {
        try {
          // First, try the enrolled courses endpoint (used by web)
          let res = await getStudentEnrolledCourses("");
          console.log("📦 Enrolled courses response:", res);
          let coursesArray = extractCourses(res);

          // If user is teacher and enrolled list is empty, fallback to all courses
          if (userRole === "teacher" && coursesArray.length === 0) {
            console.log(
              "🔄 Teacher with no enrollments, falling back to all courses"
            );
            const allRes = await getAllCourses();
            coursesArray = extractCourses(allRes);
          }

          setCourses(coursesArray);
        } catch (err) {
          console.error("Failed to fetch courses:", err);
          Alert.alert("Error", "Failed to load courses. Please try again.");
          setCourses([]);
        } finally {
          setLoadingCourses(false);
        }
      };

      fetchFn();
    }
  }, [target, userRole]); // Re-run if userRole changes

  // Reset selected course when switching away from 'course'
  useEffect(() => {
    if (target !== "course") {
      setSelectedCourse(null);
    }
  }, [target]);

  const resetState = () => {
    setTarget("public");
    setContent("");
    setMedia([]);
    setSelectedCourse(null);
    setCourses([]);
    setShowCourseList(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleAddMedia = (file: MediaFile) =>
    setMedia((prev) => [...prev, file]);
  const handleRemoveMedia = (index: number) =>
    setMedia((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    if (!content.trim() && media.length === 0) {
      Alert.alert("Empty post", "Please write something or add a photo/video.");
      return;
    }
    if (target === "course" && !selectedCourse) {
      Alert.alert("Missing course", "Please select a course for this post.");
      return;
    }
    onSubmit({
      content: content.trim(),
      target,
      media,
      courseId: selectedCourse?._id,
    });
    resetState();
    onClose();
  };

  // ── Render course list modal ──
  const renderCourseListModal = () => (
    <Modal
      visible={showCourseList}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowCourseList(false)}
    >
      <View style={styles.courseModalOverlay}>
        <View style={styles.courseModalContent}>
          <View style={styles.courseModalHeader}>
            <Text style={styles.courseModalTitle}>Choose a Class</Text>
            <TouchableOpacity onPress={() => setShowCourseList(false)}>
              <Image
                source={require("../../assets/dropDown.png")}
                style={{ width: 20, height: 20 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>

          {loadingCourses ? (
            <ActivityIndicator
              size="large"
              color="#10B144"
              style={{ marginVertical: 40 }}
            />
          ) : courses.length === 0 ? (
            <Text style={styles.courseEmptyText}>No courses available</Text>
          ) : (
            <FlatList
              data={courses}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.courseItem,
                    selectedCourse?._id === item._id &&
                      styles.courseItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedCourse(item);
                    setShowCourseList(false);
                  }}
                >
                  <Text style={styles.courseItemText}>{item.courseTitle}</Text>
                  {selectedCourse?._id === item._id && (
                    <Icon name="check-circle" size={20} color="#10B144" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={styles.courseSeparator} />
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.sheet}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Create New Post</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={26} color="#555" />
                </TouchableOpacity>
              </View>

              {/* Public Feed / Course Class */}
              <TargetToggle value={target} onChange={setTarget} />

              {/* Course Selector (only when target === 'course') */}
              {target === "course" && (
                <TouchableOpacity
                  style={styles.courseSelectorButton}
                  onPress={() => setShowCourseList(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.courseSelectorText,
                      !selectedCourse && styles.courseSelectorPlaceholder,
                    ]}
                  >
                    {selectedCourse
                      ? selectedCourse.courseTitle
                      : "Choose a Class..."}
                  </Text>
                  <Icon name="chevron-down" size={22} color="#555" />
                </TouchableOpacity>
              )}

              {/* Text input with counter */}
              <TextEditor value={content} onChange={setContent} />

              {/* Selected media thumbnails */}
              <MediaGrid files={media} onRemove={handleRemoveMedia} />

              {/* Photo / Video picker */}
              <MediaPicker onAdd={handleAddMedia} />
            </ScrollView>

            {/* Share Post — sticky at bottom */}
            <TouchableOpacity style={styles.shareBtn} onPress={handleSubmit}>
              <Text style={styles.shareBtnText}>Share Post</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Course List Modal (rendered outside the main modal) */}
      {renderCourseListModal()}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES (including new course selector styles)
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#0d1b2a" },
  shareBtn: {
    backgroundColor: "#10B144",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  shareBtnText: { color: "#fff", fontSize: 17, fontWeight: "800" },

  // Course selector button
  courseSelectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  courseSelectorText: {
    fontSize: 15,
    color: "#0d1b2a",
    fontWeight: "500",
  },
  courseSelectorPlaceholder: {
    color: "#aaa",
    fontWeight: "400",
  },

  // Course list modal
  courseModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  courseModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "85%",
    maxHeight: "70%",
  },
  courseModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  courseModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0d1b2a",
  },
  courseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  courseItemSelected: {
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  courseItemText: {
    fontSize: 15,
    color: "#0d1b2a",
    fontWeight: "500",
  },
  courseSeparator: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  courseEmptyText: {
    textAlign: "center",
    fontSize: 15,
    color: "#888",
    marginVertical: 40,
  },
});

export default CreatePostModal;

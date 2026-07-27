import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import Toast from "react-native-simple-toast";
import { useAuth } from "../contexts/AuthContext";
import {
  createAnnouncement,
  getAnnouncementsByTeacher,
  deleteAnnouncement,
  getAnnouncementsByStudent,
} from "../services/announcement";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import SearchFilterView from "../components/filters/SearchFilter";
import { FilterBar } from "../components/filters/FilterBar";
import SimpleIcon from "../components/SimpleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ====================== Helper Components ======================

const TeacherAnnouncementRow = ({
  announcement,
  expanded,
  onToggle,
  onDelete,
  isDeleting,
}: {
  announcement: any;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) => {
  const rowStyle = [styles.teacherRow, expanded && styles.teacherRowExpanded];

  return (
    <Pressable onPress={onToggle} style={rowStyle}>
      <Text style={styles.teacherDate}>
        {new Date(announcement.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </Text>
      <View style={styles.teacherTitleContainer}>
        <Text
          style={styles.teacherTitle}
          numberOfLines={expanded ? undefined : 2}
        >
          {announcement.title}
        </Text>
      </View>
      <View style={styles.teacherMessageContainer}>
        <Text
          style={styles.teacherMessage}
          numberOfLines={expanded ? undefined : 2}
          ellipsizeMode="tail"
        >
          {announcement.message}
        </Text>
      </View>
      <Pressable
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color="red" />
        ) : (
          <Text style={styles.deleteIcon}>🗑️</Text>
        )}
      </Pressable>
    </Pressable>
  );
};

const StudentAnnouncementCard = ({
  announcement,
  expanded,
  onToggle,
}: {
  announcement: any;
  expanded: boolean;
  onToggle: () => void;
}) => (
  <Pressable onPress={onToggle} style={styles.studentCard}>
    <View style={styles.studentCardHeader}>
      <View style={styles.studentCardLeft}>
        <Text style={styles.studentCardTitle}>{announcement.title}</Text>
      </View>
      <View style={styles.studentCardRight}>
        <Text style={styles.studentCardDate}>
          {new Date(announcement.createdAt).toLocaleDateString("en-US")}
        </Text>
        <Text style={styles.studentCardArrow}>{expanded ? "▲" : "▼"}</Text>
      </View>
    </View>
    {expanded && (
      <View style={styles.studentCardExpanded}>
        <Text style={styles.studentCardMessage}>{announcement.message}</Text>
        <Text style={styles.studentCardTime}>
          <Text style={styles.studentCardTimeLabel}>Time:</Text>{" "}
          {new Date(announcement.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    )}
  </Pressable>
);

// ====================== Main Component ======================

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, "AnnouncementsByCourse">;

const AnnouncementsPage = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const route = useRoute<ScreenRouteProp>();
  const { courseId, courseTitle } = route.params;

  const [isAnnouncementsExpanded, setIsAnnouncementsExpanded] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { userRole, user } = useAuth();

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState("");
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [studentAnnouncements, setStudentAnnouncements] = useState<any[]>([]);
  const [studentAnnouncementsLoading, setStudentAnnouncementsLoading] =
    useState(false);
  const [studentAnnouncementsError, setStudentAnnouncementsError] =
    useState("");

  const [expandedAnnouncements, setExpandedAnnouncements] = useState<{
    [id: string]: boolean;
  }>({});

  const toggleExpand = (id: string) => {
    setExpandedAnnouncements((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Both lists are already scoped to `courseId` at the fetch layer (server
  // side for teacher via the `course` query param, client-filtered for
  // student since that endpoint has no course-scoped variant) — the filter
  // here just applies search on top. No date filter — web doesn't have one.
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a: any) => {
      return (
        searchQuery.trim() === "" ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [announcements, searchQuery]);

  const filteredStudentAnnouncements = useMemo(() => {
    const courseFiltered = studentAnnouncements.filter(
      (a) => a.course?._id === courseId
    );
    return courseFiltered.filter((a: any) => {
      return (
        searchQuery.trim() === "" ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [studentAnnouncements, courseId, searchQuery]);

  // Teacher: fetch on mount and when role changes
  useEffect(() => {
    if (userRole === "teacher") {
      fetchAnnouncements();
    }
  }, [userRole]);

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    setAnnouncementsError("");
    try {
      const res = await getAnnouncementsByTeacher(courseId);
      setAnnouncements(res.announcements || []);
    } catch (err: any) {
      setAnnouncementsError(err.message || "Failed to load announcements");
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  // Student: fetch on mount AND on focus
  const fetchStudentAnnouncements = async () => {
    if (!user?._id) return;
    setStudentAnnouncementsLoading(true);
    setStudentAnnouncementsError("");
    try {
      const res = await getAnnouncementsByStudent(user._id);
      setStudentAnnouncements(res.announcements || []);
    } catch (err: any) {
      setStudentAnnouncementsError(
        err.message || "Failed to load announcements"
      );
    } finally {
      setStudentAnnouncementsLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "student" && user?._id) {
      fetchStudentAnnouncements();
    }
  }, [userRole, user?._id]);

  useFocusEffect(
    useCallback(() => {
      if (userRole === "student" && user?._id) {
        fetchStudentAnnouncements();
      }
      return () => {};
    }, [userRole, user?._id])
  );

  const toggleAnnouncements = () => {
    setIsAnnouncementsExpanded(!isAnnouncementsExpanded);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      setAnnouncementTitle("");
      setAnnouncementMessage("");
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle || !announcementMessage) return;
    setCreatingAnnouncement(true);
    try {
      await createAnnouncement({
        title: announcementTitle,
        courseId,
        message: announcementMessage,
      });
      toggleModal();
      fetchAnnouncements();
      Toast.show("Announcement created successfully.", Toast.LONG);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create announcement");
    } finally {
      setCreatingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    Alert.alert(
      "Delete Announcement",
      "Are you sure you want to delete this announcement?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(announcementId);
            try {
              await deleteAnnouncement(announcementId);
              fetchAnnouncements();
            } catch (err: any) {
              Alert.alert(
                "Error",
                err.message || "Failed to delete announcement"
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  // ====================== Render ======================

  const renderTeacherView = () => (
    <View style={styles.teacherViewContainer}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {courseTitle || "Course Announcements"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.fixedFiltersContainer}>
        <View style={styles.addNewRow}>
          <Pressable style={styles.addButton} onPress={toggleModal}>
            <Text style={styles.addButtonText}>+</Text>
            <Text style={styles.addButtonLabel}>Add New</Text>
          </Pressable>
        </View>

        <View style={{ overflow: "visible", zIndex: 9999, elevation: 9999 }}>
          <FilterBar
            resultsCount={filteredAnnouncements.length}
            resultsLabel="announcements"
          >
            <SearchFilterView
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search announcements..."
              style={styles.searchFilterContainer}
            />
          </FilterBar>
        </View>
      </View>

      <FlatList
        style={styles.listBelowFilters}
        data={isAnnouncementsExpanded ? filteredAnnouncements : []}
        keyExtractor={(item) => item._id}
        nestedScrollEnabled
        renderItem={({ item }) => (
          <TeacherAnnouncementRow
            announcement={item}
            expanded={!!expandedAnnouncements[item._id]}
            onToggle={() => toggleExpand(item._id)}
            onDelete={() => handleDeleteAnnouncement(item._id)}
            isDeleting={deletingId === item._id}
          />
        )}
        ListHeaderComponent={
          <View style={styles.filtersContainer}>
            <Pressable
              style={styles.sectionHeader}
              onPress={toggleAnnouncements}
            >
              <Text style={styles.sectionArrow}>
                {isAnnouncementsExpanded ? "▲" : "▼"}
              </Text>
              <Text style={styles.sectionTitle}>
                Announcements ({announcements.length})
              </Text>
            </Pressable>

            {isAnnouncementsExpanded && (
              <View style={styles.tableHeaders}>
                <Text style={[styles.tableHeaderText, styles.headerDate]}>
                  Date
                </Text>
                <Text
                  style={[styles.tableHeaderText, styles.headerTitleColumn]}
                >
                  Title
                </Text>
                <Text style={[styles.tableHeaderText, styles.headerMessage]}>
                  Message Summary
                </Text>
                <Text style={styles.headerAction} />
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={
          isAnnouncementsExpanded && !announcementsLoading ? (
            announcementsError ? (
              <Text style={styles.errorText}>{announcementsError}</Text>
            ) : (
              <Text style={styles.emptyText}>No announcements found.</Text>
            )
          ) : null
        }
        ListFooterComponent={
          announcementsLoading ? (
            <ActivityIndicator
              size="small"
              color="#4CAF50"
              style={styles.loader}
            />
          ) : null
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );

  const renderStudentView = () => {
    const data = filteredStudentAnnouncements;

    const studentHeader = (
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {courseTitle || "Course Updates"}
        </Text>
        <View style={{ width: 40 }} />
      </View>
    );

    if (studentAnnouncementsLoading) {
      return (
        <View style={styles.studentViewContainer}>
          {studentHeader}
          <ActivityIndicator
            size="large"
            color="#4CAF50"
            style={styles.loader}
          />
        </View>
      );
    }
    if (studentAnnouncementsError) {
      return (
        <View style={styles.studentViewContainer}>
          {studentHeader}
          <Text style={styles.errorText}>{studentAnnouncementsError}</Text>
        </View>
      );
    }

    return (
      <View style={styles.studentViewContainer}>
        {studentHeader}
        <View style={styles.fixedFiltersContainer}>
          <FilterBar style={{ paddingHorizontal: 12 }}>
            <SearchFilterView
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search announcements..."
              style={styles.searchFilterContainer}
            />
          </FilterBar>
        </View>

        <FlatList
          style={styles.listBelowFilters}
          data={data}
          keyExtractor={(item) => item._id}
          nestedScrollEnabled
          renderItem={({ item }) => (
            <StudentAnnouncementCard
              announcement={item}
              expanded={!!expandedAnnouncements[item._id]}
              onToggle={() => toggleExpand(item._id)}
            />
          )}
          contentContainerStyle={styles.studentListContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No announcements found.</Text>
          }
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {userRole === "teacher" ? renderTeacherView() : renderStudentView()}

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                contentContainerStyle={styles.modalScrollContent}
              >
                <Text style={styles.modalTitle}>Create New Announcement</Text>
                <Text style={styles.modalSubtitle}>
                  Create a new announcement for your students.
                </Text>

                <Text style={styles.inputLabel}>Announcement Title</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter title"
                  placeholderTextColor="#000"
                  value={announcementTitle}
                  onChangeText={setAnnouncementTitle}
                  maxLength={100}
                />
                <Text style={styles.charCounter}>
                  {announcementTitle?.length}/100 characters
                </Text>

                <Text style={styles.inputLabel}>Course</Text>
                <Text style={styles.lockedCourseText}>
                  {courseTitle || "This course"}
                </Text>

                <Text
                  style={[
                    styles.inputLabel,
                    { marginLeft: 4, marginBottom: 6 },
                  ]}
                >
                  Announcement Message
                </Text>
                <TextInput
                  style={[styles.textInput, styles.messageInput]}
                  placeholder="Enter message"
                  placeholderTextColor="#000"
                  value={announcementMessage}
                  onChangeText={setAnnouncementMessage}
                  multiline
                  maxLength={500}
                />
                <Text style={styles.charCounter}>
                  {announcementMessage.length}/500 characters
                </Text>

                <Pressable
                  style={styles.createButton}
                  onPress={handleCreateAnnouncement}
                  disabled={creatingAnnouncement}
                >
                  {creatingAnnouncement ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.createButtonText}>Create</Text>
                  )}
                </Pressable>
                <Pressable style={styles.cancelButton} onPress={toggleModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// ====================== Styles ======================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  teacherViewContainer: {
    flex: 1,
  },
  studentViewContainer: {
    flex: 1,
  },
  filtersContainer: {
    backgroundColor: "#f5f5f5",
  },
  fixedFiltersContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 20,
    elevation: 20,
  },
  listBelowFilters: {
    zIndex: 1,
    elevation: 1,
  },
  header: {
    minHeight: 56,
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  lockedCourseText: {
    fontSize: 15,
    color: "#374151",
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  // "Add New" now lives in the screen body (top-right of the content area,
  // above the search bar) instead of the navigation header, so it no longer
  // needs to contrast against the green header background.
  addNewRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#10B144",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    marginRight: 4,
    fontSize: 16,
    fontWeight: "bold",
  },
  addButtonLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f0f0f0",
    marginTop: 16,
  },
  sectionArrow: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  flatListContent: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  tableHeaders: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontWeight: "bold",
  },
  headerDate: { flex: 1.5 },
  headerTitleColumn: { flex: 1.5 },
  headerMessage: { flex: 2 },
  headerAction: { width: 30 },
  separator: {
    borderBottomWidth: 1,
    borderColor: "#f5f5f5",
  },
  teacherRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f5f5f5",
    backgroundColor: "transparent",
    paddingHorizontal: 12,
  },
  teacherRowExpanded: {
    backgroundColor: "#fafafa",
  },
  teacherDate: {
    flex: 1.5,
    marginRight: 8,
    fontSize: 13,
    color: "#444",
  },
  teacherTitleContainer: {
    flex: 1.5,
    marginRight: 8,
  },
  teacherTitle: {
    color: "#7b61ff",
    fontWeight: "500",
    fontSize: 13,
  },
  teacherMessageContainer: {
    flex: 2,
    marginRight: 8,
  },
  teacherMessage: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  teacherCourse: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },
  deleteButton: {
    width: 30,
    alignItems: "center",
    paddingTop: 0,
  },
  deleteIcon: {
    color: "#ff4444",
    fontSize: 16,
  },
  studentCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  studentCardHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  studentCardLeft: {
    flex: 1,
  },
  studentCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 20,
  },
  studentCardCourse: {
    fontSize: 18,
    color: "#374151",
  },
  studentCardCourseLabel: {
    fontWeight: "bold",
    fontSize: 18,
  },
  studentCardRight: {
    flexDirection: "row",
    gap: 5,
  },
  studentCardDate: {
    fontSize: 13,
    color: "#6b7280",
    marginRight: 8,
  },
  studentCardArrow: {
    color: "#6b7280",
    fontSize: 13,
  },
  studentCardExpanded: {
    marginTop: 16,
  },
  studentCardMessage: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
  },
  studentCardTime: {
    fontSize: 12,
    color: "#374151",
  },
  studentCardTimeLabel: {
    fontWeight: "bold",
  },
  studentListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "85%",
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubtitle: {
    color: "#666",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  messageInput: {
    height: 100,
    textAlignVertical: "top",
  },
  charCounter: {
    textAlign: "right",
    color: "#666",
    marginBottom: 16,
  },
  searchFilterContainer: {
    paddingHorizontal: 8,
  },
  createButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    marginTop: 32,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 16,
  },
  infoText: {
    color: "#666",
    marginBottom: 16,
  },
});

export default AnnouncementsPage;

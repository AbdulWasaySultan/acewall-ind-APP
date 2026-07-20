import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { useAuth } from "../contexts/AuthContext";
import { getAllCourses } from "../services/course";
import {
  createAnnouncement,
  getAnnouncementsByTeacher,
  deleteAnnouncement,
  getAnnouncementsByStudent,
} from "../services/announcement";
import { useFocusEffect } from "@react-navigation/native";
import CourseSelector from "../components/filters/CourseSelector";
import SearchFilterView from "../components/filters/SearchFilter";
import { FilterBar } from "../components/filters/FilterBar";
import { DropdownFilter } from "../components/filters/DropDown";
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
        {new Date(announcement.createdAt).toLocaleDateString(undefined, {
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
        {expanded && (
          <Text style={styles.teacherCourse}>
            Course: {announcement.course?.courseTitle || "All"}
          </Text>
        )}
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
        <Text style={styles.studentCardCourse}>
          <Text style={styles.studentCardCourseLabel}>Course:</Text>{" "}
          {announcement.course?.courseTitle || "-"}
        </Text>
      </View>
      <View style={styles.studentCardRight}>
        <Text style={styles.studentCardDate}>
          {new Date(announcement.createdAt).toLocaleDateString("en-GB")}
        </Text>
        <Text style={styles.studentCardArrow}>{expanded ? "▲" : "▼"}</Text>
      </View>
    </View>
    {expanded && (
      <View style={styles.studentCardExpanded}>
        <Text style={styles.studentCardMessage}>{announcement.message}</Text>
        <Text style={styles.studentCardTime}>
          <Text style={styles.studentCardTimeLabel}>Time:</Text>{" "}
          {new Date(announcement.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    )}
  </Pressable>
);

// ====================== Main Component ======================

const AnnouncementsPage = () => {
  const [isAnnouncementsExpanded, setIsAnnouncementsExpanded] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { userRole, user } = useAuth();

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<
    string | null
  >(null);
  const [announcementMessage, setAnnouncementMessage] = useState<string>("");

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [dateValue, setDateValue] = useState<string | null>(null);
  const dateItems = [
    { label: "All Dates", value: "all" },
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
  ];

  const [courseOptions, setCourseOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [coursesLoadingModal, setCoursesLoadingModal] = useState(false);
  const [coursesError, setCoursesError] = useState("");
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);

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

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const res = await getAllCourses();
      if (res && Array.isArray(res.courses)) {
        setCourses(res.courses);
      }
    } catch (err: any) {
      console.error("Error fetching courses:", err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCourseChange = async (courseId: string | null) => {
    setSelectedCourse(courseId);
    setDateValue(null);
    setSearchQuery("");
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  };

  const isThisMonth = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const filteredAnnouncements = useMemo(() => {
    let courseFiltered = announcements;
    if (selectedCourse && selectedCourse !== "all") {
      courseFiltered = announcements.filter(
        (a) => a.course?._id === selectedCourse
      );
    }
    return courseFiltered.filter((a: any) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate =
        !dateValue ||
        dateValue === "all" ||
        (dateValue === "today" && isToday(a.createdAt)) ||
        (dateValue === "week" && isThisWeek(a.createdAt)) ||
        (dateValue === "month" && isThisMonth(a.createdAt));
      return matchesSearch && matchesDate;
    });
  }, [announcements, selectedCourse, searchQuery, dateValue]);

  const filteredStudentAnnouncements = useMemo(() => {
    let courseFiltered = studentAnnouncements;
    if (selectedCourse && selectedCourse !== "all") {
      courseFiltered = studentAnnouncements.filter(
        (a) => a.course?._id === selectedCourse
      );
    }
    return courseFiltered.filter((a: any) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate =
        !dateValue ||
        dateValue === "all" ||
        (dateValue === "today" && isToday(a.createdAt)) ||
        (dateValue === "week" && isThisWeek(a.createdAt)) ||
        (dateValue === "month" && isThisMonth(a.createdAt));
      return matchesSearch && matchesDate;
    });
  }, [studentAnnouncements, selectedCourse, searchQuery, dateValue]);

  useEffect(() => {
    console.warn("yehi announcement page ha teacher ke liye");
  }, []);

  useEffect(() => {
    if (userRole === "teacher") {
      fetchAnnouncements();
      fetchCourses();
    }
  }, [userRole]);

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    setAnnouncementsError("");
    try {
      const res = await getAnnouncementsByTeacher();
      setAnnouncements(res.announcements || []);
    } catch (err: any) {
      setAnnouncementsError(err.message || "Failed to load announcements");
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      setCoursesLoadingModal(true);
      setCoursesError("");
      getAllCourses()
        .then((res) => {
          if (res && Array.isArray(res.courses)) {
            setCourseOptions(
              res.courses.map((course) => ({
                label: course.courseTitle,
                value: course._id,
              }))
            );
          } else {
            setCourseOptions([]);
          }
        })
        .catch((err) => {
          setCoursesError("Failed to load courses");
          setCourseOptions([]);
        })
        .finally(() => setCoursesLoadingModal(false));
    }
  }, [isModalVisible]);

  useFocusEffect(
    useCallback(() => {
      if (userRole === "student" && user?._id) {
        setStudentAnnouncementsLoading(true);
        setStudentAnnouncementsError("");
        fetchCourses();

        getAnnouncementsByStudent(user._id)
          .then((res) => {
            setStudentAnnouncements(res.announcements || []);
          })
          .catch((err) => {
            setStudentAnnouncementsError(
              err.message || "Failed to load announcements"
            );
          })
          .finally(() => {
            setStudentAnnouncementsLoading(false);
          });
      }
      return () => { };
    }, [userRole, user?._id])
  );

  const toggleAnnouncements = () => {
    setIsAnnouncementsExpanded(!isAnnouncementsExpanded);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      setAnnouncementTitle("");
      setSelectedCourseForModal(null);
      setAnnouncementMessage("");
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle || !selectedCourseForModal || !announcementMessage)
      return;
    setCreatingAnnouncement(true);
    try {
      await createAnnouncement({
        title: announcementTitle,
        courseId: selectedCourseForModal,
        message: announcementMessage,
      });
      toggleModal();
      fetchAnnouncements();
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
      <View style={styles.fixedFiltersContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Announcements</Text>
          <Pressable style={styles.addButton} onPress={toggleModal}>
            <Text style={styles.addButtonText}>+</Text>
            <Text style={styles.addButtonLabel}>Add New</Text>
          </Pressable>
        </View>

        {/* Wrap FilterBar to apply overflow: visible without changing its own props */}
        <View style={{ overflow: "visible", zIndex: 9999, elevation: 9999 }}>
          <FilterBar
            resultsCount={filteredAnnouncements.length}
            resultsLabel="announcements"
          >
            <CourseSelector
              courses={courses}
              selectedCourse={selectedCourse}
              onCourseChange={handleCourseChange}
              loading={coursesLoading}
            />
          </FilterBar>
        </View>

        {selectedCourse && (
          <FilterBar style={{ paddingHorizontal: 12 }}>
            <SearchFilterView
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search announcements..."
              style={styles.searchFilterContainer}
            />
            <View style={styles.dropdownWrapper}>
              <DropdownFilter
                open={dateOpen}
                value={dateValue}
                items={dateItems}
                setOpen={setDateOpen}
                setValue={setDateValue}
                placeholder="All Dates"
                zIndex={9999}
                zIndexInverse={1000}
                dropDownContainerStyle={styles.dropDownContainer} // <-- added
              />
            </View>
          </FilterBar>
        )}
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
    if (studentAnnouncementsLoading) {
      return (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      );
    }
    if (studentAnnouncementsError) {
      return <Text style={styles.errorText}>{studentAnnouncementsError}</Text>;
    }

    return (
      <View style={styles.studentViewContainer}>
        <View style={styles.fixedFiltersContainer}>
          <Text style={styles.studentPageTitle}>Announcements</Text>

          <View style={{ overflow: "visible", zIndex: 9999, elevation: 9999 }}>
            <FilterBar>
              <CourseSelector
                courses={courses}
                selectedCourse={selectedCourse}
                onCourseChange={handleCourseChange}
                loading={coursesLoading}
              />
            </FilterBar>
          </View>

          <FilterBar style={{ paddingHorizontal: 12 }}>
            <SearchFilterView
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search announcements..."
              style={styles.searchFilterContainer}
            />
            <View style={styles.dropdownWrapper}>
              <DropdownFilter
                open={dateOpen}
                value={dateValue}
                items={dateItems}
                setOpen={setDateOpen}
                setValue={setDateValue}
                placeholder="All Dates"
                zIndex={9999}
                zIndexInverse={1000}
                dropDownContainerStyle={styles.dropDownContainer}
              />
            </View>
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

                <Text style={styles.inputLabel}>Select Course</Text>
                <View style={styles.courseDropdownWrapper}>
                  <DropdownFilter
                    open={courseDropdownOpen}
                    value={selectedCourseForModal}
                    items={courseOptions}
                    setOpen={setCourseDropdownOpen}
                    setValue={setSelectedCourseForModal}
                    placeholder={
                      coursesLoadingModal
                        ? "Loading courses..."
                        : "Select a course"
                    }
                    disabled={coursesLoadingModal || courseOptions.length === 0}
                    zIndex={9999}
                    zIndexInverse={1000}
                    dropDownContainerStyle={styles.dropDownContainer}
                    listMode="MODAL"
                  />
                </View>
                {coursesError ? (
                  <Text style={styles.errorText}>{coursesError}</Text>
                ) : courseOptions.length === 0 && !coursesLoadingModal ? (
                  <Text style={styles.infoText}>No courses available</Text>
                ) : null}

                <Text style={styles.inputLabel}>Announcement Message</Text>
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
    padding: 16,
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
    // backgroundColor: "#f5f5f5",

    zIndex: 20,
    elevation: 20,
  },
  listBelowFilters: {
    zIndex: 1,
    elevation: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    // backgroundColor: "cyan",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    marginRight: 4,
    fontSize: 16,
  },
  addButtonLabel: {
    color: "white",
    fontSize: 16,
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
    borderRadius: 20,
    padding: 32,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderColor: "#e5e8ef",
  },
  studentCardHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  studentCardLeft: {
    flex: 1,
  },
  studentCardTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 22,
  },
  studentCardCourse: {
    fontSize: 18,
    color: "#374151",
  },
  studentCardCourseLabel: {
    fontWeight: "bold",
    fontSize: 18
  },
  studentCardRight: {
    flexDirection: "row",
    gap: 5,
  },
  studentCardDate: {
    fontSize: 15,
    color: "#6b7280",
    marginRight: 8,
  },
  studentCardArrow: {
    color: "#6b7280",
    fontSize: 15,
  },
  studentCardExpanded: {
    marginTop: 16,
  },
  studentCardMessage: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 16,
  },
  studentCardTime: {
    fontSize: 15,
    color: "#374151",
  },
  studentCardTimeLabel: {
    fontWeight: "bold",
  },
  studentListContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  studentPageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
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
  // dropdownWrapper: {
  //   flex: 0.7,
  //   zIndex: 9999,
  //   elevation: 9999,
  // },
  searchFilterContainer: {
    paddingHorizontal: 8, // 👈 Overrides default 10
  },
  dropdownWrapper: {
    width: 110, // 👈 Adjust this width to fit your layout
    zIndex: 9999,
    elevation: 9999,
  },

  // Target the picker container inside the filter bar
  customDateDropdown: {
    width: 130,      // 👈 Custom reduced width for Date filter
    minWidth: 100,   // Overrides default 110 minWidth if needed
  },
  courseDropdownWrapper: {
    zIndex: 9999,
    elevation: 9999,
    marginBottom: 8,
    minHeight: 50,
  },
  belowCourseDropdown: {
    zIndex: 1,
    elevation: 1,
  },
  dropDownContainer: {
    zIndex: 9999,
    elevation: 9999,
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

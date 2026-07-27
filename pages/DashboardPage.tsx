import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";
import {
  RecentActivity,
  CourseStatsResponse,
  PublishedCourse,
} from "../services/dashboard";
import { getStoredUserId } from "../utils/storage";
import Toast from "react-native-simple-toast";
import { getAnnouncementsByStudent } from "../services/announcement";
import { dashboardService } from "../services/dashboard";
import { previewSignIn, previewSignOut } from "../services/schoolService";

// Static data
const staticRecentActivity: RecentActivity[] = [
  // {
  //   id: '1',
  //   message: 'New student enrolled in React Native course',
  //   timestamp: '2 hours ago'
  // },
  // {
  //   id: '2',
  //   message: 'Course "Advanced JavaScript" updated',
  //   timestamp: '5 hours ago'
  // }
];

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// Add this type above the DashboardPage component
interface StudentEnrollment {
  _id: string;
  student: string;
  course: {
    _id: string;
    courseTitle: string;
    category?: { _id: string; title: string };
    thumbnail?: { url: string };
    [key: string]: any;
  };
  enrolledAt?: string;
  [key: string]: any;
}

const DashboardPage = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { userRole, isPreviewMode, enterPreviewMode, exitPreviewMode } =
    useAuth();
  const { setUser: setContextUser } = useUser();
  const [switchingMode, setSwitchingMode] = useState(false);
  const [recentCourses, setRecentCourses] = useState<PublishedCourse[]>([]);
  const [totalCoursesCount, setTotalCoursesCount] = useState<number>(0);
  const [publishedCoursesCount, setPublishedCoursesCount] = useState<number>(0);
  const [unpublishedCoursesCount, setUnpublishedCoursesCount] =
    useState<number>(0);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  // Student-specific state
  const [studentCourses, setStudentCourses] = useState<StudentEnrollment[]>([]);
  const [studentAnnouncements, setStudentAnnouncements] = useState<any[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleTogglePreview = async () => {
    if (switchingMode) return;
    setSwitchingMode(true);
    try {
      if (isPreviewMode) {
        const res = await previewSignOut();
        await exitPreviewMode(res.user);
        setContextUser(res.user);
      } else {
        const res = await previewSignIn();
        await enterPreviewMode(res.user);
        setContextUser(res.user);
      }
    } catch (error: any) {
      console.error(
        "Switch preview mode failed:",
        error?.response?.status,
        error?.response?.data || error?.message || error
      );
      Toast.show(
        isPreviewMode
          ? "Failed to switch back to teacher mode."
          : "Failed to switch to student preview.",
        Toast.LONG
      );
    } finally {
      setSwitchingMode(false);
    }
  };

  const fetchRecentCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await dashboardService.getRecentCourses();
      if (!coursesData) {
        console.log("No course data found");
        setTotalCoursesCount(0);
        setPublishedCoursesCount(0);
        setUnpublishedCoursesCount(0);
        setRecentCourses([]);
        return;
      }
      console.log("coursesData *********", coursesData);

      setTotalCoursesCount(coursesData.total ?? 0);
      setPublishedCoursesCount(coursesData.publishedCount ?? 0);
      setUnpublishedCoursesCount(coursesData.unpublished ?? 0);

      // Filter only published courses and take the first 3
      const limitedCourses = coursesData.published.slice(0, 3).reverse();
      setRecentCourses(limitedCourses);
    } catch (error: any) {
      // console.error("Error fetching recent courses:", error);
      Toast.show("Error fetching recent courses:", Toast.LONG);
      setRecentCourses([]);
      setPublishedCoursesCount(0);
      setUnpublishedCoursesCount(0);
      setTotalCoursesCount(0);
      Alert.alert("Error", "Failed to fetch recent courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentCount = async () => {
    try {
      const count = await dashboardService.getStudentsCount();
      setStudentCount(count);
    } catch (error) {
      console.error("Error fetching student count:", error);
    }
  };

  // Student: fetch announcements and courses
  const fetchStudentDashboard = async () => {
    setStudentLoading(true);
    setStudentError(null);
    try {
      const [courses, announcements] = await Promise.all([
        dashboardService.getStudentCourses(),
        dashboardService.getStudentAnnouncements(),
      ]);
      setStudentCourses(courses);
      setStudentAnnouncements(announcements);
    } catch (err) {
      setStudentError("Failed to load student dashboard data.");
    } finally {
      setStudentLoading(false);
    }
  };

  // Use useFocusEffect to refresh data every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("Dashboard focused - refreshing data...");
      if (userRole === "student") {
        fetchStudentDashboard();
      }
      //If teacher gets login
      else {
        Promise.all([fetchRecentCourses(), fetchStudentCount()]).catch(
          (err) => {
            console.error("Error fetching dashboard data:", err);
          }
        );
      }
    }, [userRole])
  );

  useEffect(() => {
    (async () => {
      const studentId = await getStoredUserId();
      console.log(`StidentId`, studentId);

      if (!studentId) return;

      try {
        const getstudentannouncement = await getAnnouncementsByStudent(
          studentId
        );

        console.log("yehi function ha", getstudentannouncement);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    })();
  }, []);

  if (userRole === "student") {
    const announcementsToShow = studentAnnouncements.slice(0, 4);
    const coursesToShow = studentCourses.slice(0, 3);

    return (
      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {isPreviewMode && (
            <TouchableOpacity
              style={[
                styles.previewCornerButton,
                { marginTop: 5, marginBottom: -10 },
              ]}
              onPress={handleTogglePreview}
              disabled={switchingMode}
            >
              <Text style={styles.previewCornerButtonText}>
                {switchingMode ? "Switching..." : "Switch to Teacher"}
              </Text>
            </TouchableOpacity>
          )}
          {/* Announcements */}
          <View style={[styles.tableCard]}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderTitle}>Announcements</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Announcements")}
              >
                <Text style={styles.tableHeaderAction}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tableBody}>
              {studentLoading ? (
                <Text style={styles.tableEmptyText}>Loading...</Text>
              ) : studentError ? (
                <Text style={styles.tableEmptyText}>{studentError}</Text>
              ) : announcementsToShow.length > 0 ? (
                announcementsToShow.map((a, index) => (
                  <View
                    key={a.id ?? index}
                    style={[
                      styles.tableRow,
                      index === announcementsToShow.length - 1 &&
                        styles.tableRowLast,
                    ]}
                  >
                    <View style={styles.tableRowLeft}>
                      <Text style={styles.tableRowTitle} numberOfLines={1}>
                        {a.title}
                      </Text>
                      <Text style={styles.tableRowSubtitle} numberOfLines={1}>
                        {a.content}
                      </Text>
                    </View>
                    <Text style={styles.tableRowDate}>
                      {formatDate(a.date)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.tableEmptyText}>
                  No announcements to show.
                </Text>
              )}
            </View>
          </View>

          {/* My courses */}
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderTitle}>My courses</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("MyCourses")}
              >
                <Text style={styles.tableHeaderAction}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tableBody}>
              {studentLoading ? (
                <Text style={styles.tableEmptyText}>Loading...</Text>
              ) : coursesToShow.length > 0 ? (
                coursesToShow.map((enrollment, index) => (
                  <TouchableOpacity
                    key={enrollment._id}
                    style={[
                      styles.tableRow,
                      index === coursesToShow.length - 1 && styles.tableRowLast,
                    ]}
                    onPress={() =>
                      navigation.navigate("CourseDetailStudentPageEnrolled", {
                        enrollmentId: enrollment._id,
                        courseId: enrollment.course?._id,
                      })
                    }
                  >
                    <View style={styles.tableRowLeft}>
                      <Text style={styles.tableRowTitle} numberOfLines={1}>
                        {enrollment.course?.courseTitle}
                      </Text>
                    </View>
                    <Text style={styles.tableRowDate}>
                      Enrolled at{"\n"}
                      {formatDate(enrollment.enrolledAt)}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.tableEmptyText}>No courses to show.</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.previewCornerButton}
          onPress={handleTogglePreview}
          disabled={switchingMode}
        >
          <Text style={styles.previewCornerButtonText}>
            {switchingMode ? "Switching..." : "Preview as Student"}
          </Text>
        </TouchableOpacity>
        {/* Cards */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("MyCourses", { filter: "total" })
            }
          >
            <Text style={styles.cardTitle}>Total Courses</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardNumber}>{totalCoursesCount}</Text>
              <View style={styles.iconCircleGreen}>
                <Text style={styles.iconText}>📖</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Students")}
          >
            <Text style={styles.cardTitle}>Students</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardNumber}>{studentCount}</Text>
              <View style={styles.iconCircleBlue}>
                <Text style={styles.iconText}>👥</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              navigation.navigate("MyCourses", { filter: "published" });
            }}
          >
            <Text style={styles.cardTitle}>Published Courses</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardNumber}>{publishedCoursesCount}</Text>
              <View style={styles.iconCircleGreen}>
                <Text style={styles.iconText}>📄</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              navigation.navigate("MyCourses", { filter: "unpublished" });
            }}
          >
            <Text style={styles.cardTitle}>Unpublished Courses</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardNumber}>{unpublishedCoursesCount}</Text>
              <View style={styles.iconCircleRed}>
                <Text style={styles.iconText}>📝</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {staticRecentActivity.length > 0 ? (
          staticRecentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <Text style={styles.activityText}>{activity.message}</Text>
              <Text style={styles.activityTime}>{activity.timestamp}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.sectionSubtitle}>
            No recent activity to show.
          </Text>
        )}

        {/* Recent Courses */}
        <Text style={styles.sectionTitle}>Recent Courses</Text>
        <View style={styles.recentCoursesContainer}>
          {recentCourses.length > 0 ? (
            recentCourses.map((course) => (
              <TouchableOpacity
                key={course._id}
                style={styles.horizontalCourseCard}
                onPress={() =>
                  navigation.navigate("CourseDetails", { courseId: course._id })
                }
              >
                <Image
                  source={{ uri: course.thumbnail.url }}
                  style={styles.horizontalCourseImage}
                  defaultSource={require("../assets/jpg.jpg")}
                />
                <View style={styles.horizontalCourseInfo}>
                  <Text style={styles.horizontalCourseTitle} numberOfLines={1}>
                    {course.courseTitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.sectionSubtitle}>
              No recent courses to show.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  previewCornerButton: {
    alignSelf: "flex-end",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#10B144",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 0,
    marginBottom: 10,
  },
  previewCornerButtonText: {
    color: "#10B144",
    fontWeight: "bold",
    fontSize: 13,
  },
  // customHeader: {
  //   height: 60,
  //   backgroundColor: "#10B144",
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingHorizontal: 16,
  //   elevation: 4,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 2,
  // },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 16,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    width: "95%",
    alignSelf: "center",
    marginVertical: 10,
  },
  scrollView: {
    justifyContent: "space-evenly",
    gap: 25,
    paddingBottom: 20,
    marginTop: 10,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    color: "#444",
    fontSize: 18,
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#222",
  },
  iconCircleGreen: {
    backgroundColor: "#D1FADF",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleBlue: {
    backgroundColor: "#E0EDFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleRed: {
    backgroundColor: "#FEE2E2",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    color: "#111",
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#888",
    marginHorizontal: 16,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    marginTop: 10,
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityText: {
    fontSize: 16,
    color: "#222",
  },
  activityTime: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  saleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  saleIconCircle: {
    backgroundColor: "#FFF7E0",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  saleIcon: {
    fontSize: 18,
  },
  saleTextContainer: {
    flex: 1,
  },
  saleText: {
    fontSize: 16,
    color: "#222",
  },
  bold: {
    fontWeight: "bold",
    color: "#111",
  },
  gray: {
    color: "#888",
  },
  saleTime: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  recentCoursesContainer: {
    marginHorizontal: 0,
    marginBottom: 32,
  },
  horizontalCourseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horizontalCourseImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 16,
  },
  horizontalCourseInfo: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  horizontalCourseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  horizontalCourseCategory: {
    fontSize: 14,
    color: "#888",
  },
  tableCard: {
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#64748b",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  tableHeaderTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  tableHeaderAction: {
    fontSize: 14,
    color: "#e2e8f0",
    fontWeight: "500",
  },
  tableBody: {
    backgroundColor: "#eef1f4",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#dde2e7",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  tableRowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e2430",
    marginBottom: 3,
    flexWrap: "nowrap",
  },
  tableRowSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  tableRowDate: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
  },
  tableEmptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    paddingVertical: 20,
  },
});

export default DashboardPage;

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import SimpleIcon from "../components/SimpleIcon";
import {
  getAllCourses,
  getCategories,
  getSubcategories,
  getCoursesBySubcategory,
  getStudentEnrolledCourses,
  getTeacherCourses,
} from "../services/course";
import Toast from "react-native-simple-toast";
import {
  useFocusEffect,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import DropDownPicker from "react-native-dropdown-picker";
import { useAuth } from "../contexts/AuthContext";
import { useRoute } from "@react-navigation/native";

interface Category {
  _id: string;
  title: string;
}

interface Subcategory {
  _id: string;
  title: string;
  category: {
    _id: string;
    title: string;
  };
}

const MyCoursesPage = () => {
  const { userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCoursesMap, setEnrolledCoursesMap] = useState<
    Map<string, string>
  >(new Map());
  // Category dropdown states
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryItems, setCategoryItems] = useState<any[]>([]);

  // Subcategory dropdown states
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [subcategoryItems, setSubcategoryItems] = useState<any[]>([]);

  const [selectedTab, setSelectedTab] = useState<
    "published" | "unpublished" | "all"
  >("published");

  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const route = useRoute<any>();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      if (response.success && response.data) {
        const formattedCategories = response.data.map((cat) => ({
          label: cat.title,
          value: cat._id,
        }));
        setCategoryItems(formattedCategories);
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      // Toast.show(err.message || 'Failed to fetch categories', Toast.LONG);
    }
  }, []);

  const fetchSubcategories = useCallback(async (categoryId: string) => {
    try {
      console.log(categoryId);
      const response = await getSubcategories(categoryId);
      console.log(response);
      if (response.success && response.data) {
        const formattedSubcategories = response.data.map((subcat) => ({
          label: subcat.title,
          value: subcat._id,
        }));
        setSubcategoryItems(formattedSubcategories);
      }
    } catch (err: any) {
      console.error("Error fetching subcategories:", err);
      Toast.show(err.message || "Failed to fetch subcategories", Toast.LONG);
      setSubcategoryItems([]);
    }
  }, []);

  // getTeacherCourses only reliably supports 4 real combinations:
  //   (published: true,  isVerified: "approved")
  //   (published: false, isVerified: "approved")
  //   (isVerified: "pending")   -> published is ignored by the service, returns ALL pending
  //   (isVerified: "rejected")  -> published is ignored by the service, returns ALL rejected
  // "Total Courses" / "Unpublished Courses" on the Dashboard count courses
  // regardless of verification status, so to match those numbers we fetch
  // all 4 combinations and compose the tab we need client-side, instead of
  // trusting the untested published=undefined "fetch everything" shortcut.
  const fetchTeacherCourses = useCallback(
    async (tab: "published" | "unpublished" | "all", search: string) => {
      const [
        approvedPublishedRes,
        approvedUnpublishedRes,
        pendingRes,
        rejectedRes,
      ] = await Promise.all([
        getTeacherCourses(true, "approved", search),
        getTeacherCourses(false, "approved", search),
        getTeacherCourses(true, "pending", search),
        getTeacherCourses(true, "rejected", search),
      ]);

      const approvedPublished = approvedPublishedRes.courses || [];
      const approvedUnpublished = approvedUnpublishedRes.courses || [];
      const pending = pendingRes.courses || [];
      const rejected = rejectedRes.courses || [];

      const dedupe = (list: any[]) => {
        const map = new Map<string, any>();
        list.forEach((c) => map.set(c._id, c));
        return Array.from(map.values());
      };

      if (tab === "published") {
        return dedupe([
          ...approvedPublished,
          ...pending.filter((c) => c.published === true),
          ...rejected.filter((c) => c.published === true),
        ]);
      }
      if (tab === "unpublished") {
        return dedupe([
          ...approvedUnpublished,
          ...pending.filter((c) => c.published === false),
          ...rejected.filter((c) => c.published === false),
        ]);
      }
      // "all"
      return dedupe([
        ...approvedPublished,
        ...approvedUnpublished,
        ...pending,
        ...rejected,
      ]);
    },
    []
  );

  // Use useFocusEffect to fetch data every time the page comes into focus
  useFocusEffect(
    useCallback(() => {
      // If the Dashboard sent us here with a specific filter (Total /
      // Published / Unpublished Courses card), adopt it as the active tab.
      // Important: we do NOT return early here - the fetch below always
      // has to run, otherwise the page shows no courses until an unrelated
      // re-render happens to trigger it.
      const routeFilter = route.params?.filter as
        | "published"
        | "unpublished"
        | "all"
        | undefined;
      const activeTab = routeFilter ?? selectedTab;

      if (routeFilter) {
        setSelectedTab(routeFilter);
        navigation.setParams({ filter: undefined });
      }

      const fetchData = async () => {
        // Fetch categories for students if not already loaded
        if (userRole === "student" && categoryItems.length === 0) {
          await fetchCategories();
        }

        // Always refresh course data when page comes into focus
        setLoading(true);
        setError(null);
        try {
          if (userRole === "student") {
            // If a subcategory is selected, get courses for that subcategory
            const enrolledResponse = await getStudentEnrolledCourses(
              searchQuery
            );
            const enrolledCourses = enrolledResponse.enrolledCourses || [];
            const newEnrolledCoursesMap: Map<string, string> = new Map(
              enrolledCourses.map((e: any) => [
                String(e.course._id),
                String(e._id),
              ])
            );
            setEnrolledCoursesMap(newEnrolledCoursesMap);

            if (selectedSubcategory) {
              const response = await getCoursesBySubcategory(
                selectedSubcategory,
                searchQuery
              );
              console.log(response);
              setCourses(response.courses || []);
            } else {
              // Otherwise, get the student's enrolled courses
              const enrolledCoursesList =
                enrolledResponse.enrolledCourses?.map((e: any) => e.course) ||
                [];
              setCourses(enrolledCoursesList);
            }
          } else {
            // For teacher/admin, get courses based on the active tab,
            // composed from the real approved/pending/rejected combinations.
            const teacherCourses = await fetchTeacherCourses(
              activeTab,
              searchQuery
            );
            setCourses(teacherCourses);
          }
        } catch (err: any) {
          setError(err.message || "Failed to fetch courses");
          setCourses([]);
          Toast.show(err.message || "Failed to fetch courses", Toast.LONG);
        } finally {
          setLoading(false);
        }
      };

      fetchData();

      return () => {
        // This cleanup runs when the page is unfocused
        // setSearchQuery('');
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setSubcategoryItems([]);
      };
    }, [
      userRole,
      selectedSubcategory,
      searchQuery,
      selectedTab,
      fetchCategories,
      fetchTeacherCourses,
      categoryItems.length,
      route.params?.filter,
      navigation,
    ])
  );

  // Initial load effect
  useEffect(() => {
    const initialLoad = async () => {
      if (userRole === "student" && categoryItems.length === 0) {
        await fetchCategories();
      }
    };
    initialLoad();
  }, [userRole, fetchCategories, categoryItems.length]);

  // Add useEffect to watch for selectedCategory changes and fetch subcategories
  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
    } else {
      setSubcategoryItems([]);
    }
  }, [selectedCategory, fetchSubcategories]);

  const handleCategoryChange = (value: string | null) => {
    if (value !== selectedCategory) {
      setSelectedCategory(value);
      setSelectedSubcategory(null); // Resetting subcategory triggers useEffect to fetch enrolled courses
      setSubcategoryItems([]);
    }
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    if (userRole === "student") {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSubcategoryItems([]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Fetch categories for students if needed
      if (userRole === "student" && categoryItems.length === 0) {
        await fetchCategories();
      }

      // Refresh course data
      let response;
      if (userRole === "student") {
        const enrolledResponse = await getStudentEnrolledCourses(searchQuery);
        const enrolledCourses = enrolledResponse.enrolledCourses || [];
        const newEnrolledCoursesMap: Map<string, string> = new Map(
          enrolledCourses.map((e: any) => [String(e.course._id), String(e._id)])
        );
        setEnrolledCoursesMap(newEnrolledCoursesMap);

        if (selectedSubcategory) {
          response = await getCoursesBySubcategory(
            selectedSubcategory,
            searchQuery
          );
          setCourses(response.courses || []);
        } else {
          const enrolledCoursesList =
            enrolledResponse.enrolledCourses?.map((e: any) => e.course) || [];
          setCourses(enrolledCoursesList);
        }
      } else {
        // For teacher/admin, get courses based on selected tab, composed
        // from the real approved/pending/rejected combinations.
        const teacherCourses = await fetchTeacherCourses(
          selectedTab,
          searchQuery
        );
        setCourses(teacherCourses);
      }

      Toast.show("Courses refreshed successfully!", Toast.SHORT);
    } catch (err: any) {
      setError(err.message || "Failed to refresh courses");
      Toast.show(err.message || "Failed to refresh courses", Toast.LONG);
    } finally {
      setRefreshing(false);
    }
  }, [
    userRole,
    selectedSubcategory,
    searchQuery,
    selectedTab,
    fetchCategories,
    fetchTeacherCourses,
    categoryItems.length,
  ]);

  const filteredCourses = courses;

  return (
    <View style={styles.container}>
      {/* TEACHER UI: Tab Switcher, Search, and Filtered Courses */}
      {userRole === "teacher" && (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View style={styles.tabSwitcherContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  selectedTab === "published" && styles.tabButtonActive,
                ]}
                onPress={() => setSelectedTab("published")}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    selectedTab === "published" && styles.tabButtonTextActive,
                  ]}
                >
                  Published
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  selectedTab === "unpublished" && styles.tabButtonActive,
                ]}
                onPress={() => setSelectedTab("unpublished")}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    selectedTab === "unpublished" && styles.tabButtonTextActive,
                  ]}
                >
                  Unpublished
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <SimpleIcon
              name="search"
              size={20}
              color="#666"
              style={styles.searchSimpleIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ScrollView
            style={styles.courseList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#66bb6a" />
                <Text style={styles.loadingText}>Loading courses...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text>{error}</Text>
              </View>
            ) : filteredCourses.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsTitle}>
                  LET'S EDUCATE THE FUTURE
                </Text>
                <Text style={styles.noResultsSubtitle}>
                  {searchQuery.trim() !== ""
                    ? `No courses found for "${searchQuery}"`
                    : "When you create a course, it will appear here."}
                </Text>
                <TouchableOpacity
                  style={styles.createCourseButton}
                  onPress={() => navigation.navigate("CreateCourse")}
                >
                  <Text style={styles.createCourseButtonText}>
                    Create Courses
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsCount}>
                    {filteredCourses.length} course
                    {filteredCourses.length !== 1 ? "s" : ""} found
                  </Text>
                </View>
                {filteredCourses.map((course) => (
                  <TouchableOpacity
                    key={course._id}
                    style={styles.courseCard}
                    onPress={() =>
                      navigation.navigate("CourseDetails", {
                        courseId: course._id,
                      })
                    }
                  >
                    <Image
                      source={
                        course.thumbnail?.url
                          ? { uri: course.thumbnail.url }
                          : require("../assets/jpg.jpg")
                      }
                      style={styles.courseImage}
                    />
                    <View style={styles.courseInfo}>
                      <Text style={styles.courseCategory}>
                        {course.category?.title?.toUpperCase() ||
                          "UNCATEGORIZED"}
                      </Text>
                      <Text style={styles.courseTitle}>
                        {course.courseTitle}
                      </Text>
                      <Text style={styles.courseTeacher}>
                        Teacher:{" "}
                        {course.createdby
                          ? `${course.createdby.firstName} ${
                              course.createdby.middleName || ""
                            } ${course.createdby.lastName}`.trim()
                          : "Not Assigned"}
                      </Text>
                      <Text style={styles.courseLanguage}>
                        Language: {course.language || "English"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </>
      )}
      {/* STUDENT UI: Category Dropdowns, Search, and Courses */}
      {userRole === "student" && (
        <>
          {/* <View style={styles.dropdownContainer}>
            <DropDownPicker
              open={categoryOpen}
              value={selectedCategory}
              items={categoryItems}
              setOpen={setCategoryOpen}
              setValue={setSelectedCategory}
              setItems={setCategoryItems}
              placeholder="Select Category"
              onChangeValue={handleCategoryChange}
              style={styles.dropdownPicker}
              containerStyle={styles.dropdownContainerStyle}
              zIndex={3000}
              zIndexInverse={1000}
            />
            {selectedCategory && (
              <DropDownPicker
                open={subcategoryOpen}
                value={selectedSubcategory}
                items={subcategoryItems}
                setOpen={setSubcategoryOpen}
                setValue={setSelectedSubcategory}
                setItems={setSubcategoryItems}
                placeholder="Select Subcategory"
                style={styles.dropdownPicker}
                containerStyle={styles.dropdownContainerStyle}
                zIndex={2000}
                zIndexInverse={2000}
              />
            )}
          </View> */}
          <View style={styles.searchContainer}>
            <SimpleIcon
              name="search"
              size={20}
              color="#666"
              style={styles.searchSimpleIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ScrollView
            style={styles.courseList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#66bb6a" />
                <Text style={styles.loadingText}>Loading courses...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text>{error}</Text>
              </View>
            ) : courses.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsTitle}>
                  LET'S EDUCATE THE FUTURE
                </Text>
                <Text style={styles.noResultsSubtitle}>
                  {!selectedSubcategory
                    ? "Please select a category and subcategory to see courses."
                    : searchQuery.trim() !== ""
                    ? `No courses found for "${searchQuery}"`
                    : "There are no courses available at the moment."}
                </Text>
                <View style={styles.bulletPoints}>
                  <Text style={styles.bulletPointItem}>
                    • Check your internet connection
                  </Text>
                  <Text style={styles.bulletPointItem}>
                    • Try refreshing the page
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetSearch}
                >
                  <Text style={styles.resetButtonText}>Reset Search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsCount}>
                    {courses.length} course{courses.length !== 1 ? "s" : ""}{" "}
                    found
                  </Text>
                </View>
                {courses.map((course) => (
                  <TouchableOpacity
                    key={course._id}
                    style={styles.courseCard}
                    onPress={() => {
                      if (enrolledCoursesMap.has(course._id)) {
                        navigation.navigate("CourseDetailStudentPageEnrolled", {
                          enrollmentId: enrolledCoursesMap.get(course._id)!,
                          courseId: course._id,
                        });
                      } else {
                        navigation.navigate("CourseDetailStudentPage", {
                          courseId: course._id,
                        });
                      }
                    }}
                  >
                    <Image
                      source={
                        course.thumbnail?.url
                          ? { uri: course.thumbnail.url }
                          : require("../assets/jpg.jpg")
                      }
                      style={styles.courseImage}
                    />
                    <View style={styles.courseInfo}>
                      <Text style={styles.courseCategory}>
                        {course.category?.title?.toUpperCase() ||
                          "UNCATEGORIZED"}
                      </Text>
                      <Text style={styles.courseTitle}>
                        {course.courseTitle}
                      </Text>
                      <Text style={styles.courseTeacher}>
                        Teacher:{" "}
                        {course.createdby
                          ? `${course.createdby.firstName} ${
                              course.createdby.middleName || ""
                            } ${course.createdby.lastName}`.trim()
                          : "Not Assigned"}
                      </Text>
                      <Text style={styles.courseLanguage}>
                        Language: {course.language || "English"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  dropdownContainer: {
    marginBottom: 16,
    zIndex: 1000,
  },
  dropdownPicker: {
    backgroundColor: "#fff",
    borderColor: "#66bb6a",
    borderRadius: 8,
  },
  dropdownContainerStyle: {
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#66bb6a",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchSimpleIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: "#333",
  },
  courseList: {
    flex: 1,
    paddingHorizontal: 5,
    marginTop: 20,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: "100%",
  },
  courseImage: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
  },
  courseInfo: {
    padding: 15,
  },
  courseCategory: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#5e35b1",
    backgroundColor: "#e8eaf6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  courseTeacher: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  courseLanguage: {
    fontSize: 14,
    color: "#777",
    marginBottom: 4,
  },
  noResultsContainer: {
    alignItems: "center",
    padding: 20,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
  noResultsSubtitle: {
    fontSize: 16,
    color: "#777",
    marginBottom: 15,
    textAlign: "center",
  },
  bulletPoints: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  bulletPointItem: {
    fontSize: 16,
    color: "#777",
    marginBottom: 5,
  },
  resetButton: {
    backgroundColor: "#66bb6a",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  resultsHeader: {
    backgroundColor: "#66bb6a",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  createCourseButton: {
    backgroundColor: "#66bb6a",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createCourseButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  tabSwitcherContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f6fa",
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  tabButtonText: {
    fontSize: 14,
    color: "#222",
    fontWeight: "500",
  },
  tabButtonTextActive: {
    color: "#111",
  },
});

export default MyCoursesPage;

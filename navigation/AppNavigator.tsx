import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from "./navigationRef";

// Import pages
// import LandingPage from '../pages/LandingPage';
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import DashboardPage from "../pages/DashboardPage";
import MyCoursesPage from "../pages/MyCoursesPage";
import CreateCoursePage from "../pages/CreateCoursePage";
import AssessmentsPage from "../pages/AssessmentsPage";
import MyAssessmentsPage from "../pages/MyAssessmentsPage";
import StudentAssessmentsCoursePicker from "../pages/StudentAssessmentsCoursePicker";
import TeacherAssessmentsCoursePicker from "../pages/TeacherAssessmentsCoursePicker";
import StudentAnnouncementsCoursePicker from "../pages/StudentAnnouncementsCoursePicker";
import TeacherAnnouncementsCoursePicker from "../pages/TeacherAnnouncementsCoursePicker";
import AnnouncementsPage from "../pages/AnnouncementsPage";
import MessagesPage from "../pages/MessagesPage";
import TeacherMessagesCoursePicker from "../pages/TeacherMessagesCoursePicker";
import TeacherCourseStudentsPage from "../pages/TeacherCourseStudentsPage";
import StudentsPage from "../pages/StudentsPage";
import NotificationsPage from "../pages/NotificationsPage";
import PurchaseHistoryPage from "../pages/PurchaseHistoryPage";
import TeacherStudentsCoursePicker from "../pages/TeacherStudentsCoursePicker";
import StudentProfilePage from "../pages/StudentProfilePage";
import AccountInformationPage, {
  UserData,
} from "../pages/AccountInformationPage";
import EditCredentialsPage from "../pages/EditCredentialsPage";
import GradebookPage from "../pages/GradebookPage";
import OTPVerificationPage from "../pages/OTPVerificationPage";
import CourseDetailsPage from "../pages/CourseDetailsPage";
import DiscussionsPage from "../pages/DiscussionsPage";
import DiscussionsCoursePicker from "../pages/DiscussionsCoursePicker";
import StudentMeetingsCoursePicker from "../pages/StudentMeetingsCoursePicker";
import StudentMeetingListPage from "../pages/StudentMeetingListPage";
import CourseDetailStudentPage from "../pages/CourseDetailStudentPage";
import CourseDetailStudentPageEnrolled from "../pages/CourseDetailStudentPageEnrolled";
import ChatPage from "../pages/ChatPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import SupportPage from "../pages/SupportPage";
import CreateAssessmentPage from "../pages/CreateAssessmentPage";
import ChapterPagesPage from "../pages/ChapterPagesPage";
import ChapterDiscussionsPage from "../pages/ChapterDiscussionsPage";
import ChapterDetailsStudent from "../pages/ChapterDetailsStudent";
import AssessmentScreenStudent from "../pages/AssessmentScreenStudent";
import DiscussionStudent from "../pages/DiscussionStudent";
import CoursePagesStudent from "../pages/CoursePagesStudent";
import MoreCoursesPage from "../pages/MoreCourses";
import WalletPage from "../pages/WalletPage";
import SpillTheTeaPage from "../pages/SpillTheTeaPage";
import SpillTheTeaProfilePage from "../pages/Spilltheteaprofilepage";
import AIAssistantScreen from "../pages/AIAssistantScreen";
import CourseImportPage from "../pages/ImportCourses";
import CouponsPage from "../pages/CouponsPage";
import { ScheduleMeetingPage } from "../pages/ScheduleMeetingPage";
import StandardGradeScaleManagementPage from "../pages/StandardGradeScaleManagementPage";
import CourseAnalyticsPage from "../pages/CourseAnalyticsPage";
import EnrollmentStatsPage from "../pages/EnrollmentStatsPage";
import TeacherStudentAnalyticsPage from "../pages/TeacherStudentAnalyticsPage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import PaymentCancelPage from "../pages/PaymentCancelPage";
import { Linking } from "react-native";
import { handleDeepLink } from "../utils/deepLinking";

// Define the type for our stack navigator
export type RootStackParamList = {
  // Landing: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  Signup: undefined;
  OTPVerification: { email: string; flow: "signup" | "forgot-password" };
  Main: undefined;
  StudentProfile: { studentId: string };
  AccountInformation: undefined;
  EditCredentials: { userData: UserData };
  CourseDetails: { courseId: string };
  Coupons: { courseId: string };
  StandardGradeScaleManagement: { courseId: string };
  CourseAnalytics: { courseId: string };
  EnrollmentStats: { courseId: string };
  TeacherStudentAnalytics: { courseId: string; studentId: string };
  PaymentSuccess: { sessionId?: string };
  PaymentCancel: { sessionId?: string };
  ScheduleMeeting: { courseId: string };
  CourseDetailStudentPage: { courseId: string; fromAdmin?: boolean };
  Discussions: undefined;
  CourseDetailStudentPageEnrolled: { enrollmentId: string };
  ChapterDetailsStudent: { chapterId: string; navigateBack?: () => void };
  Chat: { conversationId: string; otherMemberName: string };
  ResetPassword: { email: string };
  CreateAssessment: {
    courseId: string;
    chapterId?: string;
    semesterId?: string;
    quarterId?: string;
    refreshAssessments?: () => void;
    navigateBack?: () => void;
  };
  ChapterPages: { courseId: string; chapterId: string };
  ChapterDiscussions: {
    chapterId: string;
    courseId: string;
    semesterId?: string;
    quarterId?: string;
    lessonId?: string;
    discussionId?: string;
    navigateBack?: () => void;
  };
  AssessmentScreenStudent: { assessmentId: string };
  DiscussionStudent: { discussionId: string };
  SpillTheTeaProfile: undefined;
  AIAssistant: undefined;
  StudentAssessmentsByCourse: { courseId: string; courseTitle?: string };
  TeacherAssessmentsByCourse: { courseId: string; courseTitle?: string };
  AnnouncementsByCourse: { courseId: string; courseTitle?: string };
  DiscussionsByCourse: { courseId: string; courseTitle?: string };
  StudentMeetingsByCourse: { courseId: string; courseTitle?: string };
  TeacherMessagesByCourse: { courseId: string; courseTitle?: string };
  StudentsByCourse: { courseId: string; courseTitle?: string };
  PurchaseHistory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const [active, setActive] = useState("Dashboard");
  const { logout, userRole } = useAuth();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Retrieve user data from AsyncStorage
        const userData = await AsyncStorage.getItem("userData");
        console.log("userData", userData);
        if (userData) {
          setUser(JSON.parse(userData)); // Parse and set user data
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerStyle: {
          backgroundColor: "#fff",
          width: 260,
        },
        headerStyle: {
          backgroundColor: "#10B144",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerRight: () => <NotificationBell />,
      }}
      drawerContent={(props: DrawerContentComponentProps) => (
        <Sidebar
          active={active}
          onSelect={(label) => {
            setActive(label);
          }}
          user={user || { name: "no-name", email: "no-email" }}
          navigation={props.navigation}
          onLogout={logout}
        />
      )}
      screenListeners={{
        state: (e) => {
          // Get the current route name
          const currentRoute = e.data.state.routes[e.data.state.index];
          const routeName = currentRoute.name;

          // Map route names to menu labels
          const routeToLabel: { [key: string]: string } = {
            Dashboard: "Dashboard",
            MyCourses: "My Courses",
            CreateCourse: "Create Course",
            Assessments:
              userRole === "student" ? "My Assessments" : "Assessments",
            Announcements: "Announcements",
            ImportCourses: "Import Course",
            spillTheTea: "Spill the Tea",
            AIAssistant: "AI Educational Assistant",
            Messages: "Messages",
            Students: "Students",
            Gradebook: "Gradebook",
            AccountInformation: "Account Information",
            Discussions: "Discussions",
            LiveClasses: "Live Classes",
            Notifications: "Notifications",
            Support: "Support",
            Wallet: "Wallet",
          };

          // Update active state based on current route
          if (routeToLabel[routeName]) {
            setActive(routeToLabel[routeName]);
          }
        },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardPage} />
      <Drawer.Screen
        name="MyCourses"
        component={MyCoursesPage}
        options={{ title: "My Courses" }}
      />
      {userRole === "student" && (
        <Drawer.Screen
          name="MoreCourses"
          component={MoreCoursesPage}
          options={{ title: "More Courses" }}
        />
      )}
      {userRole !== "student" && (
        <>
          <Drawer.Screen
            name="CreateCourse"
            component={CreateCoursePage}
            options={{ title: "Create Course" }}
          />
          <Drawer.Screen
            name="Students"
            component={TeacherStudentsCoursePicker}
          />
        </>
      )}
      {userRole === "student" ? (
        <Drawer.Screen
          name="Assessments"
          component={StudentAssessmentsCoursePicker}
          options={{
            title: "My Assessments",
          }}
        />
      ) : (
        <Drawer.Screen
          name="Assessments"
          component={TeacherAssessmentsCoursePicker}
          options={{
            title: "Assessments",
          }}
        />
      )}
      {userRole === "student" ? (
        <Drawer.Screen
          name="Announcements"
          component={StudentAnnouncementsCoursePicker}
        />
      ) : (
        <Drawer.Screen
          name="Announcements"
          component={TeacherAnnouncementsCoursePicker}
        />
      )}

      <Drawer.Screen
        name="ImportCourses"
        component={CourseImportPage}
        options={{ title: "Import Course" }}
      />

      <Drawer.Screen
        name="spillTheTea"
        component={SpillTheTeaPage}
        options={{ title: "Spill the Tea" }}
      />
      {userRole === "student" ? (
        <Drawer.Screen name="Messages" component={MessagesPage} />
      ) : (
        <Drawer.Screen
          name="Messages"
          component={TeacherMessagesCoursePicker}
        />
      )}
      <Drawer.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{ title: "AI Educational Assistant" }}
      />
      {userRole === "student" && (
        <Drawer.Screen name="Gradebook" component={GradebookPage} />
      )}
      <Drawer.Screen name="Discussions" component={DiscussionsCoursePicker} />
      {userRole === "student" && (
        <Drawer.Screen
          name="Notifications"
          component={NotificationsPage}
          options={{ title: "Notifications" }}
        />
      )}
      {userRole === "student" && (
        <Drawer.Screen
          name="LiveClasses"
          component={StudentMeetingsCoursePicker}
          options={{ title: "Live Classes" }}
        />
      )}
      {userRole === "student" && (
        <Drawer.Screen name="Pages" component={CoursePagesStudent} />
      )}

      <Drawer.Screen
        name="Support"
        component={SupportPage}
        options={{ title: "Support" }}
      />
      {userRole !== "student" && (
        <Drawer.Screen
          name="Wallet"
          component={WalletPage}
          options={{ title: "Wallet" }}
        />
      )}

      <Drawer.Screen
        name="StudentProfile"
        component={StudentProfilePage}
        options={{
          title: "Student Profile",
          drawerItemStyle: { display: "none" }, // Hide from drawer menu
        }}
      />
      <Drawer.Screen
        name="AccountInformation"
        component={AccountInformationPage}
        options={{
          title: "Account Information",
        }}
      />
    </Drawer.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  const pendingDeepLinkUrl = useRef<string | null>(null);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (!url) return;
      if (navigationRef.isReady()) {
        handleDeepLink(url);
      } else {
        pendingDeepLinkUrl.current = url;
      }
    });

    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });
    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        if (pendingDeepLinkUrl.current) {
          handleDeepLink(pendingDeepLinkUrl.current);
          pendingDeepLinkUrl.current = null;
        }
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#10B144",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="OTPVerification"
              component={OTPVerificationPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordPage}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={DrawerNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CourseDetails"
              component={CourseDetailsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Coupons"
              component={CouponsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StandardGradeScaleManagement"
              component={StandardGradeScaleManagementPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CourseAnalytics"
              component={CourseAnalyticsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EnrollmentStats"
              component={EnrollmentStatsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TeacherStudentAnalytics"
              component={TeacherStudentAnalyticsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PaymentSuccess"
              component={PaymentSuccessPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PaymentCancel"
              component={PaymentCancelPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ScheduleMeeting"
              component={ScheduleMeetingPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CourseDetailStudentPage"
              component={CourseDetailStudentPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AssessmentScreenStudent"
              component={AssessmentScreenStudent}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StudentAssessmentsByCourse"
              component={MyAssessmentsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TeacherAssessmentsByCourse"
              component={AssessmentsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AnnouncementsByCourse"
              component={AnnouncementsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DiscussionsByCourse"
              component={DiscussionsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StudentMeetingsByCourse"
              component={StudentMeetingListPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TeacherMessagesByCourse"
              component={TeacherCourseStudentsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StudentsByCourse"
              component={StudentsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PurchaseHistory"
              component={PurchaseHistoryPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CourseDetailStudentPageEnrolled"
              component={CourseDetailStudentPageEnrolled}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChapterDetailsStudent"
              component={ChapterDetailsStudent}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditCredentials"
              component={EditCredentialsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateAssessment"
              component={CreateAssessmentPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChapterPages"
              component={ChapterPagesPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChapterDiscussions"
              component={ChapterDiscussionsPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DiscussionStudent"
              component={DiscussionStudent}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SpillTheTeaProfile"
              component={SpillTheTeaProfilePage}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

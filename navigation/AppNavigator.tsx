import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import Sidebar from "../components/Sidebar";
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
import AnnouncementsPage from "../pages/AnnouncementsPage";
import MessagesPage from "../pages/MessagesPage";
import StudentsPage from "../pages/StudentsPage";
import StudentProfilePage from "../pages/StudentProfilePage";
import AccountInformationPage, {
  UserData,
} from "../pages/AccountInformationPage";
import EditCredentialsPage from "../pages/EditCredentialsPage";
import GradebookPage from "../pages/GradebookPage";
import OTPVerificationPage from "../pages/OTPVerificationPage";
import CourseDetailsPage from "../pages/CourseDetailsPage";
import DiscussionsPage from "../pages/DiscussionsPage";
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
  ScheduleMeeting: { courseId: string };
  CourseDetailStudentPage: { courseId: string; fromAdmin?: boolean };
  Discussions: undefined;
  CourseDetailStudentPageEnrolled: { enrollmentId: string };
  ChapterDetailsStudent: { chapterId: string; navigateBack?: () => void };
  Chat: undefined;
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
          <Drawer.Screen name="Students" component={StudentsPage} />
        </>
      )}
      {userRole === "student" ? (
        <Drawer.Screen
          name="Assessments"
          component={MyAssessmentsPage}
          options={{
            title: "My Assessments",
          }}
        />
      ) : (
        <Drawer.Screen
          name="Assessments"
          component={AssessmentsPage}
          options={{
            title: "Assessments",
          }}
        />
      )}
      <Drawer.Screen name="Announcements" component={AnnouncementsPage} />

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
      <Drawer.Screen name="Messages" component={MessagesPage} />
      <Drawer.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{ title: "AI Educational Assistant" }}
      />
      {userRole === "student" && (
        <Drawer.Screen name="Gradebook" component={GradebookPage} />
      )}
      <Drawer.Screen name="Discussions" component={DiscussionsPage} />
      {userRole === "student" && (
        <Drawer.Screen name="Pages" component={CoursePagesStudent} />
      )}

      {userRole !== "student" && (
        <>
          <Drawer.Screen
            name="Support"
            component={SupportPage}
            options={{ title: "Support" }}
          />
          <Drawer.Screen
            name="Wallet"
            component={WalletPage}
            options={{ title: "Wallet" }}
          />
        </>
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

  return (
    <NavigationContainer ref={navigationRef}>
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

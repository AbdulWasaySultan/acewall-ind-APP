import { Route, Routes } from "react-router-dom";
import PaymentSuccess from "./Page/StudentPortal/payment-success";
import PaymentCancelled from "./Page/StudentPortal/PaymentCancelled";
import Layout from "./Page/StudentPortal/Layout";
import Deshboard from "./Page/StudentPortal/Deshboard";
import Mycourses from "./Page/StudentPortal/Courses/MyCourses";
import Assignment from "./Page/StudentPortal/Assessment/Assignment";
import Login from "./Page/Login";
import Announcement from "./Page/StudentPortal/StudentCourseAnnouncements";
import Account from "./Page/StudentPortal/Account";
import Gradebook from "./Page/StudentPortal/Gradebook";
import SignupPage from "./Page/signup";
import AllCourses from "./Page/AllCourses";
import AllCoursesDetail from "./Page/allCourseDetail";
import MainLayout from "./Page/MainLayout";
import Support from "./Page/Support";
import LandingPage from "./Page/LandingPage";
import Messages from "./Page/StudentPortal/Messages";

import GeneralCourses from "./Page/GeneralCourses";
import GeneralSupport from "./Page/GeneralSupport";
import GeneralCoursesDetail from "./Page/GeneralCourseDetail";
import TeacherDashboard from "./Page/teacher/Dashboard";
import TeacherLayout from "./Page/teacher/Layout";
import TeacherAccount from "./Page/teacher/Account";
import TeacherrAssessment from "./Page/teacher/TeacherAssignment";
import TeacherAnnoucement from "./Page/teacher/TeacherAnnoucement";
import AllStudent from "./Page/teacher/AllStudent";
import StudentProfile from "./Page/teacher/studentProfile";
import TeacherCourses from "./Page/teacher/Courses/TeacherCourses";
import TeacherCourseDetails from "./Page/teacher/Courses/CourseDetail";
import CreateCourses from "./Page/teacher/Courses/CreateCourses";
import CoursesChapter from "./Page/teacher/Courses/CourseChapters";
import TeacherGradebook from "./Page/teacher/Courses/Gradebook";
import TeacherLogin from "./Page/TeacherLogin";
import CreateAssessmentPage from "./Page/teacher/CreateAssessment";
import AdditionalServices from "./Page/AdditionalServices";
import About from "./Page/About";
import ScrollToTop from "./lib/scrolltop";
import ContactUs from "./Page/ContactUs";
import { PrivateRoute, PublicRoute } from "./lib/PrivateRoutes";
import WithdrawRequestForm from "./Page/teacher/Earning/WithdrawRequestForm";

import CoursesBasis from "./Page/teacher/Courses/CoursesBasics";
import { useEffect, useContext } from "react";
import { GlobalContext } from "./Context/GlobalProvider";
import LoadingLoader from "./CustomComponent/LoadingLoader";
import MainDetailPage from "./Page/StudentPortal/Courses/MainDetailPage";
import ChapterDetail from "./Page/StudentPortal/Courses/MyCourseDetail";
import NotFoundPage from "./Page/NotFoundPage";
import { io } from "socket.io-client";
import ChatWindow from "./CustomComponent/MessagesCmp.jsx/chat-window";
import AssessmentSubmissionPage from "./Page/StudentPortal/Assessment/AssessmentSubmissionPage";
import SubmittedAssessment from "./Page/teacher/Assessment/submittedAssessment";
import AssessmentReview from "./Page/teacher/Assessment/submittedAssessment";
import AllSubmission from "./Page/teacher/Assessment/allSubmission";
import VerifyOTP from "./Page/VerifyOTP";
import ForgetPassword from "./Page/forgetPassword";
import VerifyForgetPasswordOTP from "./Page/VerifyForgetPasswordOTP";
import NewPassword from "./Page/NewPassword";
import EditGeneralInfo from "./Page/Account/EditGeneralInfo";
import { EditCredentials } from "./Page/Account/EditCredentials";
import StudentCourseGrades from "./Page/teacher/studentCourseGrades";
import TeacherDiscussion from "./Page/teacher/Discussion/TeacherDiscussisons";
import TeacherDiscussionChat from "./Page/teacher/Discussion/TeacherDiscussionChat";
import StudentDiscussion from "./Page/StudentPortal/Student Discussion/StudentDiscussisons";
import StudentDiscussionChat from "./Page/StudentPortal/Student Discussion/StudentDiscussionChat";
import StdPreview from "./Page/teacher/Courses/StdPreview";
import SemesterDetail from "./Page/teacher/Courses/SemesterDetail";
import QuarterDetail from "./Page/teacher/Courses/QuarterDetail";
import StudentSemesterDetail from "./Page/StudentPortal/Courses/StudentSemesterDetail";
import AllChapter from "./Page/StudentPortal/Courses/AllChapter";
import CourseGradebookPage from "./Page/teacher/CourseGradebookPage";
import ViewCoursePostsPage from "./Page/teacher/ViewCoursePosts";
import StdPagesView from "./Page/StudentPortal/StdPagesView";
import GradeScaleForm from "./Page/teacher/Courses/gradeScale/GradeScale";
import ManageGradeScale from "./Page/teacher/Courses/gradeScale/manageGradeScale";
import Semester from "./Page/teacher/Courses/semester/Semester";
import Earning from "./Page/teacher/Earning/Earning";
import EarningDetail from "./Page/teacher/Earning/EarningDetails";
import EditCourse from "./Page/teacher/Courses/EditCoursesBasics";
import TeacherChapterDetail from "./Page/teacher/Courses/quarter/chapter-detail";
import { AssessmentPage } from "./Page/teacher/Courses/quarter/assessment-dialog";
import UnverifiedCourses from "./Page/teacher/Courses/unverifiedCourse";
import CourseDocumentsEdit from "./Page/teacher/Courses/editCourseDocuments";
import GpaScaleForm from "./Page/teacher/GPA/manageGPA";
import ManageGpaScale from "./Page/teacher/GPA/createNewGPAScale";
import StdPreview2 from "./Page/teacher/Courses/StdPreview2";
import StudentSemesterDetailStdPre from "./Page/teacher/Courses/StudentSemesterDetailStdPre";
import AllChapterStdPre from "./Page/teacher/Courses/AllChapterStdPre";
import ChapterDetailStdPre from "./Page/teacher/Courses/ChapterDetailStdPre";
import AllWithdrawals from "./Page/teacher/Earning/AllWithdrawals";
import VerifyPhoneOTP from "./Page/VerifyPhoneOTP";
import FeaturedPage from "./Page/FeaturedPage";
import TermsPage from "./CustomComponent/TermsPage";
import PrivacyPolicyPage from "./CustomComponent/PrivacyPolicyPage";
import { axiosInstance } from "./lib/AxiosInstance";
import SocialMain from "./Page/StudentPortal/SocialMain";
import SocialProfilePage from "./Page/StudentPortal/SocialProfilePage";
import ManageSBLScale from "./Page/teacher/Courses/Sbl/CreateNewSBLScale";
import SBLScaleForm from "./Page/teacher/Courses/Sbl/ManageSbl";
import AiChatbot from "./Page/StudentPortal/AiChatbot";
import AllStdCourses from "./Page/teacher/AllStdCourses";
import CourseStudents from "./Page/teacher/CourseStudents";
import AllannouncmentCourses from "./Page/teacher/AllannouncmentCourses";
import CourseAssessmentList from "./Page/teacher/CourseAssessmentList";
import AllannouncementCoursesStd from "./Page/StudentPortal/AllannouncmentCoursesStd";
import StudentCourseAnnouncements from "./Page/StudentPortal/StudentCourseAnnouncements";
import StdCourseAssignment from "./Page/StudentPortal/Assessment/StdCourseAssignment";
import Assessment from "./Page/StudentPortal/Assessment/Assignment";
import EnrollmentStats from "./CustomComponent/teacher/EnrollmentStats";
import AllCoursesFilterPage from "./Page/allCoursesPage";
import StudentsList from "./Page/teacher/StudentList";
import AssessmentAnalytics from "./Page/teacher/Assessment/AssessmentAnalytics";
import AllCoursesSub from "./Page/AllCoursesSub";
import AllCoursesDetailSub from "./Page/allCourseDetailSub";
import CourseImportPage from "./Page/teacher/Courses/CourseImportPage";
import StripeSettings from "./Page/teacher/Stripe/StripeSetting";
import OnboardingRefreshPage from "./Page/teacher/Stripe/OnboardingRefreshPage";
import OnboardingSuccessPage from "./Page/teacher/Stripe/OnboardingSuccessPage";
import { TeacherCouponDashboard } from "./Page/teacher/coupenPage";
import CourseAnalytics from "./CustomComponent/Student/CourseAnalytics";
import TeacherStudentAnalytics from "./Page/teacher/TeacherStudentAnalytics";
import ComingSoon from "./Page/ComingSoon";
import PurchaseHistory from "./Page/StudentPortal/purchasesPage";
import ScheduleClassPage from "./Page/teacher/Courses/ScheduleClassPage";
import CoursesWithMeetings from "./Page/StudentPortal/Meetings/CoursesWithMeetings";
import StudentMeetingList from "./Page/StudentPortal/Courses/StudentMeetingList";
import NotificationsPage from "./CustomComponent/NotificationsPage";
import CourseShareRedirect from "./Page/CourseShareRedirect";
import AddLessonPage from "./CustomComponent/CreateCourse/LessonModal";
import CreatePage from "./Page/teacher/Courses/CreatePage";
import CreateDiscussion from "./Page/teacher/Courses/CreateDiscussion";
import AssessmentSetting from "./Page/teacher/Courses/quarter/assessment-setting";
import AssessmentReSubmissionPage from "./Page/StudentPortal/Assessment/AssessmentReSubmissionPage";
import DiscussionSettings from "./Page/teacher/Discussion/discussion-settings";

function App() {
  const {
    checkAuth,
    user,
    Authloading,
    socket,
    setSocket,
    setOnlineUser,
    setUpdatedUser,
    fetchUser,
  } = useContext(GlobalContext);

  useEffect(() => {
    checkAuth();
  }, []);

  console.log(Authloading, "Authloading in App.jsx");

  useEffect(() => {
    if (user) connectsocket();
    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]);

  const connectsocket = () => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
      query: { userId: user?._id || "" },
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (usersIds) => {
      setOnlineUser(usersIds);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  };

  useEffect(() => {
    fetchUser();
  }, [user]);

  if (Authloading) {
    return <LoadingLoader />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public-only accessible pages */}
        <Route path="/" element={<MainLayout />}>
          {/* <Route index element={<MainLayout />} /> This makes / public */}
          <Route index element={<FeaturedPage />} />
          <Route path="courses/:subcategoryId" element={<AllCoursesSub />} />
          <Route path="course/detail/:id" element={<AllCoursesDetailSub />} />
          <Route
            path="course/share/:courseId/:refCode"
            element={<CourseShareRedirect />}
          />
          <Route path="home" element={<LandingPage />} />{" "}
          <Route path="about" element={<About />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacyPolicy" element={<PrivacyPolicyPage />} />
          <Route path="AdditionalServices" element={<AdditionalServices />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Unauthenticated-only (login/signup) */}
        <Route
          element={
            <PublicRoute
              user={user}
              redirectTo={
                user?.role === "teacher" ? "/teacher" : "/student/mycourses"
              }
            />
          }
        >
          <Route path="/login" element={<Login />}></Route>
          <Route path="/TeacherLogin" element={<TeacherLogin />}></Route>
          <Route path="/signup" element={<SignupPage />}></Route>
          <Route path="/verifyOTP/:email" element={<VerifyOTP />} />
          <Route path="/verifyPhoneOTP/:email" element={<VerifyPhoneOTP />} />

          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="/Courses">
              <Route index element={<GeneralCourses />}></Route>
              <Route
                path="detail/:id"
                element={<GeneralCoursesDetail />}
              ></Route>
              <Route path="culinaryArts" element={<AllCoursesDetail />} />
            </Route>
            <Route path="/forgetPassword">
              <Route index element={<ForgetPassword />} />
              <Route
                path="verifyOTP/:email"
                element={<VerifyForgetPasswordOTP />}
              />
              <Route path="resetPassword/:email" element={<NewPassword />} />
            </Route>
            <Route path="/about" element={<About />}></Route>
            <Route path="/Support" element={<GeneralSupport />}></Route>
            <Route path="/contactUs" element={<ContactUs />}></Route>
            <Route path="/*" element={<NotFoundPage />} />
            <Route
              path="/AdditionalServices"
              element={<AdditionalServices />}
            ></Route>
          </Route>
        </Route>

        {/* Student Routes */}
        <Route
          element={
            <PrivateRoute
              user={user}
              allowedRole={["student", "teacherAsStudent"]}
              loading={Authloading}
            />
          }
        >
          <Route path="/student" element={<Layout />}>
            <Route path="payment-success" element={<PaymentSuccess />} />
            <Route path="notifications" element={<NotificationsPage />} />

            <Route path="payment-cancelled" element={<PaymentCancelled />} />
            <Route index element={<Deshboard />} />
            <Route path="meetings" element={<CoursesWithMeetings />} />
            <Route path="mycourses">
              <Route index element={<Mycourses />} />
              <Route path="live-list/:id" element={<StudentMeetingList />} />
              <Route
                path=":courseId/semester/:semesterId"
                element={<StudentSemesterDetail />}
              />
              <Route path=":id" element={<MainDetailPage />} />
              <Route path=":courseId/chapters">
                <Route index element={<AllChapter />} />
                <Route path="chapter/:chapterId" element={<ChapterDetail />} />
              </Route>
            </Route>

            <Route path="assessment">
              <Route index element={<StdCourseAssignment />} />
              <Route path="bycourse/:id" element={<Assessment />} />

              <Route
                path="submission/:id"
                element={<AssessmentSubmissionPage />}
              />

              <Route
                path="Resubmission/:id"
                element={<AssessmentReSubmissionPage />}
              />
            </Route>
            <Route path="gradebook" element={<Gradebook />} />
            <Route path="analytics/:courseId" element={<CourseAnalytics />} />
            <Route path="stdPages" element={<StdPagesView />} />
            <Route
              path="AnnouncementsCoursesStd"
              element={<AllannouncementCoursesStd />}
            />
            <Route
              path="announcements/:courseId"
              element={<StudentCourseAnnouncements />}
            />
            <Route path="ai" element={<AiChatbot />} />

            <Route path="account">
              <Route index element={<Account />} />
              <Route path="editGeneralInfo" element={<EditGeneralInfo />} />
              <Route path="editCredentials" element={<EditCredentials />} />
              <Route path="purchaseshistory" element={<PurchaseHistory />} />
            </Route>
            <Route path="support" element={<Support />} />
            <Route path="ContactUs" element={<ContactUs />} />
            <Route path="courses/:subcategoryId" element={<AllCourses />} />
            <Route path="course/detail/:id" element={<AllCoursesDetail />} />
            <Route path="messages">
              <Route index element={<Messages />} />
              <Route path=":id" element={<ChatWindow />} />
            </Route>
            <Route path="discussions">
              <Route
                path="allCourses"
                element={
                  <AllCoursesFilterPage
                    pagefor="Discussions"
                    link="/student/discussions/course/"
                  />
                }
              />

              <Route path="course/:courseId" element={<StudentDiscussion />} />
              <Route path=":id" element={<StudentDiscussionChat />} />
            </Route>
            <Route path="social" element={<SocialMain />} />
            <Route
              path="social/socialprofile/:userId"
              element={<SocialProfilePage />}
            />
          </Route>
        </Route>

        {/* Teacher Routes */}
        <Route
          element={
            <PrivateRoute
              user={user}
              allowedRole="teacher"
              loading={Authloading}
            />
          }
        >
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route
              path="onboarding-failed"
              element={<OnboardingRefreshPage />}
            />
            <Route
              path="onboarding-success"
              element={<OnboardingSuccessPage />}
            />
            <Route path="account">
              <Route index element={<Account />} />
              <Route path="editGeneralInfo" element={<EditGeneralInfo />} />
              <Route path="editCredentials" element={<EditCredentials />} />
              <Route path="stripeSetting" element={<StripeSettings />} />
            </Route>
            <Route path="schedule/:id" element={<ScheduleClassPage />} />
            <Route path="assessments">
              <Route index element={<TeacherrAssessment />} />
              <Route path="bycourse/:id" element={<CourseAssessmentList />} />
              <Route path="allsubmissions/:id" element={<AllSubmission />} />
              <Route path="analytics/:id" element={<AssessmentAnalytics />} />

              <Route path=":id" element={<AssessmentReview />} />
              <Route
                path="create/:type/:id/:courseId"
                element={<CreateAssessmentPage />}
              />
            </Route>
            <Route
              path="/teacher/courses/:courseId/posts/:type/:typeId"
              element={<ViewCoursePostsPage />}
            />
            <Route
              path="/teacher/courses/:courseId/createPage/:type/:typeId"
              element={<CreatePage />}
            />
            <Route
              path="/teacher/courses/createDiscussion"
              element={<CreateDiscussion />}
            />
            <Route path="wallet">
              <Route index element={<Earning />} />
              <Route path="detail" element={<EarningDetail />} />
              <Route path="withdraw" element={<WithdrawRequestForm />} />
            </Route>
            <Route
              path="announcements/:courseId"
              element={<TeacherAnnoucement />}
            />
            <Route
              path="AnnouncementsCourses"
              element={<AllannouncmentCourses />}
            />

            <Route path="coursesstd" element={<AllStdCourses />} />
            <Route path="allStudent" element={<AllStudent />} />
            <Route path="course/:courseId" element={<CourseStudents />} />
            <Route path="studentProfile/:id" element={<StudentProfile />} />
            <Route
              path="courseGrades/:studentId/:courseId"
              element={<StudentCourseGrades />}
            />
            <Route
              path="/teacher/analytics/:courseId/:studentId"
              element={<TeacherStudentAnalytics />}
            />
            <Route path="conversation">
              <Route
                path="courses"
                element={
                  <AllCoursesFilterPage
                    pagefor="Students"
                    link="/teacher/conversation/students/"
                  />
                }
              />
              <Route path="students/:courseId" element={<StudentsList />} />
            </Route>

            <Route path="messages">
              <Route index element={<Messages />} />
              <Route path=":id" element={<ChatWindow />} />
            </Route>
            <Route
              path="gradebook/:courseId"
              element={<CourseGradebookPage />}
            />

            <Route path="discussions">
              <Route
                path="allCourses"
                element={
                  <AllCoursesFilterPage
                    pagefor="Discussions"
                    link="/teacher/discussions/course/"
                  />
                }
              />
              <Route path="course/:courseId" element={<TeacherDiscussion />} />
              <Route path=":id">
                <Route index element={<TeacherDiscussionChat />} />
                <Route path="settings" element={<DiscussionSettings />} />
              </Route>
            </Route>

            <Route path="courses">
              <Route index element={<TeacherCourses />} />
              <Route path="import" element={<CourseImportPage />} />

              <Route path="unverifiedCourse" element={<UnverifiedCourses />} />

              <Route index element={<TeacherDiscussion />} />

              <Route
                path=":courseId/semesterStdPre/:semesterId"
                element={<StudentSemesterDetailStdPre />}
              />
              <Route path=":courseId/quarterStdPre">
                <Route index element={<AllChapterStdPre />} />
                <Route
                  path="chapterStdPre/:chapterId"
                  element={<ChapterDetailStdPre />}
                />
              </Route>
              <Route
                path="courseDetail/:id"
                element={<TeacherCourseDetails />}
              />
              <Route
                path="editCourseDocument/:id"
                element={<CourseDocumentsEdit />}
              />

              <Route
                path=":courseId/semester/:id"
                element={<SemesterDetail />}
              />
              <Route path=":courseId/chapters" element={<QuarterDetail />} />
              <Route path="chapter/:chapterId">
                <Route index element={<TeacherChapterDetail />} />
                <Route path="createLesson" element={<AddLessonPage />} />
              </Route>
              <Route path="edit/:courseId" element={<EditCourse />} />
              <Route path="course-stats/:id" element={<EnrollmentStats />} />
              <Route path="assessment/:assessmentid">
                <Route index element={<AssessmentPage />} />
                <Route path="setting" element={<AssessmentSetting />} />
              </Route>

              {/* <Route path="stdPreview/:id" element={<StdPreview />} /> */}
              <Route path="stdPreview2/:id" element={<StdPreview2 />} />
              <Route path="createCourses">
                <Route index element={<CoursesBasis />} />
                <Route path="addChapter/:id" element={<CoursesChapter />} />
              </Route>
              <Route path="semester/:courseId" element={<Semester />} />
              <Route path="gradescale/:courseId">
                <Route index element={<GradeScaleForm />} />
                <Route path="managegradescale" element={<ManageGradeScale />} />
              </Route>
              <Route path="gpa/:courseId">
                <Route index element={<GpaScaleForm />} />
                <Route path="managegradescale" element={<ManageGpaScale />} />
              </Route>
              <Route path="Sbl/:courseId">
                <Route index element={<SBLScaleForm />} />
                <Route path="managesblscale" element={<ManageSBLScale />} />
              </Route>

              <Route path="coupon/:courseId">
                <Route index element={<TeacherCouponDashboard />} />
              </Route>
            </Route>
            <Route path="wallet">
              <Route index element={<Earning />} />
              <Route path="detail" element={<EarningDetail />} />
              <Route path="withdraw" element={<WithdrawRequestForm />} />
              <Route path="allwithdrawals" element={<AllWithdrawals />} />
            </Route>
            <Route path="social" element={<SocialMain />} />
            <Route
              path="social/socialprofile/:userId"
              element={<SocialProfilePage />}
            />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;

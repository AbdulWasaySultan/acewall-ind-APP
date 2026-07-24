// Maps a Notification's web route-path `link` to a mobile screen + params.
//
// This is a precise 1:1 port of every `link` format the backend actually
// generates (backend/src/Utiles/notificationService.js — every notify*
// function was audited to build this table). It intentionally matches on
// the exact link PATH SHAPE, not on `type` — several notification types
// share the same `type` value while pointing at completely different
// destinations (e.g. notifyAssessmentAssigned and notifyGradePosted are
// both `type: "assignment"`, but one links to the assessment list and the
// other to the course's analytics/grades view), and some links embed an ID
// that isn't a courseId at all (a discussion's own id, an enrollment id, a
// chapter id). Branching on `type` alone got these wrong; branching on the
// literal link path — same as web itself does, since web just calls
// navigate(link) — does not.
//
// Link shapes handled (source function -> path):
//   notifyNewAnnouncement                    /student/announcements/:courseId
//   notifyAssessmentAssigned                 /student/assessment/bycourse/:courseId
//   notifyGradePosted                        /student/analytics/:courseId
//   notifyNewDiscussion                      /student/discussions/:discussionId
//   notifyDiscussionComment/Reply/Graded     /student|teacher/discussions/:discussionId
//   notifyNewChapter                         /student/mycourses/:courseId/chapters/chapter/:chapterId
//   notifyEnrollmentSuccess                  /student/mycourses/:enrollmentId
//   notifySocialPostComment/notifyNewCoursePost   /student|teacher/social
//   notifyMessageReceived                    /student|teacher/messages
//   notifyReferralPointsUpdated              /student/account
export interface NavigationTarget {
  screen: string;
  params?: Record<string, any>;
}

const ID = "([0-9a-fA-F]{24})";

const PATTERNS: { re: RegExp; build: (m: RegExpMatchArray) => NavigationTarget }[] = [
  {
    re: new RegExp(`^/student/announcements/${ID}`),
    build: (m) => ({ screen: "AnnouncementsByCourse", params: { courseId: m[1] } }),
  },
  {
    re: new RegExp(`^/student/assessment/bycourse/${ID}`),
    build: (m) => ({ screen: "StudentAssessmentsByCourse", params: { courseId: m[1] } }),
  },
  {
    re: new RegExp(`^/student/analytics/${ID}`),
    build: (m) => ({ screen: "CourseAnalytics", params: { courseId: m[1] } }),
  },
  {
    // Must come before the plain /mycourses/:id pattern below (more specific).
    re: new RegExp(`^/student/mycourses/${ID}/chapters/chapter/${ID}`),
    build: (m) => ({ screen: "ChapterDetailsStudent", params: { chapterId: m[2] } }),
  },
  {
    re: new RegExp(`^/student/mycourses/${ID}$`),
    build: (m) => ({ screen: "CourseDetailStudentPageEnrolled", params: { enrollmentId: m[1] } }),
  },
  {
    // Covers new-discussion, comment, reply, and graded notifications — all
    // link straight to the single discussion, not a course-scoped list.
    re: new RegExp(`^/(?:student|teacher)/discussions/${ID}`),
    build: (m) => ({ screen: "DiscussionStudent", params: { discussionId: m[1] } }),
  },
  {
    re: /^\/(?:student|teacher)\/social/,
    build: () => ({ screen: "spillTheTea" }),
  },
  {
    re: /^\/(?:student|teacher)\/messages/,
    build: () => ({ screen: "Messages" }),
  },
  {
    re: /^\/student\/account/,
    build: () => ({ screen: "AccountInformation" }),
  },
];

export const resolveNotificationTarget = (
  notification: { link?: string }
): NavigationTarget | null => {
  const link = notification.link;
  if (!link) return null;

  for (const { re, build } of PATTERNS) {
    const match = link.match(re);
    if (match) return build(match);
  }

  // Unrecognized link shape — no sensible fallback on mobile (no URL bar),
  // so do nothing rather than risk navigating somewhere wrong.
  return null;
};

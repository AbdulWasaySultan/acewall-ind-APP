import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";

// Client-side RBAC guard for teacher-only stack screens (CreateAssessment,
// TeacherStudentAnalytics, EnrollmentStats, StandardGradeScaleManagement,
// StudentsByCourse, TeacherMessagesByCourse). These screens are registered
// unconditionally on the authenticated stack (unlike Drawer menu entries,
// which are already filtered by role) so a student who reaches one via a
// stale nav state or deep link is bounced back to the dashboard instead of
// rendering teacher-only data.
export function withTeacherGuard<P extends object>(
  Component: React.ComponentType<P>
) {
  return function TeacherGuardedScreen(props: P) {
    const { userRole } = useAuth();
    const navigation = useNavigation<any>();
    const isTeacher = userRole !== "student";

    useEffect(() => {
      if (!isTeacher) {
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
      }
    }, [isTeacher, navigation]);

    if (!isTeacher) {
      return null;
    }

    return <Component {...props} />;
  };
}

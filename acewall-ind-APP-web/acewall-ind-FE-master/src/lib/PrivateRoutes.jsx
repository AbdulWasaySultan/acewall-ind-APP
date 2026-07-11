import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({
  user,
  allowedRole,
  redirectTo = "/login",
  loading,
}) => {
  if (loading) return null; // or spinner
  if (!user) return <Navigate to={redirectTo} />;

  const userRole = (user?.role || "").toLowerCase();
  const roles = (Array.isArray(allowedRole) ? allowedRole : [allowedRole]).map(
    (r) => r.toLowerCase()
  );

  if (!roles.includes(userRole)) {
    // Redirect to the correct portal based on actual role
    if (userRole === "teacher") {
      return <Navigate to="/teacher" />;
    } else if (userRole === "student" || userRole === "teacherasstudent") {
      return <Navigate to="/student/mycourses" />;
    }
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

const PublicRoute = ({ user, redirectTo }) => {
  return user ? <Navigate to={redirectTo} /> : <Outlet />;
};

export { PublicRoute, PrivateRoute };
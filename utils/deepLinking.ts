import { navigationRef } from "../navigation/navigationRef";

// Central handler for the app's payment deep links
// (schoolinstance://payment-success?session_id=... / schoolinstance://payment-cancelled,
// see createMobileCheckoutSession in the backend). Registered once at the
// app root (AppNavigator.tsx) via Linking.getInitialURL/addEventListener so
// every deep link source resolves the same way, replacing the old ad-hoc
// per-screen listener in CourseDetailStudentPage.tsx.
export const handleDeepLink = (url: string | null | undefined) => {
  if (!url || !navigationRef.isReady()) return;

  const sessionIdMatch = url.match(/[?&]session_id=([^&]+)/);
  const sessionId = sessionIdMatch ? decodeURIComponent(sessionIdMatch[1]) : undefined;

  if (url.includes("payment-success")) {
    navigationRef.navigate("PaymentSuccess" as never, { sessionId } as never);
  } else if (url.includes("payment-cancelled") || url.includes("payment-failed")) {
    navigationRef.navigate("PaymentCancel" as never, { sessionId } as never);
  }
};

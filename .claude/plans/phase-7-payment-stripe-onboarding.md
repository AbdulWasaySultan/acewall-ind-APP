# Phase 7 (blocked on backend) — Payment success/cancel screens + Stripe Connect onboarding

Both pieces are blocked by the same backend gap: the **live** purchase/payout flow (`createCheckoutSessionConnect`, `stripeOnboarding`) hardcodes `CLIENT_URL` web redirect URLs, not the mobile deep-link scheme. This file specs the mobile-side screens/flows precisely so they're ready to wire up the moment backend adds mobile-aware redirect URLs — build now in a degraded-but-functional mode per the roadmap.

## 7A. Payment success/cancel screens

### Web reference

`payment-success.jsx` and `PaymentCancelled.jsx` (`web-frondend/src/Page/StudentPortal/`).

### Exact web logic (both pages make **no verification API call** — they trust the backend's Stripe webhook already completed the enrollment server-side before the redirect happens)

**Success page**:
```js
useEffect(() => {
  if (!sessionId) {
    toast.error("Missing session ID");
    setStatus("error");
    return;
  }
  toast.success("🎉 Payment confirmed! You are now enrolled.");
  setStatus("success");
  const timer = setTimeout(() => navigate("/student/mycourses"), 3000);
  return () => clearTimeout(timer);
}, [sessionId, navigate]);
```
Three UI states: `processing` (yellow, "Processing your payment..."), `success` (green, "✅ You're enrolled! Redirecting..."), `error` (red, "Something went wrong. Please contact support."). Auto-navigates to My Courses after 3 seconds on success.

**Cancel page**: reads `session_id` if present, shows a toast "Payment not successful!"; static card "Payment Cancelled" + "Your payment has been cancelled. Please try again or contact support if you need assistance." — no auto-navigation, no button at all (user manually navigates away).

### Backend URL scheme already anticipated for mobile

The backend already has a mobile-specific checkout endpoint that builds deep links instead of web URLs:
```js
// createMobileCheckoutSession, backend/src/Contollers/stripe.controller.js
const successURL = `${process.env.MOBILE_APP_SCHEME}://payment-success?session_id={CHECKOUT_SESSION_ID}`;
const cancelURL = `${process.env.MOBILE_APP_SCHEME}://payment-cancelled`;
```
This confirms the intended pattern: mobile registers a deep link handler for `<scheme>://payment-success?session_id=...` and `<scheme>://payment-cancelled`. **The problem**: this URL-building logic lives on `createMobileCheckoutSession` (`POST /api/stripe/create-checkout-session-mobile`), a separate, older, non-Connect endpoint — it does NOT include `transfer_data`/`application_fee_amount`, so it's out of sync with how purchases actually work today via `createCheckoutSessionConnect`. **This is the backend dependency to flag**: someone needs to either add the same `MOBILE_APP_SCHEME`-based URL branching to `createCheckoutSessionConnect` (e.g. behind a `source: "mobile"` request param), or otherwise reconcile the two endpoints, before mobile purchases can deep-link back into the app correctly.

Also worth knowing: if a teacher hasn't completed Stripe onboarding, `createCheckoutSessionConnect` responds `{ neetsOnboarding: true, error: "Teacher payout not enabled" }` — **note the typo `neetsOnboarding`** (not `needsOnboarding`) is the actual field name in the current backend; mobile must check this exact (misspelled) key to detect the condition, not a corrected spelling.

### Steps

1. New screens `pages/PaymentSuccessPage.tsx` / `pages/PaymentCancelPage.tsx`, registered as Stack screens in `AppNavigator.tsx`.
2. **Success screen**: read `session_id` from the deep-link params. If missing, show the error state. Otherwise show the success state (toast/banner "🎉 Payment confirmed! You are now enrolled.") and auto-navigate to `MyCoursesPage` after 3 seconds — replicate the timer exactly, including cleanup on unmount. No backend verification call, matching web (the webhook already did the work).
3. **Cancel screen**: show "Payment Cancelled" + the exact body copy above. No auto-navigation, no action button — matches web's minimal (arguably incomplete) UX; don't "improve" it with an extra button unless you want to intentionally diverge (reasonable to add a "Back to Course" button since mobile has no back-button-in-URL-bar affordance that web implicitly relies on — flag this as an intentional, justified deviation if you add it).
4. **Deep link wiring**: centralize handling via `navigation/navigationRef.ts` so a listener registered outside the component tree can call `navigationRef.navigate('PaymentSuccess'|'PaymentCancel', { sessionId })`. Replace the current ad-hoc `Linking.addEventListener('url', ...)` in `CourseDetailStudentPage.tsx` (currently just fires a `Toast.show`, lines ~48-56) with this navigation-ref-based approach so both the course-detail entry point and this new deep link source share one implementation.
5. **Until the backend redirect fix ships**, this can only be smoke-tested by manually invoking the URL scheme (`adb shell am start -a android.intent.action.VIEW -d "schoolinstance://payment-success?session_id=test123"` on Android, or `xcrun simctl openurl booted "schoolinstance://payment-success?session_id=test123"` on iOS) — the real purchase flow won't produce these links until `createCheckoutSessionConnect` is updated.

## 7B. Stripe Connect onboarding (teacher)

### Web reference

`StripeSetting.jsx` (full settings page) + `StripeOnboardingModal.jsx` (blocking modal shown app-wide to teachers who haven't onboarded) + `OnboardingSuccessPage.jsx` / `OnboardingRefreshPage.jsx` (Stripe's `return_url`/`refresh_url` targets).

### Backend endpoints (all already usable as-is regardless of the redirect-URL issue, since they're called directly, not reached via redirect)

- `PATCH /api/stripe/createAccount` — body `{ email }` → creates a Stripe Express account (`type: "express"`, capabilities `card_payments`+`transfers`, `business_type: "individual"`, pre-filled `business_profile.url` and `product_description`), saves `stripeAccountId` on the user, returns `{ account, message }`.
- `POST /api/stripe/onboarding` — no body → creates `stripe.accountLinks` (`type: "account_onboarding"`), returns `{ url }`. **`refresh_url`/`return_url` are currently hardcoded to `CLIENT_URL/teacher/onboarding-failed` / `CLIENT_URL/teacher/onboarding-success`** — this is the backend blocker; flag it, don't attempt to fix it as part of mobile-only work.
- `POST /api/stripe/checkOnboarding` — body `{ stripeAccountId }` → `{ onboarded, stripeId, chargesEnabled, detailsSubmitted }` (web only reads `onboarded`/`stripeId`; `chargesEnabled`/`detailsSubmitted` are available for a richer mobile status display if desired).
- `GET /api/stripe/getStripeLoginLink` — requires an existing `stripeAccountId` → `{ url }`, a Stripe-hosted Express dashboard login link.

### Exact status logic to replicate (4 mutually exclusive UI states, from `StripeSetting.jsx`)

```
if (loading):        spinner
else if (isOnboard):  "Your payouts are enabled" banner + "Go to Stripe Dashboard" button (-> getStripeLoginLink, open externally)
else if (stripeId):   "Action Required: Enable Payouts" banner (amber) + "Complete Onboarding" button (-> POST onboarding, open the returned url)
else:                 "Create Stripe Account" button (-> PATCH createAccount, then immediately call checkOnboarding with the new id)
```

### Steps

1. Replace `WalletPage.tsx`'s manual "Stripe Account ID" text field with this same 4-state flow. Add `createStripeAccount(email)`, `getStripeOnboardingLink()`, `checkStripeOnboarding(stripeAccountId)`, `getStripeLoginLink()` to `services/wallet.ts`.
2. **On mount**: if the teacher already has a `stripeAccountId` (from their user profile), call `checkStripeOnboarding` to determine which of the 4 states to show.
3. **"Create Stripe Account" button**: `PATCH createAccount` with `{ email: user.email }` → on success, refresh local user/onboarding state (web does a full `window.location.reload()` here — mobile should instead just re-fetch the user profile and call `checkStripeOnboarding` again with the new id, avoiding an unnecessary app reload) → then immediately transition to the "Complete Onboarding" state.
4. **"Complete Onboarding" button**: `POST onboarding` → open the returned `url` (Stripe's hosted onboarding UI) via an in-app browser/WebView (`Linking.openURL` or a WebView screen — a WebView is preferable here so you can intercept navigation to the `return_url`/`refresh_url` and close it programmatically, see step 6).
5. **"Go to Stripe Dashboard" button** (only shown once onboarded): `GET getStripeLoginLink` → open externally.
6. **Return-flow handling (degraded mode until backend adds mobile deep links)**: since `return_url`/`refresh_url` still point at web pages (`CLIENT_URL/teacher/onboarding-success` / `-failed`), don't rely on a deep link firing when onboarding completes. Instead:
   - If using a WebView for step 4, watch its navigation events for a URL containing `/teacher/onboarding-success` or `/teacher/onboarding-failed` and close the WebView as soon as either is hit (don't actually render those web pages to the user).
   - Regardless of WebView vs external browser, poll `checkStripeOnboarding` on `AppState` foreground events (i.e. when the user returns to the app after the browser/WebView closes) rather than trusting a redirect callback — this mirrors `StripeOnboardingModal.jsx`'s own resilience pattern (it polls every 10 seconds while its modal is open and unonboarded, precisely because redirects aren't fully reliable even on web).
7. Consider whether mobile needs the equivalent of `StripeOnboardingModal.jsx` — a blocking "you must onboard before doing X" prompt shown app-wide to teachers. Web shows this unconditionally on every teacher page load. For mobile, a lighter touch (e.g. a persistent banner on the Wallet screen, or a one-time prompt after course creation) is a reasonable, justified deviation — a modal that can't be dismissed is a harsher UX pattern on a phone than on a desktop web app; flag this as a design decision rather than assuming a literal port.

## Verify (once backend adds mobile redirect support)

- Complete a real Stripe test-mode purchase and confirm the app lands on `PaymentSuccessPage`/`PaymentCancelPage` via deep link with the correct `session_id`.
- Complete Stripe Connect onboarding as a teacher (test mode) and confirm `checkOnboarding` reflects `onboarded: true` afterward, transitioning the Wallet screen to the "enabled" state without requiring an app restart.
- Confirm the `neetsOnboarding` (misspelled) flag from `createCheckoutSessionConnect` is correctly detected if a student attempts to purchase a course from a teacher who hasn't onboarded yet.

## Verify (now, before backend changes land)

- Manually trigger the `schoolinstance://payment-success` / `...payment-failed` deep links (via `adb`/`xcrun simctl openurl`) and confirm the screens render correctly and the 3-second success auto-navigation works.
- Walk through Stripe test-mode onboarding via the WebView/browser flow and confirm the app correctly detects completion via foreground-polling, even without a working deep-link redirect.

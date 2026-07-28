> **IMPORTANT INSTRUCTION FOR CLAUDE:** 
> Before writing or modifying any code, **audit the codebase to verify whether any part of these implementations already exists or is partially written.** If an implementation or logic is already present, validate and complete it. Only build from scratch if the functionality is completely missing.

# Critical Mobile Fixes: Checkout Logic & Assessment Settings

This document outlines the required fixes for two functional showstoppers in the React Native mobile application prior to client release: restoring Web payment parity (subscriptions, trials, coupons, and referrals) and wiring up the Teacher Assessment Settings persistence.

---

## Task Overview & Objectives

### 1. Mobile Checkout Parity (Subscriptions, Trials, Coupons & Referrals)
Currently, mobile checkout charges a full one-time fee regardless of course pricing structure, drops trial days, and strips out promotion/referral codes.

* **Target Files:**
  * `mobileapp/services/payment.ts` (or equivalent API service file)
  * `CourseDetailStudentPage.tsx` / `CheckoutModal.tsx` (or checkout screen components)
* **Requirements:**
  1. **Subscription vs. One-time Handling:**
     * Check course pricing metadata. If the course is recurring, send the appropriate subscription creation parameters to the backend payment endpoint instead of forcing a full one-time charge.
  2. **Trial Period Logic:**
     * Check if the course includes a free trial period (e.g., `trialPeriodDays`).
     * Pass `subscription_data[trial_period_days]` or equivalent backend params so billing does not occur immediately.
  3. **Promotions & Referrals:**
     * Add `allow_promotion_codes: true` to enable Stripe/backend coupon inputs on checkout.
     * Ensure any `refCode` captured in app state/route params is passed in the checkout payload for accurate referral tracking.

---

### 2. Teacher's Assessment "Save Settings" Wiring
Currently, the assessment settings modal (late penalty, resubmission toggles) updates local state only, and the "Save Settings" button lacks an `onPress` trigger.

* **Target Files:**
  * Assessment Settings Modal component (e.g., `AssessmentSettingsModal.tsx` or inside `EditAssessmentPage.tsx`)
  * `mobileapp/services/assessment.ts` (or equivalent API service file)
* **Requirements:**
  1. **API Integration:**
     * Verify or create the backend API call function (e.g., `updateAssessmentSettings(assessmentId, payload)`).
  2. **OnPress Handler Wiring:**
     * Connect the "Save Settings" button to an asynchronous `onPress` handler.
     * Gather local state values (`latePenaltyAmount`, `allowResubmission`, `resubmissionDueDate`, etc.) and send them in the API request payload.
  3. **UI Feedback & State Persistence:**
     * Show a loading spinner on the button during submission.
     * Display a success toast/alert upon successful save and close the modal.
     * Refresh or update parent assessment state so changes persist on screen reopen without requiring a manual app refresh.

---

## Acceptance Criteria

- [ ] **Checkout Audit:** Mobile checkout correctly distinguishes between one-time and subscription payments.
- [ ] **Trial Logic:** Courses with trial periods register trial days without instant credit card charging.
- [ ] **Coupons & Referrals:** Coupon input is enabled, and `refCode` is included in the payment API request payload.
- [ ] **Settings Endpoint:** "Save Settings" button triggers an API request and persists assessment settings (late penalties, resubmissions) to the server.
- [ ] **No Redundant Code:** All fixes build upon or complete existing logic where present.
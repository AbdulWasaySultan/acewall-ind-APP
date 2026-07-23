# Phase 3 — Purchase History (student)

## Web reference

`web-frondend/src/Page/StudentPortal/purchasesPage.jsx` — self-contained, no sub-components, no filters/search/pagination at all. Route: `/student/account/purchaseshistory`.

## Backend contract (confirmed complete, ready to use as-is)

`GET /api/stripe/getPurchases` (auth required, uses `req.user._id` server-side — no params needed).

```js
// backend/src/Contollers/stripe.controller.js:1293
const purchases = await Purchase.find({ student: userId })
  .populate("course", "courseTitle thumbnail price")
  .populate("teacher", "name email")
  .sort({ createdAt: -1 });
res.status(200).json({ success: true, data: purchases });
```

Response: `{ success: true, data: Purchase[] }`, already sorted newest-first server-side. **Do not** call `GET /api/purchase/courses` — confirmed dead/legacy code, unused by web.

Each `Purchase` item (fields actually used by the UI, per below): `course.courseTitle`, `course.thumbnail`, `stripeInvoiceId`, `paymentIntentId`, `createdAt`, `currency`, `amount`, `paymentType`, `invoicePdf` (nullable), `receiptUrl` (nullable). `teacher.name`/`teacher.email` are populated by the backend but **not displayed anywhere in web's UI** — skip them in mobile too unless you have a reason to diverge.

## Steps

1. **New service** `services/purchase.ts` (follow `wallet.ts`'s try/catch → friendly-error convention):
   ```ts
   export const getPurchases = async () => {
     const api = await getApiInstance();
     const response = await api.get("/api/stripe/getPurchases");
     return response.data; // { success, data: Purchase[] }
   };
   ```

2. **New screen** `pages/PurchaseHistoryPage.tsx`. Fetch once on mount, no polling/pagination (list is unbounded — matches web, which also has no pagination; if the list grows large enough to be a problem, that's a pre-existing web limitation, not something to solve here).

3. **Header**: static title "Billing & Invoices" + subtitle "View your transactions and manage receipts." Skip the "Default: Stripe" decorative badge unless you want visual parity — it carries no logic.

4. **Per-purchase row/card** — replicate these exact fields and formatting:
   - **Title**: `course?.courseTitle || "Course Material"` (fallback string, exact).
   - **Reference line**: `ID: {(stripeInvoiceId || paymentIntentId)?.slice(0, 12)}...` — always truncate to 12 chars and append a literal `...` regardless of the actual string length (matches web's formatting quirk verbatim).
   - **Date**: locale medium-format date from `createdAt` (RN equivalent: `new Date(createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })` works in Hermes/RN — verify at build time; if unsupported, format manually as e.g. "Jul 24, 2026").
   - **Amount**: `currency.toUpperCase() === "USD" ? "$" : ""` prefix + `amount.toFixed(2)` — only USD gets a `$` symbol, every other currency shows the bare number with no symbol (exact web behavior, don't "improve" it by adding other currency symbols).
   - **Plan badge**: `paymentType` shown uppercase; purple pill styling if the value is `"SUBSCRIPTION"`, green/emerald pill otherwise (covers one-time purchases).
   - **Actions** (only render if the URL field is present, i.e. conditionally per-row):
     - Download icon → opens `invoicePdf` externally (`Linking.openURL`)
     - External-link icon → opens `receiptUrl` externally (`Linking.openURL`)
     - If both are null/absent, show neither action (no placeholder).

5. **Loading state**: 3 skeleton rows (simple pulsing gray placeholders) — matches web's loading skeleton count.

6. **Empty state**: centered credit-card icon (dimmed) + "No transactions found".

7. **Error state**: full-content-replacing banner (not per-row) — "Failed to load purchase history. Please try again later." with a warning icon, matching web's page-level (not row-level) error handling.

8. **Navigation**: web nests this at `/student/account/purchaseshistory` — a sub-page reached from Account, not a top-level sidebar item. Mirror that IA: add an entry point from `pages/AccountInformationPage.tsx` (e.g. a "Purchase History" row/button) navigating to `PurchaseHistoryPage` as a Stack screen (not a Drawer item), rather than adding it to `Sidebar.tsx`'s menu arrays.

## Verify

- As a student with at least one completed purchase, open Account → Purchase History (once wired) and confirm rows render with correct title, truncated ID, formatted date, currency-aware amount, and correct plan badge color/text.
- Confirm Download/receipt links only appear when the corresponding URL exists on that purchase, and open externally when tapped.
- Confirm empty state renders correctly for a student/school with zero purchases.
- Simulate a network failure (e.g. airplane mode) and confirm the page-level error banner renders instead of a crash or blank screen.

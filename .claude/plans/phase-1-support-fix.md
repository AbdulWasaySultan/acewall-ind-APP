# Phase 1 — Fix: Support form unavailable to students

## Problem

Web students can reach Support/Contact from their portal. On mobile, `SupportPage.tsx` exists and is fully functional (form + `sendSupportMessage` service call), but it's registered in the drawer only for non-students, so students never see it in their menu and can't navigate to it.

## Root cause (exact)

`mobileapp/navigation/AppNavigator.tsx` lines 258-271:

```tsx
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
```

`Support` and `Wallet` are bundled in the same role-gate. `Wallet` should stay teacher-only (it's the payout/withdrawal screen — not applicable to students). `Support` should be available to everyone.

`mobileapp/components/Sidebar.tsx`: `studentMenuItems` (lines 71-83) has no `Support` entry; `teacherMenuItems` (lines 54-68) has it at line 66.

## Steps

1. **`navigation/AppNavigator.tsx`** — split the two screens: pull `Support` out to its own unconditional `<Drawer.Screen>`, keep `Wallet` gated.

   Replace lines 258-271:
   ```tsx
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
   ```
   with:
   ```tsx
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
   ```

2. **`components/Sidebar.tsx`** — add a `Support` entry to `studentMenuItems` (currently lines 71-83), matching the existing entry style at line 66:
   ```tsx
   { label: "Support", icon: require("../assets/jpg.jpg") },
   ```
   Place it near `Account Information` (the last item) to match where it's positioned in `teacherMenuItems` (second-to-last, before `Account Information`).

3. **No other changes needed.** `routeToLabel` map (~line 180-181) already has `Support: "Support"` — it's shared across roles, not role-gated, so nothing to add there. `handleNavigation()`'s label→screen name derivation (`label.replace(/ /g, "")`) already produces `"Support"` correctly with no special-casing required — confirm by checking `handleNavigation` (~line 141) doesn't have a competing special case for the string `"Support"`.

## Verify

- Log in as a student.
- Open the drawer, confirm "Support" appears in the menu (near Account Information).
- Tap it, confirm `SupportPage` opens (not a blank screen or navigation error).
- Fill out and submit the support form, confirm it succeeds via `sendSupportMessage` (`services/support.ts`) — same success/error toast behavior as when a teacher submits it today.
- Log in as a teacher, confirm nothing changed for them: Support and Wallet both still appear and work exactly as before.

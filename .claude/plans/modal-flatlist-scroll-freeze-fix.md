# Spec: Fixing "FlatList inside a reopened Modal won't scroll" on Android

Diagnosed and fixed in the `acewall-ind` mobile app (`ChapterDetailsModal.tsx`), for porting into a sibling app (`acewallschool`) hitting the same symptom. Hand this whole file to Claude Code in that project.

## 0. Verify this is actually the same bug before applying the fix blindly

This diagnosis was reached by **adding temporary logging and reading real evidence**, not by guessing — five different plausible-sounding fixes (a settle delay, `UIManager.clearJSResponder()`, a hard remount via `key`, a nested `GestureHandlerRootView`, an animation/`onShow` timing nudge) were tried first and **all failed**, because each was a theory about Modal/Android/navigation/gesture-handler interaction instead of something grounded in evidence. Only the diagnostic-logging step actually found the real cause. If `acewallschool`'s component structure differs meaningfully from `acewall-ind`'s (different Modal nesting, no `flex: 1` chain, etc.), don't assume the same fix applies — **repeat the diagnostic step first** (§3 below) and confirm the same signature (`onLayout` height equals content height) shows up before applying §4's fix. Applying the fix without confirming the cause matches risks repeating the same five-guesses-in-a-row failure mode.

## 1. Symptom

Inside a full-screen `<Modal>` that renders a `FlatList` (e.g. a "Chapter Details" style modal with lessons/assessments):

- **First open**: the modal opens, the list scrolls normally.
- Tap a "+" / action button inside the modal that navigates to another screen (e.g. Add Assessment, Add Page, Add Discussion, Add Lesson) — the modal closes (`visible={false}`) and a new screen is pushed.
- Navigate back to the modal (on-screen back button and/or hardware/gesture back) — the modal reopens (`visible={true}` again), but **the list is now completely unscrollable**. Taps still register; drag/scroll gestures do nothing.
- If the modal has some other elevated/absolutely-positioned child (e.g. a dropdown menu triggered by a button in the modal), opening that dropdown and touching/dragging inside it, then releasing — scrolling on the *main* list starts working again from that point on, until the next navigate-away-and-back cycle, when it freezes again.

## 2. Root cause

This is **not** a Modal/Android-window issue, a `react-native-gesture-handler` issue, a stale native-responder issue, or an animation-timing issue — despite all of those being very plausible-sounding explanations (and the ones initially tried and ruled out). It is a plain **Yoga (React Native's layout engine) nested-`flex: 1` measurement bug**:

- The Modal's content is laid out through a chain of `flex: 1` containers, e.g. `Modal` → outer `View` (`flex: 1`) → inner content `View` (`flex: 1`) → `FlatList` (`flex: 1` via its own style). None of these has an explicit numeric height; each just fills its parent via `flex: 1`.
- On the **very first render after the modal becomes visible again**, Yoga has to resolve that whole `flex: 1` chain in one pass. In the broken case, it resolves ambiguously: the FlatList's own `onLayout` reports a `height` **equal to its content height**, not the real available screen height — i.e. it briefly measures itself as "exactly as tall as its content," so internally it concludes there's nothing to scroll.
- A **second** layout pass (triggered by literally anything that forces a re-render/re-layout further up the tree — e.g. opening that dropdown, which changes a prop several levels above the FlatList) resolves correctly, reporting the real, smaller viewport height. From that point on scrolling works perfectly, because the FlatList's internal scroll metrics are now correct.
- **Why first-open is fine but reopen isn't**: on first open, the modal's data (e.g. `chapterDetails`) is usually still loading and arrives asynchronously a beat after `visible` becomes `true` — that data arriving triggers an extra render/layout pass "for free," which happens to fix the ambiguous first pass before the user ever notices. On reopen, the data is already loaded from before (no refetch), so there's only ever the *one* (wrong) layout pass, and nothing else happens to trigger a second one — until the user does something like opening a dropdown.

## 3. How to confirm this is the same bug (diagnostic step)

Before applying the fix, add temporary logging to the FlatList in the affected modal:

```tsx
<FlatList
  // ...existing props...
  onLayout={(e) =>
    console.log("[SCROLL-DEBUG] onLayout", JSON.stringify(e.nativeEvent.layout), Date.now())
  }
  onContentSizeChange={(w, h) =>
    console.log("[SCROLL-DEBUG] onContentSizeChange", { w, h }, Date.now())
  }
  onTouchStart={() => console.log("[SCROLL-DEBUG] onTouchStart", Date.now())}
  onScrollBeginDrag={() => console.log("[SCROLL-DEBUG] onScrollBeginDrag", Date.now())}
  onScroll={(e) =>
    console.log("[SCROLL-DEBUG] onScroll offsetY=", e.nativeEvent.contentOffset.y, Date.now())
  }
  scrollEventThrottle={100}
/>
```

Reproduce: open the modal fresh (baseline), navigate away and back, then try to scroll (frozen state), then do whatever "unsticks" it (e.g. open a dropdown), then try scrolling again. Compare the `onLayout` height logged right after reopening against `onContentSizeChange`'s height logged around the same time.

- **Match confirmed** (first `onLayout` height ≈ content height, and `onTouchStart` fires but `onScrollBeginDrag` never does until a second `onLayout` appears with a smaller, correct height) → this is the same bug; apply §4.
- **No match** (e.g. `onLayout` height already looks correct, or touches never even reach `onTouchStart` while frozen) → this is a *different* bug wearing similar clothes; don't apply §4 blindly — the touch-dispatch-never-arrives signature would point back toward the (in `acewall-ind`, ruled-out) gesture-handler/responder theories instead, which would need their own investigation for whatever's different in this app's setup.

Remove the diagnostic logging once done either way.

## 4. The fix

Stop relying on the ambiguous `flex: 1` chain for the modal's outer containers — give them an **explicit height** instead, using `useWindowDimensions()`. This removes the ambiguity Yoga needed a second pass to resolve, so the very first layout pass is correct every time, on both first-open and reopen.

```tsx
import { useWindowDimensions } from "react-native";

const YourModal = (props) => {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  return (
    <Modal visible={props.visible} transparent={false} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.outerContainer, { height: screenHeight }]}>
        <View style={[styles.content, { height: screenHeight, paddingTop: insets.top + 20 }]}>
          {/* header, etc. */}
          <FlatList
            style={styles.list}
            data={items}
            // ...
          />
        </View>
      </View>
    </Modal>
  );
};
```

Key points:

- Apply the explicit `height: screenHeight` to **every** ancestor `View` between the `Modal` and the `FlatList` that currently relies on `flex: 1` for its height (not just the outermost one — the ambiguity can live at any level in the chain).
- The `FlatList` itself can keep `flex: 1` in its own style (that's fine and normal) — it's the *ancestor containers* whose height needs to stop being ambiguous.
- This has nothing to do with animation type, gesture handlers, or navigation timing — don't reintroduce workarounds for those (settle delays, `clearJSResponder()`, forced remounts, nested `GestureHandlerRootView`, `onShow` nudges) as part of this fix. They don't address the actual cause and just add complexity. If `acewallschool` already has any of those from earlier attempts at this same bug, they can likely be removed once this fix is confirmed working (see §5).

## 5. Cleanup

If earlier fix attempts for this same symptom already exist in `acewallschool`'s codebase (delay-based reopen logic, `clearJSResponder()` calls, forced remounts via changing `key`, extra `GestureHandlerRootView` wrappers, `Modal onShow` handlers with `scrollToOffset` nudges, `animationType="none"` overrides for Android), they were addressing the wrong root cause. Once §4's fix is verified working, those can be safely removed — but do this as a **separate, verified step** (confirm the real fix works first, then remove the old workarounds one at a time, retesting after each removal), not all at once, in case any of them turned out to be masking something else incidentally.

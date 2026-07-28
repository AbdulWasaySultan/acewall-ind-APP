import React from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AnimatedBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: number;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

// Reusable "Global Standard" picker sheet: slides up from the bottom over a
// dimmed, tap-to-dismiss backdrop, instead of a plain fade-in Modal.
//
// This intentionally uses RN's own `animationType="slide"` with `visible`
// bound straight to the prop, rather than a hand-rolled Animated.Value
// close animation that keeps the native Modal mounted after `visible` goes
// false. That approach caused two native Modals to briefly overlap
// whenever a caller closed this sheet and opened another Modal in response
// to the same interaction (e.g. "pick an option, then open the next
// step"), which reliably breaks touch handling on the screen underneath.
// Binding `visible` directly avoids the whole bug class: the native Modal
// mounts/unmounts synchronously with the prop, same as a plain Modal.
const AnimatedBottomSheet: React.FC<AnimatedBottomSheetProps> = ({
  visible,
  onClose,
  children,
  maxHeight,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom || 16,
              maxHeight: maxHeight ?? SCREEN_HEIGHT * 0.75,
            },
          ]}
        >
          <View style={styles.handle} />
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    alignSelf: "center",
    marginBottom: 12,
  },
});

export default AnimatedBottomSheet;

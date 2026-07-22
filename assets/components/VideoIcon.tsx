import React from "react";
import { View, StyleSheet } from "react-native";
import { Video } from "lucide-react-native";

export const VideoIcon = () => {
  return (
    <View style={styles.iconContainer}>
      {/* #2563eb is the exact hex code for Tailwind's text-blue-600 */}
      <Video color="#2563eb" size={20} />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: "#dbeafe", // bg-blue-100 equivalent
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

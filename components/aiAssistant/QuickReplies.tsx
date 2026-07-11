// QuickReplies.tsx
// Horizontal scrollable pill-shaped quick reply suggestion chips

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

interface QuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
  disabled?: boolean;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({
  replies,
  onSelect,
  disabled = false,
}) => {
  if (replies.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {replies.map((reply, index) => (
          <TouchableOpacity
            key={`${reply}-${index}`}
            style={[styles.chip, disabled && styles.chipDisabled]}
            onPress={() => !disabled && onSelect(reply)}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={[styles.chipText, disabled && styles.chipTextDisabled]}
            >
              {reply}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  scroll: {
    paddingHorizontal: 16,
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  chipText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  chipDisabled: {
    opacity: 0.5,
    borderColor: "#d1d5db",
  },
  chipTextDisabled: {
    color: "#9ca3af",
  },
});

export default QuickReplies;

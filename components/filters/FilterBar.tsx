// FilterBar.tsx
import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";


// ========== FilterBar Component ==========
interface FilterBarProps {
  children: React.ReactNode;
  resultsCount?: number;
  resultsLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  resultsCount,
  resultsLabel = "items",
  style,
}) => {
  return (
    <View style={[styles.filterBar, style]}>
      <View style={styles.filtersRow}>{children}</View>
      {resultsCount !== undefined && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {resultsCount} {resultsLabel} found
          </Text>
        </View>
      )}
    </View>
  );
};



// ========== Styles ==========
const styles = StyleSheet.create({
  // FilterBar styles
  filterBar: {
    // backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    // justifyContent: 'space-around'
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  resultsContainer: {
    marginTop: 12,
    backgroundColor: "#10B144",
    padding: 8,
    borderRadius: 6,
  },
  resultsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});

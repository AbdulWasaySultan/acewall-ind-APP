// FilterBar.tsx
import React, { SetStateAction } from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

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

// ========== DropdownFilter Component ==========
interface DropdownFilterProps {
  open: boolean;
  value: string | null;
  items: { label: string; value: string }[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setValue: React.Dispatch<SetStateAction<string | null>>;
  placeholder: string;
  zIndex: number;
  zIndexInverse?: number;
  disabled?: boolean;
  dropDownContainerStyle?: StyleProp<ViewStyle>;
  dropDownDirection?: "AUTO" | "TOP" | "BOTTOM";
  listMode?: "MODAL" | "SCROLLVIEW"; // optional
}

export const DropdownFilter: React.FC<DropdownFilterProps> = ({
  open,
  value,
  items,
  setOpen,
  setValue,
  placeholder,
  zIndex,
  zIndexInverse = 0,
  disabled = false,
  dropDownContainerStyle,
  dropDownDirection = "BOTTOM",
  listMode = "SCROLLVIEW", // default, so it doesn't cover full screen
}) => {
  return (
    <View style={styles.dropdownWrapper}>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={() => {}}
        placeholder={placeholder}
        disabled={disabled}
        style={styles.dropdownPicker}
        containerStyle={styles.dropdownContainerStyle}
        dropDownContainerStyle={[
          styles.dropdownListStyle,
          dropDownContainerStyle,
        ]}
        zIndex={zIndex}
        zIndexInverse={zIndexInverse}
        dropDownDirection={dropDownDirection}
        listMode={listMode}
      />
    </View>
  );
};

// ========== Styles ==========
const styles = StyleSheet.create({
  // FilterBar styles
  filterBar: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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

  // DropdownFilter styles
  dropdownWrapper: {
    flex: 1,
    minWidth: 150,
  },
  dropdownPicker: {
    backgroundColor: "#fff",
    borderColor: "#10B144",
    borderRadius: 8,
  },
  dropdownContainerStyle: {
    // height: 50,
    zIndex: 9999,
  },
  dropdownListStyle: {
    borderColor: "#10B144",
  },
});

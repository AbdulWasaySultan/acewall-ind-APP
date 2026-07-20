import React from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ViewStyle,
  StyleProp,
} from "react-native";
import SimpleIcon from "../SimpleIcon";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

const SearchFilterView: React.FC<SearchFilterProps> = ({
  value,
  onChange,
  style,
  placeholder = "Search...",
}) => {
  return (
    <View style={[styles.container, style]}>
      <SimpleIcon
        name="search"
        size={18}
        color="#666"
        style={styles.searchIcon}

      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#10B144",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    flex: 1.4
  },
  searchIcon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});

export default SearchFilterView;

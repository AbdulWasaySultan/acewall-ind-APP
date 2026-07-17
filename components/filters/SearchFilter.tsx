import React from "react";
import { View, StyleSheet, TextInput } from "react-native";
import SimpleIcon from "../SimpleIcon";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  value,
  onChange,
  placeholder = "Search...",
}) => {
  return (
    <View style={styles.container}>
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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#10B144",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});

export default SearchFilter;

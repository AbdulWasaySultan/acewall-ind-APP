import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';

const MyAssessmentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.assessmentHeaderRow}>
        <Text style={[styles.assessmentHeaderText, styles.assessmentNameColumn]}>Assessment Name</Text>
        <Text style={[styles.assessmentHeaderText, styles.courseColumn]}>Course</Text>
        <Text style={[styles.assessmentHeaderText, styles.dueDateColumn]}>Due Date</Text>
        <Text style={[styles.assessmentHeaderText, styles.statusColumn]}>Status</Text>
        <Text style={[styles.assessmentHeaderText, styles.typeColumn]}>Type</Text>
      </View>

      <View style={styles.noAssessmentsContainer}>
        <Text style={styles.noAssessmentsText}>No assessments available.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  assessmentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 12,
  },
  assessmentHeaderText: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
  },
  assessmentNameColumn: {
    flex: 2,
    textAlign: 'left',
  },
  courseColumn: {
    flex: 1.5,
  },
  dueDateColumn: {
    flex: 1.5,
  },
  statusColumn: {
    flex: 1,
  },
  typeColumn: {
    flex: 1,
  },
  noAssessmentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noAssessmentsText: {
    fontSize: 16,
    color: '#666',
  },
});

export default MyAssessmentsPage; 
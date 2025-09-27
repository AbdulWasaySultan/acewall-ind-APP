import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getOverallGradeReport } from '../services/gradebook';

const GradebookPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getOverallGradeReport();
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch grade report');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.performanceCard}>
          <Text style={styles.performanceTitle}>Overall Academic Performance</Text>
          <View style={styles.performanceRow}>
            <Text style={styles.gpaLabel}>Overall GPA</Text>
            <Text style={styles.gpaValue}>{data ? data.overallGPA.toFixed(2) : '0.00'}</Text>
            <Text style={styles.coursesCount}>{data ? `${data.courses.length} Courses` : '0 Courses'}</Text>
          </View>
        </View>
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableHeader}>Course</Text>
            <Text style={styles.tableHeader}>Average</Text>
            <Text style={styles.tableHeader}>Grade</Text>
          </View>
          {loading ? (
            <ActivityIndicator style={{ marginVertical: 32 }} />
          ) : error ? (
            <Text style={styles.noDataText}>{error}</Text>
          ) : data && data.courses && data.courses.length > 0 ? (
            data.courses.map((course: any) => (
              <View key={course._id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{course.courseName}</Text>
                <Text style={styles.tableCell}>{course.average?.toFixed(2) ?? '-'}</Text>
                <Text style={styles.tableCell}>{course.grade?.toFixed(2) ?? '-'}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.noDataText}>
                No courses or assessments found matching your search.
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  performanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  performanceTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#10B144',
    marginBottom: 12,
    textAlign: 'left',
  },
  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  gpaLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  gpaValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10B144',
    marginLeft: 8,
  },
  coursesCount: {
    fontSize: 16,
    color: '#7b8794',
    marginLeft: 'auto',
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 0,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#fafbfc',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeader: {
    flex: 1,
    fontWeight: 'bold',
    color: '#7b8794',
    fontSize: 16,
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tableCell: {
    flex: 1,
    color: '#222',
    fontSize: 16,
    textAlign: 'left',
  },
  noDataText: {
    color: '#222',
    textAlign: 'center',
    fontSize: 16,
    flex: 1,
    paddingVertical: 24,
  },
});

export default GradebookPage; 
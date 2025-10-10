// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
// import { getOverallGradeReport } from '../services/gradebook';

// const GradebookPage = () => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [data, setData] = useState<any>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await getOverallGradeReport();
//         setData(res);
//       } catch (err: any) {
//         setError(err.message || 'Failed to fetch grade report');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.content}>
//         <View style={styles.performanceCard}>
//           <Text style={styles.performanceTitle}>Overall Academic Performance</Text>
//           <View style={styles.performanceRow}>
//             <Text style={styles.gpaLabel}>Overall GPA</Text>
//             <Text style={styles.gpaValue}>{data ? data.overallGPA.toFixed(2) : '0.00'}</Text>
//             <Text style={styles.coursesCount}>{data ? `${data.courses.length} Courses` : '0 Courses'}</Text>
//           </View>
//         </View>
//         <View style={styles.tableCard}>
//           <View style={styles.tableHeaderRow}>
//             <Text style={styles.tableHeader}>Course</Text>
//             <Text style={styles.tableHeader}>Average</Text>
//             <Text style={styles.tableHeader}>Grade</Text>
//           </View>
//           {loading ? (
//             <ActivityIndicator style={{ marginVertical: 32 }} />
//           ) : error ? (
//             <Text style={styles.noDataText}>{error}</Text>
//           ) : data && data.courses && data.courses.length > 0 ? (
//             data.courses.map((course: any) => (
//               <View key={course._id} style={styles.tableRow}>
//                 <Text style={styles.tableCell}>{course.courseName}</Text>
//                 <Text style={styles.tableCell}>{course.average?.toFixed(2) ?? '-'}</Text>
//                 <Text style={styles.tableCell}>{course.grade?.toFixed(2) ?? '-'}</Text>
//               </View>
//             ))
//           ) : (
//             <View style={styles.tableRow}>
//               <Text style={styles.noDataText}>
//                 No courses or assessments found matching your search.
//               </Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   content: {
//     padding: 16,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 16,
//   },
//   performanceCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 24,
//     marginBottom: 24,
//     borderWidth: 1,
//     borderColor: '#eee',
//     shadowColor: '#000',
//     shadowOpacity: 0.04,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   performanceTitle: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#10B144',
//     marginBottom: 12,
//     textAlign: 'left',
//   },
//   performanceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
//   gpaLabel: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#222',
//   },
//   gpaValue: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#10B144',
//     marginLeft: 8,
//   },
//   coursesCount: {
//     fontSize: 16,
//     color: '#7b8794',
//     marginLeft: 'auto',
//   },
//   tableCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#eee',
//     padding: 0,
//     overflow: 'hidden',
//   },
//   tableHeaderRow: {
//     flexDirection: 'row',
//     backgroundColor: '#fafbfc',
//     borderBottomWidth: 1,
//     borderColor: '#eee',
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//   },
//   tableHeader: {
//     flex: 1,
//     fontWeight: 'bold',
//     color: '#7b8794',
//     fontSize: 16,
//     textAlign: 'left',
//   },
//   tableRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 8,
//     borderBottomWidth: 1,
//     borderColor: '#eee',
//   },
//   tableCell: {
//     flex: 1,
//     color: '#222',
//     fontSize: 16,
//     textAlign: 'left',
//   },
//   noDataText: {
//     color: '#222',
//     textAlign: 'center',
//     fontSize: 16,
//     flex: 1,
//     paddingVertical: 24,
//   },
// });

// export default GradebookPage; 

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getOverallGradeReport } from '../services/gradebook';

const GradebookPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

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

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const getLetterGrade = (average: number) => {
    if (average >= 90) return 'A';
    if (average >= 80) return 'B';
    if (average >= 70) return 'C';
    if (average >= 60) return 'D';
    return 'F';
  };

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

        <View style={styles.courseDetailsCard}>
          <View style={styles.courseDetailsHeader}>
            <Text style={styles.courseDetailsTitle}>Course Details</Text>
            <Text style={styles.pageInfo}>Page 1 of 1</Text>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 32 }} />
          ) : error ? (
            <Text style={styles.noDataText}>{error}</Text>
          ) : data && data.courses && data.courses.length > 0 ? (
            data.courses.map((course: any) => (
              <View key={course._id} style={styles.courseItem}>
                <View style={styles.courseHeaderRow}>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseLabel}>Course</Text>
                    <Text style={styles.courseName}>{course.courseName}</Text>
                  </View>
                  <View style={styles.semesterInfo}>
                    <Text style={styles.courseLabel}>Semesters</Text>
                    <Text style={styles.semesterText}>1 semester</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleCourse(course._id)}
                  >
                    <Text style={styles.actionText}>
                      {expandedCourses.has(course._id) ? '▲ Hide Details' : '▼ Show Details'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {expandedCourses.has(course._id) && (
                  <View style={styles.courseDetails}>
                    <View style={styles.semesterSection}>
                      <Text style={styles.semesterTitle}>sem 1</Text>
                      <Text style={styles.quarterBadge}>▼ 1 Quarter</Text>
                    </View>

                    <View style={styles.quarterCard}>
                      <View style={styles.quarterHeader}>
                        <Text style={styles.quarterTitle}>Q1</Text>
                        <View style={styles.gradeInfo}>
                          <Text style={styles.gradeLabel}>Grade: </Text>
                          <Text style={styles.gradeValue}>{course.average?.toFixed(2)}%</Text>
                          <Text style={styles.gpaLabel}>GPA: </Text>
                          <Text style={styles.gpaNumber}>{course.grade?.toFixed(1) || '0.0'}</Text>
                          <View style={[styles.letterGrade,
                          course.average >= 60 ? styles.letterGradePass : styles.letterGradeFail]}>
                            <Text style={styles.letterGradeText}>
                              {getLetterGrade(course.average || 0)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.assessmentTable}>
                        <View style={styles.assessmentHeaderRow}>
                          <Text style={[styles.assessmentHeader, styles.assessmentNameCol]}>Assessment</Text>
                          <Text style={[styles.assessmentHeader, styles.assessmentTopicsCol]}>Topics</Text>
                          <Text style={[styles.assessmentHeader, styles.assessmentScoreCol]}>Score</Text>
                          <Text style={[styles.assessmentHeader, styles.assessmentMaxCol]}>Max Points</Text>
                          <Text style={[styles.assessmentHeader, styles.assessmentPercentCol]}>Percentage</Text>
                        </View>

                        {course.assessments && course.assessments.length > 0 ? (
                          course.assessments.map((assessment: any, idx: number) => (
                            <View key={idx} style={styles.assessmentRow}>
                              <Text style={[styles.assessmentCell, styles.assessmentNameCol]}>
                                {assessment.name || 'Assessment'}
                              </Text>
                              <Text style={[styles.assessmentCell, styles.assessmentTopicsCol]}>
                                {assessment.topic || 'General'}
                              </Text>
                              <Text style={[styles.assessmentCell, styles.assessmentScoreCol]}>
                                {assessment.score ?? 0}
                              </Text>
                              <Text style={[styles.assessmentCell, styles.assessmentMaxCol]}>
                                {assessment.maxPoints ?? 0}
                              </Text>
                              <Text style={[styles.assessmentCell, styles.assessmentPercentCol,
                              assessment.percentage >= 60 ? styles.percentPass : styles.percentFail]}>
                                {assessment.percentage?.toFixed(1) || '0.0'}%
                              </Text>
                            </View>
                          ))
                        ) : (
                          <View style={styles.assessmentRow}>
                            <Text style={styles.noAssessments}>No assessments available</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>
              No courses or assessments found matching your search.
            </Text>
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
  content: {
    padding: 16,
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
  courseDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 20,
  },
  courseDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  courseDetailsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  pageInfo: {
    fontSize: 14,
    color: '#7b8794',
  },
  courseItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  courseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  courseInfo: {
    flex: 1,
  },
  semesterInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  courseLabel: {
    fontSize: 12,
    color: '#7b8794',
    marginBottom: 4,
    fontWeight: '600',
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  semesterText: {
    fontSize: 14,
    color: '#000',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  courseDetails: {
    marginTop: 16,
    paddingLeft: 16,
  },
  semesterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  semesterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  quarterBadge: {
    fontSize: 14,
    color: '#000',
  },
  quarterCard: {
    backgroundColor: '#fafbfc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  quarterHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  quarterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  gradeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  gradeLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  gradeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B144',
    marginRight: 16,
  },
  gpaNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B144',
    marginRight: 8,
  },
  letterGrade: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  letterGradePass: {
    backgroundColor: '#ffebee',
  },
  letterGradeFail: {
    backgroundColor: '#ffebee',
  },
  letterGradeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f44336',
  },
  assessmentTable: {
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  assessmentHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  assessmentHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7b8794',
  },
  assessmentRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  assessmentCell: {
    fontSize: 14,
    color: '#000',
  },
  assessmentNameCol: {
    flex: 2,
  },
  assessmentTopicsCol: {
    flex: 1.5,
  },
  assessmentScoreCol: {
    flex: 0.8,
    textAlign: 'center',
  },
  assessmentMaxCol: {
    flex: 1,
    textAlign: 'center',
  },
  assessmentPercentCol: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
  percentPass: {
    color: '#10B144',
  },
  percentFail: {
    color: '#f44336',
  },
  noAssessments: {
    flex: 1,
    textAlign: 'center',
    color: '#7b8794',
    fontSize: 14,
  },
  noDataText: {
    color: '#222',
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 24,
  },
});

export default GradebookPage;
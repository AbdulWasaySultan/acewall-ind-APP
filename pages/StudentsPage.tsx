import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, Modal, ActivityIndicator } from 'react-native';
// You will need to install react-native-dropdown-picker: npm install react-native-dropdown-picker or yarn add react-native-dropdown-picker
import DropDownPicker from 'react-native-dropdown-picker';
// Import useNavigation hook from React Navigation
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getAllStudentsWithCourses, Student, Course, getCourseGradebook, CourseGradebook } from '../services/student';
import { createConversation } from '../services/conversation';

const StudentsPage = () => {
  // Get navigation object with the defined type
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [courseFilterOpen, setCourseFilterOpen] = useState(false);
  const [courseFilterValue, setCourseFilterValue] = useState<string | null>(null);
  const [courseFilterItems, setCourseFilterItems] = useState<{ label: string; value: string }[]>([]);
  const [courseGradesModalVisible, setCourseGradesModalVisible] = useState(false);
  const [courseGradebook, setCourseGradebook] = useState<CourseGradebook | null>(null);
  const [loadingGradebook, setLoadingGradebook] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [isCourseExpanded, setIsCourseExpanded] = useState(true);
  const [isAssessmentsExpanded, setIsAssessmentsExpanded] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await getAllStudentsWithCourses();
      setStudents(studentsData);
      const allCourses = studentsData.flatMap((s) => s.courses);
      const uniqueCourses = Array.from(new Map(allCourses.map((c) => [c._id, c])).values());
      setCourseFilterItems(uniqueCourses.map((c) => ({
        label: c.courseTitle,
        value: c._id,
      })));
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = courseFilterValue
    ? students.filter((s) => s.courses.some((c) => c._id === courseFilterValue))
    : students;

  const handleMessageStudent = async (studentId: string) => {
    try {
      setMessageLoading(true);
      const response = await createConversation(studentId);
      console.log('Conversation created:', response);

      // Close the modal
      setModalVisible(false);

      // Navigate to messages page
      navigation.navigate('Messages' as never);
    } catch (error) {
      console.error('Error creating conversation:', error);
      // You can add error handling here, like showing an alert
    } finally {
      setMessageLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {/* Title */}
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
        Students ({filteredStudents.length})
      </Text>

      {/* Filter Dropdown */}
      <View style={{
        marginBottom: 24,
        zIndex: courseFilterOpen ? 1000 : 0, // Ensure dropdown is on top when open
      }}>
        <DropDownPicker
          open={courseFilterOpen}
          value={courseFilterValue}
          items={courseFilterItems}
          setOpen={setCourseFilterOpen}
          setValue={setCourseFilterValue}
          setItems={setCourseFilterItems}
          placeholder="Filter by course title"
          style={{ borderColor: '#ccc' }}
          dropDownContainerStyle={{
            borderColor: '#ccc',
          }}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        filteredStudents.map(student => (
          <View
            key={student._id}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 16,
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <View style={{
              width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee',
              justifyContent: 'center', alignItems: 'center', marginBottom: 12,
              overflow: 'hidden'
            }}>
              {typeof student.profileImg === 'string' && student.profileImg ? (
                <Image source={{ uri: student.profileImg }} style={{ width: 80, height: 80 }} />
              ) : (
                <Text style={{ fontSize: 40, color: '#666' }}>👤</Text>
              )}
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
              {student.firstName} {student.middleName} {student.lastName}
            </Text>
            <Text style={{ color: '#666', marginBottom: 16 }}>{student.email}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
              <Text style={{ fontWeight: 'bold' }}>Joined</Text>
              <Text>{new Date(student.createdAt).toLocaleDateString()}</Text>
            </View>
            <Pressable
              style={{ backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', width: '100%' }}
              onPress={() => { setSelectedStudent(student); setModalVisible(true); }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>View Profile</Text>
            </Pressable>
          </View>
        ))
      )}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', width: '100%', height: '100%' }}>
          <View style={{ flex: 1, backgroundColor: 'white', width: '100%', height: '100%', padding: 0 }}>
            {/* Close Icon */}
            <Pressable
              style={{ position: 'absolute', top: 40, right: 24, zIndex: 10 }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ fontSize: 32, color: '#333', fontWeight: 'bold' }}>×</Text>
            </Pressable>
            {selectedStudent && (
              <ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop: 60, paddingBottom: 40 }}>
                {/* Profile Section */}
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <View style={{
                    width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee',
                    justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden'
                  }}>
                    {typeof selectedStudent.profileImg === 'string' && selectedStudent.profileImg ? (
                      <Image source={{ uri: selectedStudent.profileImg }} style={{ width: 100, height: 100 }} />
                    ) : (
                      <Text style={{ fontSize: 50, color: '#666' }}>👤</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>
                    {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={{ color: '#666', fontSize: 16 }}>✉️ {selectedStudent.email}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 16 }}>📅 Joined: {new Date(selectedStudent.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>

                {/* Message Button */}
                <Pressable
                  style={{
                    backgroundColor: '#007bff',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    width: '90%',
                    marginBottom: 24,
                    opacity: messageLoading ? 0.6 : 1
                  }}
                  onPress={() => handleMessageStudent(selectedStudent._id)}
                  disabled={messageLoading}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                    {messageLoading ? 'Creating...' : 'Message'}
                  </Text>
                </Pressable>

                {/* Enrolled Courses Card */}
                <View style={{
                  width: '90%',
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#eee',
                  alignItems: 'center',
                  paddingVertical: 32,
                  marginBottom: 24,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  <Text style={{ fontSize: 40, marginBottom: 8 }}>🏫</Text>
                  <Text style={{ color: '#888', fontSize: 18, marginBottom: 4 }}>Enrolled Courses</Text>
                  <Text style={{ fontSize: 32, fontWeight: 'bold' }}>{selectedStudent.courses.length}</Text>
                </View>

                {/* Section Title */}
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#232b3b', width: '90%' }}>
                  View Grade Book of Enrolled Courses
                </Text>

                {/* Course Cards */}
                {selectedStudent.courses.map((course: Course) => (
                  <Pressable
                    key={course._id}
                    style={{
                      width: '90%',
                      backgroundColor: '#fff',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#eee',
                      alignItems: 'center',
                      paddingVertical: 16,
                      marginBottom: 24,
                      shadowColor: '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                    onPress={async () => {
                      setModalVisible(false);
                      console.log('Course clicked:', course.courseTitle);
                      setCourseGradesModalVisible(true);
                      setLoadingGradebook(true);
                      try {
                        console.log('Calling API for student:', selectedStudent._id, 'course:', course._id);
                        const gradebook = await getCourseGradebook(selectedStudent._id, course._id);
                        console.log('Gradebook response:', gradebook);
                        setCourseGradebook(gradebook);
                      } catch (e) {
                        console.error('Error fetching gradebook:', e);
                        setCourseGradebook(null);
                      } finally {
                        setLoadingGradebook(false);
                      }
                    }}
                  >
                    {typeof course.thumbnail?.url === 'string' && course.thumbnail.url ? (
                      <Image source={{ uri: course.thumbnail.url }} style={{ width: 120, height: 90, borderRadius: 8, marginBottom: 8 }} />
                    ) : null}
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>{course.courseTitle}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      {/* Course Grades Modal */}
      <Modal
        visible={courseGradesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          console.log('Modal onRequestClose called');
          setCourseGradesModalVisible(false);
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', width: '100%', height: '100%' }}>
          <View style={{ flex: 1, backgroundColor: 'white', width: '100%', height: '100%', padding: 0 }}>
            {/* Close Icon */}
            <Pressable
              style={{ position: 'absolute', top: 40, right: 24, zIndex: 10 }}
              onPress={() => setCourseGradesModalVisible(false)}
            >
              <Text style={{ fontSize: 32, color: '#333', fontWeight: 'bold' }}>×</Text>
            </Pressable>
            {loadingGradebook ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
              </View>
            ) : courseGradebook && (
              <ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop: 60, paddingBottom: 40 }}>
                {/* Course Title */}
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#232b3b', width: '90%', textAlign: 'left', alignSelf: 'flex-start', paddingLeft: 10, paddingBottom: 10 }}>
                  {courseGradebook.courseName}
                </Text>
                {/* Course Thumbnail */}
                {typeof courseGradebook.course.thumbnail?.url === 'string' && courseGradebook.course.thumbnail.url ? (
                  <Image source={{ uri: courseGradebook.course.thumbnail.url }} style={{ width: 300, height: 180, borderRadius: 8, marginBottom: 8, alignSelf: 'center' }} />
                ) : null}
                {/* Course Description */}
                <Text style={{ color: '#232b3b', fontSize: 16, marginBottom: 16, width: '90%' }}>
                  {courseGradebook.course.courseDescription}
                </Text>
                {/* Gradebook Card - Matching Image Design */}
                <View style={{
                  width: '95%',
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#eee',
                  marginBottom: 16,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  {/* Table Header */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderColor: '#eee',
                    paddingBottom: 12,
                    marginBottom: 12
                  }}>
                    <Text style={{ fontWeight: '600', fontSize: 14, flex: 1.5, textAlign: 'left', color: '#6b7280' }}>Course</Text>
                    <Text style={{ fontWeight: '600', fontSize: 14, flex: 1, textAlign: 'center', color: '#6b7280' }}>Average</Text>
                    <Text style={{ fontWeight: '600', fontSize: 14, flex: 1, textAlign: 'right', color: '#6b7280' }}>Grade</Text>
                  </View>

                  {/* Course Row (Collapsible) */}
                  <Pressable
                    onPress={() => setIsCourseExpanded(!isCourseExpanded)}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 12
                    }}
                  >
                    <View style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 18, color: '#6b7280', marginRight: 8 }}>{isCourseExpanded ? '▾' : '▸'}</Text>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>{courseGradebook.courseName}</Text>
                    </View>
                    <Text style={{ flex: 1, textAlign: 'center', fontSize: 15, color: '#374151' }}>{courseGradebook.grade.toFixed(2)}%</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <View style={{
                        backgroundColor: '#fee2e2',
                        borderColor: '#fee2e2',
                        borderWidth: 1,
                        borderRadius: 20,
                        paddingHorizontal: 12,
                        paddingVertical: 2,
                      }}>
                        <Text style={{
                          color: '#b91c1c',
                          fontWeight: '500',
                          fontSize: 12
                        }}>
                          {courseGradebook?.letterGrade}
                        </Text>
                      </View>
                    </View>
                  </Pressable>

                  {isCourseExpanded && (
                    <View style={{ paddingLeft: 16, marginTop: 8 }}>
                      {/* Course Assessments Row (Collapsible) */}
                      <Pressable
                        onPress={() => setIsAssessmentsExpanded(!isAssessmentsExpanded)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 12
                        }}
                      >
                        <Text style={{ fontSize: 18, color: '#6b7280', marginRight: 8 }}>{isAssessmentsExpanded ? '▾' : '▸'}</Text>
                        <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>Course Assessments</Text>
                        <Text style={{ fontSize: 16, color: '#9ca3af', marginLeft: 8 }}>
                          ({courseGradebook?.directAssessments?.grade?.toFixed(2)}% - {courseGradebook?.directAssessments?.letterGrade})
                        </Text>
                      </Pressable>

                      {isAssessmentsExpanded && (
                        <View style={{ marginTop: 8 }}>
                          {/* Group assessments by category if needed, but here we just list them */}
                          <View style={{ marginBottom: 16 }}>
                            {/* Assuming we group by category name from the first assessment for now as per image "Test" */}
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12, marginTop: 8 }}>
                              {courseGradebook?.directAssessments?.assessments[0]?.categoryName || 'Assessments'}
                            </Text>

                            {/* Assessment Table */}
                            <View style={{
                              backgroundColor: '#f9fafb',
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: '#f3f4f6',
                              overflow: 'hidden'
                            }}>
                              {/* Sub-table Header */}
                              <View style={{
                                flexDirection: 'row',
                                backgroundColor: '#f9fafb',
                                paddingVertical: 12,
                                paddingHorizontal: 12,
                              }}>
                                <Text style={{ flex: 2, fontSize: 12, fontWeight: '600', color: '#6b7280' }}>Assessment</Text>
                                <Text style={{ flex: 1.5, fontSize: 12, fontWeight: '600', color: '#6b7280' }}>Category</Text>
                                <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: '#6b7280', textAlign: 'center' }}>Score</Text>
                                <Text style={{ flex: 1.2, fontSize: 12, fontWeight: '600', color: '#6b7280', textAlign: 'center' }}>Max Points</Text>
                                <Text style={{ flex: 1.5, fontSize: 12, fontWeight: '600', color: '#6b7280', textAlign: 'right' }}>Percentage</Text>
                              </View>

                              {/* Assessment Rows */}
                              {courseGradebook?.directAssessments?.assessments.length > 0 && courseGradebook?.directAssessments?.assessments.map((item, index) => (
                                <View
                                  key={item.assessmentId}
                                  style={{
                                    flexDirection: 'row',
                                    paddingVertical: 16,
                                    paddingHorizontal: 12,
                                    backgroundColor: '#fff',
                                    borderTopWidth: 1,
                                    borderTopColor: '#f3f4f6'
                                  }}
                                >
                                  <Text style={{ flex: 2, fontSize: 14, fontWeight: '600', color: '#111827' }}>{item.assessmentTitle}</Text>
                                  <Text style={{ flex: 1.5, fontSize: 14, color: '#374151' }}>{item.categoryName}</Text>
                                  <Text style={{ flex: 1, fontSize: 14, color: '#374151', textAlign: 'center' }}>{item.studentPoints}</Text>
                                  <Text style={{ flex: 1.2, fontSize: 14, color: '#374151', textAlign: 'center' }}>{item.maxPoints}</Text>
                                  <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                                    <View style={{
                                      backgroundColor: '#fee2e2',
                                      paddingHorizontal: 10,
                                      paddingVertical: 4,
                                      borderRadius: 20
                                    }}>
                                      <Text style={{ fontSize: 12, color: '#b91c1c', fontWeight: '600' }}>
                                        {((item.studentPoints / item.maxPoints) * 100).toFixed(1)}%
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              ))}
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {/* No Assessments Message */}
                  {courseGradebook.totalAssessments === 0 && (
                    <View style={{
                      alignItems: 'center',
                      paddingVertical: 24,
                      marginTop: 12
                    }}>
                      <Text style={{
                        color: '#9ca3af',
                        fontSize: 14,
                        fontStyle: 'italic'
                      }}>
                        No assessments found for this course.
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default StudentsPage; 
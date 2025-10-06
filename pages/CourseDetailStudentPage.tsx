import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, Linking, Alert, Platform } from 'react-native';
import SimpleIcon from '../components/SimpleIcon';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getCourseById, getStudentEnrolledCourseDetails, getCourseForStudentPreview, getQuartersForSemester, getChaptersForQuarter, getChapterDetailsForStudent } from '../services/course';
import axios from 'axios';

const fallbackImage = require('../assets/jpg.jpg');
const avatarPlaceholder = require('../assets/placeholder.png');
const TABS = ['Overview', 'Reviews', 'Syllabus'];

const CourseDetailStudentPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId, fromAdmin, enrollmentId } = route.params as { courseId: string, fromAdmin?: boolean, enrollmentId?: string };
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<{ [key: number]: boolean }>({});
  const [expandedLessons, setExpandedLessons] = useState<{ [key: string]: boolean }>({});
  
  // Modal states
  const [showQuartersModal, setShowQuartersModal] = useState(false);
  const [showChaptersModal, setShowChaptersModal] = useState(false);
  const [showChapterDetailsModal, setShowChapterDetailsModal] = useState(false);
  const [quarters, setQuarters] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [activeChapterTab, setActiveChapterTab] = useState('Description');
  const [loadingQuarters, setLoadingQuarters] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingChapterDetails, setLoadingChapterDetails] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchCourseData = async () => {
      try {
        if (enrollmentId) {
          // For enrolled courses, get the enrolled course details
          const enrolledCourseData = await getStudentEnrolledCourseDetails(enrollmentId);
          setCourse(enrolledCourseData?.courseDetails || null);
        } else {
          // For regular course details - use student preview API
          const res = await getCourseForStudentPreview(courseId);
          console.log('Course data from Student Preview API:', res.course);
          console.log('Semester data:', res.course?.semester);
          setCourse(res.course);
        }
      } catch (err) {
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId, enrollmentId]);

  // Helper for rendering stars
  const renderStars = (rating = 4.5) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<SimpleIcon key={i} name="star" size={28} color="#FFD600" />);
    }
    if (halfStar) {
      stars.push(<SimpleIcon key="half" name="star-half" size={28} color="#FFD600" />);
    }
    return stars;
  };

  const handleEnroll = async () => {
    setEnrollLoading(true);
    setEnrollError(null);
    try {
      await axios.post(`https://acewall-backend-school-instance-production.up.railway.app/api/enrollment/create/${courseId}`);
      setShowEnrollModal(false);
      (navigation as any).navigate('Main', { screen: 'MyCourses' });
    } catch (err: any) {
      setEnrollError(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrollLoading(false);
    }
  };

  const toggleChapter = (idx: number) => {
    setExpandedChapters(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleLesson = (lessonId: string | number) => {
    setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const handleOpenSyllabus = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL. Please check if you have a browser installed.');
      }
    } catch (error) {
      console.error('Error opening syllabus:', error);
      Alert.alert('Error', 'Failed to open syllabus. Please try again.');
    }
  };

  const handleSemesterClick = async (semesterId: string) => {
    setLoadingQuarters(true);
    try {
      const quartersData = await getQuartersForSemester(semesterId);
      setQuarters(quartersData.quarters || []);
      setShowQuartersModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch quarters');
    } finally {
      setLoadingQuarters(false);
    }
  };

  const handleQuarterClick = async (quarterId: string) => {
    setLoadingChapters(true);
    try {
      const chaptersData = await getChaptersForQuarter(courseId, quarterId);
      setChapters(chaptersData.chapters || []);
      setShowQuartersModal(false); // Close quarters modal
      setShowChaptersModal(true); // Open chapters modal
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch chapters');
    } finally {
      setLoadingChapters(false);
    }
  };

  const handleChapterClick = async (chapterId: string) => {
    setLoadingChapterDetails(true);
    try {
      const chapterDetails = await getChapterDetailsForStudent(chapterId);
      setSelectedChapter(chapterDetails.chapterDetails);
      setShowChaptersModal(false); // Close chapters modal
      setShowChapterDetailsModal(true); // Open chapter details modal
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch chapter details');
    } finally {
      setLoadingChapterDetails(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <SimpleIcon name="close" size={32} color="#222" />
      </TouchableOpacity>
      {/* Enroll Modal */}
      <Modal
        visible={showEnrollModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEnrollModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enroll in Course</Text>
            <Text style={styles.modalText}>Are you sure you want to enroll in this course?</Text>
            {enrollError && <Text style={styles.errorText}>{enrollError}</Text>}
            {enrollLoading ? (
              <ActivityIndicator size="large" color="#43a047" />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowEnrollModal(false)}>
                  <Text style={styles.cancelButtonText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleEnroll}>
                  <Text style={styles.confirmButtonText}>Yes</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Quarters Modal */}
      <Modal
        visible={showQuartersModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowQuartersModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              paddingTop: Platform.OS === "ios" ? 40 : 16,
            }}
          >
            <Text
              style={{ fontSize: 28, fontWeight: "bold", color: "#1E293B" }}
            >
              Quarters
            </Text>
            <TouchableOpacity onPress={() => setShowQuartersModal(false)}>
              <SimpleIcon name="close" size={32} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {loadingQuarters ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color="#66bb6a" />
                <Text style={{ marginTop: 16, color: '#666' }}>Loading quarters...</Text>
              </View>
            ) : quarters.length > 0 ? (
              quarters.map((quarter, index) => (
                <TouchableOpacity
                  key={quarter._id || index}
                  style={styles.quarterCard}
                  onPress={() => handleQuarterClick(quarter._id)}
                >
                  <Text style={styles.quarterTitle}>Quarter: {quarter.title}</Text>
                  <Text style={styles.quarterDate}>
                    {new Date(quarter.startDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} - {new Date(quarter.endDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                  No quarters found for this semester.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Chapters Modal */}
      <Modal
        visible={showChaptersModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowChaptersModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              paddingTop: Platform.OS === "ios" ? 40 : 16,
            }}
          >
            <TouchableOpacity onPress={() => setShowChaptersModal(false)}>
              <SimpleIcon name="arrow-back" size={32} color="#333" />
            </TouchableOpacity>
            <Text
              style={{ fontSize: 28, fontWeight: "bold", color: "#1E293B", flex: 1, textAlign: 'center', marginRight: 32 }}
            >
              Chapters
            </Text>
          </View>
          
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {loadingChapters ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color="#66bb6a" />
                <Text style={{ marginTop: 16, color: '#666' }}>Loading chapters...</Text>
              </View>
            ) : chapters.length > 0 ? (
              chapters.map((chapter, index) => (
                <TouchableOpacity
                  key={chapter._id || index}
                  style={styles.chapterCard}
                  onPress={() => handleChapterClick(chapter._id)}
                >
                  <Text style={styles.chapterCardTitle}>{chapter.title}</Text>
                  <Text style={styles.chapterCardDescription}>{chapter.description}</Text>
                  <View style={styles.chapterInfo}>
                    <Text style={styles.chapterInfoText}>
                      {chapter.lessons?.length || 0} lessons
                    </Text>
                    <Text style={styles.chapterInfoText}>
                      {chapter.chapter_assessments?.length || 0} assessments
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                  No chapters found for this quarter.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Chapter Details Modal */}
      <Modal
        visible={showChapterDetailsModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowChapterDetailsModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              paddingTop: Platform.OS === "ios" ? 40 : 16,
            }}
          >
            <TouchableOpacity onPress={() => setShowChapterDetailsModal(false)}>
              <SimpleIcon name="arrow-back" size={32} color="#333" />
            </TouchableOpacity>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: "#1E293B", flex: 1, textAlign: 'center', marginRight: 32 }}
            >
              Chapter: {selectedChapter?.title || 'Loading...'}
            </Text>
          </View>
          
          {/* Chapter Tabs */}
          <View style={styles.chapterTabsRow}>
            {['Description', 'Files', 'Assessments', 'Pages'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.chapterTabButton, activeChapterTab === tab && styles.activeChapterTabButton]}
                onPress={() => setActiveChapterTab(tab)}
              >
                <Text style={[styles.chapterTabText, activeChapterTab === tab && styles.activeChapterTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {loadingChapterDetails ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color="#66bb6a" />
                <Text style={{ marginTop: 16, color: '#666' }}>Loading chapter details...</Text>
              </View>
            ) : selectedChapter ? (
              <>
                {activeChapterTab === 'Description' && (
                  <View style={styles.chapterContentCard}>
                    <Text style={styles.chapterContentTitle}>{selectedChapter.title}</Text>
                    <Text style={styles.chapterContentDescription}>{selectedChapter.description}</Text>
                  </View>
                )}
                {activeChapterTab === 'Files' && (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                      No files available for this chapter.
                    </Text>
                  </View>
                )}
                {activeChapterTab === 'Assessments' && (
                  <View>
                    {selectedChapter.chapterAssessments && selectedChapter.chapterAssessments.length > 0 ? (
                      selectedChapter.chapterAssessments.map((assessment: any, index: number) => (
                        <View key={assessment._id || index} style={styles.assessmentCard}>
                          <Text style={styles.assessmentTitle}>{assessment.title}</Text>
                          <Text style={styles.assessmentDescription}>{assessment.description}</Text>
                        </View>
                      ))
                    ) : (
                      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                        <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                          No assessments available for this chapter.
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                {activeChapterTab === 'Pages' && (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                      No pages available for this chapter.
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                  No chapter details available.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#66bb6a" /></View>
      ) : error ? (
        <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>
      ) : course ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{course.courseTitle}</Text>
          <Text style={styles.subtitle}>{course.courseDescription}</Text>
          <View style={styles.instructorRow}>
            <Image source={avatarPlaceholder} style={styles.avatar} />
            <Text style={styles.instructorName}>{course.createdby ? `${course.createdby.firstName} ${course.createdby.middleName || ''} ${course.createdby.lastName}`.trim() : 'Unknown Instructor'}</Text>
          </View>
          <Image source={course.thumbnail?.url ? { uri: course.thumbnail.url } : fallbackImage} style={styles.courseImage} />
          
          {/* Semester Information */}
          {course.semester && course.semester.length > 0 && (
            <TouchableOpacity 
              style={styles.semesterCard}
              onPress={() => handleSemesterClick(course.semester[0]._id)}
            >
              <Text style={styles.semesterTitle}>Semester: {course.semester[0].title}</Text>
              <Text style={styles.semesterDate}>
                {new Date(course.semester[0].startDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} - {new Date(course.semester[0].endDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Tabs */}
          <View style={styles.tabsRow}>
            {TABS.map(tab => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}>
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Tab Content */}
          {activeTab === 'Overview' && (
            <View>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionText}>{course.courseDescription}</Text>
              <Text style={styles.sectionTitle}>What you will learn in this course</Text>
              {course.teachingPoints && course.teachingPoints.length > 0 ? course.teachingPoints.map((tp: string, idx: number) => (
                <View key={idx} style={styles.bulletRow}>
                  <SimpleIcon name="checkmark-circle" size={22} color="#43a047" style={{ marginRight: 8 }} />
                  <Text style={styles.bulletText}>{tp}</Text>
                </View>
              )) : <Text style={styles.sectionText}>No learning points listed.</Text>}
              <Text style={styles.sectionTitle}>Course requirements</Text>
              {course.requirements && course.requirements.length > 0 ? course.requirements.map((req: string, idx: number) => (
                <View key={idx} style={styles.bulletRow}>
                  <SimpleIcon name="checkmark-circle" size={22} color="#43a047" style={{ marginRight: 8 }} />
                  <Text style={styles.bulletText}>{req}</Text>
                </View>
              )) : <Text style={styles.sectionText}>No requirements listed.</Text>}
              {/* Enroll Button & Course Includes */}
              <View style={styles.enrollBox}>
                <TouchableOpacity
                  style={[styles.enrollButton, fromAdmin && { opacity: 0.5 }]}
                  onPress={() => !fromAdmin && setShowEnrollModal(true)}
                  disabled={!!fromAdmin}
                >
                  <Text style={styles.enrollButtonText}>Enroll Now</Text>
                </TouchableOpacity>
                <Text style={styles.includesTitle}>This course includes:</Text>
                <View style={styles.includeRow}>
                  <SimpleIcon name="play-circle-outline" size={20} color="#43a047" style={{ marginRight: 8 }} />
                  <Text style={styles.includeText}>hours on-demand video</Text>
                </View>
                <View style={styles.includeRow}>
                  <SimpleIcon name="checkmark-circle-outline" size={20} color="#43a047" style={{ marginRight: 8 }} />
                  <Text style={styles.includeText}>Full lifetime access</Text>
                </View>
                <View style={styles.includeRow}>
                  <SimpleIcon name="phone-portrait-outline" size={20} color="#43a047" style={{ marginRight: 8 }} />
                  <Text style={styles.includeText}>Access on mobile and web</Text>
                </View>
                {course.chapters && course.chapters.length > 0 && (
                  <View style={styles.includeRow}>
                    <SimpleIcon name="book-outline" size={20} color="#43a047" style={{ marginRight: 8 }} />
                    <Text style={styles.includeText}>
                      Includes {course.chapters.length} {course.chapters.length === 1 ? 'chapter' : 'chapters'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          {activeTab === 'Syllabus' && (
            <View>
              <Text style={styles.sectionTitle}>Course Syllabus</Text>
              {course.syllabus && course.syllabus.url ? (
                <View style={styles.syllabusContainer}>
                  <View style={styles.syllabusCard}>
                    <SimpleIcon name="document-text" size={32} color="#43a047" />
                    <View style={styles.syllabusInfo}>
                      <Text style={styles.syllabusTitle}>{course.syllabus.filename || 'Course Syllabus'}</Text>
                      <Text style={styles.syllabusSubtitle}>PDF Document</Text>
                      <Text style={styles.syllabusDate}>
                        Uploaded: {new Date(course.syllabus.uploadedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={() => handleOpenSyllabus(course.syllabus.url)}
                    >
                      <SimpleIcon name="open-in-new" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.tabContentCentered}>
                  <SimpleIcon name="document-text-outline" size={48} color="#ccc" />
                  <Text style={styles.sectionText}>No syllabus available</Text>
                </View>
              )}
            </View>
          )}
          {activeTab === 'Reviews' && (
            <View style={styles.tabContentCentered}>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
                {renderStars(4.5)}
              </View>
              <Text style={{ color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 18 }}>Course Rating</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#222', marginBottom: 8 }}>Students Feedback</Text>
              <Text style={styles.sectionText}>No reviews available</Text>
            </View>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', top: 16, right: 16, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, padding: 2, elevation: 2 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111', marginTop: 8 },
  subtitle: { color: '#888', fontSize: 18, marginBottom: 8 },
  instructorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  instructorName: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  courseImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  tabsRow: { flexDirection: 'row', marginBottom: 20 },
  tabButton: { 
    marginRight: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTabButton: { 
    backgroundColor: '#e8f5e8',
  },
  tabText: { fontSize: 14, color: '#333' },
  activeTabText: { color: '#2d5a2d', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 8, marginTop: 12 },
  sectionText: { color: '#666', fontSize: 16, marginBottom: 12 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  bulletText: { fontSize: 16, color: '#444' },
  enrollBox: { backgroundColor: '#f8f8f8', borderRadius: 12, padding: 18, marginTop: 24, marginBottom: 24 },
  enrollButton: { backgroundColor: '#43a047', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 18 },
  enrollButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  includesTitle: { fontWeight: 'bold', fontSize: 16, color: '#222', marginBottom: 10 },
  includeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  includeText: { fontSize: 15, color: '#444' },
  errorText: { color: 'red', fontSize: 16 },
  tabContentCentered: { alignItems: 'center', marginTop: 32 },
  instructorTabAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 16 },
  instructorTabName: { fontWeight: 'bold', fontSize: 20, color: '#222' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#222' },
  modalText: { fontSize: 16, color: '#444', marginBottom: 18, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 12 },
  modalButton: { flex: 1, paddingVertical: 10, marginHorizontal: 6, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#eee' },
  cancelButtonText: { color: '#222', fontWeight: 'bold', fontSize: 16 },
  confirmButton: { backgroundColor: '#43a047' },
  confirmButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  chapterHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 6, paddingHorizontal: 8 },
  chapterTitle: { fontWeight: 'bold', fontSize: 15, color: '#222' },
  chapterDescription: { color: '#666', fontSize: 13, marginBottom: 6, marginTop: 4 },
  descriptionLabel: { fontWeight: 'bold', fontSize: 13, color: '#222', marginBottom: 2 },
  lessonHeader: { flexDirection: 'row', alignItems: 'center' },
  lessonBox: { marginBottom: 8, backgroundColor: '#f5f5f5', borderRadius: 6, padding: 8 },
  lessonTitle: { fontWeight: 'bold', fontSize: 13, marginBottom: 2, color: '#222' },
  lessonDescription: { color: '#666', fontSize: 12 },
  noLessons: { color: '#aaa', marginLeft: 2, fontSize: 12 },
  semesterCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  semesterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  semesterDate: {
    fontSize: 14,
    color: '#666',
  },
  syllabusContainer: {
    marginTop: 8,
  },
  syllabusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  syllabusInfo: {
    flex: 1,
    marginLeft: 12,
  },
  syllabusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  syllabusSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  syllabusDate: {
    fontSize: 12,
    color: '#888',
  },
  downloadButton: {
    backgroundColor: '#43a047',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quarterCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  quarterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quarterDate: {
    fontSize: 14,
    color: '#666',
  },
  chapterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chapterCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  chapterCardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  chapterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chapterInfoText: {
    fontSize: 12,
    color: '#888',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chapterTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  chapterTabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeChapterTabButton: {
    backgroundColor: '#e8f5e8',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  chapterTabText: {
    fontSize: 14,
    color: '#333',
  },
  activeChapterTabText: {
    color: '#2d5a2d',
    fontWeight: 'bold',
  },
  chapterContentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterContentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  chapterContentDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  assessmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  assessmentDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default CourseDetailStudentPage; 
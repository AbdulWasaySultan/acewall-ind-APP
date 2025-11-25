import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, Linking, Alert, Platform, AppState } from 'react-native';
import SimpleIcon from '../components/SimpleIcon';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getCourseById, getStudentEnrolledCourseDetails, getQuartersForSemester, getChaptersForQuarter, getChapterDetailsForStudent, enrollInCourse, createStripeCheckoutSession, getEnrollStatus } from '../services/course';
import { useUser } from '../contexts/UserContext';
import Toast from 'react-native-simple-toast'
import { getCourseRating } from '../services/rating';
const fallbackImage = require('../assets/jpg.jpg');
const avatarPlaceholder = require('../assets/placeholder.png');
const TABS = ['Overview', 'Reviews', 'Curriculum', 'Instructor'];

const CourseDetailStudentPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useUser();
  const { courseId, fromAdmin, enrollmentId } = route.params as { courseId: string, fromAdmin?: boolean, enrollmentId?: string };
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<{ [key: string]: boolean }>({});
  const [expandedLessons, setExpandedLessons] = useState<{ [key: string]: boolean }>({});
  const [courseRating, setCourseRating] = useState<{count:number,averageStar:number}>();
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
  const isLong = course?.courseDescription && course.courseDescription.length > 500;
  const [showMore, setShowMore] = useState(false);
  const [enrollStatus,setEnrollStatus] = useState(true)
  const courseDescription = course?.courseDescription && (showMore
    ? course.courseDescription
    : course.courseDescription.slice(0, 500) + (isLong ? "..." : ""))
    const appState = useRef(AppState.currentState);

    useEffect(() => {
      Linking.addEventListener('url',(e)=>  handleLink(e.url))
    }, []);
  
    const handleLink = (url:any) => {
      if (url.includes("payment-success")) {
        Toast.show("Payment successful", Toast.LONG);
      } else if (url.includes("payment-failed")) {
        Toast.show("Payment failed", Toast.LONG);
      }
    };
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchCourseData = async () => {
      try {
        console.log('Enrollment ID:', enrollmentId);
        if (enrollmentId) {
          // For enrolled courses, get the enrolled course details
          const enrolledCourseData = await getStudentEnrolledCourseDetails(enrollmentId);
          setCourse(enrolledCourseData?.courseDetails || null);
        } else {
          // For regular course details - use getCourseById API which includes chapters
          const res = await getCourseById(courseId);
          console.log('Course data from getCourseById API:', res.course);
          console.log('Chapters data:', res.course?.chapters);
          setCourse(res.course);
        }
      } catch (err) {
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };
    const fetchCourseRating = async () => {
      try {
      const res = await getCourseRating(courseId)
      setCourseRating(res)
        console.log(res)
      } catch (err) {
        console.log(err)
      }
    };
    const checkEnrollment = async () => {
      try {
      const res = await getEnrollStatus(courseId)
      setEnrollStatus(res)
        console.log(res)
      } catch (err) {
        console.log(err)
      }
    };
    fetchCourseData();
    fetchCourseRating()
    checkEnrollment()
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
      if (course?.price > 0) {
        // For paid courses, create Stripe checkout session
        const studentId = user?._id;
        if (!studentId) {
          throw new Error('Student ID not found. Please log in again.');
        }

        const result = await createStripeCheckoutSession(courseId, studentId);
        setShowEnrollModal(false);
        // Open the checkout URL from Stripe
        console.log('Result:', result);
        if (result.url) {
          const checkoutUrl = result.url as string;
          console.log('Checkout URL:', checkoutUrl);
          await Linking.openURL(checkoutUrl);
          // } else {
          //   throw new Error('Cannot open checkout URL');
          // }
        } else {
          throw new Error('No checkout URL received from server');
        }
      } else {
        // For free courses, enroll directly
        const result = await enrollInCourse(courseId);
        setShowEnrollModal(false);
        (navigation as any).navigate('Main', { screen: 'MyCourses' });
      }
    } catch (err: any) {
      setEnrollError(err.response?.data?.message || err.message || 'Failed to enroll');
    } finally {
      setEnrollLoading(false);
    }
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const toggleLesson = (lessonId: string) => {
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
            <Text style={styles.modalTitle}>{course?.price > 0 ? 'Confirm Purchase' : 'Enroll for free'}</Text>
            <Text style={styles.modalText}>{course?.price > 0 ? "You'll be redirected to Stripe's secure payment screen to complete your purchase." : 'Click below to enroll in this free course'}</Text>
            {enrollError && <Text style={styles.errorText}>{enrollError}</Text>}
            {enrollLoading ? (
              <ActivityIndicator size="large" color="#43a047" />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowEnrollModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleEnroll}>
                  <Text style={styles.confirmButtonText}>{course?.price > 0 ? `Pay $${course?.price}` : 'Enroll Now'}</Text>
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
          <Text style={styles.subtitle}>
            {courseDescription}
            {isLong && (
              <Text
                onPress={() => setShowMore(!showMore)}
                style={{ color: '#10B144', marginTop: 5, fontWeight: '600' }}
              >
                {showMore ? " Read Less" : "Read More"}
              </Text>
            )}
          </Text>
          <View style={styles.instructorRow}>
            <Image source={
              course.createdby?.profileImg?.url
                ? { uri: course.createdby.profileImg.url }
                : avatarPlaceholder
            } style={styles.avatar} />

            <Text style={styles.instructorName}>{course.createdby ? `${course.createdby.firstName}${course.createdby.middleName || ''} ${course.createdby.lastName}`.trim() : 'Unknown Instructor'}</Text>
          </View>

          {/* Semester Information */}
          {/* {course.semester && course.semester.length > 0 && (
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
          )} */}

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScrollContainer}
            contentContainerStyle={styles.tabsRow}
          >
            {TABS.map(tab => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}>
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Tab Content */}
          {activeTab === 'Overview' && (
            <View>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionText}>{course.courseDescription}</Text>
              <Text style={styles.sectionTitle}>What you will learn in this course</Text>
              {course.teachingPoints && course.teachingPoints.length > 0 ? course.teachingPoints.map((tp: string, idx: number) => (
                <View key={idx} style={styles.bulletRow}>
                  <SimpleIcon name="check-circle" size={22} color="#43a047" style={{ marginRight: 8 }} />
                  <Text style={styles.bulletText}>{tp}</Text>
                </View>
              )) : <Text style={styles.sectionText}>No learning points listed.</Text>}
              <Text style={styles.sectionTitle}>Course requirements</Text>
              {course.requirements && course.requirements.length > 0 ? course.requirements.map((req: string, idx: number) => (
                <View key={idx} style={styles.bulletRow}>
                  <SimpleIcon name="check-circle" size={22} color="#43a047" style={{ marginRight: 8 }} />
                  <Text style={styles.bulletText}>{req}</Text>
                </View>
              )) : <Text style={styles.sectionText}>No requirements listed.</Text>}
              {/* Enroll Button & Course Includes */}
              <View style={styles.enrollBox}>

                <Text style={[styles.includesTitle, { fontSize: 25 }]}>$ {course?.price} </Text>
                <TouchableOpacity
                  style={[styles.enrollButton, (fromAdmin||enrollStatus) && { opacity: 0.5 }]}
                  onPress={() => !fromAdmin && setShowEnrollModal(true)}
                  disabled={!!fromAdmin || enrollStatus}
                >
                  <Text style={styles.enrollButtonText}>{enrollStatus? "Enrolled":"Buy Now"}</Text>
                </TouchableOpacity>
                <Text style={styles.includesTitle}>This course includes:</Text>
                <View style={styles.includeRow}>
                  <SimpleIcon name="play-circle-outline" size={20} color="#43a047" style={{ marginRight: 8 }} />
                  <Text style={styles.includeText}>hours on-demand video</Text>
                </View>
                <View style={styles.includeRow}>
                  <SimpleIcon name="check-circle-outline" size={20} color="#43a047" style={{ marginRight: 8 }} />
                  <Text style={styles.includeText}>Full lifetime access</Text>
                </View>
                <View style={styles.includeRow}>
                  <SimpleIcon name="smartphone" size={20} color="#43a047" style={{ marginRight: 8 }} />
                  <Text style={styles.includeText}>Access on mobile and web</Text>
                </View>
                {course.chapters && course.chapters.length > 0 && (
                  <View style={styles.includeRow}>
                    <SimpleIcon name="menu-book" size={20} color="#43a047" style={{ marginRight: 8 }} />
                    <Text style={styles.includeText}>
                      Includes {course.chapters.length} {course.chapters.length === 1 ? 'chapter' : 'chapters'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          {activeTab === 'Curriculum' && (
            <View>
              {course?.chapters && course.chapters.length > 0 ? (
                course.chapters.map((chapter: any) => {
                  const isChapterExpanded = expandedChapters[chapter._id];
                  return (
                    <View key={chapter._id} style={styles.curriculumChapterContainer}>
                      <TouchableOpacity
                        style={styles.curriculumChapterHeader}
                        onPress={() => toggleChapter(chapter._id)}
                      >
                        <SimpleIcon
                          name={isChapterExpanded ? "chevron-up" : "chevron-down"}
                          size={20}
                          color="#000"
                        />
                        <Text style={styles.curriculumChapterTitle}>{chapter.title}</Text>
                      </TouchableOpacity>

                      {isChapterExpanded && (
                        <View style={styles.curriculumChapterContent}>
                          {chapter.description && (
                            <View style={styles.curriculumDescriptionContainer}>
                              <Text style={styles.curriculumDescriptionLabel}>Description</Text>
                              <Text style={styles.curriculumDescriptionText}>{chapter.description}</Text>
                            </View>
                          )}

                          {chapter.lessons && chapter.lessons.length > 0 && (
                            chapter.lessons.map((lesson: any) => {
                              const isLessonExpanded = expandedLessons[lesson._id];
                              return (
                                <View key={lesson._id} style={styles.curriculumLessonContainer}>
                                  <TouchableOpacity
                                    style={styles.curriculumLessonHeader}
                                    onPress={() => toggleLesson(lesson._id)}
                                  >
                                    <SimpleIcon
                                      name={isLessonExpanded ? "chevron-up" : "chevron-down"}
                                      size={18}
                                      color="#000"
                                    />
                                    <Text style={styles.curriculumLessonTitle}>{lesson.title}</Text>
                                  </TouchableOpacity>

                                  {isLessonExpanded && lesson.description && (
                                    <View style={styles.curriculumLessonContent}>
                                      <Text style={styles.curriculumDescriptionLabel}>Description</Text>
                                      <Text style={styles.curriculumDescriptionText}>{lesson.description}</Text>
                                    </View>
                                  )}
                                </View>
                              );
                            })
                          )}
                        </View>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={styles.tabContentCentered}>
                  <Text style={styles.sectionText}>No curriculum available</Text>
                </View>
              )}
            </View>
          )}
          {activeTab === 'Instructor' && (
            <View>
              <View style={styles.instructorContainer}>
                <Image
                  source={
                    course.createdby?.profileImg?.url
                      ? { uri: course.createdby.profileImg.url }
                      : avatarPlaceholder
                  }
                  style={styles.instructorAvatar}
                />
                <Text style={styles.instructorNameText}>
                  {course.createdby
                    ? `${course.createdby.firstName} ${course.createdby.middleName || ''} ${course.createdby.lastName}`.trim()
                    : 'Unknown Instructor'}
                </Text>
              </View>

              {course.syllabus && course.syllabus.url && (
                <View style={styles.syllabusSection}>
                  <Text style={styles.sectionTitle}>Course Syllabus</Text>
                  <View style={styles.syllabusContainer}>
                    <View style={styles.syllabusCard}>
                      <SimpleIcon name="description" size={32} color="#43a047" />
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
                </View>
              )}
            </View>
          )}
          {activeTab === 'Reviews' && (
            courseRating?.averageStar? 
            <View style={styles.tabContentCentered}>
               <Text style={{ fontWeight: 'bold', fontSize: 35, color: '#222', marginBottom: 8 }}>{courseRating?.averageStar?.toFixed(1)}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
              {renderStars(courseRating?.averageStar || 0)}
              </View>
              {courseRating?.count&& <Text style={styles.sectionText}>({courseRating.count} rating)</Text>}
            </View>
            :
            <View>
            <Text style={styles.sectionText}>This course is not rated</Text>
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
  tabsScrollContainer: {
    marginBottom: 20,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  tabButton: {
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    flexShrink: 0,
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
  // Curriculum Styles
  curriculumChapterContainer: {
    marginBottom: 12,
  },
  curriculumChapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  curriculumChapterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
  },
  curriculumChapterContent: {
    paddingLeft: 28,
    paddingBottom: 8,
  },
  curriculumDescriptionContainer: {
    marginBottom: 12,
    paddingBottom: 12,
  },
  curriculumDescriptionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  curriculumDescriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  curriculumLessonContainer: {
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginLeft: -8,
  },
  curriculumLessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  curriculumLessonTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 6,
  },
  curriculumLessonContent: {
    paddingLeft: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  // Instructor Styles
  instructorContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  instructorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  instructorNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  syllabusSection: {
    marginTop: 16,
  },
});

export default CourseDetailStudentPage; 
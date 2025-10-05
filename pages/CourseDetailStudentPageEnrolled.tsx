import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Modal, DevSettings, Linking, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import SimpleIcon from '../components/SimpleIcon';
import { getChaptersByQuarter, getQuartersForSemester, getStudentEnrolledCourseDetails, unenrollFromCourse } from '../services/course';
import { isCourseRated, getCourseRating, createRating } from '../services/rating';
import { getComments, sendComment } from '../services/comment';
import { createConversation } from '../services/conversation';
import ConversationsModal from '../components/ConversationsModal';
import Toast from "react-native-simple-toast";
// Type for navigation param
interface Params {
    enrollmentId: string;
    courseId: string;
}
const formatDateWithOrdinal = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.toLocaleDateString("en-US", {
      month: "long",
      timeZone: "UTC",
    });
    const year = date.getUTCFullYear();
    const getOrdinal = (d: number) => {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
    return `${month} ${day}${getOrdinal(day)}, ${year}`;
  };
const CourseDetailStudentPageEnrolled = () => {
    const route = useRoute<RouteProp<Record<string, Params>, string>>();
    const {enrollmentId,courseId} = route.params;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enrolledCourse, setEnrolledCourse] = useState<any>(null);
    const [segment, setSegment] = useState<'overview' | 'reviews' | 'syllabus'>('overview');
    const [rating, setRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [isConversationsModalVisible, setIsConversationsModalVisible] = useState(false);
    const [isUnenrollModalVisible, setIsUnenrollModalVisible] = useState(false);
    const [unenrollConfirmationText, setUnenrollConfirmationText] = useState('');
    const [isUnenrolling, setIsUnenrolling] = useState(false);

    const [semesterQuarters, setSemesterQuarters] = useState<any[]>([]);
    const [showQuartersModal, setShowQuartersModal] = useState(false);
    const [loadingSemesterQuarters, setLoadingSemesterQuarters] = useState(false);
    const [chaptersForQuarter, setChaptersForQuarter] = useState<any[]>([]);
    const [loadingChaptersForQuarter, setLoadingChaptersForQuarter] =
      useState(false);
    const [chaptersMessage, setChaptersMessage] = useState("");
    const [selectedQuarterId, setSelectedQuarterId] = useState<string | null>(
        null
      );
      const [showChaptersForQuarterModal, setShowChaptersForQuarterModal] =
      useState(false);
    const navigation = useNavigation();

    const refreshChaptersForQuarter = async (quarterId: string) => {
      console.log(courseId)
        setLoadingChaptersForQuarter(true);
        setChaptersForQuarter([]);
        setChaptersMessage("");
        try {
          const res = await getChaptersByQuarter(courseId, quarterId);
          if (res.chapters && res.chapters.length > 0) {
            setChaptersForQuarter(res.chapters);
          } else {
            setChaptersMessage(res.message || "No chapters found.");
          }
        } catch (error: any) {
          console.error("Failed to fetch chapters:", error);
          Toast.show(error.message || "Failed to fetch chapters.", Toast.LONG);
          setChaptersMessage("Failed to fetch chapters.");
        } finally {
          setLoadingChaptersForQuarter(false);
        }
      };
    const handleQuarterCardPress = async (quarter: any) => {
        setSelectedQuarterId(quarter._id);
        setShowQuartersModal(false);
        setShowChaptersForQuarterModal(true);
        await refreshChaptersForQuarter(quarter._id);
      };
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getStudentEnrolledCourseDetails(enrollmentId);
                setEnrolledCourse(data || null);
            } catch (err) {
                setError('Failed to load course details.');
            } finally {
                setLoading(false);
            }
        };
        if (enrollmentId) fetchDetails();
    }, [enrollmentId]);

    useEffect(() => {
      const fetchReviews = async () => {
        if (segment === 'reviews' && enrolledCourse?.course) {
          setReviewsLoading(true);
          try {
            const courseId = enrolledCourse.course;
      
            const [ratedRes, ratingRes, commentsRes] = await Promise.allSettled([
              isCourseRated(courseId),
              getCourseRating(courseId),
              getComments(courseId),
            ]);
      
            // Handle individual results safely
            if (ratedRes.status === "fulfilled" && ratedRes.value?.rating) {
              console.log("User rating:", ratedRes.value);
              setUserRating(ratedRes.value.star);
              setRating(ratedRes.value.star);
            } else if (ratedRes.status === "rejected") {
              console.warn("Failed to get course rating info:", ratedRes.reason);
            }
      
            if (ratingRes.status === "fulfilled" && ratingRes.value) {
              console.log("Overall course rating:", ratingRes.value);
              setAverageRating(ratingRes.value.averageStar);
              setRatingCount(ratingRes.value.count);
            } else if (ratingRes.status === "rejected") {
              console.warn("Failed to get overall rating:", ratingRes.reason);
            }
      
            if (commentsRes.status === "fulfilled" && commentsRes.value?.comments) {
              console.log("Comments response:", commentsRes.value);
              setComments(commentsRes.value.comments);
            } else if (commentsRes.status === "rejected") {
              console.warn("Failed to get comments:", commentsRes.reason);
            }
      
          } catch (err) {
            console.error("Unexpected error while loading reviews:", err);
          } finally {
            setReviewsLoading(false);
          }
        }
      };
      
        fetchReviews();
    }, [segment, enrolledCourse]);

    const handleRateCourse = async (newRating: number) => {
        if (userRating > 0 || isSubmittingRating || !enrolledCourse?.course) return;

        setIsSubmittingRating(true);
        setRating(newRating); // Optimistically update UI

        try {
            const response = await createRating(enrolledCourse.course, newRating);
            console.log(response)
            if (response.newRating) {
                setUserRating(response.newRating.star);
                // Refetch average rating to show updated average
                const ratingRes = await getCourseRating(enrolledCourse.course);
                if (ratingRes) {
                    setAverageRating(ratingRes.averageStar);
                    setRatingCount(ratingRes.count);
                }
            }
        } catch (error:any) {
            Toast.show(error?.response?.data?.message || "Failed to submit rating.", Toast.LONG);
            setRating(userRating > 0 ? userRating : 0); // Revert optimistic update on failure
            // Optionally show error to user
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const handlePostComment = async () => {
        if (!comment.trim() || !enrolledCourse?.course) return;

        setIsSubmitting(true);
        try {
            const response = await sendComment(enrolledCourse.course, comment.trim());
            if (response.comment) {
                setComments(prevComments => [response.comment, ...prevComments]);
                setComment('');
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
            // Optionally, show an error message to the user
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnenroll = async () => {
        if (unenrollConfirmationText.toLowerCase() === 'unenroll') {
            console.log('Unenrolling...');
            setIsUnenrolling(true);
            try {
                await unenrollFromCourse(enrollmentId, enrolledCourse.course);
                setIsUnenrollModalVisible(false);
                setUnenrollConfirmationText(''); // Reset input
                DevSettings.reload(); // Reload the app
            } catch (err) {
                console.error('Failed to unenroll:', err);
                // Optionally, show an error message to the user
            } finally {
                setIsUnenrolling(false);
            }
        }
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

    const handleMessageTeacher = async () => {
        if (!teacherId) {
            Alert.alert('Error', 'Teacher information not available.');
            return;
        }

        try {
            console.log('Creating conversation with teacher:', teacherId);
            const response = await createConversation(teacherId);
            console.log('Conversation response:', response);
            
            // Navigate to messages page with the conversation ID
            if (response.conversation && response.conversation._id) {
                (navigation as any).navigate('Main', { 
                    screen: 'Messages',
                    params: { 
                        conversationId: response.conversation._id,
                        teacherName: teacher 
                    }
                });
            } else {
                Alert.alert('Error', 'Failed to create conversation.');
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
            Alert.alert('Error', 'Failed to start conversation. Please try again.');
        }
    };
    
    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#10B144" /></View>;
    }
    if (error || !enrolledCourse) {
        return <View style={styles.center}><Text>{error || 'No data found.'}</Text></View>;
    }

    const { courseDetails } = enrolledCourse;
    const teacher = courseDetails?.createdby ? `${courseDetails.createdby.firstName} ${courseDetails.createdby.middleName} ${courseDetails.createdby.lastName}`.trim() : 'Unknown';
    const teacherId = courseDetails?.createdby?._id;
    const handleSemesterPress = async (semester: any) => {
        setShowQuartersModal(true);
        try {
          setLoadingSemesterQuarters(true);
          const res = await getQuartersForSemester(semester._id);
          setSemesterQuarters(res.quarters || []);
        } catch (error: any) {
          Toast.show(error.message || "Failed to fetch quarters.", Toast.LONG);
        } finally {
          setLoadingSemesterQuarters(false);
        }
      };
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <ScrollView style={{ backgroundColor: '#fff' }}>
                {/* Banner */}
                <TouchableOpacity
                    style={styles.closeSimpleIcon}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                >
                    <Text style={styles.closeSimpleIconText}>×</Text>
                </TouchableOpacity>
                <View style={styles.bannerContainer}>
                    <Image source={{ uri: courseDetails.thumbnail?.url }} style={styles.bannerImage} />
                    {/* Close SimpleIcon */}

                    {/* Overlay Box */}
                    <View style={styles.bannerOverlayBox}>
                        <Text style={styles.bannerTitle}>{courseDetails.courseTitle}</Text>
                        <Text style={styles.bannerDesc}>{courseDetails.courseDescription}</Text>
                        <View style={styles.bannerTagsRow}>
                            <Text style={styles.bannerTagLabel}>Category </Text>
                            <Text style={styles.bannerTag}>{courseDetails.category?.title}</Text>
                            <Text style={styles.bannerTagLabel}> Subcategory </Text>
                            <Text style={styles.bannerTag}>{courseDetails.subcategory?.title}</Text>
                            <Text style={styles.bannerTagLabel}> Language </Text>
                            <Text style={styles.bannerTagBlue}>{courseDetails.language}</Text>
                        </View>
                    </View>
                </View>

                {/* Teacher */}
                <View style={styles.teacherRow}>
                    <View style={styles.teacherAvatar}>
                        <SimpleIcon name="person-circle-outline" size={48} color="#888" />
                    </View>
                    <Text style={styles.teacherName}>{teacher}</Text>
                    <TouchableOpacity style={styles.messageBtn} onPress={handleMessageTeacher}>
                        <Text style={styles.messageBtnText}>Message</Text>
                    </TouchableOpacity>
                </View>

                {/* Semester Information */}
                {courseDetails.semester && courseDetails.semester.length > 0 && courseDetails.semester.map((sem:any)=>(
   <TouchableOpacity
   key={sem._id}
   style={styles.semesterCard}
   onPress={() => handleSemesterPress(sem)}
 >
   <Text style={styles.semesterTitle}>Semester: {sem.title}</Text>
   <Text style={styles.semesterDate}>
       {new Date(sem.startDate).toLocaleDateString('en-US', { 
           year: 'numeric', 
           month: 'long', 
           day: 'numeric' 
       })} - {new Date(sem.endDate).toLocaleDateString('en-US', { 
           year: 'numeric', 
           month: 'long', 
           day: 'numeric' 
       })}
   </Text>
</TouchableOpacity>
                )) }

                {/* Segments */}
                <View style={styles.segmentRow}>
                    <TouchableOpacity
                        style={[styles.segmentBtn, segment === 'overview' && styles.segmentBtnActive]}
                        onPress={() => setSegment('overview')}
                    >
                        <Text style={[styles.segmentBtnText, segment === 'overview' && styles.segmentBtnTextActive]}>Overview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.segmentBtn, segment === 'reviews' && styles.segmentBtnActive]}
                        onPress={() => setSegment('reviews')}
                    >
                        <Text style={[styles.segmentBtnText, segment === 'reviews' && styles.segmentBtnTextActive]}>Reviews</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.segmentBtn, segment === 'syllabus' && styles.segmentBtnActive]}
                        onPress={() => setSegment('syllabus')}
                    >
                        <Text style={[styles.segmentBtnText, segment === 'syllabus' && styles.segmentBtnTextActive]}>Syllabus</Text>
                    </TouchableOpacity>
                </View>

                {/* Segment Content */}
                {segment === 'overview' && (
                    <View style={styles.segmentContent}>
                        <Text style={styles.sectionTitle}>What You'll Learn</Text>
                        {courseDetails.teachingPoints && courseDetails.teachingPoints.length > 0 ? (
                            courseDetails.teachingPoints.map((point: string, idx: number) => (
                                <View key={idx} style={styles.checkRow}>
                                    <Text style={styles.checkSimpleIcon}>✔️</Text>
                                    <Text style={styles.checkText}>{point}</Text>
                                </View>
                            ))
                        ) : <Text style={styles.sectionSubtitle}>No teaching points.</Text>}

                        <Text style={styles.sectionTitle}>Requirements</Text>
                        {courseDetails.requirements && courseDetails.requirements.length > 0 ? (
                            courseDetails.requirements.map((req: string, idx: number) => (
                                <View key={idx} style={styles.checkRow}>
                                    <Text style={styles.checkSimpleIcon}>✔️</Text>
                                    <Text style={styles.checkText}>{req}</Text>
                                </View>
                            ))
                        ) : <Text style={styles.sectionSubtitle}>No requirements.</Text>}

                        <TouchableOpacity style={styles.unenrollBtn} onPress={() => setIsUnenrollModalVisible(true)}>
                            <Text style={styles.unenrollBtnText}>Unenroll</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {segment === 'reviews' && (
                    <View style={styles.segmentContent}>
                        {reviewsLoading ? (
                            <ActivityIndicator size="large" color="#10B144" />
                        ) : (
                            <>
                                <Text style={styles.sectionTitle}>Rate this course {userRating}</Text>
                                {userRating > 0 ? (
                                    <View style={styles.starsRow}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Text key={i} style={[styles.star, { color: i <= userRating ? '#FFD700' : '#E0E0E0' }]}>★</Text>
                                        ))}
                                        <Text style={styles.rateText}>{`You rated this course ${userRating} star${userRating > 1 ? 's' : ''}`}</Text>
                                    </View>
                                ) : (
                                    <View style={styles.starsRow}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <TouchableOpacity key={i} onPress={() => handleRateCourse(i)} disabled={isSubmittingRating}>
                                                <Text style={[styles.star, { color: i <= rating ? '#FFD700' : '#E0E0E0' }]}>★</Text>
                                            </TouchableOpacity>
                                        ))}
                                        <Text style={styles.rateText}>{rating > 0 ? `You rated this course ${rating} star${rating > 1 ? 's' : ''}` : 'Click to rate'}</Text>
                                    </View>
                                )}

                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Text key={i} style={[styles.star, { color: i <= averageRating ? '#FFD700' : '#E0E0E0' }]}>★</Text>
                                    ))}
                                    <Text style={styles.rateText}>{averageRating.toFixed(1)} ({ratingCount} ratings)</Text>
                                </View>

                                <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
                                <View style={styles.commentBox}>
                                    <TextInput
                                        style={styles.commentInput}
                                        placeholder="Add a comment..."
                                        placeholderTextColor="#888"
                                        value={comment}
                                        onChangeText={setComment}
                                        multiline
                                    />
                                    <TouchableOpacity
                                        style={[styles.postBtn, (!comment.trim() || isSubmitting) && styles.postBtnDisabled]}
                                        disabled={!comment.trim() || isSubmitting}
                                        onPress={handlePostComment}
                                    >
                                        <Text style={styles.postBtnText}>Post Comment</Text>
                                    </TouchableOpacity>
                                </View>

                                {comments.length > 0 ? (
                                    comments.map((c: any) => {
                                        const date = new Date(c.createdAt);
                                        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                                        const userName = c.createdby ? `${c.createdby.firstName} ${c.createdby.lastName}` : (c.user?.firstName || 'User');
                                        const userRole = c.createdby?.role;

                                        return (
                                            <View key={c._id} style={styles.commentItem}>
                                                <View style={styles.commentHeader}>
                                                    <View style={styles.commentAvatar}>
                                                        <SimpleIcon name="person-circle-outline" size={32} color="#888" />
                                                    </View>
                                                    <Text style={styles.commentUser}>{userName}</Text>
                                                    {userRole && (
                                                        <View style={styles.roleBadge}>
                                                            <Text style={styles.roleText}>{userRole.toUpperCase()}</Text>
                                                        </View>
                                                    )}
                                                    <Text style={styles.commentDate}>{formattedDate}</Text>
                                                </View>
                                                <Text style={styles.commentText}>{c.text}</Text>
                                            </View>
                                        );
                                    })
                                ) : (
                                    <Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>
                                )}
                            </>
                        )}
                    </View>
                )}
                {segment === 'syllabus' && (
                    <View style={styles.segmentContent}>
                        <Text style={styles.sectionTitle}>Course Syllabus</Text>
                        {courseDetails.syllabus && courseDetails.syllabus.url ? (
                            <View style={styles.syllabusContainer}>
                                <View style={styles.syllabusCard}>
                                    <SimpleIcon name="document-text" size={32} color="#10B144" />
                                    <View style={styles.syllabusInfo}>
                                        <Text style={styles.syllabusTitle}>{courseDetails.syllabus.filename || 'Course Syllabus'}</Text>
                                        <Text style={styles.syllabusSubtitle}>PDF Document</Text>
                                        <Text style={styles.syllabusDate}>
                                            Uploaded: {new Date(courseDetails.syllabus.uploadedAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.downloadButton}
                                        onPress={() => handleOpenSyllabus(courseDetails.syllabus.url)}
                                    >
                                        <SimpleIcon name="open-outline" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.tabContentCentered}>
                                <SimpleIcon name="document-text-outline" size={48} color="#ccc" />
                                <Text style={styles.sectionSubtitle}>No syllabus available</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
            {teacherId && (
                <ConversationsModal
                    visible={isConversationsModalVisible}
                    onClose={() => setIsConversationsModalVisible(false)}
                    teacherId={teacherId}
                />
            )}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isUnenrollModalVisible}
                onRequestClose={() => {
                    setIsUnenrollModalVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Confirm Unenrollment</Text>
                        <Text style={styles.modalDescription}>
                            To confirm, type <Text style={{ fontWeight: 'bold' }}>unenroll</Text> below. This action cannot be undone.
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Type 'unenroll' to confirm"
                            placeholderTextColor="#888"
                            value={unenrollConfirmationText}
                            onChangeText={setUnenrollConfirmationText}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={[
                                styles.modalButton,
                                styles.unenrollModalButton,
                                (unenrollConfirmationText.toLowerCase() !== 'unenroll' || isUnenrolling) && styles.modalButtonDisabled
                            ]}
                            disabled={unenrollConfirmationText.toLowerCase() !== 'unenroll' || isUnenrolling}
                            onPress={handleUnenroll}
                        >
                            {isUnenrolling ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.unenrollModalButtonText}>Unenroll</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            disabled={isUnenrolling}
                            onPress={() => {
                                setIsUnenrollModalVisible(false);
                                setUnenrollConfirmationText('');
                                setIsUnenrolling(false);
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
        visible={showQuartersModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowQuartersModal(false)}
      >
        <View style={styles.quartersModalContainer}>
          <View style={styles.quartersModalHeader}>
            <Text style={styles.quartersModalTitle}>Quarters</Text>
            <TouchableOpacity onPress={() => setShowQuartersModal(false)}>
              <SimpleIcon name="close" size={32} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {loadingSemesterQuarters ? (
              <ActivityIndicator
                size="large"
                color="#10B144"
                style={{ marginTop: 20 }}
              />
            ) : semesterQuarters.length > 0 ? (
              semesterQuarters.map((quarter: any) => (
                <TouchableOpacity
                  key={quarter._id}
                  style={styles.quarterCard}
                  onPress={() => handleQuarterCardPress(quarter)}
                >
                  <Text
                    style={styles.quarterTitle}
                  >{`Quarter: ${quarter.title}`}</Text>
                  <Text style={styles.quarterDates}>
                    {formatDateWithOrdinal(quarter.startDate)} -{" "}
                    {formatDateWithOrdinal(quarter.endDate)}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                No quarters found for this semester.
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>
      <Modal
        visible={showChaptersForQuarterModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowChaptersForQuarterModal(false);
          setShowQuartersModal(true);
        }}
      >
        <View style={styles.chaptersModalContainer}>
          <View style={styles.chaptersModalHeader}>
            <Text style={styles.chaptersModalTitle}>Chapters</Text>
            <TouchableOpacity
              onPress={() => {
                setShowChaptersForQuarterModal(false);
                setShowQuartersModal(true);
              }}
            >
              <SimpleIcon name="close" size={32} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.chaptersContent}>




            {loadingChaptersForQuarter ? (
              <ActivityIndicator
                style={{ marginTop: 20 }}
                size="large"
                color="#10B144"
              />
            ) : chaptersForQuarter.length > 0 ? (
              <ScrollView>
                {chaptersForQuarter.map((chapter, index) => {
                  console.log(chapter)
                  return (

                    <TouchableOpacity
                    key={chapter._id}
                    style={styles.quarterCard}
                    onPress={() => handleQuarterCardPress(chapter)}
                  >
                    <Text
                      style={styles.quarterTitle}
                    >{`Quarter: ${chapter.title}`}</Text>
                    <Text style={styles.quarterDates}>
                   {chapter?.description}
                    </Text>
                  </TouchableOpacity>

                 
                  );
                })}
              </ScrollView>
            ) : (
              <Text
                style={{ textAlign: "center", marginTop: 20, fontSize: 16 }}
              >
                {chaptersMessage}
              </Text>
            )}
          </View>
        </View>
      </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    bannerContainer: { position: 'relative', height: 180, margin: 16, borderRadius: 16, overflow: 'hidden' },
    bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    bannerOverlayBox: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 12,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    closeSimpleIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 16,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    closeSimpleIconText: {
        fontSize: 22,
        color: '#222',
        fontWeight: 'bold',
        lineHeight: 28,
        textAlign: 'center',
    },
    bannerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 4 },
    bannerDesc: { fontSize: 16, color: '#222', marginBottom: 8 },
    bannerTagsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 },
    bannerTagLabel: { fontWeight: 'bold', color: '#222', fontSize: 15 },
    bannerTag: { backgroundColor: '#D1FADF', color: '#111', borderRadius: 8, paddingHorizontal: 8, marginHorizontal: 2, fontSize: 15 },
    bannerTagBlue: { backgroundColor: '#E0EDFF', color: '#111', borderRadius: 8, paddingHorizontal: 8, marginHorizontal: 2, fontSize: 15 },
    teacherRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 8, marginBottom: 8 },
    teacherAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'transparent',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    teacherName: { fontWeight: 'bold', fontSize: 18, color: '#222', flex: 1 },
    messageBtn: { backgroundColor: '#10B144', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
    messageBtnText: { color: '#fff', fontWeight: 'bold' },
    segmentRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, marginBottom: 8, backgroundColor: '#F5F6F7', borderRadius: 10 },
    segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    segmentBtnActive: { backgroundColor: '#fff', elevation: 2 },
    segmentBtnText: { fontSize: 17, color: '#222', fontWeight: '500' },
    segmentBtnTextActive: { color: '#10B144', fontWeight: 'bold' },
    segmentContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 8, marginTop: 12 },
    sectionSubtitle: { fontSize: 16, color: '#888', marginBottom: 8 },
    checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    checkSimpleIcon: { fontSize: 18, color: '#10B144', marginRight: 8 },
    checkText: { fontSize: 16, color: '#222' },
    unenrollBtn: { backgroundColor: '#FF6347', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginTop: 18, alignSelf: 'center',width:"90%",justifyContent:"center" },
    unenrollBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16,textAlign:"center" },
    starsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    star: { fontSize: 28, color: '#FFD700', marginRight: 2 },
    rateText: { fontSize: 16, color: '#888', marginLeft: 8 },
    commentBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F6F7', borderRadius: 8, padding: 8, marginTop: 8 },
    commentInput: { flex: 1, color: '#222', fontSize: 16, maxHeight: 100, textAlignVertical: 'top', padding: 4 },
    postBtn: { backgroundColor: '#10B144', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, marginLeft: 8 },
    postBtnDisabled: { backgroundColor: '#E0E0E0' },
    postBtnText: { color: '#fff', fontWeight: 'bold' },
    noComments: { color: '#888', fontSize: 15, textAlign: 'center', marginTop: 32 },
    commentItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'transparent',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentUser: {
        fontWeight: 'bold',
        color: '#222',
        fontSize: 16,
        marginRight: 8,
    },
    roleBadge: {
        backgroundColor: '#10B144',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    roleText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    commentDate: {
        fontSize: 14,
        color: '#888',
        marginLeft: 'auto',
    },
    commentText: {
        fontSize: 16,
        color: '#333',
        paddingLeft: 40, // Aligns with the text, not the avatar
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    modalInput: {
        width: '100%',
        height: 50,
        borderColor: '#10B144',
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 20,
    },
    modalButton: {
        width: '100%',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    unenrollModalButton: {
        backgroundColor: '#FF6347',
    },
    modalButtonDisabled: {
        backgroundColor: '#FFB3A1',
    },
    unenrollModalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cancelButtonText: {
        color: '#111',
        fontWeight: 'bold',
        fontSize: 16,
    },
    semesterCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    semesterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 4,
    },
    semesterDate: {
        fontSize: 14,
        color: '#888',
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
        backgroundColor: '#10B144',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabContentCentered: {
        alignItems: 'center',
        marginTop: 32,
    },
    quartersModalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  quartersModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: Platform.OS === "ios" ? 40 : 10,
  },
  quartersModalTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  quarterCard: {
    backgroundColor: "#eef2f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  quarterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  quarterDates: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
  },
  chaptersModalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  chaptersModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: Platform.OS === "ios" ? 40 : 10,
  },
  chaptersModalTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  chaptersContent: {
    paddingHorizontal: 8,
    flex: 1,
  },
  chaptersHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 16,
  },
  chaptersHeaderButtonText: {
    fontSize: 18,
    fontWeight: "600",
    paddingLeft: 20,
  },
  createChapterButton: {
    backgroundColor: "#00C853",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  createChapterButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  chapterItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  // chapterItemTitle: {
  //     fontSize: 16,
  //     fontWeight: 'bold',
  //     marginBottom: 4,
  // },
  createChapterModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  createChapterInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
});

export default CourseDetailStudentPageEnrolled; 
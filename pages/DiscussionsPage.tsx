import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Image, FlatList } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { getAllDiscussions, createDiscussion, getDiscussionDetails, getDiscussionComments, sendDiscussionComment } from '../services/discussion';
import { getAllCourses } from '../services/course';
import { getStoredUserId } from '../utils/storage';
import SimpleIcon from '../components/SimpleIcon';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
// You will need to install react-native-document-picker: npm install react-native-document-picker or yarn add react-native-document-picker
// import DocumentPicker from 'react-native-document-picker'; // Commenting out the import
export interface Discussion {
  _id: string;
  dueDate: {
    date: string;
    time: string;
  };
  course: {
    _id: string;
    courseTitle: string;
    thumbnail: Thumbnail;
  };
  totalMarks: number;
  topic: string;
  description: string;
  files: DiscussionFile[];
  category: string;
  semester: string;
  quarter: string;
  chapter: string;
  type: string;
  createdby: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface DiscussionFile {
  _id: string;
  url: string;
  type: string;
  filename: string;
  publicId: string;
}

export interface Thumbnail {
  url: string;
  publicId: string;
  filename: string;
}
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const DiscussionsPage = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp>()
  // Modal form states
  const [discussionTypeOpen, setDiscussionTypeOpen] = useState(false);
  const [discussionTypeValue, setDiscussionTypeValue] = useState<string | null>(null);
  const [discussionTypeItems, setDiscussionTypeItems] = useState([
    { label: 'Course', value: 'course' },
    { label: 'Public', value: 'public' },
  ]);

  const [courseOpen, setCourseOpen] = useState(false);
  const [courseValue, setCourseValue] = useState<string | null>(null);
  const [courseItems, setCourseItems] = useState<{ label: string; value: string; }[]>([]);

  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Discussion details modal states
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);
  const [discussionDetails, setDiscussionDetails] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDiscussions();
      setDiscussions(data.discussions || []);
    } catch (err: any) {
      console.error('Failed to fetch discussions:', err);
      setError(err.message || 'Failed to load discussions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const coursesRes = await getAllCourses();
      if (coursesRes.courses) {
        const formattedCourses = coursesRes.courses.map((course: any) => ({
          label: course.courseTitle,
          value: course._id,
        }));
        setCourseItems(formattedCourses);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      Alert.alert('Error', 'Failed to load courses for discussion creation.');
    }
  };

  useEffect(() => {
    fetchDiscussions();
    fetchCourses();
    // Get my user id for chat alignment
    getStoredUserId().then(setMyUserId);
  }, []);

  const handleCreateDiscussion = async () => {
    if (
      !discussionTypeValue ||
      !topic.trim() ||
      !description.trim() ||
      (discussionTypeValue === 'course' && !courseValue)
    ) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }

    try {
      setCreateLoading(true);
      const discussionData = {
        type: discussionTypeValue as 'course' | 'public',
        topic: topic.trim(),
        description: description.trim(),
        ...(discussionTypeValue === 'course' && { courseId: courseValue }),
        // ...(selectedFile && { file: selectedFile }),
      };
      await createDiscussion(discussionData);
      Alert.alert('Success', 'Discussion created successfully!');
      setModalVisible(false);
      // Reset form fields
      setDiscussionTypeValue(null);
      setCourseValue(null);
      setTopic('');
      setDescription('');
      // setSelectedFile(null); // Commenting out reset
      fetchDiscussions(); // Refresh the list of discussions
    } catch (err: any) {
      console.error('Error creating discussion:', err);
      Alert.alert('Error', err.message || 'Failed to create discussion.');
    } finally {
      setCreateLoading(false);
    }
  };

  // const handleFilePick = async () => { // Commenting out the function
  //   try {
  //     const res = await DocumentPicker.pick({
  //       type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
  //     });
  //     setSelectedFile(res[0]);
  //   } catch (err) {
  //     if (DocumentPicker.isCancel(err)) {
  //       console.log('User cancelled the picker');
  //     } else {
  //       console.error('DocumentPicker Error:', err);
  //       Alert.alert('Error', 'Failed to pick file.');
  //     }
  //   }
  // };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const fetchDiscussionDetails = async (discussionId: string) => {
    setDetailsLoading(true);
    try {
      const data = await getDiscussionDetails(discussionId);
      setDiscussionDetails(data.discussion);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch discussion details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchDiscussionComments = async (discussionId: string, page = 1) => {
    setCommentsLoading(true);
    try {
      const data = await getDiscussionComments(discussionId, page, 5);
      setComments(data.discussionComments || []);
      setCommentsTotalPages(data.totalPages || 1);
      setCommentsPage(data.currentPage || 1);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch comments.');
    } finally {
      setCommentsLoading(false);
    }
  };

  const openDetailsModal = (discussionId: string) => {
    setSelectedDiscussionId(discussionId);
    setDetailsModalVisible(true);
    setDiscussionDetails(null);
    setComments([]);
    fetchDiscussionDetails(discussionId);
    fetchDiscussionComments(discussionId, 1);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedDiscussionId(null);
    setDiscussionDetails(null);
    setComments([]);
    setCommentInput('');
    setCommentsPage(1);
    setCommentsTotalPages(1);
  };

  const handleCommentsPageChange = (newPage: number) => {
    if (selectedDiscussionId) {
      fetchDiscussionComments(selectedDiscussionId, newPage);
    }
  };

  const handleSendComment = async () => {
    if (!selectedDiscussionId || !commentInput.trim()) return;
    setSending(true);
    try {
      const res = await sendDiscussionComment(selectedDiscussionId, commentInput.trim());
      if (res.message === 'Comment sent successfully') {
        setCommentInput('');
        fetchDiscussionComments(selectedDiscussionId, 1);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to send comment.');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Create Discussion Button Hidden */}
      {/* <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.createButtonText}>Create Discussion</Text>
      </TouchableOpacity> */}

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : discussions.length === 0 ? (
        <Text style={styles.noDiscussionsText}>No discussions available.</Text>
      ) : (

        discussions && discussions.length > 0 ? (
          <View style={styles.discussionsGrid}>
            {discussions.map((discussion: Discussion, index: number) => (
              <TouchableOpacity key={index} style={styles.discussionCard} onPress={() => navigation.navigate('DiscussionStudent', { discussionId: discussion?._id })}>


                <Image source={{ uri: discussion.course.thumbnail.url }} style={{ width: '100%', height: 150 }} />

                <Text style={styles.dueDate}>Due Date: {new Date(discussion.dueDate.date).toDateString()}</Text>

                <View style={styles.chapterBadge}>
                  <Text style={styles.chapterBadgeText}>{discussion.type}</Text>
                </View>

                <Text style={styles.discussionTitle}>{discussion.topic}</Text>
                <Text style={styles.discussionSubtitle}>{discussion.course.courseTitle || "test"}</Text>
                <Text style={styles.discussionDescription}>{discussion.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <SimpleIcon name="chat-bubble-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No discussions available</Text>
          </View>
        )
        // discussions.map((discussion: any) => (
        //   <TouchableOpacity key={discussion._id} onPress={() => openDetailsModal(discussion._id)}>
        //     <View style={styles.discussionCard}>
        //       {discussion.type === 'course' && discussion.course && discussion.course.thumbnail && discussion.course.thumbnail.url && (
        //         <Image
        //           source={{ uri: discussion.course.thumbnail.url }}
        //           style={styles.courseThumbnail}
        //           resizeMode="cover"
        //         />
        //       )}
        //       <Text style={styles.discussionTypeTag}>{discussion.type}</Text>
        //       <Text style={styles.discussionTitle}>{discussion.topic}</Text>
        //       {discussion.type === 'course' && discussion.course && (
        //         <Text style={styles.discussionCourse}>Course: {discussion.course.courseTitle}</Text>
        //       )}
        //       <Text style={styles.discussionDescription}>{discussion.description}</Text>
        //       <Text style={styles.discussionDate}>Created: {formatDate(discussion.createdAt)}</Text>
        //     </View>
        //   </TouchableOpacity>
        // ))
      )}

      {/* Details Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={detailsModalVisible}
        onRequestClose={closeDetailsModal}
      >
        <View style={styles.fullScreenModal}>
          {/* Modal Header with Title and Close Icon */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle} numberOfLines={1} ellipsizeMode="tail">
              {discussionDetails?.topic || 'Discussion'}
            </Text>
            <TouchableOpacity style={styles.modalHeaderClose} onPress={closeDetailsModal}>
              <Text style={styles.closeIconText}>×</Text>
            </TouchableOpacity>
          </View>
          {detailsLoading ? (
            <ActivityIndicator size="large" color="#007bff" style={{ alignSelf: 'center', marginVertical: 20 }} />
          ) : discussionDetails ? (
            <>
              {/* Only Chat Section, no image, no course, no created/by */}
              <View style={styles.chatSectionOnly}>
                <Text style={styles.commentsTitle}>Comments</Text>
                {commentsLoading ? (
                  <ActivityIndicator size="small" color="#007bff" style={{ marginVertical: 10 }} />
                ) : comments.length === 0 ? (
                  <Text style={styles.noCommentsText}>No comments yet</Text>
                ) : (
                  <FlatList
                    data={comments}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => {
                      const isMine = !!myUserId && item.createdby && item.createdby._id === myUserId;
                      return (
                        <View style={[styles.chatBubbleRow, isMine ? styles.chatBubbleRowRight : styles.chatBubbleRowLeft]}>
                          {!isMine && (
                            <Text style={styles.chatUserInitials}>{(item.createdby?.firstName || '').charAt(0).toUpperCase()}</Text>
                          )}
                          <View style={[styles.chatBubble, isMine ? styles.chatBubbleMine : styles.chatBubbleOther]}>
                            <Text style={styles.chatUserName}>
                              {item.createdby?.firstName || ''} {item.createdby?.middleName || ''} {item.createdby?.lastName || ''}
                            </Text>
                            <Text style={styles.chatText}>{item.text}</Text>
                          </View>
                          {isMine && (
                            <Text style={styles.chatUserInitials}>{(item.createdby?.firstName || '').charAt(0).toUpperCase()}</Text>
                          )}
                        </View>
                      );
                    }}
                    style={{ width: '100%' }}
                  />
                )}
                {/* Pagination Controls */}
                {commentsTotalPages > 1 && (
                  <View style={styles.paginationContainer}>
                    <TouchableOpacity
                      style={[styles.paginationButton, commentsPage === 1 && { opacity: 0.5 }]}
                      disabled={commentsPage === 1}
                      onPress={() => handleCommentsPageChange(commentsPage - 1)}
                    >
                      <Text style={styles.paginationButtonText}>{'<'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.paginationText}>{commentsPage} / {commentsTotalPages}</Text>
                    <TouchableOpacity
                      style={[styles.paginationButton, commentsPage === commentsTotalPages && { opacity: 0.5 }]}
                      disabled={commentsPage === commentsTotalPages}
                      onPress={() => handleCommentsPageChange(commentsPage + 1)}
                    >
                      <Text style={styles.paginationButtonText}>{'>'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              {/* Chat Input at Bottom */}
              <View style={styles.commentInputContainerFull}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  value={commentInput}
                  onChangeText={setCommentInput}
                />
                <TouchableOpacity
                  style={[styles.sendButton, commentInput.trim() && !sending ? { opacity: 1 } : { opacity: 0.5 }]}
                  disabled={!commentInput.trim() || sending}
                  onPress={handleSendComment}
                >
                  <Text style={styles.sendButtonText}>{sending ? '...' : 'Send'}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.errorText}>No details found.</Text>
          )}
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Create New Discussion</Text>

            <DropDownPicker
              open={discussionTypeOpen}
              value={discussionTypeValue}
              items={discussionTypeItems}
              setOpen={setDiscussionTypeOpen}
              setValue={setDiscussionTypeValue}
              setItems={setDiscussionTypeItems}
              placeholder="Select a type"
              style={styles.dropdownPicker}
              containerStyle={styles.dropdownContainerStyle}
              zIndex={3000}
              zIndexInverse={1000}
            />

            {discussionTypeValue === 'course' && (
              <DropDownPicker
                open={courseOpen}
                value={courseValue}
                items={courseItems}
                setOpen={setCourseOpen}
                setValue={setCourseValue}
                setItems={setCourseItems}
                placeholder="Select Course"
                style={styles.dropdownPicker}
                containerStyle={styles.dropdownContainerStyle}
                zIndex={2000}
                zIndexInverse={2000}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Topic"
              value={topic}
              onChangeText={setTopic}
              placeholderTextColor="#000"
            />

            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description"
              multiline
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#000"
            />

            {/* Commenting out file picker container */}
            {/*
            <View style={styles.filePickerContainer}>
              <Text style={styles.filePickerLabel}>Attach File (Only PNG, JPEG, JPG, and PDF files are allowed.)</Text>
              <TouchableOpacity style={styles.chooseFileButton} onPress={handleFilePick}>
                <Text style={styles.chooseFileButtonText}>Choose file</Text>
              </TouchableOpacity>
              <Text style={styles.fileName}>{selectedFile ? selectedFile.fileName : 'No file chosen'}</Text>
            </View>
            */}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateDiscussion}
              disabled={createLoading}
            >
              {createLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create Discussion</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  createButton: {
    backgroundColor: '#00c853',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
  noDiscussionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },

  discussionTypeTag: {
    backgroundColor: '#a7d9ff',
    color: '#007bff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },

  discussionCourse: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },

  discussionDate: {
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  dropdownPicker: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderRadius: 8,
  },
  dropdownContainerStyle: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
  filePickerContainer: {
    width: '100%',
    marginBottom: 20,
  },
  filePickerLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  chooseFileButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  chooseFileButtonText: {
    color: '#555',
    fontSize: 16,
  },
  fileName: {
    marginTop: 8,
    fontSize: 14,
    color: '#777',
  },
  submitButton: {
    backgroundColor: '#00c853',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  courseThumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  createdByText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  commentsSection: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  noCommentsText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
  commentItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  commentAuthor: {
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 15,
    color: '#333',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#00c853',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  paginationButton: {
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  paginationButtonText: {
    fontSize: 18,
    color: '#333',
  },
  paginationText: {
    fontSize: 16,
    color: '#333',
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatSection: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    marginBottom: 10,
    minHeight: 200,
  },
  chatBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chatUserInitials: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00c853',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 8,
    marginTop: 2,
    overflow: 'hidden',
  },
  chatBubble: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chatUserName: {
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    fontSize: 14,
  },
  chatText: {
    fontSize: 15,
    color: '#333',
  },
  commentInputContainerFull: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    zIndex: 20,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    marginRight: 10,
  },
  modalHeaderClose: {
    padding: 4,
    marginLeft: 8,
  },
  chatSectionOnly: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 15,
    marginTop: 60,
    marginBottom: 10,
    minHeight: 200,
  },
  chatBubbleRowLeft: {
    justifyContent: 'flex-start',
  },
  chatBubbleRowRight: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
  },
  chatBubbleMine: {
    backgroundColor: '#00c85322',
    alignSelf: 'flex-end',
  },
  chatBubbleOther: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  closeIconText: {
    fontSize: 32,
    color: '#333',
    fontWeight: 'bold',
  },
  discussionsGrid: {
    // flexDirection: "row",
    justifyContent: 'center',
    flexWrap: "wrap",
  },
  discussionCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  discussionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  discussionLessonsLabel: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    flex: 1,
  },
  discussionBadge: {
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  discussionBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  discussionContent: {
    borderLeftWidth: 3,
    borderLeftColor: "#10B144",
    paddingLeft: 12,
    marginBottom: 12,
  },
  dueDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: "#666",
    marginBottom: 8,
  },
  chapterBadge: {
    backgroundColor: "#6366f1",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  chapterBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  discussionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  discussionSubtitle: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "600",
    marginBottom: 4,
  },
  discussionDescription: {
    fontSize: 14,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#888",
    marginTop: 12,
  },
});

export default DiscussionsPage; 
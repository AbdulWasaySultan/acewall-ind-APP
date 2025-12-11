import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Linking, Modal, TextInput, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getDiscussionsForChapter, getDiscussionsForLesson, createDiscussionForChapter, createDiscussionForLesson, getDiscussionDetails, getDiscussionComments } from '../services/discussion';
import { addAuthInterceptor, createApiInstance, getAssessmentCategories } from '../services/course';
import * as ImagePicker from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-simple-toast';
import SimpleIcon from '../components/SimpleIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
type RouteParams = RouteProp<RootStackParamList, 'ChapterDiscussions'>;

const ChapterDiscussionsPage = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { chapterId, courseId, semesterId, quarterId, lessonId,navigateBack } = route.params;
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);


  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);


  const [file, setFile] = useState<any | null>(null);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<any | null>(null);
  const [discussionDetails, setDiscussionDetails] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingDiscussion, setLoadingDiscussion] = useState(false);

  const [quarterDates, setQuarterDates] = useState<{ startDate: string, endDate: string } | null>(null);
  const fetchQuarterDates = async () => {
    try {
      const api = await createApiInstance();
      addAuthInterceptor(api);

      const response = await api.get(`/api/quarter/getDatesofQuarter/${quarterId}`);
      setQuarterDates({
        startDate: response.data.startDate,
        endDate: response.data.endDate
      });
    } catch (error) {
      console.error('Error fetching quarter dates:', error);
      // Don't show error toast as this is not critical
    }
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = lessonId ? await getDiscussionsForLesson(lessonId) : await getDiscussionsForChapter(chapterId);
        setItems(res.discussion || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch discussions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    fetchQuarterDates()
  }, [chapterId]);

  const openDiscussionModal = async (discussion: any) => {
    try {
      setLoadingDiscussion(true);
      setSelectedDiscussion(discussion);
      setShowDiscussionModal(true);

      // Fetch discussion details and comments
      const [detailsRes, commentsRes] = await Promise.all([
        getDiscussionDetails(discussion._id),
        getDiscussionComments(discussion._id, 1, 5)
      ]);

      setDiscussionDetails(detailsRes.discussion);
      setComments(commentsRes.discussionComments || []);
    } catch (err: any) {
      Toast.show(err.message || 'Failed to load discussion details', Toast.LONG);
    } finally {
      setLoadingDiscussion(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
  <View style={[styles.header,{paddingTop:insets.top}]}>
      <TouchableOpacity onPress={() => navigateBack?navigateBack():(navigation as any).goBack()} style={{ padding: 4, marginRight: 12 }}>
          <SimpleIcon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lessonId ? 'Lesson Discussions' : 'Chapter Discussions'}</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={{ padding: 16 }}>
        <TouchableOpacity style={styles.createButton} onPress={async () => {
          try {
            setShowCreate(true);
            const res = await getAssessmentCategories(courseId);
            setCategories(res.categories || []);
          } catch (e: any) {
            Toast.show(e.message || 'Failed to load categories', Toast.LONG);
          }
        }}>
          <Text style={styles.createButtonText}>Create Discussion</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#10B144" /></View>
      ) : error ? (
        <View style={styles.centered}><Text style={{ color: 'red' }}>{error}</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {items.map((d) => {
            const bannerUrl = d.course?.thumbnail?.url;
            return (
              <TouchableOpacity key={d._id} style={styles.card} onPress={() => openDiscussionModal(d)}>
                {!!bannerUrl && (
                  <Image source={{ uri: bannerUrl }} style={styles.banner} />
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                  <View style={styles.badge}><Text style={styles.badgeText}>{lessonId ? 'lesson' : 'chapter'}</Text></View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.dueDateLabel}>Due Date:</Text>
                    <Text style={styles.dueDateValue}>
                      {new Date(d.dueDate?.date).toLocaleDateString('en-GB')}  {d.dueDate?.time}
                    </Text>
                  </View>
                </View>
                <Text style={styles.title}>{d.topic}</Text>
                <Text style={styles.courseTitle}>{d?.course?.courseTitle}</Text>
                <Text style={styles.description}>{d.description}</Text>
                <Text style={styles.dateRight}>{new Date(d.createdAt).toLocaleDateString('en-GB')}</Text>
              </TouchableOpacity>
            )
          })}
          {items.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#6b7280' }}>No discussions found.</Text>
          )}
        </ScrollView>
      )}

      <Modal
        visible={showCreate}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowCreate(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={[styles.header,{paddingTop:insets.top}]}>
            <TouchableOpacity onPress={() => setShowCreate(false)} style={{ padding: 4, marginRight: 12 }}>
              <SimpleIcon name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Discussion</Text>
            <View style={{ width: 28 }} />
          </View>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.inputLabel}>Topic</Text>
            <TextInput style={styles.textInput} value={topic} onChangeText={setTopic} placeholder="Topic" />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, { minHeight: 100, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              multiline
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Total Points</Text>
                <TextInput style={styles.textInput} value={totalMarks} onChangeText={setTotalMarks} keyboardType="numeric" placeholder="0" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Category</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => setShowCategoryMenu((s) => !s)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownTriggerText}>
                    {categories.find((c) => c._id === categoryId)?.name || 'Select a Topic'}
                  </Text>
                  <SimpleIcon name={showCategoryMenu ? 'chevron-up' : 'chevron-down'} size={18} color="#333" />
                </TouchableOpacity>
                {showCategoryMenu && (
                  <View style={styles.dropdownMenu}>
                    <ScrollView>
                      {categories.map((c) => (
                        <TouchableOpacity
                          key={c._id}
                          onPress={() => {
                            setCategoryId(c._id);
                            setShowCategoryMenu(false);
                          }}
                          style={[styles.dropdownItem, categoryId === c._id && styles.dropdownItemActive]}
                        >
                          <Text style={{ color: '#111' }}>{c.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.inputLabel}>Due Date</Text>
            <TouchableOpacity
              style={styles.textInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: dueDate ? '#111' : '#9ca3af' }}>{dueDate
                ? `${formatDate(dueDate)} at ${formatTime(dueDate)}`
                : 'Select Due Date'}</Text>
            </TouchableOpacity>


            <Text style={styles.inputLabel}>Attach Image (PNG, JPEG, JPG)</Text>
            <TouchableOpacity
              style={styles.filePickerButton}
              onPress={async () => {
                ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (res) => {
                  if (res.didCancel || res.errorMessage) return;
                  const asset = res.assets && res.assets[0];
                  if (asset) {
                    setFile({ uri: asset.uri, type: asset.type || 'image/jpeg', name: asset.fileName || asset.uri?.split('/').pop() || 'image.jpg' });
                  }
                });
              }}
            >
              <Text style={styles.filePickerButtonText}>{file?.name || 'Choose image No file chosen'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createButton, creating && { opacity: 0.7 }]}
              disabled={creating}
              onPress={async () => {
                if (!topic.trim() || !description.trim() || !categoryId || !totalMarks) {
                  Alert.alert('Validation', 'Topic, Description, Category and Total Points are required.');
                  return;
                }
                if (dueDate && quarterDates) {
                  const dueDateTimestamp = dueDate.getTime();
                  const quarterStartTimestamp = new Date(quarterDates.startDate).getTime();
                  const quarterEndTimestamp = new Date(quarterDates.endDate).getTime();
                
                  if (dueDateTimestamp < quarterStartTimestamp || dueDateTimestamp > quarterEndTimestamp) {
                    Toast.show(
                      `Due date must be between ${formatDate(new Date(quarterDates.startDate))} and ${formatDate(new Date(quarterDates.endDate))}`,
                      Toast.LONG
                    );
                    return;
                  }
                }
                if (!dueDate) {
                  Alert.alert('Validation', 'Please select due date');
                  return;
                }
                try {
                  setCreating(true);
                  setError(null);
                  const due = {
                    date: new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).toISOString(),
                    time: `${String(dueDate.getHours()).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}`,
                    dateTime: dueDate.toISOString(),
                  };
                  const res = lessonId
                    ? await createDiscussionForLesson({
                      course: courseId,
                      topic: topic.trim(),
                      description: description.trim(),
                      category: categoryId,
                      type: 'lesson',
                      dueDate: due,
                      totalMarks: Number(totalMarks),
                      semester: semesterId,
                      quarter: quarterId,
                      lesson: lessonId,
                      file,
                    })
                    : await createDiscussionForChapter({
                      course: courseId,
                      topic: topic.trim(),
                      description: description.trim(),
                      category: categoryId,
                      type: 'chapter',
                      dueDate: due,
                      totalMarks: Number(totalMarks),
                      semester: semesterId,
                      quarter: quarterId,
                      chapter: chapterId,
                      file,
                    });
                  Toast.show(res.message || 'Discussion created successfully', Toast.LONG);
                  setShowCreate(false);
                  setTopic(''); setDescription(''); setTotalMarks(''); setCategoryId(''); setDueDate(null); setFile(null);
                  // refresh
                  setLoading(true);
                  const refreshed = lessonId ? await getDiscussionsForLesson(lessonId) : await getDiscussionsForChapter(chapterId);
                  setItems(refreshed.discussion || []);
                } catch (err: any) {
                  Toast.show(err.message || 'Failed to create discussion', Toast.LONG);
                } finally {
                  setCreating(false);
                  setLoading(false);
                }
              }}
            >
              {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.createButtonText}>Create Discussion</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCreate(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
          </KeyboardAvoidingView>
          {showDatePicker && (
             <>
             {Platform.OS === 'ios' && (
              <Text style={{color: '#007AFF', fontSize: 18, fontWeight: '600',alignSelf:'flex-end',marginTop:10,marginRight:15}}
              onPress={() => {
                setShowDatePicker(false);
                if (tempDate) {
                  setTimeout(() => setShowTimePicker(true), 200);
                }
              }}>
                Done
              </Text>
          )}
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              style={{alignSelf:'center'}}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  setShowDatePicker(false);
                  if (event.type === 'set' && selectedDate) {
                    setTempDate(selectedDate);
                    setTimeout(() => setShowTimePicker(true), 200);
                  } else {
                    setTempDate(null);
                    
                  }
                } else {
                  if (selectedDate) {
                    setTempDate(selectedDate);
                    setDueDate(selectedDate)
                  }
                }
              }}
            />
            </>
          )}

          {showTimePicker && (
               <>
               {Platform.OS === 'ios' && (
               <Text style={{color: '#007AFF', fontSize: 18, fontWeight: '600',alignSelf:'flex-end',marginTop:10,marginRight:15}}
               onPress={() => {
                 setShowTimePicker(false);
                 if (tempDate) {
                   setDueDate(tempDate);
                 }
               }}>
                 Done
               </Text>
           )}
            <DateTimePicker
              value={tempDate || new Date()}
              mode="time"
              style={{alignSelf:'center'}}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedTime) => {
                if (Platform.OS === 'android') {
                  setShowTimePicker(false);
                  if (event.type === 'set' && selectedTime && tempDate) {
                    const combined = new Date(tempDate);
                    combined.setHours(selectedTime.getHours());
                    combined.setMinutes(selectedTime.getMinutes());
                    setDueDate(combined);
                  } else {
                    setTempDate(null);
                    setDueDate(null);
                  }
                } else {
                  if (selectedTime && tempDate) {
                    const combined = new Date(tempDate);
                    combined.setHours(selectedTime.getHours());
                    combined.setMinutes(selectedTime.getMinutes());
                    setTempDate(combined);
                  }
                }
              }}
            />
            </>
          )}
        </View>

      </Modal>

      {/* Discussion Details Modal */}
      <Modal
        visible={showDiscussionModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowDiscussionModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowDiscussionModal(false)} style={{ padding: 4, marginRight: 12 }}>
              <SimpleIcon name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Back</Text>
            <View style={{ width: 28 }} />
          </View>

          {loadingDiscussion ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#10B144" />
            </View>
          ) : discussionDetails ? (
            <ScrollView style={{ flex: 1 }}>
              {/* Discussion Banner */}
              <View style={styles.discussionBanner}>
                <Text style={styles.discussionBannerText}>Discussion</Text>
              </View>

              <View style={styles.discussionContent}>
                {/* Due Date and Total Marks */}
                <View style={styles.discussionMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Due Date:</Text>
                    <Text style={styles.metaValue}>
                      {new Date(discussionDetails.dueDate?.date).toLocaleDateString('en-GB')} {discussionDetails.dueDate?.time}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Total Marks:</Text>
                    <Text style={styles.metaValue}>{discussionDetails.totalMarks}</Text>
                  </View>
                </View>

                {/* Topic */}
                <Text style={styles.discussionTopic}>{discussionDetails.topic}</Text>

                {/* Description */}
                <Text style={styles.discussionDescription}>{discussionDetails.description}</Text>

                {/* Attached Files */}
                {discussionDetails.files && discussionDetails.files.length > 0 && (
                  <View style={styles.attachedFileContainer}>
                    {discussionDetails.files.map((file: any, index: number) => (
                      <View key={index} style={styles.attachedFile}>
                        <View style={styles.fileIcon}>
                          <SimpleIcon name="document" size={24} color="#8b5cf6" />
                          <Text style={styles.fileIconText}>Mava AI</Text>
                        </View>
                        <Text style={styles.fileName}>{file.filename}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Comments Section */}
                <View style={styles.commentsSection}>
                  <Text style={styles.commentsTitle}>Comments</Text>
                  <View style={styles.commentsDivider} />

                  {comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <View key={index} style={styles.commentItem}>
                        <Text style={styles.commentText}>{comment.text}</Text>
                        <Text style={styles.commentAuthor}>
                          {comment.user?.firstName} {comment.user?.lastName}
                        </Text>
                        <Text style={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString('en-GB')}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noCommentsText}>No comments yet</Text>
                  )}
                </View>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.centered}>
              <Text style={{ color: 'red' }}>Failed to load discussion details</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    backgroundColor: '#10B144',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom:Platform.OS === "ios"?10:0,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  createButton: {
    backgroundColor: '#10B144',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  banner: { width: '100%', height: 220, borderRadius: 12 },
  badge: { backgroundColor: '#6d28d9', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { color: '#fff', fontWeight: 'bold' },
  dueDateLabel: { color: '#64748b', fontWeight: 'bold' },
  dueDateValue: { color: '#0f172a', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111', marginTop: 8 },
  link: { color: '#2563eb', textDecorationLine: 'underline', marginTop: 4 },
  description: { color: '#334155', marginTop: 4 },
  courseTitle: { marginTop: 4, color: 'blue' },
  dateRight: { color: '#94a3b8', textAlign: 'right', marginTop: 12 },
  inputLabel: { fontWeight: 'bold', marginBottom: 6, color: '#111', marginTop: 8 },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  dropdownLike: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    maxHeight: 160,
    backgroundColor: '#fff',
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownTriggerText: { color: '#111' },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    maxHeight: 180,
    marginTop: 6,
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10 },
  dropdownItemActive: { backgroundColor: '#eef2ff' },
  filePickerButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  filePickerButtonText: { color: '#6b7280' },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 12,
  },
  cancelText: { color: '#111', fontWeight: 'bold', fontSize: 16 },
  // Discussion Modal Styles
  discussionBanner: {
    backgroundColor: '#10B144',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    margin: 16,
    alignItems: 'center',
  },
  discussionBannerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  discussionContent: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  discussionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontWeight: 'bold',
    color: '#374151',
    fontSize: 14,
  },
  metaValue: {
    color: '#111',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 2,
  },
  discussionTopic: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  discussionDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },
  attachedFileContainer: {
    marginBottom: 24,
  },
  attachedFile: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    alignItems: 'center',
    marginRight: 12,
  },
  fileIconText: {
    fontSize: 10,
    color: '#8b5cf6',
    marginTop: 2,
  },
  fileName: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  commentsSection: {
    marginTop: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  commentsDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  commentItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  commentDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  noCommentsText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ChapterDiscussionsPage;



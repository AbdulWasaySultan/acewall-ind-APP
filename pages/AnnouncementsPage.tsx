import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuth } from '../contexts/AuthContext';
import { getAllCourses } from '../services/course';
import { createAnnouncement, getAnnouncementsByTeacher, deleteAnnouncement, getAnnouncementsByStudent } from '../services/announcement';

const AnnouncementsPage = () => {
  const [isAnnouncementsExpanded, setIsAnnouncementsExpanded] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { userRole, user } = useAuth();

  // State for the modal inputs (placeholders for now)
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null); // For dropdown value
  const [announcementMessage, setAnnouncementMessage] = useState('');
  // State for courses dropdown
  const [courseOptions, setCourseOptions] = useState<{ label: string; value: string }[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState('');
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState('');
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Student announcements state
  const [studentAnnouncements, setStudentAnnouncements] = useState<any[]>([]);
  const [studentAnnouncementsLoading, setStudentAnnouncementsLoading] = useState(false);
  const [studentAnnouncementsError, setStudentAnnouncementsError] = useState('');
  // Track expanded/collapsed state for each announcement
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<{ [id: string]: boolean }>({});

  const toggleExpand = (id: string) => {
    setExpandedAnnouncements((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch announcements on mount (for teachers)
  useEffect(() => {
    console.log(userRole)
    if (userRole === 'teacher') {
      fetchAnnouncements();
    }
  }, [userRole]);

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    setAnnouncementsError('');
    try {
      const res = await getAnnouncementsByTeacher();
      setAnnouncements(res.announcements || []);
    } catch (err: any) {
      setAnnouncementsError(err.message || 'Failed to load announcements');
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      setCoursesLoading(true);
      setCoursesError('');
      getAllCourses()
        .then((res) => {
          if (res && Array.isArray(res.courses)) {
            setCourseOptions(res.courses.map((course) => ({
              label: course.courseTitle,
              value: course._id
            })));
          } else {
            setCourseOptions([]);
          }
        })
        .catch((err) => {
          setCoursesError('Failed to load courses');
          setCourseOptions([]);
        })
        .finally(() => setCoursesLoading(false));
    }
  }, [isModalVisible]);

  // Fetch student announcements on mount (for students)
  useEffect(() => {
    if (userRole === 'student' && user?._id) {
      setStudentAnnouncementsLoading(true);
      setStudentAnnouncementsError('');
      getAnnouncementsByStudent(user._id)
        .then((res) => {
          setStudentAnnouncements(res.announcements || []);
        })
        .catch((err) => {
          setStudentAnnouncementsError(err.message || 'Failed to load announcements');
        })
        .finally(() => setStudentAnnouncementsLoading(false));
    }
  }, [userRole, user]);

  const toggleAnnouncements = () => {
    setIsAnnouncementsExpanded(!isAnnouncementsExpanded);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    // Reset form when closing modal
    if (!isModalVisible) {
      setAnnouncementTitle('');
      setSelectedCourse(null);
      setAnnouncementMessage('');
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle || !selectedCourse || !announcementMessage) return;
    setCreatingAnnouncement(true);
    try {
      await createAnnouncement({
        title: announcementTitle,
        courseId: selectedCourse,
        message: announcementMessage,
      });
      toggleModal();
      fetchAnnouncements();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create announcement');
    } finally {
      setCreatingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    Alert.alert(
      'Delete Announcement',
      'Are you sure you want to delete this announcement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(announcementId);
            try {
              await deleteAnnouncement(announcementId);
              fetchAnnouncements();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete announcement');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  // Component to display when no announcements are available or user is not a teacher
  const NoAnnouncementsView = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#666', marginBottom: 8 }}>
        No announcements available
      </Text>
      <Text style={{ fontSize: 16, color: '#888' }}>
        When announcements are posted, they will appear here.
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {userRole === 'teacher' ? (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Announcements</Text>
            <Pressable
              style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
              onPress={toggleModal}
            >
              <Text style={{ color: 'white', marginRight: 4, fontSize: 16 }}>+</Text>
              <Text style={{ color: 'white', fontSize: 16 }}>Add New</Text>
            </Pressable>
          </View>

          {/* Announcements Section */}
          <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden' }}>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f0f0f0' }} onPress={toggleAnnouncements}>
              <Text style={{ marginRight: 8 }}>{isAnnouncementsExpanded ? '▲' : '▼'}</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Announcements ({announcements.length})</Text>
            </Pressable>

            {isAnnouncementsExpanded && (
              <View style={{ padding: 12 }}>
                {/* Table Headers */}
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8, marginBottom: 8 }}>
                  <Text style={{ flex: 1, fontWeight: 'bold' }}>Date</Text>
                  <Text style={{ flex: 1, fontWeight: 'bold' }}>Title</Text>
                  <Text style={{ flex: 2, fontWeight: 'bold' }}>Message Summary</Text>
                  <Text style={{ width: 30 }}></Text>
                </View>
                {announcementsLoading ? (
                  <ActivityIndicator size="small" color="#4CAF50" style={{ marginTop: 16 }} />
                ) : announcementsError ? (
                  <Text style={{ color: 'red', textAlign: 'center', marginTop: 16 }}>{announcementsError}</Text>
                ) : announcements.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: '#666', marginTop: 16 }}>No announcements found.</Text>
                ) : (
                  announcements.map((a) => (
                    <View key={a._id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f5f5f5' }}>
                      <Text style={{ flex: 1 }}>{new Date(a.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#7b61ff', marginRight: 4 }}>📢</Text>
                        <Text style={{ color: '#7b61ff', textDecorationLine: 'underline' }}>{a.title}</Text>
                      </View>
                      <Text style={{ flex: 2 }}>{a.message}</Text>
                      <Pressable style={{ width: 30, alignItems: 'center' }} onPress={() => handleDeleteAnnouncement(a._id)} disabled={deletingId === a._id}>
                        {deletingId === a._id ? (
                          <ActivityIndicator size="small" color="red" />
                        ) : (
                          <Text style={{ color: 'red', fontSize: 18 }}>🗑️</Text>
                        )}
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Create New Announcement Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={toggleModal}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <ScrollView style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '90%', maxHeight: '80%' }}>
                {/* <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={toggleModal}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>×</Text>
                </TouchableOpacity> */}
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Create New Announcement</Text>
                <Text style={{ color: '#666', marginBottom: 16 }}>Create a new announcement for your students.</Text>

                {/* Announcement Title */}
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Announcement Title</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 10, marginBottom: 8 }}
                  placeholder="Enter title"
                  placeholderTextColor="#000"
                  value={announcementTitle}
                  onChangeText={setAnnouncementTitle}
                  maxLength={100}
                />
                <Text style={{ textAlign: 'right', color: '#666', marginBottom: 16 }}>{announcementTitle?.length}/100 characters</Text>

                {/* Select Course (Dropdown) */}
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Select Course</Text>
                <DropDownPicker
                  open={courseDropdownOpen}
                  setOpen={setCourseDropdownOpen}
                  value={selectedCourse}
                  setValue={setSelectedCourse}
                  items={courseOptions}
                  setItems={setCourseOptions}
                  placeholder={coursesLoading ? 'Loading courses...' : 'Select a course'}
                  disabled={coursesLoading || courseOptions.length === 0}
                  style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginBottom: 8 }}
                  dropDownContainerStyle={{ borderWidth: 1, borderColor: '#ccc' }}
                  zIndex={1000}
                />
                {coursesError ? (
                  <Text style={{ color: 'red', marginBottom: 16 }}>{coursesError}</Text>
                ) : courseOptions.length === 0 && !coursesLoading ? (
                  <Text style={{ color: '#666', marginBottom: 16 }}>No courses available</Text>
                ) : null}

                {/* Announcement Message */}
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Announcement Message</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 10, height: 100, textAlignVertical: 'top', marginBottom: 8 }}
                  placeholder="Enter message"
                  placeholderTextColor="#000"
                  value={announcementMessage}
                  onChangeText={setAnnouncementMessage}
                  multiline
                  maxLength={500}
                />
                 <Text style={{ textAlign: 'right', color: '#666', marginBottom: 16 }}>{announcementMessage.length}/500 characters</Text>

                {/* Buttons */}
                <Pressable
                  style={{ backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}
                  onPress={handleCreateAnnouncement}
                  disabled={creatingAnnouncement}
                >
                  {creatingAnnouncement ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Create</Text>
                  )}
                </Pressable>
                <Pressable
                  style={{ backgroundColor: '#ccc', padding: 12, borderRadius: 8, alignItems: 'center',marginBottom:100 }}
                  onPress={toggleModal}
                >
                  <Text style={{ color: '#333', fontSize: 18, fontWeight: 'bold' }}>Cancel</Text>
                </Pressable>
              </ScrollView>
            </View>
          </Modal>
        </>
      ) : (
        <>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Announcements</Text>
        {studentAnnouncementsLoading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 32 }} />
        ) : studentAnnouncementsError ? (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 32 }}>{studentAnnouncementsError}</Text>
        ) : studentAnnouncements.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#666', marginTop: 32 }}>No announcements found.</Text>
        ) : (
          studentAnnouncements.map((a) => {
            const expanded = expandedAnnouncements[a._id] || false;
            return (
              <Pressable
                key={a._id}
                onPress={() => toggleExpand(a._id)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 32,
                  marginBottom: 24,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: '#e5e8ef',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>{a.title}</Text>
                    <Text style={{ fontSize: 18, color: '#374151' }}><Text style={{ fontWeight: 'bold' }}>Course:</Text> {a.course?.courseTitle || '-'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 8 }}>
                    <Text style={{ fontSize: 15, color: '#6b7280', marginRight: 8 }}>{new Date(a.createdAt).toLocaleDateString('en-GB')}</Text>
                    <Text style={{ color: '#6b7280', fontSize: 15 }}>{expanded ? '▲' : '▼'}</Text>
                  </View>
                </View>
                {expanded && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={{ fontSize: 18, color: '#374151', marginBottom: 16 }}>{a.message}</Text>
                    <Text style={{ fontSize: 15, color: '#374151' }}><Text style={{ fontWeight: 'bold' }}>Time:</Text> {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </>
      )}
    </View>
  );
};

export default AnnouncementsPage; 
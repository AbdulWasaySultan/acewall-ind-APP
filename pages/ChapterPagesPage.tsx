import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, Linking } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getPagesForChapter, createPageForChapter, deletePage, getPagesForLesson, createPageForLesson } from '../services/page';
import * as ImagePicker from 'react-native-image-picker';
import { pick } from '@react-native-documents/picker';
import Toast from 'react-native-simple-toast';
import SimpleIcon from '../components/SimpleIcon';

type RouteParams = RouteProp<RootStackParamList, 'ChapterPages'>;

const ChapterPagesPage = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { courseId, chapterId, lessonId } = route.params as any;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<any | null>(null);
  const [files, setFiles] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        setError(null);
        let res;
        if (lessonId) {
          // Fetch pages for lesson
          res = await getPagesForLesson(courseId, lessonId);
        } else {
          // Fetch pages for chapter
          res = await getPagesForChapter(courseId, chapterId);
        }
        setPages(res.pages || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch pages');
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, [courseId, chapterId, lessonId]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={{ padding: 4, marginRight: 12 }}>
          <SimpleIcon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pages for chapter</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={{ padding: 16 }}>
        <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
          <Text style={styles.createButtonText}>+ Create Page</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#10B144" /></View>
      ) : error ? (
        <View style={styles.centered}><Text style={{ color: 'red' }}>{error}</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {pages.map((p) => (
            <TouchableOpacity key={p._id} activeOpacity={0.9} onPress={() => { setSelectedPage(p); setShowDetails(true); }} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{p.title}</Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Delete Page',
                      'Are you sure you want to delete this page?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              const res = await deletePage(p._id);
                              Toast.show(res.message || 'Page deleted successfully', Toast.LONG);
                              setPages((prev) => prev.filter((pg) => pg._id !== p._id));
                              if (showDetails && selectedPage?._id === p._id) setShowDetails(false);
                            } catch (err: any) {
                              Toast.show(err.message || 'Failed to delete page', Toast.LONG);
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <SimpleIcon name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardDescription}>{p.description}</Text>
              {!!p.image?.url && (
                <Image source={{ uri: p.image.url }} style={styles.image} />
              )}
            </TouchableOpacity>
          ))}
          {pages.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#6b7280' }}>No pages found.</Text>
          )}
        </ScrollView>
      )}

      <Modal
        visible={showCreateModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)} style={{ padding: 4, marginRight: 12 }}>
              <SimpleIcon name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Page</Text>
            <View style={{ width: 28 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
            />

            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, { minHeight: 100, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Description"
            />

            <Text style={styles.inputLabel}>Upload Image (optional)</Text>
            <TouchableOpacity
              style={styles.filePickerButton}
              onPress={() => {
                ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (res) => {
                  if (res.didCancel || res.errorMessage) return;
                  const asset = res.assets && res.assets[0];
                  if (asset) setImage(asset);
                });
              }}
            >
              <Text style={styles.filePickerButtonText}>
                {image?.fileName || 'Choose file No file chosen'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Upload Files (optional)</Text>
            <TouchableOpacity
              style={styles.filePickerButton}
              onPress={async () => {
                try {
                  const result = await pick({ type: ['application/pdf'], copyTo: 'cachesDirectory', allowMultiSelection: false });
                  if (result && result.length > 0) {
                    const f = result[0];
                    setFiles({
                      uri: f.uri,
                      type: 'application/pdf',
                      name: f.name || f.uri.split('/').pop(),
                      fileName: f.name,
                    }
                    );
                  }
                } catch (e) {
                  Toast.show('Error picking file', Toast.LONG);
                }
              }}
            >
              <Text style={styles.filePickerButtonText}>
              {Object.keys(files).length > 0 ? `${files?.name} ` : 'Choose files No file chosen'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createButton, submitting && { opacity: 0.7 }]}
              disabled={submitting}
              onPress={async () => {
                if (!title.trim() || !description.trim()) {
                  Alert.alert('Validation', 'Title and Description are required.');
                  return;
                }
                try {
                  setSubmitting(true);
                  let res;
                  if (lessonId) {
                    // Create page for lesson
                    res = await createPageForLesson(courseId, lessonId, {
                      title: title.trim(),
                      description: description.trim(),
                      image,
                      files,
                    });
                  } else {
                    // Create page for chapter
                    res = await createPageForChapter(courseId, chapterId, {
                      title: title.trim(),
                      description: description.trim(),
                      image,
                      files,
                    });
                  }
                  Toast.show(res.message || 'Page created successfully', Toast.LONG);
                  setShowCreateModal(false);
                  setTitle('');
                  setDescription('');
                  setImage(null);
                  setFiles([]);
                  // refresh list
                  setLoading(true);
                  let refreshed;
                  if (lessonId) {
                    refreshed = await getPagesForLesson(courseId, lessonId);
                  } else {
                    refreshed = await getPagesForChapter(courseId, chapterId);
                  }
                  setPages(refreshed.pages || []);
                } catch (err: any) {
                  Toast.show(err.message || 'Failed to create page', Toast.LONG);
                } finally {
                  setSubmitting(false);
                  setLoading(false);
                }
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Create Page</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cancelButton]} onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Details Modal */}
      <Modal
        visible={showDetails}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowDetails(false)} style={{ padding: 4, marginRight: 12 }}>
              <SimpleIcon name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedPage?.title || 'Details'}</Text>
            <View style={{ width: 28 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {!!selectedPage?.image?.url && (
              <Image source={{ uri: selectedPage.image.url }} style={[styles.image, { height: 260, borderRadius: 16 }]} />
            )}
            {selectedPage?.description ? (
              <Text style={{ color: '#374151', fontSize: 16, marginTop: 12 }}>{selectedPage.description}</Text>
            ) : null}

            {Array.isArray(selectedPage?.files) && selectedPage.files.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Attachments:</Text>
                {selectedPage.files.map((f: any, idx: number) => (
                  <TouchableOpacity key={f._id || idx} onPress={() => f.url && Linking.openURL(f.url)} style={{ paddingVertical: 6 }}>
                    <Text style={{ color: '#2563eb', textDecorationLine: 'underline' }}>{f.filename || `File ${idx + 1}`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: '#10B144',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  cardDescription: { color: '#6b7280', marginBottom: 12 },
  image: { width: '100%', height: 180, borderRadius: 12 },
  inputLabel: { fontWeight: 'bold', marginBottom: 6, color: '#111' },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
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
});

export default ChapterPagesPage;



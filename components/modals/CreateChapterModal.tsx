import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import SimpleIcon from '../SimpleIcon';
import { createChapter } from '../../services/course';

interface CreateChapterModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  selectedQuarterId: string | null;
  course: any;
  onCreated: () => void;
}

const CreateChapterModal: React.FC<CreateChapterModalProps> = ({
  visible,
  onClose,
  courseId,
  selectedQuarterId,
  course,
  onCreated,
}) => {
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDescription, setChapterDescription] = useState('');
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);

  const handleCreate = async () => {
    setChapterError(null);
    if (!chapterTitle.trim() || !chapterDescription.trim()) {
      setChapterError('Both title and description are required.');
      return;
    }
    setChapterLoading(true);
    try {
      if (course.semesterbased && !selectedQuarterId) {
        throw new Error(
          'No quarter selected to associate the chapter with.'
        );
      }
      await createChapter(
        courseId,
        chapterTitle.trim(),
        chapterDescription.trim(),
        selectedQuarterId
      );
      setChapterTitle('');
      setChapterDescription('');
      onCreated();
      onClose();
    } catch (err: any) {
      console.log(err);
      setChapterError(err.message || 'Failed to create chapter.');
    } finally {
      setChapterLoading(false);
    }
  };

  const handleCancel = () => {
    setChapterTitle('');
    setChapterDescription('');
    setChapterError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.chaptersModalContainer}>
        <View style={styles.chaptersModalHeader}>
          <Text style={styles.chaptersModalTitle}>Create New Chapter</Text>
          <TouchableOpacity onPress={handleCancel}>
            <SimpleIcon name="close" size={32} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.chaptersContent}>
          <View
            style={[styles.modalContent, { width: '100%', maxWidth: '100%' }]}
          >
            <Text style={styles.createChapterModalTitle}>
              Create New Chapter
            </Text>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.createChapterInput}
                placeholder="Chapter Title"
                placeholderTextColor="#999"
                value={chapterTitle}
                onChangeText={setChapterTitle}
                maxLength={100}
              />
              <Text style={styles.charCounter}>
                {chapterTitle.length}/100
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={[
                  styles.createChapterInput,
                  { height: 120, textAlignVertical: 'top' },
                ]}
                placeholder="Chapter Description"
                placeholderTextColor="#999"
                value={chapterDescription}
                onChangeText={setChapterDescription}
                maxLength={500}
                multiline
              />
              <Text style={styles.charCounter}>
                {chapterDescription.length}/500
              </Text>
            </View>

            <View style={{ marginTop: 24 }}>
              <TouchableOpacity
                style={[
                  styles.createChapterModalButton,
                  styles.createChapterModalButtonPrimary,
                ]}
                onPress={handleCreate}
                disabled={chapterLoading}
              >
                {chapterLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createChapterModalButtonTextPrimary}>
                    Create Chapter
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createChapterModalButton,
                  styles.createChapterModalButtonSecondary,
                ]}
                onPress={handleCancel}
                disabled={chapterLoading}
              >
                <Text style={styles.createChapterModalButtonTextSecondary}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
            {chapterError ? (
              <Text
                style={{ color: 'red', marginTop: 12, textAlign: 'center' }}
              >
                {chapterError}
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  chaptersModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chaptersModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  chaptersModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  chaptersContent: {
    flex: 1,
  },
  modalContent: {
    padding: 16,
  },
  createChapterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  createChapterInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1a1a2e',
  },
  charCounter: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  createChapterModalButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  createChapterModalButtonPrimary: {
    backgroundColor: '#10B144',
  },
  createChapterModalButtonSecondary: {
    backgroundColor: '#f3f4f6',
  },
  createChapterModalButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createChapterModalButtonTextSecondary: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateChapterModal;
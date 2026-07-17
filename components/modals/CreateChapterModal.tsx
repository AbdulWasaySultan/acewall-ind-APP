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
import { getApiInstance } from '../../services/apiInstance';
import Toast from 'react-native-simple-toast';
import { Sparkles } from 'lucide-react-native';

// Reuse the AIModal component (imported from the same file or create a shared component)
// For simplicity, we'll duplicate its JSX here, or import if available.
// I'll duplicate the AIModal implementation inside this file to keep it self-contained.

interface CreateChapterModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  selectedQuarterId: string | null;
  course: any;
  onCreated: () => void;
}

// AIModal component (local copy)
const AIModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onGenerate: () => void;
  prompt: string;
  setPrompt: (text: string) => void;
  isGenerating: boolean;
  placeholder?: string;
}> = ({
  visible,
  onClose,
  onGenerate,
  prompt,
  setPrompt,
  isGenerating,
  placeholder = "Describe what you want to create...",
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.aiAssistantHeader}>
            <Sparkles color="#7dd182" size={22} />
            <Text style={styles.aiAssistantHeaderTitle}>AI Assistant</Text>
          </View>

          <Text style={styles.aiAssistantTitle}>
            Start writing to make the magic happen.
          </Text>

          <Text style={styles.aiAssistantDescription}>
            Suggestions will appear here.
          </Text>

          <TextInput
            placeholder={placeholder}
            style={styles.aiPromptInput}
            multiline
            value={prompt}
            onChangeText={setPrompt}
          />

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={onClose}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalGenerateButton,
                (isGenerating || !prompt.trim()) &&
                styles.modalGenerateButtonDisabled,
              ]}
              onPress={onGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Sparkles
                    color="white"
                    size={20}
                    style={styles.modalGenerateIcon}
                  />
                  <Text style={styles.modalGenerateButtonText}>Generate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// A small AI button for inline use
const AISmallButton: React.FC<{ onPress: () => void; label: string }> = ({
  onPress,
  label,
}) => {
  return (
    <TouchableOpacity
      style={styles.aiSmallButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Sparkles color="#6366f1" size={14} style={styles.aiSmallButtonIcon} />
      <Text style={styles.aiSmallButtonText}>{label}</Text>
    </TouchableOpacity>
  );
};

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

  // AI Description states
  const [showAIDescriptionModal, setShowAIDescriptionModal] = useState(false);
  const [aiDescriptionPrompt, setAiDescriptionPrompt] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const [showAITitleModal, setShowAITitleModal] = useState<boolean>(false);
  const [aiTitlePrompt, setAiTitlePrompt] = useState('');
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);


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

  // AI Generation handler for chapter description
  const handleGenerateDescription = async () => {
    if (!aiDescriptionPrompt.trim()) {
      Toast.show('Please describe what you want the chapter to cover.', Toast.LONG);
      return;
    }

    try {
      setIsGeneratingDescription(true);
      const api = await getApiInstance();

      const response = await api.post('/api/aichat/generateContentForTeacher', {
        command: aiDescriptionPrompt,
        usedfor: 'chapterDescription', // backend must support this
        difficulty: 'medium',
      });

      if (response.data && response.data.content) {
        setChapterDescription(response.data.content);
        Toast.show('Chapter description generated!', Toast.SHORT);
        setShowAIDescriptionModal(false);
        setAiDescriptionPrompt('');
      } else {
        Toast.show('Failed to generate description', Toast.LONG);
      }
    } catch (error: any) {
      console.error('Error generating chapter description:', error);
      Toast.show(
        error.response?.data?.message || 'Failed to generate description',
        Toast.LONG
      );
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleGenerateTitle = async () => {
    if (!aiTitlePrompt.trim()) {
      Toast.show('Please describe what the chapter title should be about.', Toast.LONG);
      return;
    }

    try {
      setIsGeneratingTitle(true);
      const api = await getApiInstance();

      const response = await api.post('/api/aichat/generateContentForTeacher', {
        command: aiTitlePrompt,
        usedfor: 'title',
        difficulty: 'medium',
      });

      if (response.data && response.data.content) {
        setChapterTitle(response.data.content);
        Toast.show('Chapter title generated!', Toast.SHORT);
        setShowAITitleModal(false);
        setAiTitlePrompt('');
      } else {
        Toast.show('Failed to generate title', Toast.LONG);
      }
    } catch (error: any) {
      console.error('Error generating chapter title:', error);
      Toast.show(
        error.response?.data?.message || 'Failed to generate title',
        Toast.LONG
      );
    } finally {
      setIsGeneratingTitle(false); // ✅ fixed
    }
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
            <View style={styles.headerWithButton}>
          <Text style={styles.descriptionLabel}>Chapter Title</Text>
          <AISmallButton onPress={() => setShowAITitleModal(true)} label="AI Generate" />
        </View>
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
              <View style={styles.headerWithButton}>
                <Text style={styles.descriptionLabel}>Chapter Description</Text>
                <AISmallButton onPress={() => setShowAIDescriptionModal(true)} label="AI Generate" />
              </View>
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

      {/* ✅ Title AI Modal */}
      <AIModal
        visible={showAITitleModal}
        onClose={() => setShowAITitleModal(false)}
        onGenerate={handleGenerateTitle}
        prompt={aiTitlePrompt}
        setPrompt={setAiTitlePrompt}
        isGenerating={isGeneratingTitle}
        placeholder="Describe the chapter title you need..."
      />

      {/* Description AI Modal */}
      <AIModal
        visible={showAIDescriptionModal}
        onClose={() => setShowAIDescriptionModal(false)}
        onGenerate={handleGenerateDescription}
        prompt={aiDescriptionPrompt}
        setPrompt={setAiDescriptionPrompt}
        isGenerating={isGeneratingDescription}
        placeholder="Describe what this chapter should cover..."
      />
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
  // AI button styles
  aiSmallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  aiSmallButtonIcon: {
    marginRight: 4,
  },
  aiSmallButtonText: {
    color: '#4c1d95',
    fontSize: 12,
    fontWeight: '600',
  },
  headerWithButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a2e',
  },
  // AIModal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  aiAssistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  aiAssistantHeaderTitle: {
    fontSize: 18,
    color: '#000',
    fontWeight: '700',
  },
  aiAssistantTitle: {
    fontSize: 17,
    color: '#000',
    fontWeight: '700',
    alignSelf: 'center',
    marginTop: 8,
  },
  aiAssistantDescription: {
    marginVertical: 16,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  aiPromptInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
    fontSize: 15,
    color: '#000',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  modalCancelButtonText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  modalGenerateButton: {
    flex: 2,
    padding: 12,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalGenerateButtonDisabled: {
    opacity: 0.5,
  },
  modalGenerateIcon: {
    marginRight: 8,
  },
  modalGenerateButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default CreateChapterModal;
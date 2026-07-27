import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SimpleIcon from '../SimpleIcon';
import Toast from 'react-native-simple-toast';

interface AddAssessmentModalProps {
  visible: boolean;
  onClose: () => void;
  onBackToChapter: () => void;
}

const AddAssessmentModal: React.FC<AddAssessmentModalProps> = ({
  visible,
  onClose,
  onBackToChapter,
}) => {
  const insets = useSafeAreaInsets();
  const handleCreate = () => {
    Toast.show('Assessment creation coming soon!', Toast.LONG);
    onClose();
  };

  const handleBack = () => {
    onClose();
    onBackToChapter();
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.fullScreenModalContainer}>
        <View style={styles.fullScreenModalContent}>
          <View style={[styles.fullScreenModalHeader, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <SimpleIcon name="arrow-back" size={24} color="#10B144" />
            </TouchableOpacity>
            <Text style={styles.fullScreenModalTitle}>Add Assessment</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <Text style={styles.lessonFormInstruction}>
              Create a new assessment for this chapter.
            </Text>

            <View style={styles.lessonFormField}>
              <Text style={styles.lessonFormLabel}>Assessment Title</Text>
              <TextInput
                style={styles.lessonTitleInput}
                placeholder="Enter assessment title"
              />
            </View>

            <View style={styles.lessonFormField}>
              <Text style={styles.lessonFormLabel}>Description</Text>
              <TextInput
                style={styles.lessonDescriptionInput}
                placeholder="Enter assessment description"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.addFilesAddButton}
              onPress={handleCreate}
            >
              <Text style={styles.addFilesAddButtonText}>
                Create Assessment
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullScreenModalContent: {
    flex: 1,
  },
  fullScreenModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  fullScreenModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  lessonFormInstruction: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  lessonFormField: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  lessonFormLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  lessonTitleInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1a1a2e',
  },
  lessonDescriptionInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1a1a2e',
    minHeight: 100,
  },
  addFilesAddButton: {
    backgroundColor: '#10B144',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addFilesAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddAssessmentModal;
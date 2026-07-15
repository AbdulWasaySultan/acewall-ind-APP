import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { createAssessmentCategory } from '../../services/course';
import Toast from 'react-native-simple-toast';

interface AddAssessmentCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  onCreated: () => void;
}

const AddAssessmentCategoryModal: React.FC<AddAssessmentCategoryModalProps> = ({
  visible,
  onClose,
  courseId,
  onCreated,
}) => {
  const [newAssessmentCategoryName, setNewAssessmentCategoryName] = useState('');
  const [newAssessmentCategoryWeight, setNewAssessmentCategoryWeight] = useState('');
  const [weightError, setWeightError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const handleCreate = async () => {
    if (!newAssessmentCategoryName.trim()) {
      setNameError('Category name is required');
      return;
    }
    const weight = parseFloat(newAssessmentCategoryWeight.trim());
    if (weight <= 0) {
      setWeightError('Weight must be greater than 0');
      return;
    }

    try {
      setCreatingCategory(true);
      console.log('Creating category with data:', {
        name: newAssessmentCategoryName.trim(),
        weight: weight,
        courseId: courseId,
      });

      const response = await createAssessmentCategory(
        courseId,
        newAssessmentCategoryName.trim(),
        weight
      );

      console.log('Server response:', response);

      const newCategory = {
        id: response.category._id || response.category.id,
        title: response.category.name || response.category.title,
        weight: response.category.weight,
      };

      if (!newCategory.id || !newCategory.title) {
        throw new Error('Invalid category data received from server');
      }

      setNewAssessmentCategoryName('');
      setNewAssessmentCategoryWeight('');
      setWeightError(null);
      setNameError(null);
      onCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating category:', error);
      Toast.show(
        error.message ||
          'Failed to create assessment category. Please try again.',
        Toast.LONG
      );
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCancel = () => {
    setNewAssessmentCategoryName('');
    setNewAssessmentCategoryWeight('');
    setWeightError(null);
    setNameError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { width: '90%', maxWidth: 400 }]}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#111',
              marginBottom: 8,
            }}
          >
            Add New Topic
          </Text>
          <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
            Create a new assessment category for this course.
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#333',
              marginBottom: 8,
            }}
          >
            Topic Name
          </Text>
          <TextInput
            style={[
              {
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 4,
              },
              nameError && { borderColor: '#dc2626' },
            ]}
            placeholder="e.g., Midterm Exam, Quiz, Assignment"
            value={newAssessmentCategoryName}
            onChangeText={text => {
              setNewAssessmentCategoryName(text);
              if (!text.trim()) {
                setNameError('Category name is required');
              } else {
                setNameError(null);
              }
            }}
          />
          {nameError && (
            <Text
              style={{ color: '#dc2626', fontSize: 14, marginBottom: 16 }}
            >
              {nameError}
            </Text>
          )}

          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#333',
              marginBottom: 8,
            }}
          >
            Weight (%)
          </Text>
          <TextInput
            style={[
              {
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 4,
              },
              weightError && { borderColor: '#dc2626' },
            ]}
            placeholder="0"
            keyboardType="numeric"
            value={newAssessmentCategoryWeight}
            onChangeText={text => {
              setNewAssessmentCategoryWeight(text);
              const weight = parseFloat(text);
              if (weight <= 0) {
                setWeightError('Weight must be greater than 0');
              } else {
                setWeightError(null);
              }
            }}
          />
          {weightError && (
            <Text
              style={{ color: '#dc2626', fontSize: 14, marginBottom: 16 }}
            >
              {weightError}
            </Text>
          )}

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#e5e7eb',
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={handleCancel}
              disabled={creatingCategory}
            >
              <Text
                style={{ color: '#333', fontWeight: 'bold', fontSize: 16 }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#222',
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={handleCreate}
              disabled={creatingCategory}
            >
              <Text
                style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}
              >
                {creatingCategory ? 'Creating...' : 'Create Category'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
});

export default AddAssessmentCategoryModal;
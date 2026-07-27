import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface EditQuarterModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdated: () => void;
  formatDateForInput: (date: string) => string;
  parseDateFromInput: (date: string) => Date;
  handleEditQuarter: () => void;
  showQuarterDatePicker: string | null;
  setShowQuarterDatePicker: (show: string | null) => void;
  quarterTitle: string;
  setQuarterTitle: (title: string) => void;
  quarterStartDate: string;
  setQuarterStartDate: (date: string) => void;
  quarterEndDate: string;
  setQuarterEndDate: (date: string) => void;
}

const EditQuarterModal: React.FC<EditQuarterModalProps> = ({
  visible,
  onClose,
  onUpdated,
  formatDateForInput,
  parseDateFromInput,
  handleEditQuarter,
  showQuarterDatePicker,
  setShowQuarterDatePicker,
  quarterTitle,
  setQuarterTitle,
  quarterStartDate,
  setQuarterStartDate,
  quarterEndDate,
  setQuarterEndDate,
}) => {
  const handleClose = () => {
    setQuarterTitle('');
    setQuarterStartDate('');
    setQuarterEndDate('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.semesterModalOverlay}>
        <View style={styles.semesterModalContent}>
          <Text style={styles.semesterModalTitle}>Edit Quarter</Text>
          <TextInput
            style={[
              styles.semesterModalInput,
              { backgroundColor: '#f0f0f0' },
            ]}
            placeholder="Quarter Title"
            value={quarterTitle}
            onChangeText={setQuarterTitle}
          />
          <TouchableOpacity
            style={styles.semesterModalInput}
            onPress={() => setShowQuarterDatePicker('start')}
          >
            <Text
              style={
                quarterStartDate
                  ? styles.semesterModalInputText
                  : styles.semesterModalPlaceholder
              }
            >
              {quarterStartDate || 'mm/dd/yyyy'}
            </Text>
          </TouchableOpacity>
          {showQuarterDatePicker === 'start' && (
            <DateTimePicker
              value={
                quarterStartDate
                  ? new Date(parseDateFromInput(quarterStartDate))
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowQuarterDatePicker(null);
                if (date) {
                  setQuarterStartDate(formatDateForInput(date.toISOString()));
                }
              }}
            />
          )}
          <TouchableOpacity
            style={styles.semesterModalInput}
            onPress={() => setShowQuarterDatePicker('end')}
          >
            <Text
              style={
                quarterEndDate
                  ? styles.semesterModalInputText
                  : styles.semesterModalPlaceholder
              }
            >
              {quarterEndDate || 'mm/dd/yyyy'}
            </Text>
          </TouchableOpacity>
          {showQuarterDatePicker === 'end' && (
            <DateTimePicker
              value={
                quarterEndDate
                  ? new Date(parseDateFromInput(quarterEndDate))
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowQuarterDatePicker(null);
                if (date) {
                  setQuarterEndDate(formatDateForInput(date.toISOString()));
                }
              }}
            />
          )}
          <View style={styles.semesterModalContainer}>
            <TouchableOpacity
              style={styles.semesterModalButton}
              onPress={handleEditQuarter}
            >
              <Text style={styles.semesterModalButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.semesterModalButton}
              onPress={handleClose}
            >
              <Text style={styles.semesterModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  semesterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  semesterModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  semesterModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  semesterModalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#1a1a2e',
  },
  semesterModalInputText: {
    fontSize: 16,
    color: '#1a1a2e',
  },
  semesterModalPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
  semesterModalContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  semesterModalButton: {
    flex: 1,
    backgroundColor: '#10B144',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  semesterModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditQuarterModal;
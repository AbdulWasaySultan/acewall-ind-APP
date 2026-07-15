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

interface EditSemesterModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdated: () => void;
  formatDateForInput: (date: string) => string;
  parseDateFromInput: (date: string) => Date;
  handleEditSemester: () => void;
  showSemesterDatePicker: string | null;
  setShowSemesterDatePicker: (show: string | null) => void;
  semesterTitle: string;
  setSemesterTitle: (title: string) => void;
  semesterStartDate: string;
  setSemesterStartDate: (date: string) => void;
  semesterEndDate: string;
  setSemesterEndDate: (date: string) => void;
}

const EditSemesterModal: React.FC<EditSemesterModalProps> = ({
  visible,
  onClose,
  onUpdated,
  formatDateForInput,
  parseDateFromInput,
  handleEditSemester,
  showSemesterDatePicker,
  setShowSemesterDatePicker,
  semesterTitle,
  setSemesterTitle,
  semesterStartDate,
  setSemesterStartDate,
  semesterEndDate,
  setSemesterEndDate,
}) => {
  const handleClose = () => {
    setSemesterTitle('');
    setSemesterStartDate('');
    setSemesterEndDate('');
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
          <Text style={styles.semesterModalTitle}>Edit Semester</Text>
          <TextInput
            style={[
              styles.semesterModalInput,
              { backgroundColor: '#f0f0f0' },
            ]}
            placeholder="Semester Title"
            value={semesterTitle}
            onChangeText={setSemesterTitle}
          />
          <TouchableOpacity
            style={styles.semesterModalInput}
            onPress={() => setShowSemesterDatePicker('start')}
          >
            <Text
              style={
                semesterStartDate
                  ? styles.semesterModalInputText
                  : styles.semesterModalPlaceholder
              }
            >
              {semesterStartDate || 'dd/mm/yyyy'}
            </Text>
          </TouchableOpacity>
          {showSemesterDatePicker === 'start' && (
            <DateTimePicker
              value={
                semesterStartDate
                  ? new Date(parseDateFromInput(semesterStartDate))
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowSemesterDatePicker(null);
                if (date) {
                  setSemesterStartDate(formatDateForInput(date.toISOString()));
                }
              }}
            />
          )}
          <TouchableOpacity
            style={styles.semesterModalInput}
            onPress={() => setShowSemesterDatePicker('end')}
          >
            <Text
              style={
                semesterEndDate
                  ? styles.semesterModalInputText
                  : styles.semesterModalPlaceholder
              }
            >
              {semesterEndDate || 'dd/mm/yyyy'}
            </Text>
          </TouchableOpacity>
          {showSemesterDatePicker === 'end' && (
            <DateTimePicker
              value={
                semesterEndDate
                  ? new Date(parseDateFromInput(semesterEndDate))
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowSemesterDatePicker(null);
                if (date) {
                  setSemesterEndDate(formatDateForInput(date.toISOString()));
                }
              }}
            />
          )}
          <View style={styles.semesterModalContainer}>
            <TouchableOpacity
              style={styles.semesterModalButton}
              onPress={handleEditSemester}
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

export default EditSemesterModal;
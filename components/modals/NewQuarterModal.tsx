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

interface NewQuarterModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  selectedSemesterForQuarter: any;
  formatDateForInput: (date: string) => string;
  parseDateFromInput: (date: string) => Date;
  handleCreateQuarter: () => void;
  showQuarterDatePicker: string | null;
  setShowQuarterDatePicker: (show: string | null) => void;
  quarterTitle: string;
  setQuarterTitle: (title: string) => void;
  quarterStartDate: string;
  setQuarterStartDate: (date: string) => void;
  quarterEndDate: string;
  setQuarterEndDate: (date: string) => void;
}

const NewQuarterModal: React.FC<NewQuarterModalProps> = ({
  visible,
  onClose,
  onCreated,
  selectedSemesterForQuarter,
  formatDateForInput,
  parseDateFromInput,
  handleCreateQuarter,
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
          <Text style={styles.semesterModalTitle}>New Quarter</Text>
          {selectedSemesterForQuarter && (
            <Text style={styles.semesterModalInfo}>
              Semester duration: {formatDateForInput(selectedSemesterForQuarter.startDate)} - {formatDateForInput(selectedSemesterForQuarter.endDate)}
            </Text>
          )}
          <TextInput
            style={styles.semesterModalInput}
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
              {quarterStartDate || 'dd/mm/yyyy'}
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
              {quarterEndDate || 'dd/mm/yyyy'}
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
              onPress={handleCreateQuarter}
            >
              <Text style={styles.semesterModalButtonText}>Create Quarter</Text>
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
  semesterModalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
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

export default NewQuarterModal;
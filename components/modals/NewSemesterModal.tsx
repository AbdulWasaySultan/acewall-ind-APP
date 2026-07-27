import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface NewSemesterModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  lastSemesterEndDate: string | null;
  formatDateForInput: (date: string) => string;
  parseDateFromInput: (date: string) => Date;
  handleCreateSemester: () => void;
  showSemesterDatePicker: string | null;
  setShowSemesterDatePicker: (show: string | null) => void;
  semesterTitle: string;
  setSemesterTitle: (title: string) => void;
  semesterStartDate: string;
  setSemesterStartDate: (date: string) => void;
  semesterEndDate: string;
  setSemesterEndDate: (date: string) => void;
}

// Strips time so we compare calendar days, not exact timestamps
const isBeforeToday = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate.getTime() < today.getTime();
};

const NewSemesterModal: React.FC<NewSemesterModalProps> = ({
  visible,
  onClose,
  onCreated,
  lastSemesterEndDate,
  formatDateForInput,
  parseDateFromInput,
  handleCreateSemester,
  showSemesterDatePicker,
  setShowSemesterDatePicker,
  semesterTitle,
  setSemesterTitle,
  semesterStartDate,
  setSemesterStartDate,
  semesterEndDate,
  setSemesterEndDate,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(null));
  };

  const handleClose = () => {
    setSemesterTitle('');
    setSemesterStartDate('');
    setSemesterEndDate('');
    onClose();
  };

  const handleStartDateChange = (event: any, date?: Date) => {
    setShowSemesterDatePicker(null);
    if (!date) return;

    if (isBeforeToday(date)) {
      showToast("Start date can't be in the past");
      return;
    }

    // Optional: also enforce it isn't before the previous semester's end date
    if (lastSemesterEndDate && date < new Date(lastSemesterEndDate)) {
      showToast('Start date must be after the last semester ended');
      return;
    }

    setSemesterStartDate(formatDateForInput(date.toISOString()));

    // If an end date was already picked and is now invalid, clear it
    if (semesterEndDate && date > parseDateFromInput(semesterEndDate)) {
      setSemesterEndDate('');
      showToast('End date was cleared — it was before the new start date');
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setShowSemesterDatePicker(null);
    if (!date) return;

    if (isBeforeToday(date)) {
      showToast("End date can't be in the past");
      return;
    }

    if (semesterStartDate && date < parseDateFromInput(semesterStartDate)) {
      showToast("End date can't be before the start date");
      return;
    }

    setSemesterEndDate(formatDateForInput(date.toISOString()));
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
          <Text style={styles.semesterModalTitle}>New Semester</Text>
          {lastSemesterEndDate && (
            <Text style={styles.semesterModalInfo}>
              Last semester ends on: {formatDateForInput(lastSemesterEndDate)}
            </Text>
          )}
          <TextInput
            style={styles.semesterModalInput}
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
              {semesterStartDate || 'mm/dd/yyyy'}
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
              minimumDate={new Date()}
              onChange={handleStartDateChange}
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
              {semesterEndDate || 'mm/dd/yyyy'}
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
              minimumDate={
                semesterStartDate
                  ? parseDateFromInput(semesterStartDate)
                  : new Date()
              }
              onChange={handleEndDateChange}
            />
          )}
          <View style={styles.semesterModalContainer}>
            <TouchableOpacity
              style={styles.semesterModalButton}
              onPress={handleCreateSemester}
            >
              <Text style={styles.semesterModalButtonText}>
                Create Semester
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.semesterModalButton}
              onPress={handleClose}
            >
              <Text style={styles.semesterModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {toastMessage && (
          <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}
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
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    maxWidth: '90%',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default NewSemesterModal;
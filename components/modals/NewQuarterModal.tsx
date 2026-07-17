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

// Strips time so we compare calendar days, not exact timestamps
const isBeforeToday = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate.getTime() < today.getTime();
};

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
    setQuarterTitle('');
    setQuarterStartDate('');
    setQuarterEndDate('');
    onClose();
  };

  const semesterStart = selectedSemesterForQuarter
    ? parseDateFromInput(selectedSemesterForQuarter.startDate)
    : null;
  const semesterEnd = selectedSemesterForQuarter
    ? parseDateFromInput(selectedSemesterForQuarter.endDate)
    : null;

  const handleStartDateChange = (event: any, date?: Date) => {
    setShowQuarterDatePicker(null);
    if (!date) return;

    if (isBeforeToday(date)) {
      showToast("Start date can't be in the past");
      return;
    }

    if (semesterStart && date < semesterStart) {
      showToast('Start date must be within the semester duration');
      return;
    }
    if (semesterEnd && date > semesterEnd) {
      showToast('Start date must be within the semester duration');
      return;
    }

    setQuarterStartDate(formatDateForInput(date.toISOString()));

    // If an end date was already picked and is now invalid, clear it
    if (quarterEndDate && date > parseDateFromInput(quarterEndDate)) {
      setQuarterEndDate('');
      showToast('End date was cleared — it was before the new start date');
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setShowQuarterDatePicker(null);
    if (!date) return;

    if (isBeforeToday(date)) {
      showToast("End date can't be in the past");
      return;
    }

    if (quarterStartDate && date < parseDateFromInput(quarterStartDate)) {
      showToast("End date can't be before the start date");
      return;
    }

    if (semesterEnd && date > semesterEnd) {
      showToast('End date must be within the semester duration');
      return;
    }
    if (semesterStart && date < semesterStart) {
      showToast('End date must be within the semester duration');
      return;
    }

    setQuarterEndDate(formatDateForInput(date.toISOString()));
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
              minimumDate={
                semesterStart && semesterStart > new Date()
                  ? semesterStart
                  : new Date()
              }
              maximumDate={semesterEnd || undefined}
              onChange={handleStartDateChange}
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
              minimumDate={
                quarterStartDate
                  ? parseDateFromInput(quarterStartDate)
                  : semesterStart || new Date()
              }
              maximumDate={semesterEnd || undefined}
              onChange={handleEndDateChange}
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

export default NewQuarterModal;
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import SimpleIcon from "../SimpleIcon";

interface AddSemesterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedSemester: any;
  selectedQuarter: any;
  setShowSemesterPicker: (show: boolean) => void;
  setShowQuarterPicker: (show: boolean) => void;
  loadingQuarters: boolean;
  isSavingSemester: boolean;
  handleAddSemesterToCourse: () => void;
  styles: any;
}

const AddSemesterModal: React.FC<AddSemesterModalProps> = ({
  visible,
  onClose,
  selectedSemester,
  selectedQuarter,
  setShowSemesterPicker,
  setShowQuarterPicker,
  loadingQuarters,
  isSavingSemester,
  handleAddSemesterToCourse,
  styles,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.editProfileModalContent}>
          <Text style={styles.editProfileTitle}>Edit profile</Text>
          <Text style={styles.editProfileSubtitle}>
            Make changes to your profile here. Click save when you're done.
          </Text>

          <Text style={styles.dropdownLabel}>Semester</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowSemesterPicker(true)}
          >
            <Text style={styles.dropdownText}>
              {selectedSemester
                ? selectedSemester.title
                : "Select semester(s)"}
            </Text>
            <SimpleIcon name="chevron-down" size={20} color="#333" />
          </TouchableOpacity>

          <Text style={styles.dropdownLabel}>Quarter</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowQuarterPicker(true)}
            disabled={!selectedSemester}
          >
            <Text style={styles.dropdownText}>
              {selectedQuarter ? selectedQuarter.title : "Select Quarter(s)"}
            </Text>
            <SimpleIcon name="chevron-down" size={20} color="#333" />
          </TouchableOpacity>

          {loadingQuarters && (
            <ActivityIndicator style={{ marginVertical: 10 }} />
          )}

          <TouchableOpacity
            style={[
              styles.saveChangesButton,
              isSavingSemester && styles.disabledButton,
            ]}
            onPress={handleAddSemesterToCourse}
            disabled={isSavingSemester}
          >
            {isSavingSemester ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveChangesButtonText}>Save changes</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelProfileButton}
            onPress={onClose}
          >
            <Text style={styles.cancelProfileButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddSemesterModal;

import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

interface SemesterPickerModalProps {
  visible: boolean;
  onClose: () => void;
  loadingSemesters: boolean;
  allSemesters: any[];
  handleSemesterSelect: (semester: any) => void;
  styles: any;
}

const SemesterPickerModal: React.FC<SemesterPickerModalProps> = ({
  visible,
  onClose,
  loadingSemesters,
  allSemesters,
  handleSemesterSelect,
  styles,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <View style={styles.pickerModalContent}>
          {loadingSemesters ? (
            <ActivityIndicator />
          ) : (
            allSemesters.map((s) => (
              <TouchableOpacity
                key={s._id}
                style={styles.pickerItem}
                onPress={() => handleSemesterSelect(s)}
              >
                <Text>{s.title}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default SemesterPickerModal;

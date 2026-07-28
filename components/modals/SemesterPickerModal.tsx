import React from "react";
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AnimatedBottomSheet from "../common/AnimatedBottomSheet";

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
    <AnimatedBottomSheet visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
      </ScrollView>
    </AnimatedBottomSheet>
  );
};

export default SemesterPickerModal;

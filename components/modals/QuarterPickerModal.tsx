import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
} from "react-native";
import SimpleIcon from "../SimpleIcon";

interface QuarterPickerModalProps {
  visible: boolean;
  onClose: () => void;
  quarters: any[];
  course: any;
  handleQuarterSelect: (quarter: any) => void;
  styles: any;
}

const QuarterPickerModal: React.FC<QuarterPickerModalProps> = ({
  visible,
  onClose,
  quarters,
  course,
  handleQuarterSelect,
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
          {quarters.length === 0 ? (
            <Text>No quarters found for this semester.</Text>
          ) : (
            quarters.map((q) => {
              const isExisting = course?.quarter?.some(
                (cq: any) => cq._id === q._id
              );
              return (
                <TouchableOpacity
                  key={q._id}
                  style={[styles.pickerItem, isExisting && styles.disabledPickerItem]}
                  onPress={() => handleQuarterSelect(q)}
                  disabled={isExisting}
                >
                  <Text style={{ color: isExisting ? "#999" : "#333" }}>
                    {q.title}
                  </Text>
                  {isExisting && (
                    <SimpleIcon name="check-circle" size={22} color="black" />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default QuarterPickerModal;

import React from "react";
import { Text, TouchableOpacity, ScrollView } from "react-native";
import SimpleIcon from "../SimpleIcon";
import AnimatedBottomSheet from "../common/AnimatedBottomSheet";

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
    <AnimatedBottomSheet visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
      </ScrollView>
    </AnimatedBottomSheet>
  );
};

export default QuarterPickerModal;

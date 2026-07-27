import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import SimpleIcon from "../SimpleIcon";

interface QuartersModalProps {
  visible: boolean;
  onClose: () => void;
  loadingSemesterQuarters: boolean;
  semesterQuarters: any[];
  handleQuarterCardPress: (quarter: any) => void;
  formatDateWithOrdinal: (date: string) => string;
  styles: any;
}

const QuartersModal: React.FC<QuartersModalProps> = ({
  visible,
  onClose,
  loadingSemesterQuarters,
  semesterQuarters,
  handleQuarterCardPress,
  formatDateWithOrdinal,
  styles,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.quartersModalContainer}>
        <View style={styles.quartersModalHeader}>
          <Text style={styles.quartersModalTitle}>Quarters</Text>
          <TouchableOpacity onPress={onClose}>
            <SimpleIcon name="close" size={32} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {loadingSemesterQuarters ? (
            <ActivityIndicator
              size="large"
              color="#10B144"
              style={{ marginTop: 20 }}
            />
          ) : semesterQuarters.length > 0 ? (
            semesterQuarters.map((quarter: any) => (
              <TouchableOpacity
                key={quarter._id}
                style={styles.quarterCard}
                onPress={() => handleQuarterCardPress(quarter)}
              >
                <Text
                  style={styles.quarterTitle}
                >{`Quarter: ${quarter.title}`}</Text>
                <Text style={styles.quarterDates}>
                  {formatDateWithOrdinal(quarter.startDate)} -{" "}
                  {formatDateWithOrdinal(quarter.endDate)}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No quarters found for this semester.
            </Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default QuartersModal;

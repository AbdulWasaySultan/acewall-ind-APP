import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import SimpleIcon from "../SimpleIcon";
import DateTimePicker from "@react-native-community/datetimepicker";

interface EditAssessmentModalProps {
  visible: boolean;
  onClose: () => void;
  onBackToDetails: () => void;
  editAssessmentTitle: string;
  setEditAssessmentTitle: (title: string) => void;
  editAssessmentDescription: string;
  setEditAssessmentDescription: (description: string) => void;
  editAssessmentCategory: string;
  setEditAssessmentCategory: (category: string) => void;
  assessmentCategories: any[];
  showEditCategoryMenu: boolean;
  setShowEditCategoryMenu: (show: boolean) => void;
  editAssessmentDueDate: Date | null;
  setEditAssessmentDueDate: (date: Date | null) => void;
  tempEditDate: Date | null;
  setTempEditDate: (date: Date | null) => void;
  showEditDatePicker: boolean;
  setShowEditDatePicker: (show: boolean) => void;
  showEditTimePicker: boolean;
  setShowEditTimePicker: (show: boolean) => void;
  editAssessmentLoading: boolean;
  handleEditAssessment: () => void;
  insets: any;
  styles: any;
}

const EditAssessmentModal: React.FC<EditAssessmentModalProps> = ({
  visible,
  onClose,
  onBackToDetails,
  editAssessmentTitle,
  setEditAssessmentTitle,
  editAssessmentDescription,
  setEditAssessmentDescription,
  editAssessmentCategory,
  setEditAssessmentCategory,
  assessmentCategories,
  showEditCategoryMenu,
  setShowEditCategoryMenu,
  editAssessmentDueDate,
  setEditAssessmentDueDate,
  tempEditDate,
  setTempEditDate,
  showEditDatePicker,
  setShowEditDatePicker,
  showEditTimePicker,
  setShowEditTimePicker,
  editAssessmentLoading,
  handleEditAssessment,
  insets,
  styles,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={() => {
        onClose();
        onBackToDetails();
      }}
    >
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={[styles.assessmentDetailsHeader, { paddingTop: insets.top }]}
        >
          <TouchableOpacity
            onPress={() => {
              onClose();
              onBackToDetails();
            }}
            style={styles.assessmentDetailsBackButton}
          >
            <SimpleIcon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.assessmentDetailsHeaderTitle}>
            Edit Assessment
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text style={styles.editAssessmentLabel}>Title</Text>
          <TextInput
            style={styles.editAssessmentInput}
            value={editAssessmentTitle}
            onChangeText={setEditAssessmentTitle}
            placeholder="Assessment title"
          />

          <Text style={styles.editAssessmentLabel}>Description</Text>
          <TextInput
            style={[
              styles.editAssessmentInput,
              { minHeight: 100, textAlignVertical: "top" },
            ]}
            value={editAssessmentDescription}
            onChangeText={setEditAssessmentDescription}
            placeholder="Assessment description"
            multiline
          />

          <Text style={styles.editAssessmentLabel}>Category</Text>
          <TouchableOpacity
            style={styles.editAssessmentCategoryButton}
            onPress={() => setShowEditCategoryMenu(!showEditCategoryMenu)}
            activeOpacity={0.8}
          >
            <Text style={styles.editAssessmentCategoryButtonText}>
              {assessmentCategories.find(
                (c) => c.id === editAssessmentCategory
              )?.title || "Select Category"}
            </Text>
            <SimpleIcon
              name={showEditCategoryMenu ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {showEditCategoryMenu && (
            <View style={styles.editCategoryDropdownMenu}>
              <ScrollView>
                {assessmentCategories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => {
                      setEditAssessmentCategory(c.id);
                      setShowEditCategoryMenu(false);
                    }}
                    style={[
                      styles.editCategoryDropdownItem,
                      editAssessmentCategory === c.id &&
                        styles.editCategoryDropdownItemActive,
                    ]}
                  >
                    <Text style={{ color: "#111" }}>{c.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={styles.editAssessmentLabel}>Due Date</Text>
          <TouchableOpacity
            style={styles.editAssessmentInput}
            onPress={() => setShowEditDatePicker(true)}
          >
            <Text style={{ color: editAssessmentDueDate ? "#000" : "#999" }}>
              {editAssessmentDueDate
                ? `${editAssessmentDueDate.toLocaleDateString()} at ${editAssessmentDueDate.toLocaleTimeString(
                    "en-US",
                    { hour: "2-digit", minute: "2-digit" }
                  )}`
                : "Select due date"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.editAssessmentSaveButton,
              editAssessmentLoading && { opacity: 0.7 },
            ]}
            onPress={handleEditAssessment}
            disabled={editAssessmentLoading}
          >
            {editAssessmentLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.editAssessmentSaveButtonText}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
        {showEditDatePicker && (
          <>
            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={{
                  alignSelf: "flex-end",
                  marginTop: 10,
                  marginRight: 15,
                }}
                onPress={() => {
                  setShowEditDatePicker(false);
                  if (tempEditDate) {
                    setTimeout(() => setShowEditTimePicker(true), 200);
                  }
                }}
              >
                <Text
                  style={{
                    color: "#007AFF",
                    fontSize: 18,
                    fontWeight: "600",
                  }}
                >
                  Done
                </Text>
              </TouchableOpacity>
            )}
            <DateTimePicker
              value={editAssessmentDueDate || new Date()}
              mode="date"
              style={{ alignSelf: "center" }}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                if (Platform.OS === "android") {
                  setShowEditDatePicker(false);
                  if (event.type === "set" && selectedDate) {
                    setTempEditDate(selectedDate);
                    setTimeout(() => setShowEditTimePicker(true), 200);
                  } else {
                    setTempEditDate(null);
                  }
                } else {
                  if (selectedDate) {
                    setTempEditDate(selectedDate);
                    setEditAssessmentDueDate(selectedDate);
                  }
                }
              }}
            />
          </>
        )}

        {showEditTimePicker && (
          <>
            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={{
                  alignSelf: "flex-end",
                  marginTop: 10,
                  marginRight: 15,
                }}
                onPress={() => {
                  setShowEditTimePicker(false);
                  if (tempEditDate) {
                    setEditAssessmentDueDate(tempEditDate);
                  }
                }}
              >
                <Text
                  style={{
                    color: "#007AFF",
                    fontSize: 18,
                    fontWeight: "600",
                  }}
                >
                  Done
                </Text>
              </TouchableOpacity>
            )}
            <DateTimePicker
              value={tempEditDate || new Date()}
              mode="time"
              style={{ alignSelf: "center" }}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedTime) => {
                if (Platform.OS === "android") {
                  setShowEditTimePicker(false);
                  if (event.type === "set" && selectedTime && tempEditDate) {
                    const combined = new Date(tempEditDate);
                    combined.setHours(selectedTime.getHours());
                    combined.setMinutes(selectedTime.getMinutes());
                    setEditAssessmentDueDate(combined);
                  } else {
                    setTempEditDate(null);
                    setEditAssessmentDueDate(null);
                  }
                } else {
                  // iOS: just update the time selection
                  if (selectedTime && tempEditDate) {
                    const combined = new Date(tempEditDate);
                    combined.setHours(selectedTime.getHours());
                    combined.setMinutes(selectedTime.getMinutes());
                    setTempEditDate(combined);
                  }
                }
              }}
            />
          </>
        )}
      </View>
    </Modal>
  );
};

export default EditAssessmentModal;

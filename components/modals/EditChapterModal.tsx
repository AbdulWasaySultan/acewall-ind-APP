import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import SimpleIcon from "../SimpleIcon";
import {
  editChapter,
  getChapterDetailsWithLessons,
} from "../../services/course";
import Toast from "react-native-simple-toast";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface EditChapterModalProps {
  visible: boolean;
  onClose: () => void;
  chapterDetails: any;
  onUpdated: (updatedChapter: any) => void;
}

const EditChapterModal: React.FC<EditChapterModalProps> = ({
  visible,
  onClose,
  chapterDetails,
  onUpdated,
}) => {
  const insets = useSafeAreaInsets();
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterDescription, setEditChapterDescription] = useState("");
  const [editChapterLoading, setEditChapterLoading] = useState(false);
  const [editChapterError, setEditChapterError] = useState<string | null>(null);
  // State to show loading while fetching updated details
  // const [refreshingDetails, setRefreshingDetails] = useState(false);

  // Initialize form when chapterDetails changes
  useEffect(() => {
    if (chapterDetails) {
      setEditChapterTitle(chapterDetails.title);
      setEditChapterDescription(chapterDetails.description);
    }
  }, [chapterDetails]);

  const handleUpdate = async () => {
    if (!editChapterTitle.trim() || !editChapterDescription.trim()) {
      Toast.show("Chapter title and description are required", Toast.LONG);
      return;
    }

    if (!chapterDetails?._id) {
      Toast.show("Chapter not found", Toast.LONG);
      return;
    }

    try {
      setEditChapterLoading(true);
      setEditChapterError(null);

      // 1. Update the chapter
      await editChapter(
        chapterDetails._id,
        editChapterTitle,
        editChapterDescription
      );

      // 2. Refresh the updated chapter details (optional but ensures fresh data)
      // setRefreshingDetails(true);
      const updatedResponse = await getChapterDetailsWithLessons(
        chapterDetails._id
      );
      const updatedChapter = updatedResponse.chapter;

      // 3. Pass updated chapter to parent BEFORE showing toast
      onUpdated(updatedChapter);

      // 4. Now show success toast (UI already updated)
      Toast.show("Chapter updated successfully", Toast.LONG);
    } catch (error: any) {
      console.error("Error updating chapter:", error);
      setEditChapterError(error.message || "Failed to update chapter");
      Toast.show("Failed to update chapter", Toast.LONG);
    } finally {
      setEditChapterLoading(false);
    }
  };

  const handleCancel = () => {
    setEditChapterError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.fullScreenModalContainer}>
        <View
          style={[styles.fullScreenModalHeader, { paddingTop: insets.top }]}
        >
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <SimpleIcon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.fullScreenModalTitle}>Edit Chapter</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.editChapterForm}>
          {/* Chapter Title */}
          <View style={styles.editChapterField}>
            <Text style={styles.editChapterLabel}>Chapter Title</Text>
            <View style={styles.editChapterTitleContainer}>
              <TextInput
                style={styles.editChapterTitleInput}
                value={editChapterTitle}
                onChangeText={setEditChapterTitle}
                placeholder="Enter chapter title"
                maxLength={100}
              />
              <Text style={styles.editChapterCharacterCount}>
                {editChapterTitle.length}/100
              </Text>
            </View>
          </View>

          {/* Chapter Description */}
          <View style={styles.editChapterField}>
            <Text style={styles.editChapterLabel}>Chapter Description</Text>
            <View style={styles.editChapterDescriptionContainer}>
              <TextInput
                style={styles.editChapterDescriptionInput}
                value={editChapterDescription}
                onChangeText={setEditChapterDescription}
                placeholder="Enter chapter description"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.editChapterCharacterCount}>
                {editChapterDescription.length}/500
              </Text>
            </View>
          </View>

          {editChapterError && (
            <Text style={styles.editChapterErrorText}>{editChapterError}</Text>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.editChapterActionButtons}>
          <TouchableOpacity
            style={styles.editChapterCancelButton}
            onPress={handleCancel}
            disabled={editChapterLoading}
          >
            <Text style={styles.editChapterCancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.editChapterSaveButton,
              editChapterLoading && styles.editChapterDisabledButton,
            ]}
            onPress={handleUpdate}
            disabled={editChapterLoading}
          >
            {editChapterLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.editChapterSaveButtonText}>Edit Chapter</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fullScreenModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
  },
  fullScreenModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  editChapterForm: {
    flex: 1,
    padding: 16,
  },
  editChapterField: {
    marginBottom: 20,
  },
  editChapterLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  editChapterTitleContainer: {
    position: "relative",
  },
  editChapterTitleInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1a1a2e",
  },
  editChapterDescriptionContainer: {
    position: "relative",
  },
  editChapterDescriptionInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1a1a2e",
    minHeight: 100,
  },
  editChapterCharacterCount: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "right",
    marginTop: 4,
  },
  editChapterErrorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  editChapterActionButtons: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  editChapterCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  editChapterCancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  editChapterSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#10B144",
    alignItems: "center",
  },
  editChapterDisabledButton: {
    opacity: 0.6,
  },
  editChapterSaveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditChapterModal;

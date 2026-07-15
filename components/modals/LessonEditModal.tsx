import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import SimpleIcon from "../SimpleIcon";

interface LessonEditModalProps {
  visible: boolean;
  onClose: () => void;
  onBackToChapter: () => void;
  lessonEditTitle: string;
  setLessonEditTitle: (title: string) => void;
  lessonEditDescription: string;
  setLessonEditDescription: (description: string) => void;
  lessonEditYoutubeLink: string;
  setLessonEditYoutubeLink: (link: string) => void;
  lessonEditOtherLink: string;
  setLessonEditOtherLink: (link: string) => void;
  lessonEditError: string | null;
  lessonEditLoading: boolean;
  handleUpdateLesson: () => void;
  insets: any;
  styles: any;
}

const LessonEditModal: React.FC<LessonEditModalProps> = ({
  visible,
  onClose,
  onBackToChapter,
  lessonEditTitle,
  setLessonEditTitle,
  lessonEditDescription,
  setLessonEditDescription,
  lessonEditYoutubeLink,
  setLessonEditYoutubeLink,
  lessonEditOtherLink,
  setLessonEditOtherLink,
  lessonEditError,
  lessonEditLoading,
  handleUpdateLesson,
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
        onBackToChapter();
      }}
    >
      <View style={styles.fullScreenModalContainer}>
        <View
          style={[styles.fullScreenModalHeader, { paddingTop: insets.top }]}
        >
          <TouchableOpacity
            onPress={() => {
              onClose();
              onBackToChapter();
            }}
            style={styles.backButton}
          >
            <SimpleIcon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.fullScreenModalTitle}>Edit Lesson</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.lessonEditForm}>
          {/* Lesson Title */}
          <View style={styles.lessonEditField}>
            <Text style={styles.lessonEditLabel}>Lesson Title</Text>
            <View style={styles.lessonEditTitleContainer}>
              <TextInput
                style={styles.lessonEditTitleInput}
                value={lessonEditTitle}
                onChangeText={setLessonEditTitle}
                placeholder="Enter lesson title"
                maxLength={100}
              />
              <Text style={styles.lessonEditCharacterCount}>
                {lessonEditTitle.length}/100
              </Text>
            </View>
          </View>

          {/* Lesson Description */}
          <View style={styles.lessonEditField}>
            <Text style={styles.lessonEditLabel}>Lesson Description</Text>
            <View style={styles.lessonEditDescriptionContainer}>
              <TextInput
                style={styles.lessonEditDescriptionInput}
                value={lessonEditDescription}
                onChangeText={setLessonEditDescription}
                placeholder="Enter lesson description"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.lessonEditCharacterCount}>
                {lessonEditDescription.length}/500
              </Text>
            </View>
          </View>

          {/* YouTube Link */}
          <View style={styles.lessonEditField}>
            <Text style={styles.lessonEditLabel}>YouTube Link</Text>
            <TextInput
              style={styles.lessonEditLinkInput}
              value={lessonEditYoutubeLink}
              onChangeText={setLessonEditYoutubeLink}
              placeholder="https://www.youtube.com/watch?v=..."
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Other Link */}
          <View style={styles.lessonEditField}>
            <Text style={styles.lessonEditLabel}>Other Link</Text>
            <TextInput
              style={styles.lessonEditLinkInput}
              value={lessonEditOtherLink}
              onChangeText={setLessonEditOtherLink}
              placeholder="https://example.com"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {lessonEditError && (
            <Text style={styles.lessonEditErrorText}>{lessonEditError}</Text>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.lessonEditActionButtons}>
          <TouchableOpacity
            style={styles.lessonEditCancelButton}
            onPress={() => {
              onClose();
              onBackToChapter();
            }}
          >
            <Text style={styles.lessonEditCancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.lessonEditSaveButton,
              lessonEditLoading && styles.lessonEditDisabledButton,
            ]}
            onPress={handleUpdateLesson}
            disabled={lessonEditLoading}
          >
            {lessonEditLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.lessonEditSaveButtonText}>Save Lesson</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LessonEditModal;

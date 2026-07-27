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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SimpleIcon from "../SimpleIcon";

interface LessonCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onBackToChapter: () => void;
  lessonCreationTitle: string;
  setLessonCreationTitle: (title: string) => void;
  lessonCreationDescription: string;
  setLessonCreationDescription: (description: string) => void;
  lessonCreationYoutubeLink: string;
  setLessonCreationYoutubeLink: (link: string) => void;
  lessonCreationOtherLink: string;
  setLessonCreationOtherLink: (link: string) => void;
  lessonCreationFiles: any[];
  handleFilePickForLessonCreation: () => void;
  handleRemoveFile: (index: number) => void;
  lessonCreationError: string | null;
  lessonCreationLoading: boolean;
  handleCreateLesson: () => void;
  styles: any;
}

const LessonCreationModal: React.FC<LessonCreationModalProps> = ({
  visible,
  onClose,
  onBackToChapter,
  lessonCreationTitle,
  setLessonCreationTitle,
  lessonCreationDescription,
  setLessonCreationDescription,
  lessonCreationYoutubeLink,
  setLessonCreationYoutubeLink,
  lessonCreationOtherLink,
  setLessonCreationOtherLink,
  lessonCreationFiles,
  handleFilePickForLessonCreation,
  handleRemoveFile,
  lessonCreationError,
  lessonCreationLoading,
  handleCreateLesson,
  styles,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.fullScreenModalContainer}>
        <View style={styles.fullScreenModalContent}>
          <View style={[styles.fullScreenModalHeader, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity
              onPress={() => {
                onClose();
                onBackToChapter();
              }}
              style={styles.backButton}
            >
              <SimpleIcon name="arrow-left" size={24} color="#10B144" />
            </TouchableOpacity>
            <Text style={styles.fullScreenModalTitle}>Add Lesson</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <Text style={styles.lessonFormInstruction}>
              Fill in the lesson details. Upload only PDF files, max 5MB
              total.
            </Text>

            {/* Lesson Title */}
            <View style={styles.lessonFormField}>
              <Text style={styles.lessonFormLabel}>Lesson Title</Text>
              <View style={styles.lessonTitleContainer}>
                <TextInput
                  style={styles.lessonTitleInput}
                  value={lessonCreationTitle}
                  onChangeText={setLessonCreationTitle}
                  placeholder="Enter lesson title"
                  maxLength={100}
                />
                <Text style={styles.characterCount}>
                  {lessonCreationTitle.length}/100
                </Text>
              </View>
            </View>

            {/* Lesson Description */}
            <View style={styles.lessonFormField}>
              <Text style={styles.lessonFormLabel}>Lesson Description</Text>
              <TextInput
                style={styles.lessonDescriptionInput}
                value={lessonCreationDescription}
                onChangeText={setLessonCreationDescription}
                placeholder="Start writing..."
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>

            {/* YouTube Link */}
            <View style={styles.lessonFormField}>
              <Text style={styles.lessonFormLabel}>YouTube Link</Text>
              <TextInput
                style={styles.lessonLinkInput}
                value={lessonCreationYoutubeLink}
                onChangeText={setLessonCreationYoutubeLink}
                placeholder="https://www.youtube.com/watch?v=..."
                keyboardType="url"
              />
            </View>

            {/* Other Link */}
            <View style={styles.lessonFormField}>
              <Text style={styles.lessonFormLabel}>Other Link</Text>
              <TextInput
                style={styles.lessonLinkInput}
                value={lessonCreationOtherLink}
                onChangeText={setLessonCreationOtherLink}
                placeholder="https://example.com"
                keyboardType="url"
              />
            </View>

            {/* PDF Files */}
            <View style={styles.lessonFormField}>
              <Text style={styles.lessonFormLabel}>
                Lesson PDF Files (optional)
              </Text>

              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={handleFilePickForLessonCreation}
              >
                <Text style={styles.filePickerButtonText}>
                  Choose file No file chosen
                </Text>
              </TouchableOpacity>

              {lessonCreationFiles.length > 0 && (
                <View style={styles.fileList}>
                  {lessonCreationFiles.map((file, index) => (
                    <View key={index} style={styles.fileItem}>
                      <SimpleIcon
                        name="description"
                        size={20}
                        color="#10B144"
                      />
                      <Text style={styles.fileName}>{file.name}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveFile(index)}
                      >
                        <SimpleIcon name="trash" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.addAnotherFileButton}
                onPress={handleFilePickForLessonCreation}
              >
                <SimpleIcon name="plus" size={16} color="#10B144" />
                <Text style={styles.addAnotherFileText}>
                  Add Another File
                </Text>
              </TouchableOpacity>

              <Text style={styles.lessonFileSizeText}>
                Total size:{" "}
                {(
                  lessonCreationFiles.reduce(
                    (total, file) => total + (file.size || 0),
                    0
                  ) /
                  (1024 * 1024)
                ).toFixed(2)}{" "}
                MB / 5 MB
              </Text>
            </View>

            {lessonCreationError && (
              <Text style={styles.lessonErrorText}>
                {lessonCreationError}
              </Text>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.lessonCreationActionButtons}>
            <TouchableOpacity
              style={styles.lessonCancelButton}
              onPress={() => {
                onClose();
                onBackToChapter();
              }}
            >
              <Text style={styles.lessonCancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.lessonSaveButton,
                lessonCreationLoading && styles.lessonDisabledButton,
              ]}
              onPress={handleCreateLesson}
              disabled={lessonCreationLoading}
            >
              {lessonCreationLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.lessonSaveButtonText}>Save Lesson</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LessonCreationModal;

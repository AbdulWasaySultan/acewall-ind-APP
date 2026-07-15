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

interface AddFilesModalProps {
  visible: boolean;
  onClose: () => void;
  onBackToChapter: () => void;
  handleFilePickForAddFiles: () => void;
  selectedFiles: any[];
  handleRemoveSelectedFile: (index: number) => void;
  totalFileSize: number;
  addFilesError: string | null;
  handleAddFiles: () => void;
  addFilesLoading: boolean;
  styles: any;
}

const AddFilesModal: React.FC<AddFilesModalProps> = ({
  visible,
  onClose,
  onBackToChapter,
  handleFilePickForAddFiles,
  selectedFiles,
  handleRemoveSelectedFile,
  totalFileSize,
  addFilesError,
  handleAddFiles,
  addFilesLoading,
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
        <View style={styles.fullScreenModalContent}>
          <View style={styles.fullScreenModalHeader}>
            <TouchableOpacity
              onPress={() => {
                onClose();
                onBackToChapter();
              }}
              style={styles.backButton}
            >
              <SimpleIcon name="arrow-back" size={24} color="#10B144" />
            </TouchableOpacity>
            <Text style={styles.fullScreenModalTitle}>Add Files</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={{ flex: 1 }}>
            <Text style={styles.lessonFormInstruction}>
              Upload only PDF files, max 5MB total.
            </Text>

            <TouchableOpacity
              style={styles.filePickerButton}
              onPress={handleFilePickForAddFiles}
            >
              <Text style={styles.filePickerButtonText}>
                Choose file No file chosen
              </Text>
            </TouchableOpacity>

            {selectedFiles.length > 0 && (
              <View style={styles.fileList}>
                {selectedFiles.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <SimpleIcon
                      name="description"
                      size={20}
                      color="#10B144"
                    />
                    <Text style={styles.fileName}>{file.fileName}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveSelectedFile(index)}
                    >
                      <SimpleIcon name="trash" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.fileSizeText}>
              Total size: {(totalFileSize / (1024 * 1024)).toFixed(2)} MB / 5
              MB
            </Text>

            {addFilesError && (
              <Text style={styles.addFilesErrorText}>{addFilesError}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.addFilesAddButton,
                addFilesLoading && styles.addFilesDisabledButton,
              ]}
              onPress={handleAddFiles}
              disabled={addFilesLoading}
            >
              {addFilesLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.addFilesAddButtonText}>Add Files</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AddFilesModal;

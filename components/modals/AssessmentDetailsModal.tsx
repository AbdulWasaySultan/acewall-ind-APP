import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import SimpleIcon from "../SimpleIcon";

interface AssessmentDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onBackToChapter: () => void;
  onEdit: (assessment: any) => void;
  selectedAssessmentForModal: any;
  expandedMcq: any;
  setExpandedMcq: (expanded: any) => void;
  insets: any;
  styles: any;
}

const AssessmentDetailsModal: React.FC<AssessmentDetailsModalProps> = ({
  visible,
  onClose,
  onBackToChapter,
  onEdit,
  selectedAssessmentForModal,
  expandedMcq,
  setExpandedMcq,
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
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Header */}
        <View
          style={[styles.assessmentDetailsHeader, { paddingTop: insets.top }]}
        >
          <TouchableOpacity
            onPress={() => {
              onClose();
              onBackToChapter();
            }}
            style={styles.assessmentDetailsBackButton}
          >
            <SimpleIcon name="arrow-back" size={24} color="#fff" />
            <Text style={styles.assessmentDetailsBackText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onEdit(selectedAssessmentForModal)}
            style={styles.assessmentDetailsEditButton}
          >
            <SimpleIcon name="pencil" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {selectedAssessmentForModal && (
            <>
              {/* Title and Category */}
              <View style={styles.assessmentDetailsTitleContainer}>
                <Text style={styles.assessmentDetailsTitle}>
                  {selectedAssessmentForModal.title}
                </Text>
                <View style={styles.assessmentDetailsCategoryBadge}>
                  <Text style={styles.assessmentDetailsCategoryText}>
                    {selectedAssessmentForModal.category?.name ||
                      "No Category"}
                  </Text>
                </View>
              </View>

              {/* Due Date */}
              <View style={styles.assessmentDetailsDueDateContainer}>
                <Text style={styles.assessmentDetailsDueDateLabel}>
                  Due date:{" "}
                  {new Date(
                    selectedAssessmentForModal.dueDate?.date
                  ).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>

              {/* Description */}
              <View style={styles.assessmentDetailsDescriptionContainer}>
                <Text style={styles.assessmentDetailsDescriptionTitle}>
                  Description
                </Text>
                <Text style={styles.assessmentDetailsDescriptionText}>
                  {selectedAssessmentForModal.description}
                </Text>
              </View>

              {/* Questions */}
              <View style={styles.assessmentDetailsQuestionsContainer}>
                <Text style={styles.assessmentDetailsQuestionsTitle}>
                  Questions
                </Text>

                {selectedAssessmentForModal.questions.map(
                  (question: any, index: number) => (
                    <View key={question._id} style={{ marginBottom: 16 }}>
                      <TouchableOpacity
                        style={styles.assessmentDetailsMcqHeader}
                        onPress={() =>
                          setExpandedMcq((prev: any) => ({
                            ...prev,
                            [index]: !prev[index],
                          }))
                        }
                      >
                        <Text style={styles.assessmentDetailsMcqTitle}>
                          {question.type.toUpperCase()}
                        </Text>
                        <SimpleIcon
                          name={
                            expandedMcq?.[index]
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          size={20}
                          color="#000"
                        />
                      </TouchableOpacity>

                      {expandedMcq?.[index] && (
                        <View style={styles.assessmentDetailsQuestionCard}>
                          {/* Common Question Text */}
                          <Text style={styles.assessmentDetailsQuestionLabel}>
                            Question:
                          </Text>
                          <Text style={styles.assessmentDetailsQuestionText}>
                            {question.question.replace(/<[^>]*>/g, "")}
                          </Text>

                          {/* Render Based on Type */}
                          {question.type === "mcq" && (
                            <>
                              {question.options.map(
                                (option: string, optionIndex: number) => (
                                  <View
                                    key={optionIndex}
                                    style={
                                      styles.assessmentDetailsOptionContainer
                                    }
                                  >
                                    <Text
                                      style={
                                        styles.assessmentDetailsBulletPoint
                                      }
                                    >
                                      •
                                    </Text>
                                    <Text
                                      style={[
                                        styles.assessmentDetailsOptionText,
                                        option === question.correctAnswer &&
                                          styles.assessmentDetailsCorrectOption,
                                      ]}
                                    >
                                      {option}
                                    </Text>
                                    {option === question.correctAnswer && (
                                      <Text
                                        style={
                                          styles.assessmentDetailsCorrectLabel
                                        }
                                      >
                                        Correct
                                      </Text>
                                    )}
                                  </View>
                                )
                              )}
                            </>
                          )}

                          {question.type === "truefalse" && (
                            <View style={{ marginTop: 8 }}>
                              <Text
                                style={styles.assessmentDetailsQuestionLabel}
                              >
                                Answer:
                              </Text>
                              <Text
                                style={[
                                  styles.assessmentDetailsOptionText,
                                  question.correctAnswer === "true"
                                    ? styles.assessmentDetailsCorrectOption
                                    : styles.assessmentDetailsWrongOption,
                                ]}
                              >
                                {question.correctAnswer === "true"
                                  ? "True"
                                  : "False"}
                              </Text>
                            </View>
                          )}

                          {question.type === "qa" && (
                            <View style={{ marginTop: 8 }}>
                              <Text
                                style={styles.assessmentDetailsQuestionLabel}
                              >
                                Answer:
                              </Text>
                              <Text
                                style={styles.assessmentDetailsOptionText}
                              >
                                {question.correctAnswer || "—"}
                              </Text>
                            </View>
                          )}

                          {question.type === "file" &&
                            question.files.length > 0 && (
                              <View style={{ marginTop: 10 }}>
                                <Text
                                  style={
                                    styles.assessmentDetailsQuestionLabel
                                  }
                                >
                                  File:
                                </Text>
                                {question.files.map(
                                  (file: any, fIndex: number) => (
                                    <TouchableOpacity
                                      key={fIndex}
                                      onPress={() =>
                                        Linking.openURL(file.url)
                                      }
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        marginTop: 6,
                                      }}
                                    >
                                      <SimpleIcon
                                        name="description"
                                        size={18}
                                        color="#007BFF"
                                      />
                                      <Text
                                        style={{
                                          color: "#007BFF",
                                          textDecorationLine: "underline",
                                          marginLeft: 6,
                                        }}
                                      >
                                        {file.filename}
                                      </Text>
                                    </TouchableOpacity>
                                  )
                                )}
                              </View>
                            )}
                        </View>
                      )}
                    </View>
                  )
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default AssessmentDetailsModal;

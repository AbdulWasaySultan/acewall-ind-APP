
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Alert, ActivityIndicator, Linking } from "react-native"
import { useRoute, useNavigation, type RouteProp } from "@react-navigation/native"
import SimpleIcon from "../components/SimpleIcon"
import { pick, types } from "@react-native-documents/picker";
import { getStudentAssessmentDetails, submitAssessment } from "../services/course";
import Toast from 'react-native-simple-toast'
interface AssessmentParams {
  assessmentId: string
}

interface Question {
  _id: string
  type: "mcq" | "truefalse" | "qa" | "file"
  question: string
  options?: string[]
  correctAnswer?: string
  points: number
  files?: Array<{
    url: string
    filename: string
    public_id: string
  }>
}

interface Assessment {
  _id: string
  title: string
  description: string
  questions: Question[]
  dueDate: {
    date: string
    time: string
  }
}

interface Answer {
  questionId: string
  answer: string | File | null
}

const AssessmentScreenStudent = () => {
  const route = useRoute<RouteProp<Record<string, AssessmentParams>, string>>()
  const navigation = useNavigation()
  const { assessmentId } = route.params

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | File | null>>({})
  const [uploadedFiles, setUploadedFiles] = useState<any>(null)
  const [submitAssessmentLoading, setSubmitAssessmentLoading] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<any>(null)
  const [resultLoading, setResultLoading] = useState(false)
  useEffect(() => {

    const fetchAssessment = async () => {
      try {
        const response = await getStudentAssessmentDetails(assessmentId)
        console.log(response)
        setAssessment(response.assessment)
      } catch (error) {
        console.error("Error fetching assessment:", error)
      }
    }

    fetchAssessment()
  }, [assessmentId])

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleFileUpload = async (questionId: string) => {
    try {
      const result = await pick({
        type: [types.pdf],
        copyTo: "cachesDirectory",
        allowMultiSelection: false
      });
      setUploadedFiles(result[0])
      setAnswers((prev) => ({
        ...prev,
        [questionId]: result[0].uri,
      }))
    } catch (error) {
      // console.error("Error picking document:", error)
      // Alert.alert("Error", "Failed to pick document")
    }
  }

  const showSubmissionResult = async () => {
    setResultLoading(true)
    try {
      const details = await getStudentAssessmentDetails(assessmentId)
      if (details.submissions && details.submissions.length > 0) {
        setSubmissionResult(details.submissions[0])
      } else {
        navigation.goBack()
      }
    } catch (err) {
      console.error("Error fetching submission result:", err)
      navigation.goBack()
    } finally {
      setResultLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      // Validate all questions are answered
      setSubmitAssessmentLoading(true)
      const unansweredQuestions = assessment?.questions.filter((q) => !answers[q._id])
      if (unansweredQuestions && unansweredQuestions.length > 0) {
        Toast.show("Incomplete Assessment, Please answer all questions before submitting.", Toast.LONG)
        return
      }
      if (assessment?.questions[0].type === "file") {
        const question = assessment.questions[0];
        console.log(question)
        const file = uploadedFiles;



        const res = await submitAssessment(
          assessmentId,
          assessment.title,
          assessment.description,
          assessment.dueDate.date,
          [], // no answers for file-based
          file, // single file
          question._id // pass questionId separately
        );

        Toast.show(res.message || "Assessment submitted successfully!", Toast.LONG);
        await showSubmissionResult();
        return;
      }



      // Submit assessment
      const questionsArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        selectedAnswer: typeof answer === "string" ? answer : "",
      }))

      const res = await submitAssessment(
        assessmentId,
        assessment?.title || "",
        assessment?.description || "",
        assessment?.dueDate?.date || "",
        questionsArray,
        uploadedFiles
      )


      Toast.show(res.message || "Assessment submitted successfully!", Toast.LONG)
      await showSubmissionResult();
    } catch (error: any) {
      console.error("Error submitting assessment:", error.response?.data || error)
      Toast.show(
        error.response?.data?.message || error.message || "Failed to submit assessment. Please try again.",
        Toast.LONG
      )
    }
    finally {
      setSubmitAssessmentLoading(false)
    }
  }

  const renderQuestion = (question: Question, index: number) => {
    const questionNumber = index + 1

    return (
      <View key={question._id} style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionTitle}>Question {questionNumber}</Text>
          <Text style={styles.questionPoints}>Points: {question.points}</Text>
        </View>

        <Text style={styles.questionText}>{question.question.replace(/<[^>]*>/g, "")}</Text>
        {question.type === "mcq" && renderMCQ(question)}
        {question.type === "truefalse" && renderTrueFalse(question)}
        {question.type === "qa" && renderQA(question)}
        {question.type === "file" && renderFileUpload(question)}
      </View>
    )
  }

  const renderMCQ = (question: Question) => (
    <View style={styles.optionsContainer}>
      {question.options?.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.optionButton}
          onPress={() => handleAnswerChange(question._id, option)}
        >
          <View style={[styles.radioButton, answers[question._id] === option && styles.radioButtonSelected]}>
            {answers[question._id] === option && <View style={styles.radioButtonInner} />}
          </View>
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  const renderTrueFalse = (question: Question) => (
    <View style={styles.optionsContainer}>
      {["true", "false"].map((option) => (
        <TouchableOpacity
          key={option}
          style={styles.optionButton}
          onPress={() => handleAnswerChange(question._id, option)}
        >
          <View style={[styles.radioButton, answers[question._id] === option && styles.radioButtonSelected]}>
            {answers[question._id] === option && <View style={styles.radioButtonInner} />}
          </View>
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  const renderQA = (question: Question) => (
    <TextInput
      style={styles.textArea}
      placeholder="Type your answer here..."
      placeholderTextColor="#999"
      multiline
      numberOfLines={6}
      value={(answers[question._id] as string) || ""}
      onChangeText={(text) => handleAnswerChange(question._id, text)}
      textAlignVertical="top"
    />
  )
  console.log(uploadedFiles)
  const renderFileUpload = (question: Question) => (
    <View style={styles.fileUploadContainer}>
      {question.files && question.files.length > 0 && (
        <View style={styles.attachedFilesContainer}>
          {question.files.map((file, index) => (
            <TouchableOpacity key={index} style={styles.attachedFileCard} onPress={() => Linking.openURL(file.url)}>
              <SimpleIcon name="description" size={24} color="#4285F4" />
              <Text style={styles.attachedFileName}>{file.filename}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.filePickerButton} onPress={() =>


        handleFileUpload(question._id)
      }>
        <Text style={styles.filePickerText}>
          Choose file: {uploadedFiles ? uploadedFiles.name : "No file chosen"}
        </Text>
      </TouchableOpacity>
    </View>
  )

  const renderResult = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backButtonText}>Submission Details</Text>
      </View>

      <ScrollView style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.assessmentInfo}>
            <View style={styles.resultBadgeRow}>
              <View style={styles.resultBadge}>
                <Text style={styles.resultBadgeText}>{submissionResult.status}</Text>
              </View>
              <View style={styles.resultBadge}>
                <Text style={styles.resultBadgeText}>
                  {submissionResult.graded ? "Graded" : "Not Graded"}
                </Text>
              </View>
            </View>
            <Text style={styles.assessmentTitle}>{assessment?.title}</Text>
            <Text style={styles.assessmentDescription}>
              Total Score: {submissionResult.totalScore} points
            </Text>
          </View>

          {(submissionResult.answers || []).map((answer: any, index: number) => (
            <View key={answer._id || index} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionTitle}>Question {index + 1}</Text>
                <Text style={styles.questionPoints}>
                  {answer.pointsAwarded}/{answer.question?.points ?? 0} pts
                </Text>
              </View>
              <Text style={styles.questionText}>
                {answer.question?.question?.replace(/<[^>]*>/g, "") || "No question text"}
              </Text>
              <Text style={styles.resultAnswerLabel}>Your Answer:</Text>
              <Text style={styles.resultAnswerText}>
                {answer.file && answer.file.length > 0
                  ? `${answer.file.length} file(s) uploaded`
                  : answer.selectedAnswer || "No answer provided"}
              </Text>
              <Text
                style={[
                  styles.resultStatusText,
                  {
                    color: answer.requiresManualCheck
                      ? "#D97706"
                      : answer.isCorrect
                        ? "#16A34A"
                        : "#DC2626",
                  },
                ]}
              >
                {answer.requiresManualCheck
                  ? "Needs Manual Grading"
                  : answer.isCorrect
                    ? "Correct"
                    : "Incorrect"}
              </Text>
            </View>
          ))}

          <TouchableOpacity style={styles.submitButton} onPress={() => navigation.goBack()}>
            <Text style={styles.submitButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )

  if (resultLoading || submissionResult) {
    if (resultLoading && !submissionResult) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={"large"} color="#10B144" />
        </View>
      )
    }
    return renderResult()
  }

  if (!assessment) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={"large"} color="#10B144" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <SimpleIcon name="arrow-back" size={24} color="#000" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Assessment Info */}
          <View style={styles.assessmentInfo}>
            <Text style={styles.assessmentTitle}>{assessment.title}</Text>
            <Text style={styles.assessmentDescription}>{assessment.description}</Text>
          </View>

          {/* Questions */}
          {assessment.questions.map((question, index) => renderQuestion(question, index))}

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitAssessmentLoading}>
            {submitAssessmentLoading ?

              <ActivityIndicator size={'small'} color={'#fff'} /> :
              <Text style={styles.submitButtonText}>Submit Assessment</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === "ios" ? 50 : 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  assessmentInfo: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  assessmentTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
  },
  assessmentDescription: {
    fontSize: 16,
    color: "#666",
  },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  questionPoints: {
    fontSize: 16,
    color: "#666",
  },
  questionText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#10B144",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B144",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 16,
    fontSize: 16,
    color: "#333",
    minHeight: 150,
  },
  fileUploadContainer: {
    gap: 16,
  },
  attachedFilesContainer: {
    gap: 12,
  },
  attachedFileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 12,
  },
  attachedFileName: {
    fontSize: 14,
    color: "#1976d2",
    marginLeft: 8,
    flex: 1,
  },
  filePickerButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 16,
  },
  filePickerText: {
    fontSize: 16,
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#10B144",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
    alignSelf: "flex-end",
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  resultBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  resultBadge: {
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  resultAnswerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 4,
  },
  resultAnswerText: {
    fontSize: 15,
    color: "#111",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
  },
  resultStatusText: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
})

export default AssessmentScreenStudent

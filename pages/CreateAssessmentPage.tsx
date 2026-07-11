import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-simple-toast";
import SimpleIcon from "../components/SimpleIcon";
import { createApiInstance, addAuthInterceptor } from "../services/course";
import { pick, types } from "@react-native-documents/picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Question {
  id: string;
  type: "mcq" | "truefalse" | "qa";
  question: string;
  concept?: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface AssessmentCategory {
  _id: string;
  name: string;
}

interface QuestionType {
  _id: string;
  name: string;
  type: string;
}

const CreateAssessmentPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const {
    courseId,
    chapterId,
    lessonId,
    semesterId,
    quarterId,
    refreshAssessments,
    navigateBack,
  } = route.params as any;

  const QuestionType: QuestionType[] = [
    {
      _id: "646f1f4f4f4f4f4f4f4f4f4f5",
      name: "Multiple Choice",
      type: "mcq",
    },
    {
      _id: "646f1f4f4f4f4f4f4f4f4f4f6",
      name: "True/False",
      type: "truefalse",
    },
    {
      _id: "646f1f4f4f4f4f4f4f4f4f4f7",
      name: "Question & Answer",
      type: "qa",
    },
  ];

  const MAX_PDF_SIZE_MB = 5;
  const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

  // Assessment type state
  const [assessmentType, setAssessmentType] = useState<"question" | "file">(
    "question"
  );

  // Basic assessment details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<AssessmentCategory | null>(null);

  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Categories
  const [categories, setCategories] = useState<AssessmentCategory[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showQuestionTypeModal, setShowQuestionTypeModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryWeight, setNewCategoryWeight] = useState<string>("0");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Quarter dates
  const [quarterDates, setQuarterDates] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  // Questions for question-based assessment
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);

  // Current question being added
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: "mcq",
    question: "",
    concept: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    points: 1,
  });

  // File upload for file-based assessment
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchQuarterDates();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      // Check if courseId exists
      if (!courseId) {
        console.warn("No courseId provided, using default categories");
        // Set default categories as fallback
        setCategories([
          { _id: "default1", name: "Quiz" },
          { _id: "default2", name: "Assignment" },
          { _id: "default3", name: "Exam" },
          { _id: "default4", name: "Project" },
        ]);
        setLoadingCategories(false);
        return;
      }

      console.log("Fetching categories for courseId:", courseId);
      const api = await createApiInstance();
      addAuthInterceptor(api);

      // Try the main endpoint
      let response;
      try {
        response = await api.get(`/api/assessmentCategory/${courseId}`);
      } catch (firstError: any) {
        console.log("This is the courseId:", courseId);
        // console.log("First endpoint failed, trying alternatives...");

        // If 404, try alternative endpoints
        if (firstError.response?.status === 404) {
          try {
            // Alternative 1: /api/courses/${courseId}/categories
            response = await api.get(`/api/courses/${courseId}/categories`);
          } catch (secondError: any) {
            if (secondError.response?.status === 404) {
              // Alternative 2: /api/assessment/categories?courseId=${courseId}
              response = await api.get(
                `/api/assessment/categories?courseId=${courseId}`
              );
            } else {
              throw secondError;
            }
          }
        } else {
          throw firstError;
        }
      }

      console.log("Categories response:", response.data);

      // Handle different response structures
      let categoriesData = [];
      if (response.data.categories) {
        categoriesData = response.data.categories;
      } else if (response.data.data) {
        categoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else {
        categoriesData = [];
      }

      // Map the categories to the expected format
      const mappedCategories = categoriesData.map((category: any) => ({
        _id:
          category._id || category.id || `temp_${Date.now()}_${Math.random()}`,
        name: category.name || category.title || "Unnamed Category",
      }));

      setCategories(mappedCategories);

      // If we have categories and none selected, select the first one
      if (mappedCategories.length > 0 && !selectedCategory) {
        setSelectedCategory(mappedCategories[0]);
      }
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      console.error("Status:", error.response?.status);
      console.error("Message:", error.response?.data?.message);

      // Set default categories as fallback so the UI works
      const defaultCategories = [
        { _id: "default1", name: "Quiz" },
        { _id: "default2", name: "Assignment" },
        { _id: "default3", name: "Exam" },
        { _id: "default4", name: "Project" },
      ];
      setCategories(defaultCategories);

      // Show a user-friendly message
      if (error.response?.status === 404) {
        Toast.show(
          "Categories endpoint not found. Using default categories.",
          Toast.LONG
        );
      } else if (error.response?.status === 401) {
        Toast.show("Session expired. Please login again.", Toast.LONG);
      } else if (error.response?.status === 500) {
        Toast.show("Server error. Using default categories.", Toast.LONG);
      } else {
        Toast.show(
          "Failed to fetch categories. Using default categories.",
          Toast.LONG
        );
      }
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    const weight = parseFloat(newCategoryWeight);
    if (!name) {
      Toast.show("Please enter topic name", Toast.SHORT);
      return;
    }
    if (Number.isNaN(weight) || weight <= 0) {
      Toast.show("Please enter a valid weight (> 0)", Toast.SHORT);
      return;
    }

    try {
      setCreatingCategory(true);
      const api = await createApiInstance();
      addAuthInterceptor(api);
      const payload = { name, weight, course: courseId };
      const response = await api.post(
        `/api/assessmentCategory/${courseId}`,
        payload
      );
      Toast.show("Assessment category created successfully", Toast.LONG);
      const created = response.data?.category || response.data?.data || null;
      if (created) {
        setSelectedCategory({ _id: created._id, name: created.name });
      }
      setShowAddCategoryModal(false);
      setShowCategoryModal(true);
      setNewCategoryName("");
      setNewCategoryWeight("0");
      await fetchCategories();
    } catch (e: any) {
      console.error("Create category error:", e);
      Toast.show(
        e?.response?.data?.message || e.message || "Failed to create category",
        Toast.LONG
      );
    } finally {
      setCreatingCategory(false);
    }
  };

  const fetchQuarterDates = async () => {
    try {
      const api = await createApiInstance();
      addAuthInterceptor(api);

      const response = await api.get(
        `/api/quarter/getDatesofQuarter/${quarterId}`
      );
      setQuarterDates({
        startDate: response.data.startDate,
        endDate: response.data.endDate,
      });
    } catch (error) {
      console.error("Error fetching quarter dates:", error);
      // Don't show error toast as this is not critical
    }
  };

  const handleAssessmentTypeChange = (type: "question" | "file") => {
    setAssessmentType(type);
    if (type === "file") {
      setQuestions([]);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question?.trim()) {
      Toast.show("Please enter a question", Toast.SHORT);
      return;
    }

    if (
      currentQuestion.type === "mcq" &&
      (!currentQuestion.options || currentQuestion.options.length < 2)
    ) {
      Toast.show(
        "Please add at least 2 options for multiple choice",
        Toast.SHORT
      );
      return;
    }

    if (currentQuestion.type === "mcq" && !currentQuestion.correctAnswer) {
      Toast.show("Please select a correct answer", Toast.SHORT);
      return;
    }

    if (!currentQuestion.points || currentQuestion.points <= 0) {
      Toast.show("Please enter valid points", Toast.SHORT);
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      type: currentQuestion.type as "mcq" | "truefalse" | "qa",
      question: currentQuestion.question,
      concept: currentQuestion.concept || "", // Include concept
      options:
        currentQuestion.type === "mcq" ? currentQuestion.options : undefined,
      correctAnswer: currentQuestion.correctAnswer,
      points: currentQuestion.points,
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      concept: "",
      correctAnswer: "",
      points: 1,
    });
    setShowAddQuestionModal(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const handleMoveQuestion = (questionId: string, direction: "up" | "down") => {
    const currentIndex = questions.findIndex((q) => q.id === questionId);
    if (direction === "up" && currentIndex > 0) {
      const newQuestions = [...questions];
      [newQuestions[currentIndex - 1], newQuestions[currentIndex]] = [
        newQuestions[currentIndex],
        newQuestions[currentIndex - 1],
      ];
      setQuestions(newQuestions);
    } else if (direction === "down" && currentIndex < questions.length - 1) {
      const newQuestions = [...questions];
      [newQuestions[currentIndex], newQuestions[currentIndex + 1]] = [
        newQuestions[currentIndex + 1],
        newQuestions[currentIndex],
      ];
      setQuestions(newQuestions);
    }
  };

  const handleFilePick = async () => {
    const result = await pick({
      type: [types.pdf],
      copyTo: "cachesDirectory",
      allowMultiSelection: true,
    });
    if (result && result.length > 0) {
      const file = result[0];
      const fileSizeMB = file.size ? file.size / (1024 * 1024) : 0;

      if (fileSizeMB > 5) {
        Toast.show("File size must be less than 5MB", Toast.LONG);
        return;
      }

      const newFile = {
        uri: file.uri,
        fileName: file.name || file.uri.split("/").pop(),
        fileSize: file.size,
        type: "application/pdf",
      };

      const updatedFiles = [...selectedFiles, newFile];
      const totalSize = updatedFiles.reduce(
        (sum, f) => sum + (f.fileSize || 0),
        0
      );

      if (totalSize > MAX_PDF_SIZE_BYTES) {
        Toast.show(
          `Total file size cannot exceed ${MAX_PDF_SIZE_MB}MB`,
          Toast.LONG
        );
        return;
      }

      setSelectedFiles(updatedFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmitAssessment = async () => {
    if (!title.trim()) {
      Toast.show("Please enter assessment title", Toast.SHORT);
      return;
    }

    if (!description.trim()) {
      Toast.show("Please enter assessment description", Toast.SHORT);
      return;
    }

    if (!selectedCategory) {
      Toast.show("Please select a category", Toast.SHORT);
      return;
    }

    if (assessmentType === "question" && questions.length === 0) {
      Toast.show("Please add at least one question", Toast.SHORT);
      return;
    }

    if (assessmentType === "file" && selectedFiles.length === 0) {
      Toast.show("Please upload at least one file", Toast.SHORT);
      return;
    }

    if (dueDate && quarterDates) {
      const dueDateTimestamp = dueDate.getTime();
      const quarterStartTimestamp = new Date(quarterDates.startDate).getTime();
      const quarterEndTimestamp = new Date(quarterDates.endDate).getTime();

      if (
        dueDateTimestamp < quarterStartTimestamp ||
        dueDateTimestamp > quarterEndTimestamp
      ) {
        Toast.show(
          `Due date must be between ${formatDate(
            new Date(quarterDates.startDate)
          )} and ${formatDate(new Date(quarterDates.endDate))}`,
          Toast.LONG
        );
        return;
      }
    }

    if (!dueDate) {
      Toast.show("Please select a due date", Toast.SHORT);
      return;
    }

    try {
      setLoading(true);
      const api = await createApiInstance();
      addAuthInterceptor(api);

      const normalizedQuestions =
        assessmentType === "question"
          ? questions.map((q) => ({
              type: q.type,
              concept: q.concept || "",
              question:
                q.question && q.question.includes("<")
                  ? q.question
                  : `<p>${q.question || ""}</p>`,
              options: (q.options || []).filter(Boolean),
              correctAnswer: q.correctAnswer,
              points: q.points,
            }))
          : [];

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", selectedCategory._id);
      formData.append("assessmentType", assessmentType);
      formData.append("chapter", chapterId);
      formData.append("course", courseId);
      formData.append("dueDate", dueDate?.toISOString());

      semesterId && formData.append("semester", semesterId);
      quarterId && formData.append("quarter", quarterId);

      if (lessonId) {
        formData.append("lesson", lessonId);
      }

      if (assessmentType === "file") {
        const fileQuestion = [
          {
            type: "file",
            question: "File Upload Question 1",
            points: 1,
            fileCount: selectedFiles.length,
          },
        ];
        formData.append("questions", JSON.stringify(fileQuestion));
        selectedFiles.forEach((file, fileIndex) => {
          formData.append(`question_0_file_${fileIndex}`, {
            uri: file.uri,
            name: file.fileName,
            type: file.type,
          });
        });
      } else {
        formData.append("questions", JSON.stringify(normalizedQuestions));
      }

      console.log("Creating assessment with form data:", {
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory._id,
        assessmentType: assessmentType,
        chapter: chapterId,
        lesson: lessonId || "not provided",
        course: courseId,
        dueDate: dueDate?.toISOString(),
        semester: semesterId,
        quarter: quarterId,
        questions: JSON.stringify(normalizedQuestions),
      });

      const response = await api.post(
        "/api/assessment/createAssessment/updated",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Assessment creation response:", response.data);

      Toast.show("Assessment created successfully!", Toast.LONG);
      refreshAssessments();
      navigation.goBack();
    } catch (error: any) {
      console.error(
        "Error creating assessment:",
        error?.response?.status,
        error?.response?.data || error
      );
      console.error(
        "Full error object:",
        JSON.stringify(error?.response?.data, null, 2)
      );
      const backendMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create assessment";
      Toast.show(backendMessage, Toast.LONG);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => (navigateBack ? navigateBack() : navigation.goBack())}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Create New Assessment</Text>
          <Text style={styles.headerSubtitle}>
            Create a new Assessment for students.
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Assessment Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessment Type</Text>
          <View style={styles.typeSelectionContainer}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                assessmentType === "question" && styles.typeCardSelected,
              ]}
              onPress={() => handleAssessmentTypeChange("question")}
            >
              <View style={styles.typeCardContent}>
                <View
                  style={[
                    styles.typeIcon,
                    assessmentType === "question" && styles.typeIconSelected,
                  ]}
                >
                  <SimpleIcon
                    name="help-circle"
                    size={24}
                    color={assessmentType === "question" ? "#fff" : "#10B144"}
                  />
                </View>
                <Text
                  style={[
                    styles.typeTitle,
                    assessmentType === "question" && styles.typeTitleSelected,
                  ]}
                >
                  Question-Based
                </Text>
                <Text style={styles.typeDescription}>
                  Create custom questions (MCQ, True/False, Q&A)
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeCard,
                assessmentType === "file" && styles.typeCardSelected,
              ]}
              onPress={() => handleAssessmentTypeChange("file")}
            >
              <View style={styles.typeCardContent}>
                <View
                  style={[
                    styles.typeIcon,
                    assessmentType === "file" && styles.typeIconSelected,
                  ]}
                >
                  <SimpleIcon
                    name="description"
                    size={20}
                    color={assessmentType === "file" ? "#fff" : "#10B144"}
                    style={{ marginRight: 2 }}
                  />
                  <SimpleIcon
                    name="images"
                    size={20}
                    color={assessmentType === "file" ? "#fff" : "#10B144"}
                  />
                </View>
                <Text
                  style={[
                    styles.typeTitle,
                    assessmentType === "file" && styles.typeTitleSelected,
                  ]}
                >
                  File-Based
                </Text>
                <Text style={styles.typeDescription}>
                  Upload PDF files or images (1-5 files, max 5MB total)
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Assessment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessment Details</Text>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Assessment Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Assessment title"
              value={title}
              onChangeText={setTitle}
              maxLength={120}
            />
            <Text style={styles.characterCount}>{title.length}/120</Text>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter description and instructions"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={1000}
            />
            <Text style={styles.characterCount}>{description.length}/1000</Text>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !selectedCategory && styles.dropdownPlaceholder,
                ]}
              >
                {selectedCategory ? selectedCategory.name : "Select a Topic"}
              </Text>
              <SimpleIcon name="chevron-down" size={20} color="#7b8794" />
            </TouchableOpacity>
          </View>

          {/* Due Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Due Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {dueDate
                  ? `${formatDate(dueDate)} at ${formatTime(dueDate)}`
                  : "Select Due Date"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Questions Section - Only show for question-based assessment */}
        {assessmentType === "question" && (
          <View style={styles.section}>
            <View style={styles.questionsHeader}>
              <Text style={styles.sectionTitle}>Questions</Text>
              <TouchableOpacity
                style={styles.addQuestionButton}
                onPress={() => setShowAddQuestionModal(true)}
              >
                <SimpleIcon name="add" size={20} color="#fff" />
                <Text style={styles.addQuestionButtonText}>Add Question</Text>
              </TouchableOpacity>
            </View>

            {questions.map((question, index) => (
              <View key={question.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>
                    Question {index + 1}
                  </Text>
                  <View style={styles.questionActions}>
                    <TouchableOpacity
                      onPress={() => handleMoveQuestion(question.id, "up")}
                      disabled={index === 0}
                    >
                      <SimpleIcon
                        name="arrow-up"
                        size={20}
                        color={index === 0 ? "#ccc" : "#666"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleMoveQuestion(question.id, "down")}
                      disabled={index === questions.length - 1}
                    >
                      <SimpleIcon
                        name="arrow-down"
                        size={20}
                        color={index === questions.length - 1 ? "#ccc" : "#666"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteQuestion(question.id)}
                    >
                      <SimpleIcon name="trash" size={20} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.questionDetails}>
                  <View style={styles.questionTypeRow}>
                    <Text style={styles.questionTypeLabel}>Question Type:</Text>
                    <Text style={styles.questionTypeValue}>
                      {question.type === "mcq"
                        ? "Multiple Choice"
                        : question.type === "truefalse"
                        ? "True/False"
                        : "Question & Answer"}
                    </Text>
                  </View>

                  {/* Add Concept Display */}
                  {question.concept && (
                    <View style={styles.questionConceptRow}>
                      <Text style={styles.questionConceptLabel}>Concept:</Text>
                      <Text style={styles.questionConceptValue}>
                        {question.concept}
                      </Text>
                    </View>
                  )}

                  <View style={styles.questionPointsRow}>
                    <Text style={styles.questionPointsLabel}>Points:</Text>
                    <Text style={styles.questionPointsValue}>
                      {question.points}
                    </Text>
                  </View>
                  <Text style={styles.questionText}>
                    {question.question.replace(/<[^>]*>?/gm, "")}
                  </Text>
                  {question.options && question.options.length > 0 && (
                    <View style={styles.questionOptions}>
                      <Text style={styles.questionOptionsLabel}>Options:</Text>
                      {question.options.map((option, optIndex) => (
                        <Text key={optIndex} style={styles.questionOption}>
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </Text>
                      ))}
                    </View>
                  )}
                  {question.correctAnswer && (
                    <Text style={styles.correctAnswer}>
                      Correct Answer: {question.correctAnswer}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* File Upload Section - Only show for file-based assessment */}
        {assessmentType === "file" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload Files</Text>
            <Text style={styles.fileUploadDescription}>
              Upload PDF files or images (1-5 files, max 5MB total)
            </Text>

            <TouchableOpacity
              style={styles.fileUploadButton}
              onPress={handleFilePick}
            >
              <SimpleIcon name="cloud-upload" size={24} color="#10B144" />
              <Text style={styles.fileUploadButtonText}>Choose Files</Text>
            </TouchableOpacity>

            {selectedFiles.length > 0 && (
              <View style={styles.fileList}>
                {selectedFiles.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <SimpleIcon name="description" size={30} color="#10B144" />
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.fileName}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveFile(index)}>
                      <SimpleIcon name="close" size={20} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!title.trim() ||
              !description.trim() ||
              !selectedCategory ||
              (assessmentType === "question" && questions.length === 0) ||
              (assessmentType === "file" && selectedFiles.length === 0)) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitAssessment}
          disabled={
            loading ||
            !title.trim() ||
            !description.trim() ||
            !selectedCategory ||
            (assessmentType === "question" && questions.length === 0) ||
            (assessmentType === "file" && selectedFiles.length === 0)
          }
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Assessment</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView style={styles.categoryList}>
              {loadingCategories ? (
                <ActivityIndicator size="large" color="#10B144" />
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <TouchableOpacity
                    key={category._id}
                    style={[
                      styles.categoryItem,
                      selectedCategory?._id === category._id &&
                        styles.categoryItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedCategory(category);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        selectedCategory?._id === category._id &&
                          styles.categoryItemTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noCategoriesText}>
                  No categories available
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>

            {/* Add New Topic CTA */}
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: "#111" }]}
              onPress={() => {
                setShowCategoryModal(false);
                setShowAddCategoryModal(true);
              }}
            >
              <Text style={[styles.modalCloseButtonText, { color: "#fff" }]}>
                + Add New Topic
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Question Type Selection Modal */}
      <Modal
        visible={showQuestionTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuestionTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Question Type</Text>
            <ScrollView style={styles.categoryList}>
              {QuestionType.length > 0 ? (
                QuestionType.map((category) => (
                  <TouchableOpacity
                    key={category._id}
                    style={[
                      styles.categoryItem,
                      currentQuestion?.type === category.type &&
                        styles.categoryItemSelected,
                    ]}
                    onPress={() => {
                      setCurrentQuestion({
                        ...currentQuestion,
                        type: category.type as any,
                      });
                      setShowQuestionTypeModal(false);
                      setShowAddQuestionModal(true);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        currentQuestion?.type === category.type &&
                          styles.categoryItemTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noCategoriesText}>
                  No question type available
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowQuestionTypeModal(false);
                setShowAddQuestionModal(true);
              }}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add New Topic Modal */}
      <Modal
        visible={showAddCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Topic</Text>
            <Text style={{ color: "#6b7280", marginBottom: 16 }}>
              Create a new assessment category for this course.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Topic Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Midterm Exam, Quiz, Assignment"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (%)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                value={newCategoryWeight}
                onChangeText={setNewCategoryWeight}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.cancelQuestionButton]}
                onPress={() => setShowAddCategoryModal(false)}
                disabled={creatingCategory}
              >
                <Text style={styles.cancelQuestionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveQuestionButton]}
                onPress={handleCreateCategory}
                disabled={creatingCategory}
              >
                {creatingCategory ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveQuestionButtonText}>
                    Create Category
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Question Modal */}
      <Modal
        visible={showAddQuestionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddQuestionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.questionModalContent]}>
            <Text style={styles.modalTitle}>Add Question</Text>

            <ScrollView style={styles.questionForm}>
              {/* Question Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Question Type</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => {
                    setShowAddQuestionModal(false);
                    setShowQuestionTypeModal(true);
                  }}
                >
                  <Text style={styles.dropdownText}>
                    {currentQuestion.type === "mcq"
                      ? "Multiple Choice"
                      : currentQuestion.type === "truefalse"
                      ? "True/False"
                      : "Question & Answer"}
                  </Text>
                  <SimpleIcon name="chevron-down" size={20} color="#7b8794" />
                </TouchableOpacity>
              </View>

              {/* Points */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Points</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter points"
                  value={currentQuestion.points?.toString() || ""}
                  onChangeText={(text) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      points: parseInt(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                />
              </View>

              {/* Concept */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Concept</Text>
                <View style={styles.conceptTextEditor}>
                  <TextInput
                    style={styles.conceptTextInput}
                    // placeholder="Start writing..."
                    value={currentQuestion.concept || ""} // Use currentQuestion.concept
                    onChangeText={(text) =>
                      setCurrentQuestion({ ...currentQuestion, concept: text })
                    }
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

              {/* Question Text */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Question</Text>
                <View style={styles.richTextEditor}>
                  <TextInput
                    style={styles.richTextInput}
                    placeholder="Start writing..."
                    value={currentQuestion.question}
                    onChangeText={(text) =>
                      setCurrentQuestion({ ...currentQuestion, question: text })
                    }
                    multiline
                    numberOfLines={4}
                  />
                  <View style={styles.richTextFooter}>
                    <Text style={styles.richTextCounter}>
                      CHARS: {currentQuestion.question?.length || 0} WORDS:{" "}
                      {currentQuestion.question?.split(/\s+/).filter(Boolean)
                        .length || 0}{" "}
                      POWERED BY JODIT
                    </Text>
                  </View>
                </View>
              </View>

              {/* Options for MCQ */}
              {currentQuestion.type === "mcq" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Answer Options</Text>
                  <Text style={styles.optionsHint}>
                    Maximum of 4 options allowed.
                  </Text>
                  {currentQuestion.options?.map((option, index) => (
                    <View key={index} style={styles.optionRow}>
                      <TouchableOpacity
                        style={[
                          styles.optionRadio,
                          currentQuestion.correctAnswer === option &&
                            styles.optionRadioSelected,
                        ]}
                        onPress={() =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswer: option,
                          })
                        }
                      >
                        {currentQuestion.correctAnswer === option && (
                          <View style={styles.optionRadioInner} />
                        )}
                      </TouchableOpacity>
                      <TextInput
                        style={styles.optionInput}
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChangeText={(text) => {
                          const newOptions = [
                            ...(currentQuestion.options || []),
                          ];
                          newOptions[index] = text;
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: newOptions,
                          });
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          const newOptions =
                            currentQuestion.options?.filter(
                              (_, i) => i !== index
                            ) || [];
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: newOptions,
                          });
                        }}
                      >
                        <SimpleIcon name="trash" size={20} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {currentQuestion.options &&
                    currentQuestion.options.length < 4 && (
                      <TouchableOpacity
                        style={styles.addOptionButton}
                        onPress={() => {
                          const newOptions = [
                            ...(currentQuestion.options || []),
                            "",
                          ];
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: newOptions,
                          });
                        }}
                      >
                        <SimpleIcon
                          name="add-circle-outline"
                          size={20}
                          color="#10B144"
                        />
                        <Text style={styles.addOptionButtonText}>
                          Add Option
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>
              )}

              {/* True/False Options */}
              {currentQuestion.type === "truefalse" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Correct Answer</Text>
                  <View style={styles.trueFalseContainer}>
                    <TouchableOpacity
                      style={[
                        styles.trueFalseOption,
                        currentQuestion.correctAnswer === "true" &&
                          styles.trueFalseOptionSelected,
                      ]}
                      onPress={() =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          correctAnswer: "true",
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.trueFalseText,
                          currentQuestion.correctAnswer === "true" &&
                            styles.trueFalseTextSelected,
                        ]}
                      >
                        True
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.trueFalseOption,
                        currentQuestion.correctAnswer === "false" &&
                          styles.trueFalseOptionSelected,
                      ]}
                      onPress={() =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          correctAnswer: "false",
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.trueFalseText,
                          currentQuestion.correctAnswer === "false" &&
                            styles.trueFalseTextSelected,
                        ]}
                      >
                        False
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.questionModalActions}>
              <TouchableOpacity
                style={styles.saveQuestionButton}
                onPress={handleAddQuestion}
              >
                <Text style={styles.saveQuestionButtonText}>Save Question</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelQuestionButton}
                onPress={() => setShowAddQuestionModal(false)}
              >
                <Text style={styles.cancelQuestionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <>
          {Platform.OS === "ios" && (
            <Text
              style={{
                color: "#007AFF",
                fontSize: 18,
                fontWeight: "600",
                alignSelf: "flex-end",
                marginTop: 10,
                marginRight: 15,
              }}
              onPress={() => {
                setShowDatePicker(false);
                if (tempDate) {
                  setTimeout(() => setShowTimePicker(true), 200);
                }
              }}
            >
              Done
            </Text>
          )}
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            style={{ alignSelf: "center" }}
            onChange={(event, selectedDate) => {
              if (Platform.OS === "android") {
                setShowDatePicker(false);
                if (event.type === "set" && selectedDate) {
                  setTempDate(selectedDate);
                  setTimeout(() => setShowTimePicker(true), 200);
                } else {
                  setTempDate(null);
                }
              } else {
                if (selectedDate) {
                  setTempDate(selectedDate);
                  setDueDate(selectedDate);
                }
              }
            }}
          />
        </>
      )}

      {showTimePicker && (
        <>
          {Platform.OS === "ios" && (
            <Text
              style={{
                color: "#007AFF",
                fontSize: 18,
                fontWeight: "600",
                alignSelf: "flex-end",
                marginTop: 10,
                marginRight: 15,
              }}
              onPress={() => {
                setShowTimePicker(false);
                if (tempDate) {
                  setDueDate(tempDate);
                }
              }}
            >
              Done
            </Text>
          )}
          <DateTimePicker
            value={tempDate || new Date()}
            mode="time"
            style={{ alignSelf: "center" }}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedTime) => {
              if (Platform.OS === "android") {
                setShowTimePicker(false);
                if (event.type === "set" && selectedTime && tempDate) {
                  const combined = new Date(tempDate);
                  combined.setHours(selectedTime.getHours());
                  combined.setMinutes(selectedTime.getMinutes());
                  setDueDate(combined);
                } else {
                  setTempDate(null);
                  setDueDate(null);
                }
              } else {
                if (selectedTime && tempDate) {
                  const combined = new Date(tempDate);
                  combined.setHours(selectedTime.getHours());
                  combined.setMinutes(selectedTime.getMinutes());
                  setTempDate(combined);
                }
              }
            }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  typeSelectionContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fff",
  },
  typeCardSelected: {
    borderColor: "#10B144",
    backgroundColor: "#f0fdf4",
  },
  typeCardContent: {
    alignItems: "center",
  },
  typeIcon: {
    width: 60,
    height: 60,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#10B144",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    flexDirection: "row",
  },
  typeIconSelected: {
    backgroundColor: "#10B144",
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  typeTitleSelected: {
    color: "#10B144",
  },
  typeDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    color: "#7b8794",
    textAlign: "right",
    marginTop: 4,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownPlaceholder: {
    color: "#7b8794",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  questionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addQuestionButton: {
    backgroundColor: "#10B144",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  addQuestionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
  },
  questionCard: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  questionActions: {
    flexDirection: "row",
    gap: 8,
  },
  questionDetails: {
    gap: 8,
  },
  questionTypeRow: {
    flexDirection: "row",
    gap: 8,
  },
  questionTypeLabel: {
    fontSize: 14,
    color: "#666",
  },
  questionTypeValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  questionPointsRow: {
    flexDirection: "row",
    gap: 8,
  },
  questionPointsLabel: {
    fontSize: 14,
    color: "#666",
  },
  questionPointsValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  questionText: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  questionOptions: {
    marginTop: 8,
  },
  questionOptionsLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  questionOption: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  correctAnswer: {
    fontSize: 14,
    color: "#10B144",
    fontWeight: "500",
    marginTop: 4,
  },
  fileUploadDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  fileUploadButton: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  fileUploadButtonText: {
    fontSize: 16,
    color: "#10B144",
    fontWeight: "bold",
    marginLeft: 8,
  },
  fileList: {
    marginTop: 12,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: "#222",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 55,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  questionModalContent: {
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 16,
  },
  categoryList: {
    maxHeight: 200,
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryItemSelected: {
    backgroundColor: "#f0fdf4",
  },
  categoryItemText: {
    fontSize: 16,
    color: "#333",
  },
  categoryItemTextSelected: {
    color: "#10B144",
    fontWeight: "bold",
  },
  noCategoriesText: {
    textAlign: "center",
    color: "#7b8794",
    paddingVertical: 20,
  },
  modalCloseButton: {
    backgroundColor: "#eee",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  questionForm: {
    maxHeight: 400,
  },
  richTextEditor: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  richTextInput: {
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  richTextFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  richTextCounter: {
    fontSize: 12,
    color: "#7b8794",
  },
  conceptTextEditor: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fff",
    minHeight: 80,
  },
  conceptTextInput: {
    fontSize: 16,
    color: "#333",
    padding: 0,
    flex: 1,
  },
  optionsHint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  optionRadioSelected: {
    borderColor: "#10B144",
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B144",
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginTop: 8,
  },
  addOptionButtonText: {
    color: "#10B144",
    fontWeight: "bold",
    marginLeft: 4,
  },
  trueFalseContainer: {
    flexDirection: "row",
    gap: 12,
  },
  trueFalseOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    alignItems: "center",
  },
  trueFalseOptionSelected: {
    borderColor: "#10B144",
    backgroundColor: "#f0fdf4",
  },
  trueFalseText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  trueFalseTextSelected: {
    color: "#10B144",
  },
  questionModalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  saveQuestionButton: {
    flex: 1,
    backgroundColor: "#222",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveQuestionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelQuestionButton: {
    flex: 1,
    backgroundColor: "#eee",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelQuestionButtonText: {
    color: "#555",
    fontWeight: "bold",
    fontSize: 16,
  },

  questionConceptRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  questionConceptLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  questionConceptValue: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
});

export default CreateAssessmentPage;

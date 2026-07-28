// components/AddAssessmentForm.tsx
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
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-simple-toast";
import SimpleIcon from "./SimpleIcon";
import AnimatedBottomSheet from "./common/AnimatedBottomSheet";
import AIAssistantSheet, {
  parseMCQFromAI,
  parseTrueFalseFromAI,
} from "./common/AIAssistantSheet";
import { Sparkles } from "lucide-react-native";
import { createApiInstance, addAuthInterceptor } from "../services/course";
import { pick, types } from "@react-native-documents/picker";

interface Question {
  id: string;
  type: "mcq" | "truefalse" | "qa" | "file";
  question: string;
  concept?: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  files?: any[];
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

interface AddAssessmentFormProps {
  courseId: string;
  chapterId: string;
  lessonId?: string;
  semesterId?: string;
  quarterId?: string;
  // Optional: if the parent screen already fetched these (e.g. CreateAssessmentPage),
  // pass them down so this component doesn't make a duplicate network call.
  quarterStartDate?: Date | null;
  quarterEndDate?: Date | null;
  onAssessmentCreated: () => void;
  onCancel: () => void;
}

const AddAssessmentForm: React.FC<AddAssessmentFormProps> = ({
  courseId,
  chapterId,
  lessonId,
  semesterId,
  quarterId,
  quarterStartDate,
  quarterEndDate,
  onAssessmentCreated,
  onCancel,
}) => {
  const QuestionType: QuestionType[] = [
    { _id: "1", name: "Multiple Choice", type: "mcq" },
    { _id: "2", name: "True/False", type: "truefalse" },
    { _id: "3", name: "Question & Answer", type: "qa" },
    { _id: "4", name: "File Upload", type: "file" },
  ];

  const MAX_PDF_SIZE_MB = 5;
  const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

  // Assessment type state
  const [assessmentType, setAssessmentType] = useState<"question" | "file">(
    "question"
  );

  // Basic details
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
  const [quarterDatesLoading, setQuarterDatesLoading] = useState(false);
  const [quarterDatesError, setQuarterDatesError] = useState<string | null>(
    null
  );

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: "mcq",
    question: "",
    concept: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    points: 1,
  });

  // AI Assistant
  const [showAITitleSheet, setShowAITitleSheet] = useState(false);
  const [showAIDescriptionSheet, setShowAIDescriptionSheet] = useState(false);
  const [showAIQuestionSheet, setShowAIQuestionSheet] = useState(false);

  // File upload
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // ── Helper: format date for display ──
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

  // ── Fetch categories ──
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      if (!courseId) {
        setCategories([
          { _id: "default1", name: "Quiz" },
          { _id: "default2", name: "Assignment" },
          { _id: "default3", name: "Exam" },
          { _id: "default4", name: "Project" },
        ]);
        setLoadingCategories(false);
        return;
      }

      const api = await createApiInstance();
      addAuthInterceptor(api);
      let response;
      try {
        response = await api.get(`/api/assessmentCategory/${courseId}`);
      } catch (firstError: any) {
        if (
          firstError.response?.status === 404 ||
          firstError.response.data.message
            .toLowerCase()
            .includes("no categories found")
        ) {
          try {
            response = await api.get(`/api/courses/${courseId}/categories`);
          } catch (secondError: any) {
            if (secondError.response?.status === 500) {
              Toast.show(
                "We are having trouble while fetching categories for this assessment category, Try again later.",
                Toast.LONG
              );
            }
            if (secondError.response?.status === 404) {
              response = await api.get(
                `/api/assessment/categories?courseId=${courseId}`
              );
            } else {
              Toast.show(
                "No Assessment categories exists for this course. Please create a new category.",
                Toast.LONG
              );
              throw secondError;
            }
          }
        } else {
          Toast.show(
            "No Assessment categories exists for this course. Please create a new category.",
            Toast.LONG
          );

          throw firstError;
        }
      }

      let categoriesData = [];
      if (response.data.categories) {
        categoriesData = response.data.categories;
      } else if (response.data.data) {
        categoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      }

      const mappedCategories = categoriesData.map((category: any) => ({
        _id: category._id || category.id || `temp_${Date.now()}`,
        name: category.name || category.title || "Unnamed Category",
      }));
      setCategories(mappedCategories);
      if (mappedCategories.length > 0 && !selectedCategory) {
        setSelectedCategory(mappedCategories[0]);
      }
    } catch (error: any) {
      const defaultCategories = [
        { _id: "default1", name: "Quiz" },
        { _id: "default2", name: "Assignment" },
        { _id: "default3", name: "Exam" },
        { _id: "default4", name: "Project" },
      ];
      setCategories(defaultCategories);
      Toast.show(
        error.response?.status === 404
          ? "Categories endpoint not found. Using default categories."
          : "Failed to fetch categories. Using default categories.",
        Toast.LONG
      );
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

  // ── Apply resolved quarter dates (from props or our own fetch) ──
  // Uses a functional setState for dueDate so this doesn't need dueDate as
  // a dependency anywhere it's called from.
  const applyQuarterDates = (start: Date, end: Date) => {
    setQuarterDates({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
    setQuarterDatesError(null);
    setDueDate((prevDueDate) => {
      if (prevDueDate && (prevDueDate < start || prevDueDate > end)) {
        Toast.show(
          `Previous due date was outside the quarter range. Please select a new date within ${formatDate(
            start
          )} – ${formatDate(end)}`,
          Toast.LONG
        );
        return null;
      }
      return prevDueDate;
    });
  };

  // ── Fetch quarter dates ourselves (fallback when no props are given) ──
  const fetchQuarterDates = async () => {
    if (!quarterId) {
      setQuarterDatesError(
        "No quarter selected — due date won't be restricted to a quarter range."
      );
      return;
    }
    setQuarterDatesLoading(true);
    setQuarterDatesError(null);
    try {
      const api = await createApiInstance();
      addAuthInterceptor(api);
      const response = await api.get(
        `/api/quarter/getDatesofQuarter/${quarterId}`
      );
      const start = new Date(response.data.startDate);
      const end = new Date(response.data.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Quarter dates were missing or invalid.");
      }

      applyQuarterDates(start, end);
    } catch (error) {
      console.error("Failed to fetch quarter dates:", error);
      setQuarterDatesError(
        "Couldn't load the quarter's date range. You can still pick a due date, but it won't be checked against the quarter."
      );
    } finally {
      setQuarterDatesLoading(false);
    }
  };

  // ── Effects ──
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Prefer dates already resolved by the parent screen — avoids a
    // duplicate network call for the same quarter.
    if (quarterStartDate && quarterEndDate) {
      applyQuarterDates(quarterStartDate, quarterEndDate);
      setQuarterDatesLoading(false);
      return;
    }
    if (quarterId) {
      fetchQuarterDates();
    } else {
      setQuarterDatesLoading(false);
      setQuarterDatesError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quarterId, quarterStartDate, quarterEndDate]);

  // ── Handlers ──
  const handleAssessmentTypeChange = (type: "question" | "file") => {
    setAssessmentType(type);
    if (type === "file") {
      setQuestions([]);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleAcceptAIQuestion = (content: string) => {
    if (currentQuestion.type === "mcq") {
      const parsed = parseMCQFromAI(content);
      setCurrentQuestion((prev) => ({
        ...prev,
        question: parsed.question,
        options: parsed.options.length > 0 ? parsed.options : prev.options,
        correctAnswer: parsed.correctAnswer || prev.correctAnswer,
      }));
    } else if (currentQuestion.type === "truefalse") {
      const parsed = parseTrueFalseFromAI(content);
      setCurrentQuestion((prev) => ({
        ...prev,
        question: parsed.question,
        correctAnswer: parsed.correctAnswer || prev.correctAnswer,
      }));
    } else {
      setCurrentQuestion((prev) => ({ ...prev, question: content.trim() }));
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
    if (
      currentQuestion.type === "file" &&
      (!currentQuestion.files || currentQuestion.files.length === 0)
    ) {
      Toast.show("Please attach at least one file", Toast.SHORT);
      return;
    }
    if (!currentQuestion.points || currentQuestion.points <= 0) {
      Toast.show("Please enter valid points", Toast.SHORT);
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      type: currentQuestion.type as "mcq" | "truefalse" | "qa" | "file",
      question: currentQuestion.question,
      concept: currentQuestion.concept || "",
      options:
        currentQuestion.type === "mcq" ? currentQuestion.options : undefined,
      correctAnswer: currentQuestion.correctAnswer,
      points: currentQuestion.points,
      files: currentQuestion.type === "file" ? currentQuestion.files : undefined,
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      concept: "",
      correctAnswer: "",
      points: 1,
      files: [],
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
    try {
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
    } catch (error) {
      // ignore
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleQuestionFilePick = async () => {
    try {
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
        setCurrentQuestion((prev) => ({
          ...prev,
          files: [...(prev.files || []), newFile],
        }));
      }
    } catch (error) {
      // ignore (user cancelled picker)
    }
  };

  const handleRemoveQuestionFile = (index: number) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      files: (prev.files || []).filter((_, i) => i !== index),
    }));
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
            question: q.question,
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
        questions.forEach((q, questionIndex) => {
          if (q.type !== "file") return;
          (q.files || []).forEach((file, fileIndex) => {
            formData.append(`question_${questionIndex}_file_${fileIndex}`, {
              uri: file.uri,
              name: file.fileName,
              type: file.type,
            } as any);
          });
        });
      }

      const response = await api.post(
        "/api/assessment/createAssessment/updated",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      Toast.show("Assessment created successfully!", Toast.LONG);
      onAssessmentCreated();
      onCancel();
    } catch (error: any) {
      // console.error("Error creating assessment:", error);
      Toast.show(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create assessment",
        Toast.LONG
      );
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
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

        <View style={styles.inputGroup}>
          <View style={styles.aiLabelRow}>
            <Text style={styles.inputLabel}>Assessment Title</Text>
            <TouchableOpacity
              style={styles.aiSmallButton}
              onPress={() => setShowAITitleSheet(true)}
              activeOpacity={0.8}
            >
              <Sparkles color="#6366f1" size={14} style={styles.aiSmallButtonIcon} />
              <Text style={styles.aiSmallButtonText}>AI Generate</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Enter Assessment title"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />
          <Text style={styles.characterCount}>{title.length}/120</Text>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.aiLabelRow}>
            <Text style={styles.inputLabel}>Description</Text>
            <TouchableOpacity
              style={styles.aiSmallButton}
              onPress={() => setShowAIDescriptionSheet(true)}
              activeOpacity={0.8}
            >
              <Sparkles color="#6366f1" size={14} style={styles.aiSmallButtonIcon} />
              <Text style={styles.aiSmallButtonText}>AI Generate</Text>
            </TouchableOpacity>
          </View>
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

          {quarterDatesLoading && (
            <View style={styles.quarterStatusRow}>
              <ActivityIndicator size="small" color="#10B144" />
              <Text style={styles.quarterHint}>Loading quarter dates…</Text>
            </View>
          )}

          {quarterDatesError && !quarterDatesLoading && (
            <View style={styles.quarterErrorRow}>
              <Text style={styles.quarterErrorText}>{quarterDatesError}</Text>
              {quarterId && (
                <TouchableOpacity onPress={fetchQuarterDates}>
                  <Text style={styles.quarterRetryText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {quarterDates && !quarterDatesLoading && !quarterDatesError && (
            <Text style={styles.quarterHint}>
              Quarter: {formatDate(new Date(quarterDates.startDate))} –{" "}
              {formatDate(new Date(quarterDates.endDate))}
            </Text>
          )}
        </View>
      </View>

      {/* Questions Section */}
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
                <Text style={styles.questionNumber}>Question {index + 1}</Text>
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
                <Text style={styles.questionText}>{question.question}</Text>
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
                {question.type === "file" && (
                  <Text style={styles.questionOptionsLabel}>
                    {question.files?.length || 0} file
                    {(question.files?.length || 0) !== 1 ? "s" : ""} attached
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* File Upload Section */}
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

      {/* Category Selection Sheet */}
      <AnimatedBottomSheet
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      >
        <Text style={styles.modalTitle}>Select Category</Text>
        <ScrollView style={styles.categoryList}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
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
      </AnimatedBottomSheet>

      {/* Add New Topic Sheet */}
      <AnimatedBottomSheet
        visible={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
      >
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
            style={styles.cancelQuestionButton}
            onPress={() => setShowAddCategoryModal(false)}
            disabled={creatingCategory}
          >
            <Text style={styles.cancelQuestionButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveQuestionButton}
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
      </AnimatedBottomSheet>

      {/* Question Type Sheet */}
      <AnimatedBottomSheet
        visible={showQuestionTypeModal}
        onClose={() => setShowQuestionTypeModal(false)}
      >
        <Text style={styles.modalTitle}>Select Question Type</Text>
        <ScrollView style={styles.categoryList}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {QuestionType.map((type) => (
            <TouchableOpacity
              key={type._id}
              style={[
                styles.categoryItem,
                currentQuestion?.type === type.type &&
                styles.categoryItemSelected,
              ]}
              onPress={() => {
                setCurrentQuestion({
                  ...currentQuestion,
                  type: type.type as any,
                });
                setShowQuestionTypeModal(false);
                setShowAddQuestionModal(true);
              }}
            >
              <Text
                style={[
                  styles.categoryItemText,
                  currentQuestion?.type === type.type &&
                  styles.categoryItemTextSelected,
                ]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
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
      </AnimatedBottomSheet>

      {/* AI Assistant Sheets */}
      <AIAssistantSheet
        visible={showAITitleSheet}
        onClose={() => setShowAITitleSheet(false)}
        usedfor="assessmentTitle"
        onAccept={(content) => setTitle(content.trim())}
      />
      <AIAssistantSheet
        visible={showAIDescriptionSheet}
        onClose={() => setShowAIDescriptionSheet(false)}
        usedfor="assessmentDescription"
        onAccept={(content) => setDescription(content.trim())}
      />
      <AIAssistantSheet
        visible={showAIQuestionSheet}
        onClose={() => setShowAIQuestionSheet(false)}
        usedfor={`question-${currentQuestion.type === "file" ? "qa" : currentQuestion.type || "qa"}`}
        showDifficulty
        onAccept={handleAcceptAIQuestion}
      />

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
            <ScrollView style={styles.questionForm}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
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
                        : currentQuestion.type === "file"
                          ? "File Upload"
                          : "Question & Answer"}
                  </Text>
                  <SimpleIcon name="chevron-down" size={20} color="#7b8794" />
                </TouchableOpacity>
              </View>
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
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Concept</Text>
                <View style={styles.conceptTextEditor}>
                  <TextInput
                    style={styles.conceptTextInput}
                    value={currentQuestion.concept || ""}
                    onChangeText={(text) =>
                      setCurrentQuestion({ ...currentQuestion, concept: text })
                    }
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <View style={styles.aiLabelRow}>
                  <Text style={styles.inputLabel}>Question</Text>
                  {currentQuestion.type !== "file" && (
                    <TouchableOpacity
                      style={styles.aiSmallButton}
                      onPress={() => setShowAIQuestionSheet(true)}
                      activeOpacity={0.8}
                    >
                      <Sparkles
                        color="#6366f1"
                        size={14}
                        style={styles.aiSmallButtonIcon}
                      />
                      <Text style={styles.aiSmallButtonText}>AI Generate</Text>
                    </TouchableOpacity>
                  )}
                </View>
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

              {currentQuestion.type === "file" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Attached Files</Text>
                  <Text style={styles.optionsHint}>
                    PDF only, up to 5MB per file.
                  </Text>
                  {(currentQuestion.files || []).map((file, index) => (
                    <View key={index} style={styles.fileItem}>
                      <SimpleIcon name="description" size={24} color="#10B144" />
                      <Text style={styles.fileName} numberOfLines={1}>
                        {file.fileName}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveQuestionFile(index)}
                      >
                        <SimpleIcon name="close" size={20} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addOptionButton}
                    onPress={handleQuestionFilePick}
                  >
                    <SimpleIcon
                      name="add-circle-outline"
                      size={20}
                      color="#10B144"
                    />
                    <Text style={styles.addOptionButtonText}>Attach File</Text>
                  </TouchableOpacity>
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

      {/* ── Date Picker ── */}
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
            // ── Restrict to quarter dates ──
            minimumDate={
              quarterDates ? new Date(quarterDates.startDate) : undefined
            }
            maximumDate={
              quarterDates ? new Date(quarterDates.endDate) : undefined
            }
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

      {/* ── Time Picker ── */}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  aiLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aiSmallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  aiSmallButtonIcon: {
    marginRight: 4,
  },
  aiSmallButtonText: {
    color: "#4c1d95",
    fontSize: 12,
    fontWeight: "600",
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
  quarterHint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  quarterStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  quarterErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    backgroundColor: "#fef2f2",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  quarterErrorText: {
    flex: 1,
    fontSize: 12,
    color: "#b91c1c",
    marginRight: 8,
  },
  quarterRetryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B144",
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
});

export default AddAssessmentForm;

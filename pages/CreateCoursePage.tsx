import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  launchImageLibrary,
  ImagePickerResponse,
  ImageLibraryOptions,
} from "react-native-image-picker";
import { pick, types } from "@react-native-documents/picker";
import {
  createCourse,
  getCategories,
  getSubcategories,
  getSemesters,
  getQuartersBySemesters,
} from "../services/course";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import Toast from "react-native-simple-toast";
import { useUser } from "../contexts/UserContext";
import { Sparkles } from "lucide-react-native";
import { getApiInstance } from "../services/apiInstance";

interface Category {
  _id: string;
  title: string;
}

interface Subcategory {
  _id: string;
  title: string;
  category: string;
}

interface Semester {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Quarter {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  isArchived: boolean;
  semester: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface AIButtonProps {
  onPress: () => void;
  label: string;
}

interface AIModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: () => void;
  prompt: string;
  setPrompt: (text: string) => void;
  isGenerating: boolean;
  placeholder?: string;
}

// StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    flex: 1,
  },
  headerWithButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  inputError: {
    borderColor: "red",
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 8,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  selectButton: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
    justifyContent: "center",
  },
  placeholderText: {
    color: "#999",
  },
  thumbnailContainer: {
    height: 150,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  thumbnailImageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  thumbnailChangeButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 8,
    borderRadius: 4,
  },
  thumbnailChangeButtonText: {
    color: "white",
  },
  thumbnailUploadContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    padding: 8,
  },
  uploadButton: {
    justifyContent: "center",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  aiButtonIcon: {
    marginRight: 8,
  },
  aiButtonText: {
    color: "#4c1d95",
    fontSize: 15,
    fontWeight: "600",
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
  },
  aiSmallButtonIcon: {
    marginRight: 4,
  },
  aiSmallButtonText: {
    color: "#4c1d95",
    fontSize: 12,
    fontWeight: "600",
  },
  listItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  listItemNumber: {
    marginRight: 8,
  },
  listItemInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  removeButtonText: {
    color: "red",
  },
  addButton: {
    alignSelf: "flex-start",
    padding: 8,
  },
  addButtonText: {
    color: "blue",
  },
  selectedItemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  selectedItem: {
    backgroundColor: "#e6ffe6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  quarterSelectedItem: {
    backgroundColor: "#e6f3ff",
  },
  selectedItemText: {
    fontSize: 12,
  },
  createButton: {
    backgroundColor: "green",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 36,
  },
  createButtonDisabled: {
    backgroundColor: "#ccc",
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },
  modalItemSelected: {
    backgroundColor: "#e6ffe6",
  },
  modalItemText: {
    fontSize: 16,
    flex: 1,
  },
  modalCancelButtonFull: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
  },
  modalCancelButtonFullText: {
    textAlign: "center",
  },
  modalDoneButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  modalDoneButtonQuarter: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#2196F3",
    borderRadius: 4,
  },
  modalDoneButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  aiAssistantHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  aiAssistantHeaderTitle: {
    fontSize: 18,
    color: "#000",
    fontWeight: "700",
  },
  aiAssistantTitle: {
    fontSize: 17,
    color: "#000",
    fontWeight: "700",
    alignSelf: "center",
    marginTop: 8,
  },
  aiAssistantDescription: {
    marginVertical: 16,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  aiPromptInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 16,
    fontSize: 15,
    color: "#000",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  modalCancelButtonText: {
    textAlign: "center",
    color: "#333",
    fontWeight: "500",
  },
  modalGenerateButton: {
    flex: 2,
    padding: 12,
    backgroundColor: "#6366f1",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalGenerateButtonDisabled: {
    opacity: 0.5,
  },
  modalGenerateIcon: {
    marginRight: 8,
  },
  modalGenerateButtonText: {
    color: "white",
    fontWeight: "600",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 3,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    borderColor: "#4CAF50",
    backgroundColor: "#4CAF50",
  },
  checkboxCheckedQuarter: {
    borderColor: "#2196F3",
    backgroundColor: "#2196F3",
  },
  checkmark: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 20,
  },
  noDataText: {
    padding: 12,
    textAlign: "center",
    color: "#666",
  },
});

// AIModal component
const AIModal: React.FC<AIModalProps> = ({
  visible,
  onClose,
  onGenerate,
  prompt,
  setPrompt,
  isGenerating,
  placeholder = "Describe what you want to create...",
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.aiAssistantHeader}>
            <Sparkles color="#7dd182" size={22} />
            <Text style={styles.aiAssistantHeaderTitle}>AI Assistant</Text>
          </View>

          <Text style={styles.aiAssistantTitle}>
            Start writing to make the magic happen.
          </Text>

          <Text style={styles.aiAssistantDescription}>
            Suggestions will appear here.
          </Text>

          <TextInput
            placeholder={placeholder}
            style={styles.aiPromptInput}
            multiline
            value={prompt}
            onChangeText={setPrompt}
          />

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={onClose}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalGenerateButton,
                (isGenerating || !prompt.trim()) &&
                styles.modalGenerateButtonDisabled,
              ]}
              onPress={onGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Sparkles
                    color="white"
                    size={20}
                    style={styles.modalGenerateIcon}
                  />
                  <Text style={styles.modalGenerateButtonText}>Generate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CreateCoursePage = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageFilename, setSelectedImageFilename] = useState<
    string | null
  >(null);
  const [selectedSyllabusFile, setSelectedSyllabusFile] = useState<any>(null);
  const [teachingPoints, setTeachingPoints] = useState<string[]>([""]);
  const [courseRequirements, setCourseRequirements] = useState<string[]>([""]);
  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [language, setLanguage] = useState("English");
  const [courseDescription, setCourseDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSemesterBasedModal, setShowSemesterBasedModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState("");
  const [semesterBased, setSemesterBased] = useState<any>();
  const [selectedSubcategoryTitle, setSelectedSubcategoryTitle] = useState("");
  const { user } = useUser();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([]);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showQuarterModal, setShowQuarterModal] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isLoadingQuarters, setIsLoadingQuarters] = useState(false);

  // AI States for Thumbnail
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // AI States for Description
  const [showAIDescriptionModal, setShowAIDescriptionModal] = useState(false);
  const [aiDescriptionPrompt, setAiDescriptionPrompt] = useState("");
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // AI States for Teaching Points
  const [showAITeachingPointsModal, setShowAITeachingPointsModal] =
    useState(false);
  const [aiTeachingPointsPrompt, setAiTeachingPointsPrompt] = useState("");
  const [isGeneratingTeachingPoints, setIsGeneratingTeachingPoints] =
    useState(false);

  // AI States for Requirements
  const [showAIRequirementsModal, setShowAIRequirementsModal] = useState(false);
  const [aiRequirementsPrompt, setAiRequirementsPrompt] = useState("");
  const [isGeneratingRequirements, setIsGeneratingRequirements] =
    useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (category) {
      fetchSubcategories(category);
    } else {
      setSubcategories([]);
    }
  }, [category]);

  useEffect(() => {
    if (selectedSemesters.length > 0) {
      fetchQuarters(selectedSemesters);
    } else {
      setQuarters([]);
      setSelectedQuarters([]);
    }
  }, [selectedSemesters]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await getCategories();
      setCategories(response.data);
    } catch (error: any) {
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const response = await getSubcategories(categoryId);
      setSubcategories(response.data);
    } catch (error: any) {
      setSubcategories([]);
    }
  };

  const fetchSemesters = async () => {
    try {
      setIsLoadingSemesters(true);
      const response = await getSemesters();
      setSemesters(response.semesters || []);
    } catch (error: any) {
      setSemesters([]);
    } finally {
      setIsLoadingSemesters(false);
    }
  };

  const fetchQuarters = async (semesterIds: string[]) => {
    try {
      setIsLoadingQuarters(true);
      const response = await getQuartersBySemesters(semesterIds);
      setQuarters(response.quarters || []);
    } catch (error: any) {
      setQuarters([]);
    } finally {
      setIsLoadingQuarters(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!courseTitle || courseTitle.length < 5 || courseTitle.length > 100) {
      newErrors.courseTitle =
        "Course title must be between 5 and 100 characters";
    } else if (
      /^[.,\s]+$/.test(courseTitle) ||
      /\.{3,}/.test(courseTitle) ||
      /,{3,}/.test(courseTitle)
    ) {
      newErrors.courseTitle = "Course title contains invalid characters";
    }
    if (user?.email != "testaccount@yopmail.com" && !coursePrice) {
      newErrors.coursePrice = "Course price is required";
    } else if (
      user?.email != "testaccount@yopmail.com" &&
      !/^\d+$/.test(coursePrice)
    ) {
      newErrors.coursePrice = "Course price must contain only numbers";
    }
    if (categories.length > 0) {
      if (!category) {
        newErrors.category = "Category is required";
      }
      if (subcategories.length > 0 && !subcategory) {
        newErrors.subcategory = "Subcategory is required";
      }
    }
    if (semesters.length > 0) {
      if (selectedSemesters.length === 0) {
        newErrors.semester = "At least one semester is required";
      }
      if (selectedQuarters.length === 0) {
        newErrors.quarter = "At least one quarter is required";
      }
    }
    if (
      !courseDescription ||
      courseDescription.length < 5 ||
      courseDescription.length > 500
    ) {
      newErrors.courseDescription =
        "Course description must be between 5 and 500 characters";
    } else if (
      /^[.,\s]+$/.test(courseDescription) ||
      /\.{3,}/.test(courseDescription) ||
      /,{3,}/.test(courseDescription)
    ) {
      newErrors.courseDescription =
        "Course description contains invalid characters";
    }
    if (!selectedImageUri) {
      newErrors.thumbnail = "Course thumbnail is required";
    }
    if (!semesterBased) {
      newErrors.semesterBased = "Semester based is required";
    }
    const validTeachingPoints = teachingPoints.filter(
      (point) => point.trim() !== ""
    );
    if (validTeachingPoints.length === 0) {
      newErrors.teachingPoints = "At least one teaching point is required";
    } else {
      validTeachingPoints.forEach((point, index) => {
        if (point.length < 5) {
          newErrors.teachingPoints = `Teaching point ${index + 1
            } must be at least 5 characters long`;
          Toast.show(newErrors.teachingPoints, Toast.LONG);
        } else if (
          /^[.,\s]+$/.test(point) ||
          /\.{3,}/.test(point) ||
          /,{3,}/.test(point)
        ) {
          newErrors.teachingPoints = `Teaching point ${index + 1
            } contains invalid characters`;
          Toast.show(newErrors.teachingPoints, Toast.LONG);
        }
      });
    }
    const validRequirements = courseRequirements.filter(
      (req) => req.trim() !== ""
    );
    if (validRequirements.length === 0) {
      newErrors.requirements = "At least one requirement is required";
    } else {
      validRequirements.forEach((req, index) => {
        if (req.length < 5) {
          newErrors.requirements = `Requirement ${index + 1
            } must be at least 5 characters long`;
          Toast.show(newErrors.requirements, Toast.LONG);
        } else if (
          /^[.,\s]+$/.test(req) ||
          /\.{3,}/.test(req) ||
          /,{3,}/.test(req)
        ) {
          newErrors.requirements = `Requirement ${index + 1
            } contains invalid characters`;
          Toast.show(newErrors.requirements, Toast.LONG);
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        console.log("Error", "Failed to pick image");
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setSelectedImageUri(asset.uri || null);
        setSelectedImageFilename(asset.fileName || null);
      }
    });
  };

  const handleSyllabusUpload = async () => {
    try {
      const [result] = await pick({
        mode: "open",
        type: [types.pdf],
      });

      if (result.error) {
        Toast.show(result.error || "Error picking PDF file", Toast.LONG);
        return;
      }

      const file = result;
      setSelectedSyllabusFile(file);
      Toast.show("Syllabus PDF selected successfully", Toast.SHORT);
    } catch (err: any) {
      // Toast.show(err || 'Error picking PDF file', Toast.LONG);
    }
  };

  const addTeachingPointInput = () => {
    setTeachingPoints([...teachingPoints, ""]);
  };

  const handleTeachingPointChange = (index: number, text: string) => {
    const newTeachingPoints = [...teachingPoints];
    newTeachingPoints[index] = text;
    setTeachingPoints(newTeachingPoints);
  };

  const removeTeachingPoint = (index: number) => {
    const newTeachingPoints = teachingPoints.filter((_, i) => i !== index);
    setTeachingPoints(newTeachingPoints);
  };

  const addRequirementInput = () => {
    setCourseRequirements([...courseRequirements, ""]);
  };

  const handleRequirementChange = (index: number, text: string) => {
    const newRequirements = [...courseRequirements];
    newRequirements[index] = text;
    setCourseRequirements(newRequirements);
  };

  const removeRequirement = (index: number) => {
    const newRequirements = courseRequirements.filter((_, i) => i !== index);
    setCourseRequirements(newRequirements);
  };

  const resetForm = () => {
    setSelectedImageUri(null);
    setSelectedImageFilename(null);
    setSelectedSyllabusFile(null);
    setTeachingPoints([""]);
    setCourseRequirements([""]);
    setCourseTitle("");
    setCategory("");
    setSubcategory("");
    setLanguage("English");
    setCourseDescription("");
    setSelectedCategoryTitle("");
    setSelectedSubcategoryTitle("");
    setErrors({});
    setSelectedSemesters([]);
    setSelectedQuarters([]);
  };

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat._id);
    setSelectedCategoryTitle(cat.title);
    setShowCategoryModal(false);
    setSubcategory("");
    setSelectedSubcategoryTitle("");
    setSubcategories([]);
    fetchSubcategories(cat._id);
  };

  const handleSubcategorySelect = (subcat: Subcategory) => {
    setSubcategory(subcat._id);
    setSelectedSubcategoryTitle(subcat.title);
    setShowSubcategoryModal(false);
  };

  const handleSemesterToggle = (semester: Semester) => {
    setSelectedSemesters((prev) => {
      if (prev.includes(semester._id)) {
        const newSelected = prev.filter((id) => id !== semester._id);
        const quartersToRemove = quarters
          .filter((q) => q.semester === semester._id)
          .map((q) => q._id);
        setSelectedQuarters((prevQuarters) =>
          prevQuarters.filter((id) => !quartersToRemove.includes(id))
        );
        return newSelected;
      } else {
        return [...prev, semester._id];
      }
    });
  };

  const handleQuarterToggle = (quarter: Quarter) => {
    setSelectedQuarters((prev) => {
      if (prev.includes(quarter._id)) {
        return prev.filter((id) => id !== quarter._id);
      } else {
        return [...prev, quarter._id];
      }
    });
  };

  const GenerateAIButton: React.FC<AIButtonProps> = ({ onPress, label }) => {
    return (
      <TouchableOpacity
        style={styles.aiButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Sparkles color="#6366f1" size={20} style={styles.aiButtonIcon} />
        <Text style={styles.aiButtonText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const AISmallButton: React.FC<AIButtonProps> = ({ onPress, label }) => {
    return (
      <TouchableOpacity
        style={styles.aiSmallButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Sparkles color="#6366f1" size={14} style={styles.aiSmallButtonIcon} />
        <Text style={styles.aiSmallButtonText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  // ✅ Helper function for normalizing generated images
  const normalizeGeneratedImage = (data: any) => {
    if (!data) {
      return { uri: null as string | null, filename: null as string | null };
    }

    if (data.imageUrl) {
      return {
        uri: data.imageUrl,
        filename: `ai-generated-${Date.now()}.jpg`,
      };
    }

    if (data.imageBase64) {
      const mimeType = data.mimeType || "image/png";
      const extension = mimeType.split("/")[1] || "png";
      return {
        uri: `data:${mimeType};base64,${data.imageBase64}`,
        filename: `ai-generated-${Date.now()}.${extension}`,
      };
    }

    return { uri: null, filename: null };
  };

  // ✅ Handle Thumbnail Generation
  const handleGenerateThumbnail = async () => {
    if (!aiPrompt.trim()) {
      Toast.show("Please describe what you want to create", Toast.LONG);
      return;
    }

    try {
      setIsGeneratingImage(true);
      const api = await getApiInstance();

      const response = await api.post("aichat/generateImage", {
        prompt: aiPrompt,
      });

      const { uri, filename } = normalizeGeneratedImage(response.data);

      if (uri) {
        setSelectedImageUri(uri);
        if (filename) {
          setSelectedImageFilename(filename);
        }
        Toast.show("Thumbnail generated successfully!", Toast.SHORT);
        setShowAIModal(false);
        setAiPrompt("");
      } else {
        console.log("Unexpected generateImage response:", response.data);
        Toast.show("Failed to generate thumbnail", Toast.LONG);
      }
    } catch (error: any) {
      console.error("Error generating thumbnail:", error);
      console.log(error.response?.data?.message || "Failed to generate thumbnail")
      Toast.show(
        error.response?.data?.message || "Failed to generate thumbnail",
        Toast.LONG
      );
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // ✅ Handle Description Generation
  const handleGenerateDescription = async () => {
    if (!aiDescriptionPrompt.trim()) {
      Toast.show("Please describe what you want to create", Toast.LONG);
      return;
    }

    try {
      setIsGeneratingDescription(true);
      const api = await getApiInstance();

      const response = await api.post("aichat/generateContentForTeacher", {
        command: aiDescriptionPrompt,
        usedfor: "courseDescription",
        difficulty: "medium",
      });

      if (response.data && response.data.content) {
        setCourseDescription(response.data.content);
        Toast.show("Description generated successfully!", Toast.SHORT);
        setShowAIDescriptionModal(false);
        setAiDescriptionPrompt("");
      } else {
        Toast.show("Failed to generate description", Toast.LONG);
      }
    } catch (error: any) {
      console.error("Error generating description:", error);
      Toast.show(
        error.response?.data?.message || "Failed to generate description",
        Toast.LONG
      );
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // ✅ Handle Teaching Points Generation
  const handleGenerateTeachingPoints = async () => {
    if (!aiTeachingPointsPrompt.trim()) {
      Toast.show("Please describe what you want to create", Toast.LONG);
      return;
    }

    try {
      setIsGeneratingTeachingPoints(true);
      const api = await getApiInstance();

      const response = await api.post("aichat/generateContentForTeacher", {
        command: aiTeachingPointsPrompt,
        usedfor: "teachingPoints",
        difficulty: "medium",
      });

      if (response.data && response.data.content) {
        const points = response.data.content
          .split("\n")
          .filter((p: string) => p.trim())
          .map((p: string) => p.replace(/^\d+\.\s*/, "").trim());

        setTeachingPoints(points.length > 0 ? points : [""]);
        Toast.show("Teaching points generated successfully!", Toast.SHORT);
        setShowAITeachingPointsModal(false);
        setAiTeachingPointsPrompt("");
      } else {
        Toast.show("Failed to generate teaching points", Toast.LONG);
      }
    } catch (error: any) {
      console.error("Error generating teaching points:", error);
      Toast.show(
        error.response?.data?.message || "Failed to generate teaching points",
        Toast.LONG
      );
    } finally {
      setIsGeneratingTeachingPoints(false);
    }
  };

  // ✅ Handle Requirements Generation
  const handleGenerateRequirements = async () => {
    if (!aiRequirementsPrompt.trim()) {
      Toast.show("Please describe what you want to create", Toast.LONG);
      return;
    }

    try {
      setIsGeneratingRequirements(true);
      const api = await getApiInstance();

      const response = await api.post("aichat/generateContentForTeacher", {
        command: aiRequirementsPrompt,
        usedfor: "courseRequirements",
        difficulty: "medium",
      });

      if (response.data && response.data.content) {
        const requirements = response.data.content
          .split("\n")
          .filter((r: string) => r.trim())
          .map((r: string) => r.replace(/^\d+\.\s*/, "").trim());

        setCourseRequirements(requirements.length > 0 ? requirements : [""]);
        Toast.show("Requirements generated successfully!", Toast.SHORT);
        setShowAIRequirementsModal(false);
        setAiRequirementsPrompt("");
      } else {
        Toast.show("Failed to generate requirements", Toast.LONG);
      }
    } catch (error: any) {
      console.error("Error generating requirements:", error);
      Toast.show(
        error.response?.data?.message || "Failed to generate requirements",
        Toast.LONG
      );
    } finally {
      setIsGeneratingRequirements(false);
    }
  };

  // Handle Create Course
  const handleCreateCourse = async () => {
    if (!validateForm()) {
      console.log(errors);
      return;
    }

    try {
      setIsLoading(true);

      const filteredTeachingPoints = teachingPoints.filter(
        (point) => point.trim() !== ""
      );
      const filteredRequirements = courseRequirements.filter(
        (req) => req.trim() !== ""
      );

      const courseData = {
        courseTitle,
        category,
        subcategory: subcategory || category,
        language,
        courseDescription,
        thumbnail: {
          url: selectedImageUri!,
          filename: selectedImageFilename || "thumbnail.jpg",
        },
        teachingPoints: filteredTeachingPoints,
        requirements: filteredRequirements,
        published: false,
        semesterbased: semesterBased?.title === "Yes" ? true : false,
        semester: selectedSemesters,
        quarter: selectedQuarters,
        price: coursePrice,
      };

      console.log("Sending course data:", courseData);
      const response = await createCourse(courseData);
      console.log("Course creation response:", response);

      Toast.show("Course created successfully!", Toast.LONG);
      resetForm();
      navigation.navigate("MyCourses");
    } catch (error: any) {
      console.error("Course creation error:", error);
      let errorMessage = "Failed to create course";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Toast.show(errorMessage, Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const openAIModal = () => {
    setShowAIModal(true);
    setAiPrompt("");
  };

  const openAIDescriptionModal = () => {
    setShowAIDescriptionModal(true);
    setAiDescriptionPrompt("");
  };

  const openAITeachingPointsModal = () => {
    setShowAITeachingPointsModal(true);
    setAiTeachingPointsPrompt("");
  };

  const openAIRequirementsModal = () => {
    setShowAIRequirementsModal(true);
    setAiRequirementsPrompt("");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Create New Course</Text>

      {/* Thumbnail Section */}
      <Text style={styles.sectionTitle}>Thumbnail</Text>
      <View style={styles.thumbnailContainer}>
        {selectedImageUri ? (
          <View style={styles.thumbnailImageWrapper}>
            <Image
              source={{ uri: selectedImageUri }}
              style={styles.thumbnailImage}
            />
            <Pressable
              style={styles.thumbnailChangeButton}
              onPress={handleImageUpload}
            >
              <Text style={styles.thumbnailChangeButtonText}>Change</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.thumbnailUploadContainer}>
            <Pressable style={styles.uploadButton} onPress={handleImageUpload}>
              <Text>Upload Thumbnail</Text>
            </Pressable>
            <GenerateAIButton onPress={openAIModal} label="Generate with AI" />
          </View>
        )}
      </View>
      {errors.thumbnail && (
        <Text style={styles.errorText}>{errors.thumbnail}</Text>
      )}

      {/* Course Title */}
      <Text style={styles.sectionTitle}>Course Title</Text>
      <TextInput
        style={[styles.input, errors.courseTitle && styles.inputError]}
        placeholder="Course Title (5-100 characters)"
        placeholderTextColor="#999999"
        value={courseTitle}
        onChangeText={setCourseTitle}
        maxLength={100}
      />
      {errors.courseTitle && (
        <Text style={styles.errorText}>{errors.courseTitle}</Text>
      )}

      {/* Course Price */}
      {user?.email != "testaccount@yopmail.com" && (
        <>
          <Text style={styles.sectionTitle}>Course Price</Text>
          <TextInput
            style={[styles.input, errors.coursePrice && styles.inputError]}
            placeholder="Course Price (USD $)"
            placeholderTextColor="#999999"
            value={coursePrice}
            keyboardType="numeric"
            onChangeText={(text) => {
              let numericValue = text.replace(/[^0-9]/g, "");
              if (/^[1-9]/.test(numericValue) && numericValue.length > 4) {
                numericValue = "9999";
              }
              setCoursePrice(numericValue);
            }}
            maxLength={100}
          />
          {errors.coursePrice && (
            <Text style={styles.errorText}>{errors.coursePrice}</Text>
          )}
        </>
      )}

      {/* Category Selection */}
      {categories.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Topic</Text>
          <Pressable
            style={[styles.selectButton, errors.category && styles.inputError]}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text>{selectedCategoryTitle || "Select Topic"}</Text>
          </Pressable>
          {errors.category && (
            <Text style={styles.errorText}>{errors.category}</Text>
          )}

          <Modal
            visible={showCategoryModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowCategoryModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <ScrollView>
                  {isLoadingCategories ? (
                    <ActivityIndicator style={styles.loader} />
                  ) : (
                    categories.map((cat) => (
                      <Pressable
                        key={cat._id}
                        style={[
                          styles.modalItem,
                          category === cat._id && styles.modalItemSelected,
                        ]}
                        onPress={() => handleCategorySelect(cat)}
                      >
                        <Text style={styles.modalItemText}>{cat.title}</Text>
                      </Pressable>
                    ))
                  )}
                </ScrollView>
                <Pressable
                  style={styles.modalCancelButtonFull}
                  onPress={() => setShowCategoryModal(false)}
                >
                  <Text style={styles.modalCancelButtonFullText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {category && subcategories.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>SubTopic</Text>
              <Pressable
                style={[
                  styles.selectButton,
                  errors.subcategory && styles.inputError,
                ]}
                onPress={() => setShowSubcategoryModal(true)}
              >
                <Text>{selectedSubcategoryTitle || "Select Subtopic"}</Text>
              </Pressable>
              {errors.subcategory && (
                <Text style={styles.errorText}>{errors.subcategory}</Text>
              )}

              <Modal
                visible={showSubcategoryModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSubcategoryModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Subcategory</Text>
                    <ScrollView>
                      {subcategories.length > 0 ? (
                        subcategories.map((subcat) => (
                          <Pressable
                            key={subcat._id}
                            style={[
                              styles.modalItem,
                              subcategory === subcat._id &&
                              styles.modalItemSelected,
                            ]}
                            onPress={() => handleSubcategorySelect(subcat)}
                          >
                            <Text style={styles.modalItemText}>
                              {subcat.title}
                            </Text>
                          </Pressable>
                        ))
                      ) : (
                        <Text style={styles.noDataText}>
                          No subcategories available
                        </Text>
                      )}
                    </ScrollView>
                    <Pressable
                      style={styles.modalCancelButtonFull}
                      onPress={() => setShowSubcategoryModal(false)}
                    >
                      <Text style={styles.modalCancelButtonFullText}>
                        Cancel
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>
            </>
          )}
        </>
      )}

      <Text style={styles.sectionTitle}>Is this a semester-based course</Text>
      <Pressable
        style={[styles.selectButton, errors.semesterBased && styles.inputError]}
        onPress={() => setShowSemesterBasedModal(true)}
      >
        <Text>{semesterBased?.title || "Select"}</Text>
      </Pressable>
      {errors.semesterBased && (
        <Text style={styles.errorText}>{errors.semesterBased}</Text>
      )}

      <Modal
        visible={showSemesterBasedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSemesterBasedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select</Text>
            <ScrollView>
              {[
                { _id: 1, title: "Yes" },
                { _id: 2, title: "No" },
              ].map((sem) => (
                <Pressable
                  key={sem._id}
                  style={[
                    styles.modalItem,
                    semesterBased?._id === sem._id && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setSemesterBased(sem);
                    setShowSemesterBasedModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{sem.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={styles.modalCancelButtonFull}
              onPress={() => setShowSemesterBasedModal(false)}
            >
              <Text style={styles.modalCancelButtonFullText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Language */}
      <Text style={styles.sectionTitle}>Language</Text>
      <TextInput
        style={styles.input}
        placeholder="English"
        placeholderTextColor="#999999"
        value={language}
        onChangeText={setLanguage}
      />

      {/* Semester Selection */}
      {semesters.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Semesters</Text>
          <Pressable
            style={[styles.selectButton, errors.semester && styles.inputError]}
            onPress={() => setShowSemesterModal(true)}
          >
            {selectedSemesters.length === 0 ? (
              <Text style={styles.placeholderText}>Select Semesters</Text>
            ) : (
              <View style={styles.selectedItemsContainer}>
                {selectedSemesters.map((semesterId) => {
                  const semester = semesters.find((s) => s._id === semesterId);
                  return semester ? (
                    <View key={semesterId} style={styles.selectedItem}>
                      <Text style={styles.selectedItemText}>
                        {semester.title}
                      </Text>
                    </View>
                  ) : null;
                })}
              </View>
            )}
          </Pressable>
          {errors.semester && (
            <Text style={styles.errorText}>{errors.semester}</Text>
          )}

          <Modal
            visible={showSemesterModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowSemesterModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Semesters</Text>
                <ScrollView>
                  {isLoadingSemesters ? (
                    <ActivityIndicator style={styles.loader} />
                  ) : (
                    semesters.map((semester) => (
                      <Pressable
                        key={semester._id}
                        style={[
                          styles.modalItem,
                          selectedSemesters.includes(semester._id) &&
                          styles.modalItemSelected,
                        ]}
                        onPress={() => handleSemesterToggle(semester)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            selectedSemesters.includes(semester._id) &&
                            styles.checkboxChecked,
                          ]}
                        >
                          {selectedSemesters.includes(semester._id) && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </View>
                        <Text style={styles.modalItemText}>
                          {semester.title}
                        </Text>
                      </Pressable>
                    ))
                  )}
                </ScrollView>
                <Pressable
                  style={styles.modalDoneButton}
                  onPress={() => setShowSemesterModal(false)}
                >
                  <Text style={styles.modalDoneButtonText}>Done</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {selectedSemesters.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Quarters</Text>
              <Pressable
                style={[
                  styles.selectButton,
                  errors.quarter && styles.inputError,
                ]}
                onPress={() => setShowQuarterModal(true)}
              >
                {selectedQuarters.length === 0 ? (
                  <Text style={styles.placeholderText}>Select Quarters</Text>
                ) : (
                  <View style={styles.selectedItemsContainer}>
                    {selectedQuarters.map((quarterId) => {
                      const quarter = quarters.find((q) => q._id === quarterId);
                      return quarter ? (
                        <View
                          key={quarterId}
                          style={[
                            styles.selectedItem,
                            styles.quarterSelectedItem,
                          ]}
                        >
                          <Text style={styles.selectedItemText}>
                            {quarter.title}
                          </Text>
                        </View>
                      ) : null;
                    })}
                  </View>
                )}
              </Pressable>
              {errors.quarter && (
                <Text style={styles.errorText}>{errors.quarter}</Text>
              )}

              <Modal
                visible={showQuarterModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowQuarterModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Quarters</Text>
                    <ScrollView>
                      {isLoadingQuarters ? (
                        <ActivityIndicator style={styles.loader} />
                      ) : quarters.length > 0 ? (
                        quarters.map((quarter) => (
                          <Pressable
                            key={quarter._id}
                            style={[
                              styles.modalItem,
                              selectedQuarters.includes(quarter._id) &&
                              styles.modalItemSelected,
                            ]}
                            onPress={() => handleQuarterToggle(quarter)}
                          >
                            <View
                              style={[
                                styles.checkbox,
                                selectedQuarters.includes(quarter._id) &&
                                styles.checkboxCheckedQuarter,
                              ]}
                            >
                              {selectedQuarters.includes(quarter._id) && (
                                <Text style={styles.checkmark}>✓</Text>
                              )}
                            </View>
                            <Text style={styles.modalItemText}>
                              {quarter.title}
                            </Text>
                          </Pressable>
                        ))
                      ) : (
                        <Text style={styles.noDataText}>
                          No quarters available
                        </Text>
                      )}
                    </ScrollView>
                    <Pressable
                      style={styles.modalDoneButtonQuarter}
                      onPress={() => setShowQuarterModal(false)}
                    >
                      <Text style={styles.modalDoneButtonText}>Done</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>
            </>
          )}
        </>
      )}

      {/* Course Description with AI Button */}
      <View style={styles.headerWithButton}>
        <Text style={styles.sectionTitle}>Course Description</Text>
        <AISmallButton onPress={openAIDescriptionModal} label="AI Generate" />
      </View>
      <TextInput
        style={[styles.textArea, errors.courseDescription && styles.inputError]}
        multiline
        placeholder="Course Description (5-500 characters)"
        placeholderTextColor="#999999"
        value={courseDescription}
        onChangeText={setCourseDescription}
        maxLength={500}
      />
      {errors.courseDescription && (
        <Text style={styles.errorText}>{errors.courseDescription}</Text>
      )}

      {/* Teaching Points with AI Button */}
      <View style={styles.headerWithButton}>
        <Text style={styles.sectionTitle}>
          What you will teach in this course (max 12)
        </Text>
        <AISmallButton
          onPress={openAITeachingPointsModal}
          label="AI Generate"
        />
      </View>
      {teachingPoints.map((point: string, index: number) => (
        <View key={index} style={styles.listItemContainer}>
          <Text style={styles.listItemNumber}>
            {String(index + 1).padStart(2, "0")}
          </Text>
          <TextInput
            style={styles.listItemInput}
            placeholder="Teaching point (5-120 characters)"
            placeholderTextColor="#999999"
            value={point}
            onChangeText={(text) => handleTeachingPointChange(index, text)}
            maxLength={120}
          />
          {teachingPoints.length > 1 && (
            <Pressable onPress={() => removeTeachingPoint(index)}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </Pressable>
          )}
        </View>
      ))}
      {errors.teachingPoints && (
        <Text style={styles.errorText}>{errors.teachingPoints}</Text>
      )}
      {teachingPoints.length < 12 && (
        <Pressable style={styles.addButton} onPress={addTeachingPointInput}>
          <Text style={styles.addButtonText}>+ Add Teaching Point</Text>
        </Pressable>
      )}

      {/* Course Requirements with AI Button */}
      <View style={styles.headerWithButton}>
        <Text style={styles.sectionTitle}>Course Requirements (max 12)</Text>
        <AISmallButton onPress={openAIRequirementsModal} label="AI Generate" />
      </View>
      {courseRequirements.map((requirement: string, index: number) => (
        <View key={index} style={styles.listItemContainer}>
          <Text style={styles.listItemNumber}>
            {String(index + 1).padStart(2, "0")}
          </Text>
          <TextInput
            style={styles.listItemInput}
            placeholder="Requirement (5-120 characters)"
            placeholderTextColor="#999999"
            value={requirement}
            onChangeText={(text) => handleRequirementChange(index, text)}
            maxLength={120}
          />
          {courseRequirements.length > 1 && (
            <Pressable onPress={() => removeRequirement(index)}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </Pressable>
          )}
        </View>
      ))}
      {errors.requirements && (
        <Text style={styles.errorText}>{errors.requirements}</Text>
      )}
      {courseRequirements.length < 12 && (
        <Pressable style={styles.addButton} onPress={addRequirementInput}>
          <Text style={styles.addButtonText}>+ Add Requirement</Text>
        </Pressable>
      )}

      {/* Create Button */}
      <TouchableOpacity
        style={[styles.createButton, isLoading && styles.createButtonDisabled]}
        onPress={handleCreateCourse}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.createButtonText}>Create Course</Text>
        )}
      </TouchableOpacity>

      {/* AI Thumbnail Modal */}
      {showAIModal && (
        <AIModal
          visible={showAIModal}
          onClose={() => setShowAIModal(false)}
          onGenerate={handleGenerateThumbnail}
          prompt={aiPrompt}
          setPrompt={setAiPrompt}
          isGenerating={isGeneratingImage}
          placeholder="Describe what you want to create..."
        />
      )}

      {/* AI Description Modal */}
      {showAIDescriptionModal && (
        <AIModal
          visible={showAIDescriptionModal}
          onClose={() => setShowAIDescriptionModal(false)}
          onGenerate={handleGenerateDescription}
          prompt={aiDescriptionPrompt}
          setPrompt={setAiDescriptionPrompt}
          isGenerating={isGeneratingDescription}
          placeholder="Describe what you want to create..."
        />
      )}

      {/* AI Teaching Points Modal */}
      {showAITeachingPointsModal && (
        <AIModal
          visible={showAITeachingPointsModal}
          onClose={() => setShowAITeachingPointsModal(false)}
          onGenerate={handleGenerateTeachingPoints}
          prompt={aiTeachingPointsPrompt}
          setPrompt={setAiTeachingPointsPrompt}
          isGenerating={isGeneratingTeachingPoints}
          placeholder="Describe what you want to create..."
        />
      )}

      {/* AI Requirements Modal */}
      {showAIRequirementsModal && (
        <AIModal
          visible={showAIRequirementsModal}
          onClose={() => setShowAIRequirementsModal(false)}
          onGenerate={handleGenerateRequirements}
          prompt={aiRequirementsPrompt}
          setPrompt={setAiRequirementsPrompt}
          isGenerating={isGeneratingRequirements}
          placeholder="Describe what you want to create..."
        />
      )}
    </ScrollView>
  );
};

export default CreateCoursePage;
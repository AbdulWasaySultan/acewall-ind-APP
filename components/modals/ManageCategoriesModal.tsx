import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import SimpleIcon from "../SimpleIcon";
import {
  getAssessmentCategories,
  createAssessmentCategory,
  updateAssessmentCategory,
  deleteAssessmentCategory,
} from "../../services/course";
import Toast from "react-native-simple-toast";

interface ManageCategoriesModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
}

interface Category {
  id: string;
  title: string;
  weight: string;
}

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  visible,
  onClose,
  courseId,
}) => {
  const [assessmentCategories, setAssessmentCategories] = useState<Category[]>(
    []
  );
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newAssessmentCategoryName, setNewAssessmentCategoryName] =
    useState("");
  const [newAssessmentCategoryWeight, setNewAssessmentCategoryWeight] =
    useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      fetchAssessmentCategories();
    }
  }, [visible]);

  // Triggers every time assessmentCategories updates in state
  // useEffect(() => {
  //   if (assessmentCategories.length > 0) {
  //     const str = assessmentCategories.map(cat => cat.title).join(', ');
  //     console.log("Current Categories State:", str);
  //   }
  //   console.log(error);
  // }, [assessmentCategories]);

  const fetchAssessmentCategories = async () => {
    try {
      setLoadingCategories(true);
      setError(null);
      const response = await getAssessmentCategories(courseId);
      setAssessmentCategories(
        response.categories.map((category: any) => ({
          id: category._id,
          title: category.name,
          weight: category.weight.toString(),
        }))
      );
    } catch (error: any) {
      // console.error('Fetch categories error:', error);
      const msg = error.message || "Failed to fetch assessment categories";
      setError(msg);
      // Toast.show(msg, Toast.LONG);
    } finally {
      setLoadingCategories(false);
    }
  };
  const handleWeightChange = (text: string, categoryId: string) => {
    const updatedCategories = assessmentCategories.map((cat) => {
      if (cat.id === categoryId) {
        return { ...cat, weight: text };
      }
      return cat;
    });
    setAssessmentCategories(updatedCategories);
  };

  const handleUpdateCategory = async (category: Category) => {
    try {
      const weight = parseFloat(category.weight);
      if (isNaN(weight) || weight <= 0) {
        Toast.show("Weight must be a number greater than 0.", Toast.LONG);
        return;
      }
      await updateAssessmentCategory(courseId, category.id, weight);
      Toast.show("Category updated successfully.", Toast.LONG);
      fetchAssessmentCategories();
    } catch (error: any) {
      Toast.show(error.message || "Failed to update category.", Toast.LONG);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAssessmentCategory(category.id);
              Toast.show("Category deleted successfully.", Toast.LONG);
              setAssessmentCategories((prev) =>
                prev.filter((cat) => cat.id !== category.id)
              );
            } catch (error: any) {
              Toast.show(
                error.message || "Failed to delete category.",
                Toast.LONG
              );
            }
          },
        },
      ]
    );
  };

  const handleAddNewCategory = async () => {
    if (!newAssessmentCategoryName.trim()) {
      Toast.show("Category name is required.", Toast.LONG);
      return;
    }
    const weight = parseFloat(newAssessmentCategoryWeight);
    if (isNaN(weight) || weight <= 0) {
      Toast.show("Weight must be a positive number.", Toast.LONG);
      return;
    }
    try {
      {
        if (weight < 100) {
          setCreatingCategory(true);
          await createAssessmentCategory(
            courseId,
            newAssessmentCategoryName.trim(),
            weight
          );
          Toast.show("Category added successfully.", Toast.LONG);
          setNewAssessmentCategoryName("");
          setNewAssessmentCategoryWeight("");
          fetchAssessmentCategories();
        } else {
          Toast.show("The weightage should be less than 100%", Toast.LONG);
        }
      }
    } catch (error: any) {
      if (error.response.type === 404) {
        Toast.show("The weightage shouldnot exceed more than 100%", Toast.LONG);
      }
      Toast.show(error.message || "Failed to add category.", Toast.LONG);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleClose = () => {
    setNewAssessmentCategoryName("");
    setNewAssessmentCategoryWeight("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.manageCategoriesModalContent}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.manageCategoriesModalTitle}>
              Assessment Categories
            </Text>
            <TouchableOpacity onPress={handleClose} hitSlop={10}>
              <SimpleIcon name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <Text style={styles.manageCategoriesModalSubtitle}>
              Manage your course assessment categories and their weights.
            </Text>

            <View style={styles.categoriesListContainer}>
              <View style={styles.categoryItemHeader}>
                <Text style={[styles.categoryItemHeaderText, { flex: 2 }]}>
                  Category Name
                </Text>
                <Text style={[styles.categoryItemHeaderText, { flex: 1 }]}>
                  Weight (%)
                </Text>
                <Text
                  style={[
                    styles.categoryItemHeaderText,
                    { flex: 1, textAlign: "center" },
                  ]}
                >
                  Action
                </Text>
              </View>

              {loadingCategories ? (
                <ActivityIndicator
                  size="large"
                  color="#10B144"
                  style={{ marginVertical: 20 }}
                />
              ) : assessmentCategories.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No categories found for this course
                  </Text>
                </View>
              ) : (
                assessmentCategories.map((cat) => (
                  <View key={cat.id} style={styles.categoryItem}>
                    <Text style={[styles.categoryName, { flex: 2 }]}>
                      {cat.title}
                    </Text>
                    <TextInput
                      style={[styles.categoryWeightInput, { flex: 1 }]}
                      value={String(cat.weight)}
                      onChangeText={(text) => handleWeightChange(text, cat.id)}
                      keyboardType="numeric"
                    />
                    <View style={[styles.categoryActions, { flex: 1 }]}>
                      <TouchableOpacity
                        onPress={() => handleUpdateCategory(cat)}
                      >
                        <SimpleIcon name="save" size={24} color="#10B144" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteCategory(cat)}
                      >
                        <SimpleIcon name="trash" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.addNewCategoryContainer}>
              <Text style={styles.addNewCategoryTitle}>Add New Category</Text>

              <Text style={styles.inputLabel}>Category Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter category name"
                value={newAssessmentCategoryName}
                onChangeText={setNewAssessmentCategoryName}
              />

              <Text style={styles.inputLabel}>Weight (%)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter weight"
                value={newAssessmentCategoryWeight}
                onChangeText={setNewAssessmentCategoryWeight}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddNewCategory}
                disabled={creatingCategory}
              >
                <Text style={styles.addButtonText}>
                  {creatingCategory ? "Adding..." : "+ Add"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.totalWeightContainer}>
              <Text style={styles.totalWeightText}>Total Weight:</Text>
              <Text style={styles.totalWeightValue}>
                {assessmentCategories.reduce(
                  (sum, cat) => sum + (parseFloat(cat.weight) || 0),
                  0
                )}
                %
              </Text>
            </View>

            <TouchableOpacity
              style={{
                ...styles.addButton,
                backgroundColor: "#6c757d",
                marginTop: 10,
              }}
              onPress={handleClose}
            >
              <Text style={styles.addButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  manageCategoriesModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 600,
    maxHeight: "80%",
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  manageCategoriesModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },
  manageCategoriesModalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  categoriesListContainer: {
    marginBottom: 20,
  },
  categoryItemHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  categoryItemHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  categoryName: {
    fontSize: 14,
    color: "#1a1a2e",
  },
  categoryWeightInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: "#1a1a2e",
    marginHorizontal: 8,
  },
  categoryActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  addNewCategoryContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addNewCategoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1a1a2e",
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#10B144",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  totalWeightContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginBottom: 16,
  },
  totalWeightText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  totalWeightValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B144",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default ManageCategoriesModal;

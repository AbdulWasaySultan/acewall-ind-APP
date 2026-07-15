// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   ActivityIndicator,
//   Platform,
//   KeyboardAvoidingView,
// } from "react-native";
// import SimpleIcon from "../SimpleIcon";

// interface EditCourseModalProps {
//   visible: boolean;
//   onClose: () => void;
//   editCourseTitle: string;
//   onEditCourseTitleChange: (text: string) => void;
//   editCoursePrice: string;
//   onEditCoursePriceChange: (text: string) => void;
//   editCourseCategory: string;
//   editCourseSubcategory: string;
//   onEditCourseSubcategoryChange: (id: string) => void;
//   editCourseLanguage: string;
//   onEditCourseLanguageChange: (language: string) => void;
//   editCourseDescription: string;
//   onEditCourseDescriptionChange: (text: string) => void;
//   editTeachingPoints: string[];
//   onEditTeachingPointsChange: (points: string[]) => void;
//   editRequirements: string[];
//   onEditRequirementsChange: (requirements: string[]) => void;
//   subcategories: any[];
//   subcategoriesLoading: boolean;
//   showSubcategoryDropdown: boolean;
//   onShowSubcategoryDropdownChange: (show: boolean) => void;
//   showLanguageDropdown: boolean;
//   onShowLanguageDropdownChange: (show: boolean) => void;
//   editCourseLoading: boolean;
//   editCourseError: string | null;
//   onSave: () => void;
//   styles: any;
// }

// const EditCourseModal: React.FC<EditCourseModalProps> = ({
//   visible,
//   onClose,
//   editCourseTitle,
//   onEditCourseTitleChange,
//   editCoursePrice,
//   onEditCoursePriceChange,
//   editCourseCategory,
//   editCourseSubcategory,
//   onEditCourseSubcategoryChange,
//   editCourseLanguage,
//   onEditCourseLanguageChange,
//   editCourseDescription,
//   onEditCourseDescriptionChange,
//   editTeachingPoints,
//   onEditTeachingPointsChange,
//   editRequirements,
//   onEditRequirementsChange,
//   subcategories,
//   subcategoriesLoading,
//   showSubcategoryDropdown,
//   onShowSubcategoryDropdownChange,
//   showLanguageDropdown,
//   onShowLanguageDropdownChange,
//   editCourseLoading,
//   editCourseError,
//   onSave,
//   styles,
// }) => {
//   return (
//     <Modal
//       visible={visible}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={onClose}
//     >
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContent, { width: "95%", maxWidth: 420 }]}>
//             <View style={styles.editCourseModalHeader}>
//               <Text style={styles.editCourseModalTitle}>
//                 Edit Course Info
//               </Text>
//               <TouchableOpacity onPress={onClose} style={styles.editCourseModalCloseButton}>
//                 <SimpleIcon name="close" size={24} color="#666" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView nestedScrollEnabled={true}>
//               <Text style={styles.editCourseModalLabel}>
//                 Course Title
//               </Text>
//               <TextInput
//                 style={styles.textInput}
//                 value={editCourseTitle}
//                 onChangeText={onEditCourseTitleChange}
//                 placeholder="Course Title"
//               />
//               <Text style={styles.editCourseModalLabel}>
//                 Course Price
//               </Text>
//               <TextInput
//                 style={styles.textInput}
//                 value={editCoursePrice}
//                 onChangeText={(text) => {
//                   // Only allow digits
//                   let numericValue = text.replace(/[^0-9]/g, "");

//                   // If it starts with 1–9 and length exceeds 4 → limit to 4 digits
//                   if (/^[1-9]/.test(numericValue) && numericValue.length > 4) {
//                     numericValue = "9999";
//                   }

//                   onEditCoursePriceChange(numericValue);
//                 }}
//                 placeholder="Course Price"
//               />
//               <Text style={styles.editCourseModalLabel}>
//                 Sub Category
//               </Text>
//               {subcategoriesLoading ? (
//                 <View
//                   style={[
//                     styles.textInput,
//                     { justifyContent: "center", alignItems: "center" },
//                   ]}
//                 >
//                   <ActivityIndicator size="small" color="#10B144" />
//                 </View>
//               ) : (
//                 <TouchableOpacity
//                   style={[styles.textInput, styles.editCourseModalDropdownButton]}
//                   onPress={() => {
//                     onShowSubcategoryDropdownChange(!showSubcategoryDropdown);
//                   }}
//                 >
//                   <Text
//                     style={
//                       editCourseSubcategory
//                         ? styles.editCourseModalDropdownText
//                         : styles.editCourseModalDropdownPlaceholder
//                     }
//                   >
//                     {editCourseSubcategory
//                       ? subcategories.find(
//                           (s) => s._id === editCourseSubcategory
//                         )?.title || "Select sub category"
//                       : "Select sub category"}
//                   </Text>
//                   <SimpleIcon name="chevron-down" size={16} color="#666" />
//                 </TouchableOpacity>
//               )}

//               {showSubcategoryDropdown && (
//                 <View style={styles.editCourseModalDropdownOverlay}>
//                   <ScrollView
//                     style={{ maxHeight: 200 }}
//                     nestedScrollEnabled={true}
//                   >
//                     {subcategories.map((subcategory) => (
//                       <TouchableOpacity
//                         key={subcategory._id}
//                         style={[
//                           styles.editCourseModalDropdownItem,
//                           editCourseSubcategory === subcategory._id &&
//                             styles.editCourseModalDropdownItemActive,
//                         ]}
//                         onPress={() => {
//                           onEditCourseSubcategoryChange(subcategory._id);
//                           onShowSubcategoryDropdownChange(false);
//                         }}
//                       >
//                         <Text
//                           style={[
//                             styles.editCourseModalDropdownItemText,
//                             editCourseSubcategory === subcategory._id
//                               ? styles.editCourseModalDropdownItemTextActive
//                               : styles.editCourseModalDropdownItemTextInactive,
//                           ]}
//                         >
//                           {subcategory.title}
//                         </Text>
//                       </TouchableOpacity>
//                     ))}
//                     {subcategories.length === 0 && (
//                       <Text style={styles.editCourseModalNoSubcategoriesText}>
//                         No subcategories found
//                       </Text>
//                     )}
//                   </ScrollView>
//                 </View>
//               )}
//               <Text style={styles.editCourseModalLabel}>
//                 Language
//               </Text>
//               <TouchableOpacity
//                 style={[styles.textInput, styles.editCourseModalDropdownButton]}
//                 onPress={() => {
//                   onShowLanguageDropdownChange(!showLanguageDropdown);
//                 }}
//               >
//                 <Text
//                   style={
//                     editCourseLanguage
//                       ? styles.editCourseModalDropdownText
//                       : styles.editCourseModalDropdownPlaceholder
//                   }
//                 >
//                   {editCourseLanguage || "Select language"}
//                 </Text>
//                 <SimpleIcon name="chevron-down" size={16} color="#666" />
//               </TouchableOpacity>

//               {showLanguageDropdown && (
//                 <View style={styles.editCourseModalLanguageDropdownOverlay}>
//                   <ScrollView style={{ maxHeight: 200 }}>
//                     {[
//                       "English",
//                       "Spanish",
//                       "French",
//                       "German",
//                       "Italian",
//                       "Portuguese",
//                       "Chinese",
//                       "Japanese",
//                       "Korean",
//                       "Arabic",
//                     ].map((language) => (
//                       <TouchableOpacity
//                         key={language}
//                         style={[
//                           styles.editCourseModalDropdownItem,
//                           editCourseLanguage === language &&
//                             styles.editCourseModalDropdownItemActive,
//                         ]}
//                         onPress={() => {
//                           onEditCourseLanguageChange(language);
//                           onShowLanguageDropdownChange(false);
//                         }}
//                       >
//                         <Text
//                           style={[
//                             styles.editCourseModalDropdownItemText,
//                             editCourseLanguage === language
//                               ? styles.editCourseModalDropdownItemTextActive
//                               : styles.editCourseModalDropdownItemTextInactive,
//                           ]}
//                         >
//                           {language}
//                         </Text>
//                       </TouchableOpacity>
//                     ))}
//                   </ScrollView>
//                 </View>
//               )}
//               <Text style={styles.editCourseModalLabel}>
//                 Course Description
//               </Text>
//               <TextInput
//                 style={[styles.textInput, { minHeight: 80 }]}
//                 value={editCourseDescription}
//                 onChangeText={onEditCourseDescriptionChange}
//                 placeholder="Course Description"
//                 multiline
//               />
//               {/* What you will teach in this course */}
//               <Text style={styles.editCourseModalSectionTitle}>
//                 What you will teach in this course (max 12)
//               </Text>
//               {editTeachingPoints.map((point, index) => (
//                 <View key={index} style={{ marginBottom: 12 }}>
//                   <Text style={styles.editCourseModalEntryLabel}>
//                     Entry {String(index + 1).padStart(2, "0")}
//                   </Text>
//                   <View style={styles.editCourseModalEntryRow}>
//                     <View style={{ flex: 1, marginRight: 8 }}>
//                       <TextInput
//                         style={[styles.textInput, { minHeight: 40 }]}
//                         value={point}
//                         onChangeText={(text) => {
//                           const newPoints = [...editTeachingPoints];
//                           newPoints[index] = text;
//                           onEditTeachingPointsChange(newPoints);
//                         }}
//                         placeholder="What you will teach in this course..."
//                         multiline
//                       />
//                       <Text style={styles.editCourseModalCharacterCount}>
//                         {120 - point.length} characters remaining
//                       </Text>
//                     </View>
//                     {editTeachingPoints.length > 1 && (
//                       <TouchableOpacity
//                         style={styles.editCourseModalRemoveButton}
//                         onPress={() => {
//                           const newPoints = editTeachingPoints.filter(
//                             (_, i) => i !== index
//                           );
//                           onEditTeachingPointsChange(newPoints);
//                         }}
//                       >
//                         <Text style={styles.editCourseModalRemoveButtonText}>
//                           Remove
//                         </Text>
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 </View>
//               ))}
//               {editTeachingPoints.length < 12 && (
//                 <TouchableOpacity
//                   style={styles.editCourseModalAddButton}
//                   onPress={() => {
//                     if (editTeachingPoints.length < 12) {
//                       onEditTeachingPointsChange([...editTeachingPoints, ""]);
//                     }
//                   }}
//                 >
//                   <Text style={styles.editCourseModalAddButtonText}>
//                     + Add Teaching Point
//                   </Text>
//                 </TouchableOpacity>
//               )}

//               {/* Course Requirements */}
//               <Text style={styles.editCourseModalSectionTitle}>
//                 Course Requirements (max 12)
//               </Text>
//               {editRequirements.map((requirement, index) => (
//                 <View key={index} style={{ marginBottom: 12 }}>
//                   <Text style={styles.editCourseModalEntryLabel}>
//                     Entry {String(index + 1).padStart(2, "0")}
//                   </Text>
//                   <View style={styles.editCourseModalEntryRow}>
//                     <View style={{ flex: 1, marginRight: 8 }}>
//                       <TextInput
//                         style={[styles.textInput, { minHeight: 40 }]}
//                         value={requirement}
//                         onChangeText={(text) => {
//                           const newRequirements = [...editRequirements];
//                           newRequirements[index] = text;
//                           onEditRequirementsChange(newRequirements);
//                         }}
//                         placeholder="Course requirement..."
//                         multiline
//                       />
//                       <Text style={styles.editCourseModalCharacterCount}>
//                         {120 - requirement.length} characters remaining
//                       </Text>
//                     </View>
//                     {editRequirements.length > 1 && (
//                       <TouchableOpacity
//                         style={styles.editCourseModalRemoveButton}
//                         onPress={() => {
//                           const newRequirements = editRequirements.filter(
//                             (_, i) => i !== index
//                           );
//                           onEditRequirementsChange(newRequirements);
//                         }}
//                       >
//                         <Text style={styles.editCourseModalRemoveButtonText}>
//                           Remove
//                         </Text>
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 </View>
//               ))}
//               {editRequirements.length < 12 && (
//                 <TouchableOpacity
//                   style={styles.editCourseModalAddButton}
//                   onPress={() => {
//                     if (editRequirements.length < 12) {
//                       onEditRequirementsChange([...editRequirements, ""]);
//                     }
//                   }}
//                 >
//                   <Text style={styles.editCourseModalAddButtonText}>
//                     + Add Requirement
//                   </Text>
//                 </TouchableOpacity>
//               )}
//               {editCourseError && (
//                 <Text style={styles.editCourseModalErrorText}>
//                   {editCourseError}
//                 </Text>
//               )}
//               <TouchableOpacity
//                 style={[
//                   styles.saveChangesButton,
//                   editCourseLoading && styles.disabledButton,
//                 ]}
//                 onPress={onSave}
//                 disabled={editCourseLoading}
//               >
//                 {editCourseLoading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.saveChangesButtonText}>
//                     Update Course Info
//                   </Text>
//                 )}
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.cancelProfileButton}
//                 onPress={onClose}
//               >
//                 <Text style={styles.cancelProfileButtonText}>Cancel</Text>
//               </TouchableOpacity>
//             </ScrollView>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// };

// export default EditCourseModal;


// components/modals/EditCourseModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import SimpleIcon from "../SimpleIcon";

interface EditCourseModalProps {
  visible: boolean;
  onClose: () => void;
  editCourseTitle: string;
  onEditCourseTitleChange: (text: string) => void;
  editCoursePrice: string;
  onEditCoursePriceChange: (text: string) => void;
  editCourseCategory: string;
  editCourseSubcategory: string;
  onEditCourseSubcategoryChange: (id: string) => void;
  editCourseLanguage: string;
  onEditCourseLanguageChange: (language: string) => void;
  editCourseDescription: string;
  onEditCourseDescriptionChange: (text: string) => void;
  editTeachingPoints: string[];
  onEditTeachingPointsChange: (points: string[]) => void;
  editRequirements: string[];
  onEditRequirementsChange: (requirements: string[]) => void;
  subcategories: any[];
  subcategoriesLoading: boolean;
  showSubcategoryDropdown: boolean;
  onShowSubcategoryDropdownChange: (show: boolean) => void;
  showLanguageDropdown: boolean;
  onShowLanguageDropdownChange: (show: boolean) => void;
  editCourseLoading: boolean;
  editCourseError: string | null;
  onSave: () => void;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({
  visible,
  onClose,
  editCourseTitle,
  onEditCourseTitleChange,
  editCoursePrice,
  onEditCoursePriceChange,
  editCourseCategory,
  editCourseSubcategory,
  onEditCourseSubcategoryChange,
  editCourseLanguage,
  onEditCourseLanguageChange,
  editCourseDescription,
  onEditCourseDescriptionChange,
  editTeachingPoints,
  onEditTeachingPointsChange,
  editRequirements,
  onEditRequirementsChange,
  subcategories,
  subcategoriesLoading,
  showSubcategoryDropdown,
  onShowSubcategoryDropdownChange,
  showLanguageDropdown,
  onShowLanguageDropdownChange,
  editCourseLoading,
  editCourseError,
  onSave,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: "95%", maxWidth: 420 }]}>
            <View style={styles.editCourseModalHeader}>
              <Text style={styles.editCourseModalTitle}>Edit Course Info</Text>
              <TouchableOpacity onPress={onClose} style={styles.editCourseModalCloseButton}>
                <SimpleIcon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView nestedScrollEnabled={true}>
              <Text style={styles.editCourseModalLabel}>Course Title</Text>
              <TextInput
                style={styles.textInput}
                value={editCourseTitle}
                onChangeText={onEditCourseTitleChange}
                placeholder="Course Title"
              />
              <Text style={styles.editCourseModalLabel}>Course Price</Text>
              <TextInput
                style={styles.textInput}
                value={editCoursePrice}
                onChangeText={(text) => {
                  let numericValue = text.replace(/[^0-9]/g, "");
                  if (/^[1-9]/.test(numericValue) && numericValue.length > 4) {
                    numericValue = "9999";
                  }
                  onEditCoursePriceChange(numericValue);
                }}
                placeholder="Course Price"
              />
              <Text style={styles.editCourseModalLabel}>Sub Category</Text>
              {subcategoriesLoading ? (
                <View style={[styles.textInput, { justifyContent: "center", alignItems: "center" }]}>
                  <ActivityIndicator size="small" color="#10B144" />
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.textInput, styles.editCourseModalDropdownButton]}
                  onPress={() => onShowSubcategoryDropdownChange(!showSubcategoryDropdown)}
                >
                  <Text style={editCourseSubcategory ? styles.editCourseModalDropdownText : styles.editCourseModalDropdownPlaceholder}>
                    {editCourseSubcategory
                      ? subcategories.find((s) => s._id === editCourseSubcategory)?.title || "Select sub category"
                      : "Select sub category"}
                  </Text>
                  <SimpleIcon name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              )}

              {showSubcategoryDropdown && (
                <View style={styles.editCourseModalDropdownOverlay}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
                    {subcategories.map((subcategory) => (
                      <TouchableOpacity
                        key={subcategory._id}
                        style={[
                          styles.editCourseModalDropdownItem,
                          editCourseSubcategory === subcategory._id && styles.editCourseModalDropdownItemActive,
                        ]}
                        onPress={() => {
                          onEditCourseSubcategoryChange(subcategory._id);
                          onShowSubcategoryDropdownChange(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.editCourseModalDropdownItemText,
                            editCourseSubcategory === subcategory._id
                              ? styles.editCourseModalDropdownItemTextActive
                              : styles.editCourseModalDropdownItemTextInactive,
                          ]}
                        >
                          {subcategory.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {subcategories.length === 0 && (
                      <Text style={styles.editCourseModalNoSubcategoriesText}>No subcategories found</Text>
                    )}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.editCourseModalLabel}>Language</Text>
              <TouchableOpacity
                style={[styles.textInput, styles.editCourseModalDropdownButton]}
                onPress={() => onShowLanguageDropdownChange(!showLanguageDropdown)}
              >
                <Text style={editCourseLanguage ? styles.editCourseModalDropdownText : styles.editCourseModalDropdownPlaceholder}>
                  {editCourseLanguage || "Select language"}
                </Text>
                <SimpleIcon name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>

              {showLanguageDropdown && (
                <View style={styles.editCourseModalLanguageDropdownOverlay}>
                  <ScrollView style={{ maxHeight: 200 }}>
                    {[
                      "English",
                      "Spanish",
                      "French",
                      "German",
                      "Italian",
                      "Portuguese",
                      "Chinese",
                      "Japanese",
                      "Korean",
                      "Arabic",
                    ].map((language) => (
                      <TouchableOpacity
                        key={language}
                        style={[
                          styles.editCourseModalDropdownItem,
                          editCourseLanguage === language && styles.editCourseModalDropdownItemActive,
                        ]}
                        onPress={() => {
                          onEditCourseLanguageChange(language);
                          onShowLanguageDropdownChange(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.editCourseModalDropdownItemText,
                            editCourseLanguage === language
                              ? styles.editCourseModalDropdownItemTextActive
                              : styles.editCourseModalDropdownItemTextInactive,
                          ]}
                        >
                          {language}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.editCourseModalLabel}>Course Description</Text>
              <TextInput
                style={[styles.textInput, { minHeight: 80 }]}
                value={editCourseDescription}
                onChangeText={onEditCourseDescriptionChange}
                placeholder="Course Description"
                multiline
              />

              <Text style={styles.editCourseModalSectionTitle}>What you will teach in this course (max 12)</Text>
              {editTeachingPoints.map((point, index) => (
                <View key={index} style={{ marginBottom: 12 }}>
                  <Text style={styles.editCourseModalEntryLabel}>Entry {String(index + 1).padStart(2, "0")}</Text>
                  <View style={styles.editCourseModalEntryRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <TextInput
                        style={[styles.textInput, { minHeight: 40 }]}
                        value={point}
                        onChangeText={(text) => {
                          const newPoints = [...editTeachingPoints];
                          newPoints[index] = text;
                          onEditTeachingPointsChange(newPoints);
                        }}
                        placeholder="What you will teach in this course..."
                        multiline
                      />
                      <Text style={styles.editCourseModalCharacterCount}>
                        {120 - point.length} characters remaining
                      </Text>
                    </View>
                    {editTeachingPoints.length > 1 && (
                      <TouchableOpacity
                        style={styles.editCourseModalRemoveButton}
                        onPress={() => {
                          const newPoints = editTeachingPoints.filter((_, i) => i !== index);
                          onEditTeachingPointsChange(newPoints);
                        }}
                      >
                        <Text style={styles.editCourseModalRemoveButtonText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
              {editTeachingPoints.length < 12 && (
                <TouchableOpacity
                  style={styles.editCourseModalAddButton}
                  onPress={() => {
                    if (editTeachingPoints.length < 12) {
                      onEditTeachingPointsChange([...editTeachingPoints, ""]);
                    }
                  }}
                >
                  <Text style={styles.editCourseModalAddButtonText}>+ Add Teaching Point</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.editCourseModalSectionTitle}>Course Requirements (max 12)</Text>
              {editRequirements.map((requirement, index) => (
                <View key={index} style={{ marginBottom: 12 }}>
                  <Text style={styles.editCourseModalEntryLabel}>Entry {String(index + 1).padStart(2, "0")}</Text>
                  <View style={styles.editCourseModalEntryRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <TextInput
                        style={[styles.textInput, { minHeight: 40 }]}
                        value={requirement}
                        onChangeText={(text) => {
                          const newRequirements = [...editRequirements];
                          newRequirements[index] = text;
                          onEditRequirementsChange(newRequirements);
                        }}
                        placeholder="Course requirement..."
                        multiline
                      />
                      <Text style={styles.editCourseModalCharacterCount}>
                        {120 - requirement.length} characters remaining
                      </Text>
                    </View>
                    {editRequirements.length > 1 && (
                      <TouchableOpacity
                        style={styles.editCourseModalRemoveButton}
                        onPress={() => {
                          const newRequirements = editRequirements.filter((_, i) => i !== index);
                          onEditRequirementsChange(newRequirements);
                        }}
                      >
                        <Text style={styles.editCourseModalRemoveButtonText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
              {editRequirements.length < 12 && (
                <TouchableOpacity
                  style={styles.editCourseModalAddButton}
                  onPress={() => {
                    if (editRequirements.length < 12) {
                      onEditRequirementsChange([...editRequirements, ""]);
                    }
                  }}
                >
                  <Text style={styles.editCourseModalAddButtonText}>+ Add Requirement</Text>
                </TouchableOpacity>
              )}

              {editCourseError && <Text style={styles.editCourseModalErrorText}>{editCourseError}</Text>}

              <TouchableOpacity
                style={[styles.saveChangesButton, editCourseLoading && styles.disabledButton]}
                onPress={onSave}
                disabled={editCourseLoading}
              >
                {editCourseLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveChangesButtonText}>Update Course Info</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelProfileButton} onPress={onClose}>
                <Text style={styles.cancelProfileButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    maxHeight: "80%",
  },
  editCourseModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editCourseModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  editCourseModalCloseButton: {
    padding: 4,
  },
  editCourseModalLabel: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    marginBottom: 15,
  },
  editCourseModalDropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editCourseModalDropdownText: {
    color: "#333",
  },
  editCourseModalDropdownPlaceholder: {
    color: "#999",
  },
  editCourseModalDropdownOverlay: {
    position: "absolute",
    top: 200,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  editCourseModalDropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  editCourseModalDropdownItemActive: {
    backgroundColor: "#e3f2fd",
  },
  editCourseModalDropdownItemText: {
    color: "#333",
  },
  editCourseModalDropdownItemTextActive: {
    color: "#1976d2",
    fontWeight: "bold",
  },
  editCourseModalDropdownItemTextInactive: {
    fontWeight: "normal",
  },
  editCourseModalLanguageDropdownOverlay: {
    position: "absolute",
    top: 280,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  editCourseModalSectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
  },
  editCourseModalEntryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  editCourseModalEntryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  editCourseModalCharacterCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  editCourseModalRemoveButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 2,
  },
  editCourseModalRemoveButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  editCourseModalAddButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  editCourseModalAddButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  editCourseModalErrorText: {
    color: "red",
    marginVertical: 8,
  },
  editCourseModalNoSubcategoriesText: {
    padding: 12,
    color: "#666",
    textAlign: "center",
  },
  saveChangesButton: {
    backgroundColor: "#1E293B",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  saveChangesButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.7,
  },
  cancelProfileButton: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelProfileButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditCourseModal;
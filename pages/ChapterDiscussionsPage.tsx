// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   Linking,
//   Modal,
//   TextInput,
//   Alert,
//   Platform,
//   KeyboardAvoidingView,
// } from "react-native";
// import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
// import { RootStackParamList } from "../navigation/AppNavigator";
// import {
//   getDiscussionsForChapter,
//   getDiscussionsForLesson,
//   createDiscussionForChapter,
//   createDiscussionForLesson,
// } from "../services/discussion";
// import {
//   addAuthInterceptor,
//   createApiInstance,
//   getAssessmentCategories,
// } from "../services/course";
// import * as ImagePicker from "react-native-image-picker";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import Toast from "react-native-simple-toast";
// import SimpleIcon from "../components/SimpleIcon";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// type RouteParams = RouteProp<RootStackParamList, "ChapterDiscussions">;

// interface AssessmentCategory {
//   _id: string;
//   name: string;
// }

// const ChapterDiscussionsPage = () => {
//   const route = useRoute<RouteParams>();
//   const navigation = useNavigation();
//   const { chapterId, courseId, semesterId, quarterId, lessonId, navigateBack } =
//     route.params;
//   const insets = useSafeAreaInsets();

//   // ----- State for discussion list -----
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [items, setItems] = useState<any[]>([]);

//   // ----- State for creating a new discussion -----
//   const [showCreate, setShowCreate] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [topic, setTopic] = useState("");
//   const [description, setDescription] = useState("");
//   const [totalMarks, setTotalMarks] = useState("");
//   const [categories, setCategories] = useState<any[]>([]);
//   const [showCategoryMenu, setShowCategoryMenu] = useState(false);
//   const [loadingCategories, setLoadingCategories] = useState(false);
//   const [dueDate, setDueDate] = useState<Date | null>(null);
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [tempDate, setTempDate] = useState<Date | null>(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [selectedCategory, setSelectedCategory] =
//     useState<AssessmentCategory | null>(null);
//   const [file, setFile] = useState<any | null>(null);
//   const [quarterDates, setQuarterDates] = useState<{
//     startDate: string;
//     endDate: string;
//   } | null>(null);

//   // ----- Category creation modal states -----
//   const [showCategoryModal, setShowCategoryModal] = useState(false);
//   const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
//   const [newCategoryName, setNewCategoryName] = useState("");
//   const [newCategoryWeight, setNewCategoryWeight] = useState<string>("0");
//   const [creatingCategory, setCreatingCategory] = useState(false);

//   // ----- Helpers -----
//   const formatDate = (date: Date) => {
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // ----- Fetch quarter dates (for validation) -----
//   const fetchQuarterDates = async () => {
//     try {
//       const api = await createApiInstance();
//       addAuthInterceptor(api);
//       const response = await api.get(
//         `/api/quarter/getDatesofQuarter/${quarterId}`
//       );
//       setQuarterDates({
//         startDate: response.data.startDate,
//         endDate: response.data.endDate,
//       });
//     } catch (error) {
//       console.error("Error fetching quarter dates:", error);
//     }
//   };

//   // ----- Fetch categories for dropdown -----
//   const fetchCategories = async () => {
//     try {
//       setLoadingCategories(true);
//       const api = await createApiInstance();
//       addAuthInterceptor(api);
//       const response = await api.get(`/api/assessmentCategory/${courseId}`);
//       setCategories(response.data.categories || []);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     } finally {
//       setLoadingCategories(false);
//     }
//   };

//   // ----- Fetch list of discussions -----
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const res = lessonId
//           ? await getDiscussionsForLesson(lessonId)
//           : await getDiscussionsForChapter(chapterId);
//         // The chapter endpoint returns { discussions: [...] } while the
//         // lesson endpoint returns { discussion: [...] } - match each shape.
//         setItems((lessonId ? res.discussion : res.discussions) || []);
//       } catch (err: any) {
//         setError(err.message || "Failed to fetch discussions");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//     fetchQuarterDates();
//     fetchCategories();
//   }, [chapterId, lessonId, courseId]);

//   // ----- Create a new discussion -----
//   const handleCreateDiscussion = async () => {
//     if (
//       !topic.trim() ||
//       !description.trim() ||
//       !selectedCategory?._id ||
//       !totalMarks
//     ) {
//       Alert.alert(
//         "Validation",
//         "Topic, Description, Category and Total Points are required."
//       );
//       return;
//     }
//     if (dueDate && quarterDates) {
//       const dueDateTimestamp = dueDate.getTime();
//       const quarterStartTimestamp = new Date(quarterDates.startDate).getTime();
//       const quarterEndTimestamp = new Date(quarterDates.endDate).getTime();
//       if (
//         dueDateTimestamp < quarterStartTimestamp ||
//         dueDateTimestamp > quarterEndTimestamp
//       ) {
//         Toast.show(
//           `Due date must be between ${formatDate(
//             new Date(quarterDates.startDate)
//           )} and ${formatDate(new Date(quarterDates.endDate))}`,
//           Toast.LONG
//         );
//         return;
//       }
//     }
//     if (!dueDate) {
//       Alert.alert("Validation", "Please select due date");
//       return;
//     }

//     try {
//       setCreating(true);
//       setError(null);
//       const due = {
//         date: new Date(
//           dueDate.getFullYear(),
//           dueDate.getMonth(),
//           dueDate.getDate()
//         ).toISOString(),
//         time: `${String(dueDate.getHours()).padStart(2, "0")}:${String(
//           dueDate.getMinutes()
//         ).padStart(2, "0")}`,
//         dateTime: dueDate.toISOString(),
//       };

//       const res = lessonId
//         ? await createDiscussionForLesson({
//           course: courseId,
//           topic: topic.trim(),
//           description: description.trim(),
//           category: selectedCategory._id,
//           type: "lesson",
//           dueDate: due,
//           totalMarks: Number(totalMarks),
//           semester: semesterId,
//           quarter: quarterId,
//           lesson: lessonId,
//           file,
//         })
//         : await createDiscussionForChapter({
//           course: courseId,
//           topic: topic.trim(),
//           description: description.trim(),
//           category: selectedCategory._id,
//           type: "chapter",
//           dueDate: due,
//           totalMarks: Number(totalMarks),
//           semester: semesterId,
//           quarter: quarterId,
//           chapter: chapterId,
//           file,
//         });

//       Toast.show(res.message || "Discussion created successfully", Toast.LONG);
//       setShowCreate(false);
//       setTopic("");
//       setDescription("");
//       setTotalMarks("");
//       setSelectedCategory(null);
//       setDueDate(null);
//       setFile(null);

//       // Refresh list
//       setLoading(true);
//       const refreshed = lessonId
//         ? await getDiscussionsForLesson(lessonId)
//         : await getDiscussionsForChapter(chapterId);
//       setItems((lessonId ? refreshed.discussion : refreshed.discussions) || []);
//     } catch (err: any) {
//       Toast.show(err.message || "Failed to create discussion", Toast.LONG);
//     } finally {
//       setCreating(false);
//       setLoading(false);
//     }
//   };

//   // ----- Create category -----
//   const handleCreateCategory = async () => {
//     const name = newCategoryName.trim();
//     const weight = parseFloat(newCategoryWeight);
//     if (!name) {
//       Toast.show("Please enter topic name", Toast.SHORT);
//       return;
//     }
//     if (Number.isNaN(weight) || weight <= 0) {
//       Toast.show("Please enter a valid weight (> 0)", Toast.SHORT);
//       return;
//     }

//     try {
//       setCreatingCategory(true);
//       const api = await createApiInstance();
//       addAuthInterceptor(api);
//       const payload = { name, weight, course: courseId } as any;
//       const response = await api.post(
//         `/api/assessmentCategory/${courseId}`,
//         payload
//       );
//       Toast.show("Assessment category created successfully", Toast.LONG);
//       const created = response.data?.category || response.data?.data || null;
//       if (created) {
//         setSelectedCategory({ _id: created._id, name: created.name });
//       }
//       setShowAddCategoryModal(false);
//       setShowCategoryModal(true);
//       setNewCategoryName("");
//       setNewCategoryWeight("0");
//       await fetchCategories();
//     } catch (e: any) {
//       Toast.show(
//         e?.response?.data?.message || e.message || "Failed to create category",
//         Toast.LONG
//       );
//     } finally {
//       setCreatingCategory(false);
//     }
//   };

//   // ======================== RENDER ========================

//   return (
//     <View style={{ flex: 1, backgroundColor: "#fff" }}>
//       {/* Header */}
//       <View style={[styles.header, { paddingTop: insets.top }]}>
//         <TouchableOpacity
//           onPress={() =>
//             navigateBack ? navigateBack() : (navigation as any).goBack()
//           }
//           style={{ padding: 4, marginRight: 12 }}
//         >
//           <SimpleIcon name="arrow-back" size={28} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>
//           {lessonId ? "Lesson Discussions" : "Chapter Discussions"}
//         </Text>
//         <View style={{ width: 28 }} />
//       </View>

//       {/* Create Discussion Button */}
//       <View style={{ padding: 16 }}>
//         <TouchableOpacity
//           style={styles.createButton}
//           onPress={async () => {
//             try {
//               setShowCreate(true);
//               const res = await getAssessmentCategories(courseId);
//               setCategories(res.categories || []);
//             } catch (e: any) {
//               Toast.show(e.message || "Failed to load categories", Toast.LONG);
//             }
//           }}
//         >
//           <Text style={styles.createButtonText}>Create Discussion</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Discussion List */}
//       {loading ? (
//         <View style={styles.centered}>
//           <ActivityIndicator size="large" color="#10B144" />
//         </View>
//       ) : error ? (
//         <View style={styles.centered}>
//           <Text style={{ color: "#000" }}>{error}</Text>
//         </View>
//       ) : (
//         <ScrollView contentContainerStyle={{ padding: 16 }}>
//           {items.map((d) => {
//             const bannerUrl = d.course?.thumbnail?.url;
//             return (
//               <TouchableOpacity
//                 key={d._id}
//                 style={styles.card}
//                 onPress={() =>
//                   (navigation as any).navigate("DiscussionStudent", {
//                     discussionId: d._id,
//                   })
//                 }
//               >
//                 {!!bannerUrl && (
//                   <Image source={{ uri: bannerUrl }} style={styles.banner} />
//                 )}
//                 <View
//                   style={{
//                     flexDirection: "row",
//                     alignItems: "center",
//                     marginTop: 12,
//                   }}
//                 >
//                   <View style={styles.badge}>
//                     <Text style={styles.badgeText}>
//                       {lessonId ? "lesson" : "chapter"}
//                     </Text>
//                   </View>
//                   <View style={{ marginLeft: 12 }}>
//                     <Text style={styles.dueDateLabel}>Due Date:</Text>
//                     <Text style={styles.dueDateValue}>
//                       {new Date(d.dueDate?.date).toLocaleDateString("en-US")}{" "}
//                       {d.dueDate?.time}
//                     </Text>
//                   </View>
//                 </View>
//                 <Text style={styles.title}>{d.topic}</Text>
//                 <Text style={styles.courseTitle}>{d?.course?.courseTitle}</Text>
//                 <Text style={styles.description}>{d.description}</Text>
//                 <Text style={styles.dateRight}>
//                   {new Date(d.createdAt).toLocaleDateString("en-US")}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//           {items.length === 0 && (
//             <Text style={{ textAlign: "center", color: "#6b7280" }}>
//               No discussions found.
//             </Text>
//           )}
//         </ScrollView>
//       )}

//       {/* ========== CREATE DISCUSSION MODAL ========== */}
//       <Modal
//         visible={showCreate}
//         transparent={false}
//         animationType="slide"
//         onRequestClose={() => setShowCreate(false)}
//       >
//         <View style={{ flex: 1, backgroundColor: "#fff" }}>
//           <View style={[styles.header, { paddingTop: insets.top }]}>
//             <TouchableOpacity
//               onPress={() => setShowCreate(false)}
//               style={{ padding: 4, marginRight: 12 }}
//             >
//               <SimpleIcon name="arrow-back" size={28} color="#fff" />
//             </TouchableOpacity>
//             <Text style={styles.headerTitle}>Create New Discussion</Text>
//             <View style={{ width: 28 }} />
//           </View>
//           <KeyboardAvoidingView
//             style={{ flex: 1 }}
//             behavior={Platform.OS === "ios" ? "padding" : undefined}
//           >
//             <ScrollView contentContainerStyle={{ padding: 16 }}>
//               <Text style={styles.inputLabel}>Topic</Text>
//               <TextInput
//                 style={styles.textInput}
//                 value={topic}
//                 onChangeText={setTopic}
//                 placeholder="Topic"
//               />

//               <Text style={styles.inputLabel}>Description</Text>
//               <TextInput
//                 style={[
//                   styles.textInput,
//                   { minHeight: 100, textAlignVertical: "top" },
//                 ]}
//                 value={description}
//                 onChangeText={setDescription}
//                 placeholder="Description"
//                 multiline
//               />

//               <View style={{ flexDirection: "row", gap: 12 }}>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.inputLabel}>Total Points</Text>
//                   <TextInput
//                     style={styles.textInput}
//                     value={totalMarks}
//                     onChangeText={setTotalMarks}
//                     keyboardType="numeric"
//                     placeholder="0"
//                   />
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.inputLabel}>Category</Text>
//                   <TouchableOpacity
//                     style={styles.dropdownTrigger}
//                     onPress={() => setShowCategoryModal(true)}
//                     activeOpacity={0.8}
//                   >
//                     <Text
//                       style={[
//                         styles.dropdownTriggerText,
//                         !selectedCategory && styles.dropdownPlaceholder,
//                       ]}
//                     >
//                       {selectedCategory
//                         ? selectedCategory.name
//                         : "Select a Topic"}
//                     </Text>
//                     <SimpleIcon
//                       name={showCategoryMenu ? "chevron-up" : "chevron-down"}
//                       size={18}
//                       color="#333"
//                     />
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               <Text style={styles.inputLabel}>Due Date</Text>
//               <TouchableOpacity
//                 style={styles.textInput}
//                 onPress={() => setShowDatePicker(true)}
//               >
//                 <Text style={{ color: dueDate ? "#111" : "#9ca3af" }}>
//                   {dueDate
//                     ? `${formatDate(dueDate)} at ${formatTime(dueDate)}`
//                     : "Select Due Date"}
//                 </Text>
//               </TouchableOpacity>

//               <Text style={styles.inputLabel}>
//                 Attach Image (PNG, JPEG, JPG)
//               </Text>
//               <TouchableOpacity
//                 style={styles.filePickerButton}
//                 onPress={() => {
//                   ImagePicker.launchImageLibrary(
//                     { mediaType: "photo" },
//                     (res) => {
//                       if (res.didCancel || res.errorMessage) return;
//                       const asset = res.assets && res.assets[0];
//                       if (asset) {
//                         setFile({
//                           uri: asset.uri,
//                           type: asset.type || "image/jpeg",
//                           name:
//                             asset.fileName ||
//                             asset.uri?.split("/").pop() ||
//                             "image.jpg",
//                         });
//                       }
//                     }
//                   );
//                 }}
//               >
//                 <Text style={styles.filePickerButtonText}>
//                   {file?.name || "Choose image No file chosen"}
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.createButton, creating && { opacity: 0.7 }]}
//                 disabled={creating}
//                 onPress={handleCreateDiscussion}
//               >
//                 {creating ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.createButtonText}>Create Discussion</Text>
//                 )}
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.cancelButton}
//                 onPress={() => setShowCreate(false)}
//               >
//                 <Text style={styles.cancelText}>Cancel</Text>
//               </TouchableOpacity>
//             </ScrollView>
//           </KeyboardAvoidingView>

//           {/* Date/Time pickers */}
//           {showDatePicker && (
//             <>
//               {Platform.OS === "ios" && (
//                 <Text
//                   style={{
//                     color: "#007AFF",
//                     fontSize: 18,
//                     fontWeight: "600",
//                     alignSelf: "flex-end",
//                     marginTop: 10,
//                     marginRight: 15,
//                   }}
//                   onPress={() => {
//                     setShowDatePicker(false);
//                     if (tempDate) {
//                       setTimeout(() => setShowTimePicker(true), 200);
//                     }
//                   }}
//                 >
//                   Done
//                 </Text>
//               )}
//               <DateTimePicker
//                 value={dueDate || new Date()}
//                 mode="date"
//                 style={{ alignSelf: "center" }}
//                 display={Platform.OS === "ios" ? "spinner" : "default"}
//                 onChange={(event, selectedDate) => {
//                   if (Platform.OS === "android") {
//                     setShowDatePicker(false);
//                     if (event.type === "set" && selectedDate) {
//                       setTempDate(selectedDate);
//                       setTimeout(() => setShowTimePicker(true), 200);
//                     } else {
//                       setTempDate(null);
//                     }
//                   } else {
//                     if (selectedDate) {
//                       setTempDate(selectedDate);
//                       setDueDate(selectedDate);
//                     }
//                   }
//                 }}
//               />
//             </>
//           )}

//           {showTimePicker && (
//             <>
//               {Platform.OS === "ios" && (
//                 <Text
//                   style={{
//                     color: "#007AFF",
//                     fontSize: 18,
//                     fontWeight: "600",
//                     alignSelf: "flex-end",
//                     marginTop: 10,
//                     marginRight: 15,
//                   }}
//                   onPress={() => {
//                     setShowTimePicker(false);
//                     if (tempDate) {
//                       setDueDate(tempDate);
//                     }
//                   }}
//                 >
//                   Done
//                 </Text>
//               )}
//               <DateTimePicker
//                 value={tempDate || new Date()}
//                 mode="time"
//                 style={{ alignSelf: "center" }}
//                 display={Platform.OS === "ios" ? "spinner" : "default"}
//                 onChange={(event, selectedTime) => {
//                   if (Platform.OS === "android") {
//                     setShowTimePicker(false);
//                     if (event.type === "set" && selectedTime && tempDate) {
//                       const combined = new Date(tempDate);
//                       combined.setHours(selectedTime.getHours());
//                       combined.setMinutes(selectedTime.getMinutes());
//                       setDueDate(combined);
//                     } else {
//                       setTempDate(null);
//                       setDueDate(null);
//                     }
//                   } else {
//                     if (selectedTime && tempDate) {
//                       const combined = new Date(tempDate);
//                       combined.setHours(selectedTime.getHours());
//                       combined.setMinutes(selectedTime.getMinutes());
//                       setTempDate(combined);
//                     }
//                   }
//                 }}
//               />
//             </>
//           )}
//         </View>
//       </Modal>

//       {/* ========== CATEGORY SELECTION MODAL ========== */}
//       <Modal
//         visible={showCategoryModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowCategoryModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Select Category</Text>
//             <ScrollView style={styles.categoryList}>
//               {loadingCategories ? (
//                 <ActivityIndicator size="large" color="#10B144" />
//               ) : categories.length > 0 ? (
//                 categories.map((category) => (
//                   <TouchableOpacity
//                     key={category._id}
//                     style={[
//                       styles.categoryItem,
//                       selectedCategory?._id === category._id &&
//                       styles.categoryItemSelected,
//                     ]}
//                     onPress={() => {
//                       setSelectedCategory(category);
//                       setShowCategoryModal(false);
//                     }}
//                   >
//                     <Text
//                       style={[
//                         styles.categoryItemText,
//                         selectedCategory?._id === category._id &&
//                         styles.categoryItemTextSelected,
//                       ]}
//                     >
//                       {category.name}
//                     </Text>
//                   </TouchableOpacity>
//                 ))
//               ) : (
//                 <Text style={styles.noCategoriesText}>
//                   No categories available
//                 </Text>
//               )}
//             </ScrollView>
//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={() => setShowCategoryModal(false)}
//             >
//               <Text style={styles.modalCloseButtonText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.modalCloseButton, { backgroundColor: "#111" }]}
//               onPress={() => {
//                 setShowCategoryModal(false);
//                 setShowAddCategoryModal(true);
//               }}
//             >
//               <Text style={[styles.modalCloseButtonText, { color: "#fff" }]}>
//                 + Add New Topic
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* ========== ADD CATEGORY MODAL ========== */}
//       <Modal
//         visible={showAddCategoryModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowAddCategoryModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Add New Topic</Text>
//             <Text style={{ color: "#6b7280", marginBottom: 16 }}>
//               Create a new assessment category for this course.
//             </Text>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Topic Name</Text>
//               <TextInput
//                 style={styles.textInput}
//                 placeholder="e.g., Midterm Exam, Quiz, Assignment"
//                 value={newCategoryName}
//                 onChangeText={setNewCategoryName}
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Weight (%)</Text>
//               <TextInput
//                 style={styles.textInput}
//                 placeholder="0"
//                 value={newCategoryWeight}
//                 onChangeText={setNewCategoryWeight}
//                 keyboardType="numeric"
//               />
//             </View>

//             <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
//               <TouchableOpacity
//                 style={[styles.cancelQuestionButton]}
//                 onPress={() => setShowAddCategoryModal(false)}
//                 disabled={creatingCategory}
//               >
//                 <Text style={styles.cancelQuestionButtonText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.saveQuestionButton]}
//                 onPress={handleCreateCategory}
//                 disabled={creatingCategory}
//               >
//                 {creatingCategory ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.saveQuestionButtonText}>
//                     Create Category
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     minHeight: 56,
//     backgroundColor: "#10B144",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingBottom: Platform.OS === "ios" ? 10 : 0,
//   },
//   headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", flex: 1 },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
//   createButton: {
//     backgroundColor: "#10B144",
//     borderRadius: 8,
//     paddingVertical: 12,
//     alignItems: "center",
//   },
//   createButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     marginBottom: 16,
//   },
//   banner: { width: "100%", height: 220, borderRadius: 12 },
//   badge: {
//     backgroundColor: "#6d28d9",
//     borderRadius: 16,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },
//   badgeText: { color: "#fff", fontWeight: "bold" },
//   dueDateLabel: { color: "#64748b", fontWeight: "bold" },
//   dueDateValue: { color: "#0f172a", fontWeight: "600" },
//   title: { fontSize: 24, fontWeight: "bold", color: "#111", marginTop: 8 },
//   link: { color: "#2563eb", textDecorationLine: "underline", marginTop: 4 },
//   description: { color: "#334155", marginTop: 4 },
//   courseTitle: { marginTop: 4, color: "blue" },
//   dateRight: { color: "#94a3b8", textAlign: "right", marginTop: 12 },
//   inputLabel: {
//     fontWeight: "bold",
//     marginBottom: 6,
//     color: "#111",
//     marginTop: 8,
//   },
//   textInput: {
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     backgroundColor: "#fff",
//     marginBottom: 8,
//   },
//   dropdownTrigger: {
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     backgroundColor: "#fff",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   dropdownTriggerText: { color: "#111" },
//   dropdownPlaceholder: { color: "#7b8794" },
//   filePickerButton: {
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     backgroundColor: "#f9fafb",
//     marginBottom: 16,
//   },
//   filePickerButtonText: { color: "#6b7280" },
//   cancelButton: {
//     backgroundColor: "#ffffff",
//     borderRadius: 8,
//     paddingVertical: 12,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     marginTop: 12,
//   },
//   cancelText: { color: "#111", fontWeight: "bold", fontSize: 16 },

//   // Discussion Modal Styles
//   discussionBanner: {
//     backgroundColor: "#10B144",
//     borderRadius: 12,
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     margin: 16,
//     alignItems: "center",
//   },
//   discussionBannerText: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   discussionContent: {
//     backgroundColor: "#fff",
//     margin: 16,
//     borderRadius: 12,
//     padding: 16,
//   },
//   discussionMeta: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 16,
//   },
//   metaItem: {
//     alignItems: "flex-end",
//   },
//   metaLabel: {
//     fontWeight: "bold",
//     color: "#374151",
//     fontSize: 14,
//   },
//   metaValue: {
//     color: "#111",
//     fontWeight: "600",
//     fontSize: 14,
//     marginTop: 2,
//   },
//   discussionTopic: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#111",
//     marginBottom: 8,
//   },
//   discussionDescription: {
//     fontSize: 16,
//     color: "#374151",
//     marginBottom: 16,
//   },
//   attachedFileContainer: {
//     marginBottom: 24,
//   },
//   attachedFile: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   fileIcon: {
//     alignItems: "center",
//     marginRight: 12,
//   },
//   fileIconText: {
//     fontSize: 10,
//     color: "#8b5cf6",
//     marginTop: 2,
//   },
//   fileName: {
//     color: "#2563eb",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   commentsSection: {
//     marginTop: 16,
//   },
//   commentsTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#111",
//     marginBottom: 8,
//   },
//   commentsDivider: {
//     height: 1,
//     backgroundColor: "#e5e7eb",
//     marginBottom: 16,
//   },
//   commentInputBox: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     padding: 16,
//     marginBottom: 16,
//   },
//   commentInput: {
//     minHeight: 60,
//     fontSize: 16,
//     color: "#222",
//     padding: 0,
//     textAlignVertical: "top",
//   },
//   postCommentButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#10B144",
//     borderRadius: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//   },
//   postCommentButtonDisabled: { backgroundColor: "#A0E7B2" },
//   postCommentButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   commentItem: {
//     backgroundColor: "#f9fafb",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 8,
//   },
//   commentText: {
//     fontSize: 14,
//     color: "#374151",
//     marginBottom: 4,
//   },
//   commentAuthor: {
//     fontSize: 12,
//     color: "#6b7280",
//     fontWeight: "500",
//   },
//   commentDate: {
//     fontSize: 12,
//     color: "#9ca3af",
//     marginTop: 2,
//   },
//   noCommentsText: {
//     color: "#A0AEC0",
//     fontSize: 14,
//     textAlign: "center",
//     fontStyle: "italic",
//     marginTop: 16,
//   },

//   // Modal styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//     width: "90%",
//     maxWidth: 400,
//     maxHeight: "80%",
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#111",
//     marginBottom: 16,
//   },
//   categoryList: {
//     maxHeight: 200,
//   },
//   categoryItem: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   categoryItemSelected: {
//     backgroundColor: "#f0fdf4",
//   },
//   categoryItemText: {
//     fontSize: 16,
//     color: "#333",
//   },
//   categoryItemTextSelected: {
//     color: "#10B144",
//     fontWeight: "bold",
//   },
//   noCategoriesText: {
//     textAlign: "center",
//     color: "#7b8794",
//     paddingVertical: 20,
//   },
//   modalCloseButton: {
//     backgroundColor: "#eee",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 16,
//   },
//   modalCloseButtonText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#555",
//   },
//   inputGroup: {
//     marginBottom: 16,
//   },
//   saveQuestionButton: {
//     flex: 1,
//     backgroundColor: "#222",
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   saveQuestionButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   cancelQuestionButton: {
//     flex: 1,
//     backgroundColor: "#eee",
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   cancelQuestionButtonText: {
//     color: "#555",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

// export default ChapterDiscussionsPage;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Modal,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  getDiscussionsForChapter,
  getDiscussionsForLesson,
  createDiscussionForChapter,
  createDiscussionForLesson,
} from "../services/discussion";
import {
  addAuthInterceptor,
  createApiInstance,
  getAssessmentCategories,
} from "../services/course";
import * as ImagePicker from "react-native-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-simple-toast";
import SimpleIcon from "../components/SimpleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RouteParams = RouteProp<RootStackParamList, "ChapterDiscussions">;

interface AssessmentCategory {
  _id: string;
  name: string;
}

const ChapterDiscussionsPage = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { chapterId, courseId, semesterId, quarterId, lessonId, navigateBack } =
    route.params;
  const insets = useSafeAreaInsets();

  // ----- State for discussion list -----
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  // ----- State for creating a new discussion -----
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<AssessmentCategory | null>(null);
  const [file, setFile] = useState<any | null>(null);

  // ----- Quarter date state (for validation) -----
  const [quarterDates, setQuarterDates] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [quarterDatesLoading, setQuarterDatesLoading] = useState(false);
  const [quarterDatesError, setQuarterDatesError] = useState<string | null>(
    null
  );

  // ----- Category creation modal states -----
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryWeight, setNewCategoryWeight] = useState<string>("0");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // ----- Helpers -----
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

  // ----- Apply quarter dates and reset dueDate if needed -----
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

  // ----- Fetch quarter dates (with error handling) -----
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

  // ----- Fetch categories for dropdown -----
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const api = await createApiInstance();
      addAuthInterceptor(api);
      const response = await api.get(`/api/assessmentCategory/${courseId}`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // ----- Fetch list of discussions -----
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = lessonId
          ? await getDiscussionsForLesson(lessonId)
          : await getDiscussionsForChapter(chapterId);
        setItems((lessonId ? res.discussion : res.discussions) || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch discussions");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    fetchQuarterDates();
    fetchCategories();
  }, [chapterId, lessonId, courseId]);

  // ----- Create a new discussion (with full date validation) -----
  const handleCreateDiscussion = async () => {
    if (
      !topic.trim() ||
      !description.trim() ||
      !selectedCategory?._id ||
      !totalMarks
    ) {
      Alert.alert(
        "Validation",
        "Topic, Description, Category and Total Points are required."
      );
      return;
    }

    // --- Date validations ---
    const now = new Date();
    now.setHours(0, 0, 0, 0); // start of today

    if (!dueDate) {
      Alert.alert("Validation", "Please select a due date.");
      return;
    }

    // 1. Check against today (no past dates)
    const dueDateOnly = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate()
    );
    if (dueDateOnly < now) {
      Toast.show("Due date cannot be in the past.", Toast.LONG);
      return;
    }

    // 2. Check against quarter range (if available)
    if (quarterDates) {
      const quarterStart = new Date(quarterDates.startDate);
      const quarterEnd = new Date(quarterDates.endDate);
      const dueTimestamp = dueDate.getTime();
      if (
        dueTimestamp < quarterStart.getTime() ||
        dueTimestamp > quarterEnd.getTime()
      ) {
        Toast.show(
          `Due date must be between ${formatDate(
            quarterStart
          )} and ${formatDate(quarterEnd)}`,
          Toast.LONG
        );
        return;
      }
    }

    try {
      setCreating(true);
      setError(null);
      const due = {
        date: new Date(
          dueDate.getFullYear(),
          dueDate.getMonth(),
          dueDate.getDate()
        ).toISOString(),
        time: `${String(dueDate.getHours()).padStart(2, "0")}:${String(
          dueDate.getMinutes()
        ).padStart(2, "0")}`,
        dateTime: dueDate.toISOString(),
      };

      const res = lessonId
        ? await createDiscussionForLesson({
            course: courseId,
            topic: topic.trim(),
            description: description.trim(),
            category: selectedCategory._id,
            type: "lesson",
            dueDate: due,
            totalMarks: Number(totalMarks),
            semester: semesterId,
            quarter: quarterId,
            lesson: lessonId,
            file,
          })
        : await createDiscussionForChapter({
            course: courseId,
            topic: topic.trim(),
            description: description.trim(),
            category: selectedCategory._id,
            type: "chapter",
            dueDate: due,
            totalMarks: Number(totalMarks),
            semester: semesterId,
            quarter: quarterId,
            chapter: chapterId,
            file,
          });

      Toast.show(res.message || "Discussion created successfully", Toast.LONG);
      setShowCreate(false);
      setTopic("");
      setDescription("");
      setTotalMarks("");
      setSelectedCategory(null);
      setDueDate(null);
      setFile(null);

      // Refresh list
      setLoading(true);
      const refreshed = lessonId
        ? await getDiscussionsForLesson(lessonId)
        : await getDiscussionsForChapter(chapterId);
      setItems((lessonId ? refreshed.discussion : refreshed.discussions) || []);
    } catch (err: any) {
      Toast.show(err.message || "Failed to create discussion", Toast.LONG);
    } finally {
      setCreating(false);
      setLoading(false);
    }
  };

  // ----- Create category -----
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
      const payload = { name, weight, course: courseId } as any;
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
      Toast.show(
        e?.response?.data?.message || e.message || "Failed to create category",
        Toast.LONG
      );
    } finally {
      setCreatingCategory(false);
    }
  };

  // ======================== RENDER ========================

  // Compute min/max for date picker
  const getPickerMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (quarterDates) {
      const quarterStart = new Date(quarterDates.startDate);
      // min = max(today, quarterStart)
      return quarterStart > today ? quarterStart : today;
    }
    return today;
  };

  const getPickerMaxDate = () => {
    if (quarterDates) {
      return new Date(quarterDates.endDate);
    }
    return undefined;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() =>
            navigateBack ? navigateBack() : (navigation as any).goBack()
          }
          style={{ padding: 4, marginRight: 12 }}
        >
          <SimpleIcon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {lessonId ? "Lesson Discussions" : "Chapter Discussions"}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Create Discussion Button */}
      <View style={{ padding: 16 }}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={async () => {
            try {
              setShowCreate(true);
              const res = await getAssessmentCategories(courseId);
              setCategories(res.categories || []);
            } catch (e: any) {
              Toast.show(e.message || "Failed to load categories", Toast.LONG);
            }
          }}
        >
          <Text style={styles.createButtonText}>Create Discussion</Text>
        </TouchableOpacity>
      </View>

      {/* Discussion List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#10B144" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={{ color: "#000" }}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {items.map((d) => {
            const bannerUrl = d.course?.thumbnail?.url;
            return (
              <TouchableOpacity
                key={d._id}
                style={styles.card}
                onPress={() =>
                  (navigation as any).navigate("DiscussionStudent", {
                    discussionId: d._id,
                  })
                }
              >
                {!!bannerUrl && (
                  <Image source={{ uri: bannerUrl }} style={styles.banner} />
                )}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 12,
                  }}
                >
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {lessonId ? "lesson" : "chapter"}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.dueDateLabel}>Due Date:</Text>
                    <Text style={styles.dueDateValue}>
                      {new Date(d.dueDate?.date).toLocaleDateString("en-US")}{" "}
                      {d.dueDate?.time}
                    </Text>
                  </View>
                </View>
                <Text style={styles.title}>{d.topic}</Text>
                <Text style={styles.courseTitle}>{d?.course?.courseTitle}</Text>
                <Text style={styles.description}>{d.description}</Text>
                <Text style={styles.dateRight}>
                  {new Date(d.createdAt).toLocaleDateString("en-US")}
                </Text>
              </TouchableOpacity>
            );
          })}
          {items.length === 0 && (
            <Text style={{ textAlign: "center", color: "#6b7280" }}>
              No discussions found.
            </Text>
          )}
        </ScrollView>
      )}

      {/* ========== CREATE DISCUSSION MODAL ========== */}
      <Modal
        visible={showCreate}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowCreate(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity
              onPress={() => setShowCreate(false)}
              style={{ padding: 4, marginRight: 12 }}
            >
              <SimpleIcon name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Discussion</Text>
            <View style={{ width: 28 }} />
          </View>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Topic</Text>
              <TextInput
                style={styles.textInput}
                value={topic}
                onChangeText={setTopic}
                placeholder="Topic"
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { minHeight: 100, textAlignVertical: "top" },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Description"
                multiline
              />

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Total Points</Text>
                  <TextInput
                    style={styles.textInput}
                    value={totalMarks}
                    onChangeText={setTotalMarks}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => setShowCategoryModal(true)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dropdownTriggerText,
                        !selectedCategory && styles.dropdownPlaceholder,
                      ]}
                    >
                      {selectedCategory
                        ? selectedCategory.name
                        : "Select a Topic"}
                    </Text>
                    <SimpleIcon
                      name={showCategoryMenu ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#333"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Due Date with quarter hint & validation */}
              <Text style={styles.inputLabel}>Due Date</Text>
              <TouchableOpacity
                style={styles.textInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: dueDate ? "#111" : "#9ca3af" }}>
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
                  <Text style={styles.quarterErrorText}>
                    {quarterDatesError}
                  </Text>
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

              <Text style={styles.inputLabel}>
                Attach Image (PNG, JPEG, JPG)
              </Text>
              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={() => {
                  ImagePicker.launchImageLibrary(
                    { mediaType: "photo" },
                    (res) => {
                      if (res.didCancel || res.errorMessage) return;
                      const asset = res.assets && res.assets[0];
                      if (asset) {
                        setFile({
                          uri: asset.uri,
                          type: asset.type || "image/jpeg",
                          name:
                            asset.fileName ||
                            asset.uri?.split("/").pop() ||
                            "image.jpg",
                        });
                      }
                    }
                  );
                }}
              >
                <Text style={styles.filePickerButtonText}>
                  {file?.name || "Choose image No file chosen"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.createButton, creating && { opacity: 0.7 }]}
                disabled={creating}
                onPress={handleCreateDiscussion}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create Discussion</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreate(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Date Picker with restrictions */}
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
                style={{ alignSelf: "center" }}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={getPickerMinDate()}
                maximumDate={getPickerMaxDate()}
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

          {/* Time Picker */}
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
      </Modal>

      {/* ========== CATEGORY SELECTION MODAL ========== */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
          </View>
        </View>
      </Modal>

      {/* ========== ADD CATEGORY MODAL ========== */}
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
    </View>
  );
};

// ─── Styles (unchanged except adding new quarter‑related styles) ───
const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 10 : 0,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  createButton: {
    backgroundColor: "#10B144",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  createButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  banner: { width: "100%", height: 220, borderRadius: 12 },
  badge: {
    backgroundColor: "#6d28d9",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { color: "#fff", fontWeight: "bold" },
  dueDateLabel: { color: "#64748b", fontWeight: "bold" },
  dueDateValue: { color: "#0f172a", fontWeight: "600" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111", marginTop: 8 },
  link: { color: "#2563eb", textDecorationLine: "underline", marginTop: 4 },
  description: { color: "#334155", marginTop: 4 },
  courseTitle: { marginTop: 4, color: "blue" },
  dateRight: { color: "#94a3b8", textAlign: "right", marginTop: 12 },
  inputLabel: {
    fontWeight: "bold",
    marginBottom: 6,
    color: "#111",
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownTriggerText: { color: "#111" },
  dropdownPlaceholder: { color: "#7b8794" },
  filePickerButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 16,
  },
  filePickerButtonText: { color: "#6b7280" },
  cancelButton: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 12,
  },
  cancelText: { color: "#111", fontWeight: "bold", fontSize: 16 },

  // Quarter hint / error rows
  quarterStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  quarterHint: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 8,
  },
  quarterErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  quarterErrorText: {
    fontSize: 12,
    color: "#b91c1c",
    flex: 1,
  },
  quarterRetryText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
    marginLeft: 8,
  },

  // Modal styles (unchanged)
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
  inputGroup: {
    marginBottom: 16,
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

export default ChapterDiscussionsPage;

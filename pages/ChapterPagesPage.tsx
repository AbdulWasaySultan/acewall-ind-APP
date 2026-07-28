import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Linking,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  getPagesForChapter,
  createPageForChapter,
  deletePage,
  getPagesForLesson,
  createPageForLesson,
} from "../services/page";
import * as ImagePicker from "react-native-image-picker";
import { MediaType } from "react-native-image-picker";
// import {
//   launchCamera,
//   launchImageLibrary,
//   MediaType,
// } from "react-native-image-picker";
import { pick, types } from "@react-native-documents/picker";
import Toast from "react-native-simple-toast";
import SimpleIcon from "../components/SimpleIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
type RouteParams = RouteProp<RootStackParamList, "ChapterPages">;

const ChapterPagesPage = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { courseId, chapterId, lessonId, navigateBack } = route.params as any;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any | null>(null);

  const handleCreatePage = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Validation", "Title and Description are required.");
      return;
    }
    try {
      setSubmitting(true);
      let res;
      if (lessonId) {
        // Create page for lesson
        res = await createPageForLesson(courseId, lessonId, {
          title: title.trim(),
          description: description.trim(),
          image: selectedImage,
          files,
        });
      } else {
        // Create page for chapter
        res = await createPageForChapter(courseId, chapterId, {
          title: title.trim(),
          description: description.trim(),
          image: selectedImage,
          files,
        });
      }
      Toast.show(res.message || "Page created successfully", Toast.LONG);
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setSelectedImage(null);
      setFiles([]);
      // refresh list
      setLoading(true);
      let refreshed;
      if (lessonId) {
        refreshed = await getPagesForLesson(courseId, lessonId);
      } else {
        refreshed = await getPagesForChapter(courseId, chapterId);
      }
      setPages(refreshed.pages || []);
    } catch (err: any) {
      Toast.show(err.message || "Failed to create page", Toast.LONG);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleUploadFile = async () => {
    try {
      const result = await pick({
        type: [types.pdf],
        copyTo: "cachesDirectory",
        allowMultiSelection: false,
      });
      if (result && result.length > 0) {
        const file = result[0];
        setFiles([
          {
            uri: file.uri,
            type: file.type || "application/pdf",
            name: file.name || file.uri.split("/").pop() || "attachment.pdf",
          },
        ]);
      }
    } catch (e) {
      Toast.show("Error picking file", Toast.LONG);
    }
  };

  // const openGallery = () => {
  //   const options = {
  //     mediaType: "photo" as MediaType,
  //     includeBase64: false,
  //     maxHeight: 2000,
  //     maxWidth: 2000,
  //   };

  //   launchImageLibrary(options, (response) => {
  //     if (response.didCancel) {
  //       console.log(`user cancelled the camera`);
  //       return;
  //     } else if (response.errorCode || response.errorMessage) {
  //       console.log(`Camera error:`, response.errorMessage);
  //     } else if (response.assets && response.assets.length > 0) {
  //       setSelectedImage(
  //         response.assets[0].uri ||
  //           response.assets ||
  //           response.assets[0] ||
  //           null
  //       );
  //     }
  //   });
  // };

  // const openCamera = () => {
  //   const options = {
  //     mediaType: "photo" as MediaType,
  //     includeBase64: false,
  //     maxHeight: 2000,
  //     maxWidth: 2000,
  //   };

  //   launchCamera(options, (response) => {
  //     if (response.didCancel) {
  //       console.log("User cancelled image picker");
  //       return;
  //     } else if (response.errorCode) {
  //       console.log("Image picker error: ", response.errorMessage);
  //       return;
  //     } else if (response.assets && response.assets.length > 0) {
  //       setSelectedImage(response.assets[0].uri || null);

  //       //     const asset = res.assets && res.assets[0];
  //       // if (asset) setSelectedImage(asset);
  //     }
  //   });
  // };
  const handleUploadImage = () => {
    const options = {
      mediaType: "photo" as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };
    // Alert.alert(
    //   "Upload Photo",
    //   "Select an option to upload your profile picture",
    //   [
    //     { text: "Cancel" },
    //     {
    //       text: "Take a Photo",
    //       onPress: () => openCamera(),
    //     },
    //     {
    //       text: "Select From Gallery",
    //       onPress: () => openGallery(),
    //     },
    //   ],
    //   { cancelable: true }
    // );
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
        return;
      } else if (response.errorCode) {
        console.log("Image picker error: ", response.errorMessage);
        return;
      } else if (response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0].uri || null);
      }
      // if (res.didCancel || res.errorMessage) return;
      // const asset = res.assets && res.assets[0];
      // if (asset) setSelectedImage(asset);

      //     const asset = res.assets && res.assets[0];
      // if (asset) setSelectedImage(asset);
    });
  };

  const handleDeletePage = (p: any) => {
    Alert.alert("Delete Page", "Are you sure you want to delete this page?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await deletePage(p._id);
            Toast.show(res.message || "Page deleted successfully", Toast.LONG);
            setPages((prev) => prev.filter((pg) => pg._id !== p._id));
            if (showDetails && selectedPage?._id === p._id)
              setShowDetails(false);
          } catch (err: any) {
            Toast.show(err.message || "Failed to delete page", Toast.LONG);
          }
        },
      },
    ]);
  };

  const handleOpenPDF = async (fileUrl?: string) => {
    if (!fileUrl) {
      Alert.alert("Error", "This attachment has no file URL.");
      return;
    }
    try {
      const supported = await Linking.canOpenURL(fileUrl);
      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert("Error", "Cannot open file URL: " + fileUrl);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to open PDF document.");
    }
  };

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        setError(null);
        let res;
        if (lessonId) {
          // Fetch pages for lesson
          res = await getPagesForLesson(courseId, lessonId);
        } else {
          // Fetch pages for chapter
          res = await getPagesForChapter(courseId, chapterId);
        }
        setPages(res.pages || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch pages");
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, [courseId, chapterId, lessonId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() =>
            navigateBack ? navigateBack() : (navigation as any).goBack()
          }
          style={{ padding: 4, marginRight: 12 }}
        >
          <SimpleIcon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pages for chapter</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={{ padding: 16 }}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ Create Page</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#10B144" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {pages.map((p) => (
            <TouchableOpacity
              key={p._id}
              activeOpacity={0.9}
              onPress={() => {
                setSelectedPage(p);
                setShowDetails(true);
              }}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{p.title}</Text>
                <TouchableOpacity onPress={() => handleDeletePage(p)}>
                  <SimpleIcon name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardDescription}>{p.description}</Text>
              {!!p.image?.url && (
                <Image source={{ uri: p.image.url }} style={styles.image} />
              )}
            </TouchableOpacity>
          ))}
          {pages.length === 0 && (
            <Text style={{ textAlign: "center", color: "#6b7280" }}>
              No pages found.
            </Text>
          )}
        </ScrollView>
      )}

      <Modal
        visible={showCreateModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              style={{ padding: 4, marginRight: 12 }}
            >
              <SimpleIcon name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Page</Text>
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
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
              />

              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { minHeight: 100, textAlignVertical: "top" },
                ]}
                value={description}
                onChangeText={setDescription}
                multiline
                placeholder="Description"
              />

              <Text style={styles.inputLabel}>Upload Image (optional)</Text>
              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={handleUploadImage}
              >
                <Text style={styles.filePickerButtonText}>
                  {selectedImage?.fileName || "Choose file No file chosen"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Upload Files (optional)</Text>
              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={handleUploadFile}
              >
                <Text style={styles.filePickerButtonText}>
                  {files.length > 0
                    ? files[0]?.name
                    : "Choose files No file chosen"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.createButton, submitting && { opacity: 0.7 }]}
                disabled={submitting}
                onPress={handleCreatePage}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create Page</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Details Modal */}
      <Modal
        visible={showDetails}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity
              onPress={() => setShowDetails(false)}
              style={{ padding: 4, marginRight: 12 }}
            >
              <SimpleIcon name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {selectedPage?.title || "Details"}
            </Text>
            <View style={{ width: 28 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {!!selectedPage?.image?.url && (
              <Image
                source={{ uri: selectedPage.image.url }}
                style={[styles.image, { height: 260, borderRadius: 16 }]}
              />
            )}
            {selectedPage?.description ? (
              <Text style={{ color: "#374151", fontSize: 16, marginTop: 12 }}>
                {selectedPage.description}
              </Text>
            ) : null}

            {Array.isArray(selectedPage?.files) &&
              selectedPage.files.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      marginBottom: 8,
                    }}
                  >
                    Attachments:
                  </Text>
                  {selectedPage.files.map((f: any, idx: number) => {
                    const fileUrl = f.url || f.uri || f.path;
                    return (
                      <View key={f._id || idx} style={styles.attachmentCard}>
                        <SimpleIcon
                          name="description"
                          size={22}
                          color="#ef4444"
                        />
                        <Text style={styles.attachmentName} numberOfLines={1}>
                          {f.filename || f.name || `File ${idx + 1}`}
                        </Text>
                        <TouchableOpacity
                          style={styles.attachmentViewButton}
                          onPress={() => handleOpenPDF(fileUrl)}
                        >
                          <Text style={styles.attachmentViewButtonText}>
                            View
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    paddingBottom: Platform.OS === "ios" ? 10 : 0,
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#111" },
  cardDescription: { color: "#6b7280", marginBottom: 12 },
  image: { width: "100%", height: 180, borderRadius: 12 },
  attachmentCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: "#f9fafb",
  },
  attachmentName: { flex: 1, marginLeft: 10, color: "#111827", fontSize: 14 },
  attachmentViewButton: {
    backgroundColor: "#10B144",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  attachmentViewButtonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  inputLabel: { fontWeight: "bold", marginBottom: 6, color: "#111" },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
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
});

export default ChapterPagesPage;

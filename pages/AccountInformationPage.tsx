import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Linking,
  Modal,
} from "react-native";
import {
  launchImageLibrary,
  ImagePickerResponse,
  ImageLibraryOptions,
} from "react-native-image-picker";
import Toast from "react-native-simple-toast";
import { pick } from "@react-native-documents/picker";
import {
  getUserInfo,
  uploadProfileImage,
  updateUserProfile,
  UpdateUserProfileData,
  uploadDocument,
  deleteDocument,
  deleteUserAccount,
} from "../services/schoolService";
import { useAuth } from "../contexts/AuthContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useUser } from "../contexts/UserContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import SimpleIcon from "../components/SimpleIcon";
export interface Document {
  name: string;
  url: string;
  filename: string;
  verificationStatus: string;
  _id: string;
}

export interface Documents {
  ids: Document[];
  portfolio: Document[];
  resume: Document[];
  teacherLicenses: Document[];
  universityTranscripts: Document[];
}

export interface UserData {
  firstName: string;
  middleName: string;
  lastName: string;
  Bio: string;
  pronoun: string;
  gender: string;
  email: string;
  phone: string;
  homeAddressLine1: string;
  homeAddressLine2: string;
  homeCity: string;
  homeState: string;
  homeZip: string;
  mailingAddressLine1: string;
  mailingAddressLine2: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  profileImage?: string;
  isVarified: boolean;
  documents?: Documents;
  role: "teacher" | "student" | string;
}

const AccountInformationPage = () => {
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    middleName: "",
    lastName: "",
    Bio: "",
    pronoun: "",
    gender: "",
    email: "",
    phone: "",
    homeAddressLine1: "",
    homeAddressLine2: "",
    homeCity: "",
    homeState: "",
    homeZip: "",
    mailingAddressLine1: "",
    mailingAddressLine2: "",
    mailingCity: "",
    mailingState: "",
    mailingZip: "",
    role: "",
    isVarified: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [documents, setDocuments] = useState<Documents>({
    ids: [],
    portfolio: [],
    resume: [],
    teacherLicenses: [],
    universityTranscripts: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({
    ids: false,
    portfolio: false,
    resume: false,
    teacherLicenses: false,
    universityTranscripts: false,
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{
    id: string;
    name: string;
    category: string;
  } | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, setUser } = useUser();
  const { logout } = useAuth();
  const [showAccountDeleteModal, setShowAccountDeleteModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAndLoadUserInfo();
    }, [user])
  );

  const fetchAndLoadUserInfo = async () => {
    setIsLoading(true);
    try {
      const response = await getUserInfo();
      console.log(response);
      if (response && response.user) {
        // Parse address fields - assuming they come as comma-separated strings
        const parseAddress = (addressString: string) => {
          if (!addressString)
            return { line1: "", line2: "", city: "", state: "", zip: "" };
          const parts = addressString.split(",").map((part) => part.trim());
          return {
            line1: parts[0] || "",
            line2: parts[1] || "",
            city: parts[2] || "",
            state: parts[3] || "",
            zip: parts[4] || "",
          };
        };

        const homeAddress = parseAddress(response.user.homeAddress || "");
        const mailingAddress = parseAddress(response.user.mailingAddress || "");

        setUserData({
          firstName: response.user.firstName || "",
          middleName: response.user.middleName || "",
          lastName: response.user.lastName || "",
          Bio: response.user.Bio || "",
          pronoun: response.user.pronoun || "",
          gender: response.user.gender || "",
          email: response.user.email || "",
          phone: response.user.phone || "",
          homeAddressLine1: homeAddress.line1,
          homeAddressLine2: homeAddress.line2,
          homeCity: homeAddress.city,
          homeState: homeAddress.state,
          homeZip: homeAddress.zip,
          mailingAddressLine1: mailingAddress.line1,
          mailingAddressLine2: mailingAddress.line2,
          mailingCity: mailingAddress.city,
          mailingState: mailingAddress.state,
          mailingZip: mailingAddress.zip,
          profileImage: response.user.profileImg?.url || undefined,
          isVarified: response.user.isVarified || false,
          role: response.user.role,
        });
        setProfileImageUri(response.user.profileImg?.url || null);

        // Load documents if available
        if (response.user.documents) {
          setDocuments({
            ids: response.user.documents.ids || [],
            portfolio: response.user.documents.portfolio || [],
            resume: response.user.documents.resume || [],
            teacherLicenses: response.user.documents.teacherLicenses || [],
            universityTranscripts:
              response.user.documents.universityTranscripts || [],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      Toast.show("Failed to fetch user info", Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      includeBase64: true,
      maxHeight: 200,
      maxWidth: 200,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        console.log("ImagePicker Error: ", response.errorMessage);
        Toast.show("Failed to pick image", Toast.LONG);
      } else if (response.assets && response.assets[0].uri) {
        setProfileImageUri(response.assets[0].uri);
        setIsImageChanged(true);
      }
    });
  };

  const handleSaveImage = async () => {
    if (!profileImageUri) return;
    setIsLoading(true);
    try {
      await uploadProfileImage(profileImageUri);
      // Always fetch latest user info after upload
      const latestUserInfo = await getUserInfo();
      setUser(latestUserInfo.user);
      // Parse address fields
      const parseAddress = (addressString: string) => {
        if (!addressString)
          return { line1: "", line2: "", city: "", state: "", zip: "" };
        const parts = addressString.split(",").map((part) => part.trim());
        return {
          line1: parts[0] || "",
          line2: parts[1] || "",
          city: parts[2] || "",
          state: parts[3] || "",
          zip: parts[4] || "",
        };
      };

      const homeAddress = parseAddress(latestUserInfo.user.homeAddress || "");
      const mailingAddress = parseAddress(
        latestUserInfo.user.mailingAddress || ""
      );

      setUserData({
        firstName: latestUserInfo.user.firstName || "",
        middleName: latestUserInfo.user.middleName || "",
        lastName: latestUserInfo.user.lastName || "",
        Bio: latestUserInfo.user.Bio || "",
        pronoun: latestUserInfo.user.pronoun || "",
        gender: latestUserInfo.user.gender || "",
        email: latestUserInfo.user.email || "",
        phone: latestUserInfo.user.phone || "",
        homeAddressLine1: homeAddress.line1,
        homeAddressLine2: homeAddress.line2,
        homeCity: homeAddress.city,
        homeState: homeAddress.state,
        homeZip: homeAddress.zip,
        mailingAddressLine1: mailingAddress.line1,
        mailingAddressLine2: mailingAddress.line2,
        mailingCity: mailingAddress.city,
        mailingState: mailingAddress.state,
        mailingZip: mailingAddress.zip,
        profileImage: latestUserInfo.user.profileImg?.url || undefined,
        isVarified: latestUserInfo.user.isVarified || false,
        role: latestUserInfo.user.role,
      });
      setProfileImageUri(latestUserInfo.user.profileImg?.url || null);
      setIsImageChanged(false);
      Toast.show("Profile image updated successfully!", Toast.LONG);
    } catch (error) {
      console.error("Error uploading profile image:", error);
      let errorMessage = "Failed to upload image";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Toast.show(errorMessage, Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDisplayValue = (value: string) => {
    return value && value.trim() ? value : "—";
  };

  const handleEditInfo = () => {
    setIsEditMode(true);
  };

  const handleEditCredentials = () => {
    navigation.navigate("EditCredentials", { userData: userData });
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const updateData: UpdateUserProfileData = {
        firstName: userData.firstName,
        middleName: userData.middleName,
        lastName: userData.lastName,
        Bio: userData.Bio,
        pronoun: userData?.pronoun || null,
        gender: userData?.gender || null,
        phone: userData.phone,
        email: userData.email,
        homeAddressLine1: userData.homeAddressLine1,
        homeAddressLine2: userData.homeAddressLine2,
        homeCity: userData.homeCity,
        homeState: userData.homeState,
        homeZip: userData.homeZip,
        mailingAddressLine1: userData.mailingAddressLine1,
        mailingAddressLine2: userData.mailingAddressLine2,
        mailingCity: userData.mailingCity,
        mailingState: userData.mailingState,
        mailingZip: userData.mailingZip,
        profileImage: userData.profileImage,
      };

      await updateUserProfile(updateData);
      setIsEditMode(false);
      Toast.show("Profile updated successfully!", Toast.LONG);
    } catch (error) {
      console.error("Error saving changes:", error);
      Toast.show("Failed to save changes", Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reload original data
    fetchAndLoadUserInfo();
  };

  const handleFilePick = async () => {
    try {
      const result = await pick({
        type: ["application/pdf", "image/*"],
        copyTo: "cachesDirectory",
      });
      if (result && result.length > 0) {
        const file = result[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name || file.uri.split("/").pop() || "document",
          type: file.type || "application/pdf",
        });
      }
    } catch (error) {
      console.error("Error picking file:", error);
      Toast.show("Failed to pick file", Toast.LONG);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      Toast.show("Please select a file first", Toast.LONG);
      return;
    }

    if (!selectedCategory) {
      Toast.show("Please select a document category first", Toast.LONG);
      return;
    }

    setIsLoading(true);
    try {
      // Map category display names to API category names
      const categoryMap: { [key: string]: string } = {
        "Identification Documents": "ids",
        Portfolio: "portfolio",
        "Resume / CV": "resume",
        "Teacher Licenses / Certifications": "teacherLicenses",
        "University Transcripts": "universityTranscripts",
      };

      const apiCategory = categoryMap[selectedCategory] || selectedCategory;

      await uploadDocument(
        selectedFile.uri,
        selectedFile.name,
        selectedFile.type,
        apiCategory
      );

      // Refresh user info to get updated documents
      await fetchAndLoadUserInfo();
      setSelectedFile(null);
      setSelectedCategory("");
      Toast.show("Document uploaded successfully!", Toast.LONG);
    } catch (error: any) {
      console.error("Error uploading document:", error);
      Toast.show(error.message || "Failed to upload document", Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (
    documentId: string,
    documentName: string,
    category: string
  ) => {
    setDocumentToDelete({ id: documentId, name: documentName, category });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    setIsLoading(true);
    try {
      // Map category display names to API category names
      const categoryMap: { [key: string]: string } = {
        "Identification Documents": "ids",
        Portfolio: "portfolio",
        "Resume / CV": "resume",
        "Teacher Licenses / Certifications": "teacherLicenses",
        "University Transcripts": "universityTranscripts",
      };

      const apiCategory =
        categoryMap[documentToDelete.category] || documentToDelete.category;

      await deleteDocument(documentToDelete.id, apiCategory);

      // Refresh user info to get updated documents
      await fetchAndLoadUserInfo();
      setShowDeleteModal(false);
      setDocumentToDelete(null);
      Toast.show("Document deleted successfully!", Toast.LONG);
    } catch (error: any) {
      console.error("Error deleting document:", error);
      Toast.show(error.message || "Failed to delete document", Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };

  const handleViewDocument = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error("Error opening document:", err);
      Toast.show("Failed to open document", Toast.LONG);
    });
  };

  const handleConfirmAccountDelete = async () => {
    setIsLoading(true);
    try {
      await deleteUserAccount();
      Toast.show("Account deleted successfully", Toast.LONG);
      setShowAccountDeleteModal(false);
      await logout();
    } catch (error: any) {
      console.error("Error deleting account:", error);
      Toast.show(error.message || "Failed to delete account", Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  const getCategoryDocuments = (categoryKey: string): Document[] => {
    const categoryMap: { [key: string]: keyof Documents } = {
      "Identification Documents": "ids",
      Portfolio: "portfolio",
      "Resume / CV": "resume",
      "Teacher Licenses / Certifications": "teacherLicenses",
      "University Transcripts": "universityTranscripts",
    };

    const apiCategory = categoryMap[categoryKey];
    return apiCategory ? documents[apiCategory] : [];
  };

  const getRequiredCount = (categoryKey: string): number => {
    const requiredCounts: { [key: string]: number } = {
      "Identification Documents": 2,
      Portfolio: 1,
      "Resume / CV": 2,
      "Teacher Licenses / Certifications": 4,
      "University Transcripts": 4,
    };
    return requiredCounts[categoryKey] || 0;
  };

  return (
    <ScrollView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <Text style={styles.header}>Account Information</Text>
        {userData?.role === "teacher" && (
          <View
            style={{
              padding: 5,
              backgroundColor: userData.isVarified ? "#D1FAE5" : "#FEE2E2",
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                textAlign: "right",
                color: userData?.isVarified ? "#065F46" : "#991B1B",
              }}
            >
              {userData.isVarified ? "Verfied" : "Not Verified"}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {!isEditMode && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditInfo}>
            <Text style={styles.editButtonText}>Edit Info</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditCredentials}
          >
            <Text style={styles.editButtonText}>Edit Credentials</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Image Section */}
      <Text style={styles.sectionTitle}>Profile Image</Text>
      <View style={styles.profileImageContainer}>
        {/* Avatar with image picker */}
        <TouchableOpacity onPress={handleImagePick} disabled={isLoading}>
          {profileImageUri || userData.profileImage ? (
            <Image
              source={{ uri: profileImageUri || userData.profileImage }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          )}
          <SimpleIcon
            name="edit"
            size={22}
            color={"#fff"}
            style={{ position: "absolute", bottom: 20, right: 10 }}
          />
        </TouchableOpacity>
        {isImageChanged && (
          <TouchableOpacity
            style={styles.imageSaveButton}
            onPress={handleSaveImage}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.imageSaveButtonText}>Save Image</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Personal Information Section */}
      <Text style={styles.sectionTitle}>Personal Information</Text>
      {isEditMode ? (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              value={userData.firstName}
              onChangeText={(text) =>
                setUserData({ ...userData, firstName: text })
              }
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Middle Name</Text>
            <TextInput
              style={styles.input}
              value={userData.middleName}
              onChangeText={(text) =>
                setUserData({ ...userData, middleName: text })
              }
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={userData.lastName}
              onChangeText={(text) =>
                setUserData({ ...userData, lastName: text })
              }
            />
          </View>
          {userData?.role === "teacher" && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={styles.textArea}
                value={userData.Bio}
                onChangeText={(text) => setUserData({ ...userData, Bio: text })}
                multiline
                numberOfLines={4}
                placeholder="Write your bio here..."
              />
            </View>
          )}
        </>
      ) : (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>First Name:</Text>
            <Text style={styles.infoValue}>
              {formatDisplayValue(userData.firstName)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Middle Name:</Text>
            <Text style={styles.infoValue}>
              {formatDisplayValue(userData.middleName)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Name:</Text>
            <Text style={styles.infoValue}>
              {formatDisplayValue(userData.lastName)}
            </Text>
          </View>
          {userData?.role === "teacher" && (
            <View style={[styles.infoRow, { alignItems: "flex-start" }]}>
              <Text style={styles.infoLabel}>Bio:</Text>
              <Text style={[styles.infoValue]}>
                {formatDisplayValue(userData.Bio)}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Identity Information Section */}
      <Text style={styles.sectionTitle}>Identity Information</Text>
      {isEditMode ? (
        <>
          <View style={styles.radioGroup}>
            <Text style={styles.radioLabel}>Preferred Pronouns</Text>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, pronoun: "he/him" })}
            >
              <Text style={styles.radioIcon}>
                {userData.pronoun === "he/him" ? "◉" : "○"}
              </Text>
              <Text>He/Him</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, pronoun: "she/her" })}
            >
              <Text style={styles.radioIcon}>
                {userData.pronoun === "she/her" ? "◉" : "○"}
              </Text>
              <Text>She/Her</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, pronoun: "they/them" })}
            >
              <Text style={styles.radioIcon}>
                {userData.pronoun === "they/them" ? "◉" : "○"}
              </Text>
              <Text>They/Them</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, pronoun: "others" })}
            >
              <Text style={styles.radioIcon}>
                {userData.pronoun === "others" ? "◉" : "○"}
              </Text>
              <Text>Others</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() =>
                setUserData({ ...userData, pronoun: "prefer not to say" })
              }
            >
              <Text style={styles.radioIcon}>
                {userData.pronoun === "prefer not to say" ? "◉" : "○"}
              </Text>
              <Text>Prefer not to say</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.radioGroup}>
            <Text style={styles.radioLabel}>Gender Identity</Text>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, gender: "male" })}
            >
              <Text style={styles.radioIcon}>
                {userData.gender === "male" ? "◉" : "○"}
              </Text>
              <Text>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, gender: "female" })}
            >
              <Text style={styles.radioIcon}>
                {userData.gender === "female" ? "◉" : "○"}
              </Text>
              <Text>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, gender: "non-binary" })}
            >
              <Text style={styles.radioIcon}>
                {userData.gender === "non-binary" ? "◉" : "○"}
              </Text>
              <Text>Non-binary</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, gender: "other" })}
            >
              <Text style={styles.radioIcon}>
                {userData.gender === "other" ? "◉" : "○"}
              </Text>
              <Text>Other</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() =>
                setUserData({ ...userData, gender: "prefer not to say" })
              }
            >
              <Text style={styles.radioIcon}>
                {userData.gender === "prefer not to say" ? "◉" : "○"}
              </Text>
              <Text>Prefer not to say</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Preferred Pronouns:</Text>
            <Text style={styles.infoValue}>
              {formatDisplayValue(userData.pronoun)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender Identity:</Text>
            <Text style={styles.infoValue}>
              {formatDisplayValue(userData.gender)}
            </Text>
          </View>
        </>
      )}

      {/* Contact Information Section */}
      {isEditMode ? (
        <>
          {/* <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={userData.phone}
              onChangeText={(text) => setUserData({ ...userData, phone: text })}
              keyboardType="phone-pad"
            />
          </View> */}
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Address:</Text>
            <Text style={styles.infoValue}>
              {formatDisplayValue(userData.email)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number:</Text>
            <Text style={styles.infoValue}>
              {formatDisplayValue(userData.phone)}
            </Text>
          </View>
        </>
      )}

      {/* Address Information Section */}
      <Text style={styles.sectionTitle}>Address Information</Text>
      {isEditMode ? (
        <>
          {/* Home Address */}
          <Text style={styles.subSectionTitle}>Home Address</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userData.homeAddressLine1}
              onChangeText={(text) =>
                setUserData({ ...userData, homeAddressLine1: text })
              }
              placeholder="Address Line 1"
              placeholderTextColor="#000"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userData.homeAddressLine2}
              onChangeText={(text) =>
                setUserData({ ...userData, homeAddressLine2: text })
              }
              placeholder="Address Line 2 (Optional)"
              placeholderTextColor="#000"
            />
          </View>
          <View style={styles.addressRow}>
            <View style={styles.addressField}>
              <TextInput
                style={styles.input}
                value={userData.homeCity}
                onChangeText={(text) =>
                  setUserData({ ...userData, homeCity: text })
                }
                placeholder="City / Town"
                placeholderTextColor="#000"
              />
            </View>
            <View style={styles.addressField}>
              <TextInput
                style={styles.input}
                value={userData.homeState}
                onChangeText={(text) =>
                  setUserData({ ...userData, homeState: text })
                }
                placeholder="State / Province"
                placeholderTextColor="#000"
              />
            </View>
            <View style={styles.addressField}>
              <TextInput
                style={styles.input}
                value={userData.homeZip}
                onChangeText={(text) =>
                  setUserData({ ...userData, homeZip: text })
                }
                placeholder="ZIP / Postal"
                placeholderTextColor="#000"
              />
            </View>
          </View>

          {/* Mailing Address */}
          <Text style={styles.subSectionTitle}>
            Mailing Address (if different)
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userData.mailingAddressLine1}
              onChangeText={(text) =>
                setUserData({ ...userData, mailingAddressLine1: text })
              }
              placeholder="Address Line 1"
              placeholderTextColor="#000"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userData.mailingAddressLine2}
              onChangeText={(text) =>
                setUserData({ ...userData, mailingAddressLine2: text })
              }
              placeholder="Address Line 2 (Optional)"
              placeholderTextColor="#000"
            />
          </View>
          <View style={styles.addressRow}>
            <View style={styles.addressField}>
              <TextInput
                style={styles.input}
                value={userData.mailingCity}
                onChangeText={(text) =>
                  setUserData({ ...userData, mailingCity: text })
                }
                placeholder="City / Town"
                placeholderTextColor="#000"
              />
            </View>
            <View style={styles.addressField}>
              <TextInput
                style={styles.input}
                value={userData.mailingState}
                onChangeText={(text) =>
                  setUserData({ ...userData, mailingState: text })
                }
                placeholder="State / Province"
                placeholderTextColor="#000"
              />
            </View>
            <View style={styles.addressField}>
              <TextInput
                style={styles.input}
                value={userData.mailingZip}
                onChangeText={(text) =>
                  setUserData({ ...userData, mailingZip: text })
                }
                placeholder="ZIP / Postal"
                placeholderTextColor="#000"
              />
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Home Address:</Text>
            <Text style={styles.infoValue}>
              {formatDisplayValue(
                `${userData.homeAddressLine1}, ${userData.homeAddressLine2}, ${userData.homeCity}, ${userData.homeState}, ${userData.homeZip}`
              )}
            </Text>
          </View>
          <View style={styles.infoRoww}>
            <Text style={styles.infoLabel}>Mailing Address:</Text>
            <Text style={styles.infoValue}>
              {formatDisplayValue(
                `${userData.mailingAddressLine1}, ${userData.mailingAddressLine2}, ${userData.mailingCity}, ${userData.mailingState}, ${userData.mailingZip}`
              )}
            </Text>
          </View>
        </>
      )}

      {/* Uploaded Documents Section - Only show when edit mode is off */}
      {!isEditMode && userData?.role === "teacher" && (
        <>
          <Text style={styles.sectionTitle}>Uploaded Documents</Text>

          {/* Document Upload Interface */}
          <View style={styles.uploadContainer}>
            <View style={styles.uploadRow}>
              {/* Category Dropdown */}
              <View style={styles.categoryDropdownContainer}>
                <Text style={styles.dropdownLabel}>
                  Select Document Category
                </Text>
                <TouchableOpacity
                  style={styles.categoryDropdown}
                  onPress={() => setShowCategoryDropdown(true)}
                >
                  <Text
                    style={[
                      styles.categoryDropdownText,
                      !selectedCategory && styles.categoryDropdownPlaceholder,
                    ]}
                  >
                    {selectedCategory || "Select Document Category"}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                <Modal
                  visible={showCategoryDropdown}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowCategoryDropdown(false)}
                >
                  <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCategoryDropdown(false)}
                  >
                    <View style={styles.modalContent}>
                      {[
                        "Identification Documents",
                        "Portfolio",
                        "Resume / CV",
                        "Teacher Licenses / Certifications",
                        "University Transcripts",
                      ].map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.modalOption,
                            selectedCategory === cat &&
                              styles.modalOptionSelected,
                          ]}
                          onPress={() => {
                            setSelectedCategory(cat);
                            setShowCategoryDropdown(false);
                          }}
                        >
                          <Text
                            style={
                              selectedCategory === cat &&
                              styles.modalOptionTextSelected
                            }
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

              {/* File Input */}
              <View style={styles.fileInputContainer}>
                <TouchableOpacity
                  style={styles.fileInputButton}
                  onPress={handleFilePick}
                >
                  <Text style={styles.fileInputText}>
                    {selectedFile
                      ? selectedFile.name
                      : "Choose files No file chosen"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Upload Button */}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadDocument}
              disabled={isLoading || !selectedFile || !selectedCategory}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.uploadButtonText}>Upload Document(s)</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Document Categories List */}
          <View style={styles.documentsList}>
            {[
              "Identification Documents",
              "Portfolio",
              "Resume / CV",
              "Teacher Licenses / Certifications",
              "University Transcripts",
            ].map((categoryKey) => {
              const categoryDocs = getCategoryDocuments(categoryKey);
              const requiredCount = getRequiredCount(categoryKey);
              const uploadedCount = categoryDocs.length;
              const isExpanded = expandedCategories[categoryKey] || false;
              const categoryMap: { [key: string]: keyof Documents } = {
                "Identification Documents": "ids",
                Portfolio: "portfolio",
                "Resume / CV": "resume",
                "Teacher Licenses / Certifications": "teacherLicenses",
                "University Transcripts": "universityTranscripts",
              };
              const apiCategory = categoryMap[categoryKey];

              return (
                <View key={categoryKey} style={styles.categoryCard}>
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(categoryKey)}
                  >
                    <Text style={styles.categoryTitle}>
                      {categoryKey} ({uploadedCount}/{requiredCount})
                    </Text>
                    <Text style={styles.expandIcon}>
                      {isExpanded ? "▲" : "▼"}
                    </Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.categoryContent}>
                      {categoryDocs.length > 0 ? (
                        categoryDocs.map((doc) => (
                          <View key={doc._id} style={styles.documentItem}>
                            <Text style={styles.documentName}>{doc.name}</Text>
                            <View style={styles.documentActions}>
                              <TouchableOpacity
                                onPress={() => handleViewDocument(doc.url)}
                              >
                                <Text style={styles.viewLink}>View</Text>
                              </TouchableOpacity>
                              <View
                                style={[
                                  styles.statusBadge,
                                  doc.verificationStatus === "pending" &&
                                    styles.statusPending,
                                  doc.verificationStatus === "approved" &&
                                    styles.statusApproved,
                                  doc.verificationStatus === "rejected" &&
                                    styles.statusRejected,
                                ]}
                              >
                                <Text style={styles.statusText}>
                                  {doc.verificationStatus}
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() =>
                                  handleDeleteClick(
                                    doc._id,
                                    doc.name,
                                    categoryKey
                                  )
                                }
                                disabled={isLoading}
                              >
                                <Text style={styles.deleteIcon}>🗑️</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.emptyMessage}>
                          No documents uploaded yet
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
            {/* Delete Account Button */}
            <View style={{ marginTop: 20, marginBottom: 40 }}>
              <TouchableOpacity
                style={styles.deleteAccountButton}
                onPress={() => setShowAccountDeleteModal(true)}
                disabled={isLoading}
              >
                <Text style={styles.deleteAccountButtonText}>
                  Delete Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* Save/Cancel Buttons for Edit Mode */}
      {isEditMode && (
        <View style={styles.editButtonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelEdit}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveChanges}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Confirm Delete</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete{" "}
              <Text style={styles.deleteModalBold}>
                {documentToDelete?.name}
              </Text>{" "}
              from{" "}
              <Text style={styles.deleteModalBold}>
                {documentToDelete?.category}
              </Text>
              ?
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={handleCancelDelete}
                disabled={isLoading}
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalDeleteButton}
                onPress={handleConfirmDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteModalDeleteText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Account Delete Confirmation Modal */}
      <Modal
        visible={showAccountDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAccountDeleteModal(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete Account</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete your account? This action is{" "}
              <Text style={styles.deleteModalBold}>permanent</Text> and cannot
              be undone. All your data will be deleted.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={() => setShowAccountDeleteModal(false)}
                disabled={isLoading}
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalDeleteButton}
                onPress={handleConfirmAccountDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteModalDeleteText}>
                    Delete Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 50,
    color: "#666",
  },
  uploadText: {
    fontSize: 16,
    marginBottom: 8,
  },
  chooseFileButton: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    alignItems: "center",
  },
  chooseFileButtonText: {
    marginRight: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoRoww: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: "#000",
    flex: 1,
    textAlign: "right",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
    marginBottom: 12,
  },
  imageSaveButton: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 8,
  },
  imageSaveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 80,
    textAlignVertical: "top",
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radioIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 24,
    gap: 12,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  editButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 44,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#000",
  },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  addressField: {
    flex: 1,
  },
  // Document Upload Styles
  uploadContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  uploadRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    alignItems: "flex-end",
  },
  categoryDropdownContainer: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  categoryDropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    backgroundColor: "#fff",
  },
  categoryDropdownText: {
    fontSize: 14,
    color: "#000",
    flex: 1,
  },
  categoryDropdownPlaceholder: {
    color: "#999",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  fileInputContainer: {
    flex: 1,
  },
  fileInputButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    backgroundColor: "#fff",
    marginTop: 20,
  },
  fileInputText: {
    fontSize: 14,
    color: "#666",
  },
  uploadButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  documentsList: {
    marginTop: 8,
    marginBlock: 24,
  },
  categoryCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  expandIcon: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  categoryContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  documentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  documentName: {
    fontSize: 14,
    color: "#000",
    flex: 1,
  },
  documentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  viewLink: {
    color: "#2196F3",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: "center",
  },
  statusPending: {
    backgroundColor: "#FFF3CD",
  },
  statusApproved: {
    backgroundColor: "#D1FAE5",
  },
  statusRejected: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000",
    textTransform: "capitalize",
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 18,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
  },
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
    minWidth: 280,
    maxWidth: "80%",
  },
  modalOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalOptionSelected: {
    backgroundColor: "#E3F2FD",
  },
  modalOptionTextSelected: {
    fontWeight: "600",
    color: "#2196F3",
  },
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    minWidth: 300,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: "#000",
    marginBottom: 24,
    lineHeight: 22,
  },
  deleteModalBold: {
    fontWeight: "bold",
  },
  deleteModalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  deleteModalCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  deleteModalCancelText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  deleteModalDeleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: "#f44336",
  },
  deleteModalDeleteText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  deleteAccountButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteAccountButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AccountInformationPage;

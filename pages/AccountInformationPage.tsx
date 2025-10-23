import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { launchImageLibrary, ImagePickerResponse, ImageLibraryOptions } from 'react-native-image-picker';
import Toast from 'react-native-simple-toast';
import { getUserInfo, uploadProfileImage, updateUserProfile, UpdateUserProfileData } from '../services/schoolService';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';

interface UserData {
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
}

const AccountInformationPage = () => {
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    middleName: '',
    lastName: '',
    Bio: '',
    pronoun: '',
    gender: '',
    email: '',
    phone: '',
    homeAddressLine1: '',
    homeAddressLine2: '',
    homeCity: '',
    homeState: '',
    homeZip: '',
    mailingAddressLine1: '',
    mailingAddressLine2: '',
    mailingCity: '',
    mailingState: '',
    mailingZip: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigation = useNavigation();
  const { user, setUser } = useUser();

  useEffect(() => {
    fetchAndLoadUserInfo();
  }, []);

  const fetchAndLoadUserInfo = async () => {
    setIsLoading(true);
    try {
      const response = await getUserInfo();
      console.log(response);
      if (response && response.user) {
        // Parse address fields - assuming they come as comma-separated strings
        const parseAddress = (addressString: string) => {
          if (!addressString) return { line1: '', line2: '', city: '', state: '', zip: '' };
          const parts = addressString.split(',').map(part => part.trim());
          return {
            line1: parts[0] || '',
            line2: parts[1] || '',
            city: parts[2] || '',
            state: parts[3] || '',
            zip: parts[4] || '',
          };
        };

        const homeAddress = parseAddress(response.user.homeAddress || '');
        const mailingAddress = parseAddress(response.user.mailingAddress || '');

        setUserData({
          firstName: response.user.firstName || '',
          middleName: response.user.middleName || '',
          lastName: response.user.lastName || '',
          Bio: response.user.Bio || '',
          pronoun: response.user.pronoun || '',
          gender: response.user.gender || '',
          email: response.user.email || '',
          phone: response.user.phone || '',
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
        });
        setProfileImageUri(response.user.profileImg?.url || null);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      Toast.show('Failed to fetch user info', Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 200,
      maxWidth: 200,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Toast.show('Failed to pick image', Toast.LONG);
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
        if (!addressString) return { line1: '', line2: '', city: '', state: '', zip: '' };
        const parts = addressString.split(',').map(part => part.trim());
        return {
          line1: parts[0] || '',
          line2: parts[1] || '',
          city: parts[2] || '',
          state: parts[3] || '',
          zip: parts[4] || '',
        };
      };

      const homeAddress = parseAddress(latestUserInfo.user.homeAddress || '');
      const mailingAddress = parseAddress(latestUserInfo.user.mailingAddress || '');

      setUserData({
        firstName: latestUserInfo.user.firstName || '',
        middleName: latestUserInfo.user.middleName || '',
        lastName: latestUserInfo.user.lastName || '',
        Bio: latestUserInfo.user.Bio || '',
        pronoun: latestUserInfo.user.pronoun || '',
        gender: latestUserInfo.user.gender || '',
        email: latestUserInfo.user.email || '',
        phone: latestUserInfo.user.phone || '',
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
      });
      setProfileImageUri(latestUserInfo.user.profileImg?.url || null);
      setIsImageChanged(false);
      Toast.show('Profile image updated successfully!', Toast.LONG);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      let errorMessage = 'Failed to upload image';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Toast.show(errorMessage, Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDisplayValue = (value: string) => {
    return value && value.trim() ? value : '—';
  };


  const handleEditInfo = () => {
    setIsEditMode(true);
  };

  const handleEditCredentials = () => {
    navigation.navigate('EditCredentials' as never);
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const updateData: UpdateUserProfileData = {
        firstName: userData.firstName,
        middleName: userData.middleName,
        lastName: userData.lastName,
        Bio: userData.Bio,
        pronoun: userData.pronoun,
        gender: userData.gender,
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
      Toast.show('Profile updated successfully!', Toast.LONG);
    } catch (error) {
      console.error('Error saving changes:', error);
      Toast.show('Failed to save changes', Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reload original data
    fetchAndLoadUserInfo();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Account Information</Text>

      {/* Action Buttons */}
      {!isEditMode && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditInfo}>
            <Text style={styles.editButtonText}>Edit Info</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={handleEditCredentials}>
            <Text style={styles.editButtonText}>Edit Credentials</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Image Section */}
      <Text style={styles.sectionTitle}>Profile Image</Text>
      <View style={styles.profileImageContainer}>
        {/* Avatar with image picker */}
        <TouchableOpacity onPress={handleImagePick} disabled={isLoading}>
          {(profileImageUri || userData.profileImage) ? (
            <Image source={{ uri: profileImageUri || userData.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          )}
        </TouchableOpacity>
        {isImageChanged && (
          <TouchableOpacity style={styles.imageSaveButton} onPress={handleSaveImage} disabled={isLoading}>
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
              onChangeText={(text) => setUserData({ ...userData, firstName: text })}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Middle Name</Text>
            <TextInput
              style={styles.input}
              value={userData.middleName}
              onChangeText={(text) => setUserData({ ...userData, middleName: text })}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={userData.lastName}
              onChangeText={(text) => setUserData({ ...userData, lastName: text })}
            />
          </View>
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
        </>
      ) : (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>First Name:</Text>
            <Text style={styles.infoValue}>{formatDisplayValue(userData.firstName)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Middle Name:</Text>
            <Text style={styles.infoValue}>{formatDisplayValue(userData.middleName)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Name:</Text>
            <Text style={styles.infoValue}>{formatDisplayValue(userData.lastName)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bio:</Text>
            <Text style={styles.infoValue}>{formatDisplayValue(userData.Bio)}</Text>
          </View>
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
              onPress={() => setUserData({ ...userData, pronoun: 'he/him' })}
            >
              <Text style={styles.radioIcon}>{userData.pronoun === 'he/him' ? '◉' : '○'}</Text>
              <Text>He/Him</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, pronoun: 'she/her' })}
            >
              <Text style={styles.radioIcon}>{userData.pronoun === 'she/her' ? '◉' : '○'}</Text>
              <Text>She/Her</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, pronoun: 'they/them' })}
            >
              <Text style={styles.radioIcon}>{userData.pronoun === 'they/them' ? '◉' : '○'}</Text>
              <Text>They/Them</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, pronoun: 'others' })}
            >
              <Text style={styles.radioIcon}>{userData.pronoun === 'others' ? '◉' : '○'}</Text>
              <Text>Others</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, pronoun: 'prefer not to say' })}
            >
              <Text style={styles.radioIcon}>{userData.pronoun === 'prefer not to say' ? '◉' : '○'}</Text>
              <Text>Prefer not to say</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.radioGroup}>
            <Text style={styles.radioLabel}>Gender Identity</Text>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, gender: 'male' })}
            >
              <Text style={styles.radioIcon}>{userData.gender === 'male' ? '◉' : '○'}</Text>
              <Text>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, gender: 'female' })}
            >
              <Text style={styles.radioIcon}>{userData.gender === 'female' ? '◉' : '○'}</Text>
              <Text>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, gender: 'non-binary' })}
            >
              <Text style={styles.radioIcon}>{userData.gender === 'non-binary' ? '◉' : '○'}</Text>
              <Text>Non-binary</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, gender: 'other' })}
            >
              <Text style={styles.radioIcon}>{userData.gender === 'other' ? '◉' : '○'}</Text>
              <Text>Other</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setUserData({ ...userData, gender: 'prefer not to say' })}
            >
              <Text style={styles.radioIcon}>{userData.gender === 'prefer not to say' ? '◉' : '○'}</Text>
              <Text>Prefer not to say</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Preferred Pronouns:</Text>
            <Text style={styles.infoValue}>{formatDisplayValue(userData.pronoun)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender Identity:</Text>
            <Text style={styles.infoValue}>{formatDisplayValue(userData.gender)}</Text>
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
            <Text style={styles.infoValue}>{formatDisplayValue(userData.email)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number:</Text>
            <Text style={styles.infoValue}>{formatDisplayValue(userData.phone)}</Text>
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
              onChangeText={(text) => setUserData({ ...userData, homeAddressLine1: text })}
              placeholder="Address Line 1"
              placeholderTextColor="#000"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userData.homeAddressLine2}
              onChangeText={(text) => setUserData({ ...userData, homeAddressLine2: text })}
              placeholder="Address Line 2 (Optional)"
              placeholderTextColor="#000"
            />
          </View>
          <View style={styles.addressRow}>
            <View style={styles.addressField}>
              <TextInput
                style={styles.input}
                value={userData.homeCity}
                onChangeText={(text) => setUserData({ ...userData, homeCity: text })}
                placeholder="City / Town"
                placeholderTextColor="#000"
              />
            </View>
            <View style={styles.addressField}>
              <TextInput
                style={styles.input}
                value={userData.homeState}
                onChangeText={(text) => setUserData({ ...userData, homeState: text })}
                placeholder="State / Province"
                placeholderTextColor="#000"
              />
            </View>
            <View style={styles.addressField}>
              <TextInput
                style={styles.input}
                value={userData.homeZip}
                onChangeText={(text) => setUserData({ ...userData, homeZip: text })}
                placeholder="ZIP / Postal"
                placeholderTextColor="#000"
              />
            </View>
          </View>

          {/* Mailing Address */}
          <Text style={styles.subSectionTitle}>Mailing Address (if different)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userData.mailingAddressLine1}
              onChangeText={(text) => setUserData({ ...userData, mailingAddressLine1: text })}
              placeholder="Address Line 1"
              placeholderTextColor="#000"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userData.mailingAddressLine2}
              onChangeText={(text) => setUserData({ ...userData, mailingAddressLine2: text })}
              placeholder="Address Line 2 (Optional)"
              placeholderTextColor="#000"
            />
          </View>
          <View style={styles.addressRow}>
            <View style={styles.addressField}>
              <TextInput
                style={styles.input}
                value={userData.mailingCity}
                onChangeText={(text) => setUserData({ ...userData, mailingCity: text })}
                placeholder="City / Town"
                placeholderTextColor="#000"
              />
            </View>
            <View style={styles.addressField}>
              <TextInput
                style={styles.input}
                value={userData.mailingState}
                onChangeText={(text) => setUserData({ ...userData, mailingState: text })}
                placeholder="State / Province"
                placeholderTextColor="#000"
              />
            </View>
            <View style={styles.addressField}>
              <TextInput
                style={styles.input}
                value={userData.mailingZip}
                onChangeText={(text) => setUserData({ ...userData, mailingZip: text })}
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
              {formatDisplayValue(`${userData.homeAddressLine1}, ${userData.homeAddressLine2}, ${userData.homeCity}, ${userData.homeState}, ${userData.homeZip}`)}
            </Text>
          </View>
          <View style={styles.infoRoww}>
            <Text style={styles.infoLabel}>Mailing Address:</Text>
            <Text style={styles.infoValue}>
              {formatDisplayValue(`${userData.mailingAddressLine1}, ${userData.mailingAddressLine2}, ${userData.mailingCity}, ${userData.mailingState}, ${userData.mailingZip}`)}
            </Text>
          </View>
        </>
      )}

      {/* Save/Cancel Buttons for Edit Mode */}
      {isEditMode && (
        <View style={styles.editButtonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 50,
    color: '#666',
  },
  uploadText: {
    fontSize: 16,
    marginBottom: 8,
  },
  chooseFileButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
  },
  chooseFileButtonText: {
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoRoww: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 50,
  },
  infoLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  imageSaveButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  imageSaveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 44,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#000',
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  addressField: {
    flex: 1,
  },
});

export default AccountInformationPage; 
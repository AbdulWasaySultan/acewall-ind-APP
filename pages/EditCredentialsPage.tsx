import React, { useState, useEffect,useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
type RouteParams = RouteProp<RootStackParamList, 'EditCredentials'>;
import {
  updatePasswordOTP,
  updateEmailOTP,
  updatePhoneOTP,
  updatePassword,
  updateEmail,
  updatePhone,
} from '../services/schoolService';
import { countryCodes } from '../utils/countries';
import SimpleIcon from '../components/SimpleIcon';
type TabType = 'email' | 'password' | 'phone';

const EditCredentialsPage: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpData, setOtpData] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const route = useRoute<RouteParams>();
  const {userData} = route.params;
  // Form states
  const [emailForm, setEmailForm] = useState({ newEmail: '' });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [phoneForm, setPhoneForm] = useState({ newPhone: '', countryCode: '+1' });

  // Password validation
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  // Password visibility states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Country dropdown
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  useEffect(() => {
    if (showOTPModal && otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showOTPModal, otpTimer]);
  useEffect(() => {
    if (showOTPModal) {
      // Reset OTP and focus first input when modal opens
      setOtp('');
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } else {
      // Reset OTP when modal closes
      setOtp('');
    }
  }, [showOTPModal]);

  const handleOtpChange = (text: string, index: number) => {
    // Remove any non-numeric characters
    const numericText = text.replace(/[^0-9]/g, '');

    // Handle paste - if multiple digits are pasted, distribute them across inputs
    if (numericText.length > 1) {
      const digits = numericText.slice(0, 6).split('');
      const newOtp = [...otp.split('')];
      // Pad array to ensure we have 6 elements
      while (newOtp.length < 6) {
        newOtp.push('');
      }

      // Fill OTP starting from current index
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp.join(''));

      // Focus the last filled input or the last input if all 6 digits were pasted
      const nextIndex = Math.min(index + digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    // Handle single digit input
    if (numericText.length === 1) {
      const newOtp = otp.split('');
      // Pad array to ensure we have 6 elements
      while (newOtp.length < 6) {
        newOtp.push('');
      }
      newOtp[index] = numericText;
      const updatedOtp = newOtp.join('');
      setOtp(updatedOtp);

      // Auto-focus next input if available
      if (index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else if (text === '') {
      // User deleted the current digit (backspace pressed)
      const newOtp = otp.split('');
      // Pad array to ensure we have 6 elements
      while (newOtp.length < 6) {
        newOtp.push('');
      }

      if (newOtp[index]) {
        // If current input had a value, clear it and move to previous input
        newOtp[index] = '';
        setOtp(newOtp.join(''));
        if (index > 0) {
          otpInputRefs.current[index - 1]?.focus();
        }
      } else if (index > 0) {
        // If current input is empty, clear the previous input and move focus
        newOtp[index - 1] = '';
        setOtp(newOtp.join(''));
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace') {
      const currentOtp = otp.split('');
      // Pad array to ensure we have 6 elements
      while (currentOtp.length < 6) {
        currentOtp.push('');
      }

      if (currentOtp[index] && index > 0) {
        // Current input has a value, clear it and move to previous
        const newOtp = [...currentOtp];
        newOtp[index] = '';
        setOtp(newOtp.join(''));
        otpInputRefs.current[index - 1]?.focus();
      } else if (!currentOtp[index] && index > 0) {
        // Current input is empty, move to previous and clear it
        const newOtp = [...currentOtp];
        newOtp[index - 1] = '';
        setOtp(newOtp.join(''));
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Minimum 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
    if (!/\d/.test(password)) errors.push('At least one digit');
    if (!/[#?!@$%^&*-]/.test(password)) errors.push('At least one special character (#?!@$%^&*-)');
    return errors;
  };

  const handleEmailSubmit = async () => {
    if (!emailForm.newEmail.trim()) {
      Toast.show('Please enter a valid email address', Toast.LONG);
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateEmailOTP(emailForm.newEmail);
      setOtpData({ type: 'email', email: userData.email });
      setShowOTPModal(true);
      setOtpTimer(600);
      Toast.show('OTP sent successfully to previous email', Toast.LONG);
    } catch (error:any) {
      Toast.show(error?.response?.data.message || 'Failed to update email', Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    const errors = validatePassword(passwordForm.newPassword);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Toast.show('Passwords do not match', Toast.LONG);
      return;
    }

    if (!passwordForm.oldPassword.trim()) {
      Toast.show('Please enter your current password', Toast.LONG);
      return;
    }

    setIsLoading(true);
    try {
      const response = await updatePasswordOTP(
        passwordForm.oldPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      setOtpData({
        type: 'password',
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setShowOTPModal(true);
      setOtpTimer(600);
      Toast.show('OTP sent successfully', Toast.LONG);
    } catch (error:any) {
      console.error('Error sending password OTP:', error);
      Toast.show(error?.response?.data?.message || 'Failed to update password', Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneForm.newPhone.trim()) {
      Toast.show('Please enter a valid phone number', Toast.LONG);
      return;
    }

    setIsLoading(true);
    try {
      const fullPhoneNumber = phoneForm.countryCode + phoneForm.newPhone;
      const response = await updatePhoneOTP(fullPhoneNumber);
      setOtpData({ type: 'phone', phone: fullPhoneNumber });
      setShowOTPModal(true);
      setOtpTimer(600);
      Toast.show('OTP sent successfully', Toast.LONG);
    } catch (error) {
      console.error('Error sending phone OTP:', error);
      Toast.show('Failed to send OTP', Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    if (otp.length !== 6) {
      Toast.show('Please enter a valid 6-digit OTP', Toast.LONG);
      return;
    }

    setIsLoading(true);
    try {
      let response;
      switch (otpData.type) {
        case 'email':
          response = await updateEmail(otpData.email, otp);
          break;
        case 'password':
          response = await updatePassword(
            otpData.oldPassword,
            otpData.newPassword,
            otpData.confirmPassword,
            otp
          );
          break;
        case 'phone':
          response = await updatePhone(otpData.phone, otp);
          break;
      }

      Toast.show('Credentials updated successfully!', Toast.LONG);
      setShowOTPModal(false);
      navigation.goBack();
    } catch (error) { 
      console.error('Error verifying OTP:', error);
      Toast.show('Invalid OTP or update failed', Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'email':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.title}>Email</Text>
            <Text style={styles.description}>
              Make changes to your email here. Click save when you're done.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={emailForm.newEmail}
                onChangeText={(text) => setEmailForm({ newEmail: text })}
                placeholder="Enter new email address"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#000"
              />
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleEmailSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'password':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.title}>Password</Text>
            <Text style={styles.description}>
              Choose a password that you can remember, and make sure its strong.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current password</Text>
              <TextInput
                style={styles.input}
                value={passwordForm.oldPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, oldPassword: text })}
                placeholder="Enter current password"
                secureTextEntry
                placeholderTextColor="#000"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordForm.newPassword}
                  onChangeText={(text) => {
                    setPasswordForm({ ...passwordForm, newPassword: text });
                    setPasswordErrors(validatePassword(text));
                  }}
                  placeholder="Enter new password"
                  secureTextEntry={!showNewPassword}
                  placeholderTextColor="#000"
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <SimpleIcon
                    name={showNewPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#4CAF50"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordForm.confirmPassword}
                  onChangeText={(text) => setPasswordForm({ ...passwordForm, confirmPassword: text })}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#000"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <SimpleIcon
                    name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#4CAF50"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {passwordErrors.length > 0 && (
              <View style={styles.passwordRequirements}>
                {passwordErrors.map((error, index) => (
                  <Text key={index} style={styles.requirementText}>
                    {index + 1}. {error}
                  </Text>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handlePasswordSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'phone':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.title}>Phone Number</Text>
            <Text style={styles.description}>
              Make changes to your phone number here. Click save when you're done.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <View style={styles.phoneContainer}>
                <TouchableOpacity
                  style={styles.countryCodeContainer}
                  onPress={() => setShowCountryDropdown(!showCountryDropdown)}
                >
                  <Text style={styles.countryCodeText}>
                    {countryCodes.find(c => c.code === phoneForm.countryCode)?.flag} {phoneForm.countryCode}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>



                <TextInput
                  style={styles.phoneInput}
                  value={phoneForm.newPhone}
                  onChangeText={(text) => setPhoneForm({ ...phoneForm, newPhone: text })}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#000"
                />
              </View>
              {showCountryDropdown && (
                <View style={styles.countryDropdown}>
                  <ScrollView
                    style={styles.countryScrollView}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    bounces={false}
                  >
                    {countryCodes.map((country, index) => (
                      <TouchableOpacity
                        key={`${country.code}-${country.country}-${index}`}
                        style={styles.countryOption}
                        onPress={() => {
                          setPhoneForm({ ...phoneForm, countryCode: country.code });
                          setShowCountryDropdown(false);
                        }}
                      >
                        <Text style={styles.countryOptionText}>
                          {country.flag} {country.country} ({country.code})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handlePhoneSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Tabs at the very top */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'email' && styles.activeTab]}
          onPress={() => setActiveTab('email')}
        >
          <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>
            Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'password' && styles.activeTab]}
          onPress={() => setActiveTab('password')}
        >
          <Text style={[styles.tabText, activeTab === 'password' && styles.activeTabText]}>
            Password
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
          onPress={() => setActiveTab('phone')}
        >
          <Text style={[styles.tabText, activeTab === 'phone' && styles.activeTabText]}>
            Phone Number
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderTabContent()}
      </ScrollView>

      {/* OTP Modal */}
      <Modal visible={showOTPModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.otpModalContainer}>
            <View style={styles.otpHeader}>
              <Text style={styles.otpTitle}>🔑 Verify OTP</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowOTPModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.otpDescription}>
              We have sent a 6-digit OTP to your email.
            </Text>

            <Text style={styles.timerText}>
              OTP expires in {formatTime(otpTimer)}
            </Text>

            <View style={styles.otpInputContainer}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    otpInputRefs.current[index] = ref;
                  }}
                  style={styles.otpInput}
                  value={otp[index] || ''}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <View style={styles.otpButtonContainer}>
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleOTPSubmit}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => {
                  // Resend OTP logic here
                  switch(activeTab){
                    case 'email':
                    handleEmailSubmit();
                    break;
                    case 'password':
                      handlePasswordSubmit()
                      break;
                    case 'phone':
                      handlePhoneSubmit()
                      break;
                  }
                  // Toast.show('OTP resent successfully', Toast.LONG);
                }}
              >
                <Text style={styles.resendButtonText}>Resend OTP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50, // Add top padding for status bar
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  countryCodeContainer: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRightWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 80,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  countryDropdown: {
    marginTop: 8,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    maxHeight: 300,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  countryScrollView: {
    maxHeight: 300,
  },
  countryOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countryOptionText: {
    fontSize: 16,
    color: '#333',
  },
  phoneInput: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  passwordRequirements: {
    marginBottom: 16,
  },
  requirementText: {
    fontSize: 12,
    color: '#f44336',
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  otpDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  otpButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EditCredentialsPage;

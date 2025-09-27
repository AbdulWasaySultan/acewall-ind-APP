import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signup } from '../services/schoolService';
import Toast from 'react-native-simple-toast';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { countryCodes } from '../utils/countries';

const SignupPage = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    countryCode: '+1',
    // Home Address fields
    homeAddressLine1: '',
    homeAddressLine2: '',
    homeCity: '',
    homeState: '',
    homeZip: '',
    // Mailing Address fields
    mailingAddressLine1: '',
    mailingAddressLine2: '',
    mailingCity: '',
    mailingState: '',
    mailingZip: '',
    password: '',
    confirmPassword: '',
    documents: []
  });

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordRules = [
    {
      test: (pw: string) => pw.length >= 8,
      message: 'Minimum 8 characters',
    },
    {
      test: (pw: string) => /[A-Z]/.test(pw),
      message: 'At least one uppercase letter',
    },
    {
      test: (pw: string) => /[a-z]/.test(pw),
      message: 'At least one lowercase letter',
    },
    {
      test: (pw: string) => /\d/.test(pw),
      message: 'At least one digit',
    },
    {
      test: (pw: string) => /[#!@$%^&*\-]/.test(pw),
      message: 'At least one special character (#?!@$%^&*-)',
    },
  ];

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[#?!@$%^&*-]/.test(password);

    if (!minLength) return 'Password must be at least 8 characters long';
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
    if (!hasDigit) return 'Password must contain at least one digit';
    if (!hasSpecialChar) return 'Password must contain at least one special character (#?!@$%^&*-)';
    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    const requiredFields = ['email', 'role', 'firstName', 'lastName', 'phone', 'homeAddressLine1', 'homeCity', 'homeState', 'homeZip', 'password', 'confirmPassword'];
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = 'This field is required';
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Format addresses as single strings
      const homeAddress = `${formData.homeAddressLine1}${formData.homeAddressLine2 ? ', ' + formData.homeAddressLine2 : ''}, ${formData.homeCity}, ${formData.homeState} ${formData.homeZip}`;
      const mailingAddress = formData.mailingAddressLine1 ? 
        `${formData.mailingAddressLine1}${formData.mailingAddressLine2 ? ', ' + formData.mailingAddressLine2 : ''}, ${formData.mailingCity}, ${formData.mailingState} ${formData.mailingZip}` : 
        '';
      
      const payload = {
        email: formData.email,
        role: formData.role.toLowerCase(),
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        phone: formData.phone,
        homeAddress: homeAddress,
        mailingAddress: mailingAddress,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };
      
      console.log('=== SIGNUP PAYLOAD ===');
      console.log(JSON.stringify(payload, null, 2));
      console.log('=====================');
      
      const response = await signup(payload);

      console.log('Signup response:', response);
      if (response.message === "OTP sent successfully" || response.message === "OTP sent to your email.") {
        Toast.show('OTP sent successfully!', Toast.LONG);
        (navigation as any).navigate('OTPVerification', { email: formData.email, flow: 'signup' });
      } else {
        Toast.show('Invalid response from server', Toast.LONG);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to sign up';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Toast.show(errorMessage, Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelectField = (
    field: string,
    options: string[],
    label: string
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              formData[field as keyof typeof formData] === option && styles.selectedOption,
            ]}
            onPress={() => setFormData({ ...formData, [field]: option })}
          >
            <Text
              style={[
                styles.optionText,
                formData[field as keyof typeof formData] === option && styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {renderSelectField('role', ['Teacher', 'Student'], 'Role')}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                placeholderTextColor="#666"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Middle Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your middle name (optional)"
                placeholderTextColor="#666"
                value={formData.middleName}
                onChangeText={(text) => setFormData({ ...formData, middleName: text })}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your last name"
                placeholderTextColor="#666"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.phoneContainer}>
                <TouchableOpacity 
                  style={styles.countryCodeContainer}
                  onPress={() => setShowCountryDropdown(!showCountryDropdown)}
                >
                  <Text style={styles.countryCodeText}>
                    {countryCodes.find(c => c.code === formData.countryCode)?.flag} {formData.countryCode}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#666"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
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
                          setFormData({ ...formData, countryCode: country.code });
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
              
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Home Address Section */}
            <View style={styles.addressSection}>
              <Text style={styles.sectionTitle}>Home Address *</Text>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Address Line 1 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your address"
                  placeholderTextColor="#666"
                  value={formData.homeAddressLine1}
                  onChangeText={(text) => setFormData({ ...formData, homeAddressLine1: text })}
                />
                {errors.homeAddressLine1 && <Text style={styles.errorText}>{errors.homeAddressLine1}</Text>}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Address Line 2 (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Apartment, suite, etc."
                  placeholderTextColor="#666"
                  value={formData.homeAddressLine2}
                  onChangeText={(text) => setFormData({ ...formData, homeAddressLine2: text })}
                />
              </View>

              <View style={styles.rowContainer}>
                <View style={[styles.fieldContainer, { flex: 2 }]}>
                  <Text style={styles.label}>City / Town *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter city"
                    placeholderTextColor="#666"
                    value={formData.homeCity}
                    onChangeText={(text) => setFormData({ ...formData, homeCity: text })}
                  />
                  {errors.homeCity && <Text style={styles.errorText}>{errors.homeCity}</Text>}
                </View>

                <View style={[styles.fieldContainer, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.label}>State / Province *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="State"
                    placeholderTextColor="#666"
                    value={formData.homeState}
                    onChangeText={(text) => setFormData({ ...formData, homeState: text })}
                  />
                  {errors.homeState && <Text style={styles.errorText}>{errors.homeState}</Text>}
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>ZIP / Postal Code *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter ZIP code"
                  placeholderTextColor="#666"
                  value={formData.homeZip}
                  onChangeText={(text) => setFormData({ ...formData, homeZip: text })}
                />
                {errors.homeZip && <Text style={styles.errorText}>{errors.homeZip}</Text>}
              </View>
            </View>

            {/* Mailing Address Section */}
            <View style={styles.addressSection}>
              <Text style={styles.sectionTitle}>Mailing Address (if different)</Text>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Address Line 1</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your mailing address"
                  placeholderTextColor="#666"
                  value={formData.mailingAddressLine1}
                  onChangeText={(text) => setFormData({ ...formData, mailingAddressLine1: text })}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Address Line 2 (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Apartment, suite, etc."
                  placeholderTextColor="#666"
                  value={formData.mailingAddressLine2}
                  onChangeText={(text) => setFormData({ ...formData, mailingAddressLine2: text })}
                />
              </View>

              <View style={styles.rowContainer}>
                <View style={[styles.fieldContainer, { flex: 2 }]}>
                  <Text style={styles.label}>City / Town</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter city"
                    placeholderTextColor="#666"
                    value={formData.mailingCity}
                    onChangeText={(text) => setFormData({ ...formData, mailingCity: text })}
                  />
                </View>

                <View style={[styles.fieldContainer, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.label}>State / Province</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="State"
                    placeholderTextColor="#666"
                    value={formData.mailingState}
                    onChangeText={(text) => setFormData({ ...formData, mailingState: text })}
                  />
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>ZIP / Postal Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter ZIP code"
                  placeholderTextColor="#666"
                  value={formData.mailingZip}
                  onChangeText={(text) => setFormData({ ...formData, mailingZip: text })}
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter your password"
                  placeholderTextColor="#666"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                {formData.password.length > 0 && (
                  <TouchableOpacity
                    style={styles.showHideButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialIcons
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={24}
                      color="#00c951"
                    />
                  </TouchableOpacity>
                )}
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              <View style={{ marginTop: 8, marginBottom: 8 }}>
                {passwordRules.map((rule, idx) => {
                  const passed = rule.test(formData.password);
                  return (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <MaterialIcons
                        name="fiber-manual-record"
                        size={16}
                        color={passed ? '#00c951' : '#ff3b30'}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          color: passed ? '#00c951' : '#ff3b30',
                          fontSize: 15,
                          fontWeight: '500',
                        }}
                      >
                        {rule.message}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Confirm your password"
                  placeholderTextColor="#666"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                {formData.confirmPassword.length > 0 && (
                  <TouchableOpacity
                    style={styles.showHideButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <MaterialIcons
                      name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                      size={24}
                      color="#00c951"
                    />
                  </TouchableOpacity>
                )}
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00c951',
    backgroundColor: '#fff',
  },
  selectedOption: {
    backgroundColor: '#00c951',
  },
  optionText: {
    color: '#00c951',
    fontSize: 14,
  },
  selectedOptionText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#00c951',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#99e6b3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#00c951',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  passwordInput: {
    paddingRight: 60,
  },
  showHideButton: {
    position: 'absolute',
    right: 15,
    top: 13,
    padding: 5,
  },
  showHideText: {
    color: '#00c951',
    fontSize: 14,
    fontWeight: '600',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    position: 'absolute',
    top: 60,
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
  },
  addressSection: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});

export default SignupPage; 
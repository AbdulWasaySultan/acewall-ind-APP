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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import Toast from 'react-native-simple-toast';
import { resetPassword } from '../services/schoolService';
import MaterialIcons from '@react-native-vector-icons/material-icons';

type ResetPasswordRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

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

const ResetPasswordPage = () => {
  const navigation = useNavigation();
  const route = useRoute<ResetPasswordRouteProp>();
  const email = route.params.email;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const failedRules = passwordRules.filter(rule => !rule.test(password));
  const isValid = failedRules.length === 0;

  const handleUpdatePassword = async () => {
    setTouched(true);
    if (!isValid) return;
    setIsLoading(true);
    try {
      const response = await resetPassword(email, password);
      Toast.show(response.message || 'Password updated successfully!', Toast.LONG);
      (navigation as any).navigate('Login');
    } catch (error: any) {
      let errorMessage = 'Failed to update password';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Toast.show(errorMessage, Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>
              Please enter your new password below
            </Text>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your new password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={() => setTouched(true)}
                />
                {password.length > 0 && (
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(v => !v)}
                  >
                    <MaterialIcons
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={24}
                      color="#00c951"
                    />
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ marginTop: 16, marginBottom: 24 }}>
                {passwordRules.map((rule, idx) => {
                  const passed = rule.test(password);
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
            <TouchableOpacity
              style={[styles.button, (!isValid || isLoading) && styles.buttonDisabled]}
              onPress={handleUpdatePassword}
              disabled={!isValid || isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
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
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 0,
    height: 50,
    paddingHorizontal: 0,
  },
  eyeButton: {
    padding: 8,
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
});

export default ResetPasswordPage; 
import React, { useState, useEffect } from 'react';
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
import { verifyForgotPassOTP, verifyOtpAndSignup, resendOTP } from '../services/schoolService';
import Toast from 'react-native-simple-toast';
import { RootStackParamList } from '../navigation/AppNavigator';

type OTPVerificationRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;

const OTPVerificationPage = () => {
  const navigation = useNavigation();
  const route = useRoute<OTPVerificationRouteProp>();
  const { email, flow } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const validateOTP = () => {
    const newErrors: Record<string, string> = {};

    if (!otp) {
      newErrors.otp = 'OTP is required';
    } else if (otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    } else if (!/^\d+$/.test(otp)) {
      newErrors.otp = 'OTP must contain only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyOTP = async () => {
    if (!validateOTP()) {
      return;
    }

    try {
      setIsLoading(true);
      if (!email) {
        Toast.show('Email not found. Please try again.', Toast.LONG);
        return;
      }

      console.log('Verifying OTP with:', { email, otp, flow });
      
      let response;
      if (flow === 'signup') {
        response = await verifyOtpAndSignup({ email, otp });
        console.log('Signup OTP Verification Response:', response);
        Toast.show(response.message || 'Account created successfully!', Toast.LONG);
        (navigation as any).navigate('Login');
      } else {
        response = await verifyForgotPassOTP(email, otp);
        console.log('Forgot Password OTP Verification Response:', response);
        Toast.show(response.message || 'OTP verified successfully!', Toast.LONG);
        (navigation as any).navigate('ResetPassword', { email });
      }
    } catch (error: any) {
      console.error('OTP Verification Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      Toast.show(error.response?.data?.message || 'Invalid OTP. Please try again.', Toast.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    try {
      setIsLoading(true);
      if (!email) {
        Toast.show('Email not found. Please try again.', Toast.LONG);
        return;
      }

      console.log('Resending OTP to:', email);
      const response = await resendOTP({ email });
      console.log('Resend OTP Response:', response);

      setCountdown(60);
      setCanResend(false);
      Toast.show('New OTP has been sent to your email.', Toast.LONG);
    } catch (error: any) {
      console.error('Resend OTP Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      Toast.show(error.response?.data?.message || 'Failed to resend OTP. Please try again.', Toast.LONG);
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
            <Text style={styles.title}>
              {flow === 'signup' ? 'Verify Your Email' : 'Verify Your Email'}
            </Text>
            <Text style={styles.subtitle}>
              {flow === 'signup' 
                ? 'Please enter the 6-digit code sent to your email to complete your registration'
                : 'Please enter the 6-digit code sent to your email to reset your password'
              }
            </Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>OTP Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#666"
                value={otp}
                onChangeText={(text) => setOtp(text)}
                keyboardType="number-pad"
                maxLength={6}
              />
              {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity 
                onPress={handleResendOTP} 
                disabled={!canResend || isLoading}
              >
                <Text style={[
                  styles.resendLink,
                  !canResend && styles.resendLinkDisabled
                ]}>
                  {canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
                </Text>
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
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendText: {
    color: '#666',
    fontSize: 16,
  },
  resendLink: {
    color: '#00c951',
    fontSize: 16,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#999',
  },
});

export default OTPVerificationPage; 
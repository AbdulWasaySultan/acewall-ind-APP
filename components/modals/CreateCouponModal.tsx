// components/modals/CreateCouponModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
  StyleSheet,
} from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import SimpleIcon from '../SimpleIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createCouponsByCourse } from '../../services/coupon';

// ─── Zod Schema ────────────────────────────────────────────────
const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(3, 'Minimum 3 characters').max(15, 'Maximum 15 characters'),
  discountType: z.enum(['percentage', 'fixed']),
  percentageOff: z.coerce.number().min(1, 'Minimum 1%').max(100, 'Maximum 100%').optional(),
  amountOff: z.coerce.number().min(1, 'Amount must be at least 1').optional(),
  maxRedemptions: z.coerce.number().min(1, 'Must be at least 1').optional(),
  expiresAt: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  onRefresh: () => void;
}

export default function CreateCouponModal({ visible, onClose, courseId, onRefresh }: Props) {
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      discountType: 'percentage' as const,
      percentageOff: 0,
      amountOff: 0,
      maxRedemptions: 0,
      expiresAt: '',
    },
  });

  const discountType = watch('discountType');

  const onCreateCoupon: SubmitHandler<FormData> = async (data) => {
    setSubmitting(true);
    try {
      const payload: any = {
        name: data.name,
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        maxRedemptions: data.maxRedemptions || undefined,
        expiresAt: data.expiresAt || undefined,
        courseId,
      };

      if (data.discountType === 'percentage') {
        payload.percentageOff = data.percentageOff;
      } else {
        payload.amountOff = data.amountOff;
      }

      await createCouponsByCourse(courseId, payload);
      Alert.alert('Success', 'Coupon created successfully');
      reset();
      onRefresh();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <SimpleIcon name="arrow-back" size={24} color="#10B144" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Coupon</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Internal Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <View style={styles.field}>
                <Text style={styles.label}>Internal Name</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Winter Sale 2024"
                  placeholderTextColor="#999"
                />
                {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
              </View>
            )}
          />

          {/* Coupon Code */}
          <Controller
            control={control}
            name="code"
            render={({ field: { onChange, value } }) => (
              <View style={styles.field}>
                <Text style={styles.label}>Coupon Code</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => onChange(text.toUpperCase())}
                  value={value}
                  placeholder="SAVE50"
                  autoCapitalize="characters"
                  placeholderTextColor="#999"
                />
                {errors.code && <Text style={styles.error}>{errors.code.message}</Text>}
              </View>
            )}
          />

          {/* Discount Type Toggle */}
          <View style={styles.field}>
            <Text style={styles.label}>Discount Type</Text>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Percentage</Text>
              <Controller
                control={control}
                name="discountType"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={value === 'fixed'}
                    onValueChange={(isFixed) => onChange(isFixed ? 'fixed' : 'percentage')}
                    trackColor={{ false: '#767577', true: '#4CAF50' }}
                  />
                )}
              />
              <Text style={styles.toggleLabel}>Fixed</Text>
            </View>
          </View>

          {/* Discount % */}
          {discountType === 'percentage' && (
            <Controller
              control={control}
              name="percentageOff"
              render={({ field: { onChange, value } }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>Discount %</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={(text) => onChange(text ? Number(text) : undefined)}
                    value={value ? String(value) : ''}
                    placeholder="0"
                    placeholderTextColor="#999"
                  />
                  {errors.percentageOff && <Text style={styles.error}>{errors.percentageOff.message}</Text>}
                </View>
              )}
            />
          )}

          {/* Amount Off */}
          {discountType === 'fixed' && (
            <Controller
              control={control}
              name="amountOff"
              render={({ field: { onChange, value } }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>Amount Off ($)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={(text) => onChange(text ? Number(text) : undefined)}
                    value={value ? String(value) : ''}
                    placeholder="10.00"
                    placeholderTextColor="#999"
                  />
                  {errors.amountOff && <Text style={styles.error}>{errors.amountOff.message}</Text>}
                </View>
              )}
            />
          )}

          {/* Max Uses */}
          <Controller
  control={control}
  name="maxRedemptions"
  render={({ field: { onChange, value } }) => (
    <View style={styles.field}>
      <Text style={styles.label}>Max Uses</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        onChangeText={(text) => {
          // Allow empty string → set null (or undefined)
          onChange(text === '' ? null : Number(text));
        }}
        value={value !== null && value !== undefined ? String(value) : ''}
        placeholder="1"
        placeholderTextColor="#999"
      />
      {errors.maxRedemptions && <Text style={styles.error}>{errors.maxRedemptions.message}</Text>}
    </View>
  )}
/>

          {/* Expiry Date */}
          <Controller
            control={control}
            name="expiresAt"
            render={({ field: { onChange, value } }) => (
              <View style={styles.field}>
                <Text style={styles.label}>Expiry Date</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                  <Text style={value ? styles.dateText : styles.placeholderText}>
                    {value ? new Date(value).toLocaleDateString('en-US') : 'mm/dd/yyyy'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        onChange(selectedDate.toISOString());
                      }
                    }}
                  />
                )}
                {errors.expiresAt && <Text style={styles.error}>{errors.expiresAt.message}</Text>}
              </View>
            )}
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit(onCreateCoupon)}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Creating...' : 'Create Stripe Coupon'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  form: { flex: 1, padding: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#495057', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#000',
  },
  dateText: { fontSize: 16, color: '#1a1a1a', paddingVertical: 10 },
  placeholderText: { fontSize: 16, color: '#adb5bd', paddingVertical: 10 },
  error: { fontSize: 12, color: '#dc3545', marginTop: 4 },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  toggleLabel: { fontSize: 14, color: '#495057' },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#10B144',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  cancelButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  cancelButtonText: { fontSize: 16, fontWeight: '500', color: '#6c757d' },
});
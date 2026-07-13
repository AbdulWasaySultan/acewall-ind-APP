// pages/CouponManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchCouponsByCourse, createCouponsByCourse, updateCouponStatus, Coupon, CreateCouponPayload } from '../services/coupon.ts'

// ─── Zod Schema ────────────────────────────────────────────────
const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(3, 'Minimum 3 characters').max(15, 'Maximum 15 characters'),
  discountType: z.enum(['percentage', 'fixed']),
  percentageOff: z.coerce.number().min(1, 'Minimum 1%').max(100, 'Maximum 100%').optional(),
  maxRedemptions: z.coerce.number().min(1, 'Must be at least 1').optional(),
  expiresAt: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// ─── Component ────────────────────────────────────────────────
interface Props {
  courseId: string;
}

export default function CouponManagementPage({ courseId }: Props) {
  // ── State ──
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ── React Hook Form ──
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      discountType: 'percentage',
      percentageOff: 0,
      maxRedemptions: 1,
      expiresAt: '',
    },
  });

  const discountType = watch('discountType');

  // ── Load Coupons ──
  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCouponsByCourse(courseId);
      setCoupons(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // ── Create Coupon ──
  const onCreateCoupon = async (data: FormData) => {
    setSubmitting(true);
    try {
      await createCouponsByCourse(courseId, {
        name: data.name,
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        percentageOff: data.discountType === 'percentage' ? data.percentageOff : undefined,
        maxRedemptions: data.maxRedemptions || undefined,
        expiresAt: data.expiresAt || undefined,
      });
      Alert.alert('Success', 'Coupon created successfully');
      setModalVisible(false);
      reset();
      loadCoupons();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle Status ──
  const onToggleStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      await updateCouponStatus(couponId, !currentStatus);
      setCoupons((prev) =>
        prev.map((c) => (c.id === couponId ? { ...c, isActive: !currentStatus } : c))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update coupon status');
    }
  };

  // ── Render Coupon Card (Matches Web Screenshot) ──
  const renderCoupon = ({ item }: { item: Coupon }) => (
    <View style={styles.couponCard}>
      {/* Row 1: Code (Bold) & Status Badge */}
      <View style={styles.cardRow}>
        <Text style={styles.couponCode}>{item.code}</Text>
        <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>

      {/* Row 2: Name (smaller, grey) */}
      <Text style={styles.couponName}>{item.name}</Text>

      {/* Row 3: Discount (e.g., "10% Off") */}
      <Text style={styles.discountText}>
        {item.discountType === 'percentage' 
          ? `${item.percentageOff}% Off` 
          : `$${item.fixedAmount?.toFixed(2)} Off`}
      </Text>

      {/* Row 4: Uses & Expires */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>
          Uses: Max {item.maxRedemptions || '∞'}
        </Text>
        <Text style={styles.detailText}>
          Expires: {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'Never'}
        </Text>
      </View>

      {/* Row 5: Action Button */}
      <TouchableOpacity
        style={[styles.actionButton, item.isActive ? styles.inactiveAction : styles.activeAction]}
        onPress={() => onToggleStatus(item.id, item.isActive)}
      >
        <Text style={styles.actionButtonText}>
          {item.isActive ? 'Set Inactive' : 'Activate'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ── Empty State ──
  if (!loading && coupons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Coupons Yet</Text>
        <Text style={styles.emptySubtitle}>Create your first discount coupon for this course</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.createButtonText}>Create Coupon</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main Render ──
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Coupons</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Coupon List */}
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={(item) => item._id}
          renderItem={renderCoupon}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ─── Create Coupon Modal ─── */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Create Coupon</Text>

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
                  />
                  {errors.code && <Text style={styles.error}>{errors.code.message}</Text>}
                </View>
              )}
            />

            {/* Discount Type Toggle (Percentage / Fixed) */}
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

            {/* Discount % (only for percentage) */}
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
                    />
                    {errors.percentageOff && <Text style={styles.error}>{errors.percentageOff.message}</Text>}
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
                    onChangeText={(text) => onChange(text ? Number(text) : undefined)}
                    value={value ? String(value) : ''}
                    placeholder="1"
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
                      {value ? new Date(value).toLocaleDateString() : 'dd/mm/yyyy'}
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

            {/* Modal Actions */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit(onCreateCoupon)}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Creating...' : 'Create Stripe Coupon'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  // ── Coupon Card (Matches Web Screenshot) ──
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  couponCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#d4edda',
  },
  inactiveBadge: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  couponName: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  discountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  detailText: {
    fontSize: 13,
    color: '#6c757d',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  activeAction: {
    backgroundColor: '#28a745', // Activate = green
  },
  inactiveAction: {
    backgroundColor: '#ffc107', // Set Inactive = yellow/amber
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  // ── Empty State ──
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '92%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  dateText: {
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#adb5bd',
    paddingVertical: 10,
  },
  error: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#495057',
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
  },
});
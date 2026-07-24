// screens/CouponsPage.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import SimpleIcon from '../components/SimpleIcon';
import CreateCouponModal from '../components/modals/CreateCouponModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Coupon, fetchCouponsByCourse, updateCouponStatus } from '../services/coupon';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Coupons'>;
  route: RouteProp<RootStackParamList, 'Coupons'>;
};

export default function CouponsPage({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { courseId } = route.params;
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const loadCoupons = async () => {
    try {
      const data = await fetchCouponsByCourse(courseId);
      setCoupons(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCoupons();
    }, [courseId])
  );

  const handleToggleStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      await updateCouponStatus(couponId, !currentStatus);
      setCoupons((prev) =>
        prev.map((c) => (c._id === couponId ? { ...c, isActive: !currentStatus } : c))
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update coupon status');
    }
  };

  const renderCoupon = ({ item }: { item: Coupon }) => {
    let discountDisplay = '';
    if (item.discountType === 'percentage' && item.percentageOff !== undefined) {
      discountDisplay = `${item.percentageOff}% Off`;
    } else if (item.discountType === 'fixed' && (item as any).amountOff !== undefined) {
      discountDisplay = `$${(item as any).amountOff.toFixed(2)} Off`;
    }

    return (
      <View style={styles.couponCard}>
        <View style={styles.cardRow}>
          <Text style={styles.couponCode}>{item.code}</Text>
          <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={styles.statusText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
        <Text style={styles.couponName}>{item.name}</Text>
        <Text style={styles.discountText}>{discountDisplay}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>Uses: Max {item.maxRedemptions || '∞'}</Text>
          <Text style={styles.detailText}>
            Expires: {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'Never'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, item.isActive ? styles.inactiveAction : styles.activeAction]}
          onPress={() => handleToggleStatus(item._id, item.isActive)}
        >
          <Text style={styles.actionButtonText}>
            {item.isActive ? 'Set Inactive' : 'Set Active'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B144" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <SimpleIcon name="arrow-back" size={24} color="#10B144" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coupons</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setCreateModalVisible(true)}>
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {coupons.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Coupons Yet</Text>
          <Text style={styles.emptySubtitle}>Create your first discount coupon for this course</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => setCreateModalVisible(true)}>
            <Text style={styles.createButtonText}>Create Coupon</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={(item) => item._id}
          renderItem={renderCoupon}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadCoupons();
          }}
        />
      )}

      {/* ─── Create Coupon Modal ─── */}
      <CreateCouponModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        courseId={courseId}
        onRefresh={loadCoupons}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  addButton: {
    backgroundColor: '#10B144',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  listContent: { padding: 16, paddingBottom: 32 },
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
  couponCode: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
  activeBadge: { backgroundColor: '#d4edda' },
  inactiveBadge: { backgroundColor: '#f8d7da' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#1a1a1a' },
  couponName: { fontSize: 14, color: '#6c757d', marginBottom: 6, textTransform: 'capitalize' },
  discountText: { fontSize: 15, fontWeight: '600', color: '#28a745', marginBottom: 4 },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  detailText: { fontSize: 13, color: '#6c757d' },
  actionButton: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6, alignSelf: 'flex-start' },
  activeAction: { backgroundColor: '#28a745' },
  inactiveAction: { backgroundColor: '#ffc107' },
  actionButtonText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6c757d', textAlign: 'center', marginBottom: 24 },
  createButton: { backgroundColor: '#10B144', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  createButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
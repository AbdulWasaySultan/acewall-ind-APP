import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import {
  getTeacherPaymentStats,
  getTeacherPaymentStatsWithPagination,
  submitWithdrawal,
  PaymentStats,
  Withdrawal,
} from '../services/wallet';
import SimpleIcon from '../components/SimpleIcon';

const WalletPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PaymentStats['stats']>({
    totalRevenue: 0,
    totalEarnings: 0,
    totalWithdrawals: 0,
    currentBalance: 0,
    todayRevenue: 0,
  });
  const [recentWithdrawals, setRecentWithdrawals] = useState<Withdrawal[]>([]);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showAllWithdrawalsModal, setShowAllWithdrawalsModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [stripeAccountId, setStripeAccountId] = useState('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  // All withdrawals modal state
  const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [withdrawalStats, setWithdrawalStats] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
    total: 0,
  });

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const data = await getTeacherPaymentStats();
      setStats(data.stats);
      setRecentWithdrawals(data.recentWithdrawals || []);
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      Toast.show(error.message || 'Failed to fetch wallet data', Toast.LONG);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWithdrawals = async (page: number = 1) => {
    setLoadingWithdrawals(true);
    try {
      const data = await getTeacherPaymentStatsWithPagination(page, 16);
      setAllWithdrawals(data.recentWithdrawals || []);
      setCurrentPage(data.pagination.currentPage);
      setTotalPages(data.pagination.totalPages);

      // Calculate stats from all withdrawals
      const withdrawals = data.recentWithdrawals || [];
      const approved = withdrawals.filter((w: Withdrawal) => w.status === 'approved').length;
      const pending = withdrawals.filter((w: Withdrawal) => w.status === 'pending').length;
      const rejected = withdrawals.filter((w: Withdrawal) => w.status === 'rejected').length;

      setWithdrawalStats({
        approved,
        pending,
        rejected,
        total: data.pagination.totalWithdrawalsCount || withdrawals.length,
      });
    } catch (error: any) {
      console.error('Error fetching all withdrawals:', error);
      Toast.show(error.message || 'Failed to fetch withdrawals', Toast.LONG);
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchWalletData();
    }, [])
  );

  useEffect(() => {
    if (showAllWithdrawalsModal) {
      fetchAllWithdrawals(1);
    }
  }, [showAllWithdrawalsModal]);

  const handleSubmitWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      Toast.show('Please enter a valid withdrawal amount', Toast.LONG);
      return;
    }
    if (!stripeAccountId.trim()) {
      Toast.show('Please enter your Stripe Account ID', Toast.LONG);
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      await submitWithdrawal(parseFloat(withdrawalAmount), 'stripe', stripeAccountId);
      Toast.show('Withdrawal request submitted successfully', Toast.LONG);
      setShowWithdrawalModal(false);
      setWithdrawalAmount('');
      setStripeAccountId('');
      fetchWalletData();
      if (showAllWithdrawalsModal) {
        fetchAllWithdrawals(currentPage);
      }
    } catch (error: any) {
      console.error('Error submitting withdrawal:', error);
      Toast.show(error.message || 'Failed to submit withdrawal request', Toast.LONG);
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B144';
      case 'pending':
        return '#F59E0B';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const StatCard = ({ icon, iconColor, amount, label }: any) => (
    <View style={styles.statCard}>
      <SimpleIcon name={icon} size={24} color={iconColor} />
      <Text style={styles.statAmount}>{formatCurrency(amount)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

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
      <View style={styles.header}>
        <Text style={styles.headerText}>My Earnings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="layers"
            iconColor="#F97316"
            amount={stats.totalRevenue}
            label="Total Revenue"
          />
          <StatCard
            icon="account-balance-wallet"
            iconColor="#3B82F6"
            amount={stats.currentBalance}
            label="Current Balance"
          />
          <StatCard
            icon="receipt"
            iconColor="#8B5CF6"
            amount={stats.totalWithdrawals}
            label="Total Withdrawals"
          />
          <StatCard
            icon="account-balance-wallet"
            iconColor="#10B144"
            amount={stats.todayRevenue}
            label="Today Revenue"
          />
        </View>

        {/* Recent Withdrawals Section */}
        <View style={styles.withdrawalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Withdrawals</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.withdrawButton}
              onPress={() => setShowWithdrawalModal(true)}
            >
              <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => setShowAllWithdrawalsModal(true)}
            >
              <Text style={styles.viewAllButtonText}>View All Withdrawals</Text>
            </TouchableOpacity>
          </View>

          {/* Table Headers */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Amount</Text>
            <Text style={styles.tableHeaderText}>Method</Text>
            <Text style={styles.tableHeaderText}>Date</Text>
            <Text style={styles.tableHeaderText}>Status</Text>
          </View>

          {/* Table Content */}
          {recentWithdrawals.length > 0 ? (
            <View style={styles.tableContent}>
              {recentWithdrawals.map((withdrawal) => (
                <View key={withdrawal._id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{formatCurrency(withdrawal.amount)}</Text>
                  <Text style={styles.tableCell}>{withdrawal.method}</Text>
                  <Text style={styles.tableCell}>{formatDate(withdrawal.requestedAt)}</Text>
                  <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>

                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(withdrawal.status) + '20', }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(withdrawal.status) }]}>
                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </Text>
                  </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No recent withdrawals</Text>
          )}
        </View>
      </ScrollView>

      {/* Withdrawal Request Modal */}
      <Modal
        visible={showWithdrawalModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWithdrawalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowWithdrawalModal(false)}
                style={styles.backButton}
              >
                <SimpleIcon name="arrow-back" size={20} color="#000" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>Request Your Withdrawal</Text>
            <Text style={styles.modalDescription}>
              Enter the amount you'd like to withdraw. Make sure to provide your correct Stripe Account ID.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Amount ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
                value={withdrawalAmount}
                onChangeText={setWithdrawalAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={[styles.input, styles.dropdownInput]}>
                <Text style={styles.dropdownText}>Stripe</Text>
                <SimpleIcon name="chevron-down" size={20} color="#6B7280" />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Stripe Account ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your Stripe account ID (e.g., acct_123ABC456XY"
                placeholderTextColor="#9CA3AF"
                value={stripeAccountId}
                onChangeText={setStripeAccountId}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitWithdrawal}
              disabled={submittingWithdrawal}
            >
              {submittingWithdrawal ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Withdrawal Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* All Withdrawals Modal */}
      <Modal
        visible={showAllWithdrawalsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAllWithdrawalsModal(false)}
      >
        <View style={styles.allWithdrawalsModalOverlay}>
          <View style={styles.allWithdrawalsModalContent}>
            <View style={styles.allWithdrawalsHeader}>
              <TouchableOpacity
                onPress={() => setShowAllWithdrawalsModal(false)}
                style={styles.backButtonWhite}
              >
                <SimpleIcon name="arrow-back" size={20} color="#fff" />
                <Text style={styles.backButtonTextWhite}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.allWithdrawalsTitle}>All Withdrawals</Text>
            </View>

            {loadingWithdrawals ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="#10B144" />
              </View>
            ) : (
              <ScrollView style={styles.allWithdrawalsScroll} showsVerticalScrollIndicator={false}>
                {/* Summary Cards */}
                <View style={styles.summaryGrid}>
                  <View style={[styles.summaryCard, { backgroundColor: '#D1FAE5' }]}>
                    <SimpleIcon name="check-circle" size={24} color="#10B144" />
                    <Text style={styles.summaryLabel}>Approved Withdrawals</Text>
                    <Text style={[styles.summaryValue, { color: '#10B144' }]}>{withdrawalStats.approved}</Text>
                  </View>
                  <View style={[styles.summaryCard, { backgroundColor: '#FEF3C7' }]}>
                    <SimpleIcon name="schedule" size={24} color="#F59E0B" />
                    <Text style={styles.summaryLabel}>Pending Withdrawals</Text>
                    <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{withdrawalStats.pending}</Text>
                  </View>
                  <View style={[styles.summaryCard, { backgroundColor: '#FEE2E2' }]}>
                    <SimpleIcon name="cancel" size={24} color="#EF4444" />
                    <Text style={styles.summaryLabel}>Rejected Withdrawals</Text>
                    <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{withdrawalStats.rejected}</Text>
                  </View>
                  <View style={[styles.summaryCard, { backgroundColor: '#F3F4F6' }]}>
                    <SimpleIcon name="layers" size={24} color="#6B7280" />
                    <Text style={styles.summaryLabel}>Total Withdrawals</Text>
                    <Text style={[styles.summaryValue, { color: '#6B7280' }]}>{withdrawalStats.total}</Text>
                  </View>
                </View>

                {/* Table Headers */}
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Amount</Text>
                  <Text style={styles.tableHeaderText}>Method</Text>
                  <Text style={styles.tableHeaderText}>Date</Text>
                  <Text style={styles.tableHeaderText}>Status</Text>
                </View>

                {/* Table Content */}
                {allWithdrawals.length > 0 ? (
                  <View style={styles.tableContent}>
                    {allWithdrawals.map((withdrawal) => (
                      <View key={withdrawal._id} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{formatCurrency(withdrawal.amount)}</Text>
                        <Text style={styles.tableCell}>{withdrawal.method}</Text>
                        <Text style={styles.tableCell}>{formatDate(withdrawal.requestedAt)}</Text>
                        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>

                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(withdrawal.status) + '20' }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(withdrawal.status) }]}>
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </Text>
                        </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No withdrawals found</Text>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <View style={styles.pagination}>
                    <TouchableOpacity
                      style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                      onPress={() => {
                        if (currentPage > 1) {
                          fetchAllWithdrawals(currentPage - 1);
                        }
                      }}
                      disabled={currentPage === 1}
                    >
                      <Text style={styles.paginationButtonText}>Previous</Text>
                    </TouchableOpacity>
                    <Text style={styles.paginationText}>
                      Page {currentPage} of {totalPages}
                    </Text>
                    <TouchableOpacity
                      style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                      onPress={() => {
                        if (currentPage < totalPages) {
                          fetchAllWithdrawals(currentPage + 1);
                        }
                      }}
                      disabled={currentPage === totalPages}
                    >
                      <Text style={styles.paginationButtonText}>Next</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Request Withdrawal Button */}
            <TouchableOpacity
              style={styles.requestWithdrawalButton}
              onPress={() => {
                setShowAllWithdrawalsModal(false);
                setShowWithdrawalModal(true);
              }}
            >
              <Text style={styles.requestWithdrawalButtonText}>Request Withdrawal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#10B144',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 0,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  withdrawalsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  withdrawButton: {
    backgroundColor: '#10B144',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  viewAllButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  tableContent: {
    marginTop: 8,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    paddingVertical: 24,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#000',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#10B144',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // All Withdrawals Modal
  allWithdrawalsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  allWithdrawalsModalContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  allWithdrawalsHeader: {
    backgroundColor: '#10B144',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  allWithdrawalsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },
  backButtonWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButtonTextWhite: {
    marginLeft: 4,
    fontSize: 16,
    color: '#fff',
  },
  allWithdrawalsScroll: {
    flex: 1,
    padding: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#374151',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 16,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#10B144',
  },
  paginationButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
  },
  paginationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationText: {
    fontSize: 14,
    color: '#374151',
  },
  requestWithdrawalButton: {
    backgroundColor: '#10B144',
    paddingVertical: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestWithdrawalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WalletPage;


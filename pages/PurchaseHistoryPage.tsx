import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Platform,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import SimpleIcon from "../components/SimpleIcon";
import { getPurchases, Purchase } from "../services/purchase";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Matches web's purchasesPage.jsx field-for-field. Web renders this as a
// table; mobile uses a card per row since a 5-column table doesn't fit a
// phone screen, but every field/formatting rule below is ported verbatim.
const PurchaseHistoryPage = () => {
  const navigation = useNavigation<NavigationProp>();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    try {
      setError(null);
      const res = await getPurchases();
      setPurchases(res.data || []);
    } catch (err: any) {
      setError("Failed to load purchase history. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPurchases();
    }, [fetchPurchases])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPurchases();
  }, [fetchPurchases]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    // toLocaleDateString with dateStyle isn't supported on all Hermes
    // builds — fall back to a manual medium-style format if it throws.
    try {
      return date.toLocaleDateString("en-US", { dateStyle: "medium" } as any);
    } catch {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    }
  };

  const formatAmount = (item: Purchase) => {
    const symbol = item.currency?.toUpperCase() === "USD" ? "$" : "";
    return `${symbol}${item.amount.toFixed(2)}`;
  };

  const referenceId = (item: Purchase) => {
    const id = item.stripeInvoiceId?.slice(0, 12) || item.paymentIntentId?.slice(0, 12);
    return `ID: ${id || ""}...`;
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleIcon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Billing & Invoices
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.subHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Billing & Invoices</Text>
            <Text style={styles.pageSubtitle}>
              View your transactions and manage receipts.
            </Text>
          </View>
          <View style={styles.stripeBadge}>
            <SimpleIcon name="credit-card" size={16} color="#4F46E5" />
            <Text style={styles.stripeBadgeText}>Default: Stripe</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <SimpleIcon name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : loading ? (
          <View>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.skeletonCard} />
            ))}
          </View>
        ) : purchases.length === 0 ? (
          <View style={styles.stateWrap}>
            <SimpleIcon name="credit-card" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        ) : (
          purchases.map((item) => (
            <View key={item._id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.courseIcon}>
                  <SimpleIcon name="book" size={18} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseTitle} numberOfLines={1}>
                    {item.course?.courseTitle || "Course Material"}
                  </Text>
                  <Text style={styles.referenceText}>{referenceId(item)}</Text>
                </View>
                <View
                  style={[
                    styles.planBadge,
                    item.paymentType === "SUBSCRIPTION"
                      ? styles.planBadgeSubscription
                      : styles.planBadgeOneTime,
                  ]}
                >
                  <Text
                    style={[
                      styles.planBadgeText,
                      item.paymentType === "SUBSCRIPTION"
                        ? styles.planBadgeTextSubscription
                        : styles.planBadgeTextOneTime,
                    ]}
                  >
                    {item.paymentType}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBottomRow}>
                <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                <Text style={styles.amountText}>{formatAmount(item)}</Text>
              </View>

              {(item.invoicePdf || item.receiptUrl) && (
                <View style={styles.actionsRow}>
                  {item.invoicePdf && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => Linking.openURL(item.invoicePdf!)}
                    >
                      <SimpleIcon name="download" size={16} color="#4F46E5" />
                      <Text style={styles.actionButtonText}>Invoice PDF</Text>
                    </TouchableOpacity>
                  )}
                  {item.receiptUrl && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => Linking.openURL(item.receiptUrl!)}
                    >
                      <SimpleIcon name="open-outline" size={16} color="#4F46E5" />
                      <Text style={styles.actionButtonText}>Receipt</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    minHeight: 56,
    backgroundColor: "#10B144",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 44 : 16,
    paddingBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", flex: 1 },
  backButton: { padding: 4, marginRight: 12 },
  container: { flex: 1, padding: 16 },
  subHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  pageTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  pageSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  stripeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#E0E7FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stripeBadgeText: { fontSize: 12, fontWeight: "600", color: "#3730A3" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    padding: 16,
  },
  errorText: { flex: 1, color: "#DC2626", fontSize: 13 },
  skeletonCard: {
    height: 84,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginBottom: 12,
  },
  stateWrap: { alignItems: "center", padding: 48 },
  emptyText: { fontSize: 15, fontWeight: "600", color: "#9CA3AF", marginTop: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTopRow: { flexDirection: "row", alignItems: "center" },
  courseIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  courseTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  referenceText: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  planBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
  },
  planBadgeSubscription: { backgroundColor: "#F3E8FF", borderColor: "#E9D5FF" },
  planBadgeOneTime: { backgroundColor: "#D1FAE5", borderColor: "#A7F3D0" },
  planBadgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  planBadgeTextSubscription: { color: "#7E22CE" },
  planBadgeTextOneTime: { color: "#047857" },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F9FAFB",
  },
  dateText: { fontSize: 12, color: "#6B7280", fontStyle: "italic" },
  amountText: { fontSize: 16, fontWeight: "700", color: "#111827" },
  actionsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
  },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionButtonText: { fontSize: 12, fontWeight: "600", color: "#4F46E5" },
});

export default PurchaseHistoryPage;

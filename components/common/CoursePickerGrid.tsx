import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import SimpleIcon from "../SimpleIcon";

export interface CoursePickerBadge {
  label: string;
  color: string;
  backgroundColor: string;
}

export interface CoursePickerItem {
  _id: string;
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  badges?: CoursePickerBadge[];
}

interface CoursePickerGridProps {
  headerTitle: string;
  headerSubtitle?: string;
  items: CoursePickerItem[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
  extraFilter?: React.ReactNode;
  onSelect: (item: CoursePickerItem) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  footerLabel?: string;
  loadingLabel?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const CoursePickerGrid: React.FC<CoursePickerGridProps> = ({
  headerTitle,
  headerSubtitle,
  items,
  loading,
  error,
  onRetry,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search courses...",
  extraFilter,
  onSelect,
  emptyTitle = "No courses found",
  emptySubtitle = "Try adjusting your search or filters.",
  footerLabel = "Open ›",
  loadingLabel = "Loading courses...",
  refreshing = false,
  onRefresh,
}) => {
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>{headerTitle}</Text>
        {headerSubtitle ? (
          <Text style={styles.bannerSubtitle}>{headerSubtitle}</Text>
        ) : null}
      </View>

      <View style={styles.searchContainer}>
        <SimpleIcon name="search" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder={searchPlaceholder}
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>

      {extraFilter ? (
        <View style={styles.extraFilter}>{extraFilter}</View>
      ) : null}

      {loading ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color="#10B144" />
          <Text style={styles.stateText}>{loadingLabel}</Text>
        </View>
      ) : error ? (
        <View style={styles.stateWrap}>
          <Text style={styles.errorText}>{error}</Text>
          {onRetry ? (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : items.length === 0 ? (
        <View style={styles.stateWrap}>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              onPress={() => onSelect(item)}
            >
              <Image
                source={
                  item.thumbnailUrl
                    ? { uri: item.thumbnailUrl }
                    : require("../../assets/jpg.jpg")
                }
                style={styles.cardImage}
              />
              <View style={styles.cardInfo}>
                {item.badges && item.badges.length > 0 ? (
                  <View style={styles.badgeRow}>
                    {item.badges.map((badge, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.badge,
                          { backgroundColor: badge.backgroundColor },
                        ]}
                      >
                        <Text
                          style={[styles.badgeText, { color: badge.color }]}
                        >
                          {badge.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                ) : null}
                <Text style={styles.cardFooter}>{footerLabel}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  banner: {
    backgroundColor: "#10B144",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  bannerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  bannerSubtitle: { color: "#E7F8ED", fontSize: 13, marginTop: 4 },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    marginHorizontal: 3,

    // width: "96.5%",
    alignSelf: "center",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: "#333",
  },
  extraFilter: {
    marginBottom: 10,
  },
  stateWrap: { alignItems: "center", padding: 32 },
  stateText: { color: "#6B7280", marginTop: 8 },
  errorText: { color: "#B91C1C", textAlign: "center" },
  retryButton: {
    marginTop: 12,
    backgroundColor: "#10B144",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: { color: "#fff", fontWeight: "600" },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#374151" },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  list: {
    paddingBottom: 40,
    marginTop: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  cardInfo: {
    padding: 14,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  cardFooter: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B144",
    marginTop: 4,
  },
});

export default CoursePickerGrid;

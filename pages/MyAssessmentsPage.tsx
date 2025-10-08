// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
// import { getAllAssessmentForStudent } from '../services/course';

// const MyAssessmentsPage = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const getAllAssessment = async () => {
//     try {

//       const res = await getAllAssessmentForStudent()
//       console.log(res)
//     } catch (err) {
//       console.log(err)
//     }
//   }
//   useEffect(() => {
//     getAllAssessment()
//   })
//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search by title"
//           placeholderTextColor="#888"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//       </View>

//       <View style={styles.assessmentHeaderRow}>
//         <Text style={[styles.assessmentHeaderText, styles.assessmentNameColumn]}>Assessment Name</Text>
//         <Text style={[styles.assessmentHeaderText, styles.courseColumn]}>Course</Text>
//         <Text style={[styles.assessmentHeaderText, styles.dueDateColumn]}>Due Date</Text>
//         <Text style={[styles.assessmentHeaderText, styles.statusColumn]}>Status</Text>
//         <Text style={[styles.assessmentHeaderText, styles.typeColumn]}>Type</Text>
//       </View>

//       <View style={styles.noAssessmentsContainer}>
//         <Text style={styles.noAssessmentsText}>No assessments available.</Text>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     paddingHorizontal: 16,
//     paddingTop: 16,
//   },
//   header: {
//     marginBottom: 16,
//   },
//   searchInput: {
//     height: 40,
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     fontSize: 16,
//     backgroundColor: '#f9f9f9',
//   },
//   assessmentHeaderRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     marginBottom: 12,
//   },
//   assessmentHeaderText: {
//     fontWeight: 'bold',
//     color: '#555',
//     fontSize: 14,
//     textAlign: 'center',
//   },
//   assessmentNameColumn: {
//     flex: 2,
//     textAlign: 'left',
//   },
//   courseColumn: {
//     flex: 1.5,
//   },
//   dueDateColumn: {
//     flex: 1.5,
//   },
//   statusColumn: {
//     flex: 1,
//   },
//   typeColumn: {
//     flex: 1,
//   },
//   noAssessmentsContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   noAssessmentsText: {
//     fontSize: 16,
//     color: '#666',
//   },
// });

// export default MyAssessmentsPage; 
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { getAllAssessmentForStudent } from "../services/course";

// ---------- INTERFACE ----------
export interface AssessmentItem {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    courseTitle: string;
  };
  chapter: {
    _id: string;
    title: string;
  };
  type: "chapter-assessment" | string;
  category: {
    _id: string;
    name: string;
    weight: number;
    course: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  dueDate: {
    date: string;
    time: string;
  };
  createdAt: string;
  isSubmitted: boolean;
  source: string;
}

type AnyObj = Record<string, any>;

// ---------- COMPONENT ----------
const MyAssessmentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // ----------- FETCHING -----------
  const normalizeArray = (res: any): AssessmentItem[] => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.assessments)) return res.assessments;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllAssessmentForStudent();
      const list = normalizeArray(res);
      setAssessments(list);
    } catch (err: any) {
      console.log("[getAllAssessmentForStudent] error:", err);
      setError(err?.message || "Failed to load assessments");
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAssessments();
    setRefreshing(false);
  }, []);

  // ----------- HELPERS -----------
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "—";
    const date = new Date(`1970-01-01T${timeStr}Z`);
    return isNaN(date.getTime())
      ? "—"
      : date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  const getTitle = (item: AssessmentItem) => item.title || "Untitled";
  const getCourse = (item: AssessmentItem) => item?.course?.courseTitle || "—";
  const getChapter = (item: AssessmentItem) => item?.chapter?.title || "—";
  const getDueDate = (item: AssessmentItem) => item?.dueDate || { date: "", time: "" };
  const getDescription = (item: AssessmentItem) => item.description || "No description provided.";
  const getType = (item: AssessmentItem) => {
    const type = item.type?.toLowerCase() ?? "";
    if (type.includes("chapter")) return "Chapter Assessment";
    if (type.includes("lesson")) return "Lesson Assessment";
    return "Assessment";
  };
  const getStatus = (item: AssessmentItem) => (item.isSubmitted ? "Submitted" : "Pending");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return assessments;
    return assessments.filter((a) => getTitle(a).toLowerCase().includes(q));
  }, [assessments, searchQuery]);

  // ---------- COMPONENTS ----------
  const StatusBadge = ({ status }: { status: string }) => {
    const isSubmitted = status.toLowerCase() === "submitted";
    return (
      <View
        style={[styles.badge, isSubmitted ? styles.badgeSuccess : styles.badgePending]}
      >
        <Text style={styles.badgeText} numberOfLines={1}>{isSubmitted ? "Submitted" : "Pending"}</Text>
      </View>
    );
  };

  const ExpandedDetails = ({ item }: { item: AssessmentItem }) => {
    const due = getDueDate(item);

    return (
      <View style={styles.expandedCard}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.sectionBody}>{getDescription(item)}</Text>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Course</Text>
        <Text style={styles.sectionBody}>{getCourse(item)}</Text>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Chapter</Text>
        <Text style={styles.sectionBody}>{getChapter(item)}</Text>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Category</Text>
        <Text style={styles.sectionBody}>
          {item.category.name} — {item.category.weight}%
        </Text>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Due Date</Text>
        <Text style={styles.sectionBody}>
          {formatDate(due.date)} at {formatTime(due.time)}
        </Text>

        {!item.isSubmitted && (
          <TouchableOpacity style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Submit Assessment</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const Row = ({
    item,
    rowKey,
    onPress,
  }: {
    item: AssessmentItem;
    rowKey: string;
    onPress: () => void;
  }) => {
    const title = getTitle(item);
    const course = getCourse(item);
    const status = getStatus(item);
    const type = getType(item);
    const due = getDueDate(item);
    const isOpen = !!expanded[rowKey];

    return (
      <View>
        <TouchableOpacity style={styles.row} onPress={onPress}>
          <Text style={[styles.td, styles.colName]} >
            {isOpen ? "⌄ " : "› "} {title}
          </Text>
          <Text style={[styles.td, styles.colCourse]} >
            {course}
          </Text>
          <Text style={[styles.td, styles.colDue]}>
            {formatDate(due.date)} {formatTime(due.time)}
          </Text>
          <View style={[styles.colStatus, styles.centered]}>
            <StatusBadge status={status} />
          </View>
          <Text style={[styles.td, styles.colType]}>{type}</Text>
        </TouchableOpacity>

        {isOpen && <ExpandedDetails item={item} />}
      </View>
    );
  };

  // ---------- UI ----------
  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Assessments</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by title"
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="small" color="#16A34A" />
          <Text style={styles.stateText}>Loading assessments...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateWrap}>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.stateWrap}>
          <Text style={styles.stateText}>No assessments available.</Text>
        </View>
      ) : (
        <>

          <TouchableOpacity style={styles.row}>
            <Text style={[styles.td, styles.colName]} >
              Assessment Name
            </Text>
            <Text style={[styles.td, styles.colCourse]} >
              Course
            </Text>
            <Text style={[styles.td, styles.colDue]}>
              Due Date
            </Text>
            <Text style={[styles.colStatus, styles.td]}>
              Status
            </Text>
            <Text style={[styles.td, styles.colType]}>Type</Text>
          </TouchableOpacity>
          <FlatList
            data={filtered}
            keyExtractor={(item, index) => item._id || `${index}`}
            renderItem={({ item, index }) => (
              <Row
                item={item}
                rowKey={item._id}
                onPress={() =>
                  setExpanded((prev) => ({ ...prev, [item._id]: !prev[item._id] }))
                }
              />
            )}
            scrollEnabled={false}
          />
        </>

      )}
    </ScrollView>
  );
};

// ---------- STYLES ----------
const COLORS = {
  green: "#16A34A",
  gray100: "#F3F4F6",
  gray600: "#4B5563",
  gray700: "#374151",
  white: "#FFFFFF",
  pendingBg: "#FEF3C7",
  successBg: "#DCFCE7",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
  },
  banner: {
    backgroundColor: COLORS.green,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  bannerText: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.gray100,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  td: {
    color: COLORS.gray700,
    fontSize: 14,
  },
  colName: { flex: 1.3, },
  colCourse: { flex: 1, },
  colDue: { flex: 1, },
  colStatus: { flex: 1, },
  colType: { flex: 1, },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgePending: { backgroundColor: COLORS.pendingBg },
  badgeSuccess: { backgroundColor: COLORS.successBg },
  badgeText: { color: COLORS.gray700, fontSize: 12, fontWeight: "700" },
  stateWrap: { alignItems: "center", padding: 20 },
  stateText: { color: COLORS.gray600 },
  expandedCard: {
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
  },
  sectionTitle: { fontWeight: "700", color: COLORS.gray700 },
  sectionBody: { color: COLORS.gray700, marginTop: 2 },
  submitBtn: {
    marginTop: 10,
    backgroundColor: COLORS.green,
    borderRadius: 8,
    padding: 10,
  },
  submitBtnText: { color: COLORS.white, fontWeight: "700" },
  centered: { alignItems: "center", justifyContent: "center" },
});

export default MyAssessmentsPage;

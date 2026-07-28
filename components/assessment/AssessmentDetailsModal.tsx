// // AssessmentDetailsModal.tsx

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Modal,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import SimpleIcon from "../SimpleIcon";
// import AssessmentSettingsModal from "./AssessmentSettingsModal";
// import AssesmentReminderModal from "./ReminderModal";
// import { getApiInstance } from "../../services/apiInstance";
// import Toast from "react-native-simple-toast";
// import {
//   sendManualReminder,
//   loadReminderSettings,
//   saveReminderSetting,
// } from "../../services/reminderService";

// interface AssessmentDetailsModalProps {
//   visible: boolean;
//   onClose: () => void;
//   assessment: any;
// }

// // HELPERS
// const groupByType = (questions: any[] = []) => {
//   const map: Record<string, any[]> = {};
//   questions?.forEach((q: any) => {
//     const t = q.type ?? "unknown";
//     if (!map[t]) map[t] = [];
//     map[t].push(q);
//   });
//   return map;
// };

// const typeLabel = (t: string) =>
//   t === "truefalse"
//     ? "TRUEFALSE"
//     : t === "mcq"
//     ? "MCQ"
//     : t === "file"
//     ? "FILE UPLOAD"
//     : t.toUpperCase();

// const formatFullDate = (d: string) =>
//   new Date(d).toLocaleDateString("en-US", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });

// // QUESTION GROUP
// const QuestionGroup: React.FC<{ type: string; questions: any[] }> = ({
//   type,
//   questions,
// }) => {
//   const [open, setOpen] = useState(true);
//   return (
//     <View style={grpStyles.wrapper}>
//       <TouchableOpacity
//         style={grpStyles.header}
//         onPress={() => setOpen((p) => !p)}
//       >
//         <View style={grpStyles.badge}>
//           <Text style={grpStyles.badgeText}>{typeLabel(type)}</Text>
//         </View>
//         <Text style={grpStyles.count}>{questions.length} items</Text>
//         <Text>{open ? "∧" : "∨"}</Text>
//       </TouchableOpacity>

//       {open &&
//         questions.map((q: any, i: number) => (
//           <View key={i} style={grpStyles.qCard}>
//             <Text style={grpStyles.qLabel}>Question:</Text>
//             <Text style={grpStyles.qText}>
//               {q.question?.replace(/<[^>]*>/g, "")}
//             </Text>
//           </View>
//         ))}
//     </View>
//   );
// };

// const grpStyles = StyleSheet.create({
//   wrapper: { marginBottom: 12 },
//   header: {
//     flexDirection: "row",
//     padding: 14,
//     borderWidth: 1,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   badge: {
//     backgroundColor: "#111",
//     padding: 6,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   badgeText: { color: "#fff", fontSize: 12 },
//   count: { flex: 1 },
//   qCard: { padding: 12, backgroundColor: "#f9fafb", marginTop: 6 },
//   qLabel: { fontWeight: "bold" },
//   qText: { marginTop: 4 },
// });

// // MAIN
// const AssessmentDetailsModal: React.FC<AssessmentDetailsModalProps> = ({
//   visible,
//   onClose,
//   assessment,
// }) => {
//   if (!assessment) return null;
//   const insets = useSafeAreaInsets();

//   const grouped = groupByType(assessment.questions ?? []);

//   useEffect(() => {
//     console.log("hi this is assessment details modal screen!");
//   }, []);
//   // const { assessmentid } = useParams();

//   // ✅ CORRECT STATE
//   const [settingsVisible, setSettingsVisible] = useState(false);
//   const [reminderVisible, setReminderVisible] = useState(false);
//   const [loadingReminder, setLoadingReminder] = useState(false);
//   const [statusMessage, setStatusMessage] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 1. Guard clause to ensure the ID exists before making the call
//   const assessmentId = assessment?._id;

//   // ✅ Logic for sending manual reminder email
//   const handleSendManualReminder = async () => {
//     if (!assessmentId) return;
//     setLoadingReminder(true);
//     try {
//       const data = await sendManualReminder(assessmentId);
//       Toast.show(data.message || "Reminders sent!");
//     } catch (err: any) {
//       Toast.show(err.response?.data?.message || "Failed to send");
//     } finally {
//       setLoadingReminder(false);
//     }
//   };

//   const handleSaveReminderSetting = async (reminderValue) => {
//     if (!assessmentId) {
//       Toast.show("Error: Assessment ID not found", Toast.LONG);
//       return;
//     }

//     try {
//       const data = await saveReminderSetting;

//       // 2. Optional: Verify success status if your API requires it
//       Toast.show("Reminder setting saved", Toast.LONG);
//     } catch (error) {
//       console.error("Failed to save reminder setting:", error);
//       Toast.show("Failed to save reminder setting", Toast.LONG);
//     }
//   };

//   const handleGetManualReminder = async () => {
//     if (!assessment?._id) return;
//     setLoadingReminder(true);
//     try {
//       const data = await loadReminderSettings(assessment.Id);
//       Toast.show(data.message || "Reminders sent!");
//     } catch (err: any) {
//       Toast.show(err.response?.data?.message || "Failed to send");
//     } finally {
//       setLoadingReminder(false);
//     }
//   };

//   return (
//     <Modal visible={visible} animationType="slide">
//       <View style={[styles.container, { paddingTop: insets.top || 20 }]}>
//         {/* BACK BUTTON */}
//         <TouchableOpacity style={styles.backBtn} onPress={onClose}>
//           <SimpleIcon name="arrow-back" size={18} color="#111" />
//         </TouchableOpacity>

//         {/* ACTION BAR */}
//         <View style={styles.actionBar}>
//           <TouchableOpacity style={styles.iconBtn}>
//             <SimpleIcon name="edit" size={18} color="#374151" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.outlineBtn}
//             onPress={handleSendManualReminder}
//             disabled={loadingReminder}
//           >
//             <SimpleIcon name="notifications" size={14} color="#3B82F6" />
//             <Text style={styles.blueText}>Remind Now</Text>
//           </TouchableOpacity>

//           {/* <TouchableOpacity
//             style={styles.outlineBtn}
//             onPress={() => setReminderVisible(true)}
//           >
//             <Text style={styles.normalText}>Set Reminder</Text>
//           </TouchableOpacity> */}

//           <AssesmentReminderModal
//             visible={reminderVisible}
//             onClose={() => setReminderVisible(false)}
//             assessmentId={assessment?._id}
//           />

//           {/* ✅ OPEN MODAL */}
//           <TouchableOpacity
//             style={styles.solidBtn}
//             onPress={() => setSettingsVisible(true)}
//           >
//             <SimpleIcon name="settings" size={14} color="#fff" />
//             <Text style={styles.whiteText}>Setting</Text>
//           </TouchableOpacity>
//         </View>

//         {/* CONTENT */}
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           <Text style={styles.title}>{assessment.title}</Text>

//           {assessment.category?.name && (
//             <View style={styles.tag}>
//               <Text>{assessment.category.name}</Text>
//             </View>
//           )}

//           <Text style={styles.dueDate}>
//             Due Date:{" "}
//             {assessment.dueDate?.date
//               ? formatFullDate(assessment.dueDate.date)
//               : "—"}
//           </Text>

//           <View style={styles.divider} />

//           {assessment.description && (
//             <View style={styles.instructionsCard}>
//               <Text style={styles.instructionsTitle}>Instructions</Text>
//               <Text>{assessment.description}</Text>
//             </View>
//           )}

//           {Object.keys(grouped).map((type) => (
//             <QuestionGroup key={type} type={type} questions={grouped[type]} />
//           ))}
//         </ScrollView>

//         {/* ✅ SETTINGS MODAL */}
//         <AssessmentSettingsModal
//           visible={settingsVisible} // ✅ boolean
//           onClose={() => setSettingsVisible(false)}
//         />
//       </View>
//     </Modal>
//   );
// };

// // STYLES
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },

//   backBtn: {
//     position: "absolute",
//     top: 10,
//     left: 16,
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 3,
//     zIndex: 10,
//   },

//   actionBar: {
//     marginTop: 15,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//   },

//   iconBtn: { padding: 8, borderWidth: 1, borderRadius: 8 },
//   outlineBtn: {
//     flexDirection: "row",
//     padding: 8,
//     borderWidth: 1,
//     borderRadius: 8,
//     gap: 4,
//   },
//   solidBtn: {
//     flexDirection: "row",
//     padding: 8,
//     backgroundColor: "#3B82F6",
//     borderRadius: 8,
//     gap: 4,
//   },

//   blueText: { color: "#3B82F6", fontSize: 12 },
//   normalText: { fontSize: 12 },
//   whiteText: { color: "#fff", fontSize: 12 },

//   scrollContent: { padding: 16 },

//   title: { fontSize: 24, fontWeight: "bold" },

//   tag: {
//     marginTop: 6,
//     backgroundColor: "#eee",
//     padding: 6,
//     alignSelf: "flex-start",
//   },

//   dueDate: { marginTop: 6, color: "#666" },

//   divider: { height: 1, backgroundColor: "#eee", marginVertical: 12 },

//   instructionsCard: {
//     padding: 12,
//     backgroundColor: "#EFF6FF",
//     borderLeftWidth: 4,
//     borderLeftColor: "#3B82F6",
//   },

//   instructionsTitle: { fontWeight: "bold" },
// });

// export default AssessmentDetailsModal;

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SimpleIcon from "../SimpleIcon";
import AssessmentSettingsModal from "./AssessmentSettingsModal";
import ReminderModal from "./ReminderModal";
import { sendManualReminder } from "../../services/reminderService";
import Toast from "react-native-simple-toast";

interface Props {
  visible: boolean;
  onClose: () => void;
  assessment: any;
  onEdit?: (assessment: any) => void;
}

// ── Helpers (unchanged) ──────────────────────────────────────────────────────
const groupByType = (questions: any[] = []) => {
  const map: Record<string, any[]> = {};
  questions?.forEach((q: any) => {
    const t = q.type ?? "unknown";
    if (!map[t]) map[t] = [];
    map[t].push(q);
  });
  return map;
};

const typeLabel = (t: string) =>
  t === "truefalse"
    ? "TRUEFALSE"
    : t === "mcq"
    ? "MCQ"
    : t === "file"
    ? "FILE UPLOAD"
    : t.toUpperCase();

const formatFullDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const QuestionGroup: React.FC<{ type: string; questions: any[] }> = ({
  type,
  questions,
}) => {
  const [open, setOpen] = useState(true);
  return (
    <View style={grpStyles.wrapper}>
      <TouchableOpacity
        style={grpStyles.header}
        onPress={() => setOpen((p) => !p)}
      >
        <View style={grpStyles.badge}>
          <Text style={grpStyles.badgeText}>{typeLabel(type)}</Text>
        </View>
        <Text style={grpStyles.count}>{questions.length} items</Text>
        <Text>{open ? "∧" : "∨"}</Text>
      </TouchableOpacity>
      {open &&
        questions.map((q: any, i: number) => (
          <View key={i} style={grpStyles.qCard}>
            <Text style={grpStyles.qLabel}>
              {q.type === "file" ? "Instruction:" : "Question:"}
            </Text>
            <Text style={grpStyles.qText}>
              {q.question?.replace(/<[^>]*>/g, "")}
            </Text>

            {q.type === "mcq" &&
              q.options?.map((option: string, oi: number) => {
                const isCorrect = q.correctAnswer === option?.toString();
                return (
                  <View
                    key={oi}
                    style={[
                      grpStyles.optionRow,
                      isCorrect
                        ? grpStyles.optionRowCorrect
                        : grpStyles.optionRowDefault,
                    ]}
                  >
                    <Text
                      style={[
                        grpStyles.optionText,
                        isCorrect && grpStyles.optionTextCorrect,
                      ]}
                    >
                      {String.fromCharCode(65 + oi)}. {option}
                    </Text>
                    {isCorrect && (
                      <View style={grpStyles.correctBadge}>
                        <Text style={grpStyles.correctBadgeText}>
                          Correct Answer
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}

            {(q.type === "qa" || q.type === "truefalse") && (
              <View style={grpStyles.correctAnswerBox}>
                <Text style={grpStyles.correctAnswerLabel}>
                  Correct Answer:
                </Text>
                <Text style={grpStyles.correctAnswerValue}>
                  {q.type === "truefalse"
                    ? q.correctAnswer === "true"
                      ? "True"
                      : "False"
                    : q.correctAnswer || "—"}
                </Text>
              </View>
            )}

            {q.type === "file" && q.files?.length > 0 && (
              <View style={{ marginTop: 8 }}>
                {q.files.map((file: any, fi: number) => (
                  <TouchableOpacity
                    key={fi}
                    style={grpStyles.fileRow}
                    onPress={() => Linking.openURL(file.url)}
                  >
                    <SimpleIcon name="description" size={16} color="#3b82f6" />
                    <Text style={grpStyles.fileName}>{file.filename}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
    </View>
  );
};

const grpStyles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  header: {
    flexDirection: "row",
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  badge: {
    backgroundColor: "#111",
    padding: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  badgeText: { color: "#fff", fontSize: 12 },
  count: { flex: 1 },
  qCard: { padding: 12, backgroundColor: "#f9fafb", marginTop: 6 },
  qLabel: { fontWeight: "bold" },
  qText: { marginTop: 4 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 6,
  },
  optionRowDefault: { backgroundColor: "#fff", borderColor: "#e5e7eb" },
  optionRowCorrect: { backgroundColor: "#DCFCE7", borderColor: "#BBF7D0" },
  optionText: { fontSize: 13, color: "#374151", flexShrink: 1 },
  optionTextCorrect: { color: "#166534", fontWeight: "700" },
  correctBadge: {
    backgroundColor: "#16A34A",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  correctBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  correctAnswerBox: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  correctAnswerLabel: { fontWeight: "700", color: "#166534", fontSize: 12 },
  correctAnswerValue: {
    color: "#166534",
    fontSize: 14,
    marginTop: 2,
    textTransform: "capitalize",
  },
  fileRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 6 },
  fileName: { color: "#3b82f6", textDecorationLine: "underline", fontSize: 13 },
});

// ── Main component ───────────────────────────────────────────────────────────
const AssessmentDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  assessment,
  onEdit,
}) => {
  const insets = useSafeAreaInsets();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  if (!assessment) return null;

  const grouped = groupByType(assessment.questions ?? []);

  const handleRemindNow = async () => {
    if (!assessment._id) return;
    setSendingReminder(true);
    try {
      const data = await sendManualReminder(assessment._id);
      Toast.show(data.message || "Reminders sent!", Toast.LONG);
    } catch (err: any) {
      Toast.show(
        err.response?.data?.message || "Failed to send reminder",
        Toast.LONG
      );
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        {/* Header: back button on its own row, never overlapping the action bar */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <SimpleIcon name="arrow-back" size={18} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Action bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => onEdit?.(assessment)}
          >
            <SimpleIcon name="edit" size={14} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={handleRemindNow}
            disabled={sendingReminder}
          >
            <SimpleIcon name="notifications" size={14} color="#000" />
            <Text style={styles.greenText}>
              {sendingReminder ? "Sending..." : "Remind Now"}
            </Text>
          </TouchableOpacity>

          {/* Self‑contained Reminder Modal – only needs assessment ID */}
          <ReminderModal assessmentId={assessment._id} />

          <TouchableOpacity
            style={styles.solidBtn}
            onPress={() => setSettingsVisible(true)}
          >
            <SimpleIcon name="settings" size={14} color="#fff" />
            <Text style={styles.whiteText}>Setting</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Text style={styles.title}>{assessment.title}</Text>

          {assessment.category?.name && (
            <View style={styles.tag}>
              <Text>{assessment.category.name}</Text>
            </View>
          )}

          <Text style={styles.dueDate}>
            Due Date:{" "}
            {assessment.dueDate?.date
              ? formatFullDate(assessment.dueDate.date)
              : "—"}
          </Text>

          <View style={styles.divider} />

          {assessment.description && (
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>Instructions</Text>
              <Text>{assessment.description}</Text>
            </View>
          )}

          {Object.keys(grouped).map((type) => (
            <QuestionGroup key={type} type={type} questions={grouped[type]} />
          ))}
        </ScrollView>

        <AssessmentSettingsModal
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          assessment={assessment}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  iconBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    backgroundColor: "#fff",
    gap: 4,
  },
  solidBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#10B144",
    borderRadius: 8,
    gap: 4,
  },
  greenText: { color: "#000", fontSize: 13, fontWeight: "600" },
  whiteText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  scrollContent: { padding: 16 },
  title: { fontSize: 24, fontWeight: "bold" },
  tag: {
    marginTop: 6,
    backgroundColor: "#eee",
    padding: 6,
    alignSelf: "flex-start",
  },
  dueDate: { marginTop: 6, color: "#666" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 12 },
  instructionsCard: {
    padding: 12,
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 4,
    borderLeftColor: "#10B144",
  },
  instructionsTitle: { fontWeight: "bold" },
});

export default AssessmentDetailsModal;

// AssessmentDetailsModal.tsx

import React, { useState } from 'react';
import {
  View, Text, Modal, ScrollView,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SimpleIcon from '../SimpleIcon';
import AssessmentSettingsModal from './AssessmentSettingsModal';

interface AssessmentDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  assessment: any;
}

// HELPERS
const groupByType = (questions: any[] = []) => {
  const map: Record<string, any[]> = {};
  questions?.forEach((q: any) => {
    const t = q.type ?? 'unknown';
    if (!map[t]) map[t] = [];
    map[t].push(q);
  });
  return map;
};

const typeLabel = (t: string) =>
  t === 'truefalse' ? 'TRUEFALSE'
  : t === 'mcq' ? 'MCQ'
  : t === 'file' ? 'FILE UPLOAD'
  : t.toUpperCase();

const formatFullDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// QUESTION GROUP
const QuestionGroup: React.FC<{ type: string; questions: any[] }> = ({ type, questions }) => {
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
        <Text>{open ? '∧' : '∨'}</Text>
      </TouchableOpacity>

      {open && questions.map((q: any, i: number) => (
        <View key={i} style={grpStyles.qCard}>
          <Text style={grpStyles.qLabel}>Question:</Text>
          <Text style={grpStyles.qText}>
            {q.question?.replace(/<[^>]*>/g, '')}
          </Text>
        </View>
      ))}
    </View>
  );
};

const grpStyles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  header: {
    flexDirection: 'row',
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  badge: { backgroundColor: '#111', padding: 6, borderRadius: 6, marginRight: 10 },
  badgeText: { color: '#fff', fontSize: 12 },
  count: { flex: 1 },
  qCard: { padding: 12, backgroundColor: '#f9fafb', marginTop: 6 },
  qLabel: { fontWeight: 'bold' },
  qText: { marginTop: 4 },
});

// MAIN
const AssessmentDetailsModal: React.FC<AssessmentDetailsModalProps> = ({
  visible, onClose, assessment,
}) => {
  const insets = useSafeAreaInsets();

  // ✅ CORRECT STATE
  const [settingsVisible, setSettingsVisible] = useState(false);

  if (!assessment) return null;

  const grouped = groupByType(assessment.questions ?? []);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { paddingTop: insets.top || 20 }]}>

        {/* BACK BUTTON */}
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <SimpleIcon name="arrow-back" size={18} color="#111" />
        </TouchableOpacity>

        {/* ACTION BAR */}
        <View style={styles.actionBar}>

          <TouchableOpacity style={styles.iconBtn}>
            <SimpleIcon name="edit" size={18} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn}>
            <SimpleIcon name="notifications" size={14} color="#3B82F6" />
            <Text style={styles.blueText}>Remind Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={styles.normalText}>Set Reminder</Text>
          </TouchableOpacity>

          {/* ✅ OPEN MODAL */}
          <TouchableOpacity
            style={styles.solidBtn}
            onPress={() => setSettingsVisible(true)}
          >
            <SimpleIcon name="settings" size={14} color="#fff" />
            <Text style={styles.whiteText}>Setting</Text>
          </TouchableOpacity>

        </View>

        {/* CONTENT */}
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <Text style={styles.title}>{assessment.title}</Text>

          {assessment.category?.name && (
            <View style={styles.tag}>
              <Text>{assessment.category.name}</Text>
            </View>
          )}

          <Text style={styles.dueDate}>
            Due Date: {assessment.dueDate?.date
              ? formatFullDate(assessment.dueDate.date)
              : '—'}
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

        {/* ✅ SETTINGS MODAL */}
        <AssessmentSettingsModal
          visible={settingsVisible}   // ✅ boolean
          onClose={() => setSettingsVisible(false)}
        />

      </View>
    </Modal>
  );
};

// STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  backBtn: {
    position: 'absolute',
    top: 10,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    zIndex: 10,
  },

  actionBar: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  iconBtn: { padding: 8, borderWidth: 1, borderRadius: 8 },
  outlineBtn: { flexDirection: 'row', padding: 8, borderWidth: 1, borderRadius: 8, gap: 4 },
  solidBtn: { flexDirection: 'row', padding: 8, backgroundColor: '#3B82F6', borderRadius: 8, gap: 4 },

  blueText: { color: '#3B82F6', fontSize: 12 },
  normalText: { fontSize: 12 },
  whiteText: { color: '#fff', fontSize: 12 },

  scrollContent: { padding: 16 },

  title: { fontSize: 24, fontWeight: 'bold' },

  tag: { marginTop: 6, backgroundColor: '#eee', padding: 6, alignSelf: 'flex-start' },

  dueDate: { marginTop: 6, color: '#666' },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },

  instructionsCard: {
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },

  instructionsTitle: { fontWeight: 'bold' },
});

export default AssessmentDetailsModal;
import React from 'react';
import {
  Modal, KeyboardAvoidingView, View, Text,
  TouchableOpacity, StyleSheet, Platform, Dimensions,
} from 'react-native';
import { COLORS } from './mnt/user-data/outputs/SpillTheTea/constants';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface BottomSheetProps {
  visible:  boolean;
  onClose:  () => void;
  title:    string;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ visible, onClose, title, children }) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent
    statusBarTranslucent
    onRequestClose={onClose}
  >
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Tap outside the sheet to dismiss */}
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        {children}
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.modalOverlay,
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    overflow: 'hidden',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  title:    { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  closeBtn: { fontSize: 18, color: COLORS.textLight },
});

export default BottomSheet;

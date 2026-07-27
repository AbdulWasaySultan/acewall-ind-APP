/**
 * CreatePostModal
 *
 * Folder structure:
 *   CreatePostModal/
 *     index.tsx          ← this file (main modal + state)
 *     types.ts           ← PostTarget, MediaFile, CreatePostPayload
 *     TargetToggle.tsx   ← Public Feed / Course Class switcher
 *     TextEditor.tsx     ← multiline TextInput + char/word counter
 *     MediaPicker.tsx    ← Photo / Video library picker buttons
 *     MediaGrid.tsx      ← horizontal scroll of selected thumbnails
 *
 * Usage:
 *   <CreatePostModal
 *     visible={open}
 *     onClose={() => setOpen(false)}
 *     onSubmit={({ content, target, media }) => api.post('/posts', ...)}
 *   />
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView,
  KeyboardAvoidingView, Platform, Alert, StyleSheet,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';

import TargetToggle from './TargetToggle';
import TextEditor   from './TextEditor';
import MediaPicker  from './MediaPicker';
import MediaGrid    from './MediaGrid';
import { CreatePostPayload, MediaFile, PostTarget } from './types';

// ─────────────────────────────────────────────────────────────────────────────

interface CreatePostModalProps {
  visible:  boolean;
  onClose:  () => void;
  onSubmit: (payload: CreatePostPayload) => void;
}

const INITIAL_STATE = {
  target:  'public' as PostTarget,
  content: '',
  media:   [] as MediaFile[],
};

// ─────────────────────────────────────────────────────────────────────────────

const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose, onSubmit }) => {

  const [target,  setTarget]  = useState<PostTarget>('public');
  const [content, setContent] = useState('');
  const [media,   setMedia]   = useState<MediaFile[]>([]);

  // ── Reset all state on close ──
  const handleClose = () => {
    setTarget(INITIAL_STATE.target);
    setContent(INITIAL_STATE.content);
    setMedia(INITIAL_STATE.media);
    onClose();
  };

  // ── Add a picked media file ──
  const handleAddMedia = (file: MediaFile) =>
    setMedia((prev) => [...prev, file]);

  // ── Remove a media file by index ──
  const handleRemoveMedia = (index: number) =>
    setMedia((prev) => prev.filter((_, i) => i !== index));

  // ── Validate & submit ──
  const handleSubmit = () => {
    if (!content.trim() && media.length === 0) {
      Alert.alert('Empty post', 'Please write something or add a photo/video.');
      return;
    }
    onSubmit({ content: content.trim(), target, media });
    handleClose();
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
          >

            {/* ── Header ── */}
            <View style={styles.header}>
              <Text style={styles.title}>Create New Post</Text>
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={26} color="#555" />
              </TouchableOpacity>
            </View>

            {/* ── Public Feed / Course Class toggle ── */}
            <TargetToggle value={target} onChange={setTarget} />

            {/* ── Multiline text input ── */}
            <TextEditor value={content} onChange={setContent} />

            {/* ── Selected media thumbnails ── */}
            <MediaGrid files={media} onRemove={handleRemoveMedia} />

            {/* ── Photo / Video picker buttons ── */}
            <MediaPicker onAdd={handleAddMedia} />

          </ScrollView>

          {/* ── Share Post — sticky at bottom ── */}
          <TouchableOpacity style={styles.shareBtn} onPress={handleSubmit}>
            <Text style={styles.shareBtnText}>Share Post</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  title:        { fontSize: 22, fontWeight: '800', color: '#0d1b2a' },
  shareBtn: {
    backgroundColor: '#10B144',
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 20,
  },
  shareBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});

export default CreatePostModal;

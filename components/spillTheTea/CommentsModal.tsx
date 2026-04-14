import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import BottomSheet from './BottomSheet';
import Avatar      from './Avatar';

import { getPostComments }         from '../../services/socialPosts';
import { Post } from '.';
import { COLORS } from './mnt/user-data/outputs/SpillTheTea/constants';
import { formatDate, getFullName } from './mnt/user-data/outputs/SpillTheTea/helpers';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface CommentsModalProps {
  visible:      boolean;
  post:         Post | null;
  onClose:      () => void;
  onAddComment: (postId: string, text: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const CommentsModal: React.FC<CommentsModalProps> = ({
  visible, post, onClose, onAddComment,
}) => {
  const [text,     setText]     = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);

  // ── Fetch comments from API when modal opens ──────────────────────────────
  useEffect(() => {
    if (!visible || !post?._id) return;

    const fetchComments = async () => {
      setLoading(true);
      try {
        const data = await getPostComments(post._id);
        // API returns { comments: [] } or plain []
        setComments(data.comments ?? data ?? []);
      } catch (e) {
        console.warn('Failed to load comments:', e);
        // Fall back to comments already on the post object
        setComments(post.comments ?? []);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [visible, post?._id]);

  // ── Reset when modal closes ───────────────────────────────────────────────
  useEffect(() => {
    if (!visible) {
      setText('');
      setComments([]);
    }
  }, [visible]);

  // ── Submit comment ────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!text.trim() || !post) return;

    // Optimistic — add to local list immediately
    const optimisticComment = {
      _id:       Date.now().toString(),
      text:      text.trim(),
      author:    { _id: 'me', firstName: 'You', lastName: '' },
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, optimisticComment]);

    // Call parent handler → API
    onAddComment(post._id, text.trim());
    setText('');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Comments">

      {/* ── Comment list ── */}
      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          size="small"
          color={COLORS.primary}
        />
      ) : (
        <FlatList
          data={comments}
          showsVerticalScrollIndicator={false}
          keyExtractor={(c) => c._id}
          style={{ maxHeight: 320 }}
          ListEmptyComponent={
            <Text style={styles.empty}>No comments yet. Be the first!</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Avatar uri={item.author?.profileImg?.url} size={34} />
              <View style={styles.bubble}>
                <Text style={styles.author}>
                  {getFullName(item.author)}
                </Text>
                {/* API uses "text" field — fallback to "content" for safety */}
                <Text style={styles.commentText}>
                  {item.text ?? item.content}
                </Text>
                <Text style={styles.date}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            </View>
          )}
        />
      )}

      {/* ── Comment input ── */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Write a comment…"
          placeholderTextColor={COLORS.textFaint}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSubmit}
          disabled={!text.trim()}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>

    </BottomSheet>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loader:          { marginVertical: 24 },
  empty:           { textAlign: 'center', color: COLORS.textFaint, marginVertical: 24, fontSize: 14 },
  row:             { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
  bubble:          { flex: 1, marginLeft: 10, backgroundColor: COLORS.commentBg, borderRadius: 10, padding: 10 },
  author:          { fontWeight: '700', fontSize: 13, color: COLORS.textDark, marginBottom: 2 },
  commentText:     { fontSize: 14, color: '#333', lineHeight: 20 },
  date:            { fontSize: 11, color: COLORS.textFaint, marginTop: 4 },
  inputRow:        { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 12 },
  input: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: '#333', maxHeight: 100,
  },
  sendBtn:         { backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  sendBtnDisabled: { opacity: 0.4 },
  sendText:        { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});

export default CommentsModal;
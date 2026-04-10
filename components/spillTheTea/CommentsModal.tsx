import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet from './BottomSheet';
import Avatar from './Avatar';
import { Post } from '.';
import { formatDate, getFullName } from './mnt/user-data/outputs/SpillTheTea/helpers';
import { COLORS } from './mnt/user-data/outputs/SpillTheTea/constants';


interface CommentsModalProps {
  visible:      boolean;
  post:         Post | null;
  onClose:      () => void;
  onAddComment: (postId: string, text: string) => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ visible, post, onClose, onAddComment }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim() || !post) return;
    onAddComment(post._id, text.trim());
    setText('');
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Comments">

      {/* Comment list */}
      <FlatList
        data={post?.comments ?? []}
        keyExtractor={(c) => c._id}
        style={{ maxHeight: 320 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No comments yet. Be the first!</Text>
        }
         renderItem={({ item }) => (
          <View style={styles.row}>
            <Avatar uri={item.author?.profileImg?.url} size={34} />
            <View style={styles.bubble}>
              <Text style={styles.author}>{getFullName(item.author)}</Text>
              <Text style={styles.text}>{item.content}</Text>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
        )}
      />

      {/* Comment input */}
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

const styles = StyleSheet.create({
  empty:           { textAlign: 'center', color: COLORS.textFaint, marginVertical: 24, fontSize: 14 },
  row:             { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
  bubble:          { flex: 1, marginLeft: 10, backgroundColor: COLORS.commentBg, borderRadius: 10, padding: 10 },
  author:          { fontWeight: '700', fontSize: 13, color: COLORS.textDark, marginBottom: 2 },
  text:            { fontSize: 14, color: '#333', lineHeight: 20 },
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

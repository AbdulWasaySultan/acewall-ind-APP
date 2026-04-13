import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from './Avatar';


import { capitalize, formatDate, getFullName } from './mnt/user-data/outputs/SpillTheTea/helpers';
import { Post } from '.';
import { COLORS } from './mnt/user-data/outputs/SpillTheTea/constants';




// Fix 2 — strip HTML helper
const stripHtml = (html: string) =>
  html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() ?? '';

interface PostCardProps {
  post:           Post;
  currentUserId:  string;
  onLike:         (postId: string) => void;
  onCommentPress: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onLike, onCommentPress }) => {
  const isLiked      = (post.likes    ?? []).includes(currentUserId);
  const commentCount = (post.comments ?? []).length;
  const plainText    = stripHtml(post.text); //  use text not content

  return (
    <View style={styles.container}>

      {/* Author row */}
      <View style={styles.authorRow}>
        <Avatar uri={post.author?.profileImg?.url} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>
            {getFullName(post.author)}
            {post.author.role && (
              <Text style={styles.authorRole}> {capitalize(post.author.role)}</Text>
            )}
          </Text>
          <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
        </View>
      </View>

      {/*  show plain text instead of raw HTML */}
      <Text style={styles.content}>{plainText}</Text>
      <View style={styles.divider} />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post._id)}>
          <Text>👍</Text>
          <Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
            Like ({(post.likes ?? []).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => onCommentPress(post)}>
          <Text>💬</Text>
          <Text style={styles.actionText}>
            {commentCount} Comment{commentCount !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white, borderRadius: 12,
    padding: 18, marginBottom: 16,
    shadowColor: COLORS.cardShadow, shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  authorRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  authorInfo:      { marginLeft: 12, flex: 1 },
  authorName:      { fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  authorRole:      { fontWeight: '400', color: COLORS.textMid },
  date:            { fontSize: 12, color: COLORS.textFaint, marginTop: 2 },
  content:         { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 14 },
  divider:         { height: 1, backgroundColor: COLORS.divider, marginBottom: 12 },
  actions:         { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText:      { fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
  actionTextLiked: { color: COLORS.primary, fontWeight: '700' },
});

export default PostCard;
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import PostAuthorRow               from './PostAuthorRow';
import AssetGrid                   from './AssetGrid';
import PostActions                 from './PostActions';
import { Post } from '.';
import { COLORS } from './mnt/user-data/outputs/SpillTheTea/constants';

// ── Icon wrapper ──────────────────────────────────────────────────────────────
const Icon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => (
  <MaterialIcons name={name as any} size={size} color={color} />
);

// ── Strip HTML (same as PostCard) ─────────────────────────────────────────────
const stripHtml = (html: string) =>
  html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() ?? '';

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────
interface ProfilePostCardProps {
  post:          Post;
  currentUserId: string;
  onDelete:      (postId: string) => void;
  onLike:        (postId: string) => void;
  onCommentPress: (post: Post) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ProfilePostCard: React.FC<ProfilePostCardProps> = ({
  post, currentUserId, onDelete, onLike, onCommentPress,
}) => {
  const isLiked      = (post.likes    ?? []).includes(currentUserId);
  const commentCount = (post.comments ?? []).length;
  const plainText    = stripHtml(post.text ?? post.content ?? '');

  return (
    <View style={styles.card}>

      {/* ── Author row + delete button ── */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <PostAuthorRow
            author={post.author}
            createdAt={post.createdAt}
          />
        </View>

        {/* Delete button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(post._id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="delete" size={22} color="#e53935" />
        </TouchableOpacity>
      </View>

      {/* ── Text content ── */}
      {plainText.length > 0 && (
        <Text style={styles.content}>{plainText}</Text>
      )}

      {/* ── Assets (images / videos) — same as PostCard ── */}
      <AssetGrid assets={post.assets ?? []} isVisible={true} />

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Like + Comment — same as PostCard ── */}
      <PostActions
        likeCount={post.likes?.length ?? 0}
        totalLikes={post.totalLikes}
        userReaction={post.userReaction}
        commentCount={commentCount}
        totalComments={post.totalComments}
        isLiked={isLiked}
        onLike={() => onLike(post._id)}
        onComment={() => onCommentPress(post)}
      />

    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: COLORS.cardShadow,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems:   'flex-start',
    marginBottom:  0,
  },
  deleteBtn: { padding: 4, marginTop: 4 },
  content: {
    fontSize: 15, color: '#333',
    lineHeight: 22, marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginBottom: 12,
  },
});

export default ProfilePostCard;
import React from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Post } from '.';


// ── Typed icon wrapper ──
const Icon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => (
  <MaterialIcons name={name as any} size={size} color={color} />
);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'numeric', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

const getFullName = (post: Post) =>
  [post.author?.firstName, post.author?.lastName].filter(Boolean).join(' ') || 'Unknown';

interface ProfilePostCardProps {
  post:     Post;
  onDelete: (postId: string) => void;
  onLike:   (postId: string) => void;
  currentUserId: string;
}

const ProfilePostCard: React.FC<ProfilePostCardProps> = ({
  post, onDelete, onLike, currentUserId,
}) => {
  const isLiked      = post.likes.includes(currentUserId);
  const commentCount = post.comments.length;

  const confirmDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(post._id) },
      ]
    );
  };

  return (
    <View style={styles.card}>

      {/* ── Author row + delete button ── */}
      <View style={styles.authorRow}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {post.author?.profileImg?.url
            ? <Image source={{ uri: post.author.profileImg.url }} style={styles.avatar} />
            : <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {post.author?.firstName?.charAt(0).toUpperCase() ?? '?'}
                </Text>
              </View>
          }
        </View>

        {/* Name + date */}
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{getFullName(post)}</Text>
          <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
        </View>

        {/* Delete button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={confirmDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="delete" size={22} color="#e53935" />
        </TouchableOpacity>
      </View>

      {/* ── Post content ── */}
      <Text style={styles.content}>{post.content}</Text>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Actions ── */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post._id)}>
          <Text style={styles.likeEmoji}>👍</Text>
          <Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
            Like ({post.likes.length})
          </Text>
        </TouchableOpacity>

        <View style={styles.actionBtn}>
          <Icon name="chat-bubble-outline" size={18} color="#888" />
          <Text style={styles.actionText}>
            {commentCount} Comment{commentCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  authorRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarWrapper:  { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', marginRight: 12 },
  avatar:         { width: '100%', height: '100%' },
  avatarFallback: { width: '100%', height: '100%', backgroundColor: '#BBDEFB', alignItems: 'center', justifyContent: 'center' },
  avatarInitial:  { fontSize: 18, fontWeight: '800', color: '#1565C0' },
  authorInfo:     { flex: 1 },
  authorName:     { fontSize: 15, fontWeight: '700', color: '#0d1b2a' },
  date:           { fontSize: 12, color: '#9e9e9e', marginTop: 2 },
  deleteBtn:      { padding: 4 },
  content:        { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 14 },
  divider:        { height: 1, backgroundColor: '#e8e8e8', marginBottom: 12 },
  actions:        { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeEmoji:      { fontSize: 16 },
  actionText:     { fontSize: 14, color: '#888', fontWeight: '500' },
  actionTextLiked:{ color: '#1565C0', fontWeight: '700' },
});

export default ProfilePostCard;
import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, ScrollView, Modal,
  StatusBar, SafeAreaView, Dimensions,
} from 'react-native';



import { capitalize, formatDate, getFullName } from './mnt/user-data/outputs/SpillTheTea/helpers';
import { Post } from '.';
import { COLORS } from './mnt/user-data/outputs/SpillTheTea/constants';
import Video from 'react-native-video';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

import PostAuthorRow from './PostAuthorRow';
import AssetGrid from './AssetGrid';
import PostActions from './PostActions';



// ── Strip HTML from post text ─────────────────────────────────────────────────
const stripHtml = (html: string) =>
  html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() ?? '';

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────
interface PostCardProps {
  post: Post;
  currentUserId: string;
  isVisible: boolean;   // from FlatList viewability — drives video autoplay
  onLike: (postId: string) => void;
  onCommentPress: (post: Post) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const PostCard: React.FC<PostCardProps> = ({
  post, currentUserId, isVisible, onLike, onCommentPress,
}) => {
  const isLiked = (post.likes ?? []).includes(currentUserId);
  const commentCount = (post.comments ?? []).length;
  const plainText = stripHtml(post.text);

  return (
    <View style={styles.container}>

      {/* Author avatar + name + date */}
      <PostAuthorRow
        author={post.author}
        createdAt={post.createdAt}
      />

      {/* Text body (stripped of HTML) */}
      {plainText.length > 0 && (
        <Text style={styles.content}>{plainText}</Text>
      )}

      {/* Images / Videos */}
      <AssetGrid assets={post.assets} isVisible={isVisible} />

      {/* Divider */}
      <View style={styles.divider} />

      {/* Like + Comment */}
      <PostActions
        likeCount={post.likes?.length ?? 0}
        totalLikes={post.totalLikes}
        userReaction={post.userReaction}
        commentCount={post.comments?.length ?? 0}
        totalComments={post.totalComments}      // ← add this
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
  container: {
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

export default PostCard;
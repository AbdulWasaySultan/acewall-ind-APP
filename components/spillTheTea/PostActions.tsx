import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "./mnt/user-data/outputs/SpillTheTea/constants";

interface PostActionsProps {
  likeCount: number;
  totalLikes?: number;
  userReaction?: string | null;
  commentCount: number;
  totalComments?: number; // ← add this
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
}

const PostActions: React.FC<PostActionsProps> = ({
  likeCount,
  totalLikes,
  userReaction,
  commentCount,
  totalComments, // ← add this
  isLiked,
  onLike,
  onComment,
}) => {
  const displayLikes = totalLikes ?? likeCount;
  const displayComments = totalComments ?? commentCount; // ← use real count
  const displayLiked = userReaction != null ? userReaction === "like" : isLiked;

  return (
    <View style={styles.actions}>
      <TouchableOpacity style={styles.btn} onPress={onLike}>
        <Text>👍</Text>
        <Text style={[styles.text, displayLiked && styles.textLiked]}>
          Like ({displayLikes})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={onComment}>
        <Text>💬</Text>
        <Text style={styles.text}>
          {displayComments} Comment{displayComments !== 1 ? "s" : ""}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: { flexDirection: "row", justifyContent: "space-between" },
  btn: { flexDirection: "row", alignItems: "center", gap: 6 },
  text: { fontSize: 14, color: COLORS.textLight, fontWeight: "500" },
  textLiked: { color: COLORS.secondary, fontWeight: "700" },
});

export default PostActions;

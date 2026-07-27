import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

import ProfileHeader from "../components/spillTheTea/ProfileHeader";
import ProfilePostCard from "../components/spillTheTea/Profilepostcard";
import CommentsModal from "../components/spillTheTea/CommentsModal";
import { Author, Post } from "../components/spillTheTea";

// ── API ───────────────────────────────────────────────────────────────────────
import {
  getUserPosts,
  likePost,
  getLikeCount,
  getCommentCount,
  deletePost,
  addComment,
} from "../services/socialPosts";
import { toggleLike } from "../components/spillTheTea/mnt/user-data/outputs/SpillTheTea/helpers";

// ── Icon wrapper ──────────────────────────────────────────────────────────────
const Icon: React.FC<{ name: string; size: number; color: string }> = ({
  name,
  size,
  color,
}) => <MaterialIcons name={name as any} size={size} color={color} />;

// ── Normalize post ────────────────────────────────────────────────────────────
const normalizePost = (p: any): Post => ({
  ...p,
  likes: p.likes ?? [],
  comments: p.comments ?? [],
  assets: p.assets ?? [],
  totalLikes: p.totalLikes ?? 0,
  totalComments: p.totalComments ?? 0,
  userReaction: p.userReaction ?? null,
});

// ── Decode JWT ────────────────────────────────────────────────────────────────
const getUserIdFromToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("userid:", payload.user?._id ?? payload._id ?? null);
    return payload.user?._id ?? payload._id ?? null;
  } catch (e) {
    console.warn("Failed to decode token:", e);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND HELPERS — same pattern as SpillTheTeaPage
// ─────────────────────────────────────────────────────────────────────────────
const attachLikeCounts = (
  posts: Post[],
  updatePost: (
    id: string,
    d: { totalLikes: number; userReaction: string | null }
  ) => void
) => {
  Promise.allSettled(
    posts.map(async (post) => {
      try {
        const d = await getLikeCount(post._id);
        updatePost(post._id, {
          totalLikes: d.totalLikes ?? 0,
          userReaction: d.userReaction ?? null,
        });
      } catch {
        /* fail silently */
      }
    })
  );
};

const attachCommentCounts = (
  posts: Post[],
  updatePost: (id: string, d: { totalComments: number }) => void
) => {
  Promise.allSettled(
    posts.map(async (post) => {
      try {
        const d = await getCommentCount(post._id);
        updatePost(post._id, { totalComments: d.totalComments ?? 0 });
      } catch {
        /* fail silently */
      }
    })
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const SpillTheTeaProfilePage: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [user, setUser] = useState<(Author & { email?: string }) | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  // ── Update helpers — same as SpillTheTeaPage ─────────────────────────────
  const updatePostLike = useCallback(
    (
      postId: string,
      data: { totalLikes: number; userReaction: string | null }
    ) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, ...data } : p))
      );
    },
    []
  );

  const updatePostComment = useCallback(
    (postId: string, data: { totalComments: number }) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, ...data } : p))
      );
    },
    []
  );

  // ── Step 1: Get userId from JWT token ─────────────────────────────────────
  useEffect(() => {
    getUserIdFromToken().then((id) => {
      console.log("currentUserId from token:", id);
      setCurrentUserId(id);
    });
  }, []);

  // ── Step 2: Fetch posts + like/comment counts in background ──────────────
  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!currentUserId) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await getUserPosts(currentUserId);
        const rawPosts = (data.posts ?? data ?? []).map(normalizePost);
        const userInfo = data.user ?? rawPosts[0]?.author ?? null;

        // ✅ Show posts immediately
        setUser(userInfo);
        setPosts(rawPosts);

        // ✅ Like & comment counts in background — same as SpillTheTeaPage
        attachLikeCounts(rawPosts, updatePostLike);
        attachCommentCounts(rawPosts, updatePostComment);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to load profile.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUserId, updatePostLike, updatePostComment]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Delete post ────────────────────────────────────────────────────────────
  const handleDelete = (postId: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          // Optimistic — remove from UI immediately
          setPosts((prev) => prev.filter((p) => p._id !== postId));
          try {
            await deletePost(postId);
          } catch (error: any) {
            // Revert on failure
            fetchData();
            Alert.alert("Error", error.message || "Failed to delete post.");
          }
        },
      },
    ]);
  };
  // ── Like / Unlike — same as SpillTheTeaPage ───────────────────────────────
  const handleLike = async (postId: string) => {
    if (!currentUserId) return;
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, likes: toggleLike(p.likes ?? [], currentUserId) }
          : p
      )
    );
    try {
      const response = await likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                totalLikes: response.totalLikes,
                userReaction: response.userReaction,
              }
            : p
        )
      );
    } catch (error: any) {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: toggleLike(p.likes ?? [], currentUserId) }
            : p
        )
      );
      Alert.alert("Error", error.message || "Failed to update like.");
    }
  };

  // ── Comments — same as SpillTheTeaPage ────────────────────────────────────
  const openComments = (post: Post) => {
    setSelectedPost(post);
    setCommentsOpen(true);
  };

  const handleAddComment = async (postId: string, text: string) => {
    const newComment = {
      _id: Date.now().toString(),
      content: text,
      author: { _id: currentUserId ?? "", firstName: "You", lastName: "" },
      createdAt: new Date().toISOString(),
    };
    const addCommentTo = (p: Post): Post => ({
      ...p,
      comments: [...(p.comments ?? []), newComment],
      totalComments: (p.totalComments ?? p.comments?.length ?? 0) + 1,
    });
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? addCommentTo(p) : p))
    );
    setSelectedPost((prev) =>
      prev?._id === postId ? addCommentTo(prev) : prev
    );
    try {
      await addComment(postId, text);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send comment.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Back */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={18} color="#fff" />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#1565C0" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p._id}
          contentContainerStyle={styles.feed}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => fetchData(true)}
          ListHeaderComponent={
            user ? (
              <View style={{ marginBottom: 20 }}>
                <ProfileHeader user={user} postCount={posts.length} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No posts yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProfilePostCard
              post={item}
              currentUserId={currentUserId ?? ""}
              onDelete={handleDelete}
              onLike={handleLike}
              onCommentPress={openComments}
            />
          )}
          showsHorizontalScrollIndicator={false}
        />
      )}

      {/* Comments Modal */}
      <CommentsModal
        visible={commentsOpen}
        post={selectedPost}
        onClose={() => setCommentsOpen(false)}
        onAddComment={handleAddComment}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white", paddingTop: 40 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#10B144",
    margin: 20,
    padding: 15,
    borderRadius: 100,
  },
  loader: { marginTop: 80 },
  feed: { paddingHorizontal: 16, paddingBottom: 30 },
  emptyBox: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 15, color: "#888" },
});

export default SpillTheTeaProfilePage;

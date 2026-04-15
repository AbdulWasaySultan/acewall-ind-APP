import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, SafeAreaView,
    StatusBar, ActivityIndicator, Alert,
    ViewToken,
} from 'react-native';
import { Comment, Post } from '../components/spillTheTea';
import { COLORS} from '../components/spillTheTea/mnt/user-data/outputs/SpillTheTea/constants';
import { toggleLike } from '../components/spillTheTea/mnt/user-data/outputs/SpillTheTea/helpers';
import HeaderButton from '../components/spillTheTea/HeaderButton';
import PostCard from '../components/spillTheTea/PostCard';
import CommentsModal from '../components/spillTheTea/CommentsModal';
import CreatePostModal from '../components/spillTheTea/CreatePostModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useFocusEffect } from '@react-navigation/native';
// ── API ──────────────────────────────────────────────────────────────────────
import {
    fetchAllPosts,
    likePost,
    addComment,
    createSocialPost,
    getLikeCount,
    getCommentCount,
} from '../services/socialPosts';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const normalizePost = (p: any): Post => ({
    ...p,
    likes:         p.likes         ?? [],
    comments:      p.comments      ?? [],
    assets:        p.assets        ?? [],
    totalLikes:    p.totalLikes    ?? 0,
    totalComments: p.totalComments ?? 0,
    userReaction:  p.userReaction  ?? null,
});

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50 };

// Decode JWT — get full user object from token
const getUserFromToken = async (): Promise<{
    _id: string; firstName: string; lastName: string; role: string;
    profileImg?: { url: string };
} | null> => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user ?? null;
    } catch {
        return null;
    }
};

// Fire and forget — fetch like counts without blocking UI
const attachLikeCounts = (
    posts: Post[],
    updatePost: (id: string, d: { totalLikes: number; userReaction: string | null }) => void
) => {
    Promise.allSettled(
        posts.map(async (post) => {
            try {
                const d = await getLikeCount(post._id);
                updatePost(post._id, {
                    totalLikes:   d.totalLikes   ?? 0,
                    userReaction: d.userReaction ?? null,
                });
            } catch { /* fail silently */ }
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
            } catch { /* fail silently */ }
        })
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SPILL THE TEA PAGE
// ─────────────────────────────────────────────────────────────────────────────
const SpillTheTeaPage: React.FC = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [posts,        setPosts]        = useState<Post[]>([]);
    const [loading,      setLoading]      = useState(true);
    const [refreshing,   setRefreshing]   = useState(false);
    const [loadingMore,  setLoadingMore]  = useState(false);
    const [page,         setPage]         = useState(1);
    const [totalPages,   setTotalPages]   = useState(1);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [createOpen,   setCreateOpen]   = useState(false);
    const [visibleIds,   setVisibleIds]   = useState<Set<string>>(new Set());
    const [currentUserId, setCurrentUserId] = useState<string>('');



    useEffect(() => {
        getUserFromToken().then((user) => {
            if (user?._id) setCurrentUserId(user._id);
        });
    }, []);

    // ── Update single post like/comment data ──────────────────────────────────
    const updatePostLike = useCallback((
        postId: string,
        data: { totalLikes: number; userReaction: string | null }
    ) => {
        setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, ...data } : p));
    }, []);

    const updatePostComment = useCallback((
        postId: string,
        data: { totalComments: number }
    ) => {
        setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, ...data } : p));
    }, []);

    // ── Viewability ───────────────────────────────────────────────────────────
    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            setVisibleIds(new Set(viewableItems.map((v) => v.item._id as string)));
        }
    ).current;

    // ── Fetch posts ───────────────────────────────────────────────────────────
    const fetchPosts = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else           setLoading(true);

        try {
            const data     = await fetchAllPosts(1, 10);
            const rawPosts = (data.posts ?? []).map(normalizePost);

            // Show posts immediately
            setPosts(rawPosts);
            setPage(1);
            setTotalPages(data.totalPages ?? 1);

            // Like & comment counts in background
            attachLikeCounts(rawPosts, updatePostLike);
            attachCommentCounts(rawPosts, updatePostComment);

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load posts.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [updatePostLike, updatePostComment]);

    // ── Refetch on screen focus (e.g. back from profile after delete) ─────────
    useFocusEffect(
        useCallback(() => {
            fetchPosts();
        }, [fetchPosts])
    );

    // ── Load more ─────────────────────────────────────────────────────────────
    const loadMorePosts = async () => {
        if (loadingMore || page >= totalPages) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const data     = await fetchAllPosts(nextPage, 10);
            const rawPosts = (data.posts ?? []).map(normalizePost);
            setPosts((prev) => [...prev, ...rawPosts]);
            setPage(nextPage);
            setTotalPages(data.totalPages ?? 1);
            attachLikeCounts(rawPosts, updatePostLike);
            attachCommentCounts(rawPosts, updatePostComment);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load more posts.');
        } finally {
            setLoadingMore(false);
        }
    };

    // ── Like / Unlike ─────────────────────────────────────────────────────────
    const handleLike = async (postId: string) => {
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
                        ? { ...p, totalLikes: response.totalLikes, userReaction: response.userReaction }
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
            Alert.alert('Error', error.message || 'Failed to update like.');
        }
    };

    // ── Add Comment ───────────────────────────────────────────────────────────
    const handleAddComment = async (postId: string, text: string) => {
        const newComment: Comment = {
            _id:       Date.now().toString(),
            content:   text,
            author:    { _id: currentUserId, firstName: 'You', lastName: '' },
            createdAt: new Date().toISOString(),
        };
        const addCommentTo = (p: Post): Post => ({
            ...p,
            comments:      [...(p.comments ?? []), newComment],
            totalComments: (p.totalComments ?? p.comments?.length ?? 0) + 1,
        });
        setPosts((prev)        => prev.map((p) => p._id === postId ? addCommentTo(p) : p));
        setSelectedPost((prev) => prev?._id === postId ? addCommentTo(prev) : prev);
        try {
            await addComment(postId, text);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send comment.');
        }
    };

    // ── Create Post ───────────────────────────────────────────────────────────
    const handleCreatePost = async (text: string, assets?: any[], postType: string = 'public') => {
        const tempId = `temp_${Date.now()}`;

        //  Get real user from JWT token so name shows correctly
        const user = await getUserFromToken();

        const tempPost: Post = {
            _id: tempId,
            text,
            assets: [],
            totalComments: 0,
            postType: postType,
            author: {
                _id: user?._id ?? currentUserId,
                firstName: user?.firstName ?? 'You',
                lastName: user?.lastName ?? '',
                role: user?.role ?? 'student',
                profileImg: user?.profileImg,
            },
            likes: [],
            comments: [],
            totalLikes: 0,
            userReaction: null,
            createdAt: new Date().toISOString(),
            content: ''
        };

        setPosts((prev) => [tempPost, ...prev]);
        try {
            const response = await createSocialPost(text, assets, postType);
            const created  = normalizePost(response.post ?? response);
        
            // If server returned incomplete author, keep the real author from temp post
            const finalPost = {
                ...created,
                author: created.author?.firstName
                    ? created.author   // server returned full author — use it
                    : tempPost.author, // server returned partial — keep temp author
            };
        
            setPosts((prev) => prev.map((p) => p._id === tempId ? finalPost : p));
        } catch (error: any) {
            setPosts((prev) => prev.filter((p) => p._id !== tempId));
            Alert.alert('Error', error.message || 'Failed to create post.');
        }
    };

    const openComments = (post: Post) => {
        setSelectedPost(post);
        setCommentsOpen(true);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerIcon}>☕</Text>
                    <Text style={styles.headerTitle}>Spill The Tea</Text>
                </View>
                <View style={styles.headerActions}>
                    <HeaderButton
                        label="Profile"
                        icon="👤"
                        onPress={() => navigation.navigate('SpillTheTeaProfile')}
                    />
                    <HeaderButton
                        label="Create"
                        icon="⊕"
                        onPress={() => setCreateOpen(true)}
                    />
                </View>
            </View>

            {/* Feed */}
            {loading ? (
                <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(p) => p._id}
                    contentContainerStyle={styles.feed}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={() => fetchPosts(true)}
                    onEndReached={loadMorePosts}
                    onEndReachedThreshold={0.3}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={VIEWABILITY_CONFIG}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={7}
                    initialNumToRender={4}
                    ListFooterComponent={
                        loadingMore
                            ? <ActivityIndicator style={styles.loadMoreSpinner} color={COLORS.primary} />
                            : null
                    }
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No posts yet. Spill the tea! ☕</Text>
                    }
                    renderItem={({ item }) => (
                        <PostCard
                            post={item}
                            currentUserId={currentUserId}
                            isVisible={visibleIds.has(item._id)}
                            onLike={handleLike}
                            onCommentPress={openComments}
                        />
                    )}
                />
            )}

            {/* Comments Modal */}
            <CommentsModal
                visible={commentsOpen}
                post={selectedPost}
                onClose={() => setCommentsOpen(false)}
                onAddComment={handleAddComment}
            />

            {/* Create Post Modal */}
            <CreatePostModal
                visible={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={({ content, target, media }) =>
                    handleCreatePost(content, media ?? [], target)
                }
            />
        </SafeAreaView>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor:   COLORS.primary,
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        paddingHorizontal: 16,
        paddingVertical:   14,
    },
    headerLeft:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerIcon:      { fontSize: 20 },
    headerTitle:     { color: COLORS.white, fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
    headerActions:   { flexDirection: 'row', gap: 10 },
    feed:            { padding: 16, paddingTop: 20 },
    loader:          { marginTop: 80 },
    loadMoreSpinner: { marginVertical: 16 },
    emptyText:       { textAlign: 'center', color: COLORS.textMid, fontSize: 15, marginTop: 80 },
});

export default SpillTheTeaPage;
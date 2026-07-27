import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getConversations } from '../services/message';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// The backend returns the other conversation member as firstName/lastName
// (matching every other person object in this app), not a combined `name`
// field, so build the display name from those instead of relying on `.name`.
const getMemberName = (member: any): string => {
  if (!member) return "Conversation";
  return (
    member.name ||
    [member.firstName, member.lastName].filter(Boolean).join(" ") ||
    "Conversation"
  );
};

const MessagesPage = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { conversationId, teacherName } = route.params as { conversationId?: string; teacherName?: string } || {};
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Guards against re-firing the auto-open effect below (e.g. on refocus)
  // once we've already navigated away for this particular conversationId.
  const autoOpenedFor = useRef<string | null>(null);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConversations();
      console.log(data)
      setConversations(data.conversations || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(()=>{
      fetchConversations();
    },[])
  );

  // Deep-linked straight into a conversation (e.g. from "Message Teacher" on
  // CourseDetailStudentPageEnrolled.tsx) — skip the inbox entirely and go
  // straight to the chat thread, using the caller-provided name since we
  // don't need to wait for the conversations list to fetch.
  useEffect(() => {
    if (conversationId && autoOpenedFor.current !== conversationId) {
      autoOpenedFor.current = conversationId;
      navigation.navigate('Chat', {
        conversationId,
        otherMemberName: teacherName || 'Conversation',
      });
    }
  }, [conversationId, teacherName, navigation]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : conversations.length === 0 ? (
        <Text style={styles.noConversationsText}>No conversations found.</Text>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Chat', {
                  conversationId: item.conversationId,
                  otherMemberName: getMemberName(item.otherMember),
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.conversationCard}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarCircle}>
                    <Image
                      source={
                        item.otherMember?.profileImg?.url
                          ? { uri: item.otherMember.profileImg.url }
                          : require('../assets/placeholder.png')
                      }
                      style={styles.avatar}
                    />
                  </View>
                </View>
                <View style={styles.conversationDetails}>
                  <Text style={styles.conversationTitle}>{getMemberName(item.otherMember)}</Text>
                  {item.lastMessage && (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {item.lastMessage}
                    </Text>
                  )}
                </View>
                {item.lastMessageDate && (
                  <Text style={styles.timestamp}>
                    {formatTimeAgo(item.lastMessageDate)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
  noConversationsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#B6F5D7',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  conversationDetails: {
    flex: 1,
    marginRight: 8,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3142',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-start',
  },
});

export default MessagesPage; 
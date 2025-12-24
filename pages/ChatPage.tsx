import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import SimpleIcon from '../components/SimpleIcon';
import { getMessages, sendMessage } from '../services/message';
import { useAuth } from '../contexts/AuthContext'; // Assuming useAuth provides the current user
import { useSafeAreaInsets } from 'react-native-safe-area-context';
type ChatPageParams = {
    conversationId: string;
    otherMemberName: string;
};

const ChatPage = () => {
    const route = useRoute<RouteProp<{ params: ChatPageParams }, 'params'>>();
    const { conversationId, otherMemberName } = route.params;
    const navigation = useNavigation();
    const { user } = useAuth(); // Get the current user
    const insets = useSafeAreaInsets()
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [keyboardMargin, setKeyboardMargin] = useState(20);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardMargin(21);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardMargin(20);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getMessages(conversationId);
            if (response.messages) {
                setMessages(response.messages); // Don't reverse, use natural order
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Fetch messages more frequently
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || sending) return;
        setSending(true);
        try {
            const response = await sendMessage(conversationId, newMessage);
            if (response.newMessage) {
                // setMessages(prevMessages => [response.newMessage, ...prevMessages,]); // Append to end
            }
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isMyMessage = item.sender._id === user?._id; // Check if the message is from the current user
        return (
            <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
                <Text style={isMyMessage ? styles.myMessageText : styles.theirMessageText}>{item.text}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container} >
            <View style={[styles.header, { paddingTop: insets.top || 10 }]}>
                <View>
                    <Text style={styles.headerName}>{otherMemberName}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <SimpleIcon name="close" size={32} color="#888" />
                </TouchableOpacity>
            </View>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                inverted
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            <View style={[styles.inputContainer, { paddingBottom: keyboardMargin }]}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    placeholderTextColor="#000"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, (sending || !newMessage.trim()) && styles.sendButtonDisabled]}
                    onPress={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <SimpleIcon name="send" size={24} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    headerName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 10,
    },
    messageBubble: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginBottom: 10,
        maxWidth: '75%',
    },
    myMessage: {
        backgroundColor: '#10B144',
        alignSelf: 'flex-end',
    },
    theirMessage: {
        backgroundColor: '#e5e5ea',
        alignSelf: 'flex-start',
    },
    myMessageText: {
        color: '#fff',
    },
    theirMessageText: {
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        minHeight: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 16,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#10B144',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});

export default ChatPage; 
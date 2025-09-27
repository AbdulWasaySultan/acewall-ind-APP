import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import SimpleIcon from '../components/SimpleIcon';
import { getMessages, sendMessage } from '../services/message';
import { useAuth } from '../contexts/AuthContext'; // Assuming useAuth provides the current user

type ChatPageParams = {
    conversationId: string;
    otherMemberName: string;
};

const ChatPage = () => {
    const route = useRoute<RouteProp<{ params: ChatPageParams }, 'params'>>();
    const { conversationId, otherMemberName } = route.params;
    const navigation = useNavigation();
    const { user } = useAuth(); // Get the current user

    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [keyboardMargin, setKeyboardMargin] = useState(0);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardMargin(30);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardMargin(0);
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
                setMessages(response.messages.reverse()); // Reverse to show latest at the bottom
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
        if (!newMessage.trim() || !user) return;

        try {
            const response = await sendMessage(conversationId, newMessage);
            if (response.newMessage) {
                setMessages(prevMessages => [response.newMessage, ...prevMessages]);
            }
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
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
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerName}>{otherMemberName}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <SimpleIcon name="close" size={32} color="#888" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                inverted // To keep the list scrolled to the bottom
            />
            <View style={[styles.inputContainer, { marginBottom: keyboardMargin }]}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    placeholderTextColor="#000"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                    <SimpleIcon name="send" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
});

export default ChatPage; 
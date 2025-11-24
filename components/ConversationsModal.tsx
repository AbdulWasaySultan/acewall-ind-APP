import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator,Image } from 'react-native';
import SimpleIcon from './SimpleIcon';
import { useNavigation } from '@react-navigation/native';
import { createConversation, getConversations } from '../services/conversation';

interface ConversationsModalProps {
    visible: boolean;
    onClose: () => void;
    conversationId: string | null;
}
const avatarPlaceholder = require('../assets/placeholder.png');

const ConversationsModal: React.FC<ConversationsModalProps> = ({ visible, onClose, conversationId }) => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    useEffect(() => {
        const fetchConversations = async () => {
            if (visible && conversationId) {
                setLoading(true);
                try {
                    // Fetch the conversation/messages for the given conversationId
                    // Replace this with your actual API call for messages
                    const response = await getConversations();
                    if (response.conversations) {
                        setConversations(response.conversations.filter((c: any) => c.conversationId === conversationId));
                    }
                } catch (error) {
                    console.error("Failed to fetch conversations:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchConversations();
    }, [visible, conversationId]);

    const handleConversationPress = (conversationId: string, otherMemberName: string) => {
        onClose(); // Close the modal before navigating
        navigation.navigate('Chat', { conversationId, otherMemberName });
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => handleConversationPress(item.conversationId, item.otherMember?.name)}>
            <View style={styles.card}>
                <View style={styles.avatar}>
                <Image source={item?.otherMember?.profileImg?.url ?{uri:item?.otherMember?.profileImg?.url  }:avatarPlaceholder} style={{width:56,height:56,borderRadius:28}} />
                </View>
                <Text style={styles.name}>{item.otherMember?.name || 'Unknown User'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.closeSimpleIcon}
                    onPress={onClose}
                    hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                >
                    <Text style={styles.closeSimpleIconText}>×</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Conversations</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#10B144" style={{ marginTop: 20 }}/>
                ) : (
                    <FlatList
                        data={conversations}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.conversationId}
                        contentContainerStyle={styles.listContainer}
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
    },
    closeSimpleIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 16,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    closeSimpleIconText: {
        fontSize: 22,
        color: '#222',
        fontWeight: 'bold',
        lineHeight: 28,
        textAlign: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    listContainer: {
        paddingHorizontal: 20,
    },
    card: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#fff',
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#10B144',
        borderWidth: 2,
        marginBottom: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
});

export default ConversationsModal; 
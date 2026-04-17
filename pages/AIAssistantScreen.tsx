import React, { useRef, useEffect, useState } from 'react';
import {
    View, FlatList, Text,
    StyleSheet, SafeAreaView, StatusBar,
    KeyboardAvoidingView, Platform,
    TouchableOpacity, Keyboard, ActivityIndicator,
} from 'react-native';

import { Message }         from '../components/aiAssistant/types';
import useChat             from '../components/aiAssistant/hooks/useChat';
import TypingIndicator     from '../components/aiAssistant/TypingIndicator';
import ChatMessage         from '../components/aiAssistant/ChatMessage';
import QuickReplies        from '../components/aiAssistant/QuickReplies';
import ChatInput           from '../components/aiAssistant/ChatInput';
import { AttachedFile }    from '../components/aiAssistant/ChatInput';
import DifficultySelector, { DifficultyLevel } from '../components/aiAssistant/DifficultySelector';

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME MESSAGE — shown only when no history
// ─────────────────────────────────────────────────────────────────────────────
const WELCOME: Message = {
    id:        'welcome',
    role:      'assistant',
    content:   "Hello! I am Acewall Scholars EduMentor, your AI educational assistant. How can I help you today?",
    timestamp: new Date(),
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const AIChatbotScreen: React.FC = () => {
    const flatListRef = useRef<FlatList>(null);

    const [showDifficulty, setShowDifficulty] = useState(false);
    const [keyboardOpen,   setKeyboardOpen]   = useState(false);
    const [difficulty,     setDifficulty]     = useState<DifficultyLevel>('Medium');

    const {
        messages,
        isTyping,
        quickReplies,
        error,
        historyLoading,
        sendMessage,
        clearChat,
    } = useChat({
        sessionType: 'educational',
        difficulty,
    });

    // ── Keyboard listener ──────────────────────────────────────────────────────
    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
        const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
        return () => { show.remove(); hide.remove(); };
    }, []);

    // ── Auto-scroll on new message ─────────────────────────────────────────────
    useEffect(() => {
        if (messages.length > 0 || isTyping) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, isTyping]);

    // ── Build message list ─────────────────────────────────────────────────────
    // Show WELCOME only if no history loaded
    const allMessages: (Message | 'typing')[] = [
        ...(messages.length === 0 ? [WELCOME] : []),
        ...messages,
        ...(isTyping ? (['typing'] as const) : []),
    ];

    // ── Only last AI message gets typewriter animation ─────────────────────────
    const lastAIIndex = allMessages.reduce((lastIdx, m, i) => {
        if (m !== 'typing' && (m as Message).role === 'assistant') return i;
        return lastIdx;
    }, -1);

    // ── Handle send with optional file ────────────────────────────────────────
    const handleSend = (text: string, file?: AttachedFile) => {
        sendMessage(text, file);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <KeyboardAvoidingView
                style={{ flex: 1, position: 'relative', paddingBottom: 30 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={
                    Platform.OS === 'ios' ? 88 : keyboardOpen ? 55 : 25
                }
            >
                {/* ── History loading spinner ── */}
                {historyLoading ? (
                    <View style={styles.historyLoader}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={styles.historyLoaderText}>Loading chat history...</Text>
                    </View>
                ) : (
                    /* ── Message list ── */
                    <FlatList
                        ref={flatListRef}
                        data={allMessages}
                        keyExtractor={(item) =>
                            item === 'typing' ? 'typing' : (item as Message).id
                        }
                        contentContainerStyle={styles.messageList}
                        showsVerticalScrollIndicator={false}
                        style={{ flex: 1 }}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item, index }) => {
                            if (item === 'typing') return <TypingIndicator />;

                            const msg = item as Message;

                            // ✅ Only latest AI response gets typewriter
                            const shouldAnimate =
                                msg.role === 'assistant' && index === lastAIIndex;

                            return (
                                <ChatMessage
                                    message={msg}
                                    animate={shouldAnimate}
                                />
                            );
                        }}
                        ListFooterComponent={
                            error ? (
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>⚠ {error}</Text>
                                </View>
                            ) : null
                        }
                    />
                )}

                {/* ── Difficulty toggle + collapsible panel ── */}
                <View style={{ position: 'relative' }}>
                    <TouchableOpacity
                        style={styles.difficultyToggleBtn}
                        onPress={() => setShowDifficulty((prev) => !prev)}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.difficultyToggleIcon}>
                            {showDifficulty ? '>' : '<'}
                        </Text>
                    </TouchableOpacity>

                    {showDifficulty && (
                        <DifficultySelector
                            value={difficulty}
                            onChange={(level) => setDifficulty(level)}
                        />
                    )}
                </View>

                {/* ── Quick reply chips ── */}
                <QuickReplies
                    replies={quickReplies}
                    onSelect={(text) => sendMessage(text)}
                />

                {/* ── Input ── */}
                <ChatInput
                    onSend={handleSend}
                    disabled={isTyping || historyLoading}
                    placeholder="Ask any question or request to generate a file..."
                />

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },

    // History loading
    historyLoader: {
        flex:           1,
        alignItems:     'center',
        justifyContent: 'center',
        gap:            12,
    },
    historyLoaderText: {
        fontSize: 14,
        color:    '#9ca3af',
    },

    messageList: {
        paddingHorizontal: 16,
        paddingTop:        20,
        paddingBottom:     8,
        flexGrow:          1,
    },

    errorBox: {
        backgroundColor:  '#fef2f2',
        borderRadius:     10,
        padding:          12,
        marginHorizontal: 16,
        marginBottom:     8,
    },
    errorText: { color: '#dc2626', fontSize: 13 },

    difficultyToggleBtn: {
        position:        'absolute',
        right:           20,
        top:             -30,
        width:           44,
        height:          44,
        borderRadius:    22,
        backgroundColor: '#3B82F6',
        alignItems:      'center',
        justifyContent:  'center',
        zIndex:          10,
        shadowColor:     '#000',
        shadowOpacity:   0.2,
        shadowRadius:    6,
        shadowOffset:    { width: 0, height: 3 },
        elevation:       6,
    },
    difficultyToggleIcon: {
        color:      '#fff',
        fontSize:   20,
        opacity:    0.8,
        fontWeight: '700',
        lineHeight: 24,
    },
});

export default AIChatbotScreen;
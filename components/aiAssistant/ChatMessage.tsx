// ChatMessage.tsx
// Renders a single chat bubble — user (right, blue) or assistant (left, gray)
// AI messages animate word by word like a typewriter

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from './types';

interface ChatMessageProps {
  message: Message;
}

const formatTime = (date: Date) =>
  date.toLocaleTimeString('en-US', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  });

// ─────────────────────────────────────────────────────────────────────────────
// TYPEWRITER HOOK — reveals text word by word
// ─────────────────────────────────────────────────────────────────────────────
const useTypewriter = (fullText: string, isAI: boolean, speed = 30) => {
  const [displayed, setDisplayed] = useState('');
  const [done,      setDone]      = useState(false);
  const indexRef                  = useRef(0);
  const intervalRef               = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // User messages show instantly — no animation
    if (!isAI) {
      setDisplayed(fullText);
      setDone(true);
      return;
    }

    // Reset when message content changes
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    intervalRef.current = setInterval(() => {
      if (indexRef.current < fullText.length) {
        // Add one character at a time
        setDisplayed(fullText.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        // Done — clear interval
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDone(true);
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fullText, isAI]);

  return { displayed, done };
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const { displayed, done } = useTypewriter(message.content, !isUser, 18);

  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAI]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAI]}>
          {displayed}
          {/* Blinking cursor while typing */}
          {!isUser && !done && (
            <Text style={styles.cursor}>|</Text>
          )}
        </Text>
      </View>

      {/* Timestamp — show for user, show for AI only when done typing */}
      {(isUser || done) && (
        <View style={[styles.metaRow, isUser ? styles.metaRight : styles.metaLeft]}>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    maxWidth:     '80%',
  },
  wrapperUser: { alignSelf: 'flex-end',   alignItems: 'flex-end' },
  wrapperAI:   { alignSelf: 'flex-start', alignItems: 'flex-start' },

  bubble: {
    borderRadius:      20,
    paddingHorizontal: 18,
    paddingVertical:   14,
  },
  bubbleUser: {
    backgroundColor:      '#3B82F6',
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor:     '#F0F2F5',
    borderBottomLeftRadius: 4,
  },

  text:     { fontSize: 15, lineHeight: 22 },
  textUser: { color: '#fff' },
  textAI:   { color: '#1a1a2e' },

  // Blinking cursor at end of AI text while typing
  cursor: {
    color:      '#3B82F6',
    fontWeight: '700',
    fontSize:   16,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    marginTop:     4,
  },
  metaRight: { marginRight: 4 },
  metaLeft:  { marginLeft:  4 },

  arrow:     { fontSize: 11, color: '#9ca3af' },
  timestamp: { fontSize: 11, color: '#9ca3af' },
});

export default ChatMessage;
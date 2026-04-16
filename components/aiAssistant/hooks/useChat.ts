import { useState, useCallback } from 'react';
import { Message } from '../types';
import { sendAIMessage } from '../../../services/aiAssestant';

const QUICK_REPLIES_DEFAULT = [
  'explain more', 'tell me more', 'what do you mean',
  'continue', 'go on', 'more', 'more details',
  'explain this', "i don't understand", 'elaborate',
  'clarify', 'explain again',
];

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;

interface UseChatOptions {
  systemPrompt?: string;
  sessionType?:  string;
  context?:      string;
  model?:        string;
  difficulty?:   string;
  file?:         any;
}

const useChat = (options: UseChatOptions = {}) => {
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [isTyping,     setIsTyping]     = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [error,        setError]        = useState<string | null>(null);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isTyping) return;

    setError(null);
    setQuickReplies([]);

    const userMessage: Message = {
      id:        generateId(),
      role:      'user',
      content:   userText.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const data = await sendAIMessage({
        question:    userText.trim(),
        difficulty:  options.difficulty,
        context:     options.context,
        sessionType: options.sessionType,
        model:       options.model,
        file:        options.file,
      });

      const aiText = data.answer ?? data.response ?? data.reply ?? data.message ?? '';

      const aiMessage: Message = {
        id:        generateId(),
        role:      'assistant',
        content:   aiText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      const suggestions = data.suggestedQuestions ?? QUICK_REPLIES_DEFAULT;
      setQuickReplies(suggestions);

    } catch (err: any) {
      setError(err.message || 'Failed to get response.');
      console.error('AI chat error:', err);
    } finally {
      setIsTyping(false);
    }
  }, [messages, isTyping, options]);

  //clearChat was missing
  const clearChat = useCallback(() => {
    setMessages([]);
    setQuickReplies([]);
    setError(null);
  }, []);

  //return was missing
  return {
    messages,
    isTyping,
    quickReplies,
    error,
    sendMessage,
    clearChat,
  };
};

export default useChat;
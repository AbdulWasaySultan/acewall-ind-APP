// // import React, {
// //   useRef,
// //   useEffect,
// //   useState,
// //   useCallback,
// //   useMemo,
// // } from "react";
// // import {
// //   View,
// //   FlatList,
// //   Text,
// //   StyleSheet,
// //   SafeAreaView,
// //   StatusBar,
// //   KeyboardAvoidingView,
// //   Platform,
// //   TouchableOpacity,
// //   Keyboard,
// //   ActivityIndicator,
// // } from "react-native";
// // import MaterialIcons from "@react-native-vector-icons/material-icons";

// // import { Message } from "../components/aiAssistant/types";
// // import useChat from "../components/aiAssistant/hooks/useChat";
// // import TypingIndicator from "../components/aiAssistant/TypingIndicator";
// // import ChatMessage from "../components/aiAssistant/ChatMessage";
// // import QuickReplies from "../components/aiAssistant/QuickReplies";
// // import ChatInput from "../components/aiAssistant/ChatInput";
// // import { AttachedFile } from "../components/aiAssistant/ChatInput";
// // import DifficultySelector, {
// //   DifficultyLevel,
// // } from "../components/aiAssistant/DifficultySelector";
// // import { useUser } from "../contexts/UserContext";
// // import ExportOptions from "../components/aiAssistant/ExportOptions";

// // // ─────────────────────────────────────────────────────────────────────────────
// // // WELCOME MESSAGE — shown only when no history
// // // ─────────────────────────────────────────────────────────────────────────────
// // const WELCOME: Message = {
// //   id: "welcome",
// //   role: "assistant",
// //   content:
// //     "Hello! I am Acewall Scholars EduMentor, your AI educational assistant. How can I help you today?",
// //   timestamp: new Date(),
// // };

// // const GENERIC_FOLLOWUP_PATTERNS = [
// //   "explain more",
// //   "tell me more",
// //   "what do you mean",
// //   "continue",
// //   "go on",
// //   "more",
// //   "more details",
// //   "explain this",
// //   "explain that",
// //   "i don't understand",
// //   "elaborate",
// //   "clarify",
// //   "explain again",
// //   "explain in simple words",
// // ];

// // const Icon: React.FC<{ name: string; size: number; color: string }> = ({
// //   name,
// //   size,
// //   color,
// // }) => <MaterialIcons name={name as any} size={size} color={color} />;

// // // ─────────────────────────────────────────────────────────────────────────────
// // // SCREEN
// // // ─────────────────────────────────────────────────────────────────────────────
// // const AIChatbotScreen: React.FC = () => {
// //   const flatListRef = useRef<FlatList>(null);
// //   const hasSentMessageRef = useRef(false);

// //   const [showDifficulty, setShowDifficulty] = useState(false);
// //   const [keyboardOpen, setKeyboardOpen] = useState(false);
// //   const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
// //   const [showExportOptions, setShowExportOptions] = useState(false);
// //   const { taggedMessage, setTaggedMessage } = useUser();

// //   const chatOptions = useMemo(
// //     () => ({
// //       sessionType: "educational",
// //       difficulty,
// //     }),
// //     [difficulty]
// //   );

// //   const {
// //     messages,
// //     isTyping,
// //     quickReplies,
// //     error,
// //     historyLoading,
// //     sendMessage,
// //   } = useChat(chatOptions);

// //   // ── Keyboard listener ──────────────────────────────────────────────────────
// //   useEffect(() => {
// //     const show = Keyboard.addListener("keyboardDidShow", () =>
// //       setKeyboardOpen(true)
// //     );
// //     const hide = Keyboard.addListener("keyboardDidHide", () =>
// //       setKeyboardOpen(false)
// //     );
// //     return () => {
// //       show.remove();
// //       hide.remove();
// //     };
// //   }, []);

// //   // ── Build message list ─────────────────────────────────────────────────────
// //   // Show WELCOME only if no history loaded
// //   const allMessages = useMemo<(Message | "typing")[]>(
// //     () => [
// //       ...(messages.length === 0 ? [WELCOME] : []),
// //       ...messages,
// //       ...(isTyping ? (["typing"] as const) : []),
// //     ],
// //     [messages, isTyping]
// //   );

// //   const lastAIIndex = useMemo(
// //     () =>
// //       allMessages.reduce((lastIndex, item, index) => {
// //         if (item !== "typing" && item.role === "assistant") return index;
// //         return lastIndex;
// //       }, -1),
// //     [allMessages]
// //   );

// //   const followUpReplies = useMemo(() => {
// //     const replies = [...quickReplies, ...GENERIC_FOLLOWUP_PATTERNS];
// //     return Array.from(new Set(replies));
// //   }, [quickReplies]);

// //   const scrollToBottom = useCallback((animated = true) => {
// //     requestAnimationFrame(() => {
// //       flatListRef.current?.scrollToEnd({ animated });
// //     });
// //   }, []);

// //   const isUserAtBottomRef = useRef(true);

// //   // ── Track if user is at bottom ─────────────────────────────────────────────
// //   const handleScroll = useCallback((event: any) => {
// //     const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
// //     const paddingToBottom = 20;
// //     isUserAtBottomRef.current =
// //       layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
// //   }, []);

// //   // ── Auto-scroll on new message (only if user is at bottom) ─────────────────
// //   useEffect(() => {
// //     if (allMessages.length > 0 && isUserAtBottomRef.current) {
// //       scrollToBottom();
// //     }
// //   }, [allMessages.length, scrollToBottom]);

// //   // ── Auto-scroll on mount (always scroll to bottom) ─────────────────────────
// //   useEffect(() => {
// //     if (messages.length > 0) {
// //       scrollToBottom(false);
// //     }
// //   }, [messages.length, scrollToBottom]);

// //   const keyExtractor = useCallback((item: Message | "typing") => {
// //     return item === "typing" ? "typing" : item.id;
// //   }, []);

// //   // ── Handle send with optional file ────────────────────────────────────────
// //   const handleSend = useCallback(
// //     (text: string, file?: AttachedFile) => {
// //       hasSentMessageRef.current = true;
// //       sendMessage(text, file, {
// //         context: taggedMessage?.dbId,
// //       });
// //       setTaggedMessage(null);
// //     },
// //     [sendMessage, taggedMessage]
// //   );

// //   const handleQuickReply = useCallback(
// //     (text: string) => {
// //       hasSentMessageRef.current = true;
// //       sendMessage(text, undefined, {
// //         context: taggedMessage?.dbId,
// //       });
// //       setTaggedMessage(null);
// //     },
// //     [sendMessage, taggedMessage]
// //   );

// //   const renderItem = useCallback(
// //     ({ item, index }: { item: Message | "typing"; index: number }) => {
// //       if (item === "typing") return <TypingIndicator />;

// //       const shouldAnimate =
// //         hasSentMessageRef.current &&
// //         !historyLoading &&
// //         !isTyping &&
// //         item.role === "assistant" &&
// //         index === lastAIIndex;

// //       return (
// //         <ChatMessage
// //           message={item}
// //           animate={shouldAnimate}
// //           onTagPress={setTaggedMessage}
// //         />
// //       );
// //     },
// //     [historyLoading, isTyping, lastAIIndex]
// //   );

// //   // ─────────────────────────────────────────────────────────────────────────
// //   // RENDER
// //   // ─────────────────────────────────────────────────────────────────────────
// //   return (
// //     <SafeAreaView style={styles.safe}>
// //       <StatusBar barStyle="dark-content" backgroundColor="#fff" />

// //       <KeyboardAvoidingView
// //         style={{ flex: 1, position: "relative", paddingBottom: 30 }}
// //         behavior={Platform.OS === "ios" ? "padding" : "height"}
// //         keyboardVerticalOffset={
// //           Platform.OS === "ios" ? 88 : keyboardOpen ? 55 : 25
// //         }
// //       >
// //         {/* ── History loading spinner ── */}
// //         {historyLoading ? (
// //           <View style={styles.historyLoader}>
// //             <ActivityIndicator size="large" color="#3B82F6" />
// //             <Text style={styles.historyLoaderText}>
// //               Loading chat history...
// //             </Text>
// //           </View>
// //         ) : (
// //           <>
// //             {/* ── Header with export button ── */}
// //             <View style={styles.chatHeader}>
// //               <Text style={styles.chatHeaderText}>AI Assistant</Text>
// //               <TouchableOpacity
// //                 onPress={() => setShowExportOptions(true)}
// //                 style={styles.exportHeaderBtn}
// //                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
// //               >
// //                 <Icon name="more-vert" size={20} color="#6b7280" />
// //               </TouchableOpacity>
// //             </View>

// //             {/* ── Message list ── */}
// //             <FlatList
// //               ref={flatListRef}
// //               data={allMessages}
// //               keyExtractor={keyExtractor}
// //               contentContainerStyle={styles.messageList}
// //               showsVerticalScrollIndicator={false}
// //               style={{ flex: 1 }}
// //               keyboardShouldPersistTaps="handled"
// //               renderItem={renderItem}
// //               onScroll={handleScroll}
// //               scrollEventThrottle={400}
// //               onContentSizeChange={() => {
// //                 if (isUserAtBottomRef.current) {
// //                   scrollToBottom();
// //                 }
// //               }}
// //               onLayout={() => scrollToBottom(false)}
// //               ListFooterComponent={
// //                 error ? (
// //                   <View style={styles.errorBox}>
// //                     <Text style={styles.errorText}>⚠ {error}</Text>
// //                   </View>
// //                 ) : null
// //               }
// //             />
// //           </>
// //         )}

// //         {/* ── Difficulty toggle + collapsible panel ── */}
// //         <View style={styles.difficultyContainer}>
// //           <TouchableOpacity
// //             style={styles.difficultyToggleBtn}
// //             onPress={() => setShowDifficulty((prev) => !prev)}
// //             activeOpacity={0.85}
// //           >
// //             <Text style={styles.difficultyToggleIcon}>
// //               {showDifficulty ? ">" : "<"}
// //             </Text>
// //           </TouchableOpacity>

// //           {showDifficulty && (
// //             <View style={styles.difficultyPanel}>
// //               <DifficultySelector
// //                 value={difficulty}
// //                 onChange={(level) => setDifficulty(level)}
// //               />
// //             </View>
// //           )}
// //         </View>

// //         {/* ── Follow-up suggestion badges ── */}
// //         <QuickReplies
// //           replies={followUpReplies}
// //           onSelect={handleQuickReply}
// //           disabled={isTyping || historyLoading}
// //         />

// //         {taggedMessage && (
// //           <View style={styles.taggedBox}>
// //             <View style={styles.taggedActions}>
// //               <Icon name="forward" size={18} color="#3B82F6" />
// //               <TouchableOpacity
// //                 onPress={() => setTaggedMessage(null)}
// //                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
// //               >
// //                 <Icon name="close" size={18} color="#6b7280" />
// //               </TouchableOpacity>
// //             </View>
// //             <Text style={styles.taggedText} numberOfLines={2}>
// //               {taggedMessage.content}
// //             </Text>
// //           </View>
// //         )}

// //         {/* ── Input ── */}
// //         <ChatInput
// //           onSend={handleSend}
// //           disabled={isTyping || historyLoading}
// //           placeholder="Ask any question or request to generate a file..."
// //         />
// //       </KeyboardAvoidingView>

// //       {/* ── Export Options Modal ── */}
// //       <ExportOptions
// //         visible={showExportOptions}
// //         onClose={() => setShowExportOptions(false)}
// //         messages={messages}
// //       />
// //     </SafeAreaView>
// //   );
// // };

// // // ─────────────────────────────────────────────────────────────────────────────
// // // STYLES
// // // ─────────────────────────────────────────────────────────────────────────────
// // const styles = StyleSheet.create({
// //   safe: { flex: 1, backgroundColor: "#fff" },

// //   // History loading
// //   historyLoader: {
// //     flex: 1,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     gap: 12,
// //   },
// //   historyLoaderText: {
// //     fontSize: 14,
// //     color: "#9ca3af",
// //   },

// //   messageList: {
// //     paddingHorizontal: 16,
// //     paddingTop: 10,
// //     paddingBottom: 8,
// //     flexGrow: 1,
// //   },

// //   chatHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     paddingHorizontal: 16,
// //     paddingVertical: 12,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#f0f0f0',
// //   },
// //   chatHeaderText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#1a1a2e',
// //   },
// //   exportHeaderBtn: {
// //     padding: 8,
// //   },

// //   errorBox: {
// //     backgroundColor: "#fef2f2",
// //     borderRadius: 10,
// //     padding: 12,
// //     marginHorizontal: 16,
// //     marginBottom: 8,
// //   },
// //   errorText: { color: "#dc2626", fontSize: 13 },

// //   taggedBox: {
// //     backgroundColor: "#EFF6FF",
// //     borderTopWidth: 1,
// //     borderTopColor: "#DBEAFE",
// //     paddingHorizontal: 16,
// //     paddingVertical: 10,
// //   },
// //   taggedActions: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     marginBottom: 6,
// //   },
// //   taggedText: {
// //     color: "#1f2937",
// //     fontSize: 13,
// //     lineHeight: 18,
// //   },

// //   difficultyContainer: {
// //     position: "relative",
// //     zIndex: 10,
// //     marginBottom: 8,
// //   },
// //   difficultyPanel: {
// //     position: "absolute",
// //     bottom: 50,
// //     right: 0,
// //     left: 0,
// //     zIndex: 15,
// //     backgroundColor: "#fff",
// //     borderRadius: 12,
// //     shadowColor: "#000",
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     shadowOffset: { width: 0, height: -2 },
// //     elevation: 4,
// //   },
// //   difficultyToggleBtn: {
// //     position: "absolute",
// //     right: 20,
// //     bottom: 0,
// //     width: 44,
// //     height: 44,
// //     borderRadius: 22,
// //     backgroundColor: "#3B82F6",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     zIndex: 20,
// //     shadowColor: "#000",
// //     shadowOpacity: 0.2,
// //     shadowRadius: 6,
// //     shadowOffset: { width: 0, height: 3 },
// //     elevation: 6,
// //   },
// //   difficultyToggleIcon: {
// //     color: "#fff",
// //     fontSize: 20,
// //     opacity: 0.8,
// //     fontWeight: "700",
// //     lineHeight: 24,
// //   },
// // });

// // export default AIChatbotScreen;

// import React, {
//   useRef,
//   useEffect,
//   useState,
//   useCallback,
//   useMemo,
// } from "react";
// import {
//   View,
//   FlatList,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   KeyboardAvoidingView,
//   Platform,
//   TouchableOpacity,
//   Keyboard,
//   ActivityIndicator,
// } from "react-native";
// import MaterialIcons from "@react-native-vector-icons/material-icons";

// import { Message } from "../components/aiAssistant/types";
// import useChat from "../components/aiAssistant/hooks/useChat";
// import TypingIndicator from "../components/aiAssistant/TypingIndicator";
// import ChatMessage from "../components/aiAssistant/ChatMessage";
// import QuickReplies from "../components/aiAssistant/QuickReplies";
// import ChatInput from "../components/aiAssistant/ChatInput";
// import { AttachedFile } from "../components/aiAssistant/ChatInput";
// import DifficultySelector, {
//   DifficultyLevel,
// } from "../components/aiAssistant/DifficultySelector";
// import { useUser } from "../contexts/UserContext";
// import ExportOptions from "../components/aiAssistant/ExportOptions";

// // ─────────────────────────────────────────────────────────────────────────────
// // WELCOME MESSAGE — shown only when no history
// // ─────────────────────────────────────────────────────────────────────────────
// const WELCOME: Message = {
//   id: "welcome",
//   role: "assistant",
//   content:
//     "Hello! I am Acewall Scholars EduMentor, your AI educational assistant. How can I help you today?",
//   timestamp: new Date(),
// };

// const GENERIC_FOLLOWUP_PATTERNS = [
//   "explain more",
//   "tell me more",
//   "what do you mean",
//   "continue",
//   "go on",
//   "more",
//   "more details",
//   "explain this",
//   "explain that",
//   "i don't understand",
//   "elaborate",
//   "clarify",
//   "explain again",
//   "explain in simple words",
// ];

// const Icon: React.FC<{ name: string; size: number; color: string }> = ({
//   name,
//   size,
//   color,
// }) => <MaterialIcons name={name as any} size={size} color={color} />;

// // ─────────────────────────────────────────────────────────────────────────────
// // SCREEN
// // ─────────────────────────────────────────────────────────────────────────────
// const AIChatbotScreen: React.FC = () => {
//   const flatListRef = useRef<FlatList>(null);
//   const hasSentMessageRef = useRef(false);

//   const [showDifficulty, setShowDifficulty] = useState(false);
//   const [keyboardOpen, setKeyboardOpen] = useState(false);
//   const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
//   const [showExportOptions, setShowExportOptions] = useState(false);
//   const { taggedMessage, setTaggedMessage } = useUser();

//   const chatOptions = useMemo(
//     () => ({
//       sessionType: "educational",
//       difficulty,
//     }),
//     [difficulty]
//   );

//   const {
//     messages,
//     isTyping,
//     quickReplies,
//     error,
//     historyLoading,
//     sendMessage,
//   } = useChat(chatOptions);

//   // ── Keyboard listener ──────────────────────────────────────────────────────
//   useEffect(() => {
//     const show = Keyboard.addListener("keyboardDidShow", () =>
//       setKeyboardOpen(true)
//     );
//     const hide = Keyboard.addListener("keyboardDidHide", () =>
//       setKeyboardOpen(false)
//     );
//     return () => {
//       show.remove();
//       hide.remove();
//     };
//   }, []);

//   // ── Build message list ─────────────────────────────────────────────────────
//   // Show WELCOME only if no history loaded
//   const allMessages = useMemo<(Message | "typing")[]>(
//     () => [
//       ...(messages.length === 0 ? [WELCOME] : []),
//       ...messages,
//       ...(isTyping ? (["typing"] as const) : []),
//     ],
//     [messages, isTyping]
//   );

//   const lastAIIndex = useMemo(
//     () =>
//       allMessages.reduce((lastIndex, item, index) => {
//         if (item !== "typing" && item.role === "assistant") return index;
//         return lastIndex;
//       }, -1),
//     [allMessages]
//   );

//   const followUpReplies = useMemo(() => {
//     const replies = [...quickReplies, ...GENERIC_FOLLOWUP_PATTERNS];
//     return Array.from(new Set(replies));
//   }, [quickReplies]);

//   const scrollToBottom = useCallback((animated = true) => {
//     requestAnimationFrame(() => {
//       flatListRef.current?.scrollToEnd({ animated });
//     });
//   }, []);

//   const isUserAtBottomRef = useRef(true);

//   // ── Track if user is at bottom ─────────────────────────────────────────────
//   const handleScroll = useCallback((event: any) => {
//     const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
//     const paddingToBottom = 20;
//     isUserAtBottomRef.current =
//       layoutMeasurement.height + contentOffset.y >=
//       contentSize.height - paddingToBottom;
//   }, []);

//   // ── Auto-scroll on new message (only if user is at bottom) ─────────────────
//   useEffect(() => {
//     if (allMessages.length > 0 && isUserAtBottomRef.current) {
//       scrollToBottom();
//     }
//   }, [allMessages.length, scrollToBottom]);

//   // ── Auto-scroll on mount (always scroll to bottom) ─────────────────────────
//   useEffect(() => {
//     if (messages.length > 0) {
//       scrollToBottom(false);
//     }
//   }, [messages.length, scrollToBottom]);

//   const keyExtractor = useCallback((item: Message | "typing") => {
//     return item === "typing" ? "typing" : item.id;
//   }, []);

//   // ── Handle send with optional file ────────────────────────────────────────
//   const handleSend = useCallback(
//     (text: string, file?: AttachedFile) => {
//       hasSentMessageRef.current = true;
//       sendMessage(text, file, {
//         context: taggedMessage?.dbId,
//       });
//       setTaggedMessage(null);
//     },
//     [sendMessage, taggedMessage]
//   );

//   const handleQuickReply = useCallback(
//     (text: string) => {
//       hasSentMessageRef.current = true;
//       sendMessage(text, undefined, {
//         context: taggedMessage?.dbId,
//       });
//       setTaggedMessage(null);
//     },
//     [sendMessage, taggedMessage]
//   );

//   const renderItem = useCallback(
//     ({ item, index }: { item: Message | "typing"; index: number }) => {
//       if (item === "typing") return <TypingIndicator />;

//       const shouldAnimate =
//         hasSentMessageRef.current &&
//         !historyLoading &&
//         !isTyping &&
//         item.role === "assistant" &&
//         index === lastAIIndex;

//       return (
//         <ChatMessage
//           message={item}
//           animate={shouldAnimate}
//           onTagPress={setTaggedMessage}
//         />
//       );
//     },
//     [historyLoading, isTyping, lastAIIndex]
//   );

//   // ─────────────────────────────────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />

//       <KeyboardAvoidingView
//         style={{ flex: 1, position: "relative", paddingBottom: 30 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={
//           Platform.OS === "ios" ? 88 : keyboardOpen ? 55 : 25
//         }
//       >
//         {/* ── History loading spinner ── */}
//         {historyLoading ? (
//           <View style={styles.historyLoader}>
//             <ActivityIndicator size="large" color="#3B82F6" />
//             <Text style={styles.historyLoaderText}>
//               Loading chat history...
//             </Text>
//           </View>
//         ) : (
//           <>
//             {/* ── Header with export button ── */}
//             <View style={styles.chatHeader}>
//               <Text style={styles.chatHeaderText}>AI Assistant</Text>
//               <TouchableOpacity
//                 onPress={() => setShowExportOptions(true)}
//                 style={styles.exportHeaderBtn}
//                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//               >
//                 <Icon name="more-vert" size={20} color="#6b7280" />
//               </TouchableOpacity>
//             </View>

//             {/* ── Message list ── */}
//             <FlatList
//               ref={flatListRef}
//               data={allMessages}
//               keyExtractor={keyExtractor}
//               contentContainerStyle={styles.messageList}
//               showsVerticalScrollIndicator={false}
//               style={{ flex: 1 }}
//               keyboardShouldPersistTaps="handled"
//               renderItem={renderItem}
//               onScroll={handleScroll}
//               scrollEventThrottle={400}
//               onContentSizeChange={() => {
//                 if (isUserAtBottomRef.current) {
//                   scrollToBottom();
//                 }
//               }}
//               onLayout={() => scrollToBottom(false)}
//               ListFooterComponent={
//                 error ? (
//                   <View style={styles.errorBox}>
//                     <Text style={styles.errorText}>⚠ {error}</Text>
//                   </View>
//                 ) : null
//               }
//             />
//           </>
//         )}

//         {/* ── Difficulty toggle + collapsible panel ── */}
//         <View style={styles.difficultyContainer}>
//           <TouchableOpacity
//             style={styles.difficultyToggleBtn}
//             onPress={() => setShowDifficulty((prev) => !prev)}
//             activeOpacity={0.85}
//           >
//             <Text style={styles.difficultyToggleIcon}>
//               {showDifficulty ? "v" : "<"}
//             </Text>
//           </TouchableOpacity>

//           {showDifficulty && (
//             <View style={styles.difficultyPanel}>
//               <DifficultySelector
//                 value={difficulty}
//                 onChange={(level) => setDifficulty(level)}
//               />
//             </View>
//           )}
//         </View>

//         {/* ── Follow-up suggestion badges ── */}
//         <QuickReplies
//           replies={followUpReplies}
//           onSelect={handleQuickReply}
//           disabled={isTyping || historyLoading}
//         />

//         {taggedMessage && (
//           <View style={styles.taggedBox}>
//             <View style={styles.taggedActions}>
//               <Icon name="forward" size={18} color="#3B82F6" />
//               <TouchableOpacity
//                 onPress={() => setTaggedMessage(null)}
//                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//               >
//                 <Icon name="close" size={18} color="#6b7280" />
//               </TouchableOpacity>
//             </View>
//             <Text style={styles.taggedText} numberOfLines={2}>
//               {taggedMessage.content}
//             </Text>
//           </View>
//         )}

//         {/* ── Input ── */}
//         <ChatInput
//           onSend={handleSend}
//           disabled={isTyping || historyLoading}
//           placeholder="Ask any question or request to generate a file..."
//         />
//       </KeyboardAvoidingView>

//       {/* ── Export Options Modal ── */}
//       <ExportOptions
//         visible={showExportOptions}
//         onClose={() => setShowExportOptions(false)}
//         messages={messages}
//       />
//     </SafeAreaView>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // STYLES
// // ─────────────────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#fff" },

//   // History loading
//   historyLoader: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 12,
//   },
//   historyLoaderText: {
//     fontSize: 14,
//     color: "#9ca3af",
//   },

//   messageList: {
//     paddingHorizontal: 16,
//     paddingTop: 10,
//     paddingBottom: 8,
//     flexGrow: 1,
//   },

//   chatHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   chatHeaderText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1a1a2e",
//   },
//   exportHeaderBtn: {
//     padding: 8,
//   },

//   errorBox: {
//     backgroundColor: "#fef2f2",
//     borderRadius: 10,
//     padding: 12,
//     marginHorizontal: 16,
//     marginBottom: 8,
//   },
//   errorText: { color: "#dc2626", fontSize: 13 },

//   taggedBox: {
//     backgroundColor: "#EFF6FF",
//     borderTopWidth: 1,
//     borderTopColor: "#DBEAFE",
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//   },
//   taggedActions: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 6,
//   },
//   taggedText: {
//     color: "#1f2937",
//     fontSize: 13,
//     lineHeight: 18,
//   },

//   // ── Updated Difficulty Layout Styles ──
//   difficultyContainer: {
//     alignItems: "flex-end",
//     paddingHorizontal: 16,
//     marginBottom: 8,
//     zIndex: 10,
//   },
//   difficultyToggleBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "#3B82F6",
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//     elevation: 6,
//     marginBottom: 8,
//   },
//   difficultyToggleIcon: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "700",
//     lineHeight: 24,
//   },
//   difficultyPanel: {
//     width: "100%",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 4,
//     overflow: "hidden",

//     //    position: "absolute",
//     // bottom: 50,
//     // right: 0,
//     // left: 0,
//     // zIndex: 15,
// //     borderRadius: 12,
// //     shadowColor: "#000",
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     shadowOffset: { width: 0, height: -2 },
// //     elevation: 4,
//   },
// });

// export default AIChatbotScreen;

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@react-native-vector-icons/material-icons";

import { Message } from "../components/aiAssistant/types";
import useChat from "../components/aiAssistant/hooks/useChat";
import TypingIndicator from "../components/aiAssistant/TypingIndicator";
import ChatMessage from "../components/aiAssistant/ChatMessage";
import QuickReplies from "../components/aiAssistant/QuickReplies";
import ChatInput from "../components/aiAssistant/ChatInput";
import { AttachedFile } from "../components/aiAssistant/ChatInput";
import DifficultySelector, {
  DifficultyLevel,
} from "../components/aiAssistant/DifficultySelector";
import { useUser } from "../contexts/UserContext";
import ExportOptions from "../components/aiAssistant/ExportOptions";

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME MESSAGE — shown only when no history
// ─────────────────────────────────────────────────────────────────────────────
const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I am Acewall Scholars EduMentor, your AI educational assistant. How can I help you today?",
  timestamp: new Date(),
};

const GENERIC_FOLLOWUP_PATTERNS = [
  "explain more",
  "tell me more",
  "what do you mean",
  "continue",
  "go on",
  "more",
  "more details",
  "explain this",
  "explain that",
  "i don't understand",
  "elaborate",
  "clarify",
  "explain again",
  "explain in simple words",
];

const Icon: React.FC<{ name: string; size: number; color: string }> = ({
  name,
  size,
  color,
}) => <MaterialIcons name={name as any} size={size} color={color} />;

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const AIChatbotScreen: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);
  const hasSentMessageRef = useRef(false);

  const [showDifficulty, setShowDifficulty] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const { taggedMessage, setTaggedMessage } = useUser();

  const chatOptions = useMemo(
    () => ({
      sessionType: "educational",
      difficulty,
    }),
    [difficulty]
  );

  const {
    messages,
    isTyping,
    quickReplies,
    error,
    historyLoading,
    sendMessage,
  } = useChat(chatOptions);

  // ── Keyboard listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardOpen(true)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardOpen(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // ── Build message list ─────────────────────────────────────────────────────
  // Show WELCOME only if no history loaded
  const allMessages = useMemo<(Message | "typing")[]>(
    () => [
      ...(messages.length === 0 ? [WELCOME] : []),
      ...messages,
      ...(isTyping ? (["typing"] as const) : []),
    ],
    [messages, isTyping]
  );

  const lastAIIndex = useMemo(
    () =>
      allMessages.reduce((lastIndex, item, index) => {
        if (item !== "typing" && item.role === "assistant") return index;
        return lastIndex;
      }, -1),
    [allMessages]
  );

  const followUpReplies = useMemo(() => {
    const replies = [...quickReplies, ...GENERIC_FOLLOWUP_PATTERNS];
    return Array.from(new Set(replies));
  }, [quickReplies]);

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const isUserAtBottomRef = useRef(true);

  // ── Track if user is at bottom ─────────────────────────────────────────────
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    isUserAtBottomRef.current =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  }, []);

  // ── Auto-scroll on new message (only if user is at bottom) ─────────────────
  useEffect(() => {
    if (allMessages.length > 0 && isUserAtBottomRef.current) {
      scrollToBottom();
    }
  }, [allMessages.length, scrollToBottom]);

  // ── Auto-scroll on mount (always scroll to bottom) ─────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(false);
    }
  }, [messages.length, scrollToBottom]);

  const keyExtractor = useCallback((item: Message | "typing") => {
    return item === "typing" ? "typing" : item.id;
  }, []);

  // ── Handle send with optional file ────────────────────────────────────────
  const handleSend = useCallback(
    (text: string, file?: AttachedFile) => {
      hasSentMessageRef.current = true;
      sendMessage(text, file, {
        context: taggedMessage?.dbId,
      });
      setTaggedMessage(null);
    },
    [sendMessage, taggedMessage]
  );

  const handleQuickReply = useCallback(
    (text: string) => {
      hasSentMessageRef.current = true;
      sendMessage(text, undefined, {
        context: taggedMessage?.dbId,
      });
      setTaggedMessage(null);
    },
    [sendMessage, taggedMessage]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Message | "typing"; index: number }) => {
      if (item === "typing") return <TypingIndicator />;

      const shouldAnimate =
        hasSentMessageRef.current &&
        !historyLoading &&
        !isTyping &&
        item.role === "assistant" &&
        index === lastAIIndex;

      return (
        <ChatMessage
          message={item}
          animate={shouldAnimate}
          onTagPress={setTaggedMessage}
        />
      );
    },
    [historyLoading, isTyping, lastAIIndex]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={{ flex: 1, position: "relative", paddingBottom: 30 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 88 : keyboardOpen ? 55 : 25
        }
      >
        {/* ── History loading spinner ── */}
        {historyLoading ? (
          <View style={styles.historyLoader}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.historyLoaderText}>
              Loading chat history...
            </Text>
          </View>
        ) : (
          <>
            {/* ── Header with export button ── */}
            <View style={styles.chatHeader}>
              <Text style={styles.chatHeaderText}>AI Assistant</Text>
              <TouchableOpacity
                onPress={() => setShowExportOptions(true)}
                style={styles.exportHeaderBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="more-vert" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* ── Message list ── */}
            <FlatList
              ref={flatListRef}
              data={allMessages}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              keyboardShouldPersistTaps="handled"
              renderItem={renderItem}
              onScroll={handleScroll}
              scrollEventThrottle={400}
              onContentSizeChange={() => {
                if (isUserAtBottomRef.current) {
                  scrollToBottom();
                }
              }}
              onLayout={() => scrollToBottom(false)}
              ListFooterComponent={
                error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠ {error}</Text>
                  </View>
                ) : null
              }
            />
          </>
        )}

        {/* ── Difficulty toggle + collapsible panel ── */}
        <View style={styles.difficultyContainer}>
          <TouchableOpacity
            style={styles.difficultyToggleBtn}
            onPress={() => setShowDifficulty((prev) => !prev)}
            activeOpacity={0.85}
          >
            <Text style={styles.difficultyToggleIcon}>
              {showDifficulty ? "v" : "<"}
            </Text>
          </TouchableOpacity>

          {showDifficulty && (
            <View style={styles.difficultyPanel}>
              <DifficultySelector
                value={difficulty}
                onChange={(level) => setDifficulty(level)}
              />
            </View>
          )}
        </View>

        {/* ── Follow-up suggestion badges ── */}
        <QuickReplies
          replies={followUpReplies}
          onSelect={handleQuickReply}
          disabled={isTyping || historyLoading}
        />

        {taggedMessage && (
          <View style={styles.taggedBox}>
            <View style={styles.taggedActions}>
              <Icon name="forward" size={18} color="#3B82F6" />
              <TouchableOpacity
                onPress={() => setTaggedMessage(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.taggedText} numberOfLines={2}>
              {taggedMessage.content}
            </Text>
          </View>
        )}

        {/* ── Input ── */}
        <ChatInput
          onSend={handleSend}
          disabled={isTyping || historyLoading}
          placeholder="Ask any question or request to generate a file..."
        />
      </KeyboardAvoidingView>

      {/* ── Export Options Modal ── */}
      <ExportOptions
        visible={showExportOptions}
        onClose={() => setShowExportOptions(false)}
        messages={messages}
      />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  // History loading
  historyLoader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  historyLoaderText: {
    fontSize: 14,
    color: "#9ca3af",
  },

  messageList: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    flexGrow: 1,
  },

  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  chatHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  exportHeaderBtn: {
    padding: 8,
  },

  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  errorText: { color: "#dc2626", fontSize: 13 },

  taggedBox: {
    backgroundColor: "#EFF6FF",
    borderTopWidth: 1,
    borderTopColor: "#DBEAFE",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  taggedActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  taggedText: {
    color: "#1f2937",
    fontSize: 13,
    lineHeight: 18,
  },

  // ── Difficulty container ──────────────────────────────────────────────────
  difficultyContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    marginBottom: 8,
    zIndex: 10,
  },
  difficultyToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    marginBottom: 8,
  },
  difficultyToggleIcon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  // ── UPDATED: No borders, no shadow, no background ────────────────────────
  difficultyPanel: {
    width: "100%",
    // Transparent background, no rounded corners, no elevation
    // This makes the panel feel seamless, not a floating card
  },
});

export default AIChatbotScreen;

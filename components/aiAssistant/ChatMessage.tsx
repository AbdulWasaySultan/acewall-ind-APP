// ChatMessage.tsx
// Renders a single chat bubble — user (right, blue) or assistant (left, gray)
// AI messages animate word by word like a typewriter
// User messages show attached image or PDF card
// AI messages show generated file download/view options

import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Linking, Platform } from "react-native";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { Message } from "./types";

const Icon: React.FC<{ name: string; size: number; color: string }> = ({
  name,
  size,
  color,
}) => <MaterialIcons name={name as any} size={size} color={color} />;

interface ChatMessageProps {
  message: Message;
  animate?: boolean;
  onTagPress?: (message: Message) => void;
}

const animatedMessageIds = new Set<string>();

const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const formatSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPEWRITER HOOK
// ─────────────────────────────────────────────────────────────────────────────
const useTypewriter = (
  animationKey: string,
  fullText: string,
  shouldAnimate: boolean,
  speed = 18
) => {
  const alreadyAnimated = animatedMessageIds.has(animationKey);
  const [displayed, setDisplayed] = useState(
    shouldAnimate && !alreadyAnimated ? "" : fullText
  );
  const [done, setDone] = useState(!shouldAnimate || alreadyAnimated);
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animatedTextRef = useRef<string | null>(
    shouldAnimate && !alreadyAnimated ? null : fullText
  );

  useEffect(() => {
    if (intervalRef.current) {
      return;
    }

    if (!shouldAnimate || animatedMessageIds.has(animationKey)) {
      setDisplayed(fullText);
      setDone(true);
      animatedTextRef.current = fullText;
      return;
    }

    if (done && animatedTextRef.current === fullText) {
      return;
    }

    setDisplayed("");
    setDone(false);
    indexRef.current = 0;
    animatedTextRef.current = fullText;
    animatedMessageIds.add(animationKey);

    intervalRef.current = setInterval(() => {
      if (indexRef.current < fullText.length) {
        setDisplayed(fullText.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setDone(true);
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [animationKey, fullText, shouldAnimate, speed]);

  return { displayed, done };
};
// ─────────────────────────────────────────────────────────────────────────────
// IMAGE ATTACHMENT — full image inside bubble
// ─────────────────────────────────────────────────────────────────────────────
const ImageAttachment: React.FC<{ uri: string }> = ({ uri }) => (
  <Image source={{ uri }} style={attachStyles.image} resizeMode="cover" />
);

// ─────────────────────────────────────────────────────────────────────────────
// PDF / DOC ATTACHMENT — card with icon, name, size
// ─────────────────────────────────────────────────────────────────────────────
const DocumentAttachment: React.FC<{
  name: string;
  type: string;
  size?: number;
}> = ({ name, type, size }) => {
  const isPDF = type === "application/pdf";
  const icon = isPDF ? "picture-as-pdf" : "insert-drive-file";
  const color = isPDF ? "#dc2626" : "#3B82F6";
  const ext = name.split(".").pop()?.toUpperCase() ?? "FILE";

  return (
    <View style={attachStyles.docCard}>
      <View
        style={[attachStyles.docIconBox, { backgroundColor: color + "20" }]}
      >
        <Icon name={icon} size={26} color={color} />
      </View>
      <View style={attachStyles.docInfo}>
        <Text style={attachStyles.docName} numberOfLines={2}>
          {name}
        </Text>
        <Text style={attachStyles.docMeta}>
          {ext}
          {size ? ` · ${formatSize(size)}` : ""}
        </Text>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERATED FILE ATTACHMENT — downloadable file from AI
// ─────────────────────────────────────────────────────────────────────────────
const GeneratedFileAttachment: React.FC<{
  generatedFile: any;
}> = ({ generatedFile }) => {
  const handleDownload = async () => {
    try {
      const supported = await Linking.canOpenURL(generatedFile.url);
      if (supported) {
        await Linking.openURL(generatedFile.url);
      } else {
        Alert.alert('Error', 'Cannot open this file URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open file');
    }
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType?.toLowerCase() || '';
    if (type === 'pdf') return 'picture-as-pdf';
    if (type === 'doc' || type === 'docx') return 'description';
    if (type === 'xls' || type === 'xlsx') return 'table-view';
    return 'insert-drive-file';
  };

  const getFileColor = (fileType: string) => {
    const type = fileType?.toLowerCase() || '';
    if (type === 'pdf') return '#dc2626';
    if (type === 'doc' || type === 'docx') return '#3B82F6';
    if (type === 'xls' || type === 'xlsx') return '#10B981';
    return '#6b7280';
  };

  const icon = getFileIcon(generatedFile.FileType);
  const color = getFileColor(generatedFile.FileType);

  return (
    <TouchableOpacity
      style={attachStyles.generatedFileCard}
      onPress={handleDownload}
      activeOpacity={0.7}
    >
      <View style={[attachStyles.genFileIconBox, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={attachStyles.genFileInfo}>
        <Text style={attachStyles.genFileTitle} numberOfLines={1}>
          Download {generatedFile.FileType?.toUpperCase() || 'FILE'}
        </Text>
        <Text style={attachStyles.genFileName} numberOfLines={1}>
          {generatedFile.filename}
        </Text>
      </View>
      <Icon name="download" size={20} color={color} />
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  animate = false,
  onTagPress,
}) => {
  const isUser = message.role === "user";
  const isImage = message.file?.type?.startsWith("image/");

  const { displayed, done } = useTypewriter(
    message.id,
    message.content,
    !isUser && animate,
    18
  );

  return (
    <View
      style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAI]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAI,
          // Remove padding when image fills bubble
          isImage && !message.content ? styles.bubbleNoPadding : null,
        ]}
      >
        {/* ── Image attachment ── */}
        {message.file && isImage && <ImageAttachment uri={message.file.uri} />}

        {/* ── PDF / Doc attachment ── */}
        {message.file && !isImage && (
          <DocumentAttachment
            name={message.file.name}
            type={message.file.type}
            size={message.file.size}
          />
        )}

        {/* ── Generated file attachment (AI only) ── */}
        {!isUser && message.generatedFile && (
          <GeneratedFileAttachment generatedFile={message.generatedFile} />
        )}

        {/* ── Text ── */}
        {(displayed.length > 0 || (!isUser && !done)) && (
          <Text
            style={[
              styles.text,
              isUser ? styles.textUser : styles.textAI,
              message.file ? { marginTop: 8 } : null,
            ]}
          >
            {displayed}
            {!isUser && !done && <Text style={styles.cursor}>|</Text>}
          </Text>
        )}
      </View>

      {!isUser && message.fileUsed && (
        <Text style={[styles.fileUsed, styles.metaLeft]}>
          Analyzed: {message.fileUsed}
        </Text>
      )}

      {/* Timestamp */}
      {(isUser || done) && (
        <View
          style={[styles.metaRow, isUser ? styles.metaRight : styles.metaLeft]}
        >
          {onTagPress && (
            <TouchableOpacity
              onPress={() => onTagPress(message)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Icon name="forward" size={14} color="#6b7280" />
            </TouchableOpacity>
          )}
          <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const attachStyles = StyleSheet.create({
  // Full image inside bubble
  image: {
    width: 220,
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
  },

  // PDF / doc card
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    gap: 10,
    minWidth: 190,
    maxWidth: 230,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  docIconBox: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  docInfo: { flex: 1 },
  docName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a2e",
    lineHeight: 18,
  },
  docMeta: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 3,
  },
  // Generated file card
  generatedFileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    padding: 12,
    gap: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  genFileIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  genFileInfo: {
    flex: 1,
  },
  genFileTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 2,
  },
  genFileName: {
    fontSize: 11,
    color: "#047857",
  },
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    maxWidth: "82%",
  },
  wrapperUser: { alignSelf: "flex-end", alignItems: "flex-end" },
  wrapperAI: { alignSelf: "flex-start", alignItems: "flex-start" },

  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bubbleUser: {
    backgroundColor: "#3B82F6",
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: "#F0F2F5",
    borderBottomLeftRadius: 4,
  },
  bubbleNoPadding: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden",
  },

  text: { fontSize: 15, lineHeight: 22 },
  textUser: { color: "#fff" },
  textAI: { color: "#1a1a2e" },

  cursor: { color: "#3B82F6", fontWeight: "700", fontSize: 16 },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  metaRight: { marginRight: 4 },
  metaLeft: { marginLeft: 4 },

  timestamp: { fontSize: 11, color: "#9ca3af" },
  fileUsed: {
    fontSize: 11,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 4,
  },
});

export default ChatMessage;

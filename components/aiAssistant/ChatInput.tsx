// ChatInput.tsx
// Layout: [TextInput + 📎] [➤ Send]
// Attach button opens native file browser — shows images + PDFs + docs
// Uses copyTo:'cachesDirectory' to fix Android content:// URI issue

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Platform, Alert,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { pick, types } from '@react-native-documents/picker';

const Icon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => (
  <MaterialIcons name={name as any} size={size} color={color} />
);

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface AttachedFile {
  uri:   string;
  name:  string;
  type:  string;
  size?: number;
}

interface ChatInputProps {
  onSend:       (text: string, file?: AttachedFile) => void;
  disabled?:    boolean;
  placeholder?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled    = false,
  placeholder = 'Message...',
}) => {
  const [text,         setText]         = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = () => {
    if ((!text.trim() && !attachedFile) || disabled) return;
    onSend(text.trim(), attachedFile ?? undefined);
    setText('');
    setAttachedFile(null);
  };

  const canSend = (text.trim().length > 0 || !!attachedFile) && !disabled;

  // ── Attach — copies to cache so server can read the file ─────────────────
  const handleAttach = async () => {
    try {
      // ✅ copyTo:'cachesDirectory' copies content:// to a real file:// path
      const [result] = await pick({
        type: [
          types.pdf,
          types.images,
          types.doc,
          types.docx,
          types.plainText,
        ],
        allowMultiSelection: false,
        copyTo:              'cachesDirectory',
      }) as any;

      console.log('=== PICKED FILE ===');
      console.log('original uri: ', result.uri);
      console.log('fileCopyUri:  ', (result as any).fileCopyUri);
      console.log('name:         ', result.name);
      console.log('type:         ', result.type);

      setAttachedFile({
        uri:  (result as any).fileCopyUri ?? result.uri, // ✅ real path
        name: result.name ?? `file_${Date.now()}`,
        type: result.type ?? 'application/octet-stream',
        size: result.size ?? undefined,
      });

    } catch (e: any) {
      if (e?.code === 'DOCUMENT_PICKER_CANCELED' || e?.message?.includes('cancel')) return;
      Alert.alert('Error', 'Failed to pick file.');
    }
  };

  // ── File icon based on mime type ──────────────────────────────────────────
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/'))  return 'image';
    if (type === 'application/pdf') return 'picture-as-pdf';
    return 'insert-drive-file';
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ── Attached file preview chip ── */}
      {attachedFile && (
        <View style={styles.filePreview}>
          <Icon name={getFileIcon(attachedFile.type)} size={16} color="#3B82F6" />
          <Text style={styles.fileName} numberOfLines={1}>
            {attachedFile.name}
          </Text>
          <TouchableOpacity
            onPress={() => setAttachedFile(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="close" size={14} color="#6b7280" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.row}>

        {/* ── Input pill: TextInput + attach ── */}
        <View style={styles.inputPill}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={1}
            maxLength={2000}
            onSubmitEditing={handleSend}
            editable={!disabled}
            returnKeyType="send"
            blurOnSubmit={false}
          />

          {/* Attach — right inside pill */}
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={handleAttach}
            activeOpacity={0.7}
            disabled={disabled}
          >
            <Icon
              name="attach-file"
              size={20}
              color={attachedFile ? '#3B82F6' : '#6b7280'}
            />
          </TouchableOpacity>
        </View>

        {/* ── Send — outside pill ── */}
        <TouchableOpacity
          style={[styles.sendBtn, canSend && styles.sendBtnActive]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
        >
          <Icon
            name="send"
            size={18}
            color={canSend ? '#fff' : '#9ca3af'}
          />
        </TouchableOpacity>

      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor:   '#fff',
    paddingHorizontal: 16,
    paddingVertical:   12,
    paddingBottom:     Platform.OS === 'ios' ? 40 : 25,
    borderTopWidth:    1,
    borderTopColor:    '#f0f0f0',
  },

  filePreview: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   '#EFF6FF',
    borderRadius:      8,
    paddingHorizontal: 10,
    paddingVertical:   6,
    marginBottom:      8,
    gap:               6,
  },
  fileName: {
    flex:       1,
    fontSize:   12,
    color:      '#1d4ed8',
    fontWeight: '500',
  },

  row: {
    flexDirection: 'row',
    alignItems:    'flex-end',
    gap:           8,
  },

  inputPill: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#f9fafb',
    borderRadius:    100,
    borderWidth:     1,
    borderColor:     '#e5e7eb',
    paddingLeft:     14,
    paddingRight:    6,
    paddingVertical: 3,
    minHeight:       44,
  },

  input: {
    flex:          1,
    fontSize:      14,
    color:         '#1a1a2e',
    lineHeight:    20,
    maxHeight:     120,
    paddingTop:    6,
    paddingBottom: 6,
  },

  attachBtn: {
    width:          34,
    height:         34,
    borderRadius:   17,
    alignItems:     'center',
    justifyContent: 'center',
    marginLeft:     4,
  },

  sendBtn: {
    width:           50,
    height:          50,
    borderRadius:    100,
    backgroundColor: '#e5e7eb',
    alignItems:      'center',
    justifyContent:  'center',
  },
  sendBtnActive: {
    backgroundColor: '#3B82F6',
  },
});

export default ChatInput;
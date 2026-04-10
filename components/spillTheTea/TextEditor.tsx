import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

interface Props {
  value:    string;
  onChange: (text: string) => void;
}

const TextEditor: React.FC<Props> = ({ value, onChange }) => {
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Start writing..."
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChange}
        multiline
        textAlignVertical="top"
      />

      {/* Status bar — matches screenshot */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          CHARS: {charCount}{'   '}WORDS: {wordCount}{'   '}POWERED BY JODIT
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5, borderColor: '#e0e0e0',
    borderRadius: 12, overflow: 'hidden', marginBottom: 4,
  },
  input: {
    minHeight: 160, padding: 14,
    fontSize: 15, color: '#0d1b2a', lineHeight: 22,
  },
  statusBar: {
    borderTopWidth: 1, borderTopColor: '#e0e0e0',
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: '#f9f9f9', alignItems: 'flex-end',
  },
  statusText: { fontSize: 10, color: '#aaa', letterSpacing: 0.5 },
});

export default TextEditor;

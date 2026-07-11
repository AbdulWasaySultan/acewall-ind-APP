// ExportOptions.tsx
// Mobile adaptation of web export functionality
// Uses React Native's Share API for conversation export

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Message } from './types';

const Icon: React.FC<{ name: string; size: number; color: string }> = ({
  name,
  size,
  color,
}) => <MaterialIcons name={name as any} size={size} color={color} />;

interface ExportOptionsProps {
  visible: boolean;
  onClose: () => void;
  messages: Message[];
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  visible,
  onClose,
  messages,
}) => {
  const formatConversation = () => {
    let text = 'AI Assistant Conversation\n';
    text += '========================\n\n';
    
    messages.forEach((msg) => {
      const sender = msg.role === 'user' ? 'You' : 'AI Assistant';
      const time = msg.timestamp.toLocaleTimeString();
      text += `[${time}] ${sender}:\n${msg.content}\n\n`;
      
      if (msg.file) {
        text += `[Attached: ${msg.file.name}]\n\n`;
      }
      
      if (msg.generatedFile) {
        text += `[Generated File: ${msg.generatedFile.filename}]\n\n`;
      }
    });
    
    return text;
  };

  const handleExportConversation = async () => {
    try {
      const conversationText = formatConversation();
      await Share.share({
        message: conversationText,
        title: 'AI Assistant Conversation',
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to export conversation');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Export Conversation</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {/* Export Conversation as Text */}
            <TouchableOpacity
              style={styles.option}
              onPress={handleExportConversation}
            >
              <View style={styles.optionIcon}>
                <Icon name="share" size={24} color="#3B82F6" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Export as Text</Text>
                <Text style={styles.optionDescription}>
                  Share conversation as text file
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});

export default ExportOptions;
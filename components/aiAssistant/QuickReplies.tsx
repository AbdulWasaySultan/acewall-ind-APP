// QuickReplies.tsx
// Horizontal scrollable pill-shaped quick reply suggestion chips

import React from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';

interface QuickRepliesProps {
  replies:  string[];
  onSelect: (reply: string) => void;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ replies, onSelect }) => {
  if (replies.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {replies.map((reply, index) => (
          <TouchableOpacity
            key={`${reply}-${index}`}
            style={styles.chip}
            onPress={() => onSelect(reply)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipText}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  scroll: {
    paddingHorizontal: 16,
    flexWrap:          'wrap',
    flexDirection:     'row',
    gap:               8,
  },
  chip: {
    borderWidth:      1.5,
    borderColor:      '#d1d5db',
    borderRadius:     20,
    paddingHorizontal: 14,
    paddingVertical:   8,
    backgroundColor:  '#fff',
    marginBottom:     8,
  },
  chipText: {
    fontSize:   13,
    color:      '#374151',
    fontWeight: '500',
  },
});

export default QuickReplies;

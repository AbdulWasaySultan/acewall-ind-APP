// DifficultySelector.tsx
// Difficulty level selector — Easy / Medium / Hard
// Shows a gradient bar and passes selected level to AI context

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';


interface DifficultySelectorProps {
  value:    DifficultyLevel;
  onChange: (level: DifficultyLevel) => void;
}

const LEVELS: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];

const LEVEL_COLORS: Record<DifficultyLevel, string> = {
  Easy:   '#10B144',
  Medium: '#3B82F6',
  Hard:   '#EF4444',
};

const LEVEL_BAR_WIDTH: Record<DifficultyLevel, `${number}%`> = {
  Easy:   '33%',
  Medium: '66%',
  Hard:   '100%',
};

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          <Text style={styles.titleBold}>Difficulty</Text> Level
        </Text>
      </View>

      {/* Buttons row */}
      <View style={styles.btnRow}>
        {LEVELS.map((level) => {
          const isActive = value === level;
          return (
            <TouchableOpacity
              key={level}
              style={[
                styles.btn,
                isActive && { backgroundColor: LEVEL_COLORS[level], borderColor: LEVEL_COLORS[level] },
              ]}
              onPress={() => onChange(level)}
              activeOpacity={0.8}
            >
              {isActive && (
                <Text style={styles.checkIcon}>✓ </Text>
              )}
              <Text style={[styles.btnText, isActive && styles.btnTextActive]}>
                {level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Gradient progress bar */}
      <View style={styles.barTrack}>
  <View
    style={[
      styles.barFill,
      {
        flex:            value === 'Easy' ? 0.33 : value === 'Medium' ? 0.66 : 1,
        backgroundColor: LEVEL_COLORS[value],
      },
    ]}
  />
  {/* Remaining space filler */}
  <View style={{ flex: value === 'Easy' ? 0.67 : value === 'Medium' ? 0.34 : 0 }} />
</View>

      <Text style={[styles.currentLabel, { color: LEVEL_COLORS[value] }]}>
        Current: {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:  '#fff',
    paddingHorizontal: 16,
    paddingVertical:   12,
    borderTopWidth:    1,
    borderTopColor:    '#f0f0f0',
  },
  header: {
    marginBottom: 10,
  },
  title:     { fontSize: 14, color: '#374151' },
  titleBold: { fontWeight: '700', color: '#1a1a2e' },

  btnRow: {
    flexDirection:  'row',
    gap:            8,
    marginBottom:   10,
  },
  btn: {
    flex:             1,
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    paddingVertical:  8,
    borderRadius:     20,
    borderWidth:      1.5,
    borderColor:      '#d1d5db',
    backgroundColor:  '#fff',
  },
  btnText:       { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  btnTextActive: { color: '#fff' },
  checkIcon:     { fontSize: 12, color: '#fff' },

  barTrack: {
    height:          6,
    backgroundColor: '#e5e7eb',
    borderRadius:    3,
    overflow:        'hidden',
    marginBottom:    6,
  },
  barFill: {
    height:       '100%',
    borderRadius: 3,
  },
  currentLabel: {
    fontSize:  12,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default DifficultySelector;

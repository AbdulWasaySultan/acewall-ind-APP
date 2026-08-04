import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { PostTarget } from './types';

interface Props {
  value:    PostTarget;
  onChange: (v: PostTarget) => void;
}

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const OPTIONS: { key: PostTarget; label: string; icon: MaterialIconName }[] = [
  { key: 'public', label: 'Public Feed',  icon: 'public' },
  { key: 'course', label: 'Course Class', icon: 'school' },
];

const TargetToggle: React.FC<Props> = ({ value, onChange }) => (
  <View style={styles.row}>
    {OPTIONS.map((opt) => {
      const active = value === opt.key;
      return (
        <TouchableOpacity
          key={opt.key}
          style={[styles.btn, active && styles.btnActive]}
          onPress={() => onChange(opt.key)}
        >
          <MaterialIcons name={opt.icon} size={18} color={active ? '#fff' : '#555'} />
          <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, borderRadius: 12,
    paddingVertical: 14, backgroundColor: '#f5f5f5',
    borderWidth: 1.5, borderColor: '#e0e0e0',
  },
  btnActive:   { backgroundColor: '#10B144', borderColor: '#10B144' },
  label:       { fontSize: 15, fontWeight: '700', color: '#555' },
  labelActive: { color: '#fff' },
});

export default TargetToggle;

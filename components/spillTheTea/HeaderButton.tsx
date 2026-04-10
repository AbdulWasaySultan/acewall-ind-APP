import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from './mnt/user-data/outputs/SpillTheTea/constants';


interface HeaderButtonProps {
  label:   string;
  icon:    string;
  onPress: () => void;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({ label, icon, onPress }) => (
  <TouchableOpacity style={styles.btn} onPress={onPress}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: COLORS.white,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  icon:  { fontSize: 14, color: COLORS.white },
  label: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
});

export default HeaderButton;

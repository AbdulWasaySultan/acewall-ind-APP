import React from 'react';
import { View, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { MediaFile } from './types';

interface Props {
  files:    MediaFile[];
  onRemove: (index: number) => void;
}

const MediaGrid: React.FC<Props> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}
      showsVerticalScrollIndicator={false}
    >
      {files.map((file, index) => (
        <View key={`${file.uri}-${index}`} style={styles.thumb}>
          <Image source={{ uri: file.uri }} style={styles.image} />

          {file.type === 'video' && (
            <View style={styles.videoOverlay}>
              <MaterialIcons name="play-arrow" size={24} color="#fff" />
            </View>
          )}

          <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
            <MaterialIcons name="close" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row:  { marginTop: 12 },
  thumb: {
    width: 80, height: 80, borderRadius: 10,
    marginRight: 8, overflow: 'hidden',
  },
  image:        { width: '100%', height: '100%' },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtn: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
});

export default MediaGrid;

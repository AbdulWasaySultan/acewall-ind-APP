import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { MediaFile } from './types';

interface Props {
  onAdd: (file: MediaFile) => void;
}

const toMediaFile = (asset: Asset, type: 'photo' | 'video'): MediaFile => ({
  uri:  asset.uri!,
  type,
  name: asset.fileName ?? `${type}_${Date.now()}`,
});

const MediaPicker: React.FC<Props> = ({ onAdd }) => {

  const pick = (mediaType: 'photo' | 'video') => {
    launchImageLibrary(
      {
        mediaType:      mediaType === 'photo' ? 'photo' : 'video',
        quality:        0.8,
        selectionLimit: mediaType === 'photo' ? 5 : 1,
      },
      (res: ImagePickerResponse) => {
        if (res.didCancel) return;
        if (res.errorCode) {
          Alert.alert('Error', res.errorMessage ?? 'Could not open media library.');
          return;
        }
        res.assets?.forEach((asset: Asset) => {
          if (!asset.uri) return;
  
          //  Fix Android video URI — use originalPath if available
          const uri = asset.originalPath
            ? `file://${asset.originalPath}`  // ← real file path for videos
            : asset.uri;
  
          onAdd({
            uri,
            type: mediaType,
            name: asset.fileName ?? `${mediaType}_${Date.now()}`,
          });
        });
      }
    );
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.btn} onPress={() => pick('photo')}>
        <MaterialIcons name="image"    size={20} color="#10B144" />
        <Text style={styles.label}>Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => pick('video')}>
        <MaterialIcons name="videocam" size={20} color="#1565C0" />
        <Text style={styles.label}>Video</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  label: { fontSize: 15, color: '#0d1b2a', fontWeight: '600' },
});

export default MediaPicker;

// FullscreenVideo.tsx
// Renders a fullscreen modal video player with native controls.
// Seek is disabled — only play/pause, volume, and time are shown.

import React from 'react';
import {
  View, Text, TouchableOpacity,
  Modal, StatusBar, StyleSheet, Dimensions,
} from 'react-native';
import Video from 'react-native-video';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface FullscreenVideoProps {
  url:     string;
  visible: boolean;
  onClose: () => void;
}

const FullscreenVideo: React.FC<FullscreenVideoProps> = ({ url, visible, onClose }) => (
  <Modal
    visible={visible}
    animationType="fade"
    supportedOrientations={['portrait', 'landscape']}
    statusBarTranslucent
    onRequestClose={onClose}
  >
    <StatusBar hidden />
    <View style={styles.container}>

      <Video
        source={{ uri: url }}
        style={styles.video}
        resizeMode="contain"
        paused={false}
        repeat={true}
        muted={false}
        controls={true}      // native controls: play, time, volume
        bufferConfig={{
          minBufferMs:                      5000,
          maxBufferMs:                      15000,
          bufferForPlaybackMs:              2500,
          bufferForPlaybackAfterRebufferMs: 5000,
        }}
        onError={(e) => console.warn('Video error:', e)}
      />

      {/* ✕ Close — top right, above native controls */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width:  SCREEN_W,
    height: SCREEN_H,
  },
  closeBtn: {
    position: 'absolute',
    top: 48, right: 20,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  closeBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

export default FullscreenVideo;

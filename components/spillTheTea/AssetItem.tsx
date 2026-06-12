// AssetItem.tsx
// Renders a single image or inline muted video with:
//   - tap to pause/resume
//   - ⛶ button to open fullscreen
//   - autoplay when isVisible=true

import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import Video from 'react-native-video';
import FullscreenVideo from './FullscreenVideo';

const isVideo = (type: string) => type?.startsWith('video/');

interface AssetItemProps {
  url:       string;
  type:      string;
  isVisible: boolean;  // controlled by FlatList viewability
}

const AssetItem: React.FC<AssetItemProps> = ({ url, type, isVisible }) => {
  const [fsOpen,      setFsOpen]      = useState(false);
  const [manualPause, setManualPause] = useState(false);

  // Play when on screen AND not manually paused
  const paused = !isVisible || manualPause;

  if (isVideo(type)) {
    return (
      <View style={styles.mediaCard}>

        {/* Inline muted preview */}
        <Video
          source={{ uri: url }}
          style={styles.mediaImage}
          resizeMode="cover"
          paused={paused}
          repeat={true}
          muted={true}       // muted in feed — sound only in fullscreen
          controls={false}   // no controls in feed
          bufferConfig={{
            minBufferMs:                      5000,
            maxBufferMs:                      15000,
            bufferForPlaybackMs:              2500,
            bufferForPlaybackAfterRebufferMs: 5000,
          }}
          onError={(e) => console.warn('Video error:', e)}
        />

        {/* Tap area — pause/resume on tap, fullscreen on long press */}
        <TouchableOpacity
          style={styles.tapArea}
          onPress={() => setManualPause((p) => !p)}
          onLongPress={() => setFsOpen(true)}
          activeOpacity={1}
        >
          {/* ⛶ Fullscreen button */}
          <TouchableOpacity
            style={styles.fullscreenBtn}
            onPress={() => setFsOpen(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.fullscreenIcon}>⛶</Text>
          </TouchableOpacity>

          {/* ▶ Play icon — visible only when paused & card is on screen */}
          {paused && isVisible && (
            <View style={styles.playOverlay}>
              <View style={styles.playCircle}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Fullscreen modal */}
        <FullscreenVideo
          url={url}
          visible={fsOpen}
          onClose={() => setFsOpen(false)}
        />

      </View>
    );
  }

  // Image
  return (
    <View style={styles.mediaCard}>
      <Image
        source={{ uri: url }}
        style={styles.mediaImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mediaCard:  { position: 'relative', width: '100%', backgroundColor: '#ffff' },
  mediaImage: { width: '100%', height: 220 },
  tapArea:    { ...StyleSheet.absoluteFillObject },

  fullscreenBtn: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 32, height: 32, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 5,
  },
  fullscreenIcon: { color: '#fff', fontSize: 16 },

  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  playCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  playIcon: { fontSize: 22, color: '#0d1b2a', marginLeft: 4 },
});

export default AssetItem;

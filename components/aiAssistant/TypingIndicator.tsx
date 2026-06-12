// TypingIndicator.tsx
// Animated three-dot indicator shown while AI is generating response

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const Dot: React.FC<{ delay: number }> = ({ delay }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1,   duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return <Animated.View style={[styles.dot, { opacity }]} />;
};

const TypingIndicator: React.FC = () => (
  <View style={styles.wrapper}>
    <View style={styles.bubble}>
      <Dot delay={0}   />
      <Dot delay={200} />
      <Dot delay={400} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'flex-start', marginBottom: 16 },
  bubble: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    backgroundColor:   '#F0F2F5',
    borderRadius:      20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 18,
    paddingVertical:   16,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: '#6b7280',
  },
});

export default TypingIndicator;

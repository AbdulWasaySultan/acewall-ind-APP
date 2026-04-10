import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { COLORS } from './mnt/user-data/outputs/SpillTheTea/constants';


interface AvatarProps {
  uri?:  string;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ uri, size = 44 }) => {
  const circleStyle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.wrapper, circleStyle]}>
      {uri
        ? <Image source={{ uri }} style={circleStyle} />
        : <View style={[styles.fallback, circleStyle]} />
      }
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper:  { overflow: 'hidden' },
  fallback: { backgroundColor: COLORS.avatarBg },
});

export default Avatar;

// AssetGrid.tsx
// Renders a single full-width asset or a horizontal scroll
// of multiple assets. Passes isVisible down to each AssetItem.

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import AssetItem from './AssetItem';
import { Post } from '.';


interface AssetGridProps {
  assets:    Post['assets'];
  isVisible: boolean;
}

const AssetGrid: React.FC<AssetGridProps> = ({ assets, isVisible }) => {
  if (!assets || assets.length === 0) return null;

  // Single asset — full width
  if (assets.length === 1) {
    return (
      <View style={styles.singleWrapper}>
        <AssetItem
          url={assets[0].url}
          type={assets[0].type}
          isVisible={isVisible}
        />
      </View>
    );
  }

  // Multiple assets — horizontal scroll
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.multiWrapper}
      contentContainerStyle={{ gap: 10 }}
    >
      {assets.map((asset) => (
        <View key={asset._id} style={styles.multiItem}>
          <AssetItem
            url={asset.url}
            type={asset.type}
            isVisible={isVisible}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  singleWrapper: {
    borderRadius: 12, overflow: 'hidden', marginBottom: 12,
    backgroundColor: '#000',
    shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  multiWrapper: { marginBottom: 12 },
  multiItem: {
    width: 220, borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
});

export default AssetGrid;

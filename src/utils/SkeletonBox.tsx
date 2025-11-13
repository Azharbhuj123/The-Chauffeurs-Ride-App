// SkeletonBox.js
import React from 'react';
import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const SkeletonBox = ({
  height = 100,
  borderRadius = 12,
  margin = 16,
  padding = 20,
  marginTop = 0,
}) => {
  return (
    <SkeletonPlaceholder borderRadius={borderRadius}>
      <View
        style={{
          height,
          borderRadius,
          margin,
          padding,
          marginTop,
        }}
      />
    </SkeletonPlaceholder>
  );
};

export default SkeletonBox;

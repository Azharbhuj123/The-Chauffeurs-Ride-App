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
  width = null,
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
    ...(width !== null && { width }), // <- Only add width if NOT null
  }}
/>

    </SkeletonPlaceholder>
  );
};

export default SkeletonBox;

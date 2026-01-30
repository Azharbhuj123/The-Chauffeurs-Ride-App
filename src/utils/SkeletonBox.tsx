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
    <View style={{ backgroundColor: "#fff" }}>  
      <SkeletonPlaceholder
        borderRadius={borderRadius}
        backgroundColor="#E1E9EE"
        highlightColor="#F2F8FC"
      >
        <View
          style={{
            height,
            borderRadius,
            margin,
            padding,
            marginTop,
            ...(width !== null && { width }),
          }}
        />
      </SkeletonPlaceholder>
    </View>
  );
};

export default SkeletonBox;

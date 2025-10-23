// helpers/getTabBarHeight.js
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export const useTabBarHeightHelper = () => {
  const tabBarHeight = useBottomTabBarHeight();
  return tabBarHeight;
};

// @ts-nocheck
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  Text,
  SafeAreaView,
} from 'react-native';
import { useUserStore } from '../stores/useUserStore';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');

// The size for the square logo container (e.g., 25% of the screen width)
const LOGO_SIZE = width * 0.35; // Adjust this value to change the logo size

// Placeholder for your local logo image
// You will need to replace this with the actual import of your image file:
// const logoImage = require('./path/to/your/logo.png');
// For demonstration, we'll use a local component that mimics the logo.

const LogoComponent = () => (
  <View style={styles.logoContainer}>
    <View style={styles.steeringWheel}>
      {/* Outer Circle (Steering Wheel Rim) */}
      <View style={styles.wheelRim} />

      {/* Cross Spoke (Vertical and Horizontal lines) */}
      <View style={styles.spokeVertical} />
      <View style={styles.spokeHorizontal} />
    </View>

    {/* Text Labels */}
    <View style={styles.textContainer}>
      <Text style={styles.textTop}>INFO</Text>
      <Text style={styles.textBottom}>ASSURANCE</Text>
    </View>
  </View>
);

function Intro({ navigation }) {
  // Animated value for the scale transform
  const scaleAnim = useRef(new Animated.Value(0.5)).current; // Start smaller
  const { token, hydrated, loadStoredData } = useUserStore();

  useEffect(() => {
    const runStartup = async () => {
      await loadStoredData(); // ✅ load data first
    };
    runStartup();
  }, []); // runs only once on mount

  // ✅ When hydrated becomes true, run animation + navigate
  useEffect(() => {
    if (!hydrated) return; // wait until Zustand finished loading

    const animateAndNavigate = async () => {
      const splash_bypass = await AsyncStorage.getItem('splash_bypass');

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        velocity: 2,
        useNativeDriver: true,
      }).start(() => {
        console.log('✅ TOKEN AFTER HYDRATION:', token);

        const where_to_go = token ? 'MainTabs' : 'Login';
        navigation.replace(splash_bypass === 'true' ? where_to_go : 'Splash');
      });
    };

    animateAndNavigate();
  }, [hydrated]); // ✅ triggers only when storage is done

  // Apply the scale animation style
  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  // To achieve the exact design shown (full-screen white background)
  // and the status bar appearance (black time/battery icons), we'll
  // use SafeAreaView and set the StatusBar style.

  return (
    // SafeAreaView handles notches and status bar area on iOS
    <SafeAreaView style={styles.container}>
      {/* Set the status bar text/icons to dark (iOS) */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Centered Animated View */}
      <View style={styles.centerContainer}>
        <Animated.View style={[styles.animatedView, animatedStyle]}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logoImage}
          />
        </Animated.View>
      </View>

      {/* Optional: Placeholder for the Home Indicator Bar at the bottom (as seen in the image) */}
      <View style={styles.homeIndicatorPlaceholder} />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    // Fills the entire screen
    flex: 1,
    backgroundColor: '#ffffff', // White background
  },
  centerContainer: {
    // Centers content vertically and horizontally within the main view
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedView: {
    // Base style for the view that gets scaled
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- Logo Specific Styles (If using a built-in component) ---
  logoContainer: {
    width: '100%', // Takes up the full size of the animatedView
    height: '100%',
    backgroundColor: '#ffc700', // Yellow background
    borderRadius: LOGO_SIZE * 0.22, // Rounded corners matching the image
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow for a professional 3D feel (optional, can be removed)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8, // For Android shadow
    overflow: 'hidden', // Important for contained elements
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  // --- Styling for the internal Logo content (mimicking the image) ---
  steeringWheel: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelRim: {
    width: LOGO_SIZE * 0.6,
    height: LOGO_SIZE * 0.6,
    borderRadius: (LOGO_SIZE * 0.6) / 2,
    borderWidth: LOGO_SIZE * 0.05, // Rim thickness
    borderColor: 'black',
  },
  spokeVertical: {
    position: 'absolute',
    width: LOGO_SIZE * 0.03,
    height: LOGO_SIZE * 0.25, // Extends into the middle
    backgroundColor: 'black',
    top: LOGO_SIZE * 0.25,
  },
  spokeHorizontal: {
    position: 'absolute',
    width: LOGO_SIZE * 0.25,
    height: LOGO_SIZE * 0.03,
    backgroundColor: 'black',
  },
  textContainer: {
    position: 'absolute',
    bottom: LOGO_SIZE * 0.22, // Positioned near the bottom of the yellow square
    alignItems: 'center',
  },
  textTop: {
    fontSize: LOGO_SIZE * 0.1, // Responsive font size
    fontWeight: '900',
    color: 'black',
    lineHeight: LOGO_SIZE * 0.11,
    letterSpacing: 1.5,
  },
  textBottom: {
    fontSize: LOGO_SIZE * 0.06, // Smaller responsive font size
    fontWeight: '500',
    color: 'black',
    letterSpacing: 0.8,
  },
  // --- iOS Home Indicator Placeholder ---
  homeIndicatorPlaceholder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height > 800 ? 34 : 0, // Height for notched devices
    backgroundColor: 'transparent',
  },
});

export default Intro;

//@ts-nocheck
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useRef, useState } from 'react';
import { set } from 'react-hook-form';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Ride in Style with Info Assurance',
    description:
      'Luxury rides, trusted drivers, and seamless bookings anytime, anywhere.',
    imageSource: require('../../assets/images/splash1.png'),
  },
  {
    key: '2',
    title: 'Seamless Booking Experience',
    description:
      'Book your ride instantly, track in real-time, and manage all trips with ease.',
    imageSource: require('../../assets/images/splash2.png'),
  },
];

const Splash_Screen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const scrollToNext = async () => {
    // Use the current state to check if we are on the last slide
    const isLastSlide = currentIndex === slides.length - 1;

    if (!isLastSlide) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      // Manually update index here for immediate response
      setCurrentIndex(nextIndex);
    } else {
      // Logic for the last slide
      try {
        await AsyncStorage.setItem('splash_bypass', 'true');
        console.log('Navigating to Signup...');
        navigation.replace('Signup'); // Use replace to prevent going back to splash
      } catch (e) {
        console.log('Error saving bypass', e);
      }
    }
  };
  const handleSkip = async () => {
    await AsyncStorage.setItem('splash_bypass', 'true');
    navigation.navigate('Signup');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      // Access the index of the first visible item correctly
      const index = viewableItems.index;
      if (index !== null && index !== undefined) {
        setCurrentIndex(index);
      }
    }
  }).current;

  const renderSlide = ({ item, index }) => {
    const isLast = index === slides.length - 1;
    return (
      <View style={styles.slide}>
        <View style={styles.illustrationArea}>
          <Image
            source={item.imageSource}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          {/* Top Text Section */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>

            {/* Moving Pagination inside the card for better control */}
            <View style={styles.paginationContainer}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      width: index === currentIndex ? 30 : 8,
                      backgroundColor:
                        index === currentIndex ? '#FFC107' : '#454545',
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Bottom Button Section */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton} onPress={scrollToNext}>
              <Icon
                name={isLast ? 'check' : 'chevron-right'}
                size={28}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEnabled={false}
        keyExtractor={item => item.key}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // --- Updated Onboarding Styles ---
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  slide: {
    width,
    flex: 1, // Use flex instead of height: 100%
  },
  illustrationArea: {
    flex: 1.2, // Let the top area take more space dynamically
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40, // Space from status bar
  },
  illustrationImage: {
    width: '85%',
    height: '80%',
  },

  // --- Bottom Card ---
  card: {
    flex: 0.8, // Yeh card ko bachi hui jagah dega
    width: width,
    backgroundColor: '#0D1831',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 30,
    paddingTop: 35,

    // Pixel-Perfect Bottom Spacing
    // iOS ke liye 40 (notch) aur Android ke liye 30 safety margin
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,

    justifyContent: 'space-between',
    alignItems: 'center',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    // Fixed height ki jagah padding use karein taake content squeeze na ho
    paddingVertical: 20,

    // Android navigation bar se bachne ke liye safe margin
    // Agar aapko 80 padding pasand aa rahi thi, toh yahan adjust karein
    marginBottom: Platform.OS === 'android' ? 20 : 10,
  },

  // Wrap title and description in a view to keep them grouped at the top
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },

  title: {
    fontSize: 28, // Matches figma scale
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 34,
    fontFamily: 'Poppins-Bold', // Ensure this is linked
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: '#B0B0B0', // Slightly lighter grey
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 10,
  },

  // --- Pagination inside the card ---
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25, // Space between description and dots
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },

  skipButton: {
    width: width * 0.4, // Matches the figma button width ratio
    height: 54,
    backgroundColor: '#ffffff', // White button like figma
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  nextButton: {
    width: width * 0.4,
    height: 54,
    backgroundColor: '#FFC107', // Brighter taxi yellow
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Splash_Screen;

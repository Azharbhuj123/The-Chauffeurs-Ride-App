//@ts-nocheck
import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native'
import Icon from 'react-native-vector-icons/Feather' 
// NOTE: Ensure 'react-native-vector-icons' is installed and linked.

// --- Dimensions and Constants ---
const { width, height } = Dimensions.get('window')
// Adjusting the card height to better match the visual ratio (it looks slightly less than 45%)
const CARD_HEIGHT_RATIO = 0.40 
const CARD_HEIGHT = height * CARD_HEIGHT_RATIO
const TEXT_PADDING = width * 0.06 

// --- Data for the Splash_Screen Screens (Use local requires for images) ---
const slides = [
  {
    key: '1',
    title: 'Ride in Style with Info Assurance',
    description: 'Luxury rides, trusted drivers, and seamless bookings anytime, anywhere.',
    // NOTE: Replace this placeholder path with your actual image path
    imageSource: require('../../assets/images/splash1.png'), 
    // Assuming you have images saved in '../../assets/images/slide1.png'
  },
  {
    key: '2',
    title: 'Seamless Booking Experience',
    description: 'Book your ride instantly, track in real-time, and manage all trips with ease.',
    // NOTE: Replace this placeholder path with your actual image path
    imageSource: require('../../assets/images/splash2.png'),
    // Assuming you have images saved in '../../assets/images/slide2.png'
  },
]

// --- Individual Slide Component ---
const Splash_ScreenSlide = ({ item, isLast, onNext, onSkip }) => {
  return (
    <View style={onboardingStyles.slide}>
      {/* --- 1. Top Illustration Area --- */}
      <View style={onboardingStyles.illustrationArea}>
        <Image 
          source={item.imageSource} 
          style={onboardingStyles.illustrationImage} 
          // The image needs to be scaled down and positioned to fit the layout
          resizeMode="contain" 
        />
      </View>

      {/* --- 2. Bottom Content Card --- */}
      <View style={onboardingStyles.card}>
        <Text style={onboardingStyles.title}>{item.title}</Text>
        <Text style={onboardingStyles.description}>{item.description}</Text>

        {/* Buttons (Skip/Next) */}
        <View style={onboardingStyles.buttonRow}>
          {/* Skip Button */}
          <TouchableOpacity 
            style={onboardingStyles.skipButton}
            onPress={onSkip}
          >
            <Text style={onboardingStyles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Next/Done Button */}
          <TouchableOpacity
            style={onboardingStyles.nextButton}
            onPress={onNext}
          >
            <Icon 
              // Use 'chevron-right' for next, 'check' for done
              name={isLast ? 'check' : 'chevron-right'} 
              size={width * 0.07} 
              color="#000"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

// --- Main Onboarding Component ---
function Splash_Screen({navigation}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef(null)

  // Function to scroll to the next slide
  const scrollToNext = () => {
    
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true })
    } else {
      console.log('Finished Onboarding! Navigate to Home.')
      navigation.navigate('Signup')
    }
  }

  // Function to handle Skip (Jumps to main app flow)
  const handleSkip = () => {
    console.log('Skipped Onboarding! Navigate to Home.')
    navigation.navigate('Signup')
  }

  // Update current index when the user swipes
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0)
    }
  }).current

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current

  // --- Slide Indicator Dots Component ---
  const Pagination = () => {
    return (
      <View style={onboardingStyles.paginationContainer}>
        {slides.map((_, index) => (
          <View
            key={index.toString()}
            style={[
              onboardingStyles.dot,
              {
                // Active dot is longer (width * 0.06), Inactive is smaller (width * 0.02)
                width: index === currentIndex ? width * 0.08 : width * 0.02, 
                // Active dot is yellow, Inactive is dark grey
                backgroundColor: index === currentIndex ? '#ffc700' : '#454545', 
              },
            ]}
          />
        ))}
      </View>
    )
  }

  return (
    <View style={onboardingStyles.container}>
      {/* Dark content status bar for the white background */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* FlatList for Horizontal Sliding */}
      <FlatList
        ref={flatListRef}
        data={slides}
        
        renderItem={({ item, index }) => (
          <Splash_ScreenSlide
            item={item}
            isLast={index === slides.length - 1}
            onNext={scrollToNext}
            onSkip={handleSkip}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
                scrollEnabled={false} // <-- disable user swipe

        keyExtractor={(item) => item.key}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      
      {/* Pagination is rendered outside the FlatList to keep it fixed */}
      <Pagination />
    </View>
  )
}

// --- Onboarding Styles ---
const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
  },
  slide: {
    width, 
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  illustrationArea: {
    // The space above the black card
         height: height * 0.75,

    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // No padding here, we'll let the image handle its margins
  },
  illustrationImage: {
    // Image container fills the top area and scales the image inside
    width: '90%', 
    height: '80%', 
    // Positioned near the bottom of the white space for visual balance
    marginBottom: CARD_HEIGHT * 0.1, 
  },
  
  // --- Bottom Card Styles ---
  card: {
    // Occupies the bottom of the screen
    position: 'absolute', 
    bottom: 0,
    width: width, // Full width
    height: CARD_HEIGHT + 35 , // Added 35 to extend into the safe area/notched bottom 
    backgroundColor: '#1E1E1E', // Dark background
    borderTopLeftRadius: 40, // Large radius
    borderTopRightRadius: 40,
    paddingHorizontal: TEXT_PADDING * 1.5,
    paddingTop: TEXT_PADDING * 1.5,
    paddingBottom: TEXT_PADDING * 2,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: width * 0.07, 
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: width * 0.08,
    textAlign:"center"
  },
  description: {
    fontSize: width * 0.038, 
    color: '#aaaaaa',
    lineHeight: width * 0.055,
    textAlign:"center",
    paddingBottom: TEXT_PADDING * 1.2,

  },
  
  // --- Button Styles ---
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    // Align with the bottom padding of the card
    marginTop: TEXT_PADDING, 
    alignItems: 'center',
  },
  skipButton: {
    width: width * 0.28, // Slightly wider to match the image
    height: width * 0.12,
    backgroundColor: '#353535', 
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: width * 0.04,
  },
  nextButton: {
    width: width * 0.28, // Matches the skip button width
    height: width * 0.12,
    backgroundColor: '#ffc700', // Yellow
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // --- Pagination Styles (Dots) ---
  paginationContainer: {
    // Positioned absolutely to sit right above the card's curve
    position: 'absolute',
    // Position calculated to be just above the card's border
    bottom: height * 0.15, 
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, 
  },
  dot: {
    height: width * 0.02,
    position:"relative",
   
    bottom:0,
    borderRadius: width * 0.01,
    marginHorizontal: 4,
  },
})

export default Splash_Screen
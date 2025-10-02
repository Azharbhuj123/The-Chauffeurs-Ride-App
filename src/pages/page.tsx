import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

// --- Placeholder Illustrations ---
// TODO: Replace these with your actual illustration components (e.g., from an SVG file)
const Illustration1: React.FC = () => (
  <View style={styles.illustrationPlaceholder}>
    <Text style={styles.illustrationText}>[Your Illustration 1 Here]</Text>
  </View>
);

const Illustration2: React.FC = () => (
  <View style={styles.illustrationPlaceholder}>
    <Text style={styles.illustrationText}>[Your Illustration 2 Here]</Text>
  </View>
);
// ------------------------------------

// Define the type for a single slide's data
type SlideData = {
  id: string;
  Illustration: React.FC;
  title: string;
  description: string;
};

// Array containing the data for each slide
const slides: SlideData[] = [
  {
    id: '1',
    Illustration: Illustration1,
    title: 'Ride in Style with Info Assurance',
    description:
      'Luxury rides, trusted drivers, and seamless bookings anytime, anywhere.',
  },
  {
    id: '2',
    Illustration: Illustration2,
    title: 'Seamless Booking Experience',
    description:
      'Book your ride instantly, track in real-time, and manage all trips with ease.',
  },
];

const OnboardingScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const flatListRef = React.useRef<FlatList<SlideData>>(null);

  // Update the current index when the user swipes
  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Handle navigation to the main app (e.g., Home screen)
      console.log('Finished Onboarding');
    }
  };

  const handleSkip = () => {
    // Handle navigation to the main app
    console.log('Skipped Onboarding');
  };

  // Renders each slide's illustration
  const renderItem = ({ item }: { item: SlideData }) => (
    <View style={styles.slide}>
      <item.Illustration />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />

      {/* Top section with illustrations */}
      <View style={styles.topSection}>
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={16}
        />
      </View>

      {/* Bottom section with content card */}
      <View style={styles.bottomCard}>
        <Text style={styles.title}>{slides[currentIndex].title}</Text>
        <Text style={styles.description}>
          {slides[currentIndex].description}
        </Text>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4', // Light gray background as seen in the image
  },
  topSection: {
    height: hp('55%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    width: wp('100%'),
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: hp('5%'),
  },
  illustrationPlaceholder: {
    width: wp('85%'),
    height: hp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: wp('5%'),
  },
  illustrationText: {
    color: '#888',
    fontSize: wp('4%'),
  },
  bottomCard: {
    height: hp('45%'),
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: wp('10%'),
    borderTopRightRadius: wp('10%'),
    paddingHorizontal: wp('8%'),
    paddingTop: hp('6%'),
    alignItems: 'center',
  },
  title: {
    fontSize: wp('6.5%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  description: {
    fontSize: wp('4%'),
    color: '#A9A9A9',
    textAlign: 'center',
    lineHeight: hp('3%'),
  },
  paginationContainer: {
    flexDirection: 'row',
    marginTop: hp('4%'),
    marginBottom: hp('4%'),
    alignItems: 'center',
  },
  dot: {
    height: wp('2.5%'),
    borderRadius: wp('2%'),
    marginHorizontal: wp('1%'),
  },
  activeDot: {
    backgroundColor: '#FBC901', // Golden yellow for active dot
    width: wp('6%'), // Active dot is wider
  },
  inactiveDot: {
    backgroundColor: '#555555', // Dark gray for inactive dot
    width: wp('2.5%'),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: hp('5%'),
    paddingHorizontal: wp('8%'),
  },
  skipButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('8%'),
    borderRadius: wp('10%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#1A1A1A',
    fontSize: wp('4%'),
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#FBC901', // Golden yellow
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#1A1A1A',
    fontSize: wp('8%'),
    fontWeight: '300',
    lineHeight: hp('5%'), // To vertically center the arrow
  },
});

export default OnboardingScreen;
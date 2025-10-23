// @ts-nocheck
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopHeader from '../../components/TopHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';

// Reusable row component for the legal section
const InfoRow = ({ icon, text }) => (
  <TouchableOpacity style={styles.infoRow} activeOpacity={0.6}>
    <Ionicons name={icon} style={styles.infoRowIcon} />
    <Text style={styles.infoRowText}>{text}</Text>
    <Ionicons name="chevron-forward-outline" style={styles.infoRowChevron} />
  </TouchableOpacity>
);

export const AboutUsScreen = ({ navigation }) => {
  const tabBarHeight = useTabBarHeightHelper();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <TopHeader title="About Us" navigation={navigation} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 20 },
        ]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')} // Make sure you have this logo image
            style={styles.logo}
          />
          <Text style={styles.versionText}>Version 2.3.1 (Build 452)</Text>
        </View>

        {/* Our Mission Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            At **PrimeRide**, we believe in providing safe, reliable, and
            luxurious transportation experiences across the city. Our commitment
            is to punctuality, professional service, and ensuring every ride is
            a journey in comfort. We are constantly innovating to make mobility
            effortless for you.
          </Text>
        </View>

        {/* Information & Legal Card */}
        <View style={[{ marginBottom: hp(7) }, styles.card2]}>
          <Text style={styles.cardTitle}>Information & Legal</Text>
          <InfoRow icon="document-text-outline" text="Terms of Service" />
          <InfoRow icon="shield-checkmark-outline" text="Privacy Policy" />
          <InfoRow icon="code-slash-outline" text="Software Licenses" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('5%'),
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: hp('3%'),
  },
  logo: {
    width: wp('20%'),
    height: wp('20%'),
    resizeMode: 'contain',
  },
  versionText: {
    marginTop: hp('1%'),
    fontSize: wp('3.5%'),
    color: '#888',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('5%'),
    marginBottom: hp(3),
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  card2: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('5%'),
    marginBottom: hp(7),
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('1.5%'),
  },
  missionText: {
    fontSize: wp('3.8%'),
    color: '#555',
    lineHeight: hp('2.8%'),
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
  },
  infoRowIcon: {
    fontSize: wp('5.5%'),
    color: '#555',
  },
  infoRowText: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#333',
    marginLeft: wp('4%'),
  },
  infoRowChevron: {
    fontSize: wp('5%'),
    color: '#ccc',
  },
});

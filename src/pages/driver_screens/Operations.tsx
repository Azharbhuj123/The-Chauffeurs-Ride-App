// @ts-nocheck

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Operations = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Operations" navigation={navigation} />

      <ScrollView
        style={styles.bottomSpacing}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.OperationsBox}>
          <TouchableOpacity
            style={styles.OperationsCard}
            onPress={() => navigation.navigate('RatingsReviewsScreen')}
          >
            <View style={styles.OperationsIconBox}>
              <Image source={require('../../assets/images/Ratings.png')} />
            </View>
            <View style={styles.OperationsCardTital}>
              <Text style={styles.OperationsCardHeading}>
                Ratings & Reviews
              </Text>
              <Text style={styles.OperationsCardPara}>
                View Passenger feedback, rating.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.OperationsCard}
            onPress={() => navigation.navigate('DynamicPricingTool')}
          >
            <View style={styles.OperationsIconBox}>
              <Image source={require('../../assets/images/Tool.png')} />
            </View>
            <View style={styles.OperationsCardTital}>
              <Text style={styles.OperationsCardHeading}>
                Dynamic Pricing Tool
              </Text>
              <Text style={styles.OperationsCardPara}>
                Adjust base fares, per-mile rates, and demand.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.OperationsCard}
            onPress={() => navigation.navigate('NotificationsAlerts')}
          >
            <View style={styles.OperationsIconBox}>
              <Image source={require('../../assets/images/Alerts.png')} />
            </View>
            <View style={styles.OperationsCardTital}>
              <Text style={styles.OperationsCardHeading}>
                Notifications & Alerts
              </Text>
              <Text style={styles.OperationsCardPara}>
                Manage alert toggles, delivery methods.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Operations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  OperationsBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 16,
    gap: 20,
  },
  OperationsCard: {
    width: '100%',
    borderRadius: 6,
    padding: wp(5),
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5, // for Android shadow

    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
  },

  OperationsIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  OperationsCardTital: {},

  OperationsCardHeading: {
    color: '#5A5A5A',
    fontSize: 15,

    fontWeight: '600',
  },

  OperationsCardPara: {
    color: 'rgba(17, 17, 17, 0.70)',
    fontSize: 12,

    fontWeight: '400',
    marginTop: 5,
  },

  bottomSpacing: {
    marginBottom: 100,
  },
});

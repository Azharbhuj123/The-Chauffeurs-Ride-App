// @ts-nocheck
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,

  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import TopHeader from '../../components/TopHeader';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';

const { width } = Dimensions.get('window');

const SelectDriver = ({ navigation }) => {
    const tabBarHeight = useTabBarHeightHelper();
  
  const drivers = [
    {
      id: 1,
      name: 'John Davis',
      car: 'Mercedes S-Class',
      rating: 4.8,
      trips: '1,382 Trips',
      price: 'Luxury Ride',
    },
    {
      id: 2,
      name: 'Sarah Miller',
      car: 'BMW X5',
      rating: 4.8,
      trips: '1,161 Trips',
      price: 'Premium RV',
    },
    {
      id: 3,
      name: 'Robert Adams',
      car: 'Toyota Camry',
      rating: 4.8,
      trips: '1,094 Trips',
      price: 'Premium Ride',
    },
  {
    id: 4,
    name: 'Robert Adams',
    car: 'Toyota Camry',
    rating: 4.8,
    trips: '1,094 Trips',
    price: 'Premium Ride',
  },
    {
      id: 5,
      name: 'Robert Adams',
      car: 'Toyota Camry',
      rating: 4.8,
      trips: '1,094 Trips',
      price: 'Premium Ride',
    },
    
  ];

  const handleSelectDriver = (driver) => {
    navigation.navigate('ConfirmBooking', { driver });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}


      <TopHeader title='Book Selected Driver' navigation={navigation}/>


      {/* Filter and Sort */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="tune" size={18} color="#000" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="swap-vertical" size={18} color="#000" />
          <Text style={styles.filterText}>Sort: Rating</Text>
        </TouchableOpacity>
      </View>

      {/* Driver List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[{ paddingBottom: tabBarHeight + 10 }]}

        showsVerticalScrollIndicator={false}
      >
        {drivers.map((driver) => (
          <View key={driver.id} style={styles.driverCard}>
            <View style={styles.driverHeader}>
              <View style={styles.driverInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {driver.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View>
                  <Text style={styles.driverName}>{driver.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={14} color="#FCD34D" />
                    <Text style={styles.rating}>{driver.rating}</Text>
                    <Text style={styles.trips}>{driver.trips}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.carInfo}>
                <Text style={styles.carName}>{driver.car}</Text>
                <Text style={styles.carPrice}>{driver.price}</Text>
              </View>
            </View>

            <View style={styles.driverFooter}>
              <View style={styles.amenities}>
                <Icon name="wifi" size={18} color="#9CA3AF" />
                <Icon name="music" size={18} color="#9CA3AF" />
                <Icon name="briefcase" size={18} color="#9CA3AF" />
              </View>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => handleSelectDriver(driver)}
              >
                <Text style={styles.selectButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <Text style={styles.scrollText}>Scroll for more available chauffeurs</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
       fontFamily:"SF Pro"

  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "space-between",
    gap: 10
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    gap: 8,
    width: '45%',
       fontFamily:"SF Pro"

  },
  filterText: {
    fontSize: 14,
    color: '#000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,

  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,

  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    gap: 12,
       fontFamily:"SF Pro"

  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
       fontFamily:"SF Pro"

  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
       fontFamily:"SF Pro"

  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  trips: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  carInfo: {
    alignItems: 'flex-end',
  },
  carName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
       fontFamily:"SF Pro"

  },
  carPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
       fontFamily:"SF Pro"

  },
  driverFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amenities: {
    flexDirection: 'row',
    gap: 12,
  },
  selectButton: {
    backgroundColor: '#FCD34D',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 24,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
       fontFamily:"SF Pro"

  },
  scrollText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginVertical: 16,
       fontFamily:"SF Pro"

  },
});

export default SelectDriver;
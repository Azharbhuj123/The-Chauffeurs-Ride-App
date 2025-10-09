//@ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
  Image,
  Modal,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import UserHeader from '../../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';

const { width, height } = Dimensions.get('window');

const fs = size => {
  return Math.sqrt(height * height + width * width) * (size / 1000);
};

export default function HomeScreen({navigation}) {
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);

  const [fleetStatus] = useState([
    {
      id: 1,
      driver: 'Mercedes E-Class',
      status: 'Available',
      statusColor: '#4CAF50',
    },
    {
      id: 2,
      driver: 'Mercedes E-Class',
      status: 'Busy',
      statusColor: '#F44336',
    },
    {
      id: 3,
      driver: 'Toyota Camry Hybrid',
      status: 'Offline',
      statusColor: '#9E9E9E',
    },
    {
      id: 4,
      driver: 'BMW 7 Series',
      status: 'Available',
      statusColor: '#4CAF50',
    },
  ]);
  const [rideRequests] = useState([
    {
      id: 1,
      pickupAddress: '789 Market St, SF',
      dropoffAddress: 'RT-International Airport',
      date: 'Oct 15, 2025 at 11:00',
      distance: '9 mile',
      price: '$55.00',
    },
    {
      id: 2,
      pickupAddress: '789 Market St, SF',
      dropoffAddress: 'RT-International Airport',
      date: 'Oct 15, 2025 at 11:00',
      distance: '9 mile',
      price: '$55.00',
    },
    {
      id: 3,
      pickupAddress: '789 Market St, SF',
      dropoffAddress: 'RT-International Airport',
      date: 'Oct 15, 2025 at 11:00',
      distance: '9 mile',
      price: '$55.00',
    },
  ]);

  const handleAddVehicle = () => {
    console.log('Add Vehicle pressed');
    navigation.navigate('AddVehicle');
  };

  const handleManageChauffeur = () => {
    console.log('Manage Chauffeur pressed');
    // navigation.navigate('ManageChauffeur');
  };

  const handleAccept = ride => {
    console.log('Accepted ride:', ride);
    // navigation.navigate('AssignDriver', { ride });
  };

  const handleReject = ride => {
    setSelectedRide(ride);
    setShowRejectPopup(true);
  };

  const handleAssignToPartner = () => {
    console.log('Assign to partner:', selectedRide);
    setShowRejectPopup(false);
    // Add your logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* User Header Component */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <UserHeader />

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.addVehicleButton}
            onPress={handleAddVehicle}
          >
            <Text style={styles.addVehicleText}>+ Add Vehicle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageChauffeurButton}
            onPress={handleManageChauffeur}
          >
            <Text style={styles.manageChauffeurText}>+ Manage Chauffeur</Text>
          </TouchableOpacity>
        </View>

        {/* Fleet Status Section */}
        <View style={styles.fleetSection}>
          <Text style={styles.sectionTitle}>Fleet Status</Text>

          {fleetStatus.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.fleetCard,
                index === fleetStatus.length - 1 && styles.fleetCardLast,
              ]}
            >
              <View style={styles.fleetCardLeft}>
                <View style={styles.vehicleIconContainer}>
                  <Icon name="car" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.vehicleName}>{item.driver}</Text>
                  <Text style={{ color: 'rgba(17, 17, 17, 0.70)' }}>
                    MIA-7G8H
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: item.statusColor },
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>

          <View style={styles.incomingRideContainer}>
        <Text style={styles.sectionTitle}>Incoming Ride Requests (Queue)</Text>

        {/* Ride Request Cards */}
        {rideRequests.map(ride => (
          <View key={ride.id} style={styles.rideCard}>
            {/* Pickup Location */}
            <View style={styles.locationRow1}>
              <Icon name="location" size={20} color="#000" />
              <Text style={[styles.locationText1]}>{ride.pickupAddress}</Text>
            <Text style={styles.priceText}>{ride.price}</Text>

            </View>

            {/* Dropoff Location */}
            <View style={styles.locationRow}>
              <Fontisto name="arrow-right-l" size={20} color="#11111180" />
              <Text style={styles.locationText}>{ride.dropoffAddress}</Text>
            </View>

            {/* Date & Time */}
            <View style={styles.detailRow}>
              <Icon name="calendar-outline" size={16} color="#11111180" />
              <Text style={styles.detailText}>{ride.date}</Text>
            </View>

            {/* Distance */}
            <View style={styles.detailRow}>
              <Icon name="navigate-outline" size={16} color="#11111180" />
              <Text style={styles.detailText}>Percentage: {ride.distance}</Text>
            </View>

            {/* Price */}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAccept(ride)}
              >
                <Icon name="checkmark" size={20} color="#000" />
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleReject(ride)}
              >
                <Icon name="close" size={20} color="#11111180" />
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        </View>


        {/* Reject Popup Modal */}
        <Modal
          visible={showRejectPopup}
          transparent={true}
        animationType="fade"
          onRequestClose={() => setShowRejectPopup(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowRejectPopup(false)}
                >
                  <Icon name="close" size={24} color="#999" />
                </TouchableOpacity>

                {/* Modal Title */}
                <Text style={styles.modalTitle}>Global Partner Dispatch</Text>
                <Text style={styles.modalSubtitle}>
                  Want to assign this ride to a Global Partner City/Country?
                </Text>

                {/* Select Partner Section */}
                <Text style={styles.inputLabel}>
                  Select Partner City/Country
                </Text>
                <TouchableOpacity style={styles.selectInput}>
                  <Text style={styles.selectPlaceholder}>Select Partner</Text>
                  <Icon name="chevron-down" size={20} color="#999" />
                </TouchableOpacity>

                {/* Commission Text */}
                <Text style={styles.commissionText}>
                  You'll earn 10% commission on successfully dispatched.
                </Text>

                {/* Assign Button */}
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={handleAssignToPartner}
                >
                  
                  <Button  title='Assign Ride to Partner' onPress={()=>setShowRejectPopup(false)}/> 
                </TouchableOpacity>

                

               
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* City Driver & Positioning Section */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>City Driver & Positioning</Text>
          <View style={styles.mapPlaceholder}>
            <Image source={require('../../assets/images/map2.png')} />
          </View>
          {/* Manual Repositioning */}
          <View style={styles.repositioningSection}>
            <Text style={styles.repositioningTitle}>Manual Repositioning</Text>
            <Text style={styles.repositioningSubtitle}>Enable Drop & Drop</Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: hp(10) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('3%'),
  },
  actionButtonsContainer: {
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  addVehicleButton: {
    backgroundColor: '#FDD835',
    borderRadius: wp(3),
    paddingVertical: hp(2),
    alignItems: 'center',
    marginBottom: hp(1.5),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addVehicleText: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#000',
  },
  manageChauffeurButton: {
    backgroundColor: '#FFF',
    borderRadius: wp(3),
    paddingVertical: hp(2),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  manageChauffeurText: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#000',
  },
  fleetSection: {
    marginBottom: hp(2),
    backgroundColor: '#FFF',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(1.5),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: fs(18),
    color: '#000',
    marginBottom: hp(1.5),
  },
  fleetCard: {
    backgroundColor: 'rgba(17, 17, 17, 0.02)',
    borderRadius: wp(3),
    padding: wp(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  fleetCardLast: {
    marginBottom: 0,
  },
  fleetCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  vehicleName: {
    fontSize: fs(15),
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: wp(3),
  },
  statusText: {
    fontSize: fs(12),
    fontWeight: '600',
    color: '#FFF',
  },
  mapSection: {
    marginBottom: hp(2),
    backgroundColor: '#FFF',
    borderRadius: wp(3),
    padding: wp(4),
    paddingTop: hp(3),
    paddingBottom: hp(3),
    marginBottom: hp(1.5),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  mapPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: fs(14),
    color: '#999',
    marginTop: hp(1),
  },
  repositioningSection: {
    borderRadius: wp(3),
    padding: wp(4),
    marginTop: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  repositioningTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp(0.5),
  },
  repositioningSubtitle: {
    fontSize: fs(14),
    color: '#4CAF50',
    fontWeight: '500',
  },

  incomingRideContainer:{
    backgroundColor:"#fff",
        padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(2),

  },

  sectionTitle: {
    fontSize: fs(18),
    color: '#000',
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  rideCard: {
    borderWidth:1,
    borderColor:'rgba(17, 17, 17, 0.02)',


    backgroundColor: 'rgba(17, 17, 17, 0.02)',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  locationRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
   locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  locationText1:{
     fontSize: fs(16),
    color: '#333',
    marginLeft: wp(2),
    flex: 1,
  },
  locationText: {
    fontSize: fs(12),
    color: '#11111180',
    marginLeft: wp(2),
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  detailText: {
    fontSize: fs(12),
    color: '#11111180',
    marginLeft: wp(1.5),
  },
  priceText: {
    fontSize: fs(16),
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: hp(1),
    marginBottom: hp(1.5),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: wp(3),
    marginTop:hp(2)
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#FDD835',
    borderRadius: wp(2),
    paddingVertical: hp(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#000',
    marginLeft: wp(1),
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: wp(2),
    paddingVertical: hp(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rejectText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#666',
    marginLeft: wp(1),
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
   width: wp('85%'),
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: fs(20),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.5),
  },
  modalSubtitle: {
    fontSize: fs(13),
    color: '#666',
    marginBottom: hp(2),
    lineHeight: fs(18),
  },
  inputLabel: {
    fontSize: fs(14),
    color: '#000',
    fontWeight: '500',
    marginBottom: hp(1),
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    marginBottom: hp(1.5),
  },
  selectPlaceholder: {
    fontSize: fs(14),
    color: '#999',
  },
  commissionText: {
    fontSize: fs(12),
    color: '#666',
    marginBottom: hp(2),
    textAlign: 'center',
  },
  assignButton: {
  },
  assignButtonText: {
    fontSize: fs(15),
    fontWeight: '600',
    color: '#000',
  },
 
  
});

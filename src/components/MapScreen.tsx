// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useStore } from '../stores/useStore';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Octicons from 'react-native-vector-icons/Octicons';
import { COLORS, GOOGLE_MAP_API_KEY } from '../utils/Enums';
import { useUserStore } from '../stores/useUserStore';
import { socket } from '../utils/socket';
import { useFocusEffect } from '@react-navigation/native';
import { useRideStore } from '../stores/rideStore';
import { useDriverLocationStore } from '../stores/driverLocationStore';

const MapScreen = ({ driverLoc, userLoc, rideId }) => {
  const { role, userData } = useUserStore();
  const mapRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { trackingId } = useDriverLocationStore();

  const [userLocation, setUserLocation] = useState({
    latitude: userLoc?.lat,
    longitude: userLoc?.long,
  });

  const [driverLocation, setDriverLocation] = useState({
    latitude: driverLoc?.lat,
    longitude: driverLoc?.long,
  });

  // Join ride room & listen for driver updates
  useFocusEffect(
    useCallback(() => {
      console.log(trackingId, 'trackingId');

      if (!rideId || !userData?._id) return;

      socket.emit('join-ride', { rideId, userId: userData._id });

      const handleDriverLocation = data => {
        if (data?.lat && data?.lng) {
          setDriverLocation({ latitude: data.lat, longitude: data.lng });
        }
      };

      socket.on('driver-location', handleDriverLocation);
      return () => socket.off('driver-location', handleDriverLocation);
    }, [rideId, userData?._id]),
  );

  const goToMyLocation = () => {
    setUserLocation({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    });
    mapRef.current?.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );
  };

  return (
    <View style={styles.safeArea}>
      <MapView
        ref={mapRef}
        style={{ width: '100%', height: height * 0.55 }}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={userLocation} title="User" pinColor="blue" />
        <Marker coordinate={driverLocation} title="Driver">
          <Image
            source={require('../assets/images/Track.png')}
            style={{ width: 40, height: 40 }}
          />
        </Marker>
      </MapView>

      <TouchableOpacity style={styles.button} onPress={goToMyLocation}>
        <Octicons name="location" color="#000" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    borderBottomLeftRadius: wp(5),
    borderBottomRightRadius: wp(5),
    overflow: 'hidden',
  },
  driverIcon: {
    width: wp(11),
    height: wp(11),
  },
  button: {
    position: 'absolute',
    right: wp(5),
    top: hp(30),
    backgroundColor: COLORS.warning,
    paddingVertical: hp(1.1),
    paddingHorizontal: wp(3.5),
    borderRadius: wp(2),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});

export default MapScreen;

// @ts-nocheck

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useStore } from '../stores/useStore';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { COLORS, GOOGLE_MAP_API_KEY } from '../utils/Enums';
import { useUserStore } from '../stores/useUserStore';

const { width, height } = Dimensions.get('window');

const MapScreen = () => {
  const { location } = useStore();
  const { role } = useUserStore();
  const mapRef = useRef(null);

  const [userLocation, setUserLocation] = useState({
    latitude: location?.latitude || 24.86,
    longitude: location?.longitude || 67.005,
  });

  const [driverIndex, setDriverIndex] = useState(0);
  const [routeCoords, setRouteCoords] = useState([]);

  const animatedDriverLocation = routeCoords[driverIndex] || {
    latitude: 24.861,
    longitude: 67.005,
  };

  // Animate driver along the route
  useEffect(() => {
    if (routeCoords.length === 0) return;

    const interval = setInterval(() => {
      setDriverIndex(prev => (prev < routeCoords.length - 1 ? prev + 1 : prev));
    }, 500); // adjust smoothness

    return () => clearInterval(interval);
  }, [routeCoords]);

  // Go to user's location
  const goToMyLocation = () => {
    const { latitude, longitude } = location;
    setUserLocation({ latitude, longitude });
    mapRef.current.animateToRegion(
      { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      1000,
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={userLocation} title="User" pinColor="blue" />
        <Marker coordinate={animatedDriverLocation} title="Driver">
  <View>
    <Image
      source={require('../assets/images/Track.png')}
      style={{ width: 45, height: 45 }} // 👈 bigger size
      resizeMode="contain"
    />
  </View>
</Marker>

        {/* Precompute route once */}
        <MapViewDirections
          origin={{ latitude: 24.861, longitude: 67.005 }} // fixed driver start
          destination={userLocation}
          apikey={GOOGLE_MAP_API_KEY}
          strokeWidth={4}
          strokeColor={COLORS.warning}
          optimizeWaypoints={true}
          mode="DRIVING"
          onReady={result => {
            setRouteCoords(result.coordinates); // save route once
            mapRef.current.fitToCoordinates(result.coordinates, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }}
        />

        {/* Remaining route polyline */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords.slice(driverIndex)}
            strokeWidth={4}
            strokeColor={COLORS.warning}
          />
        )}
      </MapView>

      <TouchableOpacity
        style={[styles.button, { bottom: role === 'Driver' ? hp(13) : hp(8) }]}
        onPress={goToMyLocation}
      >
        <Text style={styles.buttonText}>
          <FontAwesome6 name="location-crosshairs" color="#000" size={wp(5)} />
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: width, height: height * 0.5 },
  button: {
    position: 'absolute',
    right: 20,
    backgroundColor: COLORS.warning,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default MapScreen;

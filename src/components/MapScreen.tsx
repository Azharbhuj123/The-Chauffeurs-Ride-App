// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
  Animated,
} from 'react-native';
import MapView, { Marker, AnimatedRegion } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS, GOOGLE_MAP_API_KEY } from '../utils/Enums';

const MapScreen = ({ driverLocation = { latitude: 0, longitude: 0 }, userLoc = { lat: 0, long: 0 }, rideId }) => {
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const { height } = useWindowDimensions();

  const [userLocation, setUserLocation] = useState({ latitude: userLoc.lat, longitude: userLoc.long });
  const [driverHeading, setDriverHeading] = useState(0);
  const [routeOrigin, setRouteOrigin] = useState(driverLocation);
  const [routeDestination, setRouteDestination] = useState(userLocation);

  const driverAnim = useRef(
    new AnimatedRegion({
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  ).current;

  // Calculate heading/rotation
  const calculateBearing = (start, end) => {
    const startLat = (start.latitude * Math.PI) / 180;
    const startLng = (start.longitude * Math.PI) / 180;
    const endLat = (end.latitude * Math.PI) / 180;
    const endLng = (end.longitude * Math.PI) / 180;
    const dLng = endLng - startLng;
    const y = Math.sin(dLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  };

  // Animate driver marker and update heading
  useEffect(() => {
    if (driverLocation.latitude && driverLocation.longitude) {
      const currentPos = { latitude: driverAnim.latitude._value, longitude: driverAnim.longitude._value };
      const heading = calculateBearing(currentPos, driverLocation);
      setDriverHeading(heading);

      driverAnim.timing({
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        duration: 2000,
        useNativeDriver: false,
      }).start();

      // Only update route origin if driver has moved significantly
      if (
        Math.abs(routeOrigin.latitude - driverLocation.latitude) > 0.0001 ||
        Math.abs(routeOrigin.longitude - driverLocation.longitude) > 0.0001
      ) {
        setRouteOrigin(driverLocation);
      }
    }
  }, [driverLocation]);

  const goToMyLocation = () => {
    if (!userLocation.latitude || !userLocation.longitude) return;
    mapRef.current?.animateToRegion({ ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
  };

  const fitToRoute = () => {
    if (routeOrigin.latitude && routeDestination.latitude) {
      mapRef.current?.fitToCoordinates([routeOrigin, routeDestination], {
        edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
    }
  };

  console.log(driverLocation,"driverLocation");
  console.log(userLoc,"userLoc");
  

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={{ width: '100%', height: height * 0.55 }}
        initialRegion={{ ...userLocation, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        scrollEnabled
        zoomEnabled
        rotateEnabled
        pitchEnabled
        showsUserLocation={false}
        followsUserLocation={false}
        loadingEnabled
      >
        {/* User marker */}
        <Marker coordinate={userLocation} title="You" pinColor="blue" />

        {/* Animated driver marker */}
        <Marker.Animated
          ref={driverMarkerRef}
          coordinate={driverAnim}
          anchor={{ x: 0.5, y: 0.5 }}
          rotation={driverHeading}
          flat
        >
          <View style={{ transform: [{ rotate: `${driverHeading}deg` }], width: 40, height: 40 }}>
            <Image source={require('../assets/images/Track.png')} style={{ width: 40, height: 40 }} resizeMode="contain" />
          </View>
        </Marker.Animated>

        {/* Google Maps Directions (won't blink now) */}
        <MapViewDirections
          origin={routeOrigin}
          destination={routeDestination}
          apikey={GOOGLE_MAP_API_KEY}
          strokeWidth={4}
          strokeColor={COLORS.warning}
          optimizeWaypoints={true}
          onError={errorMessage => console.log('Directions error:', errorMessage)}
        />
      </MapView>

      {/* Location button */}
      <TouchableOpacity style={styles.button} onPress={goToMyLocation}>
        <Octicons name="location" color="#000" size={24} />
      </TouchableOpacity>

      {/* Fit route button */}
      <TouchableOpacity style={[styles.button, { top: 210 }]} onPress={fitToRoute}>
        <Feather name="zoom-in" color="#000" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  button: {
    position: 'absolute',
    right: 20,
    top: 150,
    backgroundColor: COLORS.warning,
    padding: 10,
    borderRadius: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
      android: { elevation: 6 },
    }),
  },
});

export default MapScreen;

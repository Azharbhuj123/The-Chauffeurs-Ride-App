// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS, GOOGLE_MAP_API_KEY } from '../utils/Enums';

const decodePolyline = (encoded: string) => {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let shift = 0,
      result = 0,
      byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  console.log('Decoded points:', points.length);
  return points;
};

const calculateBearing = (start: any, end: any) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startLat = toRad(start.latitude);
  const startLng = toRad(start.longitude);
  const endLat = toRad(end.latitude);
  const endLng = toRad(end.longitude);
  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

interface Props {
  driverLocation?: { latitude: number; longitude: number };
  userLoc?: { lat: number; long: number };
  rideId?: string | number;
}

const MapScreen = ({ driverLocation, userLoc, rideId }: Props) => {
  const mapRef = useRef<MapView>(null);
  const { height } = useWindowDimensions();

  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [driverHeading, setDriverHeading] = useState(0);

  const origin = {
    latitude: driverLocation?.latitude ?? 0,
    longitude: driverLocation?.longitude ?? 0,
  };

  const destination = {
    latitude: userLoc?.lat ?? 24.8754,
    longitude: userLoc?.long ?? 67.041,
  };

  const hasValidRoute = origin.latitude !== 0 && destination.latitude !== 0;

  console.log(
    'hasValidRoute:',
    hasValidRoute,
    'Route points:',
    routeCoords.length,
  );

  // Fetch route
  useEffect(() => {
    if (!hasValidRoute) return;

    const fetchRoute = async () => {
      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAP_API_KEY}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.routes?.length > 0) {
          const decoded = decodePolyline(
            json.routes[0].overview_polyline.points,
          );
          setRouteCoords(decoded);
          console.log('Route set with', decoded.length, 'points');
        }
      } catch (err) {
        console.error('Route error:', err);
      }
    };

    fetchRoute();
  }, [
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude,
    rideId,
  ]);

  // Update driver heading when location changes
  useEffect(() => {
    if (hasValidRoute && driverLocation) {
      const newHeading = calculateBearing(origin, driverLocation);
      setDriverHeading(newHeading);
      console.log('Driver heading updated to:', newHeading);
    }
  }, [driverLocation]);

  const fitToRoute = useCallback(() => {
    if (!hasValidRoute || !mapRef.current) return;
    const points = [origin, destination, ...routeCoords];
    mapRef.current.fitToCoordinates(points, {
      edgePadding: { top: 120, right: 80, bottom: 120, left: 80 },
      animated: true,
    });
  }, [hasValidRoute, origin, destination, routeCoords]);

  useEffect(() => {
    if (hasValidRoute) {
      setTimeout(fitToRoute, 800);
    }
  }, [hasValidRoute, routeCoords.length]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ width: '100%', height: height * 0.55 }}
        initialRegion={{
          latitude: 24.86,
          longitude: 67.05,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        }}
        onMapReady={() => {
          console.log('onMapReady → fitting');
          setTimeout(fitToRoute, 1000);
        }}
      >
        {hasValidRoute && (
          <>
            {/* User Marker */}
            <Marker
              coordinate={destination}
              title="User Location"
              pinColor="blue"
            />

            {/* Driver Custom Rotated Image */}
            <Marker
              coordinate={origin}
              anchor={{ x: 0.5, y: 0.5 }} // Center the image
              flat={true} // Keeps it flat on the map (recommended)
            >
              <View style={{ transform: [{ rotate: `${driverHeading}deg` }] }}>
                <Image
                  source={require('../assets/images/Track.png')}
                  style={{ width: 48, height: 48 }}
                  resizeMode="contain"
                />
              </View>
            </Marker>

            {/* Polyline */}
            {routeCoords.length > 1 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor={COLORS.warning || '#FF9800'}
                strokeWidth={7}
                lineCap="round"
                lineJoin="round"
              />
            )}
          </>
        )}
      </MapView>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={fitToRoute}>
          <Octicons name="location" color="#000" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginTop: 12 }]}
          onPress={fitToRoute}
        >
          <Feather name="zoom-in" color="#000" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    right: 20,
    top: 150,
    zIndex: 10,
  },
  button: {
    backgroundColor: COLORS.warning,
    padding: 12,
    borderRadius: 10,
    elevation: 6,
  },
});

export default MapScreen;

import { useNavigation } from '@react-navigation/native';
import { COLORS } from './Enums';
import { showFlash } from './flashMessageHelper';
import { socket } from './socket';
import { navigate } from './NavigationService';
import { useRideStore } from '../stores/rideStore';

export const initSocketListeners = (role: string) => {
  const { setRideRequests, setRideId } = useRideStore.getState();

  socket.on('ride_request', data => {
    console.log('🚗 New Ride Request Recseived:', data, 'role', role);
    if (data?.ride_offer && role === 'Driver') {
      // Format data for UI
      const formattedRide = {
        id: data._id,
        pickupAddress: data.pickup_location?.address || 'N/A',
        dropoffAddress: data.drop_location?.address || 'N/A',
        date: new Date(data.createdAt).toLocaleString(),
        distance: data.distance || 'N/A',
        price: `${data.payment_breakdown?.total_fare || 0}`,
        ride_status: data.ride_status,
        userName: data.user?.name,
        payment_method: data.payment_method,
        vehicle_type: data.vehicle_type,
      };

      // Append to existing list
      setRideRequests(prev => [formattedRide, ...prev]);
      showFlash({
        type: 'success',
        title: 'New Ride Request',
        message:
          'You’ve received a new ride request. Please review the details and respond promptly to accept or decline.',

        backgroundColor: COLORS.success,
        onPress: () => navigate('DriverHome', {}),
      });
    }
    if (data?.ride_time_out && role === 'Driver') {
      setRideRequests(prev => prev?.filter(ride => ride?.id !== data?.ride_id));
    }
    if (data?.ride_accept && role === 'User') {
      setRideId(data?.ride_id);
      showFlash({
        type: 'success',
        title: 'Ride Started',
        message: `Your driver ${data?.accept_by} is on the way. Please be ready at your pickup point.`,
        backgroundColor: COLORS.success,
        onPress: () =>
          navigate('RideConfirmationScreen', {
            rideId: data?.ride_id,
            from: 'driver',
          }),
      });

      navigate('RideConfirmationScreen', {
        rideId: data?.ride_id,
        from: 'driver',
      });
    }
    if (data?.ride_arrived && role === 'User') {
      showFlash({
        type: 'success',
        title: 'Your Ride Has Arrived',
        message:
          'Your driver has reached the pickup point. Please proceed to the vehicle at your convenience.',
        backgroundColor: COLORS.success,
        onPress: () =>
          navigate('Bookings', {
            screen: 'RideConfirmationScreen',
            params: { rideId: data?.ride_id },
          }),
      });
    }
    if (data?.ride_start && role === 'User') {
      showFlash({
        type: 'success',
        title: 'Your Ride Is Now in Progress',
        message:
          'Your driver has reached the pickup spot and the journey has officially started. Please get seated comfortably.',

        backgroundColor: COLORS.success,
        onPress: () =>
          navigate('Bookings', {
            screen: 'RideConfirmationScreen',
            params: { rideId: data?.ride_id },
          }),
      });
    }
    if (data?.ride_completed && role === 'User') {
      showFlash({
        type: 'success',
        title: 'Ride Successfully Completed',
        message: 'Your trip has ended. Thank you for riding with us!',

        backgroundColor: COLORS.success,
        onPress: () =>
          navigate('Bookings', {
            screen: 'RideComplete',
            params: { rideId: data?.ride_id },
          }),
      });
    }

    if (data?.ride_cancel) {
      navigate(data?.action_performer == 'Driver' ? 'Home' : 'DriverHome', {});
      showFlash({
        type: 'danger',
        title: 'Ride Cancelled',
        message: `${data?.cancel_by} has been cancelled the ride.`,
        backgroundColor: COLORS.error,
        onPress: () => navigate('Home', {}),
      });
    }
  });
};

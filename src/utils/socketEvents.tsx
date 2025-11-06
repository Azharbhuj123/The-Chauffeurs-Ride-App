import { useNavigation } from '@react-navigation/native';
import { COLORS } from './Enums';
import { showFlash } from './flashMessageHelper';
import { socket } from './socket';
import { navigate } from './NavigationService';

export const initSocketListeners = (role: string) => {
  socket.on('ride_request', data => {
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
  });
};

// @ts-nocheck
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { setUser } from '../store/slices/authSlice'; // adjust path
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../stores/useUserStore';
import useActionMutation from '../queryFunctions/useActionMutation';
import { showToast } from '../utils/toastHelper';

const { width, height } = Dimensions.get('window');
const fs = size => Math.sqrt(height * height + width * width) * (size / 1000);

GoogleSignin.configure({
  webClientId:
    '154507490664-v4krl6un7ocgl5ta3or4gci6hu0uv1qs.apps.googleusercontent.com', // 🔴 replace
});

// Pass `role` from parent if needed — e.g. role="driver" on driver login screen
export default function SocialBtns({ role, navigation }) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { setUserData, fcmToken } = useUserStore();

  const { triggerMutation } = useActionMutation({
    onSuccessCallback: async data => {
            setGoogleLoading(false);

      
      if (data?.no_documents) {
        navigation.navigate('UploadDoc', {
          contact: data?.contact,
        });
        return;
      }
      if (data?.not_verify_by_admin) {
        navigation.navigate('Approval', {
          reason: data?.reason,
          contact: data?.contact,
          status: data?.status,
        });
        return;
      }

      setUserData(data?.userData, data?.token);
      if (data?.userData?.stripeAccountId) {
        useStripeStore.setState({
          accountId: data.userData.stripeAccountId,
          chargesEnabled: data.userData.stripeChargesEnabled,
        });
      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Google Sign-In Failed',
        message: errmsg || 'Please try again!',
      });
      setGoogleLoading(false);
    },
  });

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const signInResult = await GoogleSignin.signIn();

      const idToken =
        signInResult.data?.idToken ?? signInResult.idToken ?? null;
      if (!idToken) throw new Error('No ID token returned');

      // Firebase credential exchange
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const { user: firebaseUser } = await auth().signInWithCredential(
        googleCredential,
      );

      const firebaseUserData = firebaseUser?._user;

      // Hit your backend social-login endpoint
      triggerMutation({
        endPoint: '/auth/social-login',
        method: 'post',
        body: {
          uid: firebaseUserData.uid,
          email: firebaseUserData.email,
          displayName: firebaseUserData.displayName,
          photoURL: firebaseUserData.photoURL,
          role: role ?? null, // pass 'driver' from driver login screen if needed
          fcmToken,
        },
      });
    } catch (error) {
      setGoogleLoading(false)
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user dismissed — no toast needed
      } else if (error.code === statusCodes.IN_PROGRESS) {
        showToast({ type: 'info', title: 'Already signing in...' });
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showToast({ type: 'error', title: 'Google Play Services unavailable' });
      } else {
        showToast({ type: 'error', title: 'Error', message: error.message });
        console.log('Google Sign-In error:', error);
      }
    }
  };

  return (
    <View>
      <View style={styles.lineContainer}>
        <View style={styles.line} />
        <Text style={styles.text}>Or</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialContainer}>
        <TouchableOpacity
          style={[
            styles.socialButton,
            googleLoading && styles.socialButtonDisabled,
          ]}
          activeOpacity={0.7}
          onPress={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator size="small" color="#555" />
          ) : (
            <Image source={require('../assets/images/google.png')} />
          )}
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
          <Icon name="logo-apple" size={wp(5)} color="#000" />
          <Text style={styles.socialText}>Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(3),
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: wp(50),
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  socialText: {
    fontSize: fs(14),
    color: '#000',
    fontFamily: 'Poppins-Regular',
    marginLeft: wp(2),
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(1.5),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  text: {
    marginHorizontal: wp(2),
    color: '#999',
    fontSize: fs(14),
    textAlign: 'center',
  },
});

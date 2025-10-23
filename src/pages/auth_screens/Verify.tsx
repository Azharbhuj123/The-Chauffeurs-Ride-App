//@ts-nocheck

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useStore } from '../../stores/useStore';
import Button from '../../components/Button';

const { width, height } = Dimensions.get('window');

const fs = size => {
  return Math.sqrt(height * height + width * width) * (size / 1000);
};

export default function Verify({ navigation }) {
  const [code, setCode] = useState(['', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { isForgot } = useStore();

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto focus next input
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (isForgot) {
      navigation.navigate('SetPass');
      return;
    }
    // Add your verification logic here
    console.log('Verification code:', code.join(''));

    // Simulate successful verification
    setIsVerified(true);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Auto redirect after 3 seconds (optional)
    setTimeout(() => {
      console.log('Redirect to Home Page');
      // navigation.navigate('Home');
    }, 3000);
  };

  const handleResendCode = () => {
    console.log('Resending code...');

    // Add resend logic here
  };

  if (isVerified && !isForgot) {
    setTimeout(() => {
      navigation.navigate('MainTabs');
    }, [3000]);
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FDD835" />

        {/* Header Section */}
        <View style={styles.header}>
          <View style={[{ justifyContent: 'center' }, styles.logoContainer]}>
            <Image
              source={require('../../assets/images/headLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Congratulations Section */}
        <Animated.View
          style={[styles.congratsContainer, { opacity: fadeAnim }]}
        >
          <View style={styles.congratsContent}>
            {/* Success Icon/Image */}
            <View style={styles.successIconContainer}>
              <Image
                source={require('../../assets/images/congratulations.png')}
                style={styles.congratsImage}
                resizeMode="contain"
              />
              {/* Or use Icon if you prefer */}
              {/* <View style={styles.checkmarkCircle}>
                <Icon name="checkmark" size={wp(15)} color="#4CAF50" />
              </View> */}
            </View>

            <Text style={styles.congratsTitle}>Congratulations</Text>
            <Text style={styles.congratsText}>
              Your account is ready to use. You will be redirected to the Home
              Page in a few seconds.
            </Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDD835" />

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={wp(6)} color="#000" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/headLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Verification Form Section */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Verify Your Account</Text>
        <Text style={styles.subtitle}>
          We've sent a verification code to your email{' '}
          <Text style={styles.emailText}>abc@gmail.com</Text>
        </Text>

        {/* OTP Input Boxes */}
        <View style={styles.otpContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={text => handleCodeChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive code? </Text>
          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.resendLink}>Send Again</Text>
          </TouchableOpacity>
        </View>

        <Button title="Verify Now" onPress={handleVerify} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDD835',
  },
  header: {
    height: hp(25),
    backgroundColor: '#FDD835',
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4),
    paddingHorizontal: wp(4),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: hp(Platform.OS === 'ios' ? 2 : 0),
  },
  backText: {
    fontSize: fs(16),
    color: '#000',
    marginLeft: wp(1),
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
  },
  logo: {},
  formContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
    paddingHorizontal: wp(6),
    paddingTop: hp(4),
  },
  title: {
    fontSize: fs(24),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(1.5),
  },
  subtitle: {
    fontSize: fs(14),
    color: '#666',
    marginBottom: hp(4),
    lineHeight: fs(20),
  },
  emailText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(3),
    paddingHorizontal: wp(5),
  },
  otpInput: {
    width: wp(18),
    height: hp(8),
    backgroundColor: '#F8F8F8',
    borderRadius: wp(3),
    fontSize: fs(24),
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(4),
  },
  resendText: {
    fontSize: fs(14),
    color: '#666',
  },
  resendLink: {
    fontSize: fs(14),
    color: '#4CAF50',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  verifyButton: {
    backgroundColor: '#FDD835',
    borderRadius: wp(6),
    paddingVertical: hp(2),
    alignItems: 'center',
    marginTop: hp(2),
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
  verifyButtonText: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#000',
  },

  // Congratulations Screen Styles
  congratsContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
    paddingHorizontal: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratsContent: {
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  successIconContainer: {
    width: wp(35),
    height: wp(35),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  congratsImage: {
    width: '100%',
    height: '100%',
  },
  checkmarkCircle: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratsTitle: {
    fontSize: fs(30),
    fontWeight: '500',
    color: '#000',
    marginBottom: hp(2),
    fontFamily:"Poppins-Regular"
  },
  congratsText: {
    fontSize: fs(14),
    color: '#666',
    textAlign: 'center',
    lineHeight: fs(22),
    paddingHorizontal: wp(4),
    fontFamily:"Inter_28pt-Regular"

  },
});

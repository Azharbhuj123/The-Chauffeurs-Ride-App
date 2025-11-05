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
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { verify_schema } from '../../utils/Schema';
import { error_msg } from '../../utils/Enums';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';
import { useUserStore } from '../../stores/useUserStore';

const { width, height } = Dimensions.get('window');

const fs = size => {
  return Math.sqrt(height * height + width * width) * (size / 1000);
};

export default function Verify({ route, navigation }) {
  const [code, setCode] = useState(['', '', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { contact } = route.params || {};
  const { isForgot } = useStore();
  const { setUserData } = useUserStore();

  // ✅ React Hook Form setup
  const {
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(verify_schema),
    defaultValues: { code: '' },
  });

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.resend) {
        showToast({
          type: 'success',
          title: 'Verification code sent',
          message: `Code send to ${contact}`,
        });
        return;
      }
      if (!data?.adminVerify && data?.verify) {
        navigation.navigate('UploadDoc', {
          contact: data?.userData?.contact,
        });
        return;
      }
      if (data?.adminVerify && data?.verify) {
        setUserData(data?.userData, data?.token);
        reset();
        setIsVerified(true);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

        setTimeout(() => {
          navigation.navigate('MainTabs');
        }, 3000);
      } else if (data?.codeValid) {
        navigation.navigate('SetPass', { contact: data?.contact });
      }
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Verification Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  // ✅ Submit Handler with RHF
  const onSubmit = data => {
    const body = {
      code: data?.code,
      contact,
      actionStep: 1,
    };

    const endPoint = isForgot ? '/auth/reset-password' : '/auth/verify-email';

    triggerMutation({
      endPoint,
      body,
      method: 'post',
    });
  };

  // ✅ Trigger RHF validation + send OTP
  const handleVerify = () => {
    const joined = code.join('');
    setValue('code', joined);
    handleSubmit(onSubmit)();
  };

  const handleResendCode = () => {
    const body = {
      contact,
    };
    triggerMutation({
      endPoint: '/auth/resend-verification',
      body,
      method: 'post',
    });
  };

  if (isVerified && !isForgot) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FDD835" />

        <View style={styles.header}>
          <View style={[{ justifyContent: 'center' }, styles.logoContainer]}>
            <Image
              source={require('../../assets/images/headLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <Animated.View
          style={[styles.congratsContainer, { opacity: fadeAnim }]}
        >
          <View style={styles.congratsContent}>
            <View style={styles.successIconContainer}>
              <Image
                source={require('../../assets/images/congratulations.png')}
                style={styles.congratsImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.congratsTitle}>Congratulations</Text>
            <Text style={styles.congratsText}>
              Your account is ready to use. You will be redirected to the Home
              Page shortly.
            </Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDD835" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={22} color="#000" />
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

      <View style={styles.formContainer}>
        <Text style={styles.title}>Verify Your Account</Text>
        <Text style={styles.subtitle}>
          We've sent a verification code to your email{' '}
          <Text style={styles.emailText}>{contact || ''}</Text>
        </Text>

        {/* ✅ OTP Boxes */}
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
        {errors.code && (
          <Text style={styles.errorText}>{errors.code.message}</Text>
        )}

        {/* ✅ RHF Error */}

        {/* ✅ Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive code? </Text>
          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.resendLink}>Send Again</Text>
          </TouchableOpacity>
        </View>

        <Button isLoading={loading} title="Verify Now" onPress={handleVerify} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDD835',
  },
  errorText: { ...error_msg, paddingLeft: wp(2) },
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
    gap: '5',
  },
  otpInput: {
    width: wp(16),
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
    fontFamily: 'Poppins-Regular',
  },
  congratsText: {
    fontSize: fs(14),
    color: '#666',
    textAlign: 'center',
    lineHeight: fs(22),
    paddingHorizontal: wp(4),
    fontFamily: 'Inter_28pt-Regular',
  },
});

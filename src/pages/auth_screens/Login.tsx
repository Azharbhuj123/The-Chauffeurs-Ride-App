// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
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
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import Icon from 'react-native-vector-icons/Ionicons';
import SocialBtns from '../../components/SocialBtns';
import Button from '../../components/Button';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '../../stores/useStore';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { login_schema } from '../../utils/Schema';
import { COLORS, error_msg } from '../../utils/Enums';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';
import { useUserStore } from '../../stores/useUserStore';
import { useStripeStore } from '../../stores/stripeStore';

const { width, height } = Dimensions.get('window');

const fs = size => {
  return Math.sqrt(height * height + width * width) * (size / 1000);
};

function Login({ navigation }) {
  const { resetForgotTrue } = useStore();
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const { setUserData, fcmToken } = useUserStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(login_schema),
    defaultValues: {
      contact: '',
      password: '',
    },
  });

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
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
      reset();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  const handleSignIn = data => {
    console.log('Form Data:', data);
    triggerMutation({
      endPoint: '/auth/login',
      body: { ...data, fcmToken },
      method: 'post',
    });
  };

  useFocusEffect(
    useCallback(() => {
      resetForgotTrue();
    }, []),
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* <StatusBar barStyle="light-content" backgroundColor="#0D1831" /> */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/headLogo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>
              Continue your journey with rides
            </Text>

            {/* Contact Field */}
            <View style={styles.inputContainer}>
              <Icon
                name="mail-outline"
                size={wp(5)}
                color="#999"
                style={styles.iconStyle}
              />

              <Controller
                control={control}
                name="contact"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Email Or Phone No."
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                  />
                )}
              />
            </View>
            {errors.contact && (
              <Text style={styles.error}>{errors.contact.message}</Text>
            )}

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Icon
                name="lock-closed-outline"
                size={wp(5)}
                color="#999"
                style={styles.iconStyle}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPassword}
                  />
                )}
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={wp(5)}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Forgot')}>
              <View style={styles.forgotContainer}>
                <Text style={styles.forgotText}>Forget password?</Text>
              </View>
            </TouchableOpacity>

            <Button
              isLoading={loading}
              title="Sign In"
              onPress={handleSubmit(handleSignIn)}
            />

            <SocialBtns role={null} navigation={navigation} />

            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Don’t have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signInLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#0D1831',
  },
  error: error_msg,
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: hp(25),
    backgroundColor: '#0D1831',
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4),
    paddingHorizontal: wp(4),
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: fs(20),
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
    color: '#000',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: fs(14),
    color: '#666',
    marginBottom: hp(3),
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: wp(6),
    padding: wp(1),
    marginBottom: hp(3),
  },
  toggleButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    alignItems: 'center',
    borderRadius: wp(5.5),
  },
  toggleButtonActive: {
    backgroundColor: '#000',
  },
  toggleText: {
    fontSize: fs(14),
    color: '#666',
  },
  toggleTextActive: {
    color: '#FFF',
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    height: hp(7),
  },
  iconStyle: {
    marginRight: wp(3),
  },
  input: {
    flex: 1,
    fontSize: fs(16),
    color: '#000',
    paddingVertical: 0,
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
  },
  signUpButton: {
    backgroundColor: COLORS.warning,
    borderRadius: wp(6),
    paddingVertical: hp(2),
    alignItems: 'center',
    marginTop: hp(1),
    marginBottom: hp(2.5),
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
  signUpButtonText: {
    fontSize: fs(16),
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  divider: {
    textAlign: 'center',
    color: '#999',
    fontSize: fs(14),
    marginBottom: hp(2.5),
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(3),
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: wp(3),
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    flex: 0.48,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  socialText: {
    fontSize: fs(14),
    color: '#000',
    marginLeft: wp(2),
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: fs(14),
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  signInLink: {
    fontSize: fs(14),
    color: '#000',
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
    textDecorationLine: 'underline',
  },

  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(2.5),
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

  forgotContainer: {
    width: `100%`,
    marginBottom: hp(2),
  },
  forgotText: {
    textAlign: 'right',
    fontFamily: 'Poppins-Regular',
    color:'#000'
  },
});
export default Login;

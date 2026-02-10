// @ts-nocheck

import React, { useState } from 'react';
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
import { useStore } from '../../stores/useStore';
import { useUserStore } from '../../stores/useUserStore';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signupSchema } from '../../utils/Schema';
import { COLORS, error_msg } from '../../utils/Enums';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';

const { width, height } = Dimensions.get('window');

const fs = size => {
  return Math.sqrt(height * height + width * width) * (size / 1000);
};

function Signup({ navigation }) {
  const { setRole } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      role: 'User',
      name: '',
      contact: '',
      password: '',
    },
  });

  const selectedRole = watch('role');

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.codeSend) {
        reset();
        navigation.navigate('Verify', {
          
          contact: data?.contact,
        });
      }
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Registration Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  const onSubmit = data => {
    console.log('✅ Form Data:', data);
    setRole(data.role);
    triggerMutation({
      endPoint: '/auth/register',
      body: data,
      method: 'post',
    });
    // navigation.navigate(data.role === 'Driver' ? 'UploadDoc' : 'Verify');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* LOGO */}
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
            <Text style={styles.title}>Sign Up</Text>

            {/* ✅ ROLE TOGGLE */}
            <View style={styles.toggleContainer}>
              {['User', 'Driver'].map(role => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.toggleButton,
                    selectedRole === role && styles.toggleButtonActive,
                  ]}
                  onPress={() => setValue('role', role)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      selectedRole === role && styles.toggleTextActive,
                    ]}
                  >
                    Sign up as {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.role && (
              <Text style={styles.errorText}>{errors.role.message}</Text>
            )}

            {/* ✅ NAME INPUT */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Icon
                    name="person-outline"
                    size={22}
                    style={styles.iconStyle}
                    color="#999"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}

            {/* ✅ EMAIL / PHONE INPUT */}
            <Controller
              control={control}
              name="contact"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Icon
                    name="mail-outline"
                    size={22}
                    style={styles.iconStyle}
                    color="#999"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email or Phone"
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                  />
                </View>
              )}
            />
            {errors.contact && (
              <Text style={styles.errorText}>{errors.contact.message}</Text>
            )}

            {/* ✅ PASSWORD INPUT */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Icon
                    name="lock-closed-outline"
                    size={22}
                    style={styles.iconStyle}
                    color="#999"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={value}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(prev => !prev)}
                  >
                    <Icon
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={22}
                      style={styles.iconStyle}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            {/* ✅ Submit Button */}
            <Button
              isLoading={loading}
              title="Sign Up"
              onPress={handleSubmit(onSubmit)}
            />

            <SocialBtns />

            <View style={styles.signInContainer}>
              <Text>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInLink}>Sign In</Text>
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
  errorText: error_msg,
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
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: fs(14),
    color: '#666',
    marginBottom: hp(3),
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
    backgroundColor: '#0A1329',
  },
  toggleText: {
    fontSize: fs(14),
    color: '#666',
  },
  toggleTextActive: {
    color: '#FFF',
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '500',
    marginLeft: wp(2),
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(6),
  },
  signInText: {
    fontSize: fs(14),
    color: '#666',
  },
  signInLink: {
    fontSize: fs(14),
    color: '#000',
    fontWeight: '600',
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
});

export default Signup;

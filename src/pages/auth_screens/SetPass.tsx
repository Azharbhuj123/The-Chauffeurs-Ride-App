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
import { COLORS, error_msg } from '../../utils/Enums';
import { set_pass_schema } from '../../utils/Schema';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';

const { width, height } = Dimensions.get('window');

const fs = size => {
  return Math.sqrt(height * height + width * width) * (size / 1000);
};

export default function SetPass({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const { contact } = route.params || {};

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(set_pass_schema),
    mode: 'onChange',
  });

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.reset) {
        navigation.navigate('Login');
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

  const onSubmit = data => {
    const endPoint = '/auth/reset-password';
    const final_body = {
      ...data,
      contact,
      actionStep: 2,
    };
    triggerMutation({
      endPoint,
      body: final_body,
      method: 'post',
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={'#0D1831'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={24} color="#fff" />
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

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>Reset your password and continue</Text>

          {/* ✅ Password Field */}
          <View style={styles.inputContainer}>
            <Icon
              name="lock-closed-outline"
              size={24}
              color="#999"
              style={styles.iconStyle}
            />

            <Controller
              control={control}
              name="password"
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password.message}</Text>
          )}

          {/* ✅ Confirm Password Field */}
          <View style={styles.inputContainer}>
            <Icon
              name="lock-closed-outline"
              size={24}
              color="#999"
              style={styles.iconStyle}
            />

            <Controller
              control={control}
              name="confirm_password"
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword1}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <TouchableOpacity onPress={() => setShowPassword1(!showPassword1)}>
              <Icon
                name={showPassword1 ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          {errors.confirm_password && (
            <Text style={styles.errorText}>
              {errors.confirm_password.message}
            </Text>
          )}

          {/* ✅ Submit Button */}
          <Button
            isLoading={loading}
            title="Save"
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    flex: 1,
  },
  logo: {},
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: hp(Platform.OS === 'ios' ? 2 : 3),
  },
  backText: {
    fontSize: fs(16),
    color: '#fff',
    marginLeft: wp(1),
  },
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
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
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
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
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
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
    marginLeft: wp(2),
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: fs(14),
    color: '#666',
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
  },
});

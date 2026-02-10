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
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useStore } from '../../stores/useStore';
import { forgot_schema } from '../../utils/Schema';
import { COLORS, error_msg } from '../../utils/Enums';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';

const { width, height } = Dimensions.get('window');

const fs = size => {
  return Math.sqrt(height * height + width * width) * (size / 1000);
};

export default function Forgot({ navigation }) {
  const { setForgotTrue } = useStore();
  const insets = useSafeAreaInsets();

  // ✅ React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(forgot_schema),
    defaultValues: {
      contact: '',
    },
  });

  const contactValue = watch('contact');

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.codeSent) {
    setForgotTrue(); // ✅ mark as forgot flow

        navigation.navigate('Verify', { contact: data.contact }); // ✅ pass contact
      }
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  const handleSend = data => {
    console.log('✅ Forgot data:', data);

    const endPoint = '/auth/forgot-password';

    triggerMutation({
      endPoint,
      body: data,
      method: 'post',
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={'#0D1831'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={22} color="#fff" />
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

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email or phone number to continue
          </Text>

          {/* ✅ Email/Phone Input */}
          <View style={styles.inputContainer}>
            <Icon
              name="mail-outline"
              size={22}
              color="#999"
              style={styles.iconStyle}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Or Phone No."
              placeholderTextColor="#999"
              value={contactValue}
              onChangeText={text => setValue('contact', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* ✅ Error message */}
          {errors.contact && (
            <Text style={styles.errorText}>{errors.contact.message}</Text>
          )}

          {/* Button */}
          <Button isLoading={loading} title="Send Code" onPress={handleSubmit(handleSend)} />
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: hp(Platform.OS === 'ios' ? 2 : 0),
  },
  backText: {
    fontSize: fs(16),
       color:"#fff",

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
    backgroundColor: '#000',
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
    width: '100%',
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

  forgotContainer: {
    width: `100%`,
    marginBottom: hp(2),
  },
  forgotText: {
    textAlign: 'right',
  },
});

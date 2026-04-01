// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Platform,
  Dimensions,
  Alert,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import TopHeader from '../../components/TopHeader';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  pickImageFromCamera,
  pickImageFromGallery,
} from '../../utils/imagePickerHelper';
import { useUserStore } from '../../stores/useUserStore';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';
import { COLORS } from '../../utils/Enums';

const { width, height } = Dimensions.get('window');

export const EditProfileScreen = ({ navigation }) => {
  const { userData, setUserData, resetAll } = useUserStore();
  const [name, setName] = useState(userData?.name || '');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState(userData?.profile_image);
  const [profileImageurl, setProfileImageurl] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const pickImage = () => {
    Alert.alert('Select Option', 'Choose an image source', [
      {
        text: 'Camera',
        onPress: async () => {
          const image = await pickImageFromCamera();
          if (image) setProfileImage(image.uri);
          setProfileImageurl(image);
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const image = await pickImageFromGallery();
          if (image) setProfileImage(image.uri);
          setProfileImageurl(image);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const { triggerMutation, loading, error } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.delete) {
        resetAll();
        navigation.navigate('Login');
        return;
      }
      console.log(data,"data");
      
      setUserData(data?.user, data?.token);
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully',
      });
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  console.log(error, 'error');

  const hanldeUpdate = async () => {
    const form_data = new FormData();
    if (profileImageurl && profileImageurl.uri) {
      form_data.append('file', {
        uri:
          Platform.OS === 'android'
            ? profileImageurl.uri
            : profileImageurl.uri.replace('file://', ''),
        type: profileImageurl.type || 'image/jpeg',
        name: profileImageurl.name || `image_${Date.now()}.jpg`,
      });
    }

    form_data.append('name', name);

    for (let pair of form_data._parts) {
      console.log(pair[0], pair[1]);
      console.log(pair[0], pair[1]);
    }

    triggerMutation({
      endPoint: '/auth/update-profile',
      body: form_data,
      method: 'post',
    });
  };

  const hanldeDelete = () => {
    triggerMutation({
      endPoint: '/auth/delete-account',
      method: 'delete',
    });
  };

  const hanldeUpdate2 = () => {
    const form_data = new FormData();
    if (profileImageurl && profileImageurl.uri) {
      form_data.append('file', {
        uri:
          Platform.OS === 'android'
            ? profileImageurl.uri
            : profileImageurl.uri.replace('file://', ''),
        type: profileImageurl.type || 'image/jpeg',
        name: profileImageurl.name || `image_${Date.now()}.jpg`,
      });
    }

    form_data.append('name', name);

    for (let pair of form_data._parts) {
      console.log(pair[0], pair[1]);
      console.log(pair[0], pair[1]);
    }

    triggerMutation({
      endPoint: '/auth/update-profile',
      body: form_data,
      method: 'post',
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TopHeader title="Edit Profile" navigation={navigation} />

      {/* 🧠 Wrap with TouchableWithoutFeedback + KeyboardAvoidingView */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          >
            {/* Profile Image Section */}
            <View style={styles.editProfileImageSection}>
              <TouchableOpacity activeOpacity={0.8} onPress={pickImage}>
                <View style={styles.profileImageContainer}>
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                  <View style={styles.editBadge}>
                    <Feather name="edit-2" size={wp(3.5)} color="#000" />
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={styles.tapToChangeText}>
                Tap to change profile picture
              </Text>
            </View>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Feather
                  name="user"
                  size={wp(5)}
                  color="#999"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Name"
                  placeholderTextColor="#999"
                />
              </View>
              {userData?.contact?.includes('@') ? (
                <View style={styles.inputWrapper}>
                  <Feather
                    name="mail"
                    size={wp(5)}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={userData?.contact}
                    onChangeText={setContact}
                    placeholder="Email Or Phone No."
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    editable={false}
                  />
                </View>
              ) : (
                <View style={styles.inputWrapper}>
                  <Feather
                    name="lock"
                    size={wp(5)}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={userData?.contact}
                    onChangeText={setPhone}
                    disa
                    placeholder="Phone Number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    editable={false}
                  />
                </View>
              )}
            </View>

            {/* Buttons */}
            <View style={styles.btnContainer}>
              <Button
                isLoading={loading}
                title="Save Changes"
                onPress={() => hanldeUpdate2()}
              />
              <Button
                title="Delete Account"
                color="#FF3A2F"
                textColor="white"
                onPress={() => setModalVisible(true)}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Image source={require('../../assets/images/logout.png')} />
            <Text style={styles.modalTitle}>Are you Sure? </Text>
            <Text style={styles.modalSubtitle}>
              Deleting your account will remove all of your information from our
              database. This cannot be undone.
            </Text>

            <View style={styles.btnContainer2}>
              <Button
                isLoading={loading}
                title="Delete"
                textColor="white"
                color="#FF3A2F"
                onPress={hanldeDelete}
              />
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                color="#F1F1F1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  // Profile Main Screen Styles
  profileSection: {
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: hp(2),
    borderWidth: 2,
    borderColor: COLORS.warning,
    borderRadius: wp(12.5),
  },
  profileImage: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.warning,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: wp(5),
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
    color: '#000',
    marginBottom: hp(0.5),
  },
  profileEmail: {
    fontSize: wp(3.5),
    color: '#666',
  },

  menuLabel: {
    fontSize: wp(4),
    color: '#000',
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(2),
  },
  logoutText: {
    fontSize: wp(4),
    color: '#FF3B30',
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
  },
  // Edit Profile Screen Styles
  editProfileImageSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  tapToChangeText: {
    fontSize: wp(3.5),
    color: '#666',
    marginTop: hp(1),
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    marginBottom: hp(2),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: wp(4),
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    height: hp(6.5),
  },
  inputIcon: {
    marginRight: wp(3),
  },
  input: {
    flex: 1,
    fontSize: wp(4),
    color: '#000',
    padding: 0,
  },
  saveButton: {
    backgroundColor: COLORS.warning,
    marginHorizontal: wp(5),
    paddingVertical: hp(2),
    borderRadius: wp(2),
    alignItems: 'center',
    marginBottom: hp(2),
  },
  saveButtonText: {
    fontSize: wp(4.5),
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: wp(5),
    paddingVertical: hp(2),
    borderRadius: wp(2),
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: wp(4.5),
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
    color: '#fff',
  },
  // Add Address Screen Styles
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  addAddressText: {
    fontSize: wp(4),
    color: '#666',
    marginLeft: wp(2),
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
  },
  addressListContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: wp(5),
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: wp(3),
  },
  addressIconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  addressInfo: {
    flex: 1,
  },
  addressType: {
    fontSize: wp(4),
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
    color: '#000',
    marginBottom: hp(0.5),
  },
  addressText: {
    fontSize: wp(3.3),
    color: '#666',
    lineHeight: wp(4.5),
  },
  btnContainer: {
    paddingHorizontal: wp(5),
  },

  //model

  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContainer: {
    width: wp('85%'),
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',

    marginTop: 15,
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',

    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: COLORS.warning,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    fontFamily: 'Poppins-Regular',
  },
  modalButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
    fontFamily: 'Poppins-Regular',
  },
  btnContainer2: {
    width: '100%',
  },
});

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

const { width, height } = Dimensions.get('window');

export const EditProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState(
    'https://i.pravatar.cc/150?img=13',
  );

  const pickImage = () => {
    Alert.alert('Select Option', 'Choose an image source', [
      {
        text: 'Camera',
        onPress: async () => {
          const image = await pickImageFromCamera();
          if (image) setProfileImage(image.uri);
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const image = await pickImageFromGallery();
          if (image) setProfileImage(image.uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
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
                  returnKeyType="done"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Feather
                  name="mail"
                  size={wp(5)}
                  color="#999"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={contact}
                  onChangeText={setContact}
                  placeholder="Email Or Phone No."
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  returnKeyType="done"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Feather
                  name="lock"
                  size={wp(5)}
                  color="#999"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.btnContainer}>
              <Button title="Save Changes" />
              <Button
                title="Delete Account"
                color="#FF3A2F"
                textColor="white"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
    fontWeight: '600',
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
    borderColor: '#F8D833',
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
    backgroundColor: '#F8D833',
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
    fontWeight: '600',
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
    fontWeight: '500',
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
    fontWeight: '500',
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
    backgroundColor: '#F8D833',
    marginHorizontal: wp(5),
    paddingVertical: hp(2),
    borderRadius: wp(2),
    alignItems: 'center',
    marginBottom: hp(2),
  },
  saveButtonText: {
    fontSize: wp(4.5),
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '500',
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
    fontWeight: '600',
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
});

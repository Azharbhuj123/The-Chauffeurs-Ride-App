//@ts-nocheck
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
  Alert,
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
import {
  pickFile,
  pickImageFromCamera,
  pickImageFromGallery,
} from '../../utils/imagePickerHelper';
import Button from '../../components/Button';
import { showToast } from '../../utils/toastHelper';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { COLORS } from '../../utils/Enums';

const { width, height } = Dimensions.get('window');

const fs = size => {
  return Math.sqrt(height * height + width * width) * (size / 1000);
};

export default function UploadDoc({ route, navigation }) {
  const [documents, setDocuments] = useState({
    driverLicense: null,
    vehicleInsurance: null,
    vehicleRegistration: null,
  });

  const insets = useSafeAreaInsets();
  const { contact } = route.params || {};

  const handleImageSelection = documentType => {
    const isFileAllowed = [
      'driverLicense',
      'vehicleInsurance',
      'vehicleRegistration',
    ].includes(documentType);

    const options = [
      {
        text: 'Take Photo',
        onPress: () => handleCamera(documentType),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => handleGallery(documentType),
      },
    ];

    if (isFileAllowed) {
      options.push({
        text: 'Upload File (PDF, DOC, etc.)',
        onPress: () => handleFileUpload(documentType),
      });
    }

    options.push({
      text: 'Cancel',
      style: 'cancel',
    });

    Alert.alert('Upload Document', 'Choose an option', options, {
      cancelable: true,
    });
  };

  const handleFileUpload = async documentType => {
    try {
      const file = await pickFile();
      if (file) {
        setDocuments(prev => ({
          ...prev,
          [documentType]: file,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload file');
    }
  };

  const handleCamera = async documentType => {
    try {
      const image = await pickImageFromCamera();
      if (image) {
        setDocuments(prev => ({
          ...prev,
          [documentType]: image,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleGallery = async documentType => {
    try {
      const image = await pickImageFromGallery();
      if (image) {
        setDocuments(prev => ({
          ...prev,
          [documentType]: image,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleRemoveDocument = documentType => {
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            setDocuments(prev => ({
              ...prev,
              [documentType]: null,
            }));
          },
          style: 'destructive',
        },
      ],
    );
  };

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.documentsUploaded) {
        navigation.navigate('Approval');
      }
    },

    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });
  const handleSubmit = () => {
    // Check if all documents are uploaded
    if (
      !documents.driverLicense ||
      !documents.vehicleInsurance ||
      !documents.vehicleRegistration
    ) {
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: 'Please upload all required documents',
      });
      return;
    }
    const form_data = new FormData();
    form_data.append('contact', contact);
    form_data.append('driver_License', {
      uri: documents.driverLicense.uri,
      type: documents.driverLicense.type,
      name: documents.driverLicense.name || 'driverLicense.jpg',
    });

    form_data.append('vehicle_Insurance_Proof', {
      uri: documents.vehicleInsurance.uri,
      type: documents.vehicleInsurance.type,
      name: documents.vehicleInsurance.name || 'vehicleInsurance.jpg',
    });

    form_data.append('vehicle_Registration', {
      uri: documents.vehicleRegistration.uri,
      type: documents.vehicleRegistration.type,
      name: documents.vehicleRegistration.name || 'vehicleRegistration.jpg',
    });

    triggerMutation({
      endPoint: '/auth/upload-documents',
      body: form_data,
      method: 'post',
    });

    // console.log('Submitting documents:', documents);
    // // Add your submission logic here
    // navigation.navigate('Verify');
  };

  const renderUploadBox = (documentType, title) => {
    const document = documents[documentType];
    const isUploaded = !!document;

    return (
      <View style={styles.uploadBox}>
        {isUploaded ? (
          <>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveDocument(documentType)}
            >
              <Icon name="close-circle" size={24} color="#FF0000" />
            </TouchableOpacity>

            {document.type?.includes('image') ? (
              <Image
                source={{ uri: document.uri }}
                style={styles.uploadedImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.filePreview}>
                <Image source={require('../../assets/images/uploaded.png')} />

                <Text numberOfLines={1} style={styles.fileName}>
                  {document.name || 'Uploaded File'}
                </Text>
              </View>
            )}

            <Text style={styles.uploadedText}>{title}</Text>
          </>
        ) : (
          <>
            <Image source={require('../../assets/images/upload.png')} />
            <Text style={styles.uploadBoxTitle}>{title}</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleImageSelection(documentType)}
            >
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={'#0A1329'}/>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
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
          <Text style={styles.title}>Upload Documents</Text>
          <Text style={styles.subtitle}>
            Upload your documents to get approved.
          </Text>

          {/* Upload Boxes */}
          {renderUploadBox(
            'driverLicense',
            'Driver License / Company Registration',
          )}
          {renderUploadBox('vehicleInsurance', 'Vehicle Insurance Proof')}
          {renderUploadBox(
            'vehicleRegistration',
            'Vehicle Registration/Permit',
          )}

          <Button
            isLoading={loading}
            title="Submit Document"
            onPress={handleSubmit}
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
    paddingBottom: hp(3),
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
  uploadBox: {
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.50)',
    borderStyle: 'dashed',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp(20),
    position: 'relative',
  },
  uploadBoxTitle: {
    fontSize: fs(14),
    color: '#666',
    marginTop: hp(1),
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: COLORS.warning,
    borderRadius: wp(4),
    paddingVertical: hp(1),
    paddingHorizontal: wp(9),
  },
  uploadButtonText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#000',
  },
  uploadedImage: {
    width: '100%',
    height: hp(15),
    borderRadius: wp(2),
    marginBottom: hp(1),
  },
  uploadedText: {
    fontSize: fs(13),
    color: '#333',
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
    zIndex: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  filePreview: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    paddingTop: hp(1),
  },
});

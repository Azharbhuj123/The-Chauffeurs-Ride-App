//@ts-nocheck
import React, { useState, useMemo } from 'react';
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
  ActivityIndicator,
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
import { useStore } from '../../stores/useStore';

const { width, height } = Dimensions.get('window');

// Responsive font scaling - ensures text scales beautifully across all devices
const fs = size => {
  return Math.sqrt(height * height + width * width) * (size / 1000);
};

// Breakpoint for responsive grid: 1 column on small screens, 2 columns on larger
const GRID_BREAKPOINT = 400;
const isSmallScreen = width < GRID_BREAKPOINT;

export default function UploadDoc({ route, navigation }) {
  // Document state: expanded to include all required document types
  const [documents, setDocuments] = useState({
    governmentIdFront: null,
    governmentIdBack: null,
    driverLicense: null,
    selfie: null,
    // vehicleRegistration: null,
    // vehiclePhotoFront: null,
    // vehiclePhotoBack: null,
    // vehiclePhotoSide: null,
    // vehiclePhotoInterior: null,
  });

  // Track upload progress for each document (for future enhancement)
  const [uploadProgress, setUploadProgress] = useState({});
  const { vehicleData, setVehicleData, resetVehicleData } = useStore();

  const insets = useSafeAreaInsets();
  const { contact } = route.params || {};

  // Determine which documents are required vs optional
  const requiredDocs = [
    'governmentIdFront',
    'governmentIdBack',
    'driverLicense',
    // 'vehicleRegistration',
    // 'vehiclePhotoFront',
    // 'vehiclePhotoBack',
    // 'vehiclePhotoSide',
    // 'vehiclePhotoInterior',
  ];

  /**
   * Handle document selection - supports camera, gallery, and file upload
   * iOS: Uses native action sheet style
   * Android: Material Design bottom sheet would be ideal but Alert works cross-platform
   */
  const handleImageSelection = documentType => {
    const isFileAllowed = true; // All document types now support file upload

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
      console.log(error, 'jsjsjsjsjsjsjsjj');

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

  /**
   * Remove document with confirmation
   * iOS: Native destructive action sheet style
   * Android: Material Design alert dialog
   */
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
        navigation.replace('Approval');
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

  /**
   * Validate and submit all documents
   * Ensures all required documents are uploaded before submission
   */
  const handleSubmit = () => {
    // Validate required documents
    const missingDocs = requiredDocs.filter(doc => !documents[doc]);

    if (missingDocs.length > 0) {
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: 'Please upload all required documents',
      });
      return;
    }

    setVehicleData({ ...documents, contact:"driver@gmail.com" });
        navigation.replace('UploadVehicle');

    // Build FormData for multipart upload
    // const form_data = new FormData();
    // form_data.append('contact', contact);

    // // Append all documents
    // Object.keys(documents).forEach(key => {
    //   if (documents[key]) {
    //     form_data.append(key, {
    //       uri: documents[key].uri,
    //       type: documents[key].type,
    //       name: documents[key].name || `${key}.jpg`,
    //     });
    //   }
    // });

    // triggerMutation({
    //   endPoint: '/auth/upload-documents',
    //   body: form_data,
    //   method: 'post',
    // });
  };

  /**
   * Render individual upload box with state management
   * Supports: empty state, uploading state, uploaded state
   * iOS: Rounded corners (12px), subtle shadows, SF Symbols style icons
   * Android: Material elevation, ripple effects, Material Icons
   */
  const renderUploadBox = (
    documentType,
    title,
    subtitle,
    isRequired = true,
  ) => {
    const document = documents[documentType];
    const isUploaded = !!document;
    const isUploading = uploadProgress[documentType] > 0;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => !isUploaded && handleImageSelection(documentType)}
        style={[
          styles.uploadBoxContainer,
          isSmallScreen && styles.uploadBoxFullWidth,
        ]}
      >
        <View
          style={[styles.uploadBox, isUploaded && styles.uploadBoxUploaded]}
        >
          {/* Remove button - appears only when document is uploaded */}
          {isUploaded && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveDocument(documentType)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // iOS accessibility: larger tap target
            >
              <Icon name="close-circle" size={26} color="#FF3B30" />
            </TouchableOpacity>
          )}

          {/* Uploaded State - Show preview */}
          {isUploaded ? (
            <>
              {document.type?.includes('image') ? (
                <Image
                  source={{ uri: document.uri }}
                  style={styles.uploadedImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.filePreview}>
                  <Icon name="document-text" size={48} color={COLORS.warning} />
                  <Text numberOfLines={1} style={styles.fileName}>
                    {document.name || 'Uploaded File'}
                  </Text>
                </View>
              )}

              {/* Success indicator - matches iOS/Android native success states */}
              <View style={styles.uploadedBadge}>
                <Icon name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.uploadedText}>{title}</Text>
              </View>
            </>
          ) : (
            /* Empty State - Ready to upload */
            <>
              {/* Upload icon - uses Ionicons for cross-platform consistency */}
              <View style={styles.uploadIconContainer}>
                <Icon
                  name="cloud-upload-outline"
                  size={40}
                  color={COLORS.warning}
                  style={styles.uploadIcon}
                />
              </View>

              {/* Document title and subtitle */}
              <Text style={styles.uploadBoxTitle}>{title}</Text>
              {subtitle && (
                <Text style={styles.uploadBoxSubtitle}>{subtitle}</Text>
              )}

              {/* Required/Optional badge */}
              <View
                style={[
                  styles.requirementBadge,
                  !isRequired && styles.optionalBadge,
                ]}
              >
                <Text
                  style={[
                    styles.requirementText,
                    !isRequired && styles.optionalText,
                  ]}
                >
                  {isRequired ? 'Required' : 'Optional'}
                </Text>
              </View>

              {/* Upload button - matches native button styles */}
              {/* <View style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Tap to Upload</Text>
              </View> */}
            </>
          )}

          {/* Uploading State - Show progress (for future enhancement) */}
          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.warning} />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Document grid configuration
   * Organized by category for better UX
   */
  const documentSections = useMemo(
    () => [
      {
        title: 'Identity Documents',
        documents: [
          {
            type: 'governmentIdFront',
            title: 'Government ID',
            subtitle: 'Front Side',
            required: true,
          },
          {
            type: 'governmentIdBack',
            title: 'Government ID',
            subtitle: 'Back Side',
            required: true,
          },
        ],
      },
      {
        title: 'Driver Documents',
        documents: [
          {
            type: 'driverLicense',
            title: 'Driver License',
            subtitle: 'Valid license',
            required: true,
          },
          {
            type: 'selfie',
            title: 'Selfie / Liveness',
            subtitle: 'Face verification',
            required: false,
          },
        ],
      },
      // {
      //   title: 'Vehicle Documents',
      //   documents: [
      //     {
      //       type: 'vehicleRegistration',
      //       title: 'Registration',
      //       subtitle: 'Vehicle papers',
      //       required: true,
      //     },
      //   ],
      // },
      // {
      //   title: 'Vehicle Photos',
      //   documents: [
      //     {
      //       type: 'vehiclePhotoFront',
      //       title: 'Front View',
      //       subtitle: 'Clear photo',
      //       required: true,
      //     },
      //     {
      //       type: 'vehiclePhotoBack',
      //       title: 'Back View',
      //       subtitle: 'Clear photo',
      //       required: true,
      //     },
      //     {
      //       type: 'vehiclePhotoSide',
      //       title: 'Side View',
      //       subtitle: 'Clear photo',
      //       required: true,
      //     },
      //     {
      //       type: 'vehiclePhotoInterior',
      //       title: 'Interior View',
      //       subtitle: 'Clear photo',
      //       required: true,
      //     },
      //   ],
      // },
    ],
    [],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* iOS: light-content for dark header, Android: matches system theme */}
      <StatusBar barStyle="light-content" backgroundColor="#0A1329" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section - Dark branded header with logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/headLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Form Section - White card-style container with rounded top corners */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Upload Documents</Text>
          <Text style={styles.subtitle}>
            Upload your documents to get approved. All required documents must
            be clear and valid.
          </Text>

          {/* Document Grid - Responsive 2-column layout */}
          {documentSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              {/* Grid Container - Flexbox with wrap for responsive columns */}
              <View style={styles.gridContainer}>
                {section.documents.map((doc, index) => (
                  <React.Fragment key={doc.type}>
                    {renderUploadBox(
                      doc.type,
                      doc.title,
                      doc.subtitle,
                      doc.required,
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          ))}

          {/* Submit Button - Full-width, matches brand colors */}
          <Button
            isLoading={loading}
            title="Submit Documents"
            onPress={handleSubmit}
          />

          {/* Help text - iOS: SF Pro font, Android: Roboto */}
          <Text style={styles.helpText}>
            Make sure all documents are clear and readable. Blurry or incomplete
            documents may delay approval.
          </Text>
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

  /* Header Styles - Dark branded section */
  header: {
    height: hp(25),
    backgroundColor: '#0D1831',
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4), // iOS: Account for notch/Dynamic Island
    paddingHorizontal: wp(4),
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    // Logo sizing handled by parent container
  },

  /* Form Container - Main white card */
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: wp(8), // iOS: Matches native sheet corners (16-20px)
    borderTopRightRadius: wp(8),
    paddingHorizontal: wp(6),
    paddingTop: hp(4),
    paddingBottom: hp(3),
    // Android: Material elevation for card depth
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },

  /* Title & Subtitle */
  title: {
    fontSize: fs(24), // Scaled: ~20-24px on most devices
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold', // iOS: SF Pro weights, Android: Roboto
    color: '#000000',
    marginBottom: hp(1),
    letterSpacing: Platform.OS === 'ios' ? -0.5 : 0, // iOS: Tighter tracking for readability
  },
  subtitle: {
    fontSize: fs(14), // Scaled: ~14-16px
    color: '#666666',
    marginBottom: hp(3),
    lineHeight: fs(20), // iOS: 1.4-1.5 line height for readability
  },

  /* Section Styles */
  sectionContainer: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#333333',
    marginBottom: hp(1.5),
    letterSpacing: Platform.OS === 'ios' ? -0.3 : 0,
  },

  /* Grid Container - Responsive 2-column layout */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Distributes exactly 2 items per row with space between
  },

  /* Upload Box Container - Wrapper for responsive sizing */
  uploadBoxContainer: {
    width: isSmallScreen ? '100%' : `${(100 - 4) / 2}%`, // Exactly 2 columns: 48% each with 4% gap
    marginBottom: hp(2),
  },
  uploadBoxFullWidth: {
    width: '100%', // Override for small screens (<400px)
  },

  /* Upload Box - Individual document card */
  uploadBox: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: Platform.OS === 'ios' ? 14 : 12, // iOS: 14px matches native cards, Android: 12px Material
    padding: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp(22), // Ensures consistent card height
    backgroundColor: '#F9F9F9',
    position: 'relative',
    // iOS: Subtle shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },
  uploadBoxUploaded: {
    borderColor: '#4CAF50', // Success green when uploaded
    borderStyle: 'solid',
    backgroundColor: '#F1F8F4', // Light green tint
  },

  /* Upload Icon Container */
  uploadIconContainer: {
    marginBottom: hp(1),
  },
  uploadIcon: {
    opacity: 0.8,
  },

  /* Upload Box Text */
  uploadBoxTitle: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginTop: hp(0.5),
  },
  uploadBoxSubtitle: {
    fontSize: fs(12),
    color: '#999999',
    textAlign: 'center',
    marginTop: hp(0.3),
  },

  /* Requirement Badge - Required/Optional indicator */
  requirementBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: 12,
    marginTop: hp(1),
  },
  requirementText: {
    fontSize: fs(11),
    fontWeight: '600',
    color: '#FF3B30',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionalBadge: {
    backgroundColor: 'trans',
  },
  optionalText: {
    color: COLORS.warning,
  },

  /* Upload Button - Tap to upload CTA */
  uploadButton: {
    marginTop: hp(1.5),
    backgroundColor: 'transparent',
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(6),
    borderRadius: Platform.OS === 'ios' ? 10 : 8,
    borderWidth: 1.5,
    borderColor: COLORS.warning,
  },
  uploadButtonText: {
    fontSize: fs(13),
    fontWeight: '600',
    color: COLORS.warning,
    textAlign: 'center',
  },

  /* Uploaded State Styles */
  uploadedImage: {
    width: '100%',
    height: hp(14),
    borderRadius: Platform.OS === 'ios' ? 10 : 8,
    marginBottom: hp(1),
    // Android: Slight elevation for image depth
    ...Platform.select({
      android: {
        elevation: 2,
      },
    }),
  },
  uploadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1),
  },
  uploadedText: {
    fontSize: fs(13),
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: wp(1.5),
  },

  /* Remove Button - Appears on uploaded documents */
  removeButton: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    // iOS: Shadow for button elevation
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  /* File Preview - For non-image documents */
  filePreview: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(2),
  },
  fileName: {
    fontSize: fs(12),
    color: '#666666',
    marginTop: hp(1),
    textAlign: 'center',
    maxWidth: '90%',
  },

  /* Uploading State - Progress overlay */
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: Platform.OS === 'ios' ? 14 : 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: fs(13),
    color: COLORS.warning,
    marginTop: hp(1),
    fontWeight: '500',
  },

  /* Help Text - Bottom informational text */
  helpText: {
    fontSize: fs(12),
    color: '#999999',
    textAlign: 'center',
    marginTop: hp(2),
    lineHeight: fs(18),
    paddingHorizontal: wp(4),
  },
});

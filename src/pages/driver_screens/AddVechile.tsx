// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import Button from '../../components/Button';
import { useNavigation } from '@react-navigation/native';
import {
  pickImageFromCamera,
  pickImageFromGallery,
} from '../../utils/imagePickerHelper';

// Import your existing components
// import TopHeader from './TopHeader';
// import Button from './Button';

export default function VehicleRegistration({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);

  const [documents, setDocuments] = useState({
    driverLicense: null,
    vehicleInsurance: null,
    vehicleRegistration: null,

    frontView: null,
      backView: null,
      sideView: null,
      interiorView: null,
  });
  

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4].map(step => (
        <View
          key={step}
          style={[
            styles.progressBar,
            currentStep >= step && styles.progressBarActive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 1: Vehicle Info Form</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Make</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Mercedes"
          placeholderTextColor="#999"
          value={formData.vehicleMake}
          onChangeText={text => updateFormData('vehicleMake', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Model</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. E-class"
          placeholderTextColor="#999"
          value={formData.model}
          onChangeText={text => updateFormData('model', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Year of Manufacture</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2005"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={formData.manufacturingYear}
          onChangeText={text => updateFormData('manufacturingYear', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>License Plate Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. ABC-123"
          placeholderTextColor="#999"
          value={formData.licensePlateNumber}
          onChangeText={text => updateFormData('licensePlateNumber', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Class</Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerText}>{formData.vehicleClass}</Text>
          <Icon name="chevron-down" size={wp(5)} color="#666" />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => {
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

    return (
      <View>
        <Text style={styles.stepTitle}>Step 2: Upload Documents</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vehicle Documents</Text>
        </View>

        <DocumentUploadItem
          title="Vehicle Registration"
          uploaded={formData.documents.vehicleRegistration}
        />
        <DocumentUploadItem
          title="Insurance Papers"
          uploaded={formData.documents.insurancePapers}
        />
        <DocumentUploadItem
          title="Roadworthiness/Permit Plate"
          uploaded={formData.documents.roadworthiness}
        />

        <View style={[styles.sectionHeader, { marginTop: hp(3) }]}>
          <Text style={styles.sectionTitle}>Vehicle Documents</Text>
        </View>

        <View style={styles.photoGrid}>
          <PhotoUploadBox label="Front View" />
          <PhotoUploadBox label="Back View" />
        </View>
        <View style={styles.photoGrid}>
          <PhotoUploadBox label="Side View" />
          <PhotoUploadBox label="Interior View" />
        </View>
      </View>
    );
  };

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 3: Assign Chauffeur</Text>
      <Text style={styles.subtitle}>
        Assign the vehicle to a company driver or indicate if it's for
        self-driving/personal use
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select Chauffeur</Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerText}>{formData.chauffeur}</Text>
          <Icon name="chevron-down" size={wp(5)} color="#666" />
        </View>
      </View>

      <TouchableOpacity style={styles.linkContainer}>
        <Icon name="add-circle-outline" size={wp(5)} color="#666" />
        <Text style={styles.linkText}>
          Invite a New Driver (You send email to mail)
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 4: Review & Submit</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Summary for Approval</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryTitle}>Mercedes</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryItem}>Plate: ABC-123</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryItem}>Class: Sedan (2022)</Text>
        </View>

        <View style={[styles.summaryRow, { marginTop: hp(2) }]}>
          <Text style={styles.summaryLabel}>Assignment Status</Text>
        </View>
        <View style={styles.summaryRow}>
          <Icon name="checkmark-circle" size={wp(4.5)} color="#4CAF50" />
          <Text style={styles.summaryAssigned}>
            Chauffeur None (Self-driving)
          </Text>
        </View>

        <View style={[styles.summaryRow, { marginTop: hp(2) }]}>
          <Text style={styles.summaryLabel}>Documents & Photos</Text>
        </View>
        <View style={styles.summaryRow}>
          <Icon name="checkmark-circle" size={wp(4.5)} color="#4CAF50" />
          <Text style={styles.summaryDocs}>Documents: All Uploaded</Text>
        </View>
        <View style={styles.summaryRow}>
          <Icon name="checkmark-circle" size={wp(4.5)} color="#4CAF50" />
          <Text style={styles.summaryDocs}>
            Photos: All Required (Uploaded)
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Icon name="checkmark-circle" size={wp(20)} color="#FDD835" />
      </View>
      <Text style={styles.successTitle}>Submission Complete!</Text>
      <Text style={styles.successSubtitle}>
        Silently Pending Admin Approval
      </Text>
      <Text style={styles.successMessage}>
        Your Vehicle Mercedes (ABC-123) has been Submitted for review. You'll be
        notified via email once our administrative team verifies the documents
        and grants approval.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* TopHeader Component */}

      <TopHeader title="Register New Vehicle" navigation={navigation} />

      {currentStep < 5 && renderProgressBar()}
      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </View>

        {currentStep < 5 && (
          <View style={styles.buttonContainer}>
            <Button
              title={currentStep === 4 ? 'Submit for Approval' : 'Next'}
              onPress={currentStep === 4 ? () => setCurrentStep(5) : nextStep}
            />
          </View>
        )}

        {currentStep === 5 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation?.navigate('Home')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Submit for Approval</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const DocumentUploadItem = ({ title, uploaded }) => (
  <View style={styles.documentItem}>
    <View style={styles.documentLeft}>
      <Image source={require('../../assets/images/upload.png')} />
      <Text style={styles.documentTitle}>{title}</Text>
    </View>
    <TouchableOpacity style={styles.uploadButton}>
      <Text style={styles.uploadButtonText}>Upload</Text>
    </TouchableOpacity>
  </View>
);

const PhotoUploadBox = ({ label }) => (
  <View style={styles.photoBox}>
    <Icon name="camera-outline" size={wp(10)} color="#999" />
    <Text style={styles.photoLabel}>{label}</Text>
  </View>
);

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
    paddingTop: hp(6),
    paddingBottom: hp(2),
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: '#000',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#FFF',
    gap: wp(2),
  },
  progressBar: {
    flex: 1,
    height: hp(0.6),
    backgroundColor: '#E0E0E0',
    borderRadius: hp(0.3),
  },
  progressBarActive: {
    backgroundColor: '#FDD835',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  stepTitle: {
    fontSize: wp(4.2),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp(2),
  },
  subtitle: {
    fontSize: wp(3.5),
    color: '#666',
    marginBottom: hp(3),
    lineHeight: wp(5),
  },
  inputGroup: {
    marginBottom: hp(2.5),
  },
  label: {
    fontSize: wp(3.8),
    color: '#000',
    marginBottom: hp(1),
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: wp(3.8),
    backgroundColor: '#FFF',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#FFF',
  },
  pickerText: {
    fontSize: wp(3.8),
    color: '#000',
  },
  sectionHeader: {
    marginBottom: hp(1.5),
  },
  sectionTitle: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: '#000',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(2),
    marginBottom: hp(2.1),
    padding: wp(4),
    paddingTop: wp(5),
    paddingBottom: wp(5),
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.50)',
    borderRadius: wp(3),
    borderStyle: 'dashed',
  },
  documentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  documentTitle: {
    fontSize: wp(3.4),
    color: '#000',
  },
  uploadButton: {
    backgroundColor: '#FDD835',
    paddingHorizontal: wp(6),
    paddingVertical: hp(0.75),
    borderRadius: wp(5),
  },
  uploadButtonText: {
    fontSize: wp(3.5),
    color: '#000',
  },
  photoGrid: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: hp(2),
  },
  photoBox: {
    flex: 1,
    aspectRatio: 1.2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  photoLabel: {
    fontSize: wp(3.2),
    color: '#999',
    marginTop: hp(1),
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginTop: hp(2),
  },
  linkText: {
    fontSize: wp(3.5),
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: wp(3),
    padding: wp(4),
  },
  summaryLabel: {
    fontSize: wp(3.5),
    color: '#666',
    marginBottom: hp(1),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.8),
    gap: wp(2),
  },
  summaryTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#000',
  },
  summaryItem: {
    fontSize: wp(3.8),
    color: '#000',
  },
  summaryAssigned: {
    fontSize: wp(3.5),
    color: '#666',
  },
  summaryDocs: {
    fontSize: wp(3.5),
    color: '#666',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(8),
  },
  successIcon: {
    marginBottom: hp(3),
  },
  successTitle: {
    fontSize: wp(5.5),
    fontWeight: '700',
    color: '#000',
    marginBottom: hp(1),
  },
  successSubtitle: {
    fontSize: wp(4),
    color: '#FDD835',
    marginBottom: hp(2),
  },
  successMessage: {
    fontSize: wp(3.5),
    color: '#666',
    textAlign: 'center',
    lineHeight: wp(5.5),
  },
  buttonContainer: {
    backgroundColor: '#FFF',
    width: '100%',
    marginBottom: hp(10),
  },

  buttonText: {
    fontSize: wp(4.2),
    fontWeight: '600',
    color: '#000',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: hp(2),
    paddingHorizontal: wp(8),
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
  },
  navIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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
import { Checkbox } from 'react-native-paper';

// Import your existing components
// import TopHeader from './TopHeader';
// import Button from './Button';

export default function ChauffeursRegistration({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [checked, setChecked] = useState(false);
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
      <Text style={styles.stepTitle}>Step 1: Personal Info</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g, Jane Doe"
          placeholderTextColor="#999"
          // value={formData.vehicleMake}
          // onChangeText={text => updateFormData('vehicleMake', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Model</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g, S-class"
          placeholderTextColor="#999"
          // value={formData.model}
          // onChangeText={text => updateFormData('model', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Year of Manufacture</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2005"
          placeholderTextColor="#999"
          keyboardType="numeric"
          // value={formData.manufacturingYear}
          // onChangeText={text => updateFormData('manufacturingYear', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g, (555) 123 4567"
          placeholderTextColor="#999"
          // value={formData.licensePlateNumber}
          // onChangeText={text => updateFormData('licensePlateNumber', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g, janedoe12@mail.com"
          placeholderTextColor="#999"
          // value={formData.licensePlateNumber}
          // onChangeText={text => updateFormData('licensePlateNumber', text)}
        />
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
          <Text style={styles.sectionTitle}>Required Documents</Text>
        </View>

        <DocumentUploadItem
          title="Driving License"
          // uploaded={formData.documents.vehicleRegistration}
        />
        <DocumentUploadItem
          title="National ID/Passport"
          // uploaded={formData.documents.insurancePapers}
        />
        <DocumentUploadItem
          title="Commercial Insurance"
          // uploaded={formData.documents.roadworthiness}
        />
      </View>
    );
  };

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 3: Assign Vehicle/Avail.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Assign Vehicle (Optional)</Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerText}>
            No Chauffeur Assigned (Self Drive)
          </Text>
          <Text style={styles.pickerText}></Text>
          <Icon name="chevron-down" size={wp(5)} color="#666" />
        </View>
      </View>

      <Text style={styles.subtitle}>Only "Available" vehicles are shown.</Text>

      <View style={styles.card1}>
        {/* Header Row */}
        <View style={styles.headerRow1}>
          <View style={styles.headerLeft1}>
            <Icon name="calendar" size={wp(5)} color="#000" />
            <Text style={styles.headerText1}>Initial Availability</Text>
          </View>
          <Icon name="chevron-down" size={wp(5)} color="#000" />
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle1}>
          This will open a calendar interface in a production app.
        </Text>

        {/* Button */}
        <TouchableOpacity style={styles.button1}>
          <Text style={styles.buttonText1}>Set Default Shifts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 4: Review & Submit</Text>
      <View style={styles.container}>
        {/* ✅ Vehicle Info */}
        <View style={styles.card}>
          <Text style={styles.vehicleName}>Mercedes</Text>
          <View style={styles.flexbox}>
            <Image source={require('../../assets/images/name.png')} />
            <Text style={styles.vehicleInfo}> Jane Doe</Text>
          </View>
           <View style={styles.flexbox}>
          <Image source={require('../../assets/images/mail.png')} />{' '}
          <Text style={styles.vehicleInfo}> Janedoe12@mail.com</Text>
          </View>
        </View>

        {/* ✅ Assignment Status */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vehicle Assignment</Text>
          <View style={styles.row}>
              <View style={styles.flexbox}>
          <Image source={require('../../assets/images/caricon.png')} />{' '}
          <Text style={styles.vehicleInfo}> No vehicle assigned yet.</Text>
          </View>
          </View>
        </View>

        {/* ✅ Documents & Photos */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Documents Status</Text>

          <View style={styles.row}>
            <Icon
              name="document-text-outline"
              size={18}
              color="#10B981"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.successText}> Documents: All Uploaded</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Image source={require('../../assets/images/submit.png')} />
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
    fontSize: wp(3.5), // responsive text (~16px)
    color: '#947C00',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.7),
    borderRadius: wp(3.5),
    borderWidth: 1, // ✅ you need this for borderColor to show
    borderColor: 'rgba(248, 216, 51, 0.20)',
    backgroundColor: 'rgba(248, 216, 51, 0.20)', // ✅ corrected property name
    width: '100%',
    textAlign: 'center',
    marginTop: wp(3.5),
    marginBottom: wp(3.5),
  },
  successMessage: {
    fontSize: wp(3.2),
    color: '#666',
    textAlign: 'center',
    lineHeight: wp(5.5),
    width: '100%',
  },
  buttonContainer: {
    backgroundColor: '#FFF',
    width: '100%',
    marginBottom: hp(10),
  },

  buttonText: {
    backgroundColor: '#FDD835',
    paddingHorizontal: wp(5), // responsive horizontal padding
    paddingVertical: hp(2), // responsive vertical padding
    borderRadius: wp(10), // smooth rounded edges on all screens
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: wp(4), // responsive text size (~16px on medium screen)
    fontWeight: '400',
    marginTop: hp(2),
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

  card: {
    backgroundColor: '#fff',
    borderRadius: wp(4), // responsive rounded corners
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    marginBottom: hp(1.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(0.3) },
    shadowOpacity: 0.05,
    shadowRadius: wp(1),
    elevation: 2,
  },

  vehicleName: {
    fontSize: wp(4.3), // around 16px on medium screen
    fontWeight: '700',
    color: '#047857',
    marginBottom: hp(0.5),
  },

  vehicleInfo: {
    fontSize: wp(3.6),
    color: '#374151',
    marginBottom: hp(0.3),
  },

  sectionTitle: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#111827',
    marginBottom: hp(0.8),
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusText: {
    fontSize: wp(3.6),
    color: '#4B5563',
  },

  successText: {
    fontSize: wp(3.6),
    color: '#047857',
    fontWeight: '500',
  },

  card1: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(4),
    marginVertical: hp(1.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  headerLeft1: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText1: {
    fontSize: wp(4.2),
    fontWeight: '600',
    color: '#111827',
    marginLeft: wp(2),
  },
  subtitle1: {
    fontSize: wp(3.5),
    color: '#6B7280',
    marginBottom: hp(2),
  },
  button1: {
    borderWidth: 1,
    borderColor: '#FDD835',
    borderRadius: wp(2),
    paddingVertical: hp(1.3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText1: {
    color: '#000',
    fontSize: wp(3.8),
    fontWeight: '500',
  },

    flexbox: {
display:'flex',
alignItems:'center',
gap:wp(1),
flexDirection:'row',
paddingTop:wp(3),
  },
});

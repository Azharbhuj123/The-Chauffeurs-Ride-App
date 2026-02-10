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
  pickFile,
  pickImageFromCamera,
  pickImageFromGallery,
} from '../../utils/imagePickerHelper';
import { Checkbox } from 'react-native-paper';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import CustomDropdown from '../../components/CustomDropdown';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { COLORS, error_msg } from '../../utils/Enums';
import { useStore } from '../../stores/useStore';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';
// Import your existing components
// import TopHeader from './TopHeader';
// import Button from './Button';



const step1Schema = yup.object().shape({
  fullName: yup
    .string()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Full name should only contain letters'),
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(/^[\d\s()+-]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits'),
  emailAddress: yup
    .string()
    .required('Email address is required')
    .email('Please enter a valid email address'),
});

const step2Schema = yup.object().shape({
  drivingLicense: yup
    .mixed()
    .required('Driving license is required')
    .test('fileSize', 'File is required', (value) => value !== null),
  nationalId: yup
    .mixed()
    .required('National ID/Passport is required')
    .test('fileSize', 'File is required', (value) => value !== null),
  commercialInsurance: yup
    .mixed()
    .required('Commercial insurance is required')
    .test('fileSize', 'File is required', (value) => value !== null),
});

const step3Schema = yup.object().shape({
  assignedVehicle: yup
    .string()
    .nullable()
    .notRequired(),
});

export default function ChauffeursRegistration({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const tabBarHeight = useTabBarHeightHelper();
  const { vehicleData, setVehicleData, resetVehicleData } = useStore();

  const { data: vehicleDataApi } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: () => fetchData('/driver/available-vehicles'),
    keepPreviousData: true,
  });

  const vehicle_for = Array.isArray(vehicleDataApi?.vehicles)
    ? vehicleDataApi.vehicles.map((vehicle) => ({
        label: `${vehicle?.vehicle_make} (${vehicle?.vehicle_model})`,
        value: vehicle?._id,
      }))
    : [];

  // Form for Step 1
  const {
    control: control1,
    handleSubmit: handleSubmit1,
    formState: { errors: errors1 },
    trigger: trigger1,
  } = useForm({
    resolver: yupResolver(step1Schema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      emailAddress: '',
    },
  });

  // Form for Step 2
  const {
    control: control2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
    setValue: setValue2,
    trigger: trigger2,
  } = useForm({
    resolver: yupResolver(step2Schema),
    mode: 'onChange',
    defaultValues: {
      drivingLicense: null,
      nationalId: null,
      commercialInsurance: null,
    },
  });

  // Form for Step 3
  const {
    control: control3,
    handleSubmit: handleSubmit3,
    formState: { errors: errors3 },
    trigger: trigger3,

  } = useForm({
    resolver: yupResolver(step3Schema),
    mode: 'onChange',
    defaultValues: {
      assignedVehicle: null,
    },
  });





const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.success) {
        showToast({
          type: 'success',
          title: 'Vehicle Registration Success',
          message: data?.message,
        });
        setCurrentStep(5);
        resetVehicleData();
      }
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Vehicle Registration Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });


  const nextStep = async () => {
    let isValid = false;

  if (currentStep === 4) {
      const formData = new FormData();

      // Step 1 fields
      formData.append('contact', vehicleData.emailAddress);
      formData.append('name', vehicleData.fullName);
      if(vehicleData.assignedVehicle){

        formData.append('assign_Vehicle', vehicleData.assignedVehicle);
      }
       
 
      // Step 2: Upload documents (binary)
      const documents = {
        driver_License: vehicleData.drivingLicense,
        national_Id: vehicleData.nationalId,
        commercial_Insurances: vehicleData.commercialInsurance,
      };

      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
          formData.append(key, {
            uri: file.uri, // React Native image picker uri
            name: file.fileName || `${key}.jpg`, // fallback filename
            type: file.type || 'image/jpeg', // fallback type
          });
        }
      });

      triggerMutation({
        endPoint: '/auth/add-chauffeurs',
        body: formData,
        method: 'post',
      });
      return;
    }

    if (currentStep === 1) {
      isValid = await trigger1();
      if (isValid) {
        handleSubmit1((data) => {
          setVehicleData(data);
          console.log('Step 1 Data:', data);
          setCurrentStep(2);
        })();
      }
    } else if (currentStep === 2) {
      isValid = await trigger2();
      if (isValid) {
        handleSubmit2((data) => {
          setVehicleData(data);
          console.log('Step 2 Data:', data);
          setCurrentStep(3);
        })();
      }
    } else if (currentStep === 3) {
      isValid = await trigger3();
      if (isValid) {
        handleSubmit3((data) => {
          setVehicleData(data);
          console.log('Step 3 Data:', data);
          setCurrentStep(4);
        })();
      }
    } 
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4].map((step) => (
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
        <Controller
          control={control1}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors1.fullName && styles.inputError]}
              placeholder="e.g, Jane Doe"
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors1.fullName && (
          <Text style={styles.errorText}>{errors1.fullName.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <Controller
          control={control1}
          name="phoneNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors1.phoneNumber && styles.inputError]}
              placeholder="e.g, (555) 123 4567"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors1.phoneNumber && (
          <Text style={styles.errorText}>{errors1.phoneNumber.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <Controller
          control={control1}
          name="emailAddress"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors1.emailAddress && styles.inputError]}
              placeholder="e.g, janedoe12@mail.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors1.emailAddress && (
          <Text style={styles.errorText}>{errors1.emailAddress.message}</Text>
        )}
      </View>
    </View>
  );

  const renderStep2 = () => {
    const handleImageSelection = (documentType, fieldName) => {
      const isFileAllowed = [
        'drivingLicense',
        'nationalId',
        'commercialInsurance',
      ].includes(fieldName);

      const options = [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const image = await pickImageFromCamera();
              if (image) {
                setValue2(fieldName, image);
                trigger2(fieldName);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to capture image');
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const image = await pickImageFromGallery();
              if (image) {
                setValue2(fieldName, image);
                trigger2(fieldName);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to select image');
            }
          },
        },
      ];

      if (isFileAllowed) {
        options.push({
          text: 'Upload File (PDF, DOC, etc.)',
          onPress: async () => {
             const file = await pickFile();
              if (file) {
                setValue2(fieldName, file);
                trigger2(fieldName);
              }
          },
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

    const handleRemoveDocument = (fieldName) => {
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
              setValue2(fieldName, null);
              trigger2(fieldName);
            },
            style: 'destructive',
          },
        ],
      );
    };

    return (
      <View>
        <Text style={styles.stepTitle}>Step 2: Upload Documents</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
        </View>

        <Controller
          control={control2}
          name="drivingLicense"
          render={({ field: { value } }) => (
            <>
              <DocumentUploadItem
                title="Driving License"
                uploaded={value}
                onUpload={() => handleImageSelection('drivingLicense', 'drivingLicense')}
                onRemove={() => handleRemoveDocument('drivingLicense')}
                hasError={!!errors2.drivingLicense}
              />
              {errors2.drivingLicense && (
                <Text style={styles.errorText}>{errors2.drivingLicense.message}</Text>
              )}
            </>
          )}
        />

        <Controller
          control={control2}
          name="nationalId"
          render={({ field: { value } }) => (
            <>
              <DocumentUploadItem
                title="National ID/Passport"
                uploaded={value}
                onUpload={() => handleImageSelection('nationalId', 'nationalId')}
                onRemove={() => handleRemoveDocument('nationalId')}
                hasError={!!errors2.nationalId}
              />
              {errors2.nationalId && (
                <Text style={styles.errorText}>{errors2.nationalId.message}</Text>
              )}
            </>
          )}
        />

        <Controller
          control={control2}
          name="commercialInsurance"
          render={({ field: { value } }) => (
            <>
              <DocumentUploadItem
                title="Commercial Insurance"
                uploaded={value}
                onUpload={() => handleImageSelection('commercialInsurance', 'commercialInsurance')}
                onRemove={() => handleRemoveDocument('commercialInsurance')}
                hasError={!!errors2.commercialInsurance}
              />
              {errors2.commercialInsurance && (
                <Text style={styles.errorText}>{errors2.commercialInsurance.message}</Text>
              )}
            </>
          )}
        />
      </View>
    );
  };

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 3: Assign Vehicle/Avail.</Text>

      <View style={{}}>
        <Text style={styles.label}>Assign Vehicle (Optional)</Text>
        <Controller
          control={control3}
          name="assignedVehicle"
          render={({ field: { onChange, value } }) => (
            <>
              <CustomDropdown 
                data={vehicle_for} 
                value={value}
                  onChange={(selectedItem: { label: string; value: string }) => {
                  onChange(selectedItem.value); // pass only the string to RHF
                }}
              />
              {errors3.assignedVehicle && (
                <Text style={styles.errorText}>{errors3.assignedVehicle.message}</Text>
              )}
            </>
          )}
        />
      </View>

      <Text style={styles.subtitle}>Only "Available" vehicles are shown.</Text>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 4: Review & Submit</Text>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.vehicleName}>Jane Doe</Text>
          <View style={styles.flexbox}>
            <Image source={require('../../assets/images/name.png')} />
            <Text style={styles.vehicleInfo}> {vehicleData?.fullName}</Text>
          </View>
          <View style={styles.flexbox}>
            <Image source={require('../../assets/images/mail.png')} />
            <Text style={styles.vehicleInfo}> {vehicleData?.emailAddress}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vehicle Assignment</Text>
          <View style={styles.row}>
            <View style={styles.flexbox}>
              <Image source={require('../../assets/images/caricon.png')} />
              <Text style={styles.vehicleInfo}> {vehicleData?.assignedVehicle ? 'Vehicle Assigned':"No Vehicle Assigned"}</Text>
            </View>
          </View>
        </View>

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
        Your chauffeur registration has been submitted for review. You'll be
        notified via email once our administrative team verifies the documents
        and grants approval.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Add Chauffeurs"
      navigation={navigation}
        any_navigation={currentStep == 5 ? true : false}
        navigate_to={currentStep == 5 ? 'DriverHome' : ''}
      />

      {currentStep < 5 && renderProgressBar()}
      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight },
        ]}
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
            isLoading={loading}
              title={currentStep === 4 ? 'Submit for Approval' : 'Next'}
              onPress={nextStep}
            />
          </View>
        )}

        {currentStep === 5 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation?.navigate('DriverHome')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const DocumentUploadItem = ({ title, uploaded, onUpload, onRemove, hasError }) => (
  <View style={[styles.documentItem, hasError && styles.documentItemError]}>
    <View style={styles.documentLeft}>
      <Image source={require('../../assets/images/upload.png')} />
      <Text style={styles.documentTitle}>{title}</Text>
    </View>
    {uploaded ? (
      <View style={{ flexDirection: 'row', gap: wp(2) }}>
        <Icon name="checkmark-circle" size={wp(6)} color="#10B981" />
        <TouchableOpacity onPress={onRemove}>
          <Icon name="close-circle" size={wp(6)} color="#EF4444" />
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity style={styles.uploadButton} onPress={onUpload}>
        <Text style={styles.uploadButtonText}>Upload</Text>
      </TouchableOpacity>
    )}
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
    backgroundColor: COLORS.warning,
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
    backgroundColor: COLORS.warning,
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
    backgroundColor: COLORS.warning,
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
    boxShadow: '0 0 30px 0 rgba(0, 0, 0, 0.10)',
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
    borderColor: COLORS.warning,
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
    display: 'flex',
    alignItems: 'center',
    gap: wp(1),
    flexDirection: 'row',
    paddingTop: wp(3),
  },
  inputError: {
    borderColor:COLORS.error,
  },
  errorText: error_msg,
});

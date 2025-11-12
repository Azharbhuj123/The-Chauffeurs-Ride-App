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
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { category_class, COLORS, error_msg, vehicle_class } from '../../utils/Enums';
import { useStore } from '../../stores/useStore';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';
import { useUserStore } from '../../stores/useUserStore';
// Import your existing components
// import TopHeader from './TopHeader';
// import Button from './Button';

const options = [
  {
    label: 'For Self Drive',
    value: 'Self Drive',
  },
  {
    label: 'For Chauffeur',
    value: 'Chauffeur',
  },
];

// Validation schemas for each step
const step1Schema = yup.object().shape({
  vehicleMake: yup
    .string()
    .required('Vehicle make is required')
    .min(2, 'Vehicle make must be at least 2 characters'),
  model: yup
    .string()
    .required('Model is required')
    .min(2, 'Model must be at least 2 characters'),
  manufacturingYear: yup
    .string()
    .required('Year of manufacture is required')
    .matches(/^\d{4}$/, 'Year must be 4 digits')
    .test('valid-year', 'Year must be between 1900 and current year', value => {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear;
    }),
  licensePlateNumber: yup
    .string()
    .required('License plate number is required')
    .min(3, 'License plate must be at least 3 characters'),
  vehicleClass: yup.string().required('Vehicle class is required'),
  categoryClass: yup.string().required('Category class is required'),
  vehicle_description: yup.string().required('Vehicle description is required'),
});

const step2Schema = yup.object().shape({
  vehicleRegistration: yup
    .mixed()
    .required('Vehicle registration is required')
    .test('fileSize', 'File is required', value => value !== null),
  vehicleInsurance: yup
    .mixed()
    .required('Insurance papers are required')
    .test('fileSize', 'File is required', value => value !== null),
  roadworthiness: yup
    .mixed()
    .required('Roadworthiness/Permit plate is required')
    .test('fileSize', 'File is required', value => value !== null),
  frontView: yup
    .mixed()
    .required('Front view photo is required')
    .test('fileSize', 'Photo is required', value => value !== null),
  backView: yup
    .mixed()
    .required('Back view photo is required')
    .test('fileSize', 'Photo is required', value => value !== null),
  sideView: yup
    .mixed()
    .required('Side view photo is required')
    .test('fileSize', 'Photo is required', value => value !== null),
  interiorView: yup
    .mixed()
    .required('Interior view photo is required')
    .test('fileSize', 'Photo is required', value => value !== null),
});

const step3Schema = yup.object().shape({
  chauffeurType: yup
    .string()
    .required('Please select chauffeur type')
    .default('Self Drive'),
  inviteDriver: yup.boolean().default(false),
  driverEmail: yup.string().when('inviteDriver', {
    is: true,
    then: schema =>
      schema
        .required('Driver email is required')
        .email('Please enter a valid email'),
    otherwise: schema => schema.notRequired(),
  }),
});

export default function VehicleRegistration({ route, navigation }) {
  const { activeStep } = route.params || {};
  const [currentStep, setCurrentStep] = useState(activeStep ? activeStep : 1);
  const tabBarHeight = useTabBarHeightHelper();
  const { vehicleData, setVehicleData, resetVehicleData } = useStore();
  const { userData } = useUserStore();

  // Form for Step 1
  const {
    control: control1,
    handleSubmit: handleSubmit1,
    formState: { errors: errors1 },
    trigger: trigger1,
    getValues: getValues1,
  } = useForm({
    resolver: yupResolver(step1Schema),
    mode: 'onChange',
    defaultValues: {
      vehicleMake: '',
      model: '',
      manufacturingYear: '',
      licensePlateNumber: '',
      vehicleClass: 'Sedan',
      categoryClass: 'Economy',
    },
  });

  // Form for Step 2
  const {
    control: control2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
    setValue: setValue2,
    trigger: trigger2,
    watch: watch2,
    getValues: getValues2,
  } = useForm({
    resolver: yupResolver(step2Schema),
    mode: 'onChange',
    defaultValues: {
      vehicleRegistration: null,
      vehicleInsurance: null,
      roadworthiness: null,
      frontView: null,
      backView: null,
      sideView: null,
      interiorView: null,
    },
  });

  // Form for Step 3
  const {
    control: control3,
    handleSubmit: handleSubmit3,
    formState: { errors: errors3 },
    watch: watch3,
    setValue: setValue3,
    trigger: trigger3,
    getValues: getValues3,
  } = useForm({
    resolver: yupResolver(step3Schema),
    mode: 'onChange',
    defaultValues: {
      chauffeurType: '',
      inviteDriver: false,
      driverEmail: '',
    },
  });

  const inviteDriver = watch3('inviteDriver');

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
      formData.append('vehicle_make', vehicleData.vehicleMake);
      formData.append('vehicle_model', vehicleData.model);
      formData.append('vehicle_year', vehicleData.manufacturingYear);
      formData.append('vehicle_plate_number', vehicleData.licensePlateNumber);
      formData.append(
        'vehicle_description',
        vehicleData.vehicle_description || '',
      );
      formData.append('vehicle_type', vehicleData.vehicleClass); // matches vehicle_class enum

      // Step 3: Chauffeur / Self Drive logic
      const vehicleFor =
        vehicleData.chauffeurType === 'Self Drive' ? 'Self Drive' : 'Chauffeur';
      formData.append('vehicle_for', vehicleFor);

      // Vehicle driver
      const vehicleDriver = vehicleFor === 'Self Drive' ? userData?._id : null;
      if (vehicleDriver) formData.append('vehicle_driver', vehicleDriver);

      // Step 2: Upload documents (binary)
      const documents = {
        vehicle_registration: vehicleData.vehicleRegistration,
        insurance_papers: vehicleData.vehicleInsurance,
        roadworthiness_permit_docs: vehicleData.roadworthiness,
        front_view: vehicleData.frontView,
        back_view: vehicleData.backView,
        side_view: vehicleData.sideView,
        interior_view: vehicleData.interiorView,
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
        endPoint: '/vehicle/',
        body: formData,
        method: 'post',
      });
      return;
    }

    if (currentStep === 1) {
      isValid = await trigger1();
      console.log(isValid, 'isValid 1');

      if (isValid) {
        handleSubmit1(data => {
          console.log('Step 1 Data:', data);
          setVehicleData(data);
          setCurrentStep(2);
        })();
      }
    } else if (currentStep === 2) {
      isValid = await trigger2();

      console.log(isValid, 'isValid 2');

      if (isValid) {
        handleSubmit2(data => {
          console.log('Step 2 Data:', data);
          setVehicleData(data);
          setCurrentStep(3);
        })();
      }
    } else if (currentStep === 3) {
      console.log(true, 'true');

      isValid = await trigger3();

      if (isValid) {
        handleSubmit3(data => {
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
        <Controller
          control={control1}
          name="vehicleMake"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors1.vehicleMake && styles.inputError]}
              placeholder="e.g. Mercedes"
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors1.vehicleMake && (
          <Text style={styles.errorText}>{errors1.vehicleMake.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Model</Text>
        <Controller
          control={control1}
          name="model"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors1.model && styles.inputError]}
              placeholder="e.g. E-class"
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors1.model && (
          <Text style={styles.errorText}>{errors1.model.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Year of Manufacture</Text>
        <Controller
          control={control1}
          name="manufacturingYear"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                errors1.manufacturingYear && styles.inputError,
              ]}
              placeholder="e.g. 2005"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={4}
            />
          )}
        />
        {errors1.manufacturingYear && (
          <Text style={styles.errorText}>
            {errors1.manufacturingYear.message}
          </Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>License Plate Number</Text>
        <Controller
          control={control1}
          name="licensePlateNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                errors1.licensePlateNumber && styles.inputError,
              ]}
              placeholder="e.g. ABC-123"
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors1.licensePlateNumber && (
          <Text style={styles.errorText}>
            {errors1.licensePlateNumber.message}
          </Text>
        )}
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Description</Text>
        <Controller
          control={control1}
          name="vehicle_description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                errors1.vehicle_description && styles.inputError,
              ]}
              placeholder="Description"
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors1.vehicle_description && (
          <Text style={styles.errorText}>
            {errors1.vehicle_description.message}
          </Text>
        )}
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Class</Text>
        <Controller
          control={control1}
          name="vehicleClass"
          render={({ field: { onChange, value } }) => (
            <View style={[errors1.vehicleClass && styles.inputError]}>
              <CustomDropdown
                data={vehicle_class}
                value={value}
                onChange={(selectedItem: { label: string; value: string }) => {
                  onChange(selectedItem.value); // pass only the string to RHF
                }}
              />
            </View>
          )}
        />
        {errors1.vehicleClass && (
          <Text style={styles.errorText}>{errors1.vehicleClass.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category Class</Text>
        <Controller
          control={control1}
          name="categoryClass"
          render={({ field: { onChange, value } }) => (
            <View style={[errors1.categoryClass && styles.inputError]}>
              <CustomDropdown
                data={category_class}
                value={value}
                onChange={(selectedItem: { label: string; value: string }) => {
                  onChange(selectedItem.value); // pass only the string to RHF
                }}
              />
            </View>
          )}
        />
        {errors1.categoryClass && (
          <Text style={styles.errorText}>{errors1.categoryClass.message}</Text>
        )}
      </View>
    </View>
  );

  const renderStep2 = () => {
    const handleImageSelection = (documentType, fieldName) => {
      const isFileAllowed = [
        'vehicleRegistration',
        'vehicleInsurance',
        'roadworthiness',
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
            // Implement file picker here
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

    const handleRemoveDocument = fieldName => {
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
          <Text style={styles.sectionTitle}>Vehicle Documents</Text>
        </View>

        <Controller
          control={control2}
          name="vehicleRegistration"
          render={({ field: { value } }) => (
            <>
              <DocumentUploadItem
                title="Vehicle Registration"
                uploaded={value}
                onUpload={() =>
                  handleImageSelection(
                    'vehicleRegistration',
                    'vehicleRegistration',
                  )
                }
                onRemove={() => handleRemoveDocument('vehicleRegistration')}
                hasError={!!errors2.vehicleRegistration}
              />
              {errors2.vehicleRegistration && (
                <Text style={styles.errorText}>
                  {errors2.vehicleRegistration.message}
                </Text>
              )}
            </>
          )}
        />

        <Controller
          control={control2}
          name="vehicleInsurance"
          render={({ field: { value } }) => (
            <>
              <DocumentUploadItem
                title="Insurance Papers"
                uploaded={value}
                onUpload={() =>
                  handleImageSelection('vehicleInsurance', 'vehicleInsurance')
                }
                onRemove={() => handleRemoveDocument('vehicleInsurance')}
                hasError={!!errors2.vehicleInsurance}
              />
              {errors2.vehicleInsurance && (
                <Text style={styles.errorText}>
                  {errors2.vehicleInsurance.message}
                </Text>
              )}
            </>
          )}
        />

        <Controller
          control={control2}
          name="roadworthiness"
          render={({ field: { value } }) => (
            <>
              <DocumentUploadItem
                title="Roadworthiness/Permit Plate"
                uploaded={value}
                onUpload={() =>
                  handleImageSelection('roadworthiness', 'roadworthiness')
                }
                onRemove={() => handleRemoveDocument('roadworthiness')}
                hasError={!!errors2.roadworthiness}
              />
              {errors2.roadworthiness && (
                <Text style={styles.errorText}>
                  {errors2.roadworthiness.message}
                </Text>
              )}
            </>
          )}
        />

        <View style={[styles.sectionHeader, { marginTop: hp(3) }]}>
          <Text style={styles.sectionTitle}>Vehicle Photos</Text>
        </View>

        <View style={styles.photoGrid}>
          <Controller
            control={control2}
            name="frontView"
            render={({ field: { value } }) => (
              <View style={{ flex: 1 }}>
                <PhotoUploadBox
                  label="Front View"
                  uploaded={value}
                  onUpload={() =>
                    handleImageSelection('frontView', 'frontView')
                  }
                  onRemove={() => handleRemoveDocument('frontView')}
                  hasError={!!errors2.frontView}
                />
                {errors2.frontView && (
                  <Text style={styles.errorTextSmall}>
                    {errors2.frontView.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control2}
            name="backView"
            render={({ field: { value } }) => (
              <View style={{ flex: 1 }}>
                <PhotoUploadBox
                  label="Back View"
                  uploaded={value}
                  onUpload={() => handleImageSelection('backView', 'backView')}
                  onRemove={() => handleRemoveDocument('backView')}
                  hasError={!!errors2.backView}
                />
                {errors2.backView && (
                  <Text style={styles.errorTextSmall}>
                    {errors2.backView.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>

        <View style={styles.photoGrid}>
          <Controller
            control={control2}
            name="sideView"
            render={({ field: { value } }) => (
              <View style={{ flex: 1 }}>
                <PhotoUploadBox
                  label="Side View"
                  uploaded={value}
                  onUpload={() => handleImageSelection('sideView', 'sideView')}
                  onRemove={() => handleRemoveDocument('sideView')}
                  hasError={!!errors2.sideView}
                />
                {errors2.sideView && (
                  <Text style={styles.errorTextSmall}>
                    {errors2.sideView.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control2}
            name="interiorView"
            render={({ field: { value } }) => (
              <View style={{ flex: 1 }}>
                <PhotoUploadBox
                  label="Interior View"
                  uploaded={value}
                  onUpload={() =>
                    handleImageSelection('interiorView', 'interiorView')
                  }
                  onRemove={() => handleRemoveDocument('interiorView')}
                  hasError={!!errors2.interiorView}
                />
                {errors2.interiorView && (
                  <Text style={styles.errorTextSmall}>
                    {errors2.interiorView.message}
                  </Text>
                )}
              </View>
            )}
          />
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
        <Controller
          control={control3}
          name="chauffeurType"
          render={({ field: { onChange, value } }) => (
            <>
              <CustomDropdown
                data={options}
                value={value?.value}
                onChange={(selectedItem: { label: string; value: string }) => {
                  onChange(selectedItem.value); // pass only the string to RHF
                }}
              />
              {errors3.chauffeurType && (
                <Text style={styles.errorText}>
                  {errors3.chauffeurType.message}
                </Text>
              )}
            </>
          )}
        />
      </View>

      {/* <Controller
        control={control3}
        name="inviteDriver"
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => onChange(!value)}
          >
            <Checkbox
              value={value}
              onValueChange={onChange}
              tintColors={{ true: '#007bff', false: '#666' }}
            />
            <Text style={styles.linkText}>
              Invite a New Driver (You send email to mail)
            </Text>
          </TouchableOpacity>
        )}
      /> */}

      {/* {inviteDriver && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Driver Email</Text>
          <Controller
            control={control3}
            name="driverEmail"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors3.driverEmail && styles.inputError]}
                placeholder="e.g. driver@example.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
              />
            )}
          />
          {errors3.driverEmail && (
            <Text style={styles.errorText}>{errors3.driverEmail.message}</Text>
          )}
        </View>
      )} */}
    </View>
  );

   const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 4: Review & Submit</Text>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.vehicleName}>{vehicleData?.vehicleMake}</Text>
          <Text style={styles.vehicleInfo}>
            Plate: {vehicleData?.licensePlateNumber}
          </Text>
          <Text style={styles.vehicleInfo}>
            Class: {vehicleData?.vehicleClass}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Assignment Status</Text>
          <View style={styles.row}>
            <Icon
              name="checkmark-circle-outline"
              size={18}
              color="#6b7280"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.statusText}>
              Chauffeur:{' '}
              {vehicleData?.chauffeurType === 'Self Drive'
                ? 'Self Drive'
                : 'Assigned Chauffeur'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Documents & Photos</Text>

          <View style={styles.row}>
            <Icon
              name="document-text-outline"
              size={18}
              color="#10B981"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.successText}>Documents: All Uploaded</Text>
          </View>

          <View style={[styles.row, { marginTop: 4 }]}>
            <Icon
              name="images-outline"
              size={18}
              color="#10B981"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.successText}>
              Photos: All Required Uploaded
            </Text>
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
      <TopHeader
        title="Register New Vehicle"
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
              onPress={() => navigation?.navigate('Home')}
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

const DocumentUploadItem = ({
  title,
  uploaded,
  onUpload,
  onRemove,
  hasError,
}) => (
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

const PhotoUploadBox = ({ label, uploaded, onUpload, onRemove, hasError }) => (
  <TouchableOpacity
    style={[styles.photoBox, hasError && styles.photoBoxError]}
    onPress={uploaded ? onRemove : onUpload}
  >
    {uploaded ? (
      <View style={{ alignItems: 'center' }}>
        <Icon name="checkmark-circle" size={wp(10)} color="#10B981" />
        <Text style={[styles.photoLabel, { color: '#10B981' }]}>Uploaded</Text>
        <Text
          style={[styles.photoLabel, { fontSize: wp(2.5), marginTop: hp(0.5) }]}
        >
          Tap to remove
        </Text>
      </View>
    ) : (
      <>
        <Icon name="camera-outline" size={wp(10)} color="#999" />
        <Text style={styles.photoLabel}>{label}</Text>
      </>
    )}
  </TouchableOpacity>
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
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#FFF',
    width: '100%',
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

  errorText: {
    ...error_msg,
  },
  errorTextSmall: {
    ...error_msg,
    fontSize: wp(2.8),
    marginTop: hp(0.3),
  },
  inputError: {
    borderColor:COLORS.error,
  },
});

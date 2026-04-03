// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  TouchableOpacity,
  FlatList,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useForm, Controller } from 'react-hook-form';
import TopHeader from '../../components/TopHeader';
import Button from '../../components/Button';
import { COLORS, error_msg, GOOGLE_MAP_API_KEY } from '../../utils/Enums';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';

export const AddAddressInp = ({ navigation, route }) => {
  const existingAddress = route.params?.address || null;
  const isEditing = !!existingAddress;
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      where: existingAddress?.where || '',
      address: existingAddress?.address || '',
      latitude: existingAddress?.latitude || null,
      longitude: existingAddress?.longitude || null,
      isDefault: existingAddress?.set_default || false,
    },
  });

  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [addressInput, setAddressInput] = useState(
    existingAddress?.address || '',
  );
  const [isSelectingPrediction, setIsSelectingPrediction] = useState(false); // NEW FLAG

  // Debounce for address search
  useEffect(() => {
    if (isSelectingPrediction) return; // ✅ STOP HERE

    if (addressInput.length > 2) {
      const timer = setTimeout(() => {
        fetchPlacePredictions(addressInput);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  }, [addressInput]);

  const fetchPlacePredictions = async input => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input,
        )}&key=${GOOGLE_MAP_API_KEY}`,
      );
      const data = await response.json();
      if (data.predictions) {
        setPredictions(data.predictions);
        setShowPredictions(true);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const handleSelectPrediction = async (placeId, description) => {
    setIsSelectingPrediction(true); // ✅ START BLOCKING

    setShowPredictions(false);
    setPredictions([]);
    Keyboard.dismiss();

    setAddressInput(description);
    setValue('address', description);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAP_API_KEY}`,
      );
      const data = await response.json();

      if (data.result?.geometry) {
        setValue('latitude', data.result.geometry.location.lat);
        setValue('longitude', data.result.geometry.location.lng);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      Alert.alert('Error', 'Could not fetch location details');
    }

    // ✅ IMPORTANT: small delay ke baad allow karo again
    setTimeout(() => {
      setIsSelectingPrediction(false);
    }, 500);
  };

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async () => {
      reset();
      navigation.replace('Address');
      showToast({
        type: 'success',
        title: isEditing ? 'Address Updated' : 'Address Added Successfully',
        message: '',
      });
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Failed',
        message: errmsg || 'Please try again!',
      });
    },
  });

  const onSubmit = async data => {
    if (!data.latitude || !data.longitude) {
      Alert.alert('Error', 'Please select an address from the suggestions.');
      return;
    }

    triggerMutation({
      endPoint: isEditing ? `/address/${existingAddress._id}` : '/address/',
      body: data,
      method: isEditing ? 'put' : 'post',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TopHeader title="Add New Address" navigation={navigation} />

      <View style={styles.formContainer}>
        {/* Address Label (Where) */}
        <Controller
          control={control}
          name="where"
          rules={{ required: 'Label is required' }}
          render={({ field: { onChange, value } }) => (
            <View>
              <View style={styles.inputWrapper}>
                <Ionicons name="pricetag-outline" style={styles.icon} />
                <TextInput
                  placeholder="Label (e.g., Home, Work, Other)"
                  placeholderTextColor="#9E9E9E"
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                />
              </View>
              {errors.where && (
                <Text style={styles.errorText}>{errors.where.message}</Text>
              )}
            </View>
          )}
        />

        {/* Address Input with Autocomplete */}
        <Controller
          control={control}
          name="address"
          rules={{ required: 'Address is required' }}
          render={({ field: { value } }) => (
            <View>
              <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" style={styles.icon} />
                <TextInput
                  placeholder="Search Address"
                  placeholderTextColor="#9E9E9E"
                  style={styles.input}
                  value={addressInput}
                  onChangeText={text => {
                    setAddressInput(text);
                    setValue('address', text);
                    setValue('latitude', null);
                    setValue('longitude', null);
                  }}
                />
              </View>
              {errors.address && (
                <Text style={styles.errorText}>{errors.address.message}</Text>
              )}
            </View>
          )}
        />

        {/* Predictions Dropdown */}
        {showPredictions && predictions.length > 0 && (
          <FlatList
            data={predictions}
            keyExtractor={item => item.place_id}
            keyboardShouldPersistTaps="handled" // ✅ IMPORTANT FIX
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.predictionItem}
                onPress={() =>
                  handleSelectPrediction(item.place_id, item.description)
                }
              >
                <Ionicons name="location-outline" size={wp(4)} color="#666" />
                <Text style={styles.predictionText}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Set as Default Checkbox */}
        <Controller
          control={control}
          name="isDefault"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => onChange(!value)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                {value && (
                  <Ionicons name="checkmark" size={wp(4)} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Set as default address</Text>
            </TouchableOpacity>
          )}
        />

        {/* Save Address Button */}
        <View style={styles.buttonContainer}>
          <Button
            loading={loading}
            title="Save Address"
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 10,
    paddingVertical: hp(1.5),
    marginBottom: hp(1),
    backgroundColor: '#fff',
  },
  icon: {
    fontSize: wp(5),
    color: '#000',
    marginLeft: wp(4),
    marginRight: wp(2),
  },
  input: {
    flex: 1,
    fontSize: wp(4),
    color: '#000',
  },
  errorText: error_msg,
  predictionsContainer: {
    maxHeight: hp(30),
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: hp(2),
  },
  predictionsList: {
    flexGrow: 0,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  predictionText: {
    fontSize: wp(3.5),
    color: '#333',
    marginLeft: wp(2),
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
    marginTop: hp(1),
  },
  checkbox: {
    width: wp(6),
    height: wp(6),
    borderWidth: 2,
    borderColor: '#ECECEC',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: COLORS.warning,
    borderWidth: 0,
  },
  checkboxLabel: {
    fontSize: wp(4),
    color: '#333',
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
  },
  buttonContainer: {
    marginTop: hp(3),
  },
});

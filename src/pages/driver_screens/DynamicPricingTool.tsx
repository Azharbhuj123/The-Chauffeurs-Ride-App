// @ts-nocheck

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import Slider from '@react-native-community/slider';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Button from '../../components/Button';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';

import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { category_class, error_msg } from '../../utils/Enums';
import CustomDropdown from '../../components/CustomDropdown';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';

const { width, height } = Dimensions.get('window');

const fs = size => {
  return Math.sqrt(height * height + width * width) * (size / 1000);
};

const schema = yup.object().shape({
  category_type: yup
    .string()
    .required('Category type is required')
    .default('Economy'),
  baseFare: yup
    .number()
    .typeError('Base fare must be a number')
    .positive('Base fare must be > 0')
    .required('Base fare is required'),
  ratePerMile: yup
    .number()
    .typeError('Rate per mile must be a number')
    .positive('Rate per mile must be > 0')
    .required('Rate per mile is required'),
  ratePerMinute: yup
    .number()
    .typeError('Rate per minute must be a number')
    .positive('Rate per minute must be > 0')
    .required('Rate per minute is required'),
  surgeMultiplier: yup
    .number()
    .oneOf([1, 3], 'Surge multiplier must be either 1.0x or 3.0x')
    .required('Surge multiplier is required'),
});

export default function DynamicPricingTool({ navigation }) {
  const tabBarHeight = useTabBarHeightHelper();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      category_type: 'Economy',
      baseFare: '3.3',
      ratePerMile: '3.3',
      ratePerMinute: '0.25',
      surgeMultiplier: 1, // numeric for slider
    },
  });
  const watchedSurge = watch('surgeMultiplier');
  const category_type = watch('category_type');


    const { data, isLoading, refetch } = useQuery({
    queryKey: ['driver-pricing',category_type],
    queryFn: () => fetchData(`/pricing/${category_type}`),
    keepPreviousData: true,
  });


  useEffect(()=>{
    if(data?.success){

    reset({
      category_type: category_type,
      baseFare: data?.base_fare,
      ratePerMile: data?.rate_per_mile,
      ratePerMinute: data?.rate_per_minute,
      surgeMultiplier: data?.surge_multiplier
    })
    }

  },[data,category_type])




  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.success) {
        showToast({
          type: 'success',
          title: 'Update Successful',
          message: 'The pricing details have been updated successfully.',
        });
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

  const onSubmit = data => {
    const lower_type = data?.category_type?.toLowerCase();

    // ✅ Correct way: use [ ] for dynamic keys
    const payload = {
      [`${lower_type}_base_fare`]: Number(data.baseFare),
      [`${lower_type}_rate_per_mile`]: Number(data.ratePerMile),
      [`${lower_type}_rate_per_minute`]: Number(data.ratePerMinute),
      [`${lower_type}_surge_multiplier`]: Number(data.surgeMultiplier),
    };

    // Replace this with your save/apply logic
    console.log('Saving dynamic pricing:', payload);

    triggerMutation({
      endPoint: '/pricing/',
      body: payload,
      method: 'post',
    });

    // Example: call an API, dispatch to redux, or update local state
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Operations Overview" navigation={navigation} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: tabBarHeight,
            },
          ]}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 18 }]}>
              Dynamic Pricing Tool
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Rate Card</Text>
          </View>
          <Controller
            control={control}
            name="category_type"
            render={({ field: { onChange, value } }) => (
              <>
                <CustomDropdown
                  placeholder="Choose category for pricing"
                  data={category_class}
                  value={value}
                  onChange={(selectedItem: {
                    label: string;
                    value: string;
                  }) => {
                    onChange(selectedItem.value); // pass only the string to RHF
                  }}
                />
                {errors.category_type && (
                  <Text style={styles.errorText}>
                    {errors.category_type.message}
                  </Text>
                )}
              </>
            )}
          />

          {/* Base Fare */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Base Fare</Text>
            <Controller
              control={control}
              name="baseFare"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={String(value)}
                    onChangeText={text => onChange(text)}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                    placeholder="3.3"
                  />
                  <Text style={styles.inputSuffix}>$</Text>
                </View>
              )}
            />
            {errors.baseFare && (
              <Text style={styles.errorText}>{errors.baseFare.message}</Text>
            )}
          </View>

          {/* Rate Per Mile & Minute */}
          <View style={styles.row}>
            <View style={[styles.inputSection, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Rate Per Mile</Text>
              <Controller
                control={control}
                name="ratePerMile"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={String(value)}
                      onChangeText={text => onChange(text)}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                      placeholder="3.3"
                    />
                    <Text style={styles.inputSuffix}>$</Text>
                  </View>
                )}
              />
              {errors.ratePerMile && (
                <Text style={styles.errorText}>
                  {errors.ratePerMile.message}
                </Text>
              )}
            </View>

            <View style={[styles.inputSection, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Rate Per Minute</Text>
              <Controller
                control={control}
                name="ratePerMinute"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={String(value)}
                      onChangeText={text => onChange(text)}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                      placeholder="0.25"
                    />
                    <Text style={styles.inputSuffix}>$/min</Text>
                  </View>
                )}
              />
              {errors.ratePerMinute && (
                <Text style={styles.errorText}>
                  {errors.ratePerMinute.message}
                </Text>
              )}
            </View>
          </View>

          {/* Surge Multiplier */}
          <View style={styles.surgeSection}>
            <Text style={styles.sectionTitle}>
              Surge Multiplier (Demand/Time-Based)
            </Text>
            <View style={styles.surgeContainer}>
              <Text style={styles.surgeValue}>
                {Number(watchedSurge).toFixed(2)}x
              </Text>

              <Controller
                control={control}
                name="surgeMultiplier"
                render={({ field: { onChange, value } }) => (
                  <>
                    <Slider
                      style={styles.slider}
                      minimumValue={1}
                      maximumValue={3}
                      step={2} // only 1 or 3
                      value={Number(value)}
                      onValueChange={val => onChange(Number(val))}
                      minimumTrackTintColor="#FFD700"
                      maximumTrackTintColor="#FFE680"
                      thumbTintColor="#FFD700"
                    />

                    <View style={styles.sliderLabels}>
                      <Text style={styles.sliderLabel}>1.0x (Standard)</Text>
                      <Text style={styles.sliderLabel}>3.0x (Max Peak)</Text>
                    </View>
                  </>
                )}
              />
              {errors.surgeMultiplier && (
                <Text style={styles.errorText}>
                  {errors.surgeMultiplier.message}
                </Text>
              )}

              <View style={styles.saveButton}>
                <Button
                  isLoading={loading}
                  title={isSubmitting ? 'Saving...' : 'Save & Apply'}
                  onPress={handleSubmit(onSubmit)}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: wp(4.3),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  section: {
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp(0.5),
  },
  inputSection: {
    marginBottom: hp(2),
  },
  inputLabel: {
    fontSize: fs(14),
    color: '#000',
    marginBottom: hp(1),
    fontWeight: '400',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: wp(4.5),
    paddingHorizontal: wp(4),
    height: hp(6),
  },
  input: {
    flex: 1,
    fontSize: fs(14),
    color: '#000',
  },
  inputSuffix: {
    fontSize: fs(14),
    color: '#999',
    marginLeft: wp(2),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(3),
  },
  halfWidth: {
    flex: 1,
  },
  surgeSection: {
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  surgeContainer: {
    backgroundColor: '#fff',
    boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.10)',
    padding: wp(6),
    marginTop: hp(3),
    borderRadius: wp(3),
    marginBottom: hp(5),
  },
  surgeValue: {
    fontSize: fs(32),
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'center',
    marginVertical: hp(2),
  },
  sliderContainer: {
    paddingHorizontal: wp(2),
    marginBottom: hp(1),
  },
  slider: {
    width: '100%',
    height: hp(5),
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(2),
  },
  sliderLabel: {
    fontSize: fs(12),
    color: '#666',
  },
  saveButton: {
    width: '100%',
    marginTop: hp(2),
  },
  saveButtonText: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#000',
  },
  errorText: error_msg,
});

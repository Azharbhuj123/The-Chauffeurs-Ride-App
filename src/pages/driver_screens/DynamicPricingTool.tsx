// @ts-nocheck


import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import Slider from '@react-native-community/slider';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Button from '../../components/Button';

const { width, height } = Dimensions.get('window');

const fs = (size) => {
  return Math.sqrt((height * height) + (width * width)) * (size / 1000);
};


export default function DynamicPricingTool({ navigation }) {
  const [baseFare, setBaseFare] = useState('3.3');
  const [ratePerMile, setRatePerMile] = useState('3.3');
  const [ratePerMinute, setRatePerMinute] = useState('0.25');
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
          <TopHeader title="Operations Overview" navigation={navigation} />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: 18 }]}>Dynamic Pricing Tool</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Core Rate Card</Text>
            </View>

            {/* Base Fare */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Base Fare</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={baseFare}
                  onChangeText={setBaseFare}
                  keyboardType="decimal-pad"
                  placeholder="3.3"
                />
                <Text style={styles.inputSuffix}>$</Text>
              </View>
            </View>

            {/* Rate Per Mile & Minute */}
            <View style={styles.row}>
              <View style={[styles.inputSection, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Rate Per Mile</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={ratePerMile}
                    onChangeText={setRatePerMile}
                    keyboardType="decimal-pad"
                    placeholder="3.3"
                  />
                  <Text style={styles.inputSuffix}>$</Text>
                </View>
              </View>

              <View style={[styles.inputSection, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Rate Per Minute</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={ratePerMinute}
                    onChangeText={setRatePerMinute}
                    keyboardType="decimal-pad"
                    placeholder="0.25"
                  />
                  <Text style={styles.inputSuffix}>$/min</Text>
                </View>
              </View>
            </View>

            {/* Surge Multiplier */}
            <View style={styles.surgeSection}>
              <Text style={styles.sectionTitle}>Surge Multiplier (Demand/Time-Based)</Text>
              <View style={styles.surgeContainer}>
                <Text style={styles.surgeValue}>{surgeMultiplier.toFixed(2)}x</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1.0}
                  maximumValue={3.0}
                  step={0.01}
                  value={surgeMultiplier}
                  onValueChange={setSurgeMultiplier}
                  minimumTrackTintColor="#FFD700"
                  maximumTrackTintColor="#FFE680"
                  thumbTintColor="#FFD700"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>1.0x (Standard)</Text>
                  <Text style={styles.sliderLabel}>3.0x (Max Peak)</Text>
                </View>

                <View style={styles.saveButton}>
                  <Button title="Save & Apply" />
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
   borderWidth:1,
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
  surgeContainer:{
    backgroundColor:'#fff',
    boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.10)',
    padding:wp(6),
    marginTop:hp(3),
    borderRadius:wp(3),
    marginBottom:hp(5)

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
    width:"100%",
    marginTop: hp(2),
  },
  saveButtonText: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#000',
  },
});
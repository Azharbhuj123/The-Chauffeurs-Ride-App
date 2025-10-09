// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import TopHeader from '../../components/TopHeader';
import Button from '../../components/Button';

export const AddNewCardScreen = ({ navigation }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleSaveCard = () => {
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    Alert.alert('Success', 'Card has been saved!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <TouchableWithoutFeedback
    onPress={Keyboard.dismiss}
    >
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TopHeader title="Add New Card" navigation={navigation}/>

      <View style={styles.formContainer}>
        {/* Card Number */}
        <View style={styles.inputWrapper}>
          <Ionicons name="card-outline" style={styles.icon} />
          <TextInput
            placeholder="Card Number"
            placeholderTextColor="#9E9E9E"
            keyboardType="number-pad"
            maxLength={16}
            style={styles.input}
            value={cardNumber}
            onChangeText={setCardNumber}
          />
        </View>

        {/* Card Holder Name */}
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" style={styles.icon} />
          <TextInput
            placeholder="Card Holder Name"
            placeholderTextColor="#9E9E9E"
            style={styles.input}
            value={cardHolder}
            onChangeText={setCardHolder}
          />
        </View>

        {/* Expiry Date and CVV */}
        <View style={styles.row}>
          <View style={[styles.inputWrapper, { flex: 1, marginRight: wp(3) }]}>
            <TextInput
              placeholder="Expiry Date"
              placeholderTextColor="#9E9E9E"
              style={[styles.input, { paddingLeft: wp(4) }]}
              value={expiryDate}
              onChangeText={setExpiryDate}
              maxLength={5}
            />
          </View>
          <View style={[styles.inputWrapper, { flex: 1 }]}>
            <TextInput
              placeholder="Cvv"
              placeholderTextColor="#9E9E9E"
              keyboardType="number-pad"
              secureTextEntry
              style={[styles.input, { paddingLeft: wp(4) }]}
              value={cvv}
              onChangeText={setCvv}
              maxLength={3}
            />
          </View>
        </View>

        {/* Save Card Button */}
        <View style={styles.buttonContainer}>
          <Button title="Save Card" onPress={handleSaveCard} />
        </View>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
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
    marginBottom: hp(2),
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    marginTop: hp(3),
  },
});

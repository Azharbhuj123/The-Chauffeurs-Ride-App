// @ts-nocheck

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,

  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopHeader from '../../components/TopHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

// Card logos - Make sure you have these images in your assets folder
const cardLogos = {
  visa: require('../../assets/images/visa.png'),
  mastercard: require('../../assets/images/mastercard.png'),
  unionpay: require('../../assets/images/unionpay.png'),
};

export const PaymentOptionsScreen = ({ navigation }) => {
  const [cards, setCards] = useState([
    {
      id: 1,
      brand: 'visa',
      last4: '8970',
      expires: '12/26',
    },
    {
      id: 2,
      brand: 'mastercard',
      last4: '8970',
      expires: '12/26',
    },
    {
      id: 3,
      brand: 'unionpay',
      last4: '8970',
      expires: '12/26',
    },
  ]);

  const [selectedCardId, setSelectedCardId] = useState(1); // Default to the first card

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <TopHeader title="Payment Options" navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {cards.map(card => {
          const isSelected = card.id === selectedCardId;
          return (
            <TouchableOpacity
              key={card.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => setSelectedCardId(card.id)}>
              <View style={[
                styles.radioOuter,
                isSelected && { borderColor: '#FDD835' },
              ]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Image source={cardLogos[card.brand]} style={styles.cardLogo} />
              <View>
                <Text style={styles.cardNumber}>**** **** **** {card.last4}</Text>
                <Text style={styles.cardExpires}>Expires: {card.expires}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('AddNewCard')}>
          <Ionicons name="add-circle-outline" size={wp(6)} color="#555" />
          <Text style={styles.addCardText}>Add New Card</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: wp(4.5),
    borderRadius: 12,
    marginBottom: hp(1.5),
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  radioOuter: {
    width: wp(5.5),
    height: wp(5.5),
    borderRadius: wp(2.75),
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  radioInner: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    borderColor: '#FDD835',

    backgroundColor: '#FDD835', // Google Blue, similar to the image
  },
  cardLogo: {
    width: wp(10),
    height: hp(4),
    resizeMode: 'contain',
    marginRight: wp(4),
  },
  cardNumber: {
    fontSize: wp(4),
    fontWeight: '500',
    color: '#000',
  },
  cardExpires: {
    fontSize: wp(3.5),
    color: '#666',
    marginTop: hp(0.3),
  },
  addCardText: {
    fontSize: wp(4),
    color: '#333',
    fontWeight: '500',
    marginLeft: wp(3),
  },
});
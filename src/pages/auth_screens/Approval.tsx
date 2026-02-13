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
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { COLORS } from '../../utils/Enums';

export default function Approval({ route, navigation, headerTitle }) {
  const { contact, reason, status } = route.params || {};

  console.log(contact, reason, status, 'contact,reason,status');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centeredContent}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Image source={require('../../assets/images/submit.png')} />
            </View>
            <Text style={styles.successTitle}>Submission Complete!</Text>
            <Text
              style={[
                styles.successSubtitle,
                {
                  backgroundColor:
                    status === 'Rejected'
                      ? COLORS.error
                      : 'rgba(248, 216, 51, 0.20)',
                  color: status === 'Rejected' ? '#fff' : '#947C00',
                },
              ]}
            >
              Status : {status || "Pending"}
            </Text>
            {status === 'Rejected' && reason ? (
              <Text style={styles.successMessage}>
                Your account has been rejected for the following reason:{' '}
                {reason}
              </Text>
            ) : (
              <Text style={styles.successMessage}>
                Your account has been successfully created. It is currently
                under review and awaiting admin approval. You will be notified
                once your account is activated.
              </Text>
            )}
          </View>
          {status === 'Rejected' && (
            <View style={{ width: '100%' }}>
              <Button
                title="Fix & resubmit"
                onPress={() => navigation.navigate('UploadDoc',{
                  contact
                })}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1, // ensures ScrollView uses all available space
  },

  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
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
});

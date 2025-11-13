// @ts-nocheck

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Button from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import { COLORS } from '../../utils/Enums';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import AppLoader from '../../components/AppLoader';
import CustomDropdown from '../../components/CustomDropdown';
import { showToast } from '../../utils/toastHelper';
import useActionMutation from '../../queryFunctions/useActionMutation';

const ChauffeurBookingScreen = ({ navigation }) => {
  const tabBarHeight = useTabBarHeightHelper();
  const [chauffeurEnabled, setChauffeurEnabled] = useState(true);
  const [selectedChauffeur, setSelectedChauffeur] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [assign_Vehicle, setAssign_Vehicle] = useState(null);

  const fetchChauffeurs = async ({ pageParam = 1 }) => {
    const res = await fetchData(
      `/driver/my-chauffeurs?page=${pageParam}&limit=5`,
    );
    return res;
  };

  const { data: vehicleDataApi } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: () => fetchData('/driver/available-vehicles'),
    keepPreviousData: true,
  });

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['my-Chauffeurs'],
    queryFn: fetchChauffeurs,
    getNextPageParam: lastPage => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });

  const vehicle_for = Array.isArray(vehicleDataApi?.vehicles)
    ? vehicleDataApi.vehicles.map(vehicle => ({
        label: `${vehicle?.vehicle_make} (${vehicle?.vehicle_model})`,
        value: vehicle?._id,
      }))
    : [];
  const allChauffeurs = data?.pages?.flatMap(page => page.data) || [];

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.success) {
        refetch();
        setModalVisible(false);
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

  const handleAssign = () => {
    if (!selectedChauffeur || !assign_Vehicle) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Please fill out all fields',
      });
      return;
    }
    const data_obj = {
      chauffeur_id: selectedChauffeur,
      vehicle_id: assign_Vehicle,
    };

    triggerMutation({
      endPoint: '/driver/assign-chauffeur',
      body: data_obj,
      method: 'post',
    });
  };

  if (isLoading) return <AppLoader />;
  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Chauffeurs" navigation={navigation} />

      <FlatList
        data={allChauffeurs}
        keyExtractor={item => item._id}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isFetchingNextPage ? <ActivityIndicator size="small" /> : null
        }
        ListHeaderComponent={
          <>
            {/* Chauffeur Availability Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Chauffeur Availability</Text>
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>
                  Today: Oct 25 (Monthly View)
                </Text>
                <TouchableOpacity style={styles.monthlyBadge}>
                  <Text style={styles.monthlyText}>Monthly ▼</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chauffeurJoeCard}>
                <View>
                  <Text style={styles.joeTitle}>Chauffeur Joe</Text>
                  <Text style={styles.joeSubtitle}>08:00 - 16:00 Shift</Text>
                </View>
                <View style={styles.onlineSwitch}>
                  <Text style={styles.onlineText}>Online</Text>
                  <Switch
                    value={chauffeurEnabled}
                    onValueChange={setChauffeurEnabled}
                    trackColor={{ false: '#e0e0e0', true: '#34C759' }}
                    thumbColor="#fff"
                    style={styles.switch}
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.blockButton}>
                <Text style={styles.blockButtonText}>Block All Slots</Text>
              </TouchableOpacity>
            </View>

            {/* All Chauffeurs Header */}
            <View style={styles.allChauffeursSection}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: hp(2),
                  alignItems: 'center',
                }}
              >
                <Text style={styles.allChauffeursTitle}>All Chauffeurs</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddChauffeurs')}
                >
                  <Text style={styles.allChauffeursBtn}>Add Chauffeurs</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.chauffeurCard}>
            <View style={styles.chauffeurContent}>
              <View style={styles.chauffeurLeft}>
                <Text style={styles.chauffeurName}>{item.name}</Text>
                <Text style={styles.chauffeurDetails}>
                  ⭐ {item.rating || 'N/A'}{' '}
                  {item.assign_Vehicle?.vehicle_model || 'Unassigned'}
                </Text>
                <View style={styles.availableBadge}>
                  <Text style={styles.availableText}>Available</Text>
                </View>
              </View>
              {!item.assign_Vehicle?.vehicle_model && (
                <TouchableOpacity
                  style={styles.menuDots}
                  onPress={() => {
                    setSelectedChauffeur(item);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.dotsText}>⋮</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 35 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Assign Vehicle</Text>
            <CustomDropdown
              data={vehicle_for}
              onChange={item => setAssign_Vehicle(item.value)}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '70%',
              }}
            >
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </Pressable>

              <Pressable
                disabled={assign_Vehicle === null || loading}
                style={styles.modalCloseBtn2}
                onPress={handleAssign}
              >
                <Text style={styles.modalCloseText}>
                  {loading ? 'Assigning...' : 'Assign'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    margin: wp(4),
    padding: wp(4),
    borderRadius: wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(0.2) },
    shadowOpacity: 0.1,
    shadowRadius: wp(1),
    elevation: 2,
  },
  cardTitle: {
    fontSize: wp(4),
    fontWeight: '700',
    color: '#000',
    marginBottom: hp(1.5),
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFBEA',
    padding: wp(3),
    borderRadius: wp(2),
    marginBottom: hp(1.5),
  },
  dateText: {
    fontSize: wp(3.5),
    color: '#000',
  },
  monthlyBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  monthlyText: {
    fontSize: wp(3),
    color: '#666',
  },
  chauffeurJoeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: wp(3),
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: hp(1.5),
  },
  joeTitle: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp(0.3),
  },
  joeSubtitle: {
    fontSize: wp(3),
    color: '#888',
  },
  onlineSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineText: {
    fontSize: wp(3.3),
    color: '#34C759',
    fontWeight: '600',
    marginRight: wp(2),
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  blockButton: {
    backgroundColor: '#fff',
    borderRadius: wp(10),
    paddingVertical: hp(1.8),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF5252',
  },
  blockButtonText: {
    color: '#FF5252',
    fontSize: wp(3.6),
    fontWeight: '600',
  },
  allChauffeursSection: {
    marginHorizontal: wp(4),
    marginTop: hp(1),
  },
  allChauffeursTitle: {
    fontSize: wp(4),
    fontWeight: '700',
    color: '#000',
    marginBottom: hp(1.5),
  },
  allChauffeursBtn: {
    backgroundColor: COLORS.warning,
    padding: 10,
    borderRadius: 10,
  },
  chauffeurCard: {
    backgroundColor: '#fff',
    borderRadius: wp(2.5),
    margin: wp(4),
    padding: wp(4),
    marginBottom: hp(2.5),
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  chauffeurContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  chauffeurLeft: {
    flex: 1,
  },
  chauffeurName: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp(0.5),
  },
  chauffeurDetails: {
    fontSize: wp(3.2),
    color: '#666',
    marginBottom: hp(0.8),
  },
  availableBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: wp(1.5),
    alignSelf: 'flex-start',
  },
  availableText: {
    color: '#fff',
    fontSize: wp(2.8),
    fontWeight: '600',
  },
  menuDots: {
    padding: wp(1),
  },
  dotsText: {
    fontSize: wp(6),
    color: '#888',
    fontWeight: 'bold',
  },
  bottomBar: {
    padding: wp(4),
    marginBottom: hp(8),
  },
  nextButton: {
    backgroundColor: '#FFD600',
    borderRadius: wp(10),
    paddingVertical: hp(2),
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#000',
    fontSize: wp(4),
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: hp('30%'),
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 15,
    fontFamily: 'Poppins-Regular',
  },
  modalSubTitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalCloseBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#999',
  },
  modalCloseBtn2: {
    backgroundColor: COLORS.warning,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  modalCloseText: {
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
});

export default ChauffeurBookingScreen;

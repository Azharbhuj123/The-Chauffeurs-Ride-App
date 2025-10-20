import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
 
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Button from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChauffeurBookingScreen = () => {
  const [chauffeurEnabled, setChauffeurEnabled] = useState(true);

  const chauffeurs = [
    { id: 1, name: 'Liam Jones', rating: '4.8', model: 'Tesla Model 3' },
    { id: 2, name: 'Olivia Brown', rating: '4.8', model: 'Mercedes E-Class' },
    { id: 3, name: 'Noah Davis', rating: 'N/A', model: 'Unassigned' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Chauffeur Availability Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chauffeur Availability</Text>

          {/* Date Row */}
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>Today: Oct 25 (Monthly View)</Text>
            <TouchableOpacity style={styles.monthlyBadge}>
              <Text style={styles.monthlyText}>Monthly ▼</Text>
            </TouchableOpacity>
          </View>

          {/* Chauffeur Joe Card */}
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

          {/* Block All Slots Button */}
          <TouchableOpacity style={styles.blockButton}>
            <Text style={styles.blockButtonText}>Block All Slots</Text>
          </TouchableOpacity>
        </View>

        {/* All Chauffeurs Section */}
        <View style={styles.allChauffeursSection}>
          <Text style={styles.allChauffeursTitle}>All Chauffeurs</Text>

          {chauffeurs.map((chauffeur) => (
            <View key={chauffeur.id} style={styles.chauffeurCard}>
              <View style={styles.chauffeurContent}>
                <View style={styles.chauffeurLeft}>
                  <Text style={styles.chauffeurName}>{chauffeur.name}</Text>
                  <Text style={styles.chauffeurDetails}>
                    ⭐ {chauffeur.rating} {chauffeur.model}
                  </Text>
                  <View style={styles.availableBadge}>
                    <Text style={styles.availableText}>Available</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.menuDots}>
                  <Text style={styles.dotsText}>⋮</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomBar}>
           <Button title='Next'/>
        </View>
      </ScrollView>
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
  chauffeurCard: {
    backgroundColor: '#fff',
    borderRadius: wp(2.5),
    padding: wp(3),
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
});

export default ChauffeurBookingScreen;

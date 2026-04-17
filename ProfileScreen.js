// screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { subscribeToProfile, updateProfile, logoutUser } from '../firebase/services';
import { ACHIEVEMENTS, getLevel, getLevelData } from '../constants/gameData';

export default function ProfileScreen() {
  const { user }   = useAuth();
  const [profile, setProfile]   = useState(null);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToProfile(user.uid, setProfile);
    return unsub;
  }, [user]);

  const renameBird = async () => {
    if (!nameInput.trim()) return;
    await updateProfile(user.uid, { birdName: nameInput.trim() });
    setNameInput('');
    Alert.alert('✨ Renamed!', `Your bird is now called ${nameInput.trim()}!`);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logoutUser },
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset', 'This will reset all your progress. Cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => {
        await updateProfile(user.uid, {
          xp: 0, level: 1, hp: 100, streak: 0,
          totalDone: 0, petCount: 0, lowHpRecovery: 0,
          unlockedMilestones: [], unlockedAchievements: [],
        });
      }},
    ]);
  };

  if (!profile) return (
    <View style={styles.loading}><ActivityIndicator size="large" color="#ff7043" /></View>
  );

  const lv = getLevel(profile.xp || 0);
  const ld = getLevelData(lv);

  return (
    <LinearGradient colors={['#b8e4f9', '#d6f0ff', '#fff8f0']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Bird Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>{ld.emoji}</Text>
          <Text style={styles.heroName}>{profile.birdName}</Text>
          <Text style={styles.heroTagline}>Level {lv} {ld.name} · {profile.xp} total XP</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{profile.totalDone || 0}</Text>
              <Text style={styles.heroStatLabel}>Habits Done</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{profile.streak || 0}</Text>
              <Text style={styles.heroStatLabel}>Best Streak</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{profile.petCount || 0}</Text>
              <Text style={styles.heroStatLabel}>Pets Given</Text>
            </View>
          </View>
        </View>

        {/* Rename */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✏️  Rename your bird</Text>
          <View style={styles.renameRow}>
            <TextInput
              style={styles.input}
              placeholder="New name…"
              placeholderTextColor="#bbb"
              value={nameInput}
              onChangeText={setNameInput}
              maxLength={20}
            />
            <TouchableOpacity style={styles.renameBtn} onPress={renameBird}>
              <Text style={styles.renameBtnText}>✓</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏅  Achievements</Text>
          <View style={styles.achGrid}>
            {ACHIEVEMENTS.map(a => {
              const unlocked = (profile.unlockedAchievements || []).includes(a.id);
              return (
                <View key={a.id} style={[styles.achCard, unlocked && styles.achUnlocked]}>
                  <Text style={styles.achIcon}>{unlocked ? a.icon : '🔒'}</Text>
                  <Text style={styles.achName}>{a.name}</Text>
                  <Text style={styles.achDesc}>{a.desc}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️  Account</Text>
          <Text style={styles.emailText}>📧 {user?.email}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetText}>🗑️ Reset Progress</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  loading:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:      { padding: 16, paddingBottom: 100 },

  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 24,
    padding: 24, alignItems: 'center', marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  heroEmoji:   { fontSize: 72, marginBottom: 8 },
  heroName:    { fontSize: 24, fontWeight: '900', color: '#2d2d2d' },
  heroTagline: { fontSize: 14, fontWeight: '700', color: '#aaa', marginTop: 2, marginBottom: 16 },
  heroStats:   { flexDirection: 'row', gap: 24 },
  heroStat:    { alignItems: 'center' },
  heroStatVal: { fontSize: 22, fontWeight: '900', color: '#ff7043' },
  heroStatLabel:{ fontSize: 11, fontWeight: '700', color: '#aaa' },

  section: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 24,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
  },
  sectionTitle:{ fontSize: 15, fontWeight: '800', color: '#2d2d2d', marginBottom: 12 },

  renameRow:   { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, borderWidth: 2, borderColor: '#eee', borderRadius: 14,
    padding: 12, fontSize: 14, fontWeight: '600', color: '#2d2d2d', backgroundColor: '#fafafa',
  },
  renameBtn: {
    backgroundColor: '#ff7043', borderRadius: 14, width: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  renameBtnText:{ color: '#fff', fontSize: 20, fontWeight: '900' },

  achGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achCard: {
    width: '47%', backgroundColor: '#fafafa', borderRadius: 16,
    padding: 14, alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  achUnlocked: { borderColor: '#f1c40f', backgroundColor: '#fffdf0' },
  achIcon:     { fontSize: 28, marginBottom: 6 },
  achName:     { fontSize: 12, fontWeight: '800', color: '#2d2d2d', textAlign: 'center' },
  achDesc:     { fontSize: 11, fontWeight: '600', color: '#aaa', textAlign: 'center', marginTop: 2 },

  emailText:   { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 12 },
  logoutBtn: {
    backgroundColor: '#fff3f0', borderWidth: 2, borderColor: '#ffcdd2',
    borderRadius: 14, padding: 13, alignItems: 'center', marginBottom: 10,
  },
  logoutText:  { color: '#ff7043', fontWeight: '800', fontSize: 14 },
  resetBtn: {
    backgroundColor: '#ffecec', borderWidth: 2, borderColor: '#ffcdd2',
    borderRadius: 14, padding: 13, alignItems: 'center',
  },
  resetText:   { color: '#e74c3c', fontWeight: '800', fontSize: 14 },
});

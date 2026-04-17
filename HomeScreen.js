// screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToProfile, subscribeToHabits,
  updateProfile, addHabitToFirestore,
  updateHabit, deleteHabitFromFirestore, addJournalEntry,
} from '../firebase/services';
import {
  LEVELS, MILESTONES, HABIT_EMOJIS, FREQ_OPTIONS,
  getLevel, getLevelData, getXpProgress,
  todayStr, isActiveToday, MOODS,
} from '../constants/gameData';

export default function HomeScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [habits, setHabits]   = useState([]);
  const [mood, setMood]       = useState(MOODS[0]);
  const [habitInput, setHabitInput] = useState('');
  const [selectedFreq, setSelectedFreq] = useState('daily');
  const [birdAnim] = useState(new Animated.Value(0));

  // Realtime listeners
  useEffect(() => {
    if (!user) return;
    const unsubProfile = subscribeToProfile(user.uid, setProfile);
    const unsubHabits  = subscribeToHabits(user.uid, setHabits);
    return () => { unsubProfile(); unsubHabits(); };
  }, [user]);

  // Day change check
  useEffect(() => {
    if (!profile || !user) return;
    const today = todayStr();
    if (profile.lastDate && profile.lastDate !== today) {
      handleNewDay(today);
    }
  }, [profile?.lastDate]);

  // Bird bobbing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(birdAnim, { toValue: -10, duration: 1500, useNativeDriver: true }),
        Animated.timing(birdAnim, { toValue: 0,   duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleNewDay = async (today) => {
    const missed = habits.filter(h => isActiveToday(h, new Date(profile.lastDate)) && h.completedDate !== profile.lastDate);
    const dmg = missed.length * 8;
    const allDone = habits.filter(h => isActiveToday(h, new Date(profile.lastDate))).every(h => h.completedDate === profile.lastDate);
    await updateProfile(user.uid, {
      hp: Math.max(0, (profile.hp || 100) - dmg),
      streak: allDone && habits.length > 0 ? (profile.streak || 0) + 1 : missed.length > 0 ? 0 : profile.streak,
      lastDate: today,
    });
    // Reset doneToday for habits
    for (const h of habits) {
      await updateHabit(user.uid, h.id, { doneToday: false });
    }
  };

  const addHabit = async () => {
    if (!habitInput.trim()) return;
    const emoji = HABIT_EMOJIS[Math.floor(Math.random() * HABIT_EMOJIS.length)];
    await addHabitToFirestore(user.uid, {
      name: habitInput.trim(),
      freq: selectedFreq,
      emoji,
      streak: 0,
      completedDate: null,
      doneToday: false,
      xpReward: 15 + Math.floor(Math.random() * 15),
    });
    setHabitInput('');
    // Set lastDate if first time
    if (!profile?.lastDate) await updateProfile(user.uid, { lastDate: todayStr() });
  };

  const completeHabit = async (habit) => {
    const today = todayStr();
    if (habit.completedDate === today) return;
    const oldLevel = getLevel(profile.xp || 0);
    const newXp    = (profile.xp || 0) + habit.xpReward;
    const newLevel = getLevel(newXp);
    const newHp    = Math.min(100, (profile.hp || 100) + 5);

    await updateHabit(user.uid, habit.id, {
      completedDate: today,
      doneToday: true,
      streak: (habit.streak || 0) + 1,
    });
    await updateProfile(user.uid, {
      xp: newXp,
      hp: newHp,
      totalDone: (profile.totalDone || 0) + 1,
      level: newLevel,
      lastDate: today,
    });
    await addJournalEntry(user.uid, {
      text: `Completed "${habit.name}" ${habit.emoji}`,
      xp: habit.xpReward,
      date: new Date().toLocaleString(),
    });
    await checkUnlocks(newXp, newLevel, habits.length);
    if (newLevel > oldLevel) Alert.alert('🎉 Level Up!', `${profile.birdName} evolved into a ${getLevelData(newLevel).name}!`);
  };

  const failHabit = async (habit) => {
    const newHp = Math.max(0, (profile.hp || 100) - 10);
    await updateHabit(user.uid, habit.id, { streak: 0 });
    await updateProfile(user.uid, {
      hp: newHp,
      lowHpRecovery: newHp < 30 ? (profile.lowHpRecovery || 0) + 1 : profile.lowHpRecovery,
    });
    await addJournalEntry(user.uid, {
      text: `Missed "${habit.name}" ${habit.emoji} — ${profile.birdName} lost 10 HP`,
      xp: 0,
      date: new Date().toLocaleString(),
    });
  };

  const checkUnlocks = async (xp, lv, habitCount) => {
    const s = { ...profile, xp, level: lv };
    const unlocked = profile.unlockedMilestones || [];
    const newUnlocks = [];
    for (const m of MILESTONES) {
      if (!unlocked.includes(m.id) && m.req(s, lv, habitCount)) {
        newUnlocks.push(m.id);
        Alert.alert('🏆 Milestone!', m.name);
      }
    }
    if (newUnlocks.length) {
      await updateProfile(user.uid, { unlockedMilestones: [...unlocked, ...newUnlocks] });
    }
  };

  const petBird = async () => {
    setMood(MOODS[Math.floor(Math.random() * MOODS.length)]);
    await updateProfile(user.uid, { petCount: (profile?.petCount || 0) + 1 });
    Animated.sequence([
      Animated.timing(birdAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
      Animated.timing(birdAnim, { toValue: 5,   duration: 150, useNativeDriver: true }),
      Animated.timing(birdAnim, { toValue: 0,   duration: 150, useNativeDriver: true }),
    ]).start();
  };

  if (!profile) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#ff7043" />
    </View>
  );

  const today    = todayStr();
  const lv       = getLevel(profile.xp || 0);
  const ld       = getLevelData(lv);
  const xpProg   = getXpProgress(profile.xp || 0);
  const todayHabits = habits.filter(h => isActiveToday(h));
  const doneCount   = todayHabits.filter(h => h.completedDate === today).length;

  return (
    <LinearGradient colors={['#b8e4f9', '#d6f0ff', '#fff8f0']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🐦 HabitBird</Text>
          <Text style={styles.dateText}>{new Date().toDateString()}</Text>
        </View>

        {/* Bird Card */}
        <View style={styles.birdCard}>
          <Text style={styles.birdNameText}>{profile.birdName}</Text>
          <Text style={styles.levelText}>Level {lv} · {ld.name}</Text>

          {/* XP Bar */}
          <View style={styles.xpWrap}>
            <View style={styles.xpLabelRow}>
              <Text style={styles.xpLabel}>XP</Text>
              <Text style={styles.xpLabel}>{profile.xp} / {getLevelData(Math.min(lv + 1, LEVELS.length)).minXP}</Text>
            </View>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${Math.round(xpProg.pct * 100)}%` }]} />
            </View>
          </View>

          {/* Bird */}
          <TouchableOpacity onPress={petBird} activeOpacity={0.85}>
            <Animated.Text style={[styles.birdEmoji, { transform: [{ translateY: birdAnim }] }]}>
              {ld.emoji}
            </Animated.Text>
          </TouchableOpacity>
          <Text style={styles.moodText}>{mood}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: '#ffcdd2' }]}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={[styles.statVal, { color: profile.hp > 60 ? '#27ae60' : profile.hp > 30 ? '#e67e22' : '#e74c3c' }]}>
              {Math.round(profile.hp || 100)}
            </Text>
            <Text style={styles.statLabel}>HP</Text>
          </View>
          <View style={[styles.statPill, { borderColor: '#ffe0b2' }]}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={[styles.statVal, { color: '#e67e22' }]}>{profile.streak || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={[styles.statPill, { borderColor: '#c8e6c9' }]}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={[styles.statVal, { color: '#27ae60' }]}>{doneCount}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>

        {/* Add Habit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>➕  Add a Habit</Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="e.g. Drink water, Read 10 min…"
              placeholderTextColor="#bbb"
              value={habitInput}
              onChangeText={setHabitInput}
              onSubmitEditing={addHabit}
              maxLength={40}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addHabit}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.freqRow}>
            {FREQ_OPTIONS.map(f => (
              <TouchableOpacity
                key={f.key}
                style={[styles.freqBtn, selectedFreq === f.key && styles.freqBtnActive]}
                onPress={() => setSelectedFreq(f.key)}
              >
                <Text style={[styles.freqText, selectedFreq === f.key && styles.freqTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Habit List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋  Today's Habits</Text>
          {todayHabits.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🐣</Text>
              <Text style={styles.emptyText}>Add a habit above to start growing {profile.birdName}!</Text>
            </View>
          )}
          {todayHabits.map(h => {
            const done = h.completedDate === today;
            return (
              <View key={h.id} style={[styles.habitCard, done && styles.habitDone]}>
                <Text style={styles.habitEmoji}>{h.emoji}</Text>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitName}>{h.name}</Text>
                  <Text style={styles.habitMeta}>
                    {h.freq === 'daily' ? 'Daily' : h.freq === 'mwf' ? 'M/W/F' : 'Weekend'}
                    {h.streak > 0 ? `  🔥${h.streak}` : ''}
                  </Text>
                </View>
                <View style={styles.habitActions}>
                  <TouchableOpacity
                    style={[styles.checkBtn, done ? styles.checkDone : styles.checkActive]}
                    onPress={() => completeHabit(h)}
                    disabled={done}
                  >
                    <Text style={styles.checkBtnText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.failBtn} onPress={() => failHabit(h)}>
                    <Text style={styles.failBtnText}>✗</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteHabitFromFirestore(user.uid, h.id)}>
                    <Text>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆  Milestones</Text>
          {MILESTONES.map(m => {
            const unlocked = (profile.unlockedMilestones || []).includes(m.id);
            return (
              <View key={m.id} style={[styles.milestone, unlocked && styles.milestoneUnlocked]}>
                <Text style={styles.milestoneIcon}>{m.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.milestoneName}>{m.name}</Text>
                  <Text style={styles.milestoneDesc}>{m.desc}</Text>
                </View>
                <Text style={{ fontSize: 18 }}>{unlocked ? '✅' : '🔒'}</Text>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  loading:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:     { padding: 16, paddingBottom: 100 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logo:       { fontSize: 22, fontWeight: '900', color: '#ff7043' },
  dateText:   { fontSize: 13, fontWeight: '700', color: '#888' },

  birdCard: {
    backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24,
    padding: 20, alignItems: 'center', marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  birdNameText:{ fontSize: 18, fontWeight: '900', color: '#2d2d2d' },
  levelText:   { fontSize: 13, fontWeight: '700', color: '#888', marginTop: 2, marginBottom: 10 },
  xpWrap:      { width: '100%', marginBottom: 12 },
  xpLabelRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  xpLabel:     { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  xpBarBg:     { height: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10, overflow: 'hidden' },
  xpBarFill:   { height: '100%', backgroundColor: '#f1c40f', borderRadius: 10 },
  birdEmoji:   { fontSize: 90, marginVertical: 4 },
  moodText:    { fontSize: 14, fontWeight: '700', color: '#555', marginTop: 6 },

  statsRow:    { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statPill: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 16,
    padding: 12, alignItems: 'center', borderWidth: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statIcon:    { fontSize: 18 },
  statVal:     { fontSize: 20, fontWeight: '900', marginTop: 2 },
  statLabel:   { fontSize: 11, fontWeight: '700', color: '#aaa', marginTop: 1 },

  section: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 24,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
  },
  sectionTitle:{ fontSize: 15, fontWeight: '800', color: '#2d2d2d', marginBottom: 12 },

  addRow:      { flexDirection: 'row', gap: 8, marginBottom: 10 },
  addInput: {
    flex: 1, borderWidth: 2, borderColor: '#eee', borderRadius: 14,
    padding: 12, fontSize: 14, fontWeight: '600', color: '#2d2d2d', backgroundColor: '#fafafa',
  },
  addBtn: {
    backgroundColor: '#ff7043', borderRadius: 14, width: 48, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#ff7043', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  addBtnText:  { color: '#fff', fontSize: 24, fontWeight: '900', lineHeight: 28 },

  freqRow:     { flexDirection: 'row', gap: 8 },
  freqBtn: {
    flex: 1, borderWidth: 2, borderColor: '#eee', borderRadius: 10,
    paddingVertical: 7, alignItems: 'center', backgroundColor: '#fafafa',
  },
  freqBtnActive: { borderColor: '#ff7043', backgroundColor: '#fff3f0' },
  freqText:    { fontSize: 12, fontWeight: '700', color: '#aaa' },
  freqTextActive: { color: '#ff7043' },

  habitCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 16, padding: 12,
    marginBottom: 10, borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  habitDone:   { borderColor: '#27ae60', backgroundColor: '#f0fff4' },
  habitEmoji:  { fontSize: 26, width: 40, textAlign: 'center' },
  habitInfo:   { flex: 1 },
  habitName:   { fontSize: 14, fontWeight: '800', color: '#2d2d2d' },
  habitMeta:   { fontSize: 12, fontWeight: '600', color: '#aaa', marginTop: 2 },
  habitActions:{ flexDirection: 'row', gap: 6 },
  checkBtn:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  checkActive: { backgroundColor: '#27ae60', shadowColor: '#27ae60', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  checkDone:   { backgroundColor: '#e0e0e0' },
  checkBtnText:{ color: '#fff', fontWeight: '900', fontSize: 16 },
  failBtn:     { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e74c3c' },
  failBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  deleteBtn:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },

  emptyState:  { alignItems: 'center', paddingVertical: 20 },
  emptyEmoji:  { fontSize: 36, marginBottom: 8 },
  emptyText:   { fontSize: 14, fontWeight: '600', color: '#aaa', textAlign: 'center' },

  milestone: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fafafa', borderRadius: 14, padding: 12,
    marginBottom: 8, borderWidth: 2, borderColor: 'transparent',
  },
  milestoneUnlocked: { borderColor: '#f1c40f', backgroundColor: '#fffbea' },
  milestoneIcon:     { fontSize: 24, width: 32, textAlign: 'center' },
  milestoneName:     { fontSize: 13, fontWeight: '800', color: '#2d2d2d' },
  milestoneDesc:     { fontSize: 12, fontWeight: '600', color: '#aaa', marginTop: 1 },
});

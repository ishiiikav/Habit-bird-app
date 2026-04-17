// screens/JournalScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { subscribeToJournal } from '../firebase/services';

export default function JournalScreen() {
  const { user }   = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToJournal(user.uid, (data) => {
      setEntries(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  if (loading) return (
    <View style={styles.loading}><ActivityIndicator size="large" color="#ff7043" /></View>
  );

  return (
    <LinearGradient colors={['#b8e4f9', '#d6f0ff', '#fff8f0']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📓 Journey Log</Text>
        <Text style={styles.sub}>{entries.length} entries</Text>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyText}>Complete habits to write your story!</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.entry}>
              <Text style={styles.entryDate}>{item.date}</Text>
              <Text style={styles.entryText}>{item.text}</Text>
              {item.xp > 0 && (
                <View style={styles.xpBadge}>
                  <Text style={styles.xpBadgeText}>+{item.xp} XP</Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  loading:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:      { padding: 20, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:       { fontSize: 22, fontWeight: '900', color: '#2d2d2d' },
  sub:         { fontSize: 13, fontWeight: '700', color: '#aaa' },
  list:        { padding: 16, paddingTop: 0, paddingBottom: 100 },
  entry: {
    backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: 16,
    padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#ff7043',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  entryDate:   { fontSize: 11, fontWeight: '700', color: '#aaa', marginBottom: 4 },
  entryText:   { fontSize: 14, fontWeight: '600', color: '#2d2d2d' },
  xpBadge:     { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#fff3f0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  xpBadgeText: { fontSize: 12, fontWeight: '800', color: '#ff7043' },
  emptyState:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji:  { fontSize: 48, marginBottom: 12 },
  emptyText:   { fontSize: 15, fontWeight: '600', color: '#aaa' },
});

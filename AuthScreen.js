// screens/AuthScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { registerUser, loginUser } from '../firebase/services';

export default function AuthScreen() {
  const [mode, setMode]         = useState('login'); // 'login' | 'register'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [birdName, setBirdName] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return Alert.alert('Missing fields', 'Please enter email and password.');
    if (mode === 'register' && !birdName) return Alert.alert('Name your bird!', 'Give your bird a name first 🐦');
    setLoading(true);
    try {
      if (mode === 'register') {
        await registerUser(email, password, birdName);
      } else {
        await loginUser(email, password);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={['#b8e4f9', '#d6f0ff', '#fff8f0']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <Text style={styles.logo}>🐦 HabitBird</Text>
          <Text style={styles.tagline}>Build habits. Grow your bird.</Text>

          {/* Bird emoji */}
          <Text style={styles.birdEmoji}>
            {mode === 'login' ? '🐦' : '🥚'}
          </Text>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {mode === 'login' ? 'Welcome back!' : 'Start your journey'}
            </Text>

            {mode === 'register' && (
              <TextInput
                style={styles.input}
                placeholder="Name your bird 🐦"
                placeholderTextColor="#bbb"
                value={birdName}
                onChangeText={setBirdName}
                maxLength={20}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#bbb"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>{mode === 'login' ? 'Login' : 'Create Account'}</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')} style={styles.switchBtn}>
              <Text style={styles.switchText}>
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  inner:      { flex: 1 },
  scroll:     { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo:       { fontSize: 32, fontWeight: '900', color: '#ff7043', marginBottom: 4 },
  tagline:    { fontSize: 15, color: '#888', fontWeight: '600', marginBottom: 16 },
  birdEmoji:  { fontSize: 72, marginBottom: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24, padding: 24, width: '100%',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 8,
  },
  cardTitle:  { fontSize: 20, fontWeight: '800', color: '#2d2d2d', marginBottom: 18, textAlign: 'center' },
  input: {
    borderWidth: 2, borderColor: '#eee', borderRadius: 14,
    padding: 14, fontSize: 15, marginBottom: 12,
    backgroundColor: '#fafafa', color: '#2d2d2d', fontWeight: '600',
  },
  btn: {
    backgroundColor: '#ff7043', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 4,
    shadowColor: '#ff7043', shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  btnText:    { color: '#fff', fontWeight: '800', fontSize: 16 },
  switchBtn:  { marginTop: 16, alignItems: 'center' },
  switchText: { color: '#ff7043', fontWeight: '700', fontSize: 14 },
});

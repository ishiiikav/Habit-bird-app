// firebase/services.js
// All Firebase Auth + Firestore + Realtime operations

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from './config';

// ─── AUTH ───────────────────────────────────────────────

export const registerUser = async (email, password, birdName = 'Pip') => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Create user profile doc in Firestore
  await setDoc(doc(db, 'users', cred.user.uid), {
    birdName,
    xp: 0,
    level: 1,
    hp: 100,
    streak: 0,
    totalDone: 0,
    petCount: 0,
    lowHpRecovery: 0,
    lastDate: null,
    unlockedMilestones: [],
    unlockedAchievements: [],
    createdAt: serverTimestamp(),
  });
  return cred.user;
};

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

export const onAuthChange = (callback) =>
  onAuthStateChanged(auth, callback);

// ─── USER PROFILE (REALTIME) ────────────────────────────

// Subscribe to user profile in real time
export const subscribeToProfile = (uid, callback) => {
  const ref = doc(db, 'users', uid);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
};

export const updateProfile = (uid, data) =>
  updateDoc(doc(db, 'users', uid), data);

// ─── HABITS (REALTIME) ──────────────────────────────────

// Subscribe to habits collection in real time
export const subscribeToHabits = (uid, callback) => {
  const ref = collection(db, 'users', uid, 'habits');
  const q = query(ref, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const habits = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(habits);
  });
};

export const addHabitToFirestore = (uid, habit) =>
  addDoc(collection(db, 'users', uid, 'habits'), {
    ...habit,
    createdAt: serverTimestamp(),
  });

export const updateHabit = (uid, habitId, data) =>
  updateDoc(doc(db, 'users', uid, 'habits', habitId), data);

export const deleteHabitFromFirestore = (uid, habitId) =>
  deleteDoc(doc(db, 'users', uid, 'habits', habitId));

// ─── JOURNAL (REALTIME) ─────────────────────────────────

export const subscribeToJournal = (uid, callback) => {
  const ref = collection(db, 'users', uid, 'journal');
  const q = query(ref, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(entries);
  });
};

export const addJournalEntry = (uid, entry) =>
  addDoc(collection(db, 'users', uid, 'journal'), {
    ...entry,
    createdAt: serverTimestamp(),
  });

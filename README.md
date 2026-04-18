
---

**Project Title:** HabitBird — Gamified Habit Tracker (Mobile App)

**Tagline:** A Finch-inspired cross-platform mobile app where your habits grow a virtual bird.

---

**What It Does**

HabitBird is a full-stack mobile application that turns daily habits into a pet-raising game. Users create an account, add habits, and complete them every day to earn XP and evolve their bird. Miss habits and the bird loses HP. Every action syncs to the cloud in real time — so progress is never lost and works across devices.

---

**Core Features**

- **User Authentication** — Full email and password Sign Up and Login powered by Firebase Authentication. Sessions persist automatically so users stay logged in. Secure per-user data isolation in Firestore
- **Living Pet System** — Bird evolves across 8 stages: Egg → Hatchling → Chick → Fledgling → Sparrow → Robin → Falcon → Phoenix → Legend. Each stage has a unique emoji that updates live as XP grows
- **Habit Management** — Add, complete, or delete habits with custom frequency: Daily, Mon/Wed/Fri, or Weekends only. Each habit gets a randomly assigned emoji and its own XP reward
- **XP and Leveling** — Every completed habit earns XP. Level up triggers a celebration alert. Each level requires progressively more XP with 8 total stages
- **HP Mechanic** — Bird gains HP on completion, loses HP on missed habits. Creates real consequences and urgency
- **Streak Tracking** — Per-habit fire streaks plus an overall daily streak counter
- **Day Change Detection** — App detects when a new day starts on next open, applies missed-habit damage automatically, and resets daily progress
- **Milestone System** — 6 unlockable milestones tied to real progress: first habit, 3-day streak, 7-day streak, Level 3, 5+ habits, 50 total completions
- **Cloud Sync in Real Time** — All habits, profile stats, and journal entries sync instantly across devices using Firestore onSnapshot listeners. No refresh needed
- **Journey Log** — Auto-written diary that logs every habit completed or missed with timestamps and XP earned, updated in real time
- **Bird Interaction** — Tap your bird for randomised mood messages with bounce animation
- **Rename Your Bird** — Personalised experience, name syncs to Firestore and persists across logins
- **Cross-Platform** — Single codebase runs on iOS, Android, and Web via Expo

---

**Screens**

1. **Auth Screen** — Email and password Login and Sign Up, animated bird egg, switches between modes smoothly
2. **Home Screen** — Animated bird with XP bar, HP/Streak/Done stats, add habit form with frequency selector, today's habit list with complete/fail/delete actions, milestones panel
3. **Journal Screen** — Real-time Firestore feed of all activity, timestamps, XP earned per entry
4. **Profile Screen** — Bird overview with total stats, rename bird, achievement gallery, logout and reset options

---

**Languages and Technologies**

| Technology | Usage |
|---|---|
| React Native | Cross-platform mobile UI for iOS, Android and Web |
| Expo | Build tooling, LinearGradient, vector icons, QR preview |
| JavaScript ES6+ | All app logic, game mechanics, state management |
| Firebase Authentication | Email/password auth, session persistence, onAuthStateChanged |
| Cloud Firestore | NoSQL cloud database, per-user collections, security rules |
| Firestore onSnapshot | Real-time listeners for habits, profile and journal |
| React Navigation | Bottom tab navigator and native stack navigator |
| React Context API | Global auth state shared across all screens |
| React Native Animated API | Bird bounce animation, XP bar transitions |
| StyleSheet API | CSS-in-JS component styling |

---

**Technical Highlights**

- Firebase Authentication with `createUserWithEmailAndPassword` and `signInWithEmailAndPassword` — secure login with automatic session persistence via `onAuthStateChanged`
- Firestore real-time listeners using `onSnapshot` — habits, profile, and journal all update live without any manual refresh or polling
- Firestore security rules enforce that users can only read and write their own data — complete data isolation per account
- Game loop built from scratch — XP thresholds, level gating, HP damage and heal system, streak tracking, all driven by pure JavaScript logic
- Day-change detection compares stored date string to today on every app open and automatically applies missed-habit penalties and streak updates
- React Context API wraps the entire app in an `AuthProvider` so any screen can access the current user without prop drilling
- Subcollection architecture in Firestore — each user has their own `habits` and `journal` subcollections, keeping data clean and scalable
- Cross-platform from a single codebase — iOS, Android, and Web with no platform-specific code
- Component-level separation — Auth, Home, Journal, Profile are fully independent screen components

---

**What It Demonstrates**

Full-stack mobile development · Firebase backend integration · Real-time database architecture · User authentication and session management · Game design logic · Cross-platform development · React Native UI · Clean component architecture · NoSQL data modelling · Security rules

// constants/gameData.js

export const LEVELS = [
  { name: 'Hatchling', emoji: '🥚', minXP: 0,    maxXP: 100  },
  { name: 'Chick',     emoji: '🐣', minXP: 100,   maxXP: 250  },
  { name: 'Fledgling', emoji: '🐤', minXP: 250,   maxXP: 500  },
  { name: 'Sparrow',   emoji: '🐦', minXP: 500,   maxXP: 800  },
  { name: 'Robin',     emoji: '🦜', minXP: 800,   maxXP: 1200 },
  { name: 'Falcon',    emoji: '🦅', minXP: 1200,  maxXP: 1800 },
  { name: 'Phoenix',   emoji: '🦚', minXP: 1800,  maxXP: 2500 },
  { name: 'Legend',    emoji: '✨', minXP: 2500,  maxXP: 9999 },
];

export const MILESTONES = [
  { id: 'first',    name: 'First Step',    desc: 'Complete your first habit',  icon: '👣', req: (s) => s.totalDone >= 1         },
  { id: 'streak3',  name: 'On a Roll',     desc: '3 day streak',               icon: '🔥', req: (s) => s.streak >= 3            },
  { id: 'streak7',  name: 'Week Warrior',  desc: '7 day streak',               icon: '⚔️', req: (s) => s.streak >= 7            },
  { id: 'level3',   name: 'Growing Up',    desc: 'Reach Level 3',              icon: '🌱', req: (s, lv) => lv >= 3              },
  { id: 'habits5',  name: 'Habit Hoarder', desc: 'Have 5+ habits',             icon: '📋', req: (s, lv, habits) => habits >= 5  },
  { id: 'done50',   name: 'Half Century',  desc: 'Complete 50 habits total',   icon: '🏆', req: (s) => s.totalDone >= 50        },
];

export const ACHIEVEMENTS = [
  { id: 'pet10',    name: 'Lovebug',       desc: 'Pet your bird 10 times',     icon: '💕', req: (s) => s.petCount >= 10         },
  { id: 'phoenix',  name: 'Phoenix',       desc: 'Reach max level',            icon: '🔥', req: (s, lv) => lv >= 8              },
  { id: 'comeback', name: 'Comeback Kid',  desc: 'Recover from low HP',        icon: '💪', req: (s) => s.lowHpRecovery >= 1     },
  { id: 'streak14', name: 'Fortnight',     desc: '14 day streak',              icon: '📅', req: (s) => s.streak >= 14           },
];

export const MOODS = [
  '✨ Tap me to say hi!',
  '💕 I love you!',
  '🎵 La la la~',
  '😴 Nap time soon…',
  '🌟 You\'re amazing!',
  '🍎 Feed me habits!',
  '💪 We can do this!',
  '🌈 Today is great!',
];

export const HABIT_EMOJIS = ['🏃','💧','📚','🧘','🍎','💪','🎨','🎵','🌿','☀️','🛌','✍️','🧠','🚴','🌊'];

export const FREQ_OPTIONS = [
  { key: 'daily',   label: 'Daily'    },
  { key: 'mwf',     label: 'M/W/F'   },
  { key: 'weekend', label: 'Weekend'  },
];

export const getLevel = (xp) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return i + 1;
  }
  return 1;
};

export const getLevelData = (lv) => LEVELS[Math.min(lv - 1, LEVELS.length - 1)];

export const getXpProgress = (xp) => {
  const lv = getLevel(xp);
  const ld = getLevelData(lv);
  const nd = getLevelData(Math.min(lv + 1, LEVELS.length));
  const progress = xp - ld.minXP;
  const needed = nd.minXP - ld.minXP;
  return { pct: Math.min(1, progress / needed), progress, needed };
};

export const todayStr = () => new Date().toISOString().slice(0, 10);

export const isActiveToday = (habit, dateObj = new Date()) => {
  const day = dateObj.getDay();
  if (habit.freq === 'daily')   return true;
  if (habit.freq === 'mwf')     return [1, 3, 5].includes(day);
  if (habit.freq === 'weekend') return [0, 6].includes(day);
  return true;
};

const STORAGE_KEY = 'solvix_user_data';

export function getUserData(username) {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const allUsers = JSON.parse(data);
    return allUsers[username] || null;
  } catch (e) {
    console.error('Error reading user data:', e);
    return null;
  }
}

export function saveUserData(username, userData) {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const allUsers = data ? JSON.parse(data) : {};
    allUsers[username] = {
      ...allUsers[username],
      ...userData,
      lastActive: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers));
    return true;
  } catch (e) {
    console.error('Error saving user data:', e);
    return false;
  }
}

export function getAllUsers() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const allUsers = JSON.parse(data);
    return Object.keys(allUsers).map(username => ({
      username,
      lastActive: allUsers[username].lastActive,
    })).sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
  } catch (e) {
    console.error('Error reading users:', e);
    return [];
  }
}

export function getCurrentUser() {
  const currentUser = localStorage.getItem('solvix_current_user');
  return currentUser || null;
}

export function setCurrentUser(username) {
  localStorage.setItem('solvix_current_user', username);
}

export function initializeUserData(username) {
  const existingData = getUserData(username);
  if (existingData) return existingData;
  
  const defaultData = {
    username,
    stats: {
      math: { attempts: 0, bestScore: 0, totalTime: 0, questionProgress: {} },
      biology: { attempts: 0, bestScore: 0, totalTime: 0, questionProgress: {} },
      english: { attempts: 0, bestScore: 0, totalTime: 0, questionProgress: {} },
    },
    streak: { current: 0, lastPractice: null, longest: 0 },
    settings: { darkMode: false, soundEnabled: true },
    achievements: [],
  };
  
  saveUserData(username, defaultData);
  return defaultData;
}

export function updateUserStats(username, subject, quizResult) {
  const userData = getUserData(username);
  if (!userData) return false;
  
  const subjectStats = userData.stats[subject];
  
  const questionProgress = { ...subjectStats.questionProgress };
  quizResult.questionResults.forEach(result => {
    questionProgress[result.questionId] = result.progress;
  });
  
  subjectStats.attempts = (subjectStats.attempts || 0) + 1;
  subjectStats.bestScore = Math.max(subjectStats.bestScore || 0, quizResult.score);
  subjectStats.totalTime = (subjectStats.totalTime || 0) + quizResult.timeTaken;
  subjectStats.questionProgress = questionProgress;
  
  const today = new Date().toDateString();
  const lastPractice = userData.streak?.lastPractice;
  
  if (lastPractice) {
    const lastDate = new Date(lastPractice).toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastDate === yesterday) {
      userData.streak.current = (userData.streak.current || 0) + 1;
    } else if (lastDate !== today) {
      userData.streak.current = 1;
    }
  } else {
    userData.streak.current = 1;
  }
  
  userData.streak.lastPractice = new Date().toISOString();
  userData.streak.longest = Math.max(userData.streak.longest || 0, userData.streak.current);
  
  return saveUserData(username, userData);
}

export function getLeaderboard(subject = null, limit = 10) {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const allUsers = JSON.parse(data);
    const currentUser = getCurrentUser();
    
    const leaderboard = Object.entries(allUsers)
      .map(([username, userData]) => {
        let score;
        if (subject) {
          score = userData.stats?.[subject]?.bestScore || 0;
        } else {
          score = Object.values(userData.stats || {}).reduce(
            (acc, s) => acc + (s.bestScore || 0), 
            0
          );
        }
        
        const attempts = subject 
          ? userData.stats?.[subject]?.attempts || 0
          : Object.values(userData.stats || {}).reduce((acc, s) => acc + (s.attempts || 0), 0);
        
        return {
          username,
          score,
          attempts,
          streak: userData.streak?.current || 0,
          isCurrentUser: username === currentUser,
          lastActive: userData.lastActive,
        };
      })
      .filter(entry => entry.attempts > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.streak - a.streak;
      })
      .slice(0, limit);
    
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  } catch (e) {
    console.error('Error getting leaderboard:', e);
    return [];
  }
}

export function getUserRank(username, subject = null) {
  const leaderboard = getLeaderboard(subject);
  const userEntry = leaderboard.find(entry => entry.username === username);
  return userEntry ? userEntry.rank : null;
}

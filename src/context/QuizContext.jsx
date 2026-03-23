import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { questions } from '../data/questions';
import { 
  selectQuestionsForReview, 
  updateQuestionProgress, 
  calculateMasteryLevel 
} from '../utils/spacedRepetition';
import { 
  getUserData, 
  saveUserData, 
  getAllUsers, 
  getCurrentUser, 
  setCurrentUser,
  initializeUserData,
  updateUserStats 
} from '../utils/storage';

const QuizContext = createContext(null);

const initialState = {
  // User state
  currentUser: null,
  isLoggedIn: false,
  allUsers: [],
  
  // Quiz state
  screen: 'start', // 'start', 'quiz', 'results', 'analytics'
  mode: 'quiz', // 'quiz', 'practice', 'review'
  subject: null,
  difficulty: 'adaptive',
  
  // Quiz progress
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: {},
  flaggedQuestions: [],
  startTime: null,
  timeRemaining: 420,
  
  // Results
  results: null,
  
  // UI state
  showFeedback: false,
  selectedAnswer: null,
  isAnswerSubmitted: false,
};

function quizReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload, isLoggedIn: !!action.payload };
    
    case 'SET_ALL_USERS':
      return { ...state, allUsers: action.payload };
    
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };
    
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    
    case 'SET_SUBJECT':
      return { ...state, subject: action.payload };
    
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload };
    
    case 'START_QUIZ':
      return {
        ...state,
        screen: 'quiz',
        questions: action.payload.questions,
        currentQuestionIndex: 0,
        userAnswers: {},
        flaggedQuestions: [],
        startTime: Date.now(),
        timeRemaining: action.payload.timeLimit || 420,
        results: null,
        showFeedback: state.mode === 'practice',
      };
    
    case 'SELECT_ANSWER':
      return { ...state, selectedAnswer: action.payload };
    
    case 'SUBMIT_ANSWER':
      return { 
        ...state, 
        userAnswers: { 
          ...state.userAnswers, 
          [state.currentQuestionIndex]: action.payload 
        },
        isAnswerSubmitted: true,
        showFeedback: state.mode === 'practice',
      };
    
    case 'NEXT_QUESTION':
      return { 
        ...state, 
        currentQuestionIndex: state.currentQuestionIndex + 1,
        selectedAnswer: null,
        isAnswerSubmitted: false,
        showFeedback: state.mode === 'practice',
      };
    
    case 'PREV_QUESTION':
      return { 
        ...state, 
        currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
        selectedAnswer: state.userAnswers[state.currentQuestionIndex - 1] ?? null,
        isAnswerSubmitted: state.userAnswers[state.currentQuestionIndex - 1] !== undefined,
        showFeedback: state.mode === 'practice',
      };
    
    case 'TOGGLE_FLAG':
      const flagged = state.flaggedQuestions.includes(action.payload)
        ? state.flaggedQuestions.filter(i => i !== action.payload)
        : [...state.flaggedQuestions, action.payload];
      return { ...state, flaggedQuestions: flagged };
    
    case 'UPDATE_TIMER':
      return { ...state, timeRemaining: action.payload };
    
    case 'SET_RESULTS':
      return { ...state, screen: 'results', results: action.payload };
    
    case 'RESET_QUIZ':
      return {
        ...state,
        screen: 'start',
        questions: [],
        currentQuestionIndex: 0,
        userAnswers: {},
        flaggedQuestions: [],
        startTime: null,
        timeRemaining: 420,
        results: null,
        showFeedback: false,
        selectedAnswer: null,
        isAnswerSubmitted: false,
      };
    
    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  
  // Load users on mount
  useEffect(() => {
    const users = getAllUsers();
    dispatch({ type: 'SET_ALL_USERS', payload: users });
    
    const currentUser = getCurrentUser();
    if (currentUser) {
      const userData = getUserData(currentUser);
      if (userData) {
        dispatch({ type: 'SET_USER', payload: userData });
      }
    }
  }, []);
  
  // Save user data when it changes
  useEffect(() => {
    if (state.currentUser) {
      saveUserData(state.currentUser.username, state.currentUser);
    }
  }, [state.currentUser]);
  
  const login = useCallback((username) => {
    const userData = initializeUserData(username);
    setCurrentUser(username);
    dispatch({ type: 'SET_USER', payload: userData });
    const users = getAllUsers();
    dispatch({ type: 'SET_ALL_USERS', payload: users });
  }, []);
  
  const logout = useCallback(() => {
    localStorage.removeItem('solvix_current_user');
    dispatch({ type: 'SET_USER', payload: null });
  }, []);
  
  const switchUser = useCallback((username) => {
    const userData = getUserData(username);
    if (userData) {
      setCurrentUser(username);
      dispatch({ type: 'SET_USER', payload: userData });
    }
  }, []);
  
  const startQuiz = useCallback((options = {}) => {
    const { mode = 'quiz', subject, difficulty = 'adaptive' } = options;
    
    dispatch({ type: 'SET_MODE', payload: mode });
    dispatch({ type: 'SET_SUBJECT', payload: subject });
    dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
    
    const subjectQuestions = questions[subject];
    const userProgress = state.currentUser?.stats[subject]?.questionProgress || {};
    
    let selectedQuestions;
    let timeLimit = 420; // 7 minutes
    
    if (mode === 'review') {
      // Review mode: show questions user got wrong recently
      const wrongQuestions = subjectQuestions.filter(q => {
        const progress = userProgress[q.id];
        return progress && progress.mistakes > 0;
      });
      selectedQuestions = wrongQuestions.slice(0, 15);
      timeLimit = selectedQuestions.length * 60; // 1 minute per question
    } else if (mode === 'practice') {
      // Practice mode: no time limit, can be longer
      selectedQuestions = subjectQuestions.slice(0, 20);
      timeLimit = 0; // No time limit
    } else {
      // Quiz mode: use spaced repetition
      selectedQuestions = selectQuestionsForReview(subjectQuestions, userProgress, 15);
      
      if (difficulty === 'easy') timeLimit = 600;
      else if (difficulty === 'medium') timeLimit = 420;
      else if (difficulty === 'hard') timeLimit = 300;
    }
    
    dispatch({
      type: 'START_QUIZ',
      payload: { questions: selectedQuestions, timeLimit },
    });
  }, [state.currentUser]);
  
  const selectAnswer = useCallback((answerIndex) => {
    dispatch({ type: 'SELECT_ANSWER', payload: answerIndex });
  }, []);
  
  const submitAnswer = useCallback(() => {
    if (state.selectedAnswer === null) return;
    
    dispatch({ type: 'SUBMIT_ANSWER', payload: state.selectedAnswer });
    
    // Update progress for spaced repetition (only in quiz mode)
    if (state.mode === 'quiz' && state.currentUser && state.subject) {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const isCorrect = state.selectedAnswer === currentQuestion.correct;
      
      const currentProgress = state.currentUser.stats[state.subject]?.questionProgress?.[currentQuestion.id] || {};
      const newProgress = updateQuestionProgress(currentQuestion.id, isCorrect, currentProgress);
      
      // Update user stats
      const updatedStats = {
        ...state.currentUser.stats,
        [state.subject]: {
          ...state.currentUser.stats[state.subject],
          questionProgress: {
            ...state.currentUser.stats[state.subject]?.questionProgress,
            [currentQuestion.id]: newProgress,
          },
        },
      };
      
      dispatch({
        type: 'SET_USER',
        payload: { ...state.currentUser, stats: updatedStats },
      });
    }
  }, [state.selectedAnswer, state.mode, state.currentUser, state.subject, state.questions, state.currentQuestionIndex]);
  
  const nextQuestion = useCallback(() => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      dispatch({ type: 'NEXT_QUESTION' });
    } else {
      finishQuiz();
    }
  }, [state.currentQuestionIndex, state.questions.length]);
  
  const prevQuestion = useCallback(() => {
    dispatch({ type: 'PREV_QUESTION' });
  }, []);
  
  const toggleFlag = useCallback((index = state.currentQuestionIndex) => {
    dispatch({ type: 'TOGGLE_FLAG', payload: index });
  }, [state.currentQuestionIndex]);
  
  const finishQuiz = useCallback(() => {
    const { questions, userAnswers, startTime, subject, mode } = state;
    
    let score = 0;
    const topicStats = {};
    const questionResults = [];
    
    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.correct;
      
      if (isCorrect) score++;
      
      topicStats[question.topic] = topicStats[question.topic] || { correct: 0, total: 0 };
      topicStats[question.topic].total++;
      if (isCorrect) topicStats[question.topic].correct++;
      
      questionResults.push({
        questionId: question.id,
        topic: question.topic,
        userAnswer,
        correctAnswer: question.correct,
        isCorrect,
        progress: state.currentUser?.stats[subject]?.questionProgress?.[question.id] || {},
      });
    });
    
    const results = {
      score,
      total: questions.length,
      accuracy: Math.round((score / questions.length) * 100),
      timeTaken: Math.round((Date.now() - startTime) / 1000),
      topicStats,
      questionResults,
      mode,
      subject,
    };
    
    // Save stats
    if (state.currentUser && mode !== 'practice') {
      updateUserStats(state.currentUser.username, subject, results);
      // Refresh user data
      const updatedUser = getUserData(state.currentUser.username);
      if (updatedUser) {
        dispatch({ type: 'SET_USER', payload: updatedUser });
      }
    }
    
    dispatch({ type: 'SET_RESULTS', payload: results });
  }, [state]);
  
  const goToScreen = useCallback((screen) => {
    dispatch({ type: 'SET_SCREEN', payload: screen });
  }, []);
  
  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET_QUIZ' });
  }, []);
  
  const getMasteryLevels = useCallback((subject) => {
    const progress = state.currentUser?.stats[subject]?.questionProgress || {};
    const mastery = {};
    
    Object.entries(progress).forEach(([questionId, data]) => {
      mastery[questionId] = calculateMasteryLevel(data);
    });
    
    return mastery;
  }, [state.currentUser]);
  
  const value = {
    ...state,
    login,
    logout,
    switchUser,
    startQuiz,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    prevQuestion,
    toggleFlag,
    finishQuiz,
    goToScreen,
    resetQuiz,
    getMasteryLevels,
  };
  
  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}

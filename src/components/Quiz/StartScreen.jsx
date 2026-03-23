import { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { subjects } from '../../data/questions';
import { Button, Card, Badge, Avatar, Modal } from '../UI';
import { calculateMasteryLevel } from '../../utils/spacedRepetition';

function getSubjectMasteryPercent(subjectId, currentUser) {
  const progress = currentUser?.stats[subjectId]?.questionProgress || {};
  const total = Object.keys(progress).length;
  if (total === 0) return 0;
  
  const sum = Object.values(progress).reduce((acc, val) => acc + calculateMasteryLevel(val), 0);
  return (sum / (total * 5)) * 100;
}

export function StartScreen() {
  const { 
    currentUser, 
    isLoggedIn, 
    allUsers, 
    login, 
    logout, 
    switchUser, 
    startQuiz,
    goToScreen,
  } = useQuiz();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedMode, setSelectedMode] = useState('quiz');
  
  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim());
      setShowLoginModal(false);
      setUsername('');
    }
  };
  
  const handleStartQuiz = () => {
    if (selectedSubject) {
      startQuiz({ mode: selectedMode, subject: selectedSubject });
    }
  };
  
  const totalAttempts = currentUser 
    ? Object.values(currentUser.stats).reduce((acc, s) => acc + (s.attempts || 0), 0)
    : 0;
  
  const bestScores = currentUser
    ? Object.entries(currentUser.stats).reduce((acc, [subject, stats]) => {
        acc[subject] = stats.bestScore || 0;
        return acc;
      }, {})
    : {};
  
  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-2xl flex items-center justify-center shadow-xl shadow-accent/30">
              <span className="text-2xl sm:text-3xl">🎯</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-text-primary">
              Solvix
            </h1>
          </div>
          <p className="text-sm sm:text-xl text-text-secondary max-w-2xl mx-auto px-4">
            Master any subject with intelligent spaced repetition
          </p>
        </header>
        
        {/* User Section */}
        <div className="mb-5 sm:mb-8">
          {isLoggedIn ? (
            <div className="space-y-3">
              {/* User Card */}
              <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar name={currentUser.username} size="md" />
                <div className="flex-1 min-w-0 w-full">
                  <h3 className="font-bold text-text-primary truncate">{currentUser.username}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-text-muted mt-1">
                    <span className="flex items-center gap-1">
                      <span className="text-accent">🔥</span> {currentUser.streak?.current || 0} streak
                    </span>
                    <span>•</span>
                    <span>{totalAttempts} quizzes</span>
                  </div>
                </div>
              </Card>
              
              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button 
                  variant="primary" 
                  onClick={() => goToScreen('analytics')}
                  className="text-sm sm:text-base py-3 sm:py-3 items-center justify-center"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="ml-1.5 sm:ml-2">My Progress</span>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="text-sm sm:text-base py-3 sm:py-0 text-text-muted"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={() => setShowLoginModal(true)} size="lg" className="w-full sm:w-auto text-base">
                Start Learning
              </Button>
              {allUsers.length > 0 && (
                <div className="relative w-full sm:w-auto">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                    className="w-full sm:w-auto text-base"
                  >
                    Switch User
                  </Button>
                  {showUserSwitcher && (
                    <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 mt-2 bg-card border border-subtle rounded-xl shadow-xl py-2 min-w-[200px] z-50">
                      {allUsers.map(user => (
                        <button
                          key={user.username}
                          onClick={() => {
                            switchUser(user.username);
                            setShowUserSwitcher(false);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-card-hover flex items-center gap-3 transition-colors"
                        >
                          <Avatar name={user.username} size="sm" />
                          <span className="text-text-primary">{user.username}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Mode Selection */}
        <div className="mb-5 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-text-secondary">Choose Mode</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'quiz', label: 'Quiz', icon: '⚡', desc: 'Timed, no feedback', color: 'bg-blue-500' },
              { id: 'practice', label: 'Practice', icon: '📝', desc: 'With hints & feedback', color: 'bg-emerald-500' },
              { id: 'review', label: 'Review', icon: '🔄', desc: 'Focus on weak areas', color: 'bg-orange-500' },
            ].map(mode => (
              <Card
                key={mode.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedMode === mode.id 
                    ? 'border-accent shadow-lg shadow-accent/20' 
                    : 'border-subtle hover:border-subtle-hover'
                }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${mode.color} flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3`}>
                  {mode.icon}
                </div>
                <h3 className="font-semibold text-text-primary text-sm sm:text-base">{mode.label}</h3>
                <p className="text-xs text-text-muted mt-1">{mode.desc}</p>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Subject Selection */}
        <div className="mb-5 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-text-secondary">Select Subject</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {subjects.map(subject => (
              <Card
                key={subject.id}
                className={`p-5 sm:p-6 cursor-pointer transition-all overflow-hidden relative ${
                  selectedSubject === subject.id 
                    ? 'border-accent shadow-lg shadow-accent/20' 
                    : 'border-subtle hover:border-subtle-hover'
                }`}
                onClick={() => setSelectedSubject(subject.id)}
              >
                <div className={`absolute -top-10 -right-10 w-28 h-28 ${subject.color.replace('from-', 'bg-').split(' ')[0]} opacity-10 rounded-full`} />
                
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${subject.color.replace('from-', 'bg-').split(' ')[0]} flex items-center justify-center text-2xl sm:text-3xl mb-4 shadow-lg`}>
                  {subject.icon}
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1">{subject.name}</h3>
                <p className="text-xs sm:text-sm text-text-muted mb-4">{subject.description}</p>
                
                {isLoggedIn && bestScores[subject.id] > 0 && (
                  <div className="mb-3">
                    <Badge variant="success" className="text-xs">
                      Best: {bestScores[subject.id]}/15
                    </Badge>
                  </div>
                )}
                
                {isLoggedIn && selectedSubject === subject.id && (
                  <div className="pt-4 border-t border-subtle">
                    <div className="flex justify-between text-xs text-text-muted mb-1.5">
                      <span>Mastery</span>
                      <span className="font-medium text-text-primary">{Math.round(getSubjectMasteryPercent(subject.id, currentUser))}%</span>
                    </div>
                    <div className="h-2 bg-card-hover rounded-full overflow-hidden border border-subtle">
                      <div 
                        className={`h-full ${subject.color.replace('from-', 'bg-').split(' ')[0]} rounded-full transition-all duration-500`}
                        style={{ width: `${getSubjectMasteryPercent(subject.id, currentUser)}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
        
        {/* Start Button */}
        {selectedSubject && (
          <div className="text-center mb-6 sm:mb-10 animate-scale-in">
            <Button 
              size="xl" 
              onClick={handleStartQuiz} 
              disabled={!isLoggedIn}
              className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12"
            >
              {isLoggedIn 
                ? `Start ${selectedMode === 'review' ? 'Review' : selectedMode === 'practice' ? 'Practice' : 'Quiz'}`
                : 'Login to Start'
              }
            </Button>
            {!isLoggedIn && (
              <p className="text-xs sm:text-sm text-text-muted mt-2">Please login to start learning</p>
            )}
          </div>
        )}
        
        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: '🧠', title: 'Smart Learning', desc: 'Spaced repetition optimizes your review schedule' },
            { icon: '📊', title: 'Track Progress', desc: 'See improvement with detailed analytics' },
            { icon: '🏆', title: 'Leaderboard', desc: 'Compete with other users on your device' },
          ].map((feature, i) => (
            <div key={i} className="text-center p-4">
              <div className="text-3xl sm:text-4xl mb-2">{feature.icon}</div>
              <h3 className="font-semibold text-text-primary mb-1 text-sm sm:text-base">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
        
        {/* Login Modal */}
        <Modal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          title="Welcome to Solvix"
        >
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Enter your name to get started
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={!username.trim()}>
              Continue
            </Button>
          </form>
        </Modal>
      </div>
    </div>
  );
}

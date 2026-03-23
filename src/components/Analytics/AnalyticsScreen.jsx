import { useState, useMemo } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { questions, subjects, topics } from '../../data/questions';
import { Button, Card, Badge } from '../UI';
import { calculateMasteryLevel } from '../../utils/spacedRepetition';
import { getLeaderboard, getUserRank } from '../../utils/storage';

export function AnalyticsScreen() {
  const { currentUser, goToScreen, resetQuiz, startQuiz } = useQuiz();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-sm">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-text-secondary">Please login to view analytics</p>
        </Card>
      </div>
    );
  }
  
  const { stats, streak } = currentUser;
  
  const totalAttempts = Object.values(stats).reduce((acc, s) => acc + (s.attempts || 0), 0);
  const totalBestScores = Object.values(stats).reduce((acc, s) => acc + (s.bestScore || 0), 0);
  const totalTime = Object.values(stats).reduce((acc, s) => acc + (s.totalTime || 0), 0);
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };
  
  const getSubjectMastery = (subject) => {
    const progress = stats[subject]?.questionProgress || {};
    const questionIds = Object.keys(progress);
    if (questionIds.length === 0) return 0;
    
    const totalMastery = questionIds.reduce((acc, id) => {
      return acc + calculateMasteryLevel(progress[id]);
    }, 0);
    
    return Math.round((totalMastery / (questionIds.length * 5)) * 100);
  };
  
  const getTopicMastery = (subject, topic) => {
    const subjectQuestions = questions[subject].filter(q => q.topic === topic);
    const progress = stats[subject]?.questionProgress || {};
    
    let totalMastery = 0;
    let count = 0;
    
    subjectQuestions.forEach(q => {
      if (progress[q.id]) {
        totalMastery += calculateMasteryLevel(progress[q.id]);
        count++;
      }
    });
    
    return count > 0 ? Math.round((totalMastery / (count * 5)) * 100) : 0;
  };
  
  const getWeakTopics = () => {
    const weakTopics = [];
    const MASTERY_THRESHOLD = 70;
    
    Object.keys(topics).forEach(subjectId => {
      const subjectInfo = subjects.find(s => s.id === subjectId);
      const subjectTopics = topics[subjectId];
      
      subjectTopics.forEach(topic => {
        const mastery = getTopicMastery(subjectId, topic);
        if (mastery < MASTERY_THRESHOLD) {
          weakTopics.push({
            subject: subjectId,
            subjectName: subjectInfo?.name || subjectId,
            subjectIcon: subjectInfo?.icon || '📚',
            topic,
            mastery,
          });
        }
      });
    });
    
    return weakTopics.sort((a, b) => a.mastery - b.mastery);
  };
  
  const weakTopics = getWeakTopics();
  
  const leaderboard = useMemo(() => {
    return getLeaderboard(selectedSubject === 'all' ? null : selectedSubject);
  }, [selectedSubject]);
  
  const currentUserRank = useMemo(() => {
    return getUserRank(currentUser.username, selectedSubject === 'all' ? null : selectedSubject);
  }, [currentUser.username, selectedSubject]);
  
  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };
  
  const getSubjectLabel = (id) => {
    if (id === 'all') return 'All Subjects';
    return subjects.find(s => s.id === id)?.name || id;
  };
  
  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={resetQuiz}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card-hover transition-colors touch-target"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Analytics</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={showLeaderboard ? 'primary' : 'secondary'} 
              size="sm"
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="text-xs sm:text-sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Leaderboard</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => goToScreen('start')} className="text-sm">
              Home
            </Button>
          </div>
        </div>
        
        {/* Leaderboard Panel */}
        {showLeaderboard && (
          <Card className="p-4 sm:p-6 mb-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <span>🏆</span> Leaderboard
              </h2>
              
              {/* Subject Tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                <button
                  onClick={() => setSelectedSubject('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedSubject === 'all' 
                      ? 'bg-primary text-white' 
                      : 'bg-card-hover text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All
                </button>
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedSubject === subject.id 
                        ? 'bg-primary text-white' 
                        : 'bg-card-hover text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {subject.icon} {subject.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <div className="text-3xl mb-2">📊</div>
                  <p>No quiz attempts yet</p>
                  <p className="text-sm">Complete quizzes to appear on the leaderboard</p>
                </div>
              ) : (
                leaderboard.map((entry, index) => (
                  <div 
                    key={entry.username}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      entry.isCurrentUser 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'bg-card-hover'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                      entry.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                      entry.rank === 3 ? 'bg-orange-400/20 text-orange-400' :
                      'bg-card text-text-muted'
                    }`}>
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary truncate">
                          {entry.username}
                        </span>
                        {entry.isCurrentUser && (
                          <Badge variant="primary" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span>{entry.attempts} quizzes</span>
                        <span>🔥 {entry.streak} streak</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{entry.score}</div>
                      <div className="text-xs text-text-muted">points</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {currentUserRank && (
              <div className="mt-4 pt-4 border-t border-subtle text-center">
                <p className="text-text-secondary text-sm">
                  Your rank: <span className="font-bold text-primary">#{currentUserRank}</span>
                </p>
              </div>
            )}
          </Card>
        )}
        
        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl mb-1">🔥</div>
            <div className="text-xl sm:text-2xl font-bold text-text-primary">{streak?.current || 0}</div>
            <div className="text-xs sm:text-sm text-text-muted">Day Streak</div>
          </Card>
          <Card className="p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl mb-1">📝</div>
            <div className="text-xl sm:text-2xl font-bold text-text-primary">{totalAttempts}</div>
            <div className="text-xs sm:text-sm text-text-muted">Quizzes</div>
          </Card>
          <Card className="p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl mb-1">⭐</div>
            <div className="text-xl sm:text-2xl font-bold text-text-primary">{totalBestScores}</div>
            <div className="text-xs sm:text-sm text-text-muted">Total Score</div>
          </Card>
          <Card className="p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl mb-1">⏱</div>
            <div className="text-xl sm:text-2xl font-bold text-text-primary">{formatTime(totalTime)}</div>
            <div className="text-xs sm:text-sm text-text-muted">Time</div>
          </Card>
        </div>
        
        {/* Subject Cards */}
        <h2 className="text-lg font-bold text-text-primary mb-4">Subject Progress</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {subjects.map(subject => {
            const subjectStats = stats[subject.id];
            const mastery = getSubjectMastery(subject.id);
            const rank = getUserRank(currentUser.username, subject.id);
            
            return (
              <Card key={subject.id} className="p-5 sm:p-6 overflow-hidden relative">
                <div className={`absolute -top-10 -right-10 w-28 h-28 ${subject.color} opacity-10 rounded-full`} />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${subject.color} flex items-center justify-center text-xl sm:text-2xl shadow-lg`}>
                    {subject.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-primary truncate">{subject.name}</h3>
                    <p className="text-xs sm:text-sm text-text-muted">{subjectStats?.attempts || 0} attempts</p>
                  </div>
                </div>
                
                {/* Mastery Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                    <span className="text-text-secondary">Mastery</span>
                    <span className="font-semibold text-text-primary">{mastery}%</span>
                  </div>
                  <div className="h-2.5 bg-card-hover rounded-full overflow-hidden border border-subtle">
                    <div
                      className={`h-full ${subject.color} rounded-full transition-all duration-500`}
                      style={{ width: `${mastery}%` }}
                    />
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-2.5 bg-card-hover rounded-lg border border-subtle">
                    <div className="text-lg sm:text-xl font-bold text-success">{subjectStats?.bestScore || 0}</div>
                    <div className="text-xs text-text-muted">Best Score</div>
                  </div>
                  <div className="text-center p-2.5 bg-card-hover rounded-lg border border-subtle">
                    <div className="text-lg sm:text-xl font-bold text-primary">{formatTime(subjectStats?.totalTime || 0)}</div>
                    <div className="text-xs text-text-muted">Time</div>
                  </div>
                </div>
                
                {/* Rank */}
                {rank && (
                  <div className="mb-4">
                    <Badge variant="success" className="text-xs">
                      #{rank} in {subject.name}
                    </Badge>
                  </div>
                )}
                
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full text-sm"
                  onClick={() => startQuiz({ mode: 'quiz', subject: subject.id })}
                >
                  Practice
                </Button>
              </Card>
            );
          })}
        </div>
        
        {/* Areas to Improve Section */}
        {weakTopics.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <span>📊</span> Areas to Improve
              <Badge variant="warning" className="text-xs">Below 70% Mastery</Badge>
            </h2>
            <Card className="p-4 sm:p-5">
              <div className="space-y-3">
                {weakTopics.slice(0, 10).map((item, index) => (
                  <div 
                    key={`${item.subject}-${item.topic}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card-hover border border-subtle hover:border-primary/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-lg">
                      {item.subjectIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-text-primary capitalize">
                          {item.topic.replace(/-/g, ' ')}
                        </span>
                        <span className="text-xs text-text-muted">{item.subjectName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-card rounded-full overflow-hidden border border-subtle">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.mastery < 30 ? 'bg-error' :
                              item.mastery < 50 ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{ width: `${item.mastery}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${
                          item.mastery < 30 ? 'text-error' :
                          item.mastery < 50 ? 'text-warning' : 'text-success'
                        }`}>
                          {item.mastery}%
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="text-xs"
                      onClick={() => startQuiz({ mode: 'quiz', subject: item.subject })}
                    >
                      Practice
                    </Button>
                  </div>
                ))}
              </div>
              {weakTopics.length > 10 && (
                <p className="text-center text-text-muted text-sm mt-4">
                  +{weakTopics.length - 10} more topics to review
                </p>
              )}
            </Card>
          </div>
        )}
        
        {/* Tips Section */}
        <Card className="p-5 sm:p-6 bg-primary/5 border border-primary/20">
          <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
            <span>💡</span> Study Tips
          </h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Practice daily to maintain your streak and improve retention
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Focus on weak topics to maximize your learning efficiency
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Review explanations for incorrect answers to reinforce learning
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Use the Review mode to practice questions you've struggled with
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

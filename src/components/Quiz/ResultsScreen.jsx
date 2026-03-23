import { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { questions } from '../../data/questions';
import { Button, Card, Badge } from '../UI';
import { getUserRank } from '../../utils/storage';

export function ResultsScreen() {
  const { results, resetQuiz, startQuiz, subject, mode, goToScreen } = useQuiz();
  const [showReview, setShowReview] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  
  if (!results) return null;
  
  const { score, total, accuracy, timeTaken, topicStats, questionResults, mode: resultMode } = results;
  const currentUserRank = getUserRank(null, subject);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  const getScoreEmoji = () => {
    if (accuracy >= 90) return '🏆';
    if (accuracy >= 70) return '🌟';
    if (accuracy >= 50) return '💪';
    return '📚';
  };
  
  const getScoreMessage = () => {
    if (accuracy >= 90) return 'Outstanding!';
    if (accuracy >= 70) return 'Great job!';
    if (accuracy >= 50) return 'Good effort!';
    return 'Keep practicing!';
  };
  
  const toggleAnswerExpand = (index) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  const topicPerformance = Object.entries(topicStats).map(([topic, stats]) => ({
    topic,
    accuracy: Math.round((stats.correct / stats.total) * 100),
    total: stats.total,
    correct: stats.correct,
  })).sort((a, b) => a.accuracy - b.accuracy);
  
  const weakestTopics = topicPerformance.filter(t => t.accuracy < 100);
  
  const subjectName = { math: 'Mathematics', biology: 'Biology', english: 'English' }[subject] || subject;
  
  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        {/* Score Card */}
        <Card className="p-5 sm:p-8 mb-6 text-center animate-scale-in">
          <div className="text-5xl sm:text-6xl mb-3">{getScoreEmoji()}</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">{getScoreMessage()}</h1>
          <p className="text-text-secondary mb-6">Quiz Complete</p>
          
          {/* Circular Score */}
          <div className="relative w-36 h-36 sm:w-48 sm:h-48 mx-auto my-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
              <circle
                cx="72"
                cy="72"
                r="64"
                fill="none"
                stroke="#2a2a4a"
                strokeWidth="10"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                fill="none"
                stroke="#4361ee"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(accuracy / 100) * 402} 402`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-bold text-primary leading-none">
                {accuracy}%
              </span>
              <span className="text-xs sm:text-sm text-text-muted mt-1">{score}/{total}</span>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="p-3 sm:p-4 bg-card-hover rounded-xl border border-subtle">
              <div className="text-xl sm:text-2xl font-bold text-success">{score}</div>
              <div className="text-xs sm:text-sm text-text-muted">Correct</div>
            </div>
            <div className="p-3 sm:p-4 bg-card-hover rounded-xl border border-subtle">
              <div className="text-xl sm:text-2xl font-bold text-error">{total - score}</div>
              <div className="text-xs sm:text-sm text-text-muted">Incorrect</div>
            </div>
            <div className="p-3 sm:p-4 bg-card-hover rounded-xl border border-subtle">
              <div className="text-xl sm:text-2xl font-bold text-text-primary">{formatTime(timeTaken)}</div>
              <div className="text-xs sm:text-sm text-text-muted">Time</div>
            </div>
          </div>
          
          {/* Rank & Subject */}
          {currentUserRank && (
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge variant="primary" className="text-sm">
                {subjectName}
              </Badge>
              <Badge variant="success" className="text-sm">
                #{currentUserRank} on Leaderboard
              </Badge>
            </div>
          )}
          
          {/* Topic Breakdown */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-text-primary mb-3 text-sm sm:text-base">Topic Breakdown</h3>
            <div className="space-y-2.5">
              {topicPerformance.map(({ topic, accuracy: topicAcc, correct, total: topicTotal }) => (
                <div key={topic} className="flex items-center gap-3">
                  <span className="w-24 sm:w-32 text-xs sm:text-sm text-text-secondary capitalize truncate">
                    {topic.replace('-', ' ')}
                  </span>
                  <div className="flex-1 h-2 bg-card rounded-full overflow-hidden border border-subtle">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        topicAcc >= 80 ? 'bg-success' : topicAcc >= 50 ? 'bg-warning' : 'bg-error'
                      }`}
                      style={{ width: `${topicAcc}%` }}
                    />
                  </div>
                  <span className="w-12 text-xs sm:text-sm text-text-muted text-right">
                    {correct}/{topicTotal}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Weak Areas */}
          {weakestTopics.length > 0 && resultMode !== 'practice' && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-warning mb-2 flex items-center gap-2 text-sm sm:text-base">
                <span>📌</span> Focus on these topics:
              </h3>
              <div className="flex flex-wrap gap-2">
                {weakestTopics.slice(0, 4).map(({ topic }) => (
                  <Badge key={topic} variant="warning">
                    {topic.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <Button variant="ghost" onClick={resetQuiz} size="sm" className="text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Button>
            
            <Button variant="secondary" onClick={() => setShowReview(!showReview)} size="sm" className="text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {showReview ? 'Hide' : 'Review'} Answers
            </Button>
            
            <Button onClick={() => startQuiz({ mode: 'quiz', subject })} size="sm" className="text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </Button>
            
            {weakestTopics.length > 0 && (
              <Button variant="accent" onClick={() => startQuiz({ mode: 'review', subject })} size="sm" className="text-sm">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Review Weak Areas
              </Button>
            )}
          </div>
        </Card>
        
        {/* Answer Review */}
        {showReview && (
          <div className="space-y-3 sm:space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-text-primary">Answer Review</h2>
            {questionResults.map((result, i) => {
              const question = questions[subject].find(q => q.id === result.questionId);
              const isExpanded = expandedAnswers[i];
              
              return (
                <Card key={i} className="p-4 overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      result.isCorrect ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                    }`}>
                      {result.isCorrect ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary text-sm mb-2 leading-relaxed">{question?.q}</p>
                      
                      {!result.isCorrect && question?.hint && (
                        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm">💡</span>
                            <span className="text-sm font-semibold text-warning">Hint</span>
                          </div>
                          <p className="text-xs sm:text-sm text-text-secondary">{question.hint}</p>
                        </div>
                      )}
                      
                      {question?.solution && (
                        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm">📝</span>
                            <span className="text-sm font-semibold text-primary">Solution</span>
                          </div>
                          <p className="text-xs sm:text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                            {question.solution}
                          </p>
                        </div>
                      )}
                      
                      <div className="text-xs sm:text-sm space-y-1">
                        {result.isCorrect ? (
                          <p className="text-success">✓ Your answer was correct</p>
                        ) : (
                          <>
                            <p className="text-error">
                              ✗ Your answer: {question?.options[result.userAnswer] || 'Not answered'}
                            </p>
                            <p className="text-success">
                              ✓ Correct: {question?.options[result.correctAnswer]}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { Button, Card, Badge, ProgressBar } from '../UI';

export function QuizScreen() {
  const {
    questions,
    currentQuestionIndex,
    userAnswers,
    flaggedQuestions,
    selectedAnswer,
    isAnswerSubmitted,
    mode,
    subject,
    timeRemaining,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    prevQuestion,
    toggleFlag,
    resetQuiz,
    finishQuiz,
  } = useQuiz();
  
  const [localTime, setLocalTime] = useState(timeRemaining);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isFlagged = flaggedQuestions.includes(currentQuestionIndex);
  const hasAnswered = userAnswers[currentQuestionIndex] !== undefined;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isQuizMode = mode === 'quiz';
  
  // Timer
  useEffect(() => {
    if (isQuizMode && localTime > 0) {
      const interval = setInterval(() => {
        setLocalTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isQuizMode, localTime, finishQuiz]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        if (index < currentQuestion.options.length && !isAnswerSubmitted) {
          selectAnswer(index);
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFlag();
      } else if (e.key === 'Enter') {
        if (!isAnswerSubmitted) {
          if (selectedAnswer !== null) {
            handleSubmit();
          }
        } else {
          handleNext();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, isAnswerSubmitted, selectedAnswer, selectAnswer, toggleFlag]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleOptionClick = (index) => {
    if (isAnswerSubmitted) return;
    selectAnswer(index);
  };
  
  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    submitAnswer();
  };
  
  const handleNext = () => {
    if (isLastQuestion) {
      finishQuiz();
    } else {
      nextQuestion();
    }
  };
  
  const getOptionClass = (index) => {
    const base = 'w-full p-4 sm:p-5 rounded-xl border-2 text-left transition-all flex items-center gap-3 sm:gap-4 touch-target';
    
    if (!isAnswerSubmitted) {
      return `${base} border-subtle hover:border-primary hover:bg-primary/10 cursor-pointer ${
        selectedAnswer === index ? 'border-primary bg-primary/15 shadow-lg' : ''
      }`;
    }
    
    // In quiz mode, never show correct/incorrect
    if (isQuizMode) {
      return `${base} border-subtle ${selectedAnswer === index ? 'border-primary bg-primary/10' : 'opacity-60'}`;
    }
    
    // Practice mode shows feedback
    if (selectedAnswer === index) {
      if (index === currentQuestion.correct) {
        return `${base} border-success bg-success/15`;
      } else {
        return `${base} border-error bg-error/15`;
      }
    }
    
    if (index === currentQuestion.correct && selectedAnswer !== index) {
      return `${base} border-success bg-success/15`;
    }
    
    return `${base} border-subtle opacity-50`;
  };
  
  const getOptionLetter = (index) => {
    const letters = ['A', 'B', 'C', 'D'];
    return letters[index];
  };
  
  const getSubjectLabel = () => {
    const labels = { math: 'Mathematics', biology: 'Biology', english: 'English' };
    return labels[subject] || subject;
  };
  
  const getModeLabel = () => {
    const labels = { quiz: 'Quiz', practice: 'Practice', review: 'Review' };
    return labels[mode] || mode;
  };
  
  return (
    <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button 
              onClick={resetQuiz}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors touch-target"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Badge variant="primary" className="text-xs sm:text-sm">
              {getSubjectLabel()}
            </Badge>
            <Badge variant={mode === 'practice' ? 'success' : mode === 'review' ? 'warning' : 'info'} className="text-xs sm:text-sm hidden sm:inline-flex">
              {getModeLabel()}
            </Badge>
          </div>
          
          {isQuizMode && (
            <div className={`text-xl sm:text-2xl font-mono font-bold ${localTime < 60 ? 'text-error timer-warning' : 'text-text-primary'}`}>
              <span className="hidden sm:inline">⏱</span> {formatTime(localTime)}
            </div>
          )}
        </div>
        
        {/* Progress */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between text-xs sm:text-sm text-text-secondary mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={currentQuestionIndex + 1} max={questions.length} />
          
          {/* Question dots - scrollable on mobile */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                  i === currentQuestionIndex 
                    ? 'bg-primary scale-125' 
                    : userAnswers[i] !== undefined
                      ? 'bg-success'
                      : 'bg-card border border-subtle'
                } ${flaggedQuestions.includes(i) ? 'ring-2 ring-warning' : ''}`}
              />
            ))}
          </div>
        </div>
        
        {/* Question Card */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6 animate-slide-up">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <Badge variant="default" className="text-xs capitalize">
              {currentQuestion.topic.replace('-', ' ')}
            </Badge>
            <button
              onClick={() => toggleFlag()}
              className={`p-2 rounded-lg transition-colors touch-target ${
                isFlagged ? 'bg-warning/20 text-warning' : 'text-text-muted hover:text-warning hover:bg-card-hover'
              }`}
              title="Flag for review (F)"
            >
              <svg className="w-5 h-5" fill={isFlagged ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </button>
          </div>
          
          <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-5 sm:mb-6 leading-relaxed">
            {currentQuestion.q}
          </h2>
          
          {/* Options */}
          <div className="space-y-2.5 sm:space-y-3">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOptionClick(i)}
                className={getOptionClass(i)}
                disabled={isAnswerSubmitted && isQuizMode}
              >
                <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${
                  isAnswerSubmitted && !isQuizMode
                    ? i === currentQuestion.correct
                      ? 'bg-success text-white'
                      : selectedAnswer === i
                        ? 'bg-error text-white'
                        : 'bg-card text-text-muted'
                    : selectedAnswer === i
                      ? 'bg-primary text-white'
                      : 'bg-card text-text-muted'
                }`}>
                  {getOptionLetter(i)}
                </span>
                <span className="flex-1 text-sm sm:text-base">{option}</span>
                {isAnswerSubmitted && !isQuizMode && i === currentQuestion.correct && (
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isAnswerSubmitted && !isQuizMode && selectedAnswer === i && i !== currentQuestion.correct && (
                  <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          
          {/* Practice Mode Feedback */}
          {isAnswerSubmitted && !isQuizMode && currentQuestion.hint && !currentQuestion.solution && (
            <div className={`mt-5 sm:mt-6 p-4 rounded-xl border ${
              selectedAnswer === currentQuestion.correct 
                ? 'bg-success/10 border-success/30' 
                : 'bg-warning/10 border-warning/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💡</span>
                <span className="font-semibold text-text-primary">Hint</span>
              </div>
              <p className="text-sm text-text-secondary">{currentQuestion.hint}</p>
            </div>
          )}
        </Card>
        
        {/* Navigation */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
          <Button
            variant="ghost"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Previous</span>
          </Button>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {!isAnswerSubmitted ? (
              <Button 
                onClick={handleSubmit} 
                disabled={selectedAnswer === null}
                className="flex-1 sm:flex-none"
              >
                Submit
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                variant={isLastQuestion ? 'accent' : 'primary'}
                className="flex-1 sm:flex-none"
              >
                {isLastQuestion ? 'Finish Quiz' : 'Next'}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            )}
          </div>
        </div>
        
        {/* Keyboard shortcuts hint - hidden on mobile */}
        <div className="mt-6 text-center text-xs text-text-muted hidden sm:block">
          <span className="px-2 py-1 bg-card border border-subtle rounded mr-2">1-4</span> 
          Select option
          <span className="px-2 py-1 bg-card border border-subtle rounded mx-2">F</span> 
          Flag
          <span className="px-2 py-1 bg-card border border-subtle rounded mx-2">Enter</span> 
          Submit/Next
        </div>
      </div>
    </div>
  );
}

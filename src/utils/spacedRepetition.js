// SM-2 Algorithm variant for spaced repetition
// Based on SuperMemo 2 algorithm

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

export function calculateNextReview(questionData, quality) {
  // quality: 0-5 (0 = complete blackout, 5 = perfect response)
  // For quiz: 0-2 = incorrect (reset), 3-5 = correct (with varying confidence)
  
  const currentEaseFactor = questionData.easeFactor || DEFAULT_EASE_FACTOR;
  const currentInterval = questionData.interval || 0;
  const currentRepetitions = questionData.repetitions || 0;
  
  let newEaseFactor = currentEaseFactor;
  let newInterval = currentInterval;
  let newRepetitions = currentRepetitions;
  
  if (quality < 3) {
    // Incorrect answer - reset repetitions and interval
    newRepetitions = 0;
    newInterval = 1; // Review again tomorrow
  } else {
    // Correct answer - increase interval based on ease factor
    if (currentRepetitions === 0) {
      newInterval = 1;
    } else if (currentRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor);
    }
    newRepetitions = currentRepetitions + 1;
    
    // Adjust ease factor based on quality
    newEaseFactor = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor);
  }
  
  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  
  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview: nextReview.toISOString(),
    lastReviewed: new Date().toISOString(),
  };
}

export function getQualityFromAnswer(isCorrect, confidence = 'medium') {
  // Map quiz answers to SM-2 quality ratings
  if (!isCorrect) return 1; // Complete blackout/failure
  
  switch (confidence) {
    case 'high': return 5;
    case 'medium': return 4;
    case 'low': return 3;
    default: return 4;
  }
}

export function selectQuestionsForReview(questions, userProgress, count = 15) {
  const now = new Date();
  const dueQuestions = [];
  const newQuestions = [];
  const reviewedRecently = [];
  
  questions.forEach(question => {
    const progress = userProgress[question.id];
    
    if (!progress || !progress.nextReview) {
      // Never seen - treat as new
      newQuestions.push({ ...question, weight: 1 });
      return;
    }
    
    const nextReview = new Date(progress.nextReview);
    
    if (nextReview <= now) {
      // Due for review
      dueQuestions.push({
        ...question,
        weight: calculateWeight(progress, question),
        daysOverdue: Math.floor((now - nextReview) / (1000 * 60 * 60 * 24)),
      });
    } else if (progress.lastReviewed) {
      // Reviewed recently - might still include some
      reviewedRecently.push({
        ...question,
        weight: 0.3, // Lower priority
      });
    }
  });
  
  // Sort due questions by weight (most overdue/most mistakes first)
  dueQuestions.sort((a, b) => b.weight - a.weight);
  
  // Sort new questions by weight (questions user has struggled with in other topics)
  newQuestions.sort((a, b) => b.weight - a.weight);
  
  // Select questions prioritizing due reviews, then new, then some recent
  const selected = [];
  
  // Add all due questions (up to count)
  while (selected.length < count && dueQuestions.length > 0) {
    selected.push(dueQuestions.shift());
  }
  
  // Add new questions if needed
  while (selected.length < count && newQuestions.length > 0) {
    selected.push(newQuestions.shift());
  }
  
  // Fill remaining with recently reviewed (for reinforcement)
  while (selected.length < count && reviewedRecently.length > 0) {
    selected.push(reviewedRecently.shift());
  }
  
  // Shuffle selected questions to avoid predictable order
  return shuffleArray(selected);
}

function calculateWeight(progress, question) {
  let weight = 1;
  
  // More mistakes = higher weight
  weight += (progress.mistakes || 0) * 0.5;
  
  // Lower ease factor = higher weight (harder questions)
  const easeFactor = progress.easeFactor || DEFAULT_EASE_FACTOR;
  weight += (DEFAULT_EASE_FACTOR - easeFactor);
  
  // Lower interval = higher weight (more frequent review needed)
  const interval = progress.interval || 1;
  weight += (1 / interval);
  
  // Boost weight for questions not seen recently but due
  if (progress.nextReview) {
    const daysSinceReview = Math.floor(
      (new Date() - new Date(progress.lastReview || progress.nextReview)) / (1000 * 60 * 60 * 24)
    );
    weight += daysSinceReview * 0.1;
  }
  
  return weight;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function updateQuestionProgress(questionId, isCorrect, currentProgress) {
  const quality = getQualityFromAnswer(isCorrect);
  const newReviewData = calculateNextReview(currentProgress || {}, quality);
  
  const mistakes = currentProgress?.mistakes || 0;
  
  return {
    ...newReviewData,
    questionId,
    mistakes: isCorrect ? mistakes : mistakes + 1,
    totalAttempts: (currentProgress?.totalAttempts || 0) + 1,
    correctAttempts: (currentProgress?.correctAttempts || 0) + (isCorrect ? 1 : 0),
  };
}

export function calculateMasteryLevel(progress) {
  if (!progress || !progress.repetitions) return 0;
  
  // Mastery based on: repetitions, ease factor, and accuracy
  const reps = progress.repetitions || 0;
  const ease = progress.easeFactor || DEFAULT_EASE_FACTOR;
  const accuracy = progress.totalAttempts 
    ? progress.correctAttempts / progress.totalAttempts 
    : 0;
  
  // Calculate mastery score (0-5)
  let mastery = 0;
  
  // Repetitions contribute (max 2 points)
  mastery += Math.min(2, reps * 0.3);
  
  // Ease factor contributes (max 2 points)
  mastery += Math.min(2, (ease - MIN_EASE_FACTOR) / (DEFAULT_EASE_FACTOR - MIN_EASE_FACTOR) * 2);
  
  // Accuracy contributes (max 1 point)
  mastery += accuracy;
  
  return Math.round(mastery);
}

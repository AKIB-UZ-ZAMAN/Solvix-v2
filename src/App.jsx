import { QuizProvider, useQuiz } from './context/QuizContext';
import { StartScreen } from './components/Quiz/StartScreen';
import { QuizScreen } from './components/Quiz/QuizScreen';
import { ResultsScreen } from './components/Quiz/ResultsScreen';
import { AnalyticsScreen } from './components/Analytics/AnalyticsScreen';

function QuizApp() {
  const { screen } = useQuiz();
  
  return (
    <div className="min-h-screen">
      {screen === 'start' && <StartScreen />}
      {screen === 'quiz' && <QuizScreen />}
      {screen === 'results' && <ResultsScreen />}
      {screen === 'analytics' && <AnalyticsScreen />}
    </div>
  );
}

function App() {
  return (
    <QuizProvider>
      <QuizApp />
    </QuizProvider>
  );
}

export default App;

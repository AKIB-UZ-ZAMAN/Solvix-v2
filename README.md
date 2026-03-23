# Solvix v2

> An intelligent quiz and practice web app with spaced repetition for optimized learning

![React](https://img.shields.io/badge/React-18.3.1-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.0.1-646cff?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0.0-38b2ac?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## Features

### 📚 Subjects
- **Mathematics** - Algebra, Geometry, Fractions, Percentages, Exponents, and more
- **Biology** - Cell Biology, Botany, Physiology, Genetics, Anatomy, and more
- **English** - Vocabulary, Grammar, Spelling, Literary Devices, and more

### 🎯 Learning Modes
- **Quiz Mode** - Timed quizzes with no instant feedback
- **Practice Mode** - Learn with hints and explanations
- **Review Mode** - Focus on weak areas using spaced repetition

### 🧠 Smart Learning
- **Spaced Repetition (SM-2 Algorithm)** - Questions you struggle with appear more frequently
- **Adaptive Difficulty** - Questions adapt based on your performance
- **Progress Tracking** - Detailed analytics and mastery tracking

### 📊 Analytics
- Per-subject mastery progress
- Topic-by-topic breakdown
- Leaderboard rankings
- Streak tracking

### 📱 Modern UI
- Dark theme design
- Fully responsive (mobile & desktop)
- Golden yellow accent color scheme
- Smooth animations

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/Solvix-v2.git
cd Solvix-v2

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Tech Stack
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **localStorage** - Data persistence

## Project Structure

```
src/
├── components/
│   ├── Analytics/     # Analytics dashboard
│   ├── Quiz/          # Quiz screens (Start, Quiz, Results)
│   └── UI/            # Reusable UI components
├── context/           # React Context for state management
├── data/              # Questions and configuration
├── utils/             # Helper functions (spaced repetition, storage)
└── index.css          # Global styles
```

## Spaced Repetition

This app uses a modified SM-2 algorithm to optimize your learning:

- Questions are prioritized based on:
  - Time since last review
  - Number of mistakes
  - Current mastery level
- Wrong answers increase review frequency
- Correct answers increase time between reviews

## Question Bank

- **315+ questions** across 3 subjects
- Each question includes:
  - Multiple choice options
  - Difficulty level (easy/medium/hard)
  - Topic categorization
  - Hint for learning
  - Full solution explanation

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

### **Developer**  
**Akib Uz Zaman**  
Undergraduate Student, CSE  
Lalon University of Science & Arts (LUSA)  
[[LinkedIn]](https://www.linkedin.com/in/akib-uz-zaman)

## License

This project is licensed under the MIT License.

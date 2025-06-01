import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('wheel'); // wheel, question, result
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  const categories = [
    { name: 'toys', emoji: '🧸', color: '#FF6B6B' },
    { name: 'colors', emoji: '🌈', color: '#4ECDC4' },
    { name: 'animals', emoji: '🐕', color: '#45B7D1' },
    { name: 'body parts', emoji: '👁️', color: '#96CEB4' },
    { name: 'food', emoji: '🍎', color: '#FFEAA7' },
    { name: 'daily routines', emoji: '⏰', color: '#DDA0DD' }
  ];

  const questions = {
    toys: [
      { question: "What toy spins around and around?", options: ["Top", "Ball", "Car", "Doll"], correct: 0 },
      { question: "What do you build with blocks?", options: ["Tower", "Food", "Water", "Music"], correct: 0 },
      { question: "What toy flies in the sky?", options: ["Car", "Kite", "Book", "Shoe"], correct: 1 }
    ],
    colors: [
      { question: "What color do you get when you mix red and blue?", options: ["Green", "Purple", "Yellow", "Orange"], correct: 1 },
      { question: "What color is the sun?", options: ["Blue", "Red", "Yellow", "Green"], correct: 2 },
      { question: "What color is an apple usually?", options: ["Red", "Blue", "Purple", "Black"], correct: 0 }
    ],
    animals: [
      { question: "What sound does a dog make?", options: ["Meow", "Woof", "Moo", "Oink"], correct: 1 },
      { question: "What animal says 'moo'?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 2 },
      { question: "What animal hops?", options: ["Fish", "Rabbit", "Snake", "Elephant"], correct: 1 }
    ],
    "body parts": [
      { question: "What do you see with?", options: ["Ears", "Eyes", "Nose", "Mouth"], correct: 1 },
      { question: "What do you hear with?", options: ["Eyes", "Ears", "Hands", "Feet"], correct: 1 },
      { question: "How many fingers are on one hand?", options: ["4", "5", "6", "7"], correct: 1 }
    ],
    food: [
      { question: "What do bees make?", options: ["Milk", "Honey", "Bread", "Cheese"], correct: 1 },
      { question: "What fruit is yellow and curved?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 1 },
      { question: "What do you drink to be healthy?", options: ["Soda", "Water", "Coffee", "Juice"], correct: 1 }
    ],
    "daily routines": [
      { question: "What do you do when you wake up?", options: ["Sleep", "Brush teeth", "Go to bed", "Dream"], correct: 1 },
      { question: "When do you eat breakfast?", options: ["Night", "Morning", "Afternoon", "Evening"], correct: 1 },
      { question: "What do you do before bed?", options: ["Wake up", "Brush teeth", "Eat lunch", "Go to school"], correct: 1 }
    ]
  };

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    const spins = Math.floor(Math.random() * 5) + 5; // 5-10 spins
    const finalRotation = wheelRotation + (spins * 360) + Math.floor(Math.random() * 360);
    setWheelRotation(finalRotation);

    setTimeout(() => {
      const segmentAngle = 360 / categories.length;
      const normalizedRotation = finalRotation % 360;
      const selectedIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % categories.length;
      
      setSelectedCategory(categories[selectedIndex].name);
      setIsSpinning(false);
      setGameState('question');
      setQuestionIndex(0);
      setCurrentQuestion(questions[categories[selectedIndex].name][0]);
    }, 3000);
  };

  const answerQuestion = (selectedAnswer) => {
    const isCorrect = selectedAnswer === currentQuestion.correct;
    if (isCorrect) {
      setScore(score + 1);
    }

    if (questionIndex < questions[selectedCategory].length - 1) {
      setQuestionIndex(questionIndex + 1);
      setCurrentQuestion(questions[selectedCategory][questionIndex + 1]);
    } else {
      setGameState('result');
    }
  };

  const resetGame = () => {
    setGameState('wheel');
    setSelectedCategory('');
    setCurrentQuestion(null);
    setScore(0);
    setQuestionIndex(0);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎯 EddyQuiz Trivia</h1>
        <div className="score">Score: {score}</div>
        
        {gameState === 'wheel' && (
          <div className="wheel-container">
            <h2>Spin the Wheel!</h2>
            <div className="wheel-wrapper">
              <div 
                className={`wheel ${isSpinning ? 'spinning' : ''}`}
                style={{ transform: `rotate(${wheelRotation}deg)` }}
              >
                {categories.map((category, index) => (
                  <div
                    key={category.name}
                    className="wheel-segment"
                    style={{
                      transform: `rotate(${index * 60}deg)`,
                      backgroundColor: category.color
                    }}
                  >
                    <div className="segment-content">
                      <span className="emoji">{category.emoji}</span>
                      <span className="category-name">{category.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="wheel-pointer">▲</div>
            </div>
            <button 
              className="spin-button" 
              onClick={spinWheel}
              disabled={isSpinning}
            >
              {isSpinning ? 'Spinning...' : 'SPIN!'}
            </button>
          </div>
        )}

        {gameState === 'question' && currentQuestion && (
          <div className="question-container">
            <h2>Category: {selectedCategory}</h2>
            <div className="question-box">
              <h3>{currentQuestion.question}</h3>
              <div className="options">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className="option-button"
                    onClick={() => answerQuestion(index)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="progress">
              Question {questionIndex + 1} of {questions[selectedCategory].length}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="result-container">
            <h2>🎉 Great Job!</h2>
            <div className="final-score">
              You scored {score} out of {questions[selectedCategory].length} in {selectedCategory}!
            </div>
            <button className="play-again-button" onClick={resetGame}>
              Play Again
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

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
              <svg 
                className={`wheel ${isSpinning ? 'spinning' : ''}`}
                style={{ transform: `rotate(${wheelRotation}deg)` }}
                width="300" 
                height="300" 
                viewBox="0 0 300 300"
              >
                {categories.map((category, index) => {
                  const angle = (360 / categories.length) * index;
                  const nextAngle = (360 / categories.length) * (index + 1);
                  
                  // Convert to radians
                  const startAngle = (angle * Math.PI) / 180;
                  const endAngle = (nextAngle * Math.PI) / 180;
                  
                  // Calculate path for pie slice
                  const radius = 140;
                  const centerX = 150;
                  const centerY = 150;
                  
                  const x1 = centerX + radius * Math.cos(startAngle);
                  const y1 = centerY + radius * Math.sin(startAngle);
                  const x2 = centerX + radius * Math.cos(endAngle);
                  const y2 = centerY + radius * Math.sin(endAngle);
                  
                  const largeArcFlag = (endAngle - startAngle) > Math.PI ? 1 : 0;
                  
                  const pathData = [
                    `M ${centerX} ${centerY}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `Z`
                  ].join(' ');
                  
                  // Text position
                  const textAngle = startAngle + (endAngle - startAngle) / 2;
                  const textRadius = radius * 0.7;
                  const textX = centerX + textRadius * Math.cos(textAngle);
                  const textY = centerY + textRadius * Math.sin(textAngle);
                  
                  return (
                    <g key={category.name}>
                      <path
                        d={pathData}
                        fill={category.color}
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      <text
                        x={textX}
                        y={textY - 10}
                        textAnchor="middle"
                        fontSize="24"
                        fill="white"
                        fontWeight="bold"
                        textShadow="1px 1px 2px rgba(0,0,0,0.5)"
                      >
                        {category.emoji}
                      </text>
                      <text
                        x={textX}
                        y={textY + 15}
                        textAnchor="middle"
                        fontSize="11"
                        fill="white"
                        fontWeight="bold"
                        textShadow="1px 1px 2px rgba(0,0,0,0.5)"
                      >
                        {category.name.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
                
                {/* Center circle */}
                <circle 
                  cx="150" 
                  cy="150" 
                  r="25" 
                  fill="white" 
                  stroke="#ccc" 
                  strokeWidth="2"
                />
              </svg>
              <div className="wheel-pointer">▼</div>
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

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
  const [toysQuestions, setToysQuestions] = useState([]);
  const [randomizedQuestions, setRandomizedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { name: 'toys', emoji: '🧸', color: '#FF6B6B' },
    { name: 'colors', emoji: '🌈', color: '#4ECDC4' },
    { name: 'animals', emoji: '🐕', color: '#45B7D1' },
    { name: 'body parts', emoji: '👁️', color: '#96CEB4' },
    { name: 'food', emoji: '🍎', color: '#FFEAA7' },
    { name: 'daily routines', emoji: '⏰', color: '#DDA0DD' }
  ];

  // Fetch questions from the mock API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://run.mocky.io/v3/bf81e1b3-f31b-40fc-8e68-ef9e61d4d5e4');
        const data = await response.json();
        
        // Filter only toys questions (though all seem to be toys based on the API)
        const toysQs = data.filter(q => q.category === 'toys');
        setToysQuestions(toysQs);
        console.log('Fetched questions:', toysQs);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Function to randomize questions
  const shuffleQuestions = (questions) => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const spinWheel = () => {
    if (isSpinning) return; // Prevent spinning if already spinning
    
    setIsSpinning(true);
    const spins = Math.floor(Math.random() * 5) + 5; // 5-10 spins
    const extraRotation = Math.floor(Math.random() * 360);
    const finalRotation = wheelRotation + (spins * 360) + extraRotation;
    setWheelRotation(finalRotation);

    setTimeout(() => {
      // Each segment is 60 degrees
      const segmentAngle = 60;
      
      // Get the final rotation and normalize it to 0-360
      let normalizedRotation = finalRotation % 360;
      if (normalizedRotation < 0) normalizedRotation += 360;
      
      // The wheel rotates clockwise, but we need to calculate counter-clockwise
      // to match which segment is at the top
      const reversedRotation = (360 - normalizedRotation) % 360;
      const selectedIndex = Math.floor(reversedRotation / segmentAngle) % categories.length;
      
      console.log('=== WHEEL DEBUG ===');
      console.log('Final rotation:', finalRotation);
      console.log('Normalized rotation:', normalizedRotation);
      console.log('Reversed rotation:', reversedRotation);
      console.log('Segment angle:', segmentAngle);
      console.log('Selected index:', selectedIndex);
      console.log('Categories:', categories.map((cat, i) => `${i}: ${cat.name}`));
      console.log('Selected category:', categories[selectedIndex].name);
      console.log('===================');
      
      const selectedCategoryName = categories[selectedIndex].name;
      setSelectedCategory(selectedCategoryName);
      setIsSpinning(false);
      
      // If toys is selected, go to questions. Otherwise, just show result.
      if (selectedCategoryName === 'toys' && toysQuestions.length > 0) {
        // Randomize questions and start the game
        const shuffled = shuffleQuestions(toysQuestions);
        setRandomizedQuestions(shuffled);
        setGameState('question');
        setQuestionIndex(0);
        setScore(0);
        setCurrentQuestion(shuffled[0]);
      } else {
        setGameState('result');
      }
    }, 3000);
  };

  const answerQuestion = (selectedAnswer) => {
    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore(score + 1);
    }

    if (questionIndex < randomizedQuestions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setCurrentQuestion(randomizedQuestions[questionIndex + 1]);
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
    setRandomizedQuestions([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎯 EddyQuiz Trivia</h1>
        
        {gameState === 'wheel' && (
          <div className="wheel-container">
            <h2>Click the Wheel to Spin!</h2>
            {isLoading && (
              <div className="loading-text">Loading questions...</div>
            )}
            <div className="wheel-wrapper">
              <svg 
                className={`wheel ${isSpinning ? 'spinning' : ''}`}
                style={{ transform: `rotate(${wheelRotation}deg)` }}
                width="300" 
                height="300" 
                viewBox="0 0 300 300"
                onClick={spinWheel}
              >
                {categories.map((category, index) => {
                  const angle = 60; // 360/6 = 60 degrees per segment
                  // Start from -90 degrees (top) so first segment is at the pointer
                  const startAngle = index * angle - 90;
                  const endAngle = (index + 1) * angle - 90;
                  
                  // Convert to radians
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  
                  // SVG path for pie slice
                  const radius = 140;
                  const centerX = 150;
                  const centerY = 150;
                  
                  const x1 = centerX + radius * Math.cos(startRad);
                  const y1 = centerY + radius * Math.sin(startRad);
                  const x2 = centerX + radius * Math.cos(endRad);
                  const y2 = centerY + radius * Math.sin(endRad);
                  
                  const pathData = [
                    `M ${centerX} ${centerY}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 0 1 ${x2} ${y2}`,
                    `Z`
                  ].join(' ');
                  
                  // Text position (middle of segment)
                  const textAngle = startAngle + angle / 2;
                  const textRad = (textAngle * Math.PI) / 180;
                  const textRadius = radius * 0.7;
                  const textX = centerX + textRadius * Math.cos(textRad);
                  const textY = centerY + textRadius * Math.sin(textRad);
                  
                  return (
                    <g key={category.name}>
                      <path
                        d={pathData}
                        fill={category.color}
                        stroke="#fff"
                        strokeWidth="3"
                      />
                      <text
                        x={textX}
                        y={textY - 8}
                        textAnchor="middle"
                        fontSize="20"
                        fill="white"
                        fontWeight="bold"
                        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                      >
                        {category.emoji}
                      </text>
                      <text
                        x={textX}
                        y={textY + 12}
                        textAnchor="middle"
                        fontSize="10"
                        fill="white"
                        fontWeight="bold"
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                      >
                        {category.name.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
                
                {/* Center white circle with SPIN text */}
                <circle 
                  cx="150" 
                  cy="150" 
                  r="40" 
                  fill="white" 
                  stroke="#ddd" 
                  strokeWidth="3"
                />
                <text
                  x="150"
                  y="158"
                  textAnchor="middle"
                  fontSize="16"
                  fill="#333"
                  fontWeight="900"
                  letterSpacing="1px"
                >
                  SPIN
                </text>
              </svg>
              <div className="wheel-pointer">▼</div>
            </div>
          </div>
        )}

        {gameState === 'question' && (
          <div className="question-container">
            <h2>🧸 Toys Questions</h2>
            <div className="score-display">Score: {score}</div>
            <div className="question-box">
              {/* Show image if question type is "image" */}
              {currentQuestion && currentQuestion.type === 'image' && currentQuestion.imageURL && (
                <div className="question-image">
                  <img 
                    src={currentQuestion.imageURL} 
                    alt="Question image" 
                    className="question-img"
                  />
                </div>
              )}
              
              <h3>{currentQuestion?.question}</h3>
              <div className="options">
                {currentQuestion && [
                  currentQuestion.option0,
                  currentQuestion.option1,
                  currentQuestion.option2,
                  currentQuestion.option3
                ].map((option, index) => (
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
              Question {questionIndex + 1} of {randomizedQuestions.length}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="result-container">
            <h2>🎯 Result!</h2>
            
            {selectedCategory === 'toys' ? (
              <div>
                <div className="category-result">
                  <div className="selected-category-emoji">🧸</div>
                  <div className="selected-category-name">TOYS</div>
                </div>
                <div className="final-score">
                  You scored {score} out of {randomizedQuestions.length}!
                </div>
              </div>
            ) : (
              <div className="category-result">
                <div className="selected-category-emoji">
                  {categories.find(cat => cat.name === selectedCategory)?.emoji}
                </div>
                <div className="selected-category-name">
                  {selectedCategory.toUpperCase()}
                </div>
                <div className="no-questions">
                  No questions available for this category yet.
                </div>
              </div>
            )}
            
            <div className="debug-info">
              Debug: Selected category = "{selectedCategory}"
            </div>
            <button className="play-again-button" onClick={resetGame}>
              Spin Again
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

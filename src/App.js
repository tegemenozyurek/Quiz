import React, { useState, useEffect } from 'react';
import './App.css';
import removeOneOptionImg from './assets/question/remove one option.png';
import getNewQuestionImg from './assets/question/get a new question.png';
import playButtonImg from './assets/main-screen/play.png';
import categoryWheelImg from './assets/wheel-screen/category wheel.png';
import backButtonImg from './assets/store-screen/back.png';
import eddyImg from './assets/mascot/eddy.png';
import Confetti from 'react-confetti';

function App() {
  const [gameState, setGameState] = useState('start'); // start, wheel, question, result
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [toysQuestions, setToysQuestions] = useState([]);
  const [randomizedQuestions, setRandomizedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timer, setTimer] = useState(25);
  const [questionsForRound, setQuestionsForRound] = useState([]);
  const [removeOptionUsed, setRemoveOptionUsed] = useState(false);
  const [getNewQuestionUsed, setGetNewQuestionUsed] = useState(false);
  const [eliminatedOption, setEliminatedOption] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [roundCount, setRoundCount] = useState(0);
  const maxRounds = 3; // You can change this for more/less rounds per game
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCategoryReveal, setShowCategoryReveal] = useState(false);

  const categories = [
    { name: 'toys', emoji: '🧸', color: '#FF4B4B' },
    { name: 'colors', emoji: '🌈', color: '#3A86FF' },
    { name: 'animals', emoji: '🐕', color: '#43AA8B' },
    { name: 'body parts', emoji: '👁️', color: '#FFBE0B' },
    { name: 'food', emoji: '🍎', color: '#FF8C42' },
    { name: 'daily routines', emoji: '⏰', color: '#9D4EDD' }
  ];

  // Fetch questions from the mock API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://run.mocky.io/v3/bf81e1b3-f31b-40fc-8e68-ef9e61d4d5e4');
        const data = await response.json();
        
        // Use all questions for all categories
        setToysQuestions(data);
        console.log('Fetched questions:', data);
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
    if (isSpinning) return;
    setIsSpinning(true);
    const spins = Math.floor(Math.random() * 5) + 5;
    const extraRotation = Math.floor(Math.random() * 360);
    const finalRotation = wheelRotation + (spins * 360) + extraRotation;
    setWheelRotation(finalRotation);

    setTimeout(() => {
      const segmentAngle = 60;
      let normalizedRotation = finalRotation % 360;
      if (normalizedRotation < 0) normalizedRotation += 360;
      const reversedRotation = (360 - normalizedRotation) % 360;
      const selectedIndex = Math.floor(reversedRotation / segmentAngle) % categories.length;
      const selectedCategoryName = categories[selectedIndex].name;
      setSelectedCategory(selectedCategoryName);
      setIsSpinning(false);
      setShowCategoryReveal(true);

      // Wait for 2 seconds after showing the category before moving to questions
      setTimeout(() => {
        setShowCategoryReveal(false);
        // 3 soru seç
        if (toysQuestions.length > 0) {
          const filtered = toysQuestions; // Tüm kategoriler için aynı sorular
          const shuffled = shuffleQuestions(filtered).slice(0, 3);
          setQuestionsForRound(shuffled);
          setRandomizedQuestions(shuffled);
          setGameState('question');
          setQuestionIndex(0);
          setScore(0);
          setCurrentQuestion(shuffled[0]);
          setRoundCount(prev => prev + 1);
        } else {
          setGameState('result');
        }
      }, 2000);
    }, 3000);
  };

  useEffect(() => {
    let interval;
    if (gameState === 'question' && timer > 0 && !showFeedback) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timer, showFeedback]);

  useEffect(() => {
    if (timer === 0 && gameState === 'question' && !showFeedback) {
      setShowFeedback(true);
      setTimeout(() => {
        goToNextQuestion();
      }, 1500);
    }
  }, [timer, gameState, showFeedback]);

  // Reset round rights when new round starts
  useEffect(() => {
    if (gameState === 'question' && questionIndex === 0) {
      setRemoveOptionUsed(false);
      setGetNewQuestionUsed(false);
      setEliminatedOption(null);
    }
  }, [gameState, questionIndex]);

  const goToNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setTimer(25);
    setEliminatedOption(null);
    if (questionIndex < questionsForRound.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setCurrentQuestion(questionsForRound[questionIndex + 1]);
    } else {
      // If this was the last round, show game over
      if (roundCount >= maxRounds) {
        setTotalScore(prev => prev + (selectedAnswer === currentQuestion.correctIndex ? 1 : 0));
        setGameState('gameover');
      } else {
        setSelectedAnswers([]);
        setGameState('wheel');
      }
    }
  };

  const answerQuestion = (index) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
    setSelectedAnswers(prev => {
      const arr = [...prev];
      arr[questionIndex] = index;
      return arr;
    });
    setShowFeedback(true);
    
    // Show confetti if answer is correct
    if (index === currentQuestion.correctIndex) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000); // Hide confetti after 2 seconds
    }
    
    setTimeout(() => {
      if (index === currentQuestion.correctIndex) {
        setScore(score + 1);
      }
      goToNextQuestion();
    }, 1500);
  };

  // Remove one option logic
  const handleRemoveOneOption = () => {
    if (removeOptionUsed || showFeedback) return;
    // Find incorrect options
    const incorrectOptions = [0,1,2,3].filter(idx => idx !== currentQuestion.correctIndex && idx !== eliminatedOption);
    if (incorrectOptions.length > 0) {
      const toEliminate = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
      setEliminatedOption(toEliminate);
      setRemoveOptionUsed(true);
    }
  };

  // Get new question logic
  const handleGetNewQuestion = () => {
    if (getNewQuestionUsed || showFeedback) return;
    // Find a new question not already asked in this round
    const remaining = toysQuestions.filter(q => !questionsForRound.includes(q) && q !== currentQuestion);
    if (remaining.length > 0) {
      const newQ = remaining[Math.floor(Math.random() * remaining.length)];
      const newQuestions = [...questionsForRound];
      newQuestions[questionIndex] = newQ;
      setQuestionsForRound(newQuestions);
      setCurrentQuestion(newQ);
      setGetNewQuestionUsed(true);
      setEliminatedOption(null);
    }
  };

  // When a round ends, update total score
  useEffect(() => {
    if (gameState === 'wheel' && questionIndex === 0 && questionsForRound.length === 0) {
      setTotalScore(prev => prev + score);
    }
  }, [gameState, questionIndex, questionsForRound.length, score]);

  // When max rounds reached, show game over
  useEffect(() => {
    if (roundCount > maxRounds) {
      setGameState('gameover');
    }
  }, [roundCount]);

  const resetGame = () => {
    setGameState('start');
    setSelectedCategory('');
    setCurrentQuestion(null);
    setScore(0);
    setQuestionIndex(0);
    setRandomizedQuestions([]);
    setQuestionsForRound([]);
    setTimer(25);
    setShowFeedback(false);
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setTotalScore(0);
    setRoundCount(0);
  };

  return (
    <div className="App">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
          gravity={0.3}
          initialVelocityY={10}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}
        />
      )}
      <header className="App-header">
        {/* <h1>🎯 EddyQuiz Trivia</h1> */}
        {gameState === 'start' && (
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#7B4AE2',
            padding: '20px',
            gap: '40px'
          }}>
            <img 
              src={eddyImg} 
              alt="Eddy the Penguin" 
              style={{
                width: '200px',
                marginBottom: '20px'
              }}
            />
            <div style={{
              fontSize: '56px',
              fontWeight: 800,
              fontFamily: 'Poppins, sans-serif',
              color: '#fff',
              textAlign: 'center',
              letterSpacing: '2px'
            }}>
              Eddy Trivia
            </div>
            
            <img 
              src={playButtonImg} 
              alt="Play" 
              style={{
                width: '160px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                ':hover': {
                  transform: 'scale(1.1)'
                }
              }} 
              onClick={()=>setGameState('wheel')} 
            />
          </div>
        )}
        {gameState === 'wheel' && (
          <div className="wheel-container" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'80vh'}}>
            <img 
              src={categoryWheelImg} 
              alt="Category Wheel" 
              style={{
                width: '300px',
                marginBottom: '20px'
              }}
            />
            {isLoading && (
              <div className="loading-text">Loading questions...</div>
            )}
            <div className="wheel-wrapper" style={{display:'flex',justifyContent:'center',alignItems:'center',height:'400px',width:'100%',position:'relative'}}>
              <svg 
                className={`wheel ${isSpinning ? 'spinning' : ''}`}
                style={{ transform: `rotate(${wheelRotation}deg)`, width: 380, height: 380, display: 'block', margin: '0 auto' }}
                width="380" 
                height="380" 
                viewBox="0 0 380 380"
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
                  const radius = 170;
                  const centerX = 190;
                  const centerY = 190;
                  
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
                        fontSize="28"
                        fill="white"
                        fontWeight="bold"
                        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                      >
                        {category.emoji}
                      </text>
                      <text
                        x={textX}
                        y={textY + 18}
                        textAnchor="middle"
                        fontSize="13"
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
                  cx="190" 
                  cy="190" 
                  r="55" 
                  fill="white" 
                  stroke="#ddd" 
                  strokeWidth="3"
                />
                <text
                  x="190"
                  y="200"
                  textAnchor="middle"
                  fontSize="22"
                  fill="#333"
                  fontWeight="900"
                  letterSpacing="1px"
                >
                  SPIN
                </text>
              </svg>
              <div className="wheel-pointer" style={{position:'absolute',top:'-30px',left:'50%',transform:'translateX(-50%)',fontSize:'2.5rem'}}>▼</div>
            </div>
            
            {/* Category Reveal Animation */}
            {showCategoryReveal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <div style={{
                  fontSize: '120px',
                  marginBottom: '20px',
                  animation: 'scaleIn 0.5s ease-out'
                }}>
                  {categories.find(cat => cat.name === selectedCategory)?.emoji}
                </div>
                <div style={{
                  fontSize: '40px',
                  fontWeight: 'bold',
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  animation: 'slideUp 0.5s ease-out',
                  textAlign: 'center'
                }}>
                  {selectedCategory}
                </div>
              </div>
            )}
          </div>
        )}

        {gameState === 'question' && (
          <div className="question-container">
            <div className="question-header" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 18px',
              zIndex: 100,
              background: 'rgba(60,0,120,0.92)',
              boxShadow: '0 2px 8px #0002',
            }}>
              <img 
                src={backButtonImg} 
                alt="Back" 
                onClick={resetGame}
                style={{
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              />
              <span style={{
                color:'#fff',
                fontSize:'1.15rem',
                fontWeight:900,
                letterSpacing:1,
                textAlign: 'center',
                flex: '1 1 auto',
                minWidth: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                margin: '0 12px'
              }}>
                R:{roundCount} Question {questionIndex + 1}
              </span>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '4px',
                alignItems: 'center',
                flexShrink: 0,
                minWidth: 0,
                maxWidth: '100px',
                overflow: 'hidden',
                marginRight: '40px'
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.13)',
                  color: '#fff',
                  fontWeight: 700,
                  padding: '3px 12px',
                  borderRadius: '16px',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: '1px solid rgba(255,255,255,0.18)',
                  whiteSpace: 'nowrap',
                  minWidth: 0
                }}>
                  <span style={{color:'#4ECDC4'}}>✓</span>{questionsForRound.slice(0, questionIndex).filter((q, i) => selectedAnswers[i] === q.correctIndex).length}
                  <span style={{margin:'0 2px'}}>|</span>
                  <span style={{color:'#ff4444'}}>✗</span>{questionsForRound.slice(0, questionIndex).filter((q, i) => selectedAnswers[i] !== undefined && selectedAnswers[i] !== q.correctIndex).length}
                </div>
              </div>
            </div>
            <div style={{
              position: 'fixed',
              top: '68px',
              left: '15%',
              width: '70%',
              height: '8px',
              background: 'rgba(255,255,255,0.2)',
              zIndex: 100,
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(timer/25) * 100}%`,
                height: '100%',
                background: timer <= 3 ? '#ff4444' : '#4ECDC4',
                transition: 'width 1s linear, background-color 0.3s ease',
                animation: timer <= 3 ? 'flash 1s infinite' : 'none',
                '@keyframes flash': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 }
                }
              }} />
            </div>
            <div style={{
              marginTop: '90px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              minHeight: 'calc(100vh - 90px - 110px)', // header + actions bar
              maxHeight: 'calc(100vh - 90px - 110px)',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}>
              <div
                className="question-box"
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  minWidth: '0',
                  margin: '0 auto',
                  background: '#fff',
                  borderRadius: '24px',
                  boxShadow: '0 2px 16px #0001',
                  padding: '20px 16px 16px 16px',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '16px',
                  boxSizing: 'border-box',
                  flex: '0 0 auto',
                  overflow: 'hidden',
                  ...(currentQuestion && (!currentQuestion.type || currentQuestion.type !== 'image' || !currentQuestion.imageURL)
                    ? { justifyContent: 'center', alignItems: 'center', flex: 1, height: '180px', minHeight: '180px', padding: 0 } : {})
                }}
              >
                {currentQuestion && currentQuestion.type === 'image' && currentQuestion.imageURL ? (
                  <div className="question-image" style={{marginBottom:12}}>
                    <img 
                      src={currentQuestion.imageURL} 
                      alt="Question image" 
                      className="question-img"
                      style={{width:120,height:120,objectFit:'contain',background:'#fff',borderRadius:16,boxShadow:'0 2px 8px #0001',border:'2px solid #eee'}}
                    />
                  </div>
                ) : null}
                <div
                  style={{
                    marginBottom: currentQuestion && (!currentQuestion.type || currentQuestion.type !== 'image' || !currentQuestion.imageURL) ? 0 : 10,
                    fontSize:
                      currentQuestion && (!currentQuestion.type || currentQuestion.type !== 'image' || !currentQuestion.imageURL)
                        ? '1.25rem'
                        : '1.08rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    width: '100%',
                    display: 'flex',
                    alignItems:
                      currentQuestion && (!currentQuestion.type || currentQuestion.type !== 'image' || !currentQuestion.imageURL)
                        ? 'center'
                        : 'flex-start',
                    justifyContent: 'center',
                    flex: currentQuestion && (!currentQuestion.type || currentQuestion.type !== 'image' || !currentQuestion.imageURL) ? 1 : undefined,
                    height: currentQuestion && (!currentQuestion.type || currentQuestion.type !== 'image' || !currentQuestion.imageURL) ? '100%' : undefined
                  }}
                >
                  {currentQuestion?.question}
                </div>
              </div>
              <div className="options" style={{
                width: '100%',
                maxWidth: '420px',
                minWidth: '0',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems: 'center',
                boxSizing: 'border-box',
                flex: '1 1 auto',
                justifyContent: 'flex-start',
                overflow: 'hidden'
              }}>
                {[currentQuestion.option0,currentQuestion.option1,currentQuestion.option2,currentQuestion.option3].map((option, index) => {
                  let btnClass = 'option-button';
                  if (showFeedback) {
                    if (index === currentQuestion.correctIndex) btnClass += ' correct';
                    else if (index === selectedAnswer) btnClass += ' incorrect';
                  }
                  return (
                    <button
                      key={index}
                      className={btnClass}
                      onClick={() => answerQuestion(index)}
                      disabled={showFeedback || eliminatedOption === index}
                      style={{
                        width: '100%',
                        maxWidth: '420px',
                        minWidth: '0',
                        fontSize: '1rem',
                        fontWeight: 600,
                        padding: '12px 0',
                        borderRadius: '14px',
                        boxShadow: '0 1px 6px #0001',
                        margin: 0,
                        flex: '0 0 auto',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word'
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              <div className="question-actions" style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                gap: '40px',
                background: 'rgba(123,74,226,0.95)',
                padding: '18px 0 24px 0',
                zIndex: 200
              }}>
                <button className="question-action-btn" onClick={handleRemoveOneOption} disabled={removeOptionUsed || showFeedback} style={{background:'none',border:'none',padding:0,cursor:'pointer'}}>
                  <img src={removeOneOptionImg} alt="remove one option" style={{width:60,height:60}} />
                </button>
                <button className="question-action-btn" onClick={handleGetNewQuestion} disabled={getNewQuestionUsed || showFeedback} style={{background:'none',border:'none',padding:0,cursor:'pointer'}}>
                  <img src={getNewQuestionImg} alt="get a new question" style={{width:60,height:60}} />
                </button>
              </div>
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

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'70vh'}}>
            <div style={{fontSize:60,marginBottom:20}}>🏆</div>
            <div style={{fontSize:36,fontWeight:900,letterSpacing:2,marginBottom:10}}>OYUN BİTTİ!</div>
            <div style={{fontSize:24,marginBottom:30,color:'#fff',background:'rgba(0,0,0,0.2)',padding:'16px 40px',borderRadius:20}}>
              Toplam Skor: <span style={{fontWeight:900}}>{totalScore}</span>
            </div>
            <button style={{background:'linear-gradient(45deg,#7B4AE2,#4ECDC4)',color:'#fff',fontWeight:900,fontSize:28,padding:'18px 60px',border:'none',borderRadius:40,boxShadow:'0 8px 24px #0003',cursor:'pointer',marginTop:20,letterSpacing:2}} onClick={resetGame}>TEKRAR OYNA</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

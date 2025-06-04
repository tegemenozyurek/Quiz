import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import removeOneOptionImg from './assets/question/remove one option.png';
import getNewQuestionImg from './assets/question/get a new question.png';
import playButtonImg from './assets/main-screen/play.png';
import categoryWheelImg from './assets/wheel-screen/category wheel.png';
import backButtonImg from './assets/store-screen/back.png';
import eddyImg from './assets/mascot/eddy.png';
import helpImg from './assets/selected-category/help.png';
import settingsImg from './assets/main-screen/settings.png';
import closeImg from './assets/resume-screen/close.png';
import playAgainImg from './assets/selected-category/play.png';
import buttonClickSound from './assets/sounds/buttonClick.mp3';
import wheelSpinSound from './assets/sounds/wheel.mp3';
import correctSound from './assets/sounds/correct.mp3';
import wrongSound from './assets/sounds/wrong.mp3';
import jokerSound from './assets/sounds/joker.mp3';
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
  const [colorsQuestions, setColorsQuestions] = useState([]);
  const [bodyPartsQuestions, setBodyPartsQuestions] = useState([]);
  const [animalsQuestions, setAnimalsQuestions] = useState([]);
  const [foodQuestions, setFoodQuestions] = useState([]);
  const [actionVerbsQuestions, setActionVerbsQuestions] = useState([]);
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
  const [roundCount, setRoundCount] = useState(1);
  const maxRounds = 3; // You can change this for more/less rounds per game
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCategoryReveal, setShowCategoryReveal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [wheelAudio, setWheelAudio] = useState(null);
  const [allQuestionsHistory, setAllQuestionsHistory] = useState([]);
  const [allAnswersHistory, setAllAnswersHistory] = useState([]);
  const [expandedRounds, setExpandedRounds] = useState({1: false, 2: false, 3: false});

  const categories = [
    { name: 'toys', emoji: '🧸', color: '#FF4B4B' },
    { name: 'colors', emoji: '🌈', color: '#3A86FF' },
    { name: 'animals', emoji: '🐕', color: '#43AA8B' },
    { name: 'body parts', emoji: '👁️', color: '#FFBE0B' },
    { name: 'food', emoji: '🍎', color: '#FF8C42' },
    { name: 'verbs', emoji: '🏃', color: '#9D4EDD' }
  ];

  const wheelAudioRef = useRef(null);
  const buttonAudioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const jokerAudioRef = useRef(null);
  const [isWheelAudioWarmed, setIsWheelAudioWarmed] = useState(false);
  const [isButtonAudioWarmed, setIsButtonAudioWarmed] = useState(false);

  // Fetch questions from toys.json, colors.json, and bodyParts.json
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const [toysResponse, colorsResponse, bodyPartsResponse, animalsResponse, foodResponse, actionVerbsResponse] = await Promise.all([
          fetch('/questions/toys.json'),
          fetch('/questions/colors.json'),
          fetch('/questions/bodyParts.json'),
          fetch('/questions/animals.json'),
          fetch('/questions/foods.json'),
          fetch('/questions/actionVerbs.json')
        ]);
        const toysData = await toysResponse.json();
        const colorsData = await colorsResponse.json();
        const bodyPartsData = await bodyPartsResponse.json();
        const animalsData = await animalsResponse.json();
        const foodData = await foodResponse.json();
        const actionVerbsData = await actionVerbsResponse.json();
        setToysQuestions(toysData.questions);
        setColorsQuestions(colorsData.questions);
        setBodyPartsQuestions(bodyPartsData.questions);
        setAnimalsQuestions(animalsData.questions);
        setFoodQuestions(foodData.questions);
        setActionVerbsQuestions(actionVerbsData.questions);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
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

  // Preload all audio once
  useEffect(() => {
    wheelAudioRef.current = new window.Audio(wheelSpinSound);
    wheelAudioRef.current.volume = 0.3;
    wheelAudioRef.current.loop = false;

    buttonAudioRef.current = new window.Audio(buttonClickSound);
    buttonAudioRef.current.volume = 0.3;

    correctAudioRef.current = new window.Audio(correctSound);
    correctAudioRef.current.volume = 0.3;

    wrongAudioRef.current = new window.Audio(wrongSound);
    wrongAudioRef.current.volume = 0.3;

    jokerAudioRef.current = new window.Audio(jokerSound);
    jokerAudioRef.current.volume = 0.3;
  }, []);

  // Warm up audio on first user interaction
  useEffect(() => {
    const warmUpAudio = () => {
      // Warm up wheel audio
      if (!isWheelAudioWarmed && wheelAudioRef.current) {
        wheelAudioRef.current.play().then(() => {
          wheelAudioRef.current.pause();
          wheelAudioRef.current.currentTime = 0;
          setIsWheelAudioWarmed(true);
        }).catch(() => {});
      }
      
      // Warm up button audio
      if (!isButtonAudioWarmed && buttonAudioRef.current) {
        buttonAudioRef.current.play().then(() => {
          buttonAudioRef.current.pause();
          buttonAudioRef.current.currentTime = 0;
          setIsButtonAudioWarmed(true);
        }).catch(() => {});
      }
    };
    
    window.addEventListener('pointerdown', warmUpAudio, { once: true });
    return () => window.removeEventListener('pointerdown', warmUpAudio);
  }, [isWheelAudioWarmed, isButtonAudioWarmed]);

  const playWheelSound = useCallback(() => {
    if (isSoundEnabled && wheelAudioRef.current) {
      wheelAudioRef.current.pause();
      wheelAudioRef.current.currentTime = 0;
      wheelAudioRef.current.play();
    }
  }, [isSoundEnabled]);

  const stopWheelSound = useCallback(() => {
    if (wheelAudioRef.current) {
      wheelAudioRef.current.pause();
      wheelAudioRef.current.currentTime = 0;
    }
  }, []);

  const playButtonSound = useCallback(() => {
    if (isSoundEnabled && buttonAudioRef.current) {
      buttonAudioRef.current.pause();
      buttonAudioRef.current.currentTime = 0;
      buttonAudioRef.current.play();
    }
  }, [isSoundEnabled]);

  const playCorrectSound = useCallback(() => {
    if (isSoundEnabled && correctAudioRef.current) {
      correctAudioRef.current.pause();
      correctAudioRef.current.currentTime = 0;
      correctAudioRef.current.play();
    }
  }, [isSoundEnabled]);

  const playWrongSound = useCallback(() => {
    if (isSoundEnabled && wrongAudioRef.current) {
      wrongAudioRef.current.pause();
      wrongAudioRef.current.currentTime = 0;
      wrongAudioRef.current.play();
    }
  }, [isSoundEnabled]);

  const playJokerSound = useCallback(() => {
    if (isSoundEnabled && jokerAudioRef.current) {
      jokerAudioRef.current.pause();
      jokerAudioRef.current.currentTime = 0;
      jokerAudioRef.current.play();
    }
  }, [isSoundEnabled]);

  // Update spinWheel function to include animals
  const spinWheel = () => {
    if (isSpinning) return;
    playWheelSound();
    setIsSpinning(true);
    const spins = Math.floor(Math.random() * 5) + 5;
    const extraRotation = Math.floor(Math.random() * 360);
    const finalRotation = wheelRotation + (spins * 360) + extraRotation;
    setWheelRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const segmentAngle = 60;
      let normalizedRotation = finalRotation % 360;
      if (normalizedRotation < 0) normalizedRotation += 360;
      const reversedRotation = (360 - normalizedRotation) % 360;
      const selectedIndex = Math.floor(reversedRotation / segmentAngle) % categories.length;
      const selectedCategoryName = categories[selectedIndex].name;
      setSelectedCategory(selectedCategoryName);
      setShowCategoryReveal(true);

      setTimeout(() => {
        setShowCategoryReveal(false);
        let selectedQuestions = [];

        if (selectedCategoryName === 'toys' && toysQuestions.length > 0) {
          selectedQuestions = shuffleQuestions([...toysQuestions]).slice(0, 3);
        } else if (selectedCategoryName === 'colors' && colorsQuestions.length > 0) {
          selectedQuestions = shuffleQuestions([...colorsQuestions]).slice(0, 3);
        } else if (selectedCategoryName === 'body parts' && bodyPartsQuestions.length > 0) {
          selectedQuestions = shuffleQuestions([...bodyPartsQuestions]).slice(0, 3);
        } else if (selectedCategoryName === 'animals' && animalsQuestions.length > 0) {
          selectedQuestions = shuffleQuestions([...animalsQuestions]).slice(0, 3);
        } else if (selectedCategoryName === 'food' && foodQuestions.length > 0) {
          selectedQuestions = shuffleQuestions([...foodQuestions]).slice(0, 3);
        } else if (selectedCategoryName === 'verbs' && actionVerbsQuestions.length > 0) {
          selectedQuestions = shuffleQuestions([...actionVerbsQuestions]).slice(0, 3);
        }

        if (selectedQuestions.length > 0) {
          setQuestionsForRound(selectedQuestions);
          setRandomizedQuestions(selectedQuestions);
          setGameState('question');
          setQuestionIndex(0);
          setCurrentQuestion(selectedQuestions[0]);
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
      // Round is complete
      const nextRound = roundCount + 1;
      if (nextRound > maxRounds) {
        // Game is complete
        const finalScore = allAnswersHistory.filter((ans, i) => ans === allQuestionsHistory[i].answer).length;
        setScore(finalScore);
        setGameState('gameover');
      } else {
        // Move to next round
        setRoundCount(nextRound);
        setGameState('wheel');
      }
    }
  };

  // Update answerQuestion function to use answer instead of correctIndex
  const answerQuestion = (index) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
    setSelectedAnswers(prev => {
      const arr = [...prev];
      arr[questionIndex] = index;
      return arr;
    });
    setShowFeedback(true);
    
    // Store question in history and update score immediately
    setAllQuestionsHistory(prev => [...prev, currentQuestion]);
    setAllAnswersHistory(prev => [...prev, index]);
    
    if (index === currentQuestion.answer) {
      playCorrectSound();
      setShowConfetti(true);
      setScore(prevScore => prevScore + 1);
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);
    } else {
      playWrongSound();
    }
    
    setTimeout(() => {
      goToNextQuestion();
    }, 1500);
  };

  // Update handleRemoveOneOption function to use answer instead of correctIndex
  const handleRemoveOneOption = () => {
    if (removeOptionUsed || showFeedback) return;
    // Find incorrect options
    const incorrectOptions = [0,1,2,3].filter(idx => idx !== currentQuestion.answer && idx !== eliminatedOption);
    if (incorrectOptions.length > 0) {
      playButtonSound();
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
      playButtonSound();
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
    setRoundCount(1);
    setAllQuestionsHistory([]);
    setAllAnswersHistory([]);
    setExpandedRounds({1: false, 2: false, 3: false});
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
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}>
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
                onClick={() => {
                  playButtonSound();
                  setGameState('wheel');
                }}
              />
              
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '35px',
                marginTop: '10px'
              }}>
                <img 
                  src={helpImg} 
                  alt="Help" 
                  style={{
                    width: '72px',
                    height: '70px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => {
                    playButtonSound();
                    setShowHelpModal(true);
                  }}
                />
                <img 
                  src={settingsImg} 
                  alt="Settings" 
                  style={{
                    width: '85px',
                    height: '70px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => {
                    playButtonSound();
                    setShowSettingsModal(true);
                  }}
                />
              </div>
            </div>

            {/* Help Modal */}
            {showHelpModal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '20px'
              }}>
                <div style={{
                  background: 'linear-gradient(145deg, #7B4AE2, #6039c8)',
                  borderRadius: '28px',
                  padding: '35px 25px',
                  position: 'relative',
                  width: '100%',
                  maxWidth: '480px',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  color: '#fff',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <img 
                    src={closeImg} 
                    alt="Close" 
                    style={{
                      position: 'absolute',
                      top: '25px',
                      right: '25px',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, opacity 0.2s ease',
                      filter: 'brightness(0) invert(1)',
                      opacity: 0.9,
                      ':hover': {
                        transform: 'scale(1.1)',
                        opacity: 1
                      }
                    }}
                    onClick={() => {
                      playButtonSound();
                      setShowHelpModal(false);
                    }}
                  />
                  <h2 style={{
                    color: '#fff',
                    fontSize: 'clamp(24px, 5vw, 28px)',
                    marginBottom: '30px',
                    textAlign: 'center',
                    fontWeight: '800',
                    letterSpacing: '1px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>How to Play</h2>
                  <div style={{
                    fontSize: 'clamp(14px, 3vw, 16px)',
                    lineHeight: '1.8',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '20px',
                      padding: '25px',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <p style={{
                        fontSize: 'clamp(16px, 3.5vw, 18px)',
                        fontWeight: '600',
                        marginBottom: '15px',
                        color: '#4ECDC4'
                      }}>
                        Game Structure
                      </p>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                        <p>• The game consists of 3 rounds</p>
                        <p>• Each round has 3 questions</p>
                        <p>• You have 25 seconds to answer each question</p>
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '20px',
                      padding: '25px',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <p style={{
                        fontSize: 'clamp(16px, 3.5vw, 18px)',
                        fontWeight: '600',
                        marginBottom: '15px',
                        color: '#4ECDC4'
                      }}>
                        Power-ups
                      </p>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          background: 'rgba(0,0,0,0.15)',
                          padding: '15px',
                          borderRadius: '16px',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img 
                              src={removeOneOptionImg} 
                              alt="Remove Option" 
                              style={{width: '35px', height: '35px'}}
                            />
                          </div>
                          <span>Remove one wrong option</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          background: 'rgba(0,0,0,0.15)',
                          padding: '15px',
                          borderRadius: '16px',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img 
                              src={getNewQuestionImg} 
                              alt="New Question" 
                              style={{width: '35px', height: '35px'}}
                            />
                          </div>
                          <span>Get a new question</span>
                        </div>
                        <p style={{
                          fontSize: '14px',
                          opacity: 0.9,
                          fontStyle: 'italic',
                          textAlign: 'center',
                          marginTop: '5px'
                        }}>
                          You can use each power-up once per round. Choose wisely!
                        </p>
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'rgba(78,205,196,0.15)',
                      padding: '20px',
                      borderRadius: '20px',
                      textAlign: 'center',
                      fontWeight: '600',
                      border: '1px solid rgba(78,205,196,0.2)',
                      marginTop: '10px'
                    }}>
                      <p style={{marginBottom: '8px'}}>Score 1 point for each correct answer!</p>
                      <p style={{
                        fontSize: 'clamp(16px, 3.5vw, 18px)',
                        color: '#4ECDC4'
                      }}>
                        Try to achieve the highest score! 🎯
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Modal */}
            {showSettingsModal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '20px'
              }}>
                <div style={{
                  background: 'linear-gradient(145deg, #7B4AE2, #6039c8)',
                  borderRadius: '28px',
                  padding: '35px 25px',
                  position: 'relative',
                  width: '100%',
                  maxWidth: '480px',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  color: '#fff',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <img 
                    src={closeImg} 
                    alt="Close" 
                    style={{
                      position: 'absolute',
                      top: '25px',
                      right: '25px',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, opacity 0.2s ease',
                      filter: 'brightness(0) invert(1)',
                      opacity: 0.9,
                      ':hover': {
                        transform: 'scale(1.1)',
                        opacity: 1
                      }
                    }}
                    onClick={() => {
                      playButtonSound();
                      setShowSettingsModal(false);
                    }}
                  />
                  <h2 style={{
                    color: '#fff',
                    fontSize: 'clamp(24px, 5vw, 28px)',
                    marginBottom: '30px',
                    textAlign: 'center',
                    fontWeight: '800',
                    letterSpacing: '1px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>Settings</h2>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}>
                    {/* Sound Effects Toggle */}
                    <div style={{
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '20px',
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                      }}>
                        <span style={{fontSize: '24px'}}>🔊</span>
                        <span style={{fontSize: 'clamp(16px, 3.5vw, 18px)'}}>Sound Effects</span>
                      </div>
                      <div 
                        onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                        style={{
                          width: '60px',
                          height: '32px',
                          background: isSoundEnabled ? '#4ECDC4' : 'rgba(255,255,255,0.2)',
                          borderRadius: '16px',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease'
                        }}
                      >
                        <div style={{
                          width: '26px',
                          height: '26px',
                          background: '#fff',
                          borderRadius: '13px',
                          position: 'absolute',
                          top: '3px',
                          left: isSoundEnabled ? '31px' : '3px',
                          transition: 'left 0.3s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              <div className="category-reveal-container">
                <div className="category-reveal-content">
                  <div className="category-emoji">
                    {categories.find(cat => cat.name === selectedCategory)?.emoji}
                  </div>
                  <div className="category-name">
                    {selectedCategory}
                  </div>
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
                  <span style={{color:'#4ECDC4'}}>✓</span>{allAnswersHistory.filter((ans, i) => ans === allQuestionsHistory[i].answer).length}
                  <span style={{margin:'0 2px'}}>|</span>
                  <span style={{color:'#ff4444'}}>✗</span>{allAnswersHistory.filter((ans, i) => ans !== allQuestionsHistory[i].answer).length}
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
                  padding: '20px',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxSizing: 'border-box',
                  flex: '0 0 auto',
                  overflow: 'hidden'
                }}
              >
                {currentQuestion && currentQuestion.type === 'image' && currentQuestion.image ? (
                  <>
                    <div className="question-image" style={{
                      marginBottom: 12,
                      width: '120px',
                      height: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img 
                        src={currentQuestion.image} 
                        alt="Question image" 
                        className="question-img"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          background: '#fff',
                          borderRadius: 16,
                          boxShadow: '0 2px 8px #0001',
                          border: '2px solid #eee'
                        }}
                      />
                    </div>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      wordBreak: 'break-word',
                      width: '100%'
                    }}>
                      {currentQuestion?.question}
                    </div>
                  </>
                ) : (
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {currentQuestion?.question}
                  </div>
                )}
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
                {currentQuestion?.options?.map((option, index) => {
                  let btnClass = 'option-button';
                  if (showFeedback) {
                    if (index === currentQuestion.answer) btnClass += ' correct';
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
                <button 
                  className="question-action-btn" 
                  onClick={handleRemoveOneOption} 
                  disabled={removeOptionUsed || showFeedback} 
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  <img 
                    src={removeOneOptionImg} 
                    alt="remove one option" 
                    style={{
                      width: '75px',
                      height: '75px'
                    }} 
                  />
                </button>
                <button 
                  className="question-action-btn" 
                  onClick={handleGetNewQuestion} 
                  disabled={getNewQuestionUsed || showFeedback} 
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  <img 
                    src={getNewQuestionImg} 
                    alt="get a new question" 
                    style={{
                      width: '75px',
                      height: '75px'
                    }} 
                  />
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
            ) : selectedCategory === 'colors' ? (
              <div>
                <div className="category-result">
                  <div className="selected-category-emoji">🌈</div>
                  <div className="selected-category-name">COLORS</div>
                </div>
                <div className="final-score">
                  You scored {score} out of {randomizedQuestions.length}!
                </div>
              </div>
            ) : selectedCategory === 'body parts' ? (
              <div>
                <div className="category-result">
                  <div className="selected-category-emoji">👁️</div>
                  <div className="selected-category-name">BODY PARTS</div>
                </div>
                <div className="final-score">
                  You scored {score} out of {randomizedQuestions.length}!
                </div>
              </div>
            ) : selectedCategory === 'animals' ? (
              <div>
                <div className="category-result">
                  <div className="selected-category-emoji">🐕</div>
                  <div className="selected-category-name">ANIMALS</div>
                </div>
                <div className="final-score">
                  You scored {score} out of {randomizedQuestions.length}!
                </div>
              </div>
            ) : selectedCategory === 'food' ? (
              <div>
                <div className="category-result">
                  <div className="selected-category-emoji">🍎</div>
                  <div className="selected-category-name">FOOD</div>
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
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            minHeight: '100vh',
            padding: '30px 20px',
            background: '#7B4AE2',
            overflowY: 'auto'
          }}>
            <div style={{
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: 2,
              marginBottom: 30,
              color: '#fff'
            }}>GAME OVER!</div>

            {/* Improved score display */}
            <div style={{
              width: '100%',
              maxWidth: '400px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '25px',
              marginBottom: '30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{
                fontSize: '28px',
                color: '#fff',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                Final Score: <span style={{color: '#4ECDC4', fontWeight: '800'}}>{allAnswersHistory.filter((ans, i) => ans === allQuestionsHistory[i].answer).length}</span>
              </div>

              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                gap: '20px'
              }}>
                <div style={{
                  flex: 1,
                  maxWidth: '160px',
                  background: 'rgba(78,205,196,0.15)',
                  borderRadius: '16px',
                  padding: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  border: '1px solid rgba(78,205,196,0.3)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(78,205,196,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>✓</div>
                  <div style={{
                    color: '#4ECDC4',
                    fontSize: '24px',
                    fontWeight: '800'
                  }}>
                    {allAnswersHistory.filter((ans, i) => ans === allQuestionsHistory[i].answer).length}
                  </div>
                  <div style={{
                    color: '#fff',
                    fontSize: '14px',
                    opacity: 0.8
                  }}>Correct</div>
                </div>

                <div style={{
                  flex: 1,
                  maxWidth: '160px',
                  background: 'rgba(255,75,75,0.15)',
                  borderRadius: '16px',
                  padding: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  border: '1px solid rgba(255,75,75,0.3)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255,75,75,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>✗</div>
                  <div style={{
                    color: '#ff4444',
                    fontSize: '24px',
                    fontWeight: '800'
                  }}>
                    {allAnswersHistory.filter((ans, i) => ans !== allQuestionsHistory[i].answer).length}
                  </div>
                  <div style={{
                    color: '#fff',
                    fontSize: '14px',
                    opacity: 0.8
                  }}>Wrong</div>
                </div>
              </div>
            </div>

            <div style={{
              width: '100%',
              maxWidth: '600px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              marginBottom: '30px'
            }}>
              {[1, 2, 3].map(round => {
                const startIndex = (round - 1) * 3;
                const endIndex = startIndex + 3;
                const roundQuestions = allQuestionsHistory.slice(startIndex, endIndex);
                const roundAnswers = allAnswersHistory.slice(startIndex, endIndex);
                
                return (
                  <div key={round} style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      onClick={() => setExpandedRounds(prev => ({...prev, [round]: !prev[round]}))}
                      style={{
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.05)',
                        borderBottom: expandedRounds[round] && roundQuestions.length > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                      }}>
                        <span style={{
                          fontSize: '24px',
                          fontWeight: '800',
                          color: '#fff'
                        }}>Round {round}</span>
                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          fontSize: '16px'
                        }}>
                          {roundQuestions.length > 0 ? (
                            <>
                              <span style={{color: '#4ECDC4'}}>✓ {roundAnswers.filter((ans, i) => ans === roundQuestions[i].answer).length}</span>
                              <span style={{color: '#ff4444'}}>✗ {roundAnswers.filter((ans, i) => ans !== roundQuestions[i].answer).length}</span>
                            </>
                          ) : (
                            <span style={{opacity: 0.7}}>Not played</span>
                          )}
                        </div>
                      </div>
                      {roundQuestions.length > 0 && (
                        <span style={{
                          fontSize: '24px',
                          color: '#fff',
                          transform: expandedRounds[round] ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease'
                        }}>▼</span>
                      )}
                    </div>
                    
                    {expandedRounds[round] && roundQuestions.length > 0 && (
                      <div style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                      }}>
                        {roundQuestions.map((question, index) => {
                          const userAnswer = roundAnswers[index];
                          const isCorrect = userAnswer === question.answer;
                          
                          return (
                            <div key={index} style={{
                              background: isCorrect ? 
                                'rgba(78,205,196,0.2)' : 'rgba(255,75,75,0.2)',
                              padding: '15px',
                              borderRadius: '12px',
                              color: '#fff'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                marginBottom: '12px'
                              }}>
                                <span style={{
                                  fontSize: '18px',
                                  opacity: 0.9,
                                  marginTop: '2px'
                                }}>
                                  {isCorrect ? '✓' : '✗'}
                                </span>
                                <div style={{flex: 1}}>
                                  <div style={{marginBottom: '8px'}}>{question.question}</div>
                                  {question.type === 'image' && question.image && (
                                    <img 
                                      src={question.image} 
                                      alt="Question" 
                                      style={{
                                        width: '100%',
                                        maxWidth: '200px',
                                        height: 'auto',
                                        borderRadius: '8px',
                                        marginBottom: '8px'
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px',
                                fontSize: '14px',
                                opacity: 0.9
                              }}>
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} style={{
                                    padding: '8px',
                                    background: userAnswer === optIndex ? 
                                      (question.answer === optIndex ? 'rgba(78,205,196,0.3)' : 'rgba(255,75,75,0.3)') :
                                      (question.answer === optIndex ? 'rgba(78,205,196,0.3)' : 'rgba(255,255,255,0.1)'),
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}>
                                    {userAnswer === optIndex && (
                                      <span style={{
                                        fontSize: '14px',
                                        opacity: 0.8
                                      }}>
                                        {question.answer === optIndex ? '✓' : '✗'}
                                      </span>
                                    )}
                                    {option}
                                    {question.answer === optIndex && userAnswer !== optIndex && (
                                      <span style={{
                                        marginLeft: 'auto',
                                        fontSize: '12px',
                                        color: '#4ECDC4',
                                        fontWeight: '600'
                                      }}>
                                        (Correct)
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Game over play again button */}
            <img 
              src={playAgainImg} 
              alt="Play Again" 
              style={{
                width: '160px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                marginTop: '20px',
                ':hover': {
                  transform: 'scale(1.1)'
                }
              }}
              onClick={() => {
                playButtonSound();
                resetGame();
              }}
            />
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

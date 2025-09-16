import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const PlayQuiz = () => {
  const { quizzId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const { config, quizz, questions } = location.state || {}
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedChoice, setSelectedChoice] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  
  const timerRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  // Initialisation
  useEffect(() => {
    if (!config || !quizz || !questions) {
      navigate('/dashboard')
      return
    }

    if (!isInitialized) {
      // Initialiser le timer
      if (config.timeMode === 'total') {
        setTimeLeft(config.totalTime) // en secondes
      } else {
        setTimeLeft(config.timePerQuestion) // en secondes
      }
      setIsInitialized(true)
      startTimeRef.current = Date.now()
    }
  }, [config, quizz, questions, navigate, isInitialized])

  // Timer
  useEffect(() => {
    // Ne pas démarrer le timer si on n'est pas initialisé ou si c'est fini
    if (!isInitialized || !config || isFinished || timeLeft <= 0) {
      return
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1
        
        // Si le temps est écoulé
        if (newTime <= 0) {
          if (config.timeMode === 'total') {
            // Fin du quizz en mode temps total
            setTimeout(() => finishQuiz(), 100)
          } else {
            // Passer à la question suivante en mode par question
            setTimeout(() => handleNextQuestion(), 100)
          }
          return 0
        }
        
        return newTime
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeLeft, isFinished, config, isInitialized])

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleAnswerChange = (answer) => {
    if (currentQuestion.question_type === 'multiple_choice') {
      setSelectedChoice(answer)
    } else {
      setUserAnswer(answer)
    }
  }

  const handleNextQuestion = () => {
    // Sauvegarder la réponse
    const answer = currentQuestion.question_type === 'multiple_choice' ? selectedChoice : userAnswer
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        answer: answer,
        isCorrect: checkAnswer(answer, currentQuestion),
        timeSpent: config.timeMode === 'per_question' ? (config.timePerQuestion - timeLeft) : null
      }
    }))

    // Reset pour la prochaine question
    setUserAnswer('')
    setSelectedChoice('')

    if (isLastQuestion) {
      // Terminer le quizz
      setIsFinished(true)
      setShowResults(true)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    } else {
      // Passer à la question suivante
      setCurrentQuestionIndex(prev => prev + 1)
      if (config.timeMode === 'per_question') {
        setTimeLeft(config.timePerQuestion)
      }
    }
  }

  const checkAnswer = (userAnswer, question) => {
    if (!userAnswer) return false
    return userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim()
  }

  const finishQuiz = () => {
    // Arrêter le timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Sauvegarder la réponse actuelle si elle existe
    if (currentQuestion && (userAnswer || selectedChoice)) {
      const answer = currentQuestion.question_type === 'multiple_choice' ? selectedChoice : userAnswer
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: {
          answer: answer,
          isCorrect: checkAnswer(answer, currentQuestion),
          timeSpent: config.timeMode === 'per_question' ? (config.timePerQuestion - timeLeft) : null
        }
      }))
    }

    // Finir le quizz
    setIsFinished(true)
    setShowResults(true)
  }

  const calculateScore = () => {
    const totalQuestions = questions.length
    const correctAnswers = Object.values(userAnswers).filter(answer => answer.isCorrect).length
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)
    return { correct: correctAnswers, total: totalQuestions, percentage }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (config.timeMode === 'total') {
      const percentage = (timeLeft / config.totalTime) * 100
      if (percentage < 10) return 'timer-critical'
      if (percentage < 25) return 'timer-warning'
      return 'timer-normal'
    } else {
      const percentage = (timeLeft / config.timePerQuestion) * 100
      if (percentage < 20) return 'timer-critical'
      if (percentage < 50) return 'timer-warning'
      return 'timer-normal'
    }
  }

  if (!config || !quizz || !questions || !isInitialized) {
    return (
      <div className="app-layout">
        <Header />
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{!config ? 'Redirection...' : 'Initialisation du quizz...'}</p>
          </div>
        </main>
      </div>
    )
  }

  if (showResults) {
    const score = calculateScore()
    const totalTime = Math.floor((Date.now() - startTimeRef.current) / 1000)

    return (
      <div className="app-layout">
        <Header />
        <main className="main-content">
          <div className="page-container">
            <div className="quiz-results">
              <h1>🎉 Quizz terminé !</h1>
              <h2>{quizz.title}</h2>
              
              <div className="score-summary">
                <div className="score-circle">
                  <span className="score-percentage">{score.percentage}%</span>
                  <span className="score-fraction">{score.correct}/{score.total}</span>
                </div>
                
                <div className="score-details">
                  <div className="score-item">
                    <span className="score-label">Réponses correctes:</span>
                    <span className="score-value correct">{score.correct}</span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">Réponses incorrectes:</span>
                    <span className="score-value incorrect">{score.total - score.correct}</span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">Temps total:</span>
                    <span className="score-value">{formatTime(totalTime)}</span>
                  </div>
                </div>
              </div>

              <div className="results-actions">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="secondary-button"
                >
                  Retour au Dashboard
                </button>
                <button 
                  onClick={() => navigate(`/quiz-config/${quizzId}`)}
                  className="primary-button"
                >
                  Refaire le quizz
                </button>
              </div>

              <div className="detailed-results">
                <h3>Détail des réponses</h3>
                {questions.map((question, index) => {
                  const userAnswer = userAnswers[question.id]
                  return (
                    <div key={question.id} className={`result-item ${userAnswer?.isCorrect ? 'correct' : 'incorrect'}`}>
                      <div className="result-header">
                        <span className="question-number">Question {index + 1}</span>
                        <span className={`result-icon ${userAnswer?.isCorrect ? 'correct' : 'incorrect'}`}>
                          {userAnswer?.isCorrect ? '✅' : '❌'}
                        </span>
                      </div>
                      <p className="result-question">{question.question_text}</p>
                      <div className="result-answers">
                        <p><strong>Votre réponse:</strong> {userAnswer?.answer || 'Pas de réponse'}</p>
                        <p><strong>Réponse correcte:</strong> {question.correct_answer}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <div className="page-container">
          <div className="quiz-play-header">
            <div className="quiz-progress">
              <span>Question {currentQuestionIndex + 1} sur {questions.length}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
            
            <div className={`timer ${getTimerColor()}`}>
              <span className="timer-icon">⏱️</span>
              <span className="timer-text">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="quiz-question-container">
            <div className="question-card">
              <h2 className="question-text">{currentQuestion.question_text}</h2>
              
              {currentQuestion.question_image_url && (
                <div className="question-image">
                  <img 
                    src={currentQuestion.question_image_url} 
                    alt="Question illustration"
                  />
                </div>
              )}

              <div className="answer-section">
                {currentQuestion.question_type === 'multiple_choice' ? (
                  <div className="choices-container">
                    {[
                      { key: 'choice_a', label: 'A' },
                      { key: 'choice_b', label: 'B' },
                      { key: 'choice_c', label: 'C' },
                      { key: 'choice_d', label: 'D' }
                    ].map(({ key, label }) => {
                      const choice = currentQuestion[key]
                      if (!choice) return null
                      
                      return (
                        <label key={key} className="choice-option">
                          <input
                            type="radio"
                            name="answer"
                            value={choice}
                            checked={selectedChoice === choice}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                          />
                          <span className="choice-label">
                            <span className="choice-letter">{label}</span>
                            <span className="choice-text">{choice}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-answer-container">
                    <label htmlFor="textAnswer">Votre réponse:</label>
                    <input
                      type="text"
                      id="textAnswer"
                      value={userAnswer}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="text-answer-input"
                      placeholder="Tapez votre réponse ici..."
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <div className="question-actions">
                <button 
                  onClick={handleNextQuestion}
                  className="primary-button next-question-btn"
                  disabled={!userAnswer && !selectedChoice}
                >
                  {isLastQuestion ? '🏁 Terminer' : 'Question suivante →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PlayQuiz

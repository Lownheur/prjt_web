import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const QuizConfig = () => {
  const { quizzId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [quizz, setQuizz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [timeMode, setTimeMode] = useState('total') // 'total' | 'per_question'
  const [totalTime, setTotalTime] = useState(10) // en minutes
  const [timePerQuestion, setTimePerQuestion] = useState(30) // en secondes
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && quizzId) {
      loadQuizzData()
    }
  }, [user, quizzId])

  const loadQuizzData = async () => {
    setLoading(true)
    setError('')

    // Charger les infos du quizz
    const { data: quizzData, error: quizzError } = await supabase
      .from('quizz_theme')
      .select('*')
      .eq('id', quizzId)
      .single()

    if (quizzError) {
      setError('Quizz non trouvé')
      setLoading(false)
      return
    }

    // Vérifier l'accès (propriétaire ou quizz public)
    if (!quizzData.is_public && quizzData.user_id !== user.id) {
      setError('Accès refusé à ce quizz')
      setLoading(false)
      return
    }

    setQuizz(quizzData)

    // Charger les questions
    const { data: questionsData, error: questionsError } = await supabase
      .from('quizz_question')
      .select('*')
      .eq('quizz_id', quizzId)
      .order('order_index', { ascending: true })

    if (questionsError) {
      console.error('Erreur lors du chargement des questions:', questionsError)
      setError('Erreur lors du chargement des questions')
    } else {
      if (questionsData.length === 0) {
        setError('Ce quizz ne contient aucune question')
      } else {
        setQuestions(questionsData)
      }
    }

    setLoading(false)
  }

  const handleStartQuiz = () => {
    const config = {
      timeMode,
      totalTime: timeMode === 'total' ? totalTime * 60 : null, // convertir en secondes
      timePerQuestion: timeMode === 'per_question' ? timePerQuestion : null
    }

    // Naviguer vers la page de jeu avec la config
    navigate(`/play-quiz/${quizzId}`, { 
      state: { 
        config,
        quizz,
        questions 
      }
    })
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const calculateTotalTime = () => {
    if (timeMode === 'total') {
      return `${totalTime} minute${totalTime > 1 ? 's' : ''}`
    } else {
      const total = Math.ceil((timePerQuestion * questions.length) / 60)
      return `~${total} minute${total > 1 ? 's' : ''} (${timePerQuestion}s par question)`
    }
  }

  if (loading) {
    return (
      <div className="app-layout">
        <Header />
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement du quizz...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !quizz) {
    return (
      <div className="app-layout">
        <Header />
        <main className="main-content">
          <div className="page-container">
            <div className="error-state">
              <h2>Erreur</h2>
              <p>{error || 'Quizz non trouvé'}</p>
              <button onClick={handleBackToDashboard} className="primary-button">
                Retour au Dashboard
              </button>
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
          <div className="quiz-config-header">
            <button 
              onClick={handleBackToDashboard}
              className="back-button"
            >
              ← Retour
            </button>
            
            <div className="quiz-info">
              <h1>{quizz.title}</h1>
              {quizz.description && <p className="quiz-description">{quizz.description}</p>}
              <div className="quiz-stats">
                <span className="question-count-badge">
                  {questions.length} question{questions.length !== 1 ? 's' : ''}
                </span>
                {quizz.is_public && <span className="public-badge">Public</span>}
              </div>
            </div>
          </div>

          <div className="quiz-config-content">
            <div className="config-section">
              <h2>Configuration du temps</h2>
              
              <div className="time-mode-selection">
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="timeMode"
                      value="total"
                      checked={timeMode === 'total'}
                      onChange={(e) => setTimeMode(e.target.value)}
                    />
                    <span className="radio-label">
                      <strong>Temps total</strong>
                      <small>Définir une durée totale pour tout le quizz</small>
                    </span>
                  </label>

                  <label className="radio-option">
                    <input
                      type="radio"
                      name="timeMode"
                      value="per_question"
                      checked={timeMode === 'per_question'}
                      onChange={(e) => setTimeMode(e.target.value)}
                    />
                    <span className="radio-label">
                      <strong>Temps par question</strong>
                      <small>Définir un temps limite pour chaque question</small>
                    </span>
                  </label>
                </div>
              </div>

              {timeMode === 'total' ? (
                <div className="time-input-section">
                  <label htmlFor="totalTime">Temps total (minutes)</label>
                  <div className="time-input-group">
                    <input
                      type="number"
                      id="totalTime"
                      value={totalTime}
                      onChange={(e) => setTotalTime(Math.max(1, parseInt(e.target.value) || 1))}
                      className="time-input"
                      min="1"
                      max="120"
                    />
                    <span className="time-unit">minutes</span>
                  </div>
                  <div className="time-suggestion">
                    <small>Suggestion: ~{Math.ceil(questions.length * 1.5)} minutes pour ce quizz</small>
                  </div>
                </div>
              ) : (
                <div className="time-input-section">
                  <label htmlFor="timePerQuestion">Temps par question (secondes)</label>
                  <div className="time-input-group">
                    <input
                      type="number"
                      id="timePerQuestion"
                      value={timePerQuestion}
                      onChange={(e) => setTimePerQuestion(Math.max(10, parseInt(e.target.value) || 30))}
                      className="time-input"
                      min="10"
                      max="300"
                    />
                    <span className="time-unit">secondes</span>
                  </div>
                  <div className="time-suggestion">
                    <small>Suggestion: 30-60 secondes par question</small>
                  </div>
                </div>
              )}

              <div className="config-summary">
                <h3>Résumé</h3>
                <div className="summary-item">
                  <span>Questions:</span>
                  <strong>{questions.length}</strong>
                </div>
                <div className="summary-item">
                  <span>Durée estimée:</span>
                  <strong>{calculateTotalTime()}</strong>
                </div>
                <div className="summary-item">
                  <span>Mode:</span>
                  <strong>{timeMode === 'total' ? 'Temps total' : 'Temps par question'}</strong>
                </div>
              </div>
            </div>

            <div className="config-actions">
              <button 
                onClick={handleBackToDashboard}
                className="secondary-button"
              >
                Annuler
              </button>
              <button 
                onClick={handleStartQuiz}
                className="primary-button start-quiz-btn"
              >
                🚀 Commencer le quizz
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default QuizConfig

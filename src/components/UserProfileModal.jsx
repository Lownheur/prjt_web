import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const UserProfileModal = ({ isOpen, onClose, user }) => {
  const [publicQuizzes, setPublicQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen && user) {
      loadUserQuizzes()
    }
  }, [isOpen, user])

  const loadUserQuizzes = async () => {
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('quizz_theme')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur lors du chargement des quizz:', error)
        setError('Erreur lors du chargement des quizz')
      } else {
        setPublicQuizzes(data || [])
      }
    } catch (err) {
      console.error('Erreur inattendue:', err)
      setError('Erreur inattendue')
    }

    setLoading(false)
  }

  const handlePlayQuiz = (quiz) => {
    onClose()
    navigate(`/quiz-config/${quiz.id}`)
  }

  const getProfileImage = () => {
    if (user?.photo_url) {
      return user.photo_url
    }
    return null
  }

  const getInitials = () => {
    return user?.username ? user.username.charAt(0).toUpperCase() : '?'
  }

  if (!isOpen || !user) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Profil de {user.username}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="modal-body">
          <div className="user-profile-header">
            <div className="user-profile-avatar">
              {getProfileImage() ? (
                <img 
                  src={getProfileImage()} 
                  alt={`Photo de profil de ${user.username}`}
                  className="user-profile-photo"
                />
              ) : (
                <div className="user-profile-photo-placeholder">
                  <span className="user-profile-initials">{getInitials()}</span>
                </div>
              )}
            </div>
            
            <div className="user-profile-info">
              <h3>{user.username}</h3>
              {user.description && (
                <p className="user-profile-description">{user.description}</p>
              )}
              <div className="user-profile-stats">
                <span className="stat-item">
                  {publicQuizzes.length} quizz{publicQuizzes.length !== 1 ? 's' : ''} public{publicQuizzes.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="user-quizzes-section">
            <h4>Quizz publics</h4>
            
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Chargement des quizz...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
              </div>
            ) : publicQuizzes.length === 0 ? (
              <div className="empty-state">
                <p>Aucun quizz public pour le moment</p>
              </div>
            ) : (
              <div className="user-quizzes-grid">
                {publicQuizzes.map((quiz) => (
                  <div key={quiz.id} className="user-quiz-card">
                    <div className="quiz-card-content">
                      <h5 className="quiz-title">{quiz.title}</h5>
                      {quiz.description && (
                        <p className="quiz-description">{quiz.description}</p>
                      )}
                      <div className="quiz-info">
                        <span className="question-count">
                          {quiz.question_count || 0} question{(quiz.question_count || 0) !== 1 ? 's' : ''}
                        </span>
                        <span className="public-badge">Public</span>
                      </div>
                    </div>
                    
                    <div className="quiz-card-actions">
                      <button 
                        onClick={() => handlePlayQuiz(quiz)}
                        className="primary-button play-quiz-btn"
                      >
                        🚀 Jouer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfileModal

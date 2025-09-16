import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const UserCard = ({ user, onClick, isCurrentUser = false }) => {
  const [quizzCount, setQuizzCount] = useState(0)

  useEffect(() => {
    loadQuizzCount()
  }, [user.id])

  const loadQuizzCount = async () => {
    try {
      const { count, error } = await supabase
        .from('quizz_theme')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_public', true)

      if (error) {
        console.error('Erreur lors du comptage des quizz:', error)
      } else {
        setQuizzCount(count || 0)
      }
    } catch (err) {
      console.error('Erreur inattendue:', err)
    }
  }

  const getProfileImage = () => {
    if (user.photo_url) {
      return user.photo_url
    }
    return null
  }

  const getInitials = () => {
    return user.username ? user.username.charAt(0).toUpperCase() : '?'
  }

  return (
    <div className={`user-card ${isCurrentUser ? 'current-user' : ''}`} onClick={() => onClick(user)}>
      <div className="user-card-header">
        <div className="user-avatar">
          {getProfileImage() ? (
            <img 
              src={getProfileImage()} 
              alt={`Photo de profil de ${user.username}`}
              className="user-photo"
            />
          ) : (
            <div className="user-photo-placeholder">
              <span className="user-initials">{getInitials()}</span>
            </div>
          )}
        </div>
        <div className="user-info">
          <h3 className="user-username">
            {user.username}
            {isCurrentUser && <span className="current-user-badge">Vous</span>}
          </h3>
          <div className="user-stats">
            <span className="quiz-count-badge">
              {quizzCount} quizz{quizzCount !== 1 ? 's' : ''} public{quizzCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      
      {user.description && (
        <div className="user-description">
          <p>{user.description}</p>
        </div>
      )}
      
      <div className="user-card-footer">
        <span className="view-profile-hint">Cliquer pour voir le profil →</span>
      </div>
    </div>
  )
}

export default UserCard

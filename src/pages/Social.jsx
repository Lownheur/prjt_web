import { useState, useEffect } from 'react'
import Header from '../components/Header'
import UserCard from '../components/UserCard'
import UserProfileModal from '../components/UserProfileModal'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const Social = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadUsers()
    }
  }, [user])

  const loadUsers = async () => {
    setLoading(true)
    setError('')

    try {
      // D'abord récupérer tous les user_id qui ont des quizz publics
      const { data: publicQuizzes, error: quizzError } = await supabase
        .from('quizz_theme')
        .select('user_id')
        .eq('is_public', true)
        // On inclut l'utilisateur actuel pour pouvoir voir tous les créateurs

      if (quizzError) {
        throw quizzError
      }

      if (!publicQuizzes || publicQuizzes.length === 0) {
        setUsers([])
        setLoading(false)
        return
      }

      // Extraire les IDs uniques des utilisateurs
      const uniqueUserIds = [...new Set(publicQuizzes.map(quiz => quiz.user_id))]

      // Récupérer les profils de ces utilisateurs
      const { data: usersData, error: usersError } = await supabase
        .from('profile')
        .select('*')
        .in('id', uniqueUserIds)

      if (usersError) {
        throw usersError
      }

      setUsers(usersData || [])

    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err)
      setError('Erreur lors du chargement des utilisateurs')
    }

    setLoading(false)
  }

  const handleUserClick = (user) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleCloseModal = () => {
    setShowUserModal(false)
    setSelectedUser(null)
  }

  if (loading) {
    return (
      <div className="app-layout">
        <Header />
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement de la communauté...</p>
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
          {error ? (
            <div className="error-state">
              <h2>Erreur</h2>
              <p>{error}</p>
              <button onClick={loadUsers} className="primary-button">
                Réessayer
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <h2>Aucun utilisateur trouvé</h2>
              <p>Il n'y a pas encore d'utilisateurs avec des quizz publics.</p>
              <p>Soyez le premier à créer un quizz public !</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map((userData) => (
                <UserCard
                  key={userData.id}
                  user={userData}
                  onClick={handleUserClick}
                  isCurrentUser={userData.id === user.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <UserProfileModal
        isOpen={showUserModal}
        onClose={handleCloseModal}
        user={selectedUser}
      />
    </div>
  )
}

export default Social



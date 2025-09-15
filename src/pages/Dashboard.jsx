import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import CreateQuizzModal from '../components/CreateQuizzModal'
import QuizzCard from '../components/QuizzCard'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const [quizzList, setQuizzList] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Charger les quizz de l'utilisateur
  useEffect(() => {
    if (user) {
      loadQuizzList()
    }
  }, [user])

  const loadQuizzList = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('quizz_theme')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur lors du chargement des quizz:', error)
    } else {
      setQuizzList(data || [])
    }
    setLoading(false)
  }

  const handleQuizzCreated = (newQuizz) => {
    setQuizzList([newQuizz, ...quizzList])
  }

  const handleEdit = (quizz) => {
    navigate(`/edit-quizz/${quizz.id}`)
  }

  const handlePlay = (quizz) => {
    console.log('Lancer quizz:', quizz)
    // TODO: Implémenter le lancement
  }

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1>Dashboard</h1>
            <p>Gérez vos quizz et créez-en de nouveaux</p>
          </div>
          
          <div className="dashboard-actions">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="primary-button create-quizz-btn"
            >
              + Créer un nouveau quizz
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Chargement de vos quizz...</p>
            </div>
          ) : (
            <div className="content-grid">
              {quizzList.length === 0 ? (
                <div className="empty-state">
                  <h3>Aucun quizz pour le moment</h3>
                  <p>Créez votre premier quizz pour commencer !</p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="primary-button"
                  >
                    Créer mon premier quizz
                  </button>
                </div>
              ) : (
                quizzList.map((quizz) => (
                  <QuizzCard 
                    key={quizz.id}
                    quizz={quizz}
                    onEdit={handleEdit}
                    onPlay={handlePlay}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <CreateQuizzModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onQuizzCreated={handleQuizzCreated}
      />
    </div>
  )
}

export default Dashboard



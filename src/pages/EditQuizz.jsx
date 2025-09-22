import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import QuestionForm from '../components/QuestionForm'
import QuestionCard from '../components/QuestionCard'
import AIGenerationModal from '../components/AIGenerationModal'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const EditQuizz = () => {
  const { quizzId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [quizz, setQuizz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updatingVisibility, setUpdatingVisibility] = useState(false)

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
      .eq('user_id', user.id)
      .single()

    if (quizzError) {
      setError('Quizz non trouvé ou accès refusé')
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
    } else {
      setQuestions(questionsData || [])
    }

    setLoading(false)
  }

  const handleQuestionSaved = (savedQuestion) => {
    if (editingQuestion) {
      // Modification d'une question existante
      setQuestions(questions.map(q => 
        q.id === savedQuestion.id ? savedQuestion : q
      ))
    } else {
      // Nouvelle question
      setQuestions([...questions, savedQuestion])
    }
    
    setShowQuestionForm(false)
    setEditingQuestion(null)
  }

  const handleEditQuestion = (question) => {
    setEditingQuestion(question)
    setShowQuestionForm(true)
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      return
    }

    const { error } = await supabase
      .from('quizz_question')
      .delete()
      .eq('id', questionId)

    if (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la question')
    } else {
      setQuestions(questions.filter(q => q.id !== questionId))
    }
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const handleAIQuestionsGenerated = async (generatedQuestions) => {
    // Sauvegarder chaque question générée
    const savedQuestions = []
    
    for (const questionData of generatedQuestions) {
      const { data, error } = await supabase
        .from('quizz_question')
        .insert([{
          ...questionData,
          quizz_id: quizzId,
          order_index: questions.length + savedQuestions.length
        }])
        .select()
        .single()

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      } else {
        savedQuestions.push(data)
      }
    }

    // Mettre à jour la liste des questions
    setQuestions([...questions, ...savedQuestions])
  }

  const handleToggleVisibility = async () => {
    setUpdatingVisibility(true)
    
    try {
      const newVisibility = !quizz.is_public
      
      const { error } = await supabase
        .from('quizz_theme')
        .update({ 
          is_public: newVisibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', quizzId)

      if (error) {
        console.error('Erreur lors de la mise à jour:', error)
        alert('Erreur lors de la modification de la visibilité')
      } else {
        setQuizz({ ...quizz, is_public: newVisibility })
      }
    } catch (err) {
      console.error('Erreur inattendue:', err)
      alert('Erreur inattendue')
    }
    
    setUpdatingVisibility(false)
  }

  const handleDeleteQuizz = async () => {
    setDeleting(true)
    
    try {
      // Supprimer d'abord toutes les questions
      const { error: questionsError } = await supabase
        .from('quizz_question')
        .delete()
        .eq('quizz_id', quizzId)

      if (questionsError) {
        console.error('Erreur lors de la suppression des questions:', questionsError)
        alert('Erreur lors de la suppression des questions')
        setDeleting(false)
        return
      }

      // Puis supprimer le quizz
      const { error: quizzError } = await supabase
        .from('quizz_theme')
        .delete()
        .eq('id', quizzId)
        .eq('user_id', user.id)

      if (quizzError) {
        console.error('Erreur lors de la suppression du quizz:', quizzError)
        alert('Erreur lors de la suppression du quizz')
      } else {
        // Rediriger vers le dashboard
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Erreur inattendue:', err)
      alert('Erreur inattendue lors de la suppression')
    }
    
    setDeleting(false)
    setShowDeleteConfirm(false)
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
          <div className="page-header">
            <div className="edit-header">
              <button 
                onClick={handleBackToDashboard}
                className="back-button"
              >
                ← Retour
              </button>
              <div className="quizz-title-section">
                <h1>Modifier: {quizz.title}</h1>
                {quizz.description && <p>{quizz.description}</p>}
                <div className="quizz-stats">
                  <span className="question-count-badge">
                    {questions.length} question{questions.length !== 1 ? 's' : ''}
                  </span>
                  <span className={`visibility-badge ${quizz.is_public ? 'public' : 'private'}`}>
                    {quizz.is_public ? '🌍 Public' : '🔒 Privé'}
                  </span>
                </div>
              </div>
              <div className="quizz-actions">
                <button 
                  onClick={handleToggleVisibility}
                  className={`visibility-toggle-btn ${quizz.is_public ? 'make-private' : 'make-public'}`}
                  disabled={updatingVisibility}
                >
                  {updatingVisibility ? '⏳' : quizz.is_public ? '🔒 Rendre privé' : '🌍 Rendre public'}
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="delete-quiz-btn"
                  disabled={deleting}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>

          <div className="edit-actions">
            <button 
              onClick={() => setShowQuestionForm(true)}
              className="primary-button add-question-btn"
            >
              + Ajouter une question
            </button>
            <button 
              onClick={() => setShowAIModal(true)}
              className="ai-button"
            >
              🤖 Générer avec l'IA
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="empty-state">
              <h3>Aucune question pour le moment</h3>
              <p>Ajoutez votre première question pour commencer !</p>
              <button 
                onClick={() => setShowQuestionForm(true)}
                className="primary-button"
              >
                Ajouter ma première question
              </button>
            </div>
          ) : (
            <div className="questions-list">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index + 1}
                  onEdit={handleEditQuestion}
                  onDelete={handleDeleteQuestion}
                />
              ))}
            </div>
          )}

          {showQuestionForm && (
            <QuestionForm
              quizzId={quizzId}
              question={editingQuestion}
              onSave={handleQuestionSaved}
              onCancel={() => {
                setShowQuestionForm(false)
                setEditingQuestion(null)
              }}
            />
          )}

          <AIGenerationModal
            isOpen={showAIModal}
            onClose={() => setShowAIModal(false)}
            quizz={quizz}
            existingQuestions={questions}
            onQuestionsGenerated={handleAIQuestionsGenerated}
          />

          {/* Modal de confirmation de suppression */}
          {showDeleteConfirm && (
            <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
              <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>⚠️ Supprimer le quizz</h2>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir supprimer définitivement ce quizz ?</p>
                  <div className="delete-warning">
                    <p><strong>"{quizz.title}"</strong></p>
                    <p>Cette action supprimera :</p>
                    <ul>
                      <li>✗ Le quizz et sa description</li>
                      <li>✗ Toutes les {questions.length} questions</li>
                      <li>✗ Toutes les images associées</li>
                    </ul>
                    <p className="warning-text">
                      <strong>Cette action est irréversible !</strong>
                    </p>
                  </div>
                </div>
                <div className="modal-actions">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="secondary-button"
                    disabled={deleting}
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleDeleteQuizz}
                    className="delete-confirm-btn"
                    disabled={deleting}
                  >
                    {deleting ? '⏳ Suppression...' : '🗑️ Supprimer définitivement'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default EditQuizz

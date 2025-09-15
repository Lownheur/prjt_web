import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const CreateQuizzModal = ({ isOpen, onClose, onQuizzCreated }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Le titre est obligatoire')
      return
    }

    setLoading(true)
    setError('')

    const { data, error: supabaseError } = await supabase
      .from('quizz_theme')
      .insert([
        {
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          is_public: isPublic,
          question_count: 0
        }
      ])
      .select()

    if (supabaseError) {
      setError('Erreur lors de la création du quizz: ' + supabaseError.message)
    } else {
      // Reset form
      setTitle('')
      setDescription('')
      setIsPublic(false)
      onQuizzCreated(data[0])
      onClose()
    }
    
    setLoading(false)
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setIsPublic(false)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un nouveau quizz</h2>
          <button onClick={handleClose} className="modal-close">×</button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Titre *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="Titre de votre quizz"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description (optionnelle)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input form-textarea"
              placeholder="Description de votre quizz"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="form-checkbox"
              />
              <span>Quizz public</span>
            </label>
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              onClick={handleClose}
              className="secondary-button"
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="primary-button"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer le quizz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateQuizzModal

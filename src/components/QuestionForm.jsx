import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ImageUpload from './ImageUpload'

const QuestionForm = ({ quizzId, question, onSave, onCancel }) => {
  const [questionText, setQuestionText] = useState('')
  const [questionImageUrl, setQuestionImageUrl] = useState('')
  const [questionType, setQuestionType] = useState('text')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [choiceA, setChoiceA] = useState('')
  const [choiceB, setChoiceB] = useState('')
  const [choiceC, setChoiceC] = useState('')
  const [choiceD, setChoiceD] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!question

  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text || '')
      setQuestionImageUrl(question.question_image_url || '')
      setQuestionType(question.question_type || 'text')
      setCorrectAnswer(question.correct_answer || '')
      setChoiceA(question.choice_a || '')
      setChoiceB(question.choice_b || '')
      setChoiceC(question.choice_c || '')
      setChoiceD(question.choice_d || '')
    }
  }, [question])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!questionText.trim()) {
      setError('La question est obligatoire')
      return
    }

    if (!correctAnswer.trim()) {
      setError('La réponse correcte est obligatoire')
      return
    }

    if (questionType === 'multiple_choice') {
      if (!choiceA.trim() || !choiceB.trim()) {
        setError('Au moins 2 choix sont obligatoires pour un QCM')
        return
      }
    }

    setLoading(true)
    setError('')

    const questionData = {
      quizz_id: quizzId,
      question_text: questionText.trim(),
      question_image_url: questionImageUrl.trim() || null,
      question_type: questionType,
      correct_answer: correctAnswer.trim(),
      choice_a: questionType === 'multiple_choice' ? choiceA.trim() || null : null,
      choice_b: questionType === 'multiple_choice' ? choiceB.trim() || null : null,
      choice_c: questionType === 'multiple_choice' ? choiceC.trim() || null : null,
      choice_d: questionType === 'multiple_choice' ? choiceD.trim() || null : null,
      order_index: question ? question.order_index : 0
    }

    let result
    if (isEditing) {
      result = await supabase
        .from('quizz_question')
        .update(questionData)
        .eq('id', question.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('quizz_question')
        .insert([questionData])
        .select()
        .single()
    }

    if (result.error) {
      setError('Erreur lors de la sauvegarde: ' + result.error.message)
    } else {
      onSave(result.data)
    }
    
    setLoading(false)
  }

  const resetForm = () => {
    setQuestionText('')
    setQuestionImageUrl('')
    setQuestionType('text')
    setCorrectAnswer('')
    setChoiceA('')
    setChoiceB('')
    setChoiceC('')
    setChoiceD('')
    setError('')
  }

  const handleCancel = () => {
    resetForm()
    onCancel()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content question-form-modal">
        <div className="modal-header">
          <h2>{isEditing ? 'Modifier la question' : 'Ajouter une question'}</h2>
          <button onClick={handleCancel} className="modal-close">×</button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="questionText">Question *</label>
            <textarea
              id="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="form-input form-textarea"
              placeholder="Écrivez votre question..."
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Image (optionnelle)</label>
            <ImageUpload 
              currentImageUrl={questionImageUrl}
              onImageUploaded={(url) => setQuestionImageUrl(url || '')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="questionType">Type de question</label>
            <select
              id="questionType"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="form-input"
            >
              <option value="text">Réponse libre (texte)</option>
              <option value="multiple_choice">Choix multiple (QCM)</option>
            </select>
          </div>

          {questionType === 'multiple_choice' && (
            <div className="choices-section">
              <h4>Choix de réponses</h4>
              <div className="choices-grid">
                <div className="form-group">
                  <label htmlFor="choiceA">Choix A *</label>
                  <input
                    type="text"
                    id="choiceA"
                    value={choiceA}
                    onChange={(e) => setChoiceA(e.target.value)}
                    className="form-input"
                    placeholder="Premier choix"
                    required={questionType === 'multiple_choice'}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="choiceB">Choix B *</label>
                  <input
                    type="text"
                    id="choiceB"
                    value={choiceB}
                    onChange={(e) => setChoiceB(e.target.value)}
                    className="form-input"
                    placeholder="Deuxième choix"
                    required={questionType === 'multiple_choice'}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="choiceC">Choix C</label>
                  <input
                    type="text"
                    id="choiceC"
                    value={choiceC}
                    onChange={(e) => setChoiceC(e.target.value)}
                    className="form-input"
                    placeholder="Troisième choix (optionnel)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="choiceD">Choix D</label>
                  <input
                    type="text"
                    id="choiceD"
                    value={choiceD}
                    onChange={(e) => setChoiceD(e.target.value)}
                    className="form-input"
                    placeholder="Quatrième choix (optionnel)"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="correctAnswer">
              Réponse correcte *
              {questionType === 'multiple_choice' && (
                <span className="help-text">
                  (Écrivez exactement le texte du bon choix)
                </span>
              )}
            </label>
            <input
              type="text"
              id="correctAnswer"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="form-input"
              placeholder={questionType === 'multiple_choice' ? 'Ex: Premier choix' : 'Réponse attendue'}
              required
            />
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              onClick={handleCancel}
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
              {loading ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuestionForm

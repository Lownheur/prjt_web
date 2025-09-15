import { useState } from 'react'
import { AIService } from '../services/aiService'

const AIGenerationModal = ({ isOpen, onClose, quizz, existingQuestions, onQuestionsGenerated }) => {
  const [additionalContext, setAdditionalContext] = useState('')
  const [questionCount, setQuestionCount] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [usedModel, setUsedModel] = useState('')
  const [step, setStep] = useState('config') // 'config' | 'preview' | 'generating'

  const handleGenerate = async () => {
    if (questionCount < 1 || questionCount > 10) {
      setError('Le nombre de questions doit être entre 1 et 10')
      return
    }

    setLoading(true)
    setError('')
    setStep('generating')

    try {
      const result = await AIService.generateQuestions(quizz, {
        title: quizz.title,
        description: quizz.description,
        existingQuestions,
        additionalContext,
        questionCount
      })

      if (result.success) {
        setGeneratedQuestions(result.questions)
        setUsedModel(result.usedModel || 'Modèle IA')
        setStep('preview')
      } else {
        setError(result.error)
        setStep('config')
      }
    } catch (err) {
      setError('Erreur inattendue: ' + err.message)
      setStep('config')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptQuestions = () => {
    onQuestionsGenerated(generatedQuestions)
    handleClose()
  }

  const handleClose = () => {
    setAdditionalContext('')
    setQuestionCount(3)
    setError('')
    setGeneratedQuestions([])
    setUsedModel('')
    setStep('config')
    onClose()
  }

  const handleRemoveQuestion = (index) => {
    setGeneratedQuestions(generatedQuestions.filter((_, i) => i !== index))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content ai-modal">
        <div className="modal-header">
          <h2>🤖 Générer des questions avec l'IA</h2>
          <button onClick={handleClose} className="modal-close">×</button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {step === 'config' && (
          <div className="modal-form">
            <div className="quizz-info-summary">
              <h4>Informations du quizz</h4>
              <p><strong>Titre:</strong> {quizz.title}</p>
              {quizz.description && (
                <p><strong>Description:</strong> {quizz.description}</p>
              )}
              <p><strong>Questions existantes:</strong> {existingQuestions.length}</p>
            </div>

            <div className="form-group">
              <label htmlFor="questionCount">Nombre de questions à générer</label>
              <input
                type="number"
                id="questionCount"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
                className="form-input"
                min="1"
                max="10"
              />
              <span className="help-text">Entre 1 et 10 questions</span>
            </div>

            <div className="form-group">
              <label htmlFor="additionalContext">Contexte supplémentaire (optionnel)</label>
              <textarea
                id="additionalContext"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                className="form-input form-textarea"
                placeholder="Ajoutez des précisions sur le type de questions, le niveau de difficulté, des sujets spécifiques à couvrir..."
                rows="4"
              />
              <span className="help-text">
                Exemples: "Questions de niveau débutant", "Focus sur les concepts pratiques", "Inclure des questions sur l'histoire"
              </span>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={handleClose}
                className="secondary-button"
              >
                Annuler
              </button>
              <button 
                type="button" 
                onClick={handleGenerate}
                className="primary-button ai-button"
                disabled={loading}
              >
                🤖 Générer avec l'IA
              </button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="generating-state">
            <div className="ai-loading">
              <div className="ai-spinner">🤖</div>
              <h3>Génération en cours...</h3>
              <p>L'IA crée vos questions personnalisées</p>
              <div className="loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="preview-section">
            <div className="preview-header">
              <h3>Questions générées ({generatedQuestions.length})</h3>
              <p>Vérifiez les questions avant de les ajouter à votre quizz</p>
              {usedModel && (
                <p className="model-info">
                  <small>Générées par: <strong>{usedModel}</strong></small>
                </p>
              )}
            </div>

            <div className="generated-questions">
              {generatedQuestions.map((question, index) => (
                <div key={index} className="generated-question-card">
                  <div className="question-header">
                    <div className="question-number">Question {index + 1}</div>
                    <div className="question-actions">
                      <span className="question-type-badge">
                        {question.question_type === 'multiple_choice' ? 'QCM' : 'Texte libre'}
                      </span>
                      <button 
                        onClick={() => handleRemoveQuestion(index)}
                        className="remove-question-btn"
                        title="Supprimer cette question"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="question-content">
                    <h4 className="question-text">{question.question_text}</h4>

                    {question.question_type === 'multiple_choice' && (
                      <div className="choices-preview">
                        <h5>Choix proposés :</h5>
                        <ul className="choices-list">
                          {question.choice_a && <li>A) {question.choice_a}</li>}
                          {question.choice_b && <li>B) {question.choice_b}</li>}
                          {question.choice_c && <li>C) {question.choice_c}</li>}
                          {question.choice_d && <li>D) {question.choice_d}</li>}
                        </ul>
                      </div>
                    )}

                    <div className="correct-answer">
                      <strong>Réponse correcte :</strong> 
                      <span className="answer-text">{question.correct_answer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {generatedQuestions.length === 0 ? (
              <div className="empty-preview">
                <p>Toutes les questions ont été supprimées.</p>
                <button 
                  onClick={() => setStep('config')}
                  className="secondary-button"
                >
                  Générer de nouvelles questions
                </button>
              </div>
            ) : (
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setStep('config')}
                  className="secondary-button"
                >
                  Générer d'autres questions
                </button>
                <button 
                  type="button" 
                  onClick={handleAcceptQuestions}
                  className="primary-button"
                >
                  Ajouter ces {generatedQuestions.length} questions
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AIGenerationModal

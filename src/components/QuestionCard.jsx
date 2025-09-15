const QuestionCard = ({ question, index, onEdit, onDelete }) => {
  const isMultipleChoice = question.question_type === 'multiple_choice'

  return (
    <div className="content-box question-card">
      <div className="question-header">
        <div className="question-number">Question {index}</div>
        <div className="question-type-badge">
          {isMultipleChoice ? 'QCM' : 'Texte libre'}
        </div>
      </div>

      <div className="question-content">
        <h4 className="question-text">{question.question_text}</h4>
        
        {question.question_image_url && (
          <div className="question-image">
            <img 
              src={question.question_image_url} 
              alt="Image de la question"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        )}

        {isMultipleChoice && (
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

      <div className="question-actions">
        <button 
          onClick={() => onEdit(question)}
          className="secondary-button"
        >
          Modifier
        </button>
        <button 
          onClick={() => onDelete(question.id)}
          className="danger-button"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}

export default QuestionCard

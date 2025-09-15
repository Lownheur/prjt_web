const QuizzCard = ({ quizz, onEdit, onPlay }) => {
  return (
    <div className="content-box quizz-card">
      <div className="quizz-header">
        <h3>{quizz.title}</h3>
        {quizz.is_public && <span className="public-badge">Public</span>}
      </div>
      
      {quizz.description && (
        <p className="quizz-description">{quizz.description}</p>
      )}
      
      <div className="quizz-info">
        <span className="question-count">
          {quizz.question_count} question{quizz.question_count !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="quizz-actions">
        <button 
          onClick={() => onEdit(quizz)}
          className="secondary-button"
        >
          Modifier le quizz
        </button>
        <button 
          onClick={() => onPlay(quizz)}
          className="primary-button"
        >
          Lancer le quizz
        </button>
      </div>
    </div>
  )
}

export default QuizzCard

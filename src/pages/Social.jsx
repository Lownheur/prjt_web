import Header from '../components/Header'

const Social = () => {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1>Social</h1>
            <p>Connectez-vous avec la communauté Quizz Master</p>
          </div>
          
          <div className="content-grid">
            <div className="content-box">
              <h3>Amis</h3>
              <p>Gérez vos connexions</p>
              <div className="placeholder-content">
                <p>Contenu à venir...</p>
              </div>
            </div>
            
            <div className="content-box">
              <h3>Classements</h3>
              <p>Comparez vos scores</p>
              <div className="placeholder-content">
                <p>Contenu à venir...</p>
              </div>
            </div>
            
            <div className="content-box">
              <h3>Défis</h3>
              <p>Participez aux défis communautaires</p>
              <div className="placeholder-content">
                <p>Contenu à venir...</p>
              </div>
            </div>
            
            <div className="content-box">
              <h3>Messages</h3>
              <p>Vos conversations</p>
              <div className="placeholder-content">
                <p>Contenu à venir...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Social



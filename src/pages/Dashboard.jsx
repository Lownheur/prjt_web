import Header from '../components/Header'

const Dashboard = () => {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1>Dashboard</h1>
            <p>Bienvenue sur votre tableau de bord Quizz Master</p>
          </div>
          
          <div className="content-grid">
            <div className="content-box">
              <h3>Mes Quizz</h3>
              <p>Gérez vos quizz créés</p>
              <div className="placeholder-content">
                <p>Contenu à venir...</p>
              </div>
            </div>
            
            <div className="content-box">
              <h3>Statistiques</h3>
              <p>Vos performances et résultats</p>
              <div className="placeholder-content">
                <p>Contenu à venir...</p>
              </div>
            </div>
            
            <div className="content-box">
              <h3>Récents</h3>
              <p>Vos dernières activités</p>
              <div className="placeholder-content">
                <p>Contenu à venir...</p>
              </div>
            </div>
            
            <div className="content-box">
              <h3>Créer un Quizz</h3>
              <p>Commencez un nouveau quizz</p>
              <div className="placeholder-content">
                <button className="primary-button">Nouveau Quizz</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard



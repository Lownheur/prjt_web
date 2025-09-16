import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import logoBlack from '../assets/logo_black_quizz_master.png'
import logoWhite from '../assets/logo_white_quizz_master.png'

const Home = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="home-layout">
      {/* Header pour visiteurs */}
      <header className="public-header">
        <div className="header-container">
          <div className="header-left">
            <div className="brand-logo">
              <img 
                src={isDark ? logoWhite : logoBlack} 
                alt="Quizz Master Logo" 
                className="app-logo"
              />
              <h1 className="app-title">Quizz Master</h1>
            </div>
          </div>
          
          <div className="header-right">
            <button 
              onClick={toggleTheme} 
              className="theme-toggle"
              title={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            
            <div className="auth-buttons">
              <Link to="/connexion" className="login-btn">
                Connexion
              </Link>
              <Link to="/inscription" className="signup-btn">
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="home-content">
        {/* Section Hero */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-text">
              <h1 className="hero-title">
                Créez et partagez vos <span className="accent-text">quizz</span> facilement
              </h1>
              <p className="hero-description">
                Quizz Master est la plateforme ultime pour créer, jouer et partager des quizz interactifs. 
                Rejoignez une communauté passionnée et testez vos connaissances !
              </p>
              <div className="hero-actions">
                <Link to="/inscription" className="cta-primary">
                  🚀 Commencer gratuitement
                </Link>
                <Link to="/connexion" className="cta-secondary">
                  Se connecter
                </Link>
              </div>
            </div>
            <div className="hero-visual">
              <div className="feature-preview">
                <div className="preview-card">
                  <div className="card-header">
                    <div className="avatar-placeholder"></div>
                    <div className="card-info">
                      <h4>Quiz de Culture Générale</h4>
                      <span>15 questions</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button className="play-btn">🎮 Jouer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Fonctionnalités */}
        <section className="features-section">
          <div className="section-container">
            <h2 className="section-title">Pourquoi choisir Quizz Master ?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎨</div>
                <h3>Création intuitive</h3>
                <p>
                  Créez vos quizz en quelques clics avec notre interface simple et moderne. 
                  Ajoutez des images, choisissez entre QCM ou réponses libres.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🤖</div>
                <h3>IA intégrée</h3>
                <p>
                  Laissez l'intelligence artificielle vous aider à générer des questions 
                  pertinentes pour vos quizz en fonction de vos thèmes.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>Communauté active</h3>
                <p>
                  Découvrez et jouez aux quizz créés par la communauté. 
                  Partagez vos créations et défiez vos amis.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">⏱️</div>
                <h3>Modes de jeu variés</h3>
                <p>
                  Jouez avec un temps global ou par question. 
                  Suivez votre progression et consultez vos statistiques.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Résultats détaillés</h3>
                <p>
                  Analysez vos performances avec des résultats complets : 
                  score, temps passé, correction détaillée.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🌙</div>
                <h3>Interface moderne</h3>
                <p>
                  Profitez d'une expérience utilisateur soignée avec mode sombre/clair 
                  et design responsive adapté à tous vos appareils.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section Comment ça marche */}
        <section className="how-it-works-section">
          <div className="section-container">
            <h2 className="section-title">Comment ça marche ?</h2>
            <div className="steps-container">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Inscrivez-vous</h3>
                  <p>Créez votre compte gratuit en quelques secondes</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Créez vos quizz</h3>
                  <p>Utilisez nos outils pour créer des quizz personnalisés</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Partagez et jouez</h3>
                  <p>Publiez vos créations et découvrez celles des autres</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section CTA finale */}
        <section className="final-cta-section">
          <div className="cta-container">
            <h2>Prêt à commencer l'aventure ?</h2>
            <p>Rejoignez des milliers d'utilisateurs qui s'amusent déjà avec Quizz Master</p>
            <div className="cta-actions">
              <Link to="/inscription" className="cta-primary large">
                🎉 Créer mon compte gratuitement
              </Link>
            </div>
            <p className="cta-note">
              Aucune carte bancaire requise • Inscription en 30 secondes
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Quizz Master</h3>
              <p>La plateforme de quizz nouvelle génération</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Fonctionnalités</h4>
                <ul>
                  <li>Création de quizz</li>
                  <li>IA intégrée</li>
                  <li>Communauté</li>
                  <li>Statistiques</li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Commencer</h4>
                <ul>
                  <li><Link to="/inscription">Inscription</Link></li>
                  <li><Link to="/connexion">Connexion</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Quizz Master. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const Header = () => {
  const { user, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="app-title">Quizz Master</h1>
          {user && (
            <nav className="nav-links">
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/social" className="nav-link">Social</Link>
              <Link to="/profile" className="nav-link">Profil</Link>
            </nav>
          )}
        </div>
        
        <div className="header-right">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            title={isDark ? 'Mode clair' : 'Mode sombre'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          
          {user && (
            <div className="user-menu">
              <span className="user-email">{user.email}</span>
              <button onClick={handleSignOut} className="sign-out-btn">
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header



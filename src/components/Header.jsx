import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import logoBlack from '../assets/logo_black_quizz_master.png'
import logoWhite from '../assets/logo_white_quizz_master.png'

const Header = () => {
  const { user, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [userProfile, setUserProfile] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erreur lors du chargement du profil:', error)
      } else {
        setUserProfile(data)
      }
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Fermer le menu mobile quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-overlay') && !event.target.closest('.hamburger-menu')) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen])

  return (
    <header className="header">
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
          {user && (
            <nav className="nav-links">
              <Link 
                to="/dashboard" 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/social" 
                className={`nav-link ${location.pathname === '/social' ? 'active' : ''}`}
              >
                Social
              </Link>
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
              <div className="user-profile-section">
                <div className="user-avatar">
                  {userProfile?.photo_url ? (
                    <img 
                      src={userProfile.photo_url} 
                      alt="Photo de profil" 
                      className="profile-photo"
                    />
                  ) : (
                    <div className="default-avatar">
                      {userProfile?.username ? userProfile.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <span className="username">
                    {userProfile?.username || 'Utilisateur'}
                  </span>
                  <button 
                    onClick={() => navigate('/profile')} 
                    className="profile-btn"
                  >
                    Ouvrir profil
                  </button>
                </div>
              </div>
              <button onClick={handleSignOut} className="sign-out-btn">
                Déconnexion
              </button>
            </div>
          )}
          
          {/* Bouton hamburger mobile */}
          {user && (
            <button 
              className={`hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`}
              onClick={toggleMobileMenu}
            >
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </button>
          )}
        </div>
      </div>
      
      {/* Menu mobile overlay */}
      {user && (
        <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-links">
            <Link 
              to="/dashboard" 
              className={`mobile-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Dashboard
            </Link>
            <Link 
              to="/social" 
              className={`mobile-nav-link ${location.pathname === '/social' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Social
            </Link>
            <Link 
              to="/profile" 
              className={`mobile-nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Profil
            </Link>
          </div>
          
          <div className="mobile-user-section">
            <div className="mobile-user-info">
              <div className="user-avatar">
                {userProfile?.photo_url ? (
                  <img 
                    src={userProfile.photo_url} 
                    alt="Photo de profil" 
                    className="profile-photo avatar-lg"
                  />
                ) : (
                  <div className="default-avatar avatar-lg">
                    {userProfile?.username ? userProfile.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="username" style={{fontSize: '1.2rem', fontWeight: '600'}}>
                {userProfile?.username || 'Utilisateur'}
              </span>
            </div>
            
            <div className="mobile-user-buttons">
              <button 
                onClick={() => {
                  navigate('/profile')
                  closeMobileMenu()
                }} 
                className="profile-btn"
              >
                Ouvrir profil
              </button>
              <button 
                onClick={() => {
                  handleSignOut()
                  closeMobileMenu()
                }} 
                className="sign-out-btn"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header



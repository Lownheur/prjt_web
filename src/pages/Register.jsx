import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const Register = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  
  const { signUp } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !username || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs')
      return
    }

    if (username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscore')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const { data, error } = await signUp(email, password, username)
    
    if (error) {
      setError('Erreur lors de l\'inscription: ' + error.message)
    } else {
      setSuccess('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.')
      setTimeout(() => {
        navigate('/connexion')
      }, 3000)
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="app-title">Quizz Master</h1>
        <button 
          onClick={toggleTheme} 
          className="theme-toggle"
          title={isDark ? 'Mode clair' : 'Mode sombre'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
      
      <div className="auth-box">
        <h2>Inscription</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="votre@email.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="votre_username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Déjà un compte ? 
            <Link to="/connexion" className="auth-link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register

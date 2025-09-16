import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ImageUpload from '../components/ImageUpload'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const Profile = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [profile, setProfile] = useState(null)
  const [username, setUsername] = useState('')
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erreur lors du chargement du profil:', error)
        setError('Erreur lors du chargement du profil')
      } else {
        setProfile(data)
        setUsername(data.username || '')
        setDescription(data.description || '')
        setPhotoUrl(data.photo_url || '')
      }
    } catch (err) {
      console.error('Erreur inattendue:', err)
      setError('Erreur inattendue lors du chargement')
    }

    setLoading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('Le nom d\'utilisateur est requis')
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

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('profile')
        .update({
          username: username.trim(),
          description: description.trim() || null,
          photo_url: photoUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        if (error.code === '23505') {
          setError('Ce nom d\'utilisateur est déjà pris')
        } else {
          setError('Erreur lors de la sauvegarde du profil')
        }
      } else {
        setSuccess('Profil mis à jour avec succès !')
        // Recharger le profil pour être sûr
        await loadProfile()
      }
    } catch (err) {
      console.error('Erreur inattendue:', err)
      setError('Erreur inattendue lors de la sauvegarde')
    }

    setSaving(false)
  }

  const handleImageUploaded = (url) => {
    setPhotoUrl(url || '')
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="app-layout">
        <Header />
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement du profil...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="app-layout">
        <Header />
        <main className="main-content">
          <div className="page-container">
            <div className="error-state">
              <h2>Erreur</h2>
              <p>Impossible de charger votre profil</p>
              <button onClick={handleBackToDashboard} className="primary-button">
                Retour au Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <div className="page-container">
          <div className="profile-header">
            <button 
              onClick={handleBackToDashboard}
              className="back-button"
            >
              ← Retour au Dashboard
            </button>
            <h1>Mon Profil</h1>
          </div>

          <div className="profile-content">
            <form onSubmit={handleSave} className="profile-form">
              <div className="profile-section">
                <h2>Photo de profil</h2>
                <div className="profile-photo-section">
                  <div className="current-photo">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt="Photo de profil" 
                        className="profile-photo"
                      />
                    ) : (
                      <div className="profile-photo-placeholder">
                        <span className="profile-initials">
                          {username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="photo-upload-section">
                    <ImageUpload
                      currentImageUrl={photoUrl}
                      onImageUploaded={handleImageUploaded}
                      acceptedTypes="image/*"
                      bucketName="profile-photos"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h2>Informations personnelles</h2>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={profile.email}
                    className="form-input disabled"
                    disabled
                  />
                  <small className="form-hint">L'email ne peut pas être modifié</small>
                </div>

                <div className="form-group">
                  <label htmlFor="username">Nom d'utilisateur *</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                    placeholder="votre_username"
                    required
                  />
                  <small className="form-hint">
                    Au moins 3 caractères, lettres, chiffres et underscore uniquement
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Bio / Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-textarea"
                    placeholder="Parlez-nous de vous..."
                    rows="4"
                    maxLength="500"
                  />
                  <small className="form-hint">
                    {description.length}/500 caractères
                  </small>
                </div>
              </div>

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

              <div className="profile-actions">
                <button 
                  type="button"
                  onClick={handleBackToDashboard}
                  className="secondary-button"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile

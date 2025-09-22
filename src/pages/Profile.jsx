import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const Profile = () => {
  const { user } = useAuth()
  
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState(null) // 'username', 'description', 'photo'
  const [tempValue, setTempValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erreur lors du chargement du profil:', error)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Erreur inattendue:', err)
    }
    setLoading(false)
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const startEdit = (field, currentValue = '') => {
    setEditingField(field)
    setTempValue(currentValue)
  }

  const cancelEdit = () => {
    setEditingField(null)
    setTempValue('')
  }

  const saveField = async (field, value) => {
    if (field === 'username') {
      if (!value.trim() || value.length < 3 || !/^[a-zA-Z0-9_]+$/.test(value)) {
        showMessage('error', 'Nom d\'utilisateur invalide (min 3 caractères, lettres/chiffres/underscore)')
        return
      }
    }

    setSaving(true)
    try {
      const updateData = {
        [field === 'photo' ? 'photo_url' : field]: field === 'description' ? (value.trim() || null) : value.trim(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profile')
        .update(updateData)
        .eq('id', user.id)

      if (error) {
        if (error.code === '23505') {
          showMessage('error', 'Ce nom d\'utilisateur est déjà pris')
        } else {
          showMessage('error', 'Erreur lors de la sauvegarde')
        }
      } else {
        setProfile(prev => ({
          ...prev,
          [field === 'photo' ? 'photo_url' : field]: field === 'description' ? (value.trim() || null) : value.trim()
        }))
        setEditingField(null)
        showMessage('success', 'Modifié avec succès !')
      }
    } catch (err) {
      showMessage('error', 'Erreur inattendue')
    }
    setSaving(false)
  }

  const handlePhotoUpload = async (file) => {
    setSaving(true)
    try {
      const fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl
      await saveField('photo', publicUrl)
    } catch (err) {
      showMessage('error', 'Erreur lors de l\'upload de l\'image')
    }
    setSaving(false)
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
          <div className="error-state">
            <h2>Erreur</h2>
            <p>Impossible de charger votre profil</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <div className="compact-profile-container">
          {message.text && (
            <div className={`message ${message.type === 'error' ? 'error-message' : 'success-message'}`}>
              {message.text}
            </div>
          )}

          {/* Photo de profil */}
          <div className="profile-item">
            <div className="profile-photo-container">
              {profile.photo_url ? (
                <img 
                  src={profile.photo_url} 
                  alt="Photo de profil" 
                  className="compact-profile-photo"
                />
              ) : (
                <div className="compact-profile-placeholder">
                  <span className="profile-initials">
                    {profile.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <button 
                className="edit-photo-btn"
                onClick={() => document.getElementById('photo-input').click()}
                disabled={saving}
              >
                ✏️
              </button>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handlePhotoUpload(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Nom d'utilisateur */}
          <div className="profile-item">
            <label className="profile-label">Nom d'utilisateur</label>
            <div className="profile-field">
              {editingField === 'username' ? (
                <div className="edit-field">
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="inline-input"
                    placeholder="Nom d'utilisateur"
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button 
                      onClick={() => saveField('username', tempValue)}
                      className="save-btn"
                      disabled={saving}
                    >
                      ✓
                    </button>
                    <button 
                      onClick={cancelEdit}
                      className="cancel-btn"
                      disabled={saving}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <div className="display-field">
                  <span className="field-value">{profile.username || 'Non défini'}</span>
                  <button 
                    onClick={() => startEdit('username', profile.username || '')}
                    className="edit-btn"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email (non modifiable) */}
          <div className="profile-item">
            <label className="profile-label">Email</label>
            <div className="profile-field">
              <span className="field-value disabled">{profile.email}</span>
            </div>
          </div>

          {/* Bio */}
          <div className="profile-item">
            <label className="profile-label">Bio</label>
            <div className="profile-field">
              {editingField === 'description' ? (
                <div className="edit-field">
                  <textarea
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="inline-textarea"
                    placeholder="Parlez-nous de vous..."
                    maxLength="500"
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button 
                      onClick={() => saveField('description', tempValue)}
                      className="save-btn"
                      disabled={saving}
                    >
                      ✓
                    </button>
                    <button 
                      onClick={cancelEdit}
                      className="cancel-btn"
                      disabled={saving}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <div className="display-field">
                  <span className="field-value">
                    {profile.description || 'Aucune description'}
                  </span>
                  <button 
                    onClick={() => startEdit('description', profile.description || '')}
                    className="edit-btn"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile
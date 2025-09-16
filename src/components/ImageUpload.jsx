import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const ImageUpload = ({ onImageUploaded, currentImageUrl = null, acceptedTypes = 'image/*', bucketName = 'quizz-images' }) => {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl)
  const fileInputRef = useRef(null)
  const { user } = useAuth()

  const handleFileSelect = async (file) => {
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image')
      return
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload vers Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl
      setPreviewUrl(publicUrl)
      onImageUploaded(publicUrl)

    } catch (error) {
      console.error('Erreur upload:', error)
      setError('Erreur lors de l\'upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageUploaded(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="image-upload-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {previewUrl ? (
        <div className="image-preview">
          <img src={previewUrl} alt="Preview" className="preview-image" />
          <div className="image-actions">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="secondary-button"
              disabled={uploading}
            >
              Changer l'image
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="danger-button"
              disabled={uploading}
            >
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="upload-loading">
              <div className="loading-spinner"></div>
              <p>Upload en cours...</p>
            </div>
          ) : (
            <div className="upload-content">
              <div className="upload-icon">📷</div>
              <p className="upload-text">
                <strong>Cliquez pour sélectionner</strong> ou glissez une image ici
              </p>
              <p className="upload-info">
                PNG, JPG, GIF, WebP jusqu'à 5MB
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={uploading}
      />
    </div>
  )
}

export default ImageUpload

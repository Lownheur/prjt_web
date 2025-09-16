import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PublicRoute = ({ children }) => {
  const { user } = useAuth()

  // Si l'utilisateur est connecté, le rediriger vers le dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  // Sinon, afficher la page publique
  return children
}

export default PublicRoute

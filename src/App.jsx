import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Social from './pages/Social'
import EditQuizz from './pages/EditQuizz'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Routes publiques */}
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
              
              {/* Routes protégées */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/social" 
                element={
                  <ProtectedRoute>
                    <Social />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-quizz/:quizzId" 
                element={
                  <ProtectedRoute>
                    <EditQuizz />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirection par défaut */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
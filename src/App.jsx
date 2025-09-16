import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Social from './pages/Social'
import EditQuizz from './pages/EditQuizz'
import QuizConfig from './pages/QuizConfig'
import PlayQuiz from './pages/PlayQuiz'
import Profile from './pages/Profile'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Page d'accueil publique */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <Home />
                  </PublicRoute>
                } 
              />
              
              {/* Routes publiques */}
              <Route 
                path="/connexion" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/inscription" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              
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
              <Route 
                path="/quiz-config/:quizzId" 
                element={
                  <ProtectedRoute>
                    <QuizConfig />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/play-quiz/:quizzId" 
                element={
                  <ProtectedRoute>
                    <PlayQuiz />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirection par défaut pour routes inconnues */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
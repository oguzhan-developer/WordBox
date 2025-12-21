import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import ReadingPage from './pages/ReadingPage';
import VocabularyList from './pages/VocabularyList';
import PracticePage from './pages/PracticePage';
import ProgressPage from './pages/ProgressPage';
import FlashcardMode from './pages/practice/FlashcardMode';
import MatchingMode from './pages/practice/MatchingMode';
import SprintMode from './pages/practice/SprintMode';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Protected Route component
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useUser();

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

// Public Route component (redirect if logged in)
function PublicRoute({ children }) {
  const { isLoggedIn } = useUser();

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Layout with Navbar
function Layout({ children, showNavbar = true }) {
  return (
    <>
      {showNavbar && <Navbar />}
      <main>{children}</main>
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Navigate to="/auth" replace />
          </PublicRoute>
        }
      />
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <Layout>
              <Library />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/read/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ReadingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vocabulary"
        element={
          <ProtectedRoute>
            <Layout>
              <VocabularyList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice"
        element={
          <ProtectedRoute>
            <Layout>
              <PracticePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/flashcard"
        element={
          <ProtectedRoute>
            <Layout showNavbar={false}>
              <FlashcardMode />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/sprint"
        element={
          <ProtectedRoute>
            <Layout showNavbar={false}>
              <SprintMode />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/matching"
        element={
          <ProtectedRoute>
            <Layout showNavbar={false}>
              <MatchingMode />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Progress & Profile (placeholders) */}
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Layout>
              <ProgressPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <Layout>
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🤔</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Sayfa Bulunamadı</h1>
                <p className="text-gray-600 mb-6">Aradığınız sayfa mevcut değil.</p>
                <a href="/dashboard" className="px-6 py-3 rounded-xl gradient-primary text-white font-medium">
                  Ana Sayfaya Dön
                </a>
              </div>
            </div>
          </Layout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </UserProvider>
    </Router>
  );
}

export default App;

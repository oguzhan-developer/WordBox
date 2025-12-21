import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { lazy, Suspense, useState, useCallback } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import AchievementNotification from './components/AchievementNotification';
import { QuickAddFAB } from './components/QuickAddWord';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';

// Pages - Lazy loaded for code splitting
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Library = lazy(() => import('./pages/Library'));
const ReadingPage = lazy(() => import('./pages/ReadingPage'));
const VocabularyList = lazy(() => import('./pages/VocabularyList'));
const PracticePage = lazy(() => import('./pages/PracticePage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const FlashcardMode = lazy(() => import('./pages/practice/FlashcardMode'));
const MatchingMode = lazy(() => import('./pages/practice/MatchingMode'));
const SprintMode = lazy(() => import('./pages/practice/SprintMode'));
const MultipleChoiceMode = lazy(() => import('./pages/practice/MultipleChoiceMode'));
const FillBlankMode = lazy(() => import('./pages/practice/FillBlankMode'));
const TranslationMode = lazy(() => import('./pages/practice/TranslationMode'));
const ListeningMode = lazy(() => import('./pages/practice/ListeningMode'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
      </div>
    </div>
  );
}

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
      <main id="main-content" tabIndex={-1}>{children}</main>
      <AchievementNotification />
      <QuickAddFAB />
    </>
  );
}

// Global Keyboard Shortcuts Handler
function GlobalShortcuts({ children }) {
  const navigate = useNavigate();
  const { isLoggedIn, updateProfile, profile } = useUser();
  const { toggleTheme } = useTheme();
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  
  useKeyboardShortcuts({
    GO_HOME: () => isLoggedIn && navigate('/dashboard'),
    GO_LIBRARY: () => isLoggedIn && navigate('/library'),
    GO_PRACTICE: () => isLoggedIn && navigate('/practice'),
    GO_VOCABULARY: () => isLoggedIn && navigate('/vocabulary'),
    GO_PROGRESS: () => isLoggedIn && navigate('/progress'),
    GO_SETTINGS: () => isLoggedIn && navigate('/settings'),
    TOGGLE_DARK_MODE: toggleTheme,
    SHOW_SHORTCUTS: () => setShowShortcutsModal(true),
    ESCAPE: () => setShowShortcutsModal(false),
  });
  
  return (
    <>
      {children}
      <KeyboardShortcutsModal 
        isOpen={showShortcutsModal} 
        onClose={() => setShowShortcutsModal(false)} 
      />
    </>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
        <Route
          path="/practice/multiplechoice"
          element={
            <ProtectedRoute>
              <Layout showNavbar={false}>
                <MultipleChoiceMode />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/fillblank"
          element={
            <ProtectedRoute>
              <Layout showNavbar={false}>
                <FillBlankMode />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/translation"
          element={
            <ProtectedRoute>
              <Layout showNavbar={false}>
                <TranslationMode />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/listening"
          element={
            <ProtectedRoute>
              <Layout showNavbar={false}>
                <ListeningMode />
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
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <UserProvider>
            <ToastProvider>
              <GlobalShortcuts>
                <AppRoutes />
              </GlobalShortcuts>
            </ToastProvider>
          </UserProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

// src/App.jsx (updated with optimized loading)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './components/Loading';
import ErrorPageStandalone from './pages/ErrorPageStandalone';
import ErrorRouteHandler from './pages/ErrorRouteHandler';

// Lazy loaded components
const Home = lazy(() => import('./pages/Home'));
const Materiais = lazy(() => import('./pages/Materiais'));
const Cronograma = lazy(() => import('./pages/Cronograma'));
const Aquecimento = lazy(() => import('./pages/Aquecimento'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
import CountdownBanner from './components/CountdownBanner';

// Admin components - lazy loaded
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));
const AdminHome = lazy(() => import('./admin/pages/AdminHome'));
const AdminMaterials = lazy(() => import('./admin/pages/AdminMaterials'));
const AdminImages = lazy(() => import('./admin/pages/AdminImages'));
const AdminHeaderSettings = lazy(() => import('./admin/pages/AdminHeaderSettings'));
const AdminHeaderButtons = lazy(() => import('./admin/pages/AdminHeaderButtons'));
const AdminSettings = lazy(() => import('./admin/pages/AdminSettings'));
const AdminInitialBanner = lazy(() => import('./admin/pages/AdminInitialBanner'));
const AdminSchedule = lazy(() => import('./admin/pages/AdminSchedule'));
const AdminCronograma = lazy(() => import('./admin/pages/AdminCronograma'));
const AdminAboutCourse = lazy(() => import('./admin/pages/AdminAboutCourse'));
const AdminTexts = lazy(() => import('./admin/pages/AdminTexts'));
const AdminPolls = lazy(() => import('./admin/pages/AdminPolls'));
const BannerPreview = lazy(() => import('./admin/pages/BannerPreview'));
const ProtectedRoute = lazy(() => import('./admin/components/ProtectedRoute'));

// Context Providers
import { AdminProvider } from './admin/contexts/AdminContext';
import { DevflixProvider } from './contexts/DevflixContext';
import { AuthProvider } from './contexts/AuthContext';
// NOTA: SchedulerChecker foi removido do frontend público.
// O desbloqueio de materiais/banners agendados é feito no DevflixContext
// no momento do render, sem escrever no Firebase (evita que visitantes
// com relógio adiantado desbloqueem conteúdo cedo para todo mundo).

// Simplified Aula Page Component
const AulaPage = ({ match }) => {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-netflix-black">
      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-8">Aula {match.params.id}</h1>
        <div className="aspect-video w-full max-w-4xl mx-auto bg-netflix-dark rounded-lg flex items-center justify-center">
          <p className="text-xl text-gray-400">Vídeo da Aula {match.params.id}</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simpler loading approach
  useEffect(() => {
    // Preload critical images at start
    const preloadCriticalImages = async () => {
      try {
        // Load only essential images first
        const img = new Image();
        img.src = '/images/bg-hero.jpg';
        
        // Set a reasonable loading time to ensure UI renders smoothly
        const loadingTimer = setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        
        return () => clearTimeout(loadingTimer);
      } catch (error) {
        console.warn('Error preloading images:', error);
        // Fallback - stop loading even if there's an error
        setIsLoading(false);
      }
    };
    
    preloadCriticalImages();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          {/* Scheduler removido do público - unlock é feito no render via DevflixContext */}
          
          {isLoading ? (
            <Loading />
          ) : (
            <Routes>
              {/* Root route - redirects to error standalone page */}
              <Route path="/" element={<ErrorPageStandalone message="Selecione uma DevFlix específica" code="404" />} />
              
              {/* Dynamic error route handler */}
              <Route path="/error" element={<ErrorRouteHandler />} />
              
              {/* OAuth Callback Route */}
              <Route path="/callback" element={
                <Suspense fallback={<Loading />}>
                  <OAuthCallback />
                </Suspense>
              } />
              
              {/* Protected Admin Routes */}
              <Route element={
                <Suspense fallback={<Loading />}>
                  <ProtectedRoute />
                </Suspense>
              }>
                <Route path="/admin/dev" element={
                  <Suspense fallback={<Loading />}>
                    <AdminLayout />
                  </Suspense>
                }>
                  <Route index element={
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <AdminHome />
                    </Suspense>
                  } />
                  <Route path="materials" element={
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <AdminMaterials />
                    </Suspense>
                  } />
                  <Route path="images" element={
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <AdminImages />
                    </Suspense>
                  } />
                  <Route path="header" element={
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <AdminHeaderSettings />
                    </Suspense>
                  } />
                  <Route path="header-buttons" element={
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <AdminHeaderButtons />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <AdminSettings />
                    </Suspense>
                  } />
                  <Route path="initial-banner" element={
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <AdminInitialBanner />
                    </Suspense>
                  } />
                  <Route path="banner-preview" element={
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <BannerPreview />
                    </Suspense>
                  } />
                  <Route path="schedule" element={
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <AdminSchedule />
                    </Suspense>
                  } />
                  <Route path="cronograma" element={
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <AdminCronograma />
                    </Suspense>
                  } />
                  <Route path="about-course" element={
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <AdminAboutCourse />
                    </Suspense>
                  } />
                  <Route path="texts" element={
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <AdminTexts />
                    </Suspense>
                  } />
                  <Route path="polls" element={
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <AdminPolls />
                    </Suspense>
                  } />
                </Route>
              </Route>
              
              {/* DevFlix Routes */}
              <Route path="/:path" element={
                <DevflixProvider>
                  <CountdownBanner />
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <Home />
                    </Suspense>
                  </main>
                  <Footer />
                </DevflixProvider>
              } />
              
              {/* Materials routes */}
              <Route path="/:path/materiais" element={
                <DevflixProvider>
                  <CountdownBanner />
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <Materiais />
                    </Suspense>
                  </main>
                  <Footer />
                </DevflixProvider>
              } />

              {/* Schedule routes */}
              <Route path="/:path/cronograma" element={
                <DevflixProvider>
                  <CountdownBanner />
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <Cronograma />
                    </Suspense>
                  </main>
                  <Footer />
                </DevflixProvider>
              } />

              {/* Aquecimento routes */}
              <Route path="/:path/aquecimento" element={
                <DevflixProvider>
                  <CountdownBanner />
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<div className="h-screen bg-netflix-black flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-netflix-red rounded-full"></div>
                    </div>}>
                      <Aquecimento />
                    </Suspense>
                  </main>
                  <Footer />
                </DevflixProvider>
              } />
              
              {/* Class routes */}
              <Route path="/:path/aula/:id" element={
                <DevflixProvider>
                  <CountdownBanner />
                  <Navbar />
                  <AulaPage match={{ params: { id: window.location.pathname.split('/').pop() } }} />
                  <Footer />
                </DevflixProvider>
              } />
              
              {/* Catch-all route for not found pages */}
              <Route path="*" element={<ErrorPageStandalone message="Página não encontrada" code="404" />} />
            </Routes>
          )}
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
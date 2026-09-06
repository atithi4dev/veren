import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { authApi } from './api';
import AppNavbar from './components/AppNavbar';
import DashboardPage from './pages/DashboardPage';
import SignupPage from './pages/SignupPage';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import HomePage from './pages/HomePage';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'
const PROFILE_CACHE_KEY = 'veren-profile-cache'

const hasCachedProfile = (): boolean => {
  try {
    const rawProfile = window.localStorage.getItem(PROFILE_CACHE_KEY)
    if (!rawProfile) {
      return false
    }

    const parsedProfile = JSON.parse(rawProfile) as { userName?: string; email?: string }
    return Boolean(parsedProfile?.userName || parsedProfile?.email)
  } catch {
    window.localStorage.removeItem(PROFILE_CACHE_KEY)
    return false
  }
}

const useAuthStatus = () => {
  const [status, setStatus] = React.useState<AuthStatus>(() => (hasCachedProfile() ? 'authenticated' : 'checking'))

  React.useEffect(() => {
    if (status === 'authenticated') {
      return
    }

    let isMounted = true

    const checkAuth = async () => {
      try {
        const response = await authApi.me()
        const payload = response.data?.data ?? response.data
        const nextProfile = {
          userName: payload?.userName,
          email: payload?.email,
        }

        window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(nextProfile))

        if (isMounted) {
          setStatus('authenticated')
        }
      } catch {
        window.localStorage.removeItem(PROFILE_CACHE_KEY)
        if (isMounted) {
          setStatus('unauthenticated')
        }
      }
    }

    void checkAuth()

    return () => {
      isMounted = false
    }
  }, [status])

  return status
}

const AuthRedirect: React.FC = () => {
  const status = useAuthStatus()

  if (status === 'checking') {
    return null
  }

  return status === 'authenticated'
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/signup" replace />
}

const ProtectedDashboardRoute: React.FC = () => {
  const status = useAuthStatus()

  if (status === 'checking') {
    return null
  }

  return status === 'authenticated'
    ? <DashboardPage />
    : <Navigate to="/signup" replace />
}

const SignupRoute: React.FC = () => {
  const status = useAuthStatus()

  if (status === 'checking') {
    return null
  }

  return status === 'authenticated'
    ? <Navigate to="/dashboard" replace />
    : <SignupPage />
}

const NotFound: React.FC = () => {
  return (
    <div className="tw-flex tw-min-h-[50vh] tw-items-center tw-justify-center">
      <h1 className="tw-text-lg tw-text-slate-300">Page Not Found</h1>
    </div>
  )
}

const AppContent: React.FC = () => {
  const { resolvedTheme } = useTheme()
  const location = useLocation()
  const isDashboardRoute = location.pathname.startsWith('/dashboard')
  const isSignupRoute = location.pathname === '/signup'

  return (
    <div className={resolvedTheme === 'dark' ? 'tw-min-h-screen tw-bg-md-neutral-10 tw-text-md-neutral-95' : 'tw-min-h-screen tw-bg-md-neutral-99 tw-text-md-neutral-10'}>
      {!isDashboardRoute && !isSignupRoute && <AppNavbar />}
      <main className={isDashboardRoute || isSignupRoute ? '' : 'tw-pt-16'}>
        <Routes>
          <Route path="/" element={<AuthRedirect />} />
          <Route path="/signup" element={<SignupRoute />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<ProtectedDashboardRoute />} />
          <Route path="/dashboard/~deployments" element={<ProtectedDashboardRoute />} />
          <Route path="/dashboard/~deployments/:deploymentId" element={<ProtectedDashboardRoute />} />
          <Route path="/dashboard/:projectName" element={<ProtectedDashboardRoute />} />
          <Route path="/dashboard/:projectName/deployments" element={<ProtectedDashboardRoute />} />
          <Route path="/dashboard/:projectName/deployments/:deploymentId" element={<ProtectedDashboardRoute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App;

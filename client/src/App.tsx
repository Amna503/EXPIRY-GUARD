import { Route, Routes } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import LandingPage from '@/pages/landing/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import OnboardingPage from '@/pages/onboarding/OnboardingPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import PlaceholderPage from '@/pages/PlaceholderPage'
import NotFoundPage from '@/pages/NotFoundPage'

const pages = [
  ['products', 'Products'],
  ['batches', 'Batches'],
  ['receive', 'Receive Stock'],
  ['scanner', 'Barcode Scanner'],
  ['expiry', 'Expiry Monitor'],
  ['insights', 'AI Insights'],
  ['analytics', 'Analytics'],
  ['branches', 'Branches'],
  ['team', 'Team & Roles'],
  ['settings', 'Settings'],
]

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {pages.map(([path, title]) => (
          <Route key={path} path={`/${path}`} element={<PlaceholderPage title={title} />} />
        ))}
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

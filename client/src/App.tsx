import { Route, Routes } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import LandingPage from '@/pages/landing/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import OnboardingPage from '@/pages/onboarding/OnboardingPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ProductsPage from '@/pages/products/ProductsPage'
import BatchesPage from '@/pages/batches/BatchesPage'
import ScannerPage from '@/pages/scanner/ScannerPage'
import ReceivePage from '@/pages/receive/ReceivePage'
import ExpiryMonitorPage from '@/pages/expiry/ExpiryMonitorPage'
import InsightsPage from '@/pages/insights/InsightsPage'
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'
import BranchesPage from '@/pages/branches/BranchesPage'
import TeamPage from '@/pages/team/TeamPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/batches" element={<BatchesPage />} />
        <Route path="/receive" element={<ReceivePage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/expiry" element={<ExpiryMonitorPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

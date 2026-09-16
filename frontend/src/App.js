import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import AdminDeposits from './AdminDeposits';
import AdminWithdrawals from './AdminWithdrawals';
import AdminPinManagement from './AdminPinManagement';
import AdminKYC from './AdminKYC';
import AdminSettings from './AdminSettings';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Swap from './Swap';
import TransactionHistory from './TransactionHistory';
import ProfileSettings from './ProfileSettings';
import AdminLogin from './AdminLogin';
import UserLayout from './UserLayout';
import LandingPage from './LandingPage';
import Referral from './Referral';
import { ThemeProvider, useTheme } from './ThemeContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin-login" />;
  }
  return children;
};

// Inner App component that uses theme
const AppRoutes = () => {
  const { theme } = useTheme();

  return (
    <Router>
      <div key={theme}>
        <Routes>
          {/* Landing Page - Default route */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* User Routes with Hamburger Menu */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <Dashboard />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposit"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <Deposit />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <Withdraw />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/swap"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <Swap />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <TransactionHistory />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <ProfileSettings />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/referral"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <Referral />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/deposits"
            element={
              <AdminRoute>
                <AdminDeposits />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/withdrawals"
            element={
              <AdminRoute>
                <AdminWithdrawals />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pins"
            element={
              <AdminRoute>
                <AdminPinManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/kyc"
            element={
              <AdminRoute>
                <AdminKYC />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
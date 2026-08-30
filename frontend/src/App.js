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
import TransactionHistory from './TransactionHistory';
import ProfileSettings from './ProfileSettings';
import AdminLogin from './AdminLogin';
import UserLayout from './UserLayout';
import LandingPage from './LandingPage';
import MaintenanceWrapper from './MaintenanceWrapper';
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

function App() {
  return (
    <Router>
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
              <MaintenanceWrapper>
                <UserLayout>
                  <Dashboard />
                </UserLayout>
              </MaintenanceWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/deposit"
          element={
            <ProtectedRoute>
              <MaintenanceWrapper>
                <UserLayout>
                  <Deposit />
                </UserLayout>
              </MaintenanceWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdraw"
          element={
            <ProtectedRoute>
              <MaintenanceWrapper>
                <UserLayout>
                  <Withdraw />
                </UserLayout>
              </MaintenanceWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <MaintenanceWrapper>
                <UserLayout>
                  <TransactionHistory />
                </UserLayout>
              </MaintenanceWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MaintenanceWrapper>
                <UserLayout>
                  <ProfileSettings />
                </UserLayout>
              </MaintenanceWrapper>
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes (no maintenance wrapper - admins can still access) */}
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
    </Router>
  );
}

export default App;
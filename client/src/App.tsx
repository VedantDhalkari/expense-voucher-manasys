import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { useAuth } from './contexts/AuthContext';

import { Dashboard } from './pages/Dashboard';
import { VouchersList } from './pages/VouchersList';
import { VoucherForm } from './pages/VoucherForm';
import { VoucherDetails } from './pages/VoucherDetails';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<Navigate to={user ? `/${user.role.toLowerCase()}` : '/login'} replace />} />

      {/* Employee Routes */}
      <Route path="/employee" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="vouchers" element={<VouchersList />} />
        <Route path="vouchers/new" element={<VoucherForm />} />
        <Route path="vouchers/:id/edit" element={<VoucherForm />} />
        <Route path="vouchers/:id" element={<VoucherDetails />} />
      </Route>

      {/* Director Routes */}
      <Route path="/director" element={<ProtectedRoute allowedRoles={['DIRECTOR']}><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="pending-approvals" element={<VouchersList />} />
        <Route path="vouchers" element={<VouchersList />} />
        <Route path="vouchers/:id" element={<VoucherDetails />} />
      </Route>

      {/* Accounts Routes */}
      <Route path="/accounts" element={<ProtectedRoute allowedRoles={['ACCOUNTS']}><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="vouchers" element={<VouchersList />} />
        <Route path="vouchers/:id" element={<VoucherDetails />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

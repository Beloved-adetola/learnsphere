
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import CandidateDashboard from '@/components/candidate/CandidateDashboard';

const CandidateDashboardPage: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="quiz-container py-8">
      <CandidateDashboard />
    </div>
  );
};

export default CandidateDashboardPage;
